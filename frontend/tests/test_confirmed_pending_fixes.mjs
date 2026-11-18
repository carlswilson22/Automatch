import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { createServer } from 'vite';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

const storage = () => { const map = new Map(); return { getItem:key=>map.get(key)??null, setItem:(key,value)=>map.set(key,String(value)), removeItem:key=>map.delete(key) }; };
const globals = Object.fromEntries(['window','document','localStorage','sessionStorage','fetch'].map(key=>[key,globalThis[key]]));
const text = view => JSON.stringify(view.toJSON());
const content = node => typeof node === 'string' ? node : (node?.children || []).map(content).join('');
const button = (view,label) => view.root.findAllByType('button').find(node=>content(node).includes(label));
const negative = {id:'audit-negative',brand:'Marca',model:'Modelo',year:2022,km:42000,price:100000,laudo_status:'Reprovado',debt_status:'Com débitos',auction_history:'Sim'};
let server, view, auth, AuthProvider, useAuth, manager, mapper, normalizeVehicle;
before(async()=>{
 const empty = new Set(['AIChatBox','SellerChat','TradeInSimulator','MarketPriceIndicator','PriceDropBadge','PericialVideoViewer','OfficialDossierModal','AutomatchScan','TcoCalculatorCard']);
 server = await createServer({envFile:false,server:{middlewareMode:true},ssr:{noExternal:['framer-motion']},appType:'custom',logLevel:'silent',plugins:[{
  name:'confirmed-regressions-boundaries',enforce:'pre',
  resolveId(id,importer){
   if(id.includes('services/apiClient'))return '\0pending-api';
   if(id==='framer-motion'&&importer!=='\0pending-motion')return '\0pending-motion';
   const name=id.split('/').at(-1).replace(/\.jsx$/,'');
   if(name==='useTour')return '\0pending-tour';if(empty.has(name))return '\0pending-empty';
  },
  load(id){
   if(id==='\0pending-api')return 'export const isDemoModeEnabled=()=>true; export const api={post:(...args)=>globalThis.__pendingPost(...args),get:(...args)=>globalThis.__pendingGet(...args)};';
   if(id==='\0pending-motion')return "export * from 'framer-motion';export function AnimatePresence({children}){return children;}";
   if(id==='\0pending-tour')return 'export const useTour=()=>({demoState:{}});';
   if(id==='\0pending-empty')return 'export default function Empty(){return null;}';
  }
 }]});
 ({AuthProvider}=await server.ssrLoadModule('/src/contexts/AuthContext.jsx'));
 ({useAuth}=await server.ssrLoadModule('/src/contexts/useAuth.js'));
 manager=await server.ssrLoadModule('/src/data/favoritesManager.js');
 ({mapVehicleToViewModel:mapper}=await server.ssrLoadModule('/src/utils/vehicleMapper.js'));
 ({normalizeVehicle}=await server.ssrLoadModule('/src/utils/vehicleNormalizer.js'));
});
after(async()=>{await server?.close();for(const [key,value] of Object.entries(globals)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}delete globalThis.__pendingPost;delete globalThis.__pendingGet;});
beforeEach(()=>{
 globalThis.localStorage=storage();globalThis.sessionStorage=storage();
 globalThis.window=Object.assign(new EventTarget(),{scrollTo(){},innerWidth:1280});
 globalThis.document={body:{style:{}},documentElement:{clientWidth:1280},activeElement:null};
 globalThis.__pendingPost=async()=>{throw Object.assign(new Error('offline'),{status:0});};
 globalThis.__pendingGet=async()=>[];auth=null;
});
afterEach(async()=>{if(view)await act(async()=>view.unmount());view=null;});
async function mount(Component,props={},initialEntries=['/']){await act(async()=>{view=TestRenderer.create(React.createElement(MemoryRouter,{initialEntries},React.createElement(Component,props)));});}
async function mountAuth(){function Probe(){auth=useAuth();return null;}await act(async()=>{view=TestRenderer.create(React.createElement(AuthProvider,null,React.createElement(Probe)));});}
const account = id => sessionStorage.setItem('automatch_user',JSON.stringify({id,email:`${id}@example.test`}));

test('A1: mapper e normalizador preservam dados negativos, metadados e ausência de FIPE',()=>{
 for(const map of [mapper,normalizeVehicle]){
  const car=map({...negative,specs:{motor:'2.0',airbags:'2'},priceHistory:[{price:110000}],seller:{name:'Dono'}});
  assert.equal(car.laudoStatus,'Reprovado');assert.equal(car.debtStatus,'Com débitos');assert.equal(car.auctionHistory,'Sim');
  assert.equal(car.mileage,42000);assert.equal(car.fipePrice,null);assert.equal(car.fipeCode,null);assert.equal(car.specs.motor,'2.0');assert.equal(car.specs.airbags,'2');assert.equal(car.priceHistory.length,1);assert.equal(car.seller.name,'Dono');
  const unknown=map({id:'missing',price:100000});assert.equal(unknown.laudoStatus,'Não informado');assert.equal(unknown.debtStatus,'Não informado');assert.equal(unknown.auctionHistory,'Não informado');assert.equal(unknown.mileage,null);assert.equal(unknown.year,null);assert.deepEqual(unknown.specs,{});
  assert.equal(map({id:'zero',km:0}).mileage,0);
 }
 assert.equal(mapper({...negative,fipe_price:'R$ 120.000,50'}).fipePrice,120000.5);
});

test('A1: anúncio renderizado não converte laudo reprovado e leilão em aprovação',async()=>{
 globalThis.__pendingGet=async url=>url.includes('?')?[]:negative;
 const Details=(await server.ssrLoadModule('/src/pages/ShowcaseVehicleDetails.jsx')).default;
 function Page(){return React.createElement(Routes,null,React.createElement(Route,{path:'/:id',element:React.createElement(Details)}));}
 // The API record is independent of a predefined showcase ID.
 await mount(Page,{},['/audit-negative']);
 assert.match(text(view),/Reprovado/);assert.match(text(view),/Com débitos/);assert.match(text(view),/Leilão informado/);assert.match(text(view),/42.000 km/);
 assert.doesNotMatch(text(view),/Laudo 100% Aprovado|Sem Passagem por Leilão|IPVA 2026 Quitado|1.5 Turbo|6 airbags/);
});

test('A1: comparador mostra os status cadastrados e não inventa referência nem especificações',async()=>{
 const Comparator=(await server.ssrLoadModule('/src/components/vehicle/VehicleComparatorModal.jsx')).default;
 await mount(Comparator,{isOpen:true,onClose(){},initialVehicles:[negative,{id:'missing',name:'Sem cadastro',price:90000}]});
 for(const label of ['2. Quilometragem','3. Laudo','4. Situação','5. Especificações'])await act(async()=>button(view,label).props.onClick());
 assert.match(text(view),/Reprovado/);assert.match(text(view),/Com débitos/);assert.match(text(view),/Referência não informada/);assert.match(text(view),/Não informado/);
 assert.doesNotMatch(text(view),/Aprovado 100%|Sem Soldas|Nenhum Registro|115µm|100% Quitado|Nada Consta|Sem Gravame|Certificada Automatch|104.000/);
});

