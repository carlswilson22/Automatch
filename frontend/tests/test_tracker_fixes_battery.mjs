import { test } from 'node:test';
import assert from 'node:assert/strict';
import { showcaseCars } from '../src/data/showcaseData.js';
import { generateVehicleConsultantAnswer } from '../src/utils/aiConsultantCore.js';
import { INSPECTION_LABELS, inspectionLabel, readVisualInspection, trustedDamagePoints, vehicleInspection } from '../src/utils/visualInspection.js';
const tracker=showcaseCars.find(car=>car.id==='sc-004');
const result={schema_version:2,analysis_state:'inconclusive',car_id:'sc-004',source_image:tracker.image};
test('Tracker não possui medida inventada de risco nem hotspot fixo',()=>{
 assert.deepEqual(tracker.damagePoints,[]);
 assert.doesNotMatch(tracker.fullDescription,/1\.8cm|retrovisor externo direito mapeado/);
});
test('consultor não repete avaria herdada do cadastro',()=>{
 const answer=generateVehicleConsultantAnswer('Há avarias?',{...tracker,damagePoints:[{desc:'RISCO INVENTADO'}],visualInspection:result});
 assert.match(answer,/inconclusiva/);assert.match(answer,/vistoria presencial/);assert.doesNotMatch(answer,/RISCO INVENTADO|100%/);
});
test('estados são distintos e resultado sem validação não acusa dano',()=>{
 assert.match(inspectionLabel(result),/inconclusiva/);
 assert.equal(INSPECTION_LABELS.no_damage_detected,'Nenhuma avaria detectada na análise automática');
 assert.equal(INSPECTION_LABELS.damage_detected,'Avaria detectada (alta confiança)');
 assert.match(inspectionLabel({schema_version:2,analysis_state:'damage_detected',damage_detection_validated:true}),/inconclusiva/);
 const untrusted=readVisualInspection({schema_version:2,analysis_state:'damage_detected',pontos_avaria:[{x:35,y:55}]});
 assert.equal(untrusted.analysis_state,'inconclusive');assert.deepEqual(trustedDamagePoints(untrusted),[]);
});
test('resultado de outra foto ou outro veículo não contamina o anúncio',()=>{
 assert.equal(vehicleInspection({...tracker,visualInspection:{...result,car_id:'sc-003'}}),null);
 assert.equal(vehicleInspection({...tracker,visualInspection:{...result,source_image:'/outra.jpg'}}),null);
 assert.equal(vehicleInspection({...tracker,visualInspection:result})?.analysis_state,'inconclusive');
 assert.equal(readVisualInspection({scanner_ia:true,score_lataria:98}),null);
});
