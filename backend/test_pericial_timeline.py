import hashlib, json, unittest
from pathlib import Path
from pericial_timeline import TIMELINE, CHECKPOINTS

def _find_root():
    candidate = Path(__file__).resolve().parent.parent
    if (candidate / "shared/pericial-timeline.json").exists():
        return candidate
    for p in [Path(".."), Path("."), Path("/app/..")]:
        resolved = p.resolve()
        if (resolved / "shared/pericial-timeline.json").exists():
            return resolved
    return candidate

class PericialTimelineTests(unittest.TestCase):
    def test_single_timeline_and_generated_consumers(self):
        root = _find_root()
        source = root / "shared/pericial-timeline.json"
        if not source.exists():
            self.skipTest("shared/pericial-timeline.json não disponível neste ambiente")
        config = json.loads(source.read_text(encoding="utf8"))
        self.assertEqual(TIMELINE, config)
        self.assertEqual([(p["start"], p["end"]) for p in CHECKPOINTS], [(0, 5), (5, 15), (15, 20)])
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        gen_path = root / "frontend/src/data/pericialTimeline.generated.js"
        if gen_path.exists():
            self.assertIn(digest, gen_path.read_text(encoding="utf8"))

    def test_each_generated_video_has_correct_source_and_duration(self):
        root = _find_root()
        folder = root / "frontend/public/videos/pericial"
        if not folder.exists():
            self.skipTest("Vídeos periciais não disponíveis neste ambiente")
        for n in range(1, 5):
            car = "sc-00" + str(n)
            manifest_file = folder / (car + "-pericial.json")
            if not manifest_file.exists():
                self.skipTest(f"Manifesto {manifest_file} não disponível neste ambiente")
            manifest = json.loads(manifest_file.read_text(encoding="utf8"))
            self.assertAlmostEqual(manifest["duration"], 20, places=4)
            self.assertEqual([(s["start"], s["end"], s["angle"]) for s in manifest["shots"]], [(0, 5, 0), (5, 10, 90), (10, 15, 270), (15, 20, 180)])
            for shot in manifest["shots"]:
                self.assertIn("/" + car + "/", shot["image"])
                image = root / "frontend/public" / shot["image"].lstrip("/")
                if image.exists():
                    self.assertEqual(hashlib.sha256(image.read_bytes()).hexdigest(), shot["image_sha256"])
            video_file = folder / (car + "-pericial.mp4")
            if video_file.exists():
                self.assertEqual(hashlib.sha256(video_file.read_bytes()).hexdigest(), manifest["video_sha256"])