test('A3: favoritos renderizam 42.000 km da API e preservam os dados para comparação',async()=>{
 account('a');localStorage.setItem(manager.getFavoriteOwnerKey(),JSON.stringify([negative.id,'other']));
 globalThis.__pendingGet=async()=>[negative,{id:'other',name:'Outro',km:0,price:50000}];
 const Favorites=(await server.ssrLoadModule('/src/pages/FavoritesPage.jsx')).default;
 await mount(Favorites);assert.match(text(view),/42.000 km/);assert.match(text(view),/0 km/);
 await act(async()=>button(view,'Comparar Veiculos (').props.onClick());
 // Lazy component import resolves under act; the actual comparator consumes the same canonical records.
 await act(async()=>{await new Promise(done=>setTimeout(done,30));});
 const comparator=view.root.findAll(node=>node.props.initialVehicles?.length===2)[0];
 assert.equal(comparator.props.initialVehicles[0].mileage,42000);assert.equal(comparator.props.initialVehicles[0].laudoStatus,'Reprovado');
});

test('A4: contas isolam favoritos; login/logout notificam e legado exige importação explícita',async()=>{
 const legacy='["legacy"]';localStorage.setItem('@automatch:favorites',legacy);
 assert.deepEqual(manager.getFavorites(),['legacy']);const events=[];const unsub=manager.subscribeFavorites(ids=>events.push(ids));
 await mountAuth();globalThis.__pendingPost=async(_url,{email})=>({id:email, email,token:'token',role:'comum'});
 await act(async()=>auth.login('a@example.test','password'));assert.deepEqual(manager.getFavorites(),[]);
 manager.toggleFavorite('a-car');assert.deepEqual(manager.getFavorites(),['a-car']);
 await act(async()=>auth.logout());assert.deepEqual(manager.getFavorites(),['legacy']);
 await act(async()=>auth.login('b@example.test','password'));assert.deepEqual(manager.getFavorites(),[]);
 manager.importGuestFavorites();assert.deepEqual(manager.getFavorites(),['legacy']);
 await act(async()=>auth.login('a@example.test','password'));assert.deepEqual(manager.getFavorites(),['a-car']);
 assert.equal(localStorage.getItem('@automatch:favorites'),legacy);assert.ok(events.some(ids=>ids.length===0));unsub();
});

test('A4: favoritos antigos aparecem para importar na tela, sem atribuição silenciosa',async()=>{
 localStorage.setItem('@automatch:favorites','["sc-001"]');account('a');
 const Favorites=(await server.ssrLoadModule('/src/pages/FavoritesPage.jsx')).default;
 await mount(Favorites);assert.deepEqual(manager.getFavorites(),[]);assert.match(text(view),/salvos como visitante/);
 await act(async()=>button(view,'Adicionar à minha lista').props.onClick());assert.deepEqual(manager.getFavorites(),['sc-001']);assert.equal(localStorage.getItem('@automatch:favorites'),'["sc-001"]');
});

test('A4: falha de gravação e lista corrompida preservam dados; evento de outra conta não vaza lista',()=>{
 account('a');manager.toggleFavorite('a-car');const key=manager.getFavoriteOwnerKey();let current;
 const unsub=manager.subscribeFavorites(ids=>{current=ids;});
 const event=new Event('storage');Object.assign(event,{key:'@automatch:favorites:user:b',newValue:'["b-car"]'});window.dispatchEvent(event);assert.deepEqual(current,['a-car']);
 const set=localStorage.setItem;localStorage.setItem=()=>{throw new Error('quota');};assert.throws(()=>manager.toggleFavorite('new'),/salvar/);assert.deepEqual(manager.getFavorites(),['a-car']);
 localStorage.setItem=set;localStorage.setItem(key,'{');assert.throws(()=>manager.toggleFavorite('new'),/preservados/);assert.equal(localStorage.getItem(key),'{');unsub();
 globalThis.localStorage={getItem(){throw new Error('blocked');}};assert.deepEqual(manager.getFavorites(),[]);
});

