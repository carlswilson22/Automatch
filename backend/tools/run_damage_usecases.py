"""Casos por HTTP contra servidor local; escreve somente na cópia protegida."""
from pathlib import Path
import json,secrets,time,io
import httpx
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parent.parent.parent
def main():
 import argparse
 p=argparse.ArgumentParser(description=__doc__);p.add_argument("--output",type=Path,required=True);args=p.parse_args()
 out=args.output;out.mkdir(parents=True,exist_ok=True)
 client=httpx.Client(base_url="http://127.0.0.1:8099",timeout=180)
 cases=[]
 def record(name,response,expected):
  row={"case":name,"status":response.status_code,"expected":expected,"passed":response.status_code==expected}
  cases.append(row)
  (out/"http-usecase-results.json").write_text(json.dumps(cases,indent=2),encoding="utf8")
  assert row["passed"],name+": "+response.text[:300]
  return response
 for _ in range(50):
  try:
   if client.get("/api/cars?limit=1").status_code==200:break
  except httpx.RequestError:pass
  time.sleep(1)
 else:raise RuntimeError("API não ficou disponível")
 status=client.get("/api/experiments/status");status.raise_for_status()
 assert status.json()=={"experimental":True,"database":"automatch_audit_20261118_35737885"}, "Servidor não é a cópia autorizada"
 suffix=secrets.token_hex(4);email="teste-"+suffix+"@example.invalid";password=secrets.token_urlsafe(16)
 record("anuncio sem autenticacao",client.post("/api/cars",json={"brand":"Toyota","model":"[TESTE] Sem acesso","year":2024,"km":0,"price":100000}),401)
 user=record("cadastro lojista",client.post("/api/register",json={"name":"[TESTE] HTTP "+suffix,"email":email,"password":password,"role":"lojista","store_name":"[TESTE] Loja HTTP "+suffix}),200).json()
 record("senha incorreta",client.post("/api/login",json={"email":email,"password":"incorreta"}),401)
 login=record("login",client.post("/api/login",json={"email":email,"password":password}),200).json()
 headers={"Authorization":"Bearer "+login["token"]}
 payload={"brand":"Chevrolet","model":"[TESTE] Fluxo scanner "+suffix,"year":2024,"km":8500,"price":152000,"image":"/images/FotoChevroletTracker.jpg"}
 car=record("criar anuncio",client.post("/api/cars",json=payload,headers=headers),200).json();car_id=car["id"]
 record("preco invalido",client.post("/api/cars",json={**payload,"price":-1},headers=headers),422)
 record("consultar anuncio persistido",client.get("/api/cars/"+car_id),200)
 raw=(ROOT/"frontend/public/images/FotoChevroletTracker.jpg").read_bytes()
 upload=record("foto anexada nao aprova laudo",client.post("/api/v1/laudos/upload",files={"file":("teste.jpg",raw,"image/jpeg")},data={"car_id":car_id},headers=headers),200).json()
 assert upload["visual_inspection"]["analysis_state"]=="inconclusive" and upload["ia_feedback"] is None
 stored=client.get("/api/cars/"+car_id).json()
 assert stored.get("laudo_status") not in ["SEM_RESSALVAS","Aprovado"]
 assert json.loads(stored["laudo_feedback"])["visual_inspection"]["image_sha256"]
 record("imagem invalida",client.post("/api/analise-visual",json={"imageBase64":"bm90IGFuIGltYWdl"}),422)
 scan=record("scanner Tracker com contexto legado",client.post("/api/analise-visual",json={"imageUrl":"/images/FotoChevroletTracker.jpg","car_context":{"id":car_id,"damages":["RISCO INVENTADO"]}}),200).json()
 assert scan["pontos_avaria"]==[] and scan["score_lataria"] is None
 chat=record("consultor usa resultado inconclusivo",client.post("/api/chat",json={"mensagem":"Há avarias?","car_context":{"id":car_id,"visual_inspection":scan,"damagePoints":[{"desc":"RISCO INVENTADO"}]}}),200).json()
 assert "inconclusiva" in chat["resposta"] and "RISCO INVENTADO" not in chat["resposta"]
 pdf=record("PDF com estado persistido",client.get("/api/v1/laudos/"+car_id+"/pdf"),200)
 text="\n".join(page.extract_text() for page in PdfReader(io.BytesIO(pdf.content)).pages)
 assert "inconclusiva" in text and "RISCO INVENTADO" not in text
 (out/"dossie-http.pdf").write_bytes(pdf.content)
 video=(ROOT/"frontend/public/videos/pericial/sc-004-pericial.mp4").read_bytes()
 uploaded=record("upload video real de 20s",client.post("/api/v1/pericia/video/upload",files={"file":("teste-20s.mp4",video,"video/mp4")},headers=headers),200).json()
 assert [s["tempo"] for s in uploaded["checklist_inspecao"]]==["0s - 5s","5s - 15s","15s - 20s"]
 # Compara respostas experimentais reais do modelo treinado para originais e sintéticas.
 predictions=[]
 for source in ["/images/FotoChevroletTracker.jpg","/images/FotoHyundaiHB20.jpg","/synthetic/dent.png","/synthetic/scratch.png","/synthetic/bumper.png"]:
  response=record("modelo treinado: "+source,client.post("/api/experiments/damage",json={"car_id":"sc-004","image_url":source,"confidence":0.25}),200)
  body=response.json();assert body["experimental"] and not body["validated"]
  predictions.append({"source":source,**body})
 record("anuncio desconhecido",client.post("/api/experiments/damage",json={"car_id":"[TESTE] inexistente"}),404)
 record("caminho de imagem fora da raiz",client.post("/api/experiments/damage",json={"car_id":"sc-004","image_url":"/../../etc/passwd"}),422)
 (out/"http-trained-predictions.json").write_text(json.dumps(predictions,indent=2),encoding="utf8")
 (out/"http-created-records.json").write_text(json.dumps({"database":"automatch_audit_20261118_35737885","user_id":user["id"],"car_id":car_id,"store_id":user.get("store_id"),"prefix":"[TESTE]","cleanup":"Banco cópia será removido conforme autorização; nada escrito na origem."},indent=2),encoding="utf8")
 print(json.dumps({"cases":len(cases),"passed":sum(c["passed"] for c in cases),"database":"copy","experimental_model":predictions[0]["experiment"]}))
if __name__=="__main__":main()
