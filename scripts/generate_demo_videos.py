"""Regenera os vídeos de demonstração a partir do ID e do cronograma canônico."""
import argparse, hashlib, json, shutil, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
def run(args):
    subprocess.run(args,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--evidence",type=Path,required=True)
    args=parser.parse_args()
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        parser.error("ffmpeg e ffprobe locais são obrigatórios; não são instalados automaticamente")
    timeline_file=ROOT/"shared/pericial-timeline.json"
    config=json.loads(timeline_file.read_text(encoding="utf8"))
    mapping=json.loads((ROOT/"docs/pericial-angle-map.json").read_text(encoding="utf8"))
    destination=ROOT/"frontend/public/videos/pericial"
    work=args.evidence/"regenerated-videos";work.mkdir(parents=True,exist_ok=True)
    reports=[]
    for car in mapping["vehicles"]:
        if not car["valid"]:
            reports.append({"car_id":car["id"],"status":"unavailable","reason":car["reason"]});continue
        car_id=car["id"];output=destination/(car_id+"-pericial.mp4")
        if output.exists():
            backup=work/(car_id+"-before.mp4")
            if not backup.exists():shutil.copy2(output,backup)
        shots=[]
        for index,stage in enumerate(config["shots"]):
            source=ROOT/"frontend/public"/car["views"][stage["view"]].lstrip("/")
            clip=work/(car_id+"-"+str(index)+".mp4")
            frames=round((stage["end"]-stage["start"])*config["fps"]) + (3 if index in (1,2) else 0)
            filters=f"scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,zoompan=z='1+0.00015*on':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d={frames}:s=1280x720:fps={config['fps']}"
            if index in (0,1,3): filters += ",fade=t=in:st=0:d=0.125"
            if index in (0,3): filters += ",fade=t=out:st=4.875:d=0.125"
            if index == 2: filters += ",fade=t=out:st=5:d=0.125"
            run(["ffmpeg","-y","-threads","1","-filter_threads","1","-loop","1","-i",str(source),"-vf",filters,"-frames:v",str(frames),"-an","-c:v","libx264","-threads","1","-preset","veryfast","-crf","26","-pix_fmt","yuv420p",str(clip)])
            shots.append({**stage,"image":car["views"][stage["view"]],"image_sha256":hashlib.sha256(source.read_bytes()).hexdigest()})
        lateral=work/(car_id+"-laterals.mp4")
        run(["ffmpeg","-y","-threads","1","-filter_complex_threads","1","-i",str(work/(car_id+"-1.mp4")),"-i",str(work/(car_id+"-2.mp4")),"-filter_complex","[0:v][1:v]xfade=transition=fade:duration=0.25:offset=4.875[v]","-map","[v]","-frames:v","240","-an","-c:v","libx264","-threads","1","-preset","veryfast","-crf","26","-pix_fmt","yuv420p",str(lateral)])
        concat=work/(car_id+"-concat.txt")
        concat.write_text("\n".join("file '"+path.as_posix()+"'" for path in [work/(car_id+"-0.mp4"),lateral,work/(car_id+"-3.mp4")]),encoding="utf8")
        run(["ffmpeg","-y","-f","concat","-safe","0","-i",str(concat),"-c","copy","-movflags","+faststart",str(output)])
        probe=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_format","-show_streams","-of","json",str(output)]))
        duration=float(probe["format"]["duration"])
        if abs(duration-config["duration"])>1/config["fps"]:raise ValueError("Duração divergente")
        manifest={"schema_version":1,"car_id":car_id,"timeline_sha256":hashlib.sha256(timeline_file.read_bytes()).hexdigest(),"duration":duration,"fps":config["fps"],"video_sha256":hashlib.sha256(output.read_bytes()).hexdigest(),"bytes":output.stat().st_size,"shots":shots,"transitions":"Fade through black at 5s/15s; lateral-only crossfade at 9.875-10.125s; no image crosses the front/laterals/rear boundaries."}
        output.with_suffix(".json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
        # Pranchas geradas fora do Git; sem afirmar conferência humana.
        for timestamp in [2.5,10,17.5,4.958333,5.041667,14.958333,15.041667]:
            run(["ffmpeg","-y","-ss",str(timestamp),"-i",str(output),"-frames:v","1",str(work/(car_id+"-"+str(timestamp)+".jpg"))])
        reports.append({"car_id":car_id,"status":"generated",**manifest})
        print(json.dumps({"car_id":car_id,"duration":duration,"bytes":manifest["bytes"]}),flush=True)
    (work/"results.json").write_text(json.dumps(reports,indent=2,ensure_ascii=False),encoding="utf8")
if __name__=="__main__":main()
