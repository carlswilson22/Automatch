"""A2: contrato HTTP completo de PDF, snapshot e validação; SQLite descartável."""
import io
import json
import os
import unittest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from pypdf import PdfReader
from database import Base, get_db
from main import app
import models

class ConfirmedPdfFixesTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        def isolated_db():
            yield self.db
        app.dependency_overrides[get_db] = isolated_db
        self.client = TestClient(app)
        self.environment = patch.dict(os.environ, {'ENVIRONMENT': 'testing'})
        self.environment.start()

    def tearDown(self):
        app.dependency_overrides.pop(get_db, None)
        self.client.close(); self.db.close(); self.engine.dispose(); self.environment.stop()

    def car(self, **extra):
        values = dict(id='confirmed-pdf', brand='Marca', model='<b>Modelo</b>', price=100000, year=None, km=0,
                      laudo_status='Reprovado', debt_status='Com débitos', auction_history='Sim')
        values.update(extra)
        car = models.Car(**values); self.db.add(car); self.db.commit(); return car

    def pdf(self, response):
        self.assertEqual(response.status_code, 200, response.text if response.status_code != 200 else '')
        self.assertIn('application/pdf', response.headers['content-type'])
        return '\n'.join(page.extract_text() for page in PdfReader(io.BytesIO(response.content)).pages)

    def snapshot(self, response):
        protocol = response.headers['X-Protocol-ID']
        record = self.db.query(models.LaudoProtocol).filter_by(protocol=protocol).one()
        return json.loads(record.snapshot_data), self.client.get('/api/v1/laudos/validar/' + protocol).json()

    def test_get_pdf_snapshot_and_validation_preserve_negative_and_missing_values(self):
        car = self.car()
        response = self.client.get(f'/api/v1/laudos/{car.id}/pdf')
        text = self.pdf(response)
        for supplied in ['<b>Modelo</b>', 'Reprovado', 'Com débitos']:
            self.assertIn(supplied, text)
        for fabricated in ['104.000', '005391-0', 'Sem débitos', 'Branco Pérola']:
            self.assertNotIn(fabricated, text)
        snapshot, validation = self.snapshot(response)
        self.assertIsNone(snapshot['fipe_price']); self.assertIsNone(snapshot['fipe_code'])
        self.assertIsNone(snapshot['chassi']); self.assertIsNone(snapshot['year']); self.assertEqual(snapshot['km'], 0)
        self.assertEqual(validation['dados_detran']['debitos'], 'Com débitos')
        self.assertEqual(validation['dados_detran']['situacao_cadastral'], 'Não consultado')
        self.assertEqual(validation['dados_detran']['gravame'], 'Não consultado')
        self.assertEqual(validation['dados_detran']['leilao_informado'], 'Sim')
        self.assertEqual(validation['veiculo']['chassi_mascarado'], 'Não informado')
        self.assertEqual(validation['dados_fipe']['valor_referencia'], 'Não informado')
        self.assertEqual(validation['origem'], 'cadastro')

    def test_post_does_not_override_registered_data_with_client_approvals(self):
        car = self.car(fipe_price=98000, fipe_code='REAL-001')
        response = self.client.post(f'/api/v1/laudos/{car.id}/pdf', json={'brand':'Falsa', 'fipe_price':500000, 'laudo_status':'Aprovado', 'debt_status':'Sem débitos', 'auction_history':'Não'})
        text = self.pdf(response); self.assertIn('98.000', text); self.assertIn('Reprovado', text); self.assertNotIn('500.000', text)
        snapshot, _ = self.snapshot(response)
        self.assertEqual(snapshot['fipe_code'], 'REAL-001'); self.assertEqual(snapshot['debt_status'], 'Com débitos')
        again = self.client.get(f'/api/v1/laudos/{car.id}/pdf')
        self.assertEqual(response.headers['X-Protocol-ID'], again.headers['X-Protocol-ID'])
        self.assertEqual(self.db.query(models.LaudoProtocol).count(), 1)

    def test_preview_preserves_zero_without_manufactured_fipe_or_approval(self):
        response = self.client.post('/api/v1/laudos/local-preview/pdf', json={'brand':'Manual', 'model':'Modelo', 'km':0, 'price':100000, 'laudo_status':'Reprovado', 'debt_status':'Com débitos', 'auction_history':'Sim'})
        text = self.pdf(response)
        self.assertIn('Reprovado', text); self.assertIn('Com débitos', text); self.assertNotIn('104.000', text); self.assertNotIn('005391-0', text)
        self.assertEqual(self.db.query(models.LaudoProtocol).count(), 0)

    def test_missing_preview_fields_do_not_become_2024_or_zero(self):
        from routers.laudos_export import _build_car_dict, CarDossiePayload
        data = _build_car_dict('preview', self.db, payload=CarDossiePayload(brand='Marca', model='Modelo'))
        for key in ['km','year','price','fipe_price','fipe_code','debt_status','auction_history','laudo_status']:
            self.assertIsNone(data[key], key)
        self.assertEqual(data['origem'], 'previsualizacao')
        self.pdf(self.client.post('/api/v1/laudos/preview/pdf', json={'brand':'Marca','model':'Modelo'}))

    def test_catalog_sample_is_explicit_and_production_unknown_is_404(self):
        from routers.laudos_export import _build_car_dict
        data = _build_car_dict('sc-001', self.db)
        self.assertEqual(data['origem'], 'amostra')
        with patch.dict(os.environ, {'ENVIRONMENT':'production'}):
            self.assertEqual(self.client.get('/api/v1/laudos/not-found/pdf').status_code, 404)

    def test_older_snapshot_without_fields_does_not_gain_regular_status(self):
        self.car()
        self.db.add(models.LaudoProtocol(protocol='ATM-OLD',car_id='confirmed-pdf',created_at='2026-11-17',snapshot_data='{"brand":"Antigo","chassi":null}')); self.db.commit()
        response = self.client.get('/api/v1/laudos/validar/ATM-OLD')
        self.assertEqual(response.status_code, 200)
        result = response.json(); self.assertEqual(result['dados_detran']['debitos'], 'Não informado')
        self.assertEqual(result['dados_detran']['gravame'], 'Não consultado'); self.assertIsNone(result['veiculo']['ano'])
        self.assertEqual(result['origem'], 'registro_anterior')