test('A5: quota no cadastro não autentica nem confirma sucesso; nova tentativa salva e permite login',async()=>{
 await mountAuth();const set=localStorage.setItem;localStorage.setItem=()=>{throw new Error('quota');};
 await act(async()=>{await assert.rejects(auth.register('Cliente','cliente@example.test','password'),/Não foi possível salvar sua conta/);});
 assert.equal(auth.user,null);assert.equal(sessionStorage.getItem('automatch_user'),null);assert.equal(localStorage.getItem('@automatch:registered_users'),null);
 localStorage.setItem=set;await act(async()=>auth.register('Cliente','cliente@example.test','password'));
 const accounts=JSON.parse(localStorage.getItem('@automatch:registered_users'));assert.equal(accounts.length,1);assert.ok(accounts[0].passwordHash);assert.equal(accounts[0].password,undefined);
 await act(async()=>auth.logout());await act(async()=>auth.login('cliente@example.test','password'));assert.equal(auth.user.email,'cliente@example.test');
});

test('A5: cadastro corrompido é preservado e duplicata não sobrescreve a conta',async()=>{
 await mountAuth();localStorage.setItem('@automatch:registered_users','{');
 await act(async()=>assert.rejects(auth.register('Cliente','cliente@example.test','password'),/preservados/));assert.equal(localStorage.getItem('@automatch:registered_users'),'{');assert.equal(auth.user,null);
 const raw='[{"id":"old","email":"cliente@example.test","passwordHash":"old-hash"}]';localStorage.setItem('@automatch:registered_users',raw);
 await act(async()=>assert.rejects(auth.register('Outro','cliente@example.test','otherpass'),/já está cadastrado/));assert.equal(localStorage.getItem('@automatch:registered_users'),raw);
});

test('A5: cadastro confirmado pela API independe do cache opcional e recusa 401 não cria conta local',async()=>{
 await mountAuth();globalThis.__pendingPost=async()=>({id:'api-user',email:'api@example.test',token:'real-token',role:'comum'});localStorage.setItem=()=>{throw new Error('quota');};
 await act(async()=>auth.register('API','api@example.test','password'));assert.equal(auth.user.id,'api-user');assert.equal(sessionStorage.getItem('automatch_token'),'real-token');
 await act(async()=>auth.logout());globalThis.__pendingPost=async()=>{throw Object.assign(new Error('Recusado'),{status:401});};
 await act(async()=>assert.rejects(auth.register('API','api@example.test','password'),/Recusado/));assert.equal(auth.user,null);
});

test('A5: sessão indisponível não autentica; conta salva permanece para entrar novamente',async()=>{
 await mountAuth();const set=sessionStorage.setItem;sessionStorage.setItem=(key,value)=>{if(key==='automatch_token')throw new Error('quota');set(key,value);};
 await act(async()=>assert.rejects(auth.register('Cliente','cliente@example.test','password'),/conta foi salva/));
 assert.equal(auth.user,null);assert.equal(sessionStorage.getItem('automatch_user'),null);assert.equal(JSON.parse(localStorage.getItem('@automatch:registered_users')).length,1);
});


test('A2: validação pública renderizada não anuncia carimbo, assinatura ou hash inexistentes',async()=>{
 globalThis.fetch=async()=>Response.json({valido:true,protocolo:'ATM-TEST',veiculo:{marca:'Marca',modelo:'Modelo',ano:null},dados_fipe:{codigo_fipe:'Não informado',valor_referencia:'Não informado'},dados_detran:{situacao_cadastral:'Não consultado',debitos:'Com débitos',gravame:'Não consultado'},origem:'cadastro'});
 const Validation=(await server.ssrLoadModule('/src/pages/PublicValidationPage.jsx')).default;
 function Page(){return React.createElement(Routes,null,React.createElement(Route,{path:'/:protocolo',element:React.createElement(Validation)}));}
 await mount(Page,{},['/ATM-TEST']);assert.match(text(view),/Registro Automatch localizado/);assert.match(text(view),/Com débitos/);assert.match(text(view),/Não informado/);
 assert.doesNotMatch(text(view),/Autenticidade Notarial|Certidão Autêntica|assinado digitalmente|SHA-256|Hash:|9f2a|Certidão DETRAN/);
});
