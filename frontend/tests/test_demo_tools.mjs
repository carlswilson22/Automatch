import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { createServer } from 'vite';
import { saveDemoAlert, readDemoTools, previewPriceAlert, simulatePublication, buildVehicleFeed, vehicleReference, demoPlateLookup, dossierInspectionItems } from '../src/utils/demoTools.js';
import { generateVehicleConsultantAnswer } from '../src/utils/aiConsultantCore.js';
const storage = () => { const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,String(value)),clear:()=>map.clear()}; };
const alertInput={car_id:'c1',car_name:'Civic',target_price:90000,contact_type:'email',contact_value:'cliente@exemplo.invalid'};
const car={id:'c1',name:'Civic',year:2024,price:100000};
const originals=Object.fromEntries(['window','document','localStorage','sessionStorage'].map(key=>[key,globalThis[key]]));
let server, PriceAlert, Multichannel, Panel;
before(async()=>{
 server=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'silent',plugins:[{name:'demo-api-test',enforce:'pre',resolveId(id){if(id.includes('services/apiClient'))return '\0demo-api';},load(id){if(id==='\0demo-api')return 'export const isDemoModeEnabled=()=>globalThis.__demo; export const api={post:(...args)=>globalThis.__post(...args)};';}}]});
 PriceAlert=(await server.ssrLoadModule('/src/components/vehicle/PriceAlertModal.jsx')).default;
 Multichannel=(await server.ssrLoadModule('/src/components/vehicle/MultichannelSyncModal.jsx')).default;
 Panel=(await server.ssrLoadModule('/src/components/vehicle/VehicleReferencePanel.jsx')).default;
});
after(async()=>{await server?.close();for(const [key,value] of Object.entries(originals)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}delete globalThis.__demo;delete globalThis.__post;});
beforeEach(()=>{globalThis.localStorage=storage();globalThis.sessionStorage=storage();globalThis.window={innerWidth:1280,scrollTo(){}};globalThis.document={body:{style:{}},documentElement:{clientWidth:1280}};globalThis.__demo=true;globalThis.__post=()=>{throw new Error('A demonstração não deve consultar a API');};});
const text=view=>JSON.stringify(view.toJSON());
const button=(view,label)=>view.root.findAllByType('button').find(node=>node.findAll(child=>typeof child.type==='string').some(child=>child.children.some(text=>typeof text==='string'&&text.includes(label))) || node.children.some(text=>typeof text==='string'&&text.includes(label)));
const mount=async(Component,props={})=>{let view;await act(async()=>{view=TestRenderer.create(React.createElement(Component,{isOpen:true,onClose(){},car,...props}));});return view;};
const change=async(input,value)=>act(async()=>input.props.onChange({target:{value}}));
const submit=async view=>act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));

