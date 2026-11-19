"""Avaliação exploratória via HTTP; não calibra ou ativa o scanner do produto."""
import argparse,json,time
from pathlib import Path
import httpx
from PIL import Image
if __package__:
    from tools.damage_provenance import verify_sha256, verify_experiment_response
else:
    from damage_provenance import verify_sha256, verify_experiment_response
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
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument("--experiment-root",type=Path,required=True);parser.add_argument("--image-size",type=int,choices=[416,640],default=416);parser.add_argument("--report",type=Path);args=parser.parse_args()
    experiment=args.experiment_root;root=Path(__file__).resolve().parent.parent.parent
    report = args.report or experiment/("http-evaluation-"+str(args.image_size)+".json")
    if not report.resolve().is_relative_to(experiment.resolve()):
        parser.error("Relatorio deve ficar dentro da pasta do experimento")
    # Reserve a unique report before any HTTP calls or copied images.
    with report.open("x", encoding="utf8") as stream:
        json.dump({"experimental": True, "status": "starting"}, stream)
    manifest=json.loads((root/"docs/damage-training-manifest.json").read_text(encoding="utf8"))
    entries=[e for e in manifest["entries"] if e["split"]=="val"]
    results=json.loads((experiment/"results.json").read_text(encoding="utf8"))
    models=[r for r in results["experiments"] if r["status"]=="completed"]
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
            verify_sha256(source, entry["sha256"], "imagem do manifesto")
            if entry["source"].startswith("docs/"):
                # Cópia de experimento, sem alterar as fotografias originais.
                name="validation-"+source.name
                copy = experiment/"synthetic"/name
                if copy.exists():
                    verify_sha256(copy, entry["sha256"], "copia de validacao")
                else:
                    with copy.open("xb") as stream:
                        stream.write(source.read_bytes())
                image_url="/synthetic/"+name
            else:image_url="/"+entry["source"].split("frontend/public/",1)[1]
            response=client.post("/api/experiments/damage",json={"car_id":"sc-004","image_url":image_url,"experiment":model["name"],"confidence":0.001,"image_size":args.image_size})
            response.raise_for_status();data=response.json()
            verify_experiment_response(data, entry, model, args.image_size)
            width,height=Image.open(source).size
            truth=[[x1*width,y1*height,x2*width,y2*height] for x1,y1,x2,y2 in entry["boxes"]]
            row={"experiment":model["name"],"source":entry["source"],"image_sha256":data["image_sha256"],"truth_boxes":truth,"raw_predictions":data["raw_predictions"]}
            records.append(row);group.append(row)
        for threshold in [0.25,0.5,0.8,0.95]:
            rows=[counts(row["raw_predictions"],row["truth_boxes"],threshold) for row in group]
            tp,fp,fn=[sum(row[i] for row in rows) for i in range(3)]
            totals.append({"experiment":model["name"],"confidence_threshold":threshold,"iou":0.5,"tp":tp,"fp":fp,"fn":fn,
                "precision":tp/(tp+fp) if tp+fp else None,"recall":tp/(tp+fn) if tp+fn else None})
        print(json.dumps({"model":model["name"],"images":len(group),"completed":True}),flush=True)
    report.write_text(json.dumps({"experimental":True,"image_size":args.image_size,"annotation_review":"provisional","independent_test_set":False,"raw":records,"thresholds":totals},indent=2),encoding="utf8")
if __name__=="__main__":main()
