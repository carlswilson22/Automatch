from pathlib import Path
import argparse, hashlib, json
ROOT=Path(__file__).resolve().parent.parent
def outputs():
 source=ROOT/"shared/pericial-timeline.json"
 data=source.read_bytes().replace(b"\r\n", b"\n")
 config=json.loads(data)
 digest=hashlib.sha256(data).hexdigest()
 payload=json.dumps(config,ensure_ascii=False,indent=2)
 return {
 ROOT/"frontend/src/data/pericialTimeline.generated.js":"// Gerado por scripts/sync_pericial_timeline.py; SHA256 "+digest+"\nexport const pericialTimeline = "+payload+";\nexport const VIDEO_DURATION = pericialTimeline.duration;\nexport const VIDEO_SUMMARY = pericialTimeline.summary;\nexport const CHECKPOINTS = pericialTimeline.checkpoints;\n",
 ROOT/"backend/pericial_timeline.py":'# Gerado por scripts/sync_pericial_timeline.py; SHA256 '+digest+'\nimport json\nTIMELINE = json.loads('+repr(payload)+')\nVIDEO_DURATION = TIMELINE["duration"]\nVIDEO_SUMMARY = TIMELINE["summary"]\nCHECKPOINTS = TIMELINE["checkpoints"]\n'
 }
def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument("--check",action="store_true");args=parser.parse_args()
 for path,content in outputs().items():
  if args.check:
   if not path.is_file() or path.read_text(encoding="utf8").replace("\r\n", "\n")!=content.replace("\r\n", "\n"):raise SystemExit("Consumidor divergente: "+str(path))
  else:
   path.parent.mkdir(parents=True,exist_ok=True);path.write_text(content,encoding="utf8",newline="\n")
if __name__=="__main__":main()