test('alertas deduplicam contato e separam contas sem perder dados anteriores',()=>{
 const store=storage();const a=saveDemoAlert(alertInput,{owner:'a',storage:store});
 const b=saveDemoAlert({...alertInput,target_price:85000,contact_value:'CLIENTE@exemplo.invalid'},{owner:'a',storage:store});
 assert.equal(a.id,b.id);assert.equal(readDemoTools('a',store).alerts.length,1);assert.equal(readDemoTools('b',store).alerts.length,0);
 assert.equal(previewPriceAlert(b,85001),null);assert.ok(previewPriceAlert(b,85000));assert.equal(previewPriceAlert(b,-1),null);assert.equal(previewPriceAlert(b,'x'),null);
 const before=JSON.stringify(readDemoTools('a',store));const failing={getItem:store.getItem,setItem(){throw new Error('quota');}};
 assert.throws(()=>saveDemoAlert(alertInput,{owner:'a',storage:failing}),/salvar/);assert.equal(JSON.stringify(readDemoTools('a',store)),before);
 store.setItem('@automatch:demo-tools:a','{');assert.throws(()=>saveDemoAlert(alertInput,{owner:'a',storage:store}),/preservados/);assert.equal(store.getItem('@automatch:demo-tools:a'),'{');
});
test('publicação é local, valida canais e XML usa somente campos públicos escapados',()=>{
 const store=storage();const result=simulatePublication(car,['olx','olx'],{owner:'a',storage:store});
 assert.deepEqual(result.channels,['olx']);assert.equal(result.external_delivery,false);assert.equal(readDemoTools('a',store).publications.length,1);
 assert.throws(()=>simulatePublication(car,[],{storage:store}),/canal/);
 const xml=buildVehicleFeed([{...car,id:'A"&',name:'<script>&',price:'R$ 100.000,50',observacoes_repasse:'SEGREDO'}]);
 assert.match(xml,/id="A&quot;&amp;"/);assert.match(xml,/&lt;script&gt;&amp;/);assert.match(xml,/100000.50/);assert.doesNotMatch(xml,/SEGREDO/);
});
test('referência ausente, placa desconhecida e dossiê não inventam verificações',()=>{
 assert.equal(vehicleReference(car).value,null);assert.equal(vehicleReference({...car,fipePrice:'R$ 120.000,00'}).value,120000);
 assert.throws(()=>demoPlateLookup('KPL9B88'),/manualmente/);assert.equal(demoPlateLookup('ABC1234').consulta_oficial,false);
 assert.ok(dossierInspectionItems(car).every(item=>!item.approved));assert.doesNotMatch(JSON.stringify(dossierInspectionItems(car)),/100%|Sem Registros|Regular/);
 for(const question of ['avarias','documentação','pintura','motor e km','laudo e leilão','garantia']){
  const answer=generateVehicleConsultantAnswer(question,car);assert.doesNotMatch(answer,/100%|115 micras|quitado|micragem.*conforme/);assert.match(answer,/sem certificação/);
 }
});
test('radar salva sem API e mostra prévia só quando preço atinge o alvo',async()=>{
 const view=await mount(PriceAlert);
 assert.equal(view.root.findByProps({role:'dialog'}).props['aria-modal'],'true');
 await change(view.root.findByProps({type:'tel'}),'11999990000');await submit(view);
 assert.match(text(view),/Interesse registrado/);assert.equal(readDemoTools().alerts.length,1);
 await change(view.root.findByProps({type:'number'}),100001);await act(async()=>button(view,'Simular queda de preço').props.onClick());assert.match(text(view),/Preço acima do alvo/);
 await change(view.root.findByProps({type:'number'}),90000);await act(async()=>button(view,'Simular queda de preço').props.onClick());assert.match(text(view),/Exemplo de alerta/);assert.match(text(view),/nenhum envio externo/);
 await act(async()=>view.unmount());
});
test('erro de armazenamento e recusa da API não exibem confirmação',async()=>{
 globalThis.localStorage={getItem(){return null;},setItem(){throw new Error('quota');}};
 let view=await mount(PriceAlert);await change(view.root.findByProps({type:'tel'}),'11999990000');await submit(view);assert.match(text(view),/Não foi possível salvar/);assert.doesNotMatch(text(view),/Interesse registrado/);await act(async()=>view.unmount());
 globalThis.__demo=false;globalThis.__post=async()=>{throw new Error('Sessão expirada');};
 view=await mount(PriceAlert);await change(view.root.findByProps({type:'tel'}),'11999990000');await submit(view);assert.match(text(view),/Sessão expirada/);assert.doesNotMatch(text(view),/Interesse registrado/);await act(async()=>view.unmount());
});
test('trocar veículo ou conta limpa confirmação e fechar cancela requisição pendente',async()=>{
 let view=await mount(Multichannel);await act(async()=>button(view,'Simular publicação').props.onClick());assert.match(text(view),/Amostra preparada em/);
 await act(async()=>view.update(React.createElement(Multichannel,{isOpen:true,onClose(){},car:{...car,id:'c2'}})));assert.doesNotMatch(text(view),/Amostra preparada em/);
 sessionStorage.setItem('automatch_user',JSON.stringify({id:'outra-conta'}));await act(async()=>view.update(React.createElement(Multichannel,{isOpen:true,onClose(){},car})));assert.doesNotMatch(text(view),/Amostra preparada em/);await act(async()=>view.unmount());
 globalThis.__demo=false;let signal;globalThis.__post=(_url,_payload,options)=>new Promise((_,reject)=>{signal=options.signal;signal.addEventListener('abort',()=>reject(new Error('cancelado')));});
 view=await mount(Multichannel);let pending;await act(async()=>{pending=button(view,'Simular publicação').props.onClick();});await act(async()=>view.unmount());await pending;assert.equal(signal.aborted,true);
});
test('multicanal sem canais bloqueia ação e amostra guarda histórico real do navegador',async()=>{
 const view=await mount(Multichannel);const choices=view.root.findAllByProps({type:'checkbox'});
 for(const input of choices)await act(async()=>input.props.onChange({target:{checked:false}}));assert.equal(button(view,'Simular publicação').props.disabled,true);
 await act(async()=>choices[0].props.onChange({target:{checked:true}}));await act(async()=>button(view,'Simular publicação').props.onClick());assert.equal(readDemoTools().publications.length,1);assert.match(text(view),/Nenhum anúncio foi publicado/);assert.doesNotMatch(text(view),/www.olx.com/);await act(async()=>view.unmount());
});
test('painéis do anúncio mostram indisponibilidade e não transformam ausência em aprovação',async()=>{
 for(const type of ['laudo','detran','fipe']){
  const view=await mount(Panel,{type,data:{sample:true}});assert.doesNotMatch(text(view),/100%|165.000|Nenhuma infração|Setembro\/2026/);assert.match(text(view),type==='fipe'?/Não informado/:/Não consultado/);await act(async()=>view.unmount());
 }
});