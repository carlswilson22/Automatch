import unittest
from sqlalchemy import create_engine,text
from demo_media_repair import plan_repairs,apply_repairs,rollback_repairs
class DemoMediaRepairTests(unittest.TestCase):
 def test_exact_vehicle_guard_idempotence_and_rollback(self):
  engine=create_engine("sqlite://")
  with engine.begin() as c:
   c.execute(text("CREATE TABLE cars(id TEXT PRIMARY KEY,video_url TEXT)"))
   c.execute(text("INSERT INTO cars VALUES ('sc-005','/videos/pericial/sc-005-pericial.mp4'),('customer','/other.mp4')"))
   entries=plan_repairs(c);self.assertEqual(len(entries),1)
   self.assertEqual(apply_repairs(c,entries),1);self.assertEqual(plan_repairs(c),[])
   self.assertEqual(c.execute(text("SELECT video_url FROM cars WHERE id='customer'")).scalar_one(),"/other.mp4")
   self.assertEqual(rollback_repairs(c,entries),1)
   self.assertEqual(plan_repairs(c),entries)
   c.execute(text("UPDATE cars SET video_url='/customer-new.mp4' WHERE id='sc-005'"))
   with self.assertRaises(RuntimeError):apply_repairs(c,entries)
