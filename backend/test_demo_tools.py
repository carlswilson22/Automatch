"""Demonstração: nenhum resultado inventado ou envio externo; dados isolados."""
import asyncio
import io
import unittest
from unittest.mock import patch, AsyncMock, Mock
from xml.etree import ElementTree as ET
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
import models
from routers import detran, vehicle_lookup, integrations
from routers.ai_vision import generate_semantic_reply
from services.pdf_generator import gerar_dossie_pdf
from pypdf import PdfReader

class DemoToolsTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine('sqlite://')
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        detran._FIPE_CACHE.clear()
        vehicle_lookup._PLATE_CACHE.clear()
        detran.plate_rate_limiter.reset('127.0.0.1')
    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def test_known_and_unknown_plates_never_claim_official_check(self):
        known = asyncio.run(vehicle_lookup.lookup_plate('ABC1234', self.db))
        self.assertTrue(known.is_simulado)
        self.assertFalse(known.consulta_oficial)
        self.assertEqual(known.restricoes_financeiras, 'Não consultado')
        with self.assertRaises(HTTPException) as error:
            asyncio.run(vehicle_lookup.lookup_plate('KPL9B88', self.db))
        self.assertEqual(error.exception.status_code, 404)
        unknown = asyncio.run(detran.consultar_detran('KPL9B88'))
        self.assertFalse(unknown['consulta_valida'])
        self.assertIsNone(unknown['dados_veiculo']['debitos']['total_multas'])
        self.assertEqual(unknown['dados_veiculo']['situacao_veiculo'], 'Não consultado')

    def test_local_plate_reads_updates_without_fabricating_metadata(self):
        car = models.Car(id='local', plate='KPL9B88', brand='Marca', model='Modelo', year=2020, price=123, km=10)
        self.db.add(car); self.db.commit()
        result = asyncio.run(vehicle_lookup.lookup_plate('KPL9B88', self.db))
        self.assertEqual(result.origem, 'cadastro')
        self.assertFalse(result.consulta_oficial)
        self.assertIsNone(result.preco_fipe_sugerido)
        car.model = 'Atualizado'; self.db.commit()
        self.assertEqual(asyncio.run(vehicle_lookup.lookup_plate('KPL9B88', self.db)).modelo, 'Atualizado')

    def test_registered_plate_takes_precedence_over_cached_sample(self):
        asyncio.run(vehicle_lookup.lookup_plate('ABC1234', self.db))
        self.db.add(models.Car(id='override',plate='ABC1234',brand='Editada',model='Cadastro atual',year=None))
        self.db.commit()
        result = asyncio.run(vehicle_lookup.lookup_plate('ABC1234', self.db))
        self.assertEqual(result.marca,'Editada')
        self.assertEqual(result.origem,'cadastro')
        self.assertFalse(result.cache_hit)
        self.assertIsNone(result.ano_modelo)
    def test_fipe_matches_year_and_failure_does_not_fill_or_poison_cache(self):
        with patch('routers.detran.httpx.AsyncClient') as factory:
            client = AsyncMock()
            factory.return_value.__aenter__.return_value = client
            client.get.return_value = Mock(status_code=200, json=lambda: [{'codigoFipe':'004487-3','anoModelo':2023,'valor':'R$ 90.000,00'}])
            missing = asyncio.run(detran.gerar_laudo_cautelar('004487-3', 2024))
            self.assertIsNone(missing['laudo']['dados_oficiais_fipe'])
            self.assertEqual(detran._FIPE_CACHE, {})
            valid = asyncio.run(detran.gerar_laudo_cautelar('004487-3', 2023))
            self.assertEqual(valid['laudo']['dados_oficiais_fipe']['anoModelo'], 2023)
            self.assertEqual(valid['laudo']['resultado_geral'], 'Vistoria não realizada')
            cached = asyncio.run(detran.gerar_laudo_cautelar('004487-3', 2023))
            self.assertTrue(cached['cache_hit'])
            client.get.side_effect = RuntimeError('offline')
            failed = asyncio.run(detran.gerar_laudo_cautelar('005391-0', 2024))
            self.assertEqual(failed['status'], 'indisponivel')
            self.assertIsNone(failed['laudo']['dados_oficiais_fipe'])

    def test_multichannel_is_explicit_and_rejects_invalid_selection(self):
        result = asyncio.run(integrations.sincronizar_estoque_multicanal(integrations.SyncRequest(car_id='car',channels=['olx','olx']), models.User()))
        self.assertFalse(result['envio_externo'])
        self.assertEqual(result['total_simulados'], 1)
        self.assertEqual(result['total_sincronizados'], 0)
        self.assertIsNone(result['canais_sincronizados'][0]['url_publicacao'])
        for channels in [[], ['desconhecido']]:
            with self.assertRaises(HTTPException):
                asyncio.run(integrations.sincronizar_estoque_multicanal(integrations.SyncRequest(channels=channels), models.User()))

    def test_feed_tracks_store_updates_escapes_and_excludes_private_fields(self):
        self.db.add_all([models.Store(id=1,name='Loja A'), models.Store(id=2,name='Loja B')]); self.db.commit()
        car = models.Car(id='xml',store_id=1,brand='A & B',model='<Teste>',year=2024,km=5,price=100,valor_minimo_repasse=80,observacoes_repasse='PRIVADO')
        self.db.add_all([car,models.Car(id='other',store_id=2),models.Car(id='sold',store_id=1,status_reserva='vendido')]); self.db.commit()
        xml = asyncio.run(integrations.gerar_feed_xml(1,self.db)).body
        parsed = ET.fromstring(xml)
        self.assertEqual([item.attrib['id'] for item in parsed.findall('veiculo')], ['xml'])
        self.assertEqual(parsed.find('veiculo/marca').text, 'A & B')
        self.assertNotIn(b'PRIVADO',xml)
        self.assertNotIn(b'valor_minimo_repasse',xml)
        car.price=120;self.db.commit()
        self.assertEqual(ET.fromstring(asyncio.run(integrations.gerar_feed_xml(1,self.db)).body).find('veiculo/preco').text,'120.00')

    def test_consultant_missing_data_never_certifies_car(self):
        for question in ['Documentação IPVA','Há avarias?','Pintura','Motor e km','Garantia','Laudo e leilão']:
            answer = generate_semantic_reply(question, {})
            self.assertNotIn('100%',answer)
            self.assertNotIn('115 micras',answer)
            self.assertIn('sem certificação',answer)
        answer = generate_semantic_reply('avarias',{'damagePoints':[{'part':'Teto','desc':'Amassado'}]})
        self.assertNotIn('Amassado',answer)
        self.assertIn('não realizada',answer)
        self.assertNotIn('leve',answer)

    def test_pdf_uses_only_supplied_data_without_fake_reference_or_certificate(self):
        content = gerar_dossie_pdf({'brand':'A & B','model':'<b>Modelo</b>','year':2024,'price':100000},'DEMO-123')
        text = '\n'.join(page.extract_text() for page in PdfReader(io.BytesIO(content)).pages)
        self.assertIn('RELATÓRIO DEMONSTRATIVO',text)
        self.assertIn('<b>Modelo</b>',text)
        self.assertIn('não consultados',text)
        self.assertIn('QR de referência do exemplo',text)
        self.assertNotIn('104.000',text)
        self.assertNotIn('CERTIFICADO OFICIAL',text)
        self.assertNotIn('automatch.com.br/validar',text)