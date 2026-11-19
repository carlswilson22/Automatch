import hashlib,json,tempfile,unittest
from pathlib import Path
from tools.train_damage_experiment import prepare_dataset
from tools.evaluate_damage_models_http import counts
from tools.damage_provenance import verify_sha256, verify_experiment_response
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

 def test_dataset_refuses_reuse_without_touching_original(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);(root/"image.jpg").write_bytes(b"fixture")
   entry={"source":"image.jpg","origin":"project","group":"car","split":"train","boxes":[[.1,.1,.8,.8]],"sha256":hashlib.sha256(b"fixture").hexdigest()}
   manifest={"classes":["avaria"],"entries":[entry]};output=root/"out"
   prepare_dataset(manifest,root,root,output)
   label=output/"dataset/labels/train/000.txt";original=label.read_bytes()
   with self.assertRaisesRegex(ValueError,"ja existe"):prepare_dataset(manifest,root,root,output)
   self.assertEqual(label.read_bytes(),original)

 def test_invalid_origin_and_group_rejected_before_creating_dataset(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);(root/"image.jpg").write_bytes(b"fixture")
   entry={"source":"image.jpg","origin":"typo","group":"car","split":"train","boxes":[],"sha256":hashlib.sha256(b"fixture").hexdigest()}
   manifest={"classes":["avaria"],"entries":[entry]};output=root/"out"
   with self.assertRaisesRegex(ValueError,"Origem"):prepare_dataset(manifest,root,root,output)
   entry["origin"]="project";entry["group"]=" "
   with self.assertRaisesRegex(ValueError,"Grupo"):prepare_dataset(manifest,root,root,output)
   self.assertFalse(output.exists())

 def test_weight_and_image_hashes_detect_changed_data(self):
  with tempfile.TemporaryDirectory() as directory:
   path=Path(directory)/"checkpoint.pt";path.write_bytes(b"weights")
   digest=hashlib.sha256(b"weights").hexdigest()
   self.assertEqual(verify_sha256(path,digest,"checkpoint"),digest)
   path.write_bytes(b"other weights")
   with self.assertRaisesRegex(ValueError,"divergente"):verify_sha256(path,digest,"checkpoint")
   with self.assertRaisesRegex(ValueError,"invalido"):verify_sha256(path,"short","checkpoint")

 def test_experiment_response_checks_model_resolution_image_and_weights(self):
  entry={"sha256":"a"*64};model={"name":"sample","weight_sha256":"b"*64}
  response={"experimental":True,"validated":False,"experiment":"sample","image_size":640,"image_sha256":"a"*64,"weight_sha256":"b"*64}
  verify_experiment_response(response,entry,model,640)
  for key,value in (("image_sha256","c"*64),("weight_sha256","c"*64),("image_size",416),("experiment","other"),("validated",True)):
   with self.subTest(key=key):
    with self.assertRaises(ValueError):verify_experiment_response({**response,key:value},entry,model,640)
