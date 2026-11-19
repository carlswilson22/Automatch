import hashlib,json,unittest
from pathlib import Path
from pericial_timeline import TIMELINE,CHECKPOINTS
class PericialTimelineTests(unittest.TestCase):
 def test_single_timeline_and_generated_consumers(self):
  root=Path(__file__).resolve().parent.parent
  source=root/"shared/pericial-timeline.json"
  config=json.loads(source.read_text(encoding="utf8"))
  self.assertEqual(TIMELINE,config)
  self.assertEqual([(p["start"],p["end"]) for p in CHECKPOINTS],[(0,5),(5,15),(15,20)])
  digest=hashlib.sha256(source.read_bytes()).hexdigest()
  self.assertIn(digest,(root/"frontend/src/data/pericialTimeline.generated.js").read_text(encoding="utf8"))
 def test_each_generated_video_has_correct_source_and_duration(self):
  root=Path(__file__).resolve().parent.parent
  folder=root/"frontend/public/videos/pericial"
  for n in range(1,5):
   car="sc-00"+str(n);manifest=json.loads((folder/(car+"-pericial.json")).read_text(encoding="utf8"))
   self.assertAlmostEqual(manifest["duration"],20,places=4)
   self.assertEqual([(s["start"],s["end"],s["angle"]) for s in manifest["shots"]],[(0,5,0),(5,10,90),(10,15,270),(15,20,180)])
   for shot in manifest["shots"]:
    self.assertIn("/"+car+"/",shot["image"])
    image=root/"frontend/public"/shot["image"].lstrip("/")
    self.assertEqual(hashlib.sha256(image.read_bytes()).hexdigest(),shot["image_sha256"])
   self.assertEqual(hashlib.sha256((folder/(car+"-pericial.mp4")).read_bytes()).hexdigest(),manifest["video_sha256"])
