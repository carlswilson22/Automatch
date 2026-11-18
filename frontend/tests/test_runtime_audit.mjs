import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { apiRequest } from '../src/services/apiClient.js';
import { readSessionToken, canUseOfflineFallback } from '../src/services/sessionStorage.js';
import { addNewCar, getNewCars, deleteNewCar } from '../src/data/newCarsManager.js';
import { getFavorites } from '../src/data/favoritesManager.js';
import { parseInspectionFeedback, escapeHtml } from '../src/utils/inspectionData.js';

const originalFetch=globalThis.fetch;
const originalStorage=globalThis.localStorage;
const originalSession=globalThis.sessionStorage;
const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k),clear:()=>map.clear()};};
let server;
before(async()=>{server=await createServer({server:{middlewareMode:true},logLevel:'silent',appType:'custom'});});
after(async()=>{await server?.close();globalThis.fetch=originalFetch;globalThis.localStorage=originalStorage;globalThis.sessionStorage=originalSession;delete globalThis.window;delete globalThis.document;});
beforeEach(()=>{globalThis.localStorage=storage();globalThis.sessionStorage=storage();globalThis.fetch=originalFetch;});

test('dossiê aberto renderiza parecer ausente, JSON e objeto sem ReferenceError',async()=>{
 const {default:Dossier}=await server.ssrLoadModule('/src/components/vehicle/OfficialDossierModal.jsx');
 globalThis.window={addEventListener(){},removeEventListener(){},innerWidth:1280};
 globalThis.document={body:{style:{}},documentElement:{clientWidth:1280},activeElement:null};
 for(const feedback of [undefined,'malformed',JSON.stringify({classificacao_geral:'COM_ATENCAO',resumo_executivo:'Risco documentado',pontos_atencao_riscos:[]})]){
   let view;await act(async()=>{view=TestRenderer.create(React.createElement(Dossier,{isOpen:true,onClose:()=>{},car:{id:'test',brand:'Honda',model:'Civic',year:2024,price:100000,laudoFeedback:feedback}}));});
   const html=JSON.stringify(view.toJSON());await act(async()=>view.unmount());
   assert.match(html,/Dossiê Oficial/);if(feedback?.startsWith('{'))assert.match(html,/Risco documentado/);
 }
 delete globalThis.document;
});
test('feedback pode chegar depois da primeira renderização e desaparecer',async()=>{
 const {default:Card}=await server.ssrLoadModule('/src/components/vehicle/LaudoFeedbackCard.jsx');
 let root;await act(async()=>{root=TestRenderer.create(React.createElement(Card,{}));});
 await act(async()=>{root.update(React.createElement(Card,{feedback:{veredito:'Aprovado'}}));});
 assert.ok(root.toJSON());await act(async()=>root.update(React.createElement(Card,{})));assert.equal(root.toJSON(),null);root.unmount();
});
test('comparador permite alternar fechado e aberto sem mudar a ordem de hooks',async()=>{
 const {default:Comparator}=await server.ssrLoadModule('/src/components/vehicle/VehicleComparatorModal.jsx');
 const node=open=>React.createElement(MemoryRouter,null,React.createElement(Comparator,{isOpen:open,onClose:()=>{},availableCars:[]}));
 let root;await act(async()=>{root=TestRenderer.create(node(false));});await act(async()=>root.update(node(true)));assert.ok(root.toJSON());await act(async()=>root.update(node(false)));assert.equal(root.toJSON(),null);root.unmount();
});
test('API injeta sessão atual e não envia token para hosts externos',async()=>{
 sessionStorage.setItem('automatch_token','current-session');localStorage.setItem('automatch_token','old-session');
 const requests=[];globalThis.fetch=async(url,options)=>{requests.push([url,new Headers(options.headers)]);return Response.json({ok:true});};
 await apiRequest('/api/cars');await apiRequest('https://external.example/api/cars');
 assert.equal(requests[0][1].get('Authorization'),'Bearer current-session');assert.equal(requests[1][1].get('Authorization'),null);
});
test('sessão antiga no localStorage não autentica usuário',()=>{localStorage.setItem('automatch_user',JSON.stringify({token:'old'}));assert.equal(readSessionToken(),null);});
test('erros de credenciais e validação não permitem sucesso offline',()=>{for(const status of [400,401,403,409,422,429])assert.equal(canUseOfflineFallback({status},true),false);assert.equal(canUseOfflineFallback({status:0},false),false);});
test('anúncio conserva ID da API e atualiza cache sem duplicar',()=>{addNewCar({id:'backend-id',price:10});addNewCar({id:'backend-id',price:20});assert.equal(getNewCars().length,1);assert.equal(getNewCars()[0].id,'backend-id');assert.equal(getNewCars()[0].price,20);});
test('exclusão rejeitada mantém anúncio e não registra remoção local',async()=>{addNewCar({id:'keep'});globalThis.fetch=async()=>Response.json({detail:'Sem acesso'},{status:403});await assert.rejects(deleteNewCar('keep'),/Sem acesso/);assert.equal(getNewCars().length,1);assert.equal(localStorage.getItem('@automatch:deletedCars'),null);});
test('exclusão confirmada envia Bearer e retira anúncio',async()=>{addNewCar({id:'remove'});sessionStorage.setItem('automatch_token','session');globalThis.fetch=async(_,o)=>{assert.equal(new Headers(o.headers).get('Authorization'),'Bearer session');return Response.json({status:'success'});};await deleteNewCar('remove');assert.equal(getNewCars().length,0);});
test('cache corrompido ou de formato errado não derruba catálogo e favoritos',()=>{for(const data of ['{','{}','null','123']){localStorage.setItem('@automatch:newCars',data);localStorage.setItem('@automatch:favorites',data);assert.deepEqual(getNewCars(),[]);assert.deepEqual(getFavorites(),[]);}});
test('timeout e cancelamento continuam ativos enquanto corpo da resposta carrega',async()=>{
 globalThis.fetch=async(_,o)=>({ok:true,status:200,headers:new Headers({'content-type':'application/json'}),json:()=>new Promise((_,reject)=>o.signal.addEventListener('abort',()=>reject(o.signal.reason),{once:true}))});
 await assert.rejects(apiRequest('/api/slow',{}, {timeoutMs:15,retries:0}),e=>e.status===408);
 const controller=new AbortController();const pending=apiRequest('/api/slow',{signal:controller.signal},{timeoutMs:1000,retries:0});setTimeout(()=>controller.abort(),15);await assert.rejects(pending,/cancelada/);
});
test('parecer e impressão não aceitam objetos indevidos ou HTML ativo',()=>{assert.equal(parseInspectionFeedback('['),null);assert.equal(parseInspectionFeedback([]),null);assert.equal(escapeHtml('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');});

test('valores brasileiros preservam preço e km nos dois normalizadores',async()=>{
 const {parseVehicleNumber}=await import('../src/utils/vehicleNumbers.js');
 for(const value of ['R$ 185.000,50','185000.50',185000.5])assert.equal(parseVehicleNumber(value),185000.5);
 assert.equal(parseVehicleNumber('12.000 km'),12000);
 const {mapVehicleToViewModel}=await import('../src/utils/vehicleMapper.js');
 assert.equal(mapVehicleToViewModel({price:'R$ 185.000,50',km:'12.000 km'}).price,185000.5);
});
test('imagem de upload preserva rota da API',async()=>{
 const {getVehicleImageUrl}=await import('../src/utils/imageHelper.js');
 assert.equal(getVehicleImageUrl('/api/v1/laudos/files/car.jpg'),'/api/v1/laudos/files/car.jpg');
});

test('cópias de mídia usadas no Docker correspondem aos ativos do frontend', async()=>{
 const fs=await import('node:fs');
 const path=await import('node:path');
 const {fileURLToPath}=await import('node:url');
 const backend=new URL('../../backend/public_images/',import.meta.url);
 const frontend=new URL('../public/images/',import.meta.url);
 for(const file of fs.readdirSync(backend,{recursive:true})){
   if(!/\.jpg$/i.test(file))continue;
   assert.deepEqual(fs.readFileSync(path.join(fileURLToPath(backend),file)),fs.readFileSync(path.join(fileURLToPath(frontend),file)),file);
 }
});
