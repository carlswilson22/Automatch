"""Avaliação exploratória via HTTP; não calibra ou ativa o scanner do produto."""
import argparse,json,time
from pathlib import Path
import httpx
from PIL import Image
def iou(a,b):
    overlap=max(0,min(a[2],b[2])-max(a[0],b[0]))*max(0,min(a[3],b[3])-max(a[1],b[1]))
    union=(a[2]-a[0])*(a[3]-a[1])+(b[2]-b[0])*(b[3]-b[1])-overlap
    return overlap/union if union>0 else 0
def counts(predictions,truth,threshold):
    matched=set();tp=fp=0
    for prediction in sorted(predictions,key=lambda p:p["confidence"],reverse=True):
        if prediction["confidence"]<threshold:continue
        candidates=[(iou(prediction["xyxy"],box),i) for i,box in enumerate(truth) if i not in matched]
        score,index=max(candidates,default=(0,-1))
        if score>=0.5:tp+=1;matched.add(index)
        else:fp+=1
    return tp,fp,len(truth)-len(matched)
def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument("--experiment-root",type=Path,required=True);parser.add_argument("--image-size",type=int,choices=[416,640],default=416);args=parser.parse_args()
    experiment=args.experiment_root;root=Path(__file__).resolve().parent.parent.parent
    manifest=json.loads((root/"docs/damage-training-manifest.json").read_text(encoding="utf8"))
    entries=[e for e in manifest["entries"] if e["split"]=="val"]
    results=json.loads((experiment/"results.json").read_text(encoding="utf8"))
    models=[r["name"] for r in results["experiments"] if r["status"]=="completed"]
    client=httpx.Client(base_url="http://127.0.0.1:8099",timeout=180)
    for _ in range(50):
        try:
            status=client.get("/api/experiments/status")
            if status.status_code==200:
                assert status.json()=={"experimental":True,"database":"automatch_audit_20261118_35737885"}
                break
        except httpx.RequestError:pass
        time.sleep(1)
    else:raise RuntimeError("Servidor experimental indisponível")
    records=[];totals=[]
    for model in models:
        group=[]
        for index,entry in enumerate(entries):
            source=root/entry["source"]
            if entry["source"].startswith("docs/"):
                # Cópia de experimento, sem alterar as fotografias originais.
                import shutil
                name="validation-"+source.name;shutil.copy2(source,experiment/"synthetic"/name)
                image_url="/synthetic/"+name
            else:image_url="/"+entry["source"].split("frontend/public/",1)[1]
            response=client.post("/api/experiments/damage",json={"car_id":"sc-004","image_url":image_url,"experiment":model,"confidence":0.001,"image_size":args.image_size})
            response.raise_for_status();data=response.json()
            width,height=Image.open(source).size
            truth=[[x1*width,y1*height,x2*width,y2*height] for x1,y1,x2,y2 in entry["boxes"]]
            row={"experiment":model,"source":entry["source"],"image_sha256":data["image_sha256"],"truth_boxes":truth,"raw_predictions":data["raw_predictions"]}
            records.append(row);group.append(row)
        for threshold in [0.25,0.5,0.8,0.95]:
            rows=[counts(row["raw_predictions"],row["truth_boxes"],threshold) for row in group]
            tp,fp,fn=[sum(row[i] for row in rows) for i in range(3)]
            totals.append({"experiment":model,"confidence_threshold":threshold,"iou":0.5,"tp":tp,"fp":fp,"fn":fn,
                "precision":tp/(tp+fp) if tp+fp else None,"recall":tp/(tp+fn) if tp+fn else None})
        print(json.dumps({"model":model,"images":len(group),"completed":True}),flush=True)
        (experiment/("http-evaluation-"+str(args.image_size)+".json")).write_text(json.dumps({"experimental":True,"image_size":args.image_size,"annotation_review":"provisional","independent_test_set":False,"raw":records,"thresholds":totals},indent=2),encoding="utf8")
if __name__=="__main__":main()
