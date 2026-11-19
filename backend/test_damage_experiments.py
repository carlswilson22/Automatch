import hashlib,json,tempfile,unittest
from pathlib import Path
from tools.train_damage_experiment import prepare_dataset
from tools.evaluate_damage_models_http import counts
class DamageExperimentTests(unittest.TestCase):
 def test_matching_prevents_duplicate_true_positive(self):
  truth=[[0,0,10,10]]
  predictions=[{"confidence":.9,"xyxy":[0,0,10,10]},{"confidence":.8,"xyxy":[0,0,10,10]},{"confidence":.7,"xyxy":[20,20,30,30]}]
  self.assertEqual(counts(predictions,truth,.5),(1,2,0))
  self.assertEqual(counts(predictions,truth,.95),(0,0,1))
 def test_dataset_rejects_cross_split_leakage_and_paths(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);source=root/"image.jpg";source.write_bytes(b"fixture")
   entry={"source":"image.jpg","origin":"project","group":"same-car","split":"train","boxes":[[.1,.1,.8,.8]],"sha256":hashlib.sha256(source.read_bytes()).hexdigest()}
   manifest={"classes":["avaria"],"entries":[entry,{**entry,"split":"val"}]}
   with self.assertRaisesRegex(ValueError,"Vazamento"):prepare_dataset(manifest,root,root,root/"out")
   manifest["entries"]=[{**entry,"source":"../other.jpg"}]
   with self.assertRaisesRegex(ValueError,"fora"):prepare_dataset(manifest,root,root,root/"out")
 def test_dataset_provenance_and_labels_are_checked(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);(root/"image.jpg").write_bytes(b"fixture")
   entry={"source":"image.jpg","origin":"project","group":"car","split":"train","boxes":[[.1,.1,.8,.8]],"sha256":"wrong"}
   with self.assertRaisesRegex(ValueError,"modificada"):prepare_dataset({"classes":["avaria"],"entries":[entry]},root,root,root/"out")
