"""Servidor de experimento local. Nunca importar no main nem publicar."""
import os,sys
from pathlib import Path
sys.path.insert(0,"/experiment/compat")
sys.path.insert(0,"/project/backend")
from sqlalchemy.engine import make_url
if make_url(os.environ["DATABASE_URL"]).database != "automatch_audit_20261118_35737885":
    raise RuntimeError("Este experimento só pode usar a cópia de auditoria")
from main import app
from database import get_db
import models
from fastapi import Depends,HTTPException
from pydantic import BaseModel,Field
from typing import Literal
from sqlalchemy.orm import Session
import hashlib,json
from ultralytics import YOLO
import torch
torch.set_num_threads(1)
cache={}
@app.get("/api/experiments/status")
def experiment_status():
    return {"experimental": True, "database": make_url(os.environ["DATABASE_URL"]).database}

class Probe(BaseModel):
    car_id:str
    image_url:str|None=None
    experiment:str|None=None
    image_size:Literal[416,640]=416
    confidence:float=Field(default=0.25,ge=0.001,le=0.99)
@app.post("/api/experiments/damage")
def experimental_damage(payload:Probe,db:Session=Depends(get_db)):
    car=db.query(models.Car).filter(models.Car.id==payload.car_id).first()
    if not car:raise HTTPException(404,"Anúncio não encontrado")
    result=json.loads(Path("/experiment/results.json").read_text())
    candidates=[r for r in result["experiments"] if r["status"]=="completed"]
    chosen=next((r for r in candidates if r["name"]==payload.experiment),None) if payload.experiment else max(candidates,key=lambda r:r["metrics"]["fitness"])
    if not chosen:raise HTTPException(400,"Experimento não disponível")
    source=payload.image_url or car.image or ""
    if source.startswith("/synthetic/"):
        base=Path("/experiment/synthetic");image=(base/source.split("/synthetic/",1)[1]).resolve()
    else:
        base=Path("/project/frontend/public/images")
        image=(base/source.removeprefix("/images/")).resolve()
    if not image.is_relative_to(base) or not image.is_file():raise HTTPException(422,"Foto local inválida")
    if chosen["name"] not in cache:cache[chosen["name"]]=YOLO(chosen["weights"])
    output=cache[chosen["name"]].predict(str(image),conf=payload.confidence,verbose=False,device="cpu",imgsz=payload.image_size)
    boxes=[{"xyxy":box.xyxy[0].tolist(),"confidence":float(box.conf[0]),"class_id":int(box.cls[0])} for prediction in output for box in prediction.boxes]
    return {"experimental":True,"validated":False,"car_id":car.id,"image_sha256":hashlib.sha256(image.read_bytes()).hexdigest(),
        "image_size":payload.image_size,"experiment":chosen["name"],"weight_sha256":chosen["weight_sha256"],"raw_predictions":boxes,
        "notice":"Predições experimentais; não são laudo nem detecção validada de avarias."}
