import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';

const saved = Object.fromEntries(['fetch','window','document','localStorage','sessionStorage','confirm','Image'].map(key => [key, globalThis[key]]));
const storage = () => { const map = new Map(); return {getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,String(value)),removeItem:key=>map.delete(key)}; };
const deferred = () => {let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};
const tick = () => new Promise(resolve=>setTimeout(resolve,0));
const waitForDebounce = () => new Promise(resolve=>setTimeout(resolve,280));
const text = view => JSON.stringify(view.toJSON());
const content = node => typeof node==='string' ? node : (node?.children || []).map(content).join('');
const button = (view,label) => view.root.findAllByType('button').find(node=>content(node).includes(label));
let server, view;
before(async()=>{
 const stubs = new Set(['AIChatBox','SellerChat','TradeInSimulator','MarketPriceIndicator','PriceDropBadge','PericialVideoViewer','OfficialDossierModal','TcoCalculatorCard']);
 server=await createServer({server:{middlewareMode:true},ssr:{noExternal:['framer-motion']},logLevel:'silent',appType:'custom',plugins:[{
   name:'behavior-test-boundaries',enforce:'pre',
   resolveId(source,importer){if(source==='framer-motion'&&importer!=='\0behavior-motion')return '\0behavior-motion';const name=source.split('/').at(-1).replace(/\.jsx$/,'');if(name==='useAuth')return '\0behavior-auth';if(name==='useTour')return '\0behavior-tour';if(stubs.has(name))return '\0behavior-empty';},
   load(id){if(id==='\0behavior-motion')return "export * from 'framer-motion'; export function AnimatePresence({children}){return children;}";if(id==='\0behavior-auth')return 'export const useAuth = () => globalThis.__behaviorUser;';if(id==='\0behavior-tour')return 'export const useTour = () => ({demoState: {}});';if(id==='\0behavior-empty')return 'export default function Empty(){return null;}';},
 }]});
});
after(async()=>{await server?.close();for(const [key,value]of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}delete globalThis.__behaviorUser;});
beforeEach(()=>{
 globalThis.localStorage=storage();globalThis.sessionStorage=storage();
 globalThis.window=Object.assign(new EventTarget(),{scrollTo(){},innerWidth:1280});
 globalThis.document={body:{style:{}},documentElement:{clientWidth:1280},activeElement:null};
 globalThis.confirm=()=>true;
 globalThis.__behaviorUser={user:{id:1,email:'store@example.test',role:'lojista',storeId:1},isAuthenticated:true,canAccessB2B:()=>true};
 globalThis.fetch=async()=>Response.json([]);
});
afterEach(async()=>{if(view)await act(async()=>view.unmount());view=null;});
async function mount(Component,props={}){await act(async()=>{view=TestRenderer.create(React.createElement(MemoryRouter,null,React.createElement(Component,props)));});}

test('favoritos preservam a seleção manual e retiram IDs removidos por outro componente',async()=>{
 localStorage.setItem('@automatch:favorites',JSON.stringify(['sc-001','sc-002','sc-003']));
 const {default:Favorites}=await server.ssrLoadModule('/src/pages/FavoritesPage.jsx');
 const {toggleFavorite,removeFavorite}=await server.ssrLoadModule('/src/data/favoritesManager.js');
 await mount(Favorites);
 const selectors=()=>view.root.findAllByType('button').filter(node=>node.props.title==='Selecionar para comparacao');
 await act(async()=>selectors()[0].props.onClick());
 await act(async()=>selectors()[2].props.onClick());
 assert.deepEqual(selectors().map(content),['Comparar','Comparando','Comparando']);
 await act(async()=>toggleFavorite('sc-004'));
 assert.deepEqual(selectors().map(content),['Comparar','Comparando','Comparando','Comparar']);
 await act(async()=>removeFavorite('sc-002'));
 assert.deepEqual(selectors().map(content),['Comparar','Comparando','Comparar']);
});

test('chat descarta mensagens da conversa anterior mesmo se a resposta ignora o cancelamento',async()=>{
 const pending=deferred();let oldSignal;
 globalThis.fetch=async(url,options)=>{if(url.includes('/11/')){oldSignal=options.signal;return pending.promise;}return Response.json([{id:2,message:'Mensagem da conversa atual',is_me:true}]);};
 const {default:Chat}=await server.ssrLoadModule('/src/components/partners/PartnerChatModal.jsx');
 const props={isOpen:true,onClose(){},reservation:{id:11}};
 await mount(Chat,props);
 await act(async()=>view.update(React.createElement(MemoryRouter,null,React.createElement(Chat,{...props,reservation:{id:22}}))));
 assert.equal(oldSignal.aborted,true);assert.match(text(view),/Mensagem da conversa atual/);
 await act(async()=>{pending.resolve(Response.json([{id:1,message:'Mensagem antiga indevida',is_me:true}]));await tick();});
 assert.doesNotMatch(text(view),/Mensagem antiga indevida/);
});

test('chat mantém o texto da mensagem quando o servidor recusa o envio',async()=>{
 globalThis.fetch=async(_,options)=>options.method==='POST'?Response.json({detail:'Sem permissão'},{status:403}):Response.json([]);
 const {default:Chat}=await server.ssrLoadModule('/src/components/partners/PartnerChatModal.jsx');
 await mount(Chat,{isOpen:true,onClose(){},reservation:{id:11}});
 await act(async()=>view.root.findByType('input').props.onChange({target:{value:'Quero negociar este veículo'}}));
 await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.equal(view.root.findByType('input').props.value,'Quero negociar este veículo');
 assert.match(text(view),/Mensagem não enviada/);
});

test('favorito com ID numérico pode ser desmarcado e removido da comparação',async()=>{
 localStorage.setItem('@automatch:favorites',JSON.stringify(['101','102']));
 globalThis.fetch=async()=>Response.json([{id:101,brand:'Honda',model:'Civic',price:100000},{id:102,brand:'Toyota',model:'Corolla',price:120000}]);
 const {default:Favorites}=await server.ssrLoadModule('/src/pages/FavoritesPage.jsx');await mount(Favorites);
 const selectors=()=>view.root.findAllByType('button').filter(node=>node.props.title==='Selecionar para comparacao');
 assert.deepEqual(selectors().map(content),['Comparando','Comparando']);
 await act(async()=>selectors()[0].props.onClick());assert.deepEqual(selectors().map(content),['Comparar','Comparando']);
 await act(async()=>view.root.findAllByType('button').find(node=>node.props.title==='Remover dos favoritos').props.onClick());
 assert.equal(view.root.findAllByType('button').filter(node=>node.props.title==='Remover dos favoritos').length,1);
 const {getFavorites}=await server.ssrLoadModule('/src/data/favoritesManager.js');
 assert.deepEqual(getFavorites(),['102']);
 assert.deepEqual(JSON.parse(localStorage.getItem('@automatch:favorites')),['101','102']);
});

const inventoryCar={id:'car-1',brand:'Honda',model:'Civic',price:100000,year:2024,km:12000,valor_minimo_repasse:90000,store_name:'Parceiro'};
async function mountHub(){const {default:Hub}=await server.ssrLoadModule('/src/components/partners/PartnershipHubModal.jsx');await mount(Hub,{isOpen:true,onClose(){}});await act(waitForDebounce);return Hub;}

test('pesquisa B2B usa a resposta mais recente e não reconsulta a cada renderização',async()=>{
 const old=deferred();let gets=0;let oldSignal;
 globalThis.fetch=async(url,options)=>{if(url.includes('shared-inventory')){gets++;if(url.endsWith('q=')){oldSignal=options.signal;return old.promise;}return Response.json([{...inventoryCar,model:'Resultado atual'}]);}return Response.json([]);};
 await mountHub();
 const search=view.root.findAllByType('input').find(node=>node.props.placeholder?.includes('marca'));
 assert.ok(search,'Campo de pesquisa disponível');
 await act(async()=>search.props.onChange({target:{value:'atual'}}));
 await act(waitForDebounce);
 assert.equal(oldSignal.aborted,true);assert.match(text(view),/Resultado atual/);
 await act(async()=>{old.resolve(Response.json([{...inventoryCar,model:'Resultado antigo'}]));await tick();});
 assert.doesNotMatch(text(view),/Resultado antigo/);assert.equal(gets,2);
});

test('trocar de conta invalida o cache B2B e não mostra estoque da sessão anterior',async()=>{
 globalThis.fetch=async()=>Response.json([{...inventoryCar,model:globalThis.__behaviorUser.user.id===1?'Estoque da conta um':'Estoque da conta dois'}]);
 const Hub=await mountHub();assert.match(text(view),/Estoque da conta um/);
 globalThis.__behaviorUser={...globalThis.__behaviorUser,user:{id:2,email:'other@example.test',role:'lojista',storeId:2}};
 await act(async()=>view.update(React.createElement(MemoryRouter,null,React.createElement(Hub,{isOpen:true,onClose(){}}))));
 assert.doesNotMatch(text(view),/Estoque da conta um/);
 await act(waitForDebounce);assert.match(text(view),/Estoque da conta dois/);
});

test('reserva recusada não cria registro local nem anuncia sucesso',async()=>{
 for(const status of [403,409,503]){
   globalThis.fetch=async(_,options)=>options.method==='POST'?Response.json({detail:'Reserva recusada pelo servidor'},{status}):Response.json([inventoryCar]);
   await mountHub();
   await act(async()=>button(view,'Reservar Veículo').props.onClick());
   await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
   assert.match(text(view),/Reserva recusada pelo servidor/);assert.doesNotMatch(text(view),/Reserva \(Hold Lock\) confirmada com sucesso/);
   assert.equal(localStorage.getItem('automatch_b2b_reservations'),null);
   await act(async()=>view.unmount());view=null;
 }
});

test('reserva usa o ID devolvido pela API e não mistura reservas locais antigas',async()=>{
 localStorage.setItem('automatch_b2b_reservations',JSON.stringify([{id:'fake',car_title:'Reserva local indevida'}]));
 globalThis.fetch=async(url,options)=>{
   if(options.method==='POST')return Response.json({reservation_id:77,message:'Confirmada'});
   if(url.includes('/reservations/my'))return Response.json([{id:77,car_title:'Reserva oficial 77',proposed_price:90000,status:'ativa',expires_at:Date.now()/1000+600,is_owner:false}]);
   return Response.json([inventoryCar]);
 };
 await mountHub();await act(async()=>button(view,'Reservar Veículo').props.onClick());
 await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.match(text(view),/Reserva oficial 77/);assert.doesNotMatch(text(view),/Reserva local indevida/);
});

test('cancelamento e solicitação de fechamento recusados conservam a reserva ativa',async()=>{
 globalThis.fetch=async(url,options)=>{
   if(options.method==='POST')return Response.json({detail:'Operação recusada'},{status:409});
   if(url.includes('/reservations/my'))return Response.json([{id:77,car_title:'Reserva preservada',proposed_price:90000,status:'ativa',expires_at:Date.now()/1000+600,is_owner:false}]);
   return Response.json([]);
 };
 await mountHub();await act(async()=>button(view,'Minhas Reservas').props.onClick());
 await act(async()=>button(view,'Solicitar Fechamento').props.onClick());
 assert.match(text(view),/Operação recusada/);assert.ok(button(view,'Solicitar Fechamento'));
 const cancel=view.root.findAllByType('button').find(node=>node.props.title?.includes('Cancelar')) || button(view,'Cancelar');
 assert.ok(cancel);await act(async()=>cancel.props.onClick());
 assert.match(text(view),/Reserva preservada/);assert.doesNotMatch(text(view),/Reserva cancelada com sucesso/);
});

test('aprovação recusada pelo servidor não anuncia venda concluída',async()=>{
 globalThis.fetch=async(url,options)=>{
   if(options.method==='POST')return Response.json({detail:'Venda não autorizada'},{status:403});
   return Response.json(url.includes('/reservations/my')?[{id:77,car_title:'Reserva pendente',proposed_price:90000,status:'ativa',closing_requested:1,is_owner:true}]:[]);
 };
 await mountHub();await act(async()=>button(view,'Minhas Reservas').props.onClick());
 await act(async()=>button(view,'Aprovar Venda').props.onClick());
 assert.match(text(view),/Venda não autorizada/);assert.doesNotMatch(text(view),/Venda aprovada com sucesso|Negócio formalizado/);assert.ok(button(view,'Aprovar Venda'));
});

test('polling atrasado não desfaz um fechamento confirmado',async()=>{
 const originalInterval=globalThis.setInterval;const stale=deferred();let poll,reads=0;
 const reservation={id:77,car_title:'Reserva em fechamento',proposed_price:90000,status:'ativa',expires_at:Date.now()/1000+600,is_owner:false};
 globalThis.setInterval=(callback,delay,...args)=>{if(delay===15000)poll=callback;return originalInterval(callback,delay,...args);};
 try {
   globalThis.fetch=async(url,options)=>{
     if(options.method==='POST')return Response.json({message:'Fechamento confirmado'});
     if(url.includes('/reservations/my')){reads++;return reads===2?stale.promise:Response.json([{...reservation,closing_requested:reads>2?1:0}]);}
     return Response.json([]);
   };
   await mountHub();await act(async()=>button(view,'Minhas Reservas').props.onClick());
   assert.ok(poll);await act(async()=>{void poll();await tick();});
   await act(async()=>button(view,'Solicitar Fechamento').props.onClick());
   assert.ok(button(view,'Chat B2B'));assert.equal(button(view,'Solicitar Fechamento'),undefined);
   await act(async()=>{stale.resolve(Response.json([reservation]));await tick();});
   assert.equal(button(view,'Solicitar Fechamento'),undefined);assert.match(text(view),/Solicitação Enviada/);
 } finally {globalThis.setInterval=originalInterval;}
});

async function mountDetails(id='sc-004'){
 const {default:Details}=await server.ssrLoadModule('/src/pages/ShowcaseVehicleDetails.jsx');
 let navigate;function Screen(){navigate=useNavigate();return React.createElement(Details);}
 await act(async()=>{view=TestRenderer.create(React.createElement(MemoryRouter,{initialEntries:['/encontrar/'+id]},React.createElement(Routes,null,React.createElement(Route,{path:'/encontrar/:id',element:React.createElement(Screen)}))));});
 return path=>navigate(path);
}

test('avarias atualizam quando a API hidrata o mesmo veículo e somem quando deixam de existir',async()=>{
 const pending=deferred();
 globalThis.fetch=async url=>url==='/api/cars/sc-004'?pending.promise:Response.json([]);
 await mountDetails();assert.match(text(view),/dp-tracker-1/);
 await act(async()=>{pending.resolve(Response.json({id:'sc-004',brand:'Chevrolet',model:'Tracker',price:100000,damagePoints:[]}));await tick();});
 assert.doesNotMatch(text(view),/dp-tracker-1/);
});

test('resposta atrasada da análise visual não contamina o próximo anúncio',async()=>{
 const pending=deferred();let analysisSignal;
 globalThis.Image=class{set src(_value){queueMicrotask(()=>this.onerror());}};
 globalThis.fetch=async(url,options)=>{if(url==='/api/analise-visual'){analysisSignal=options.signal;return pending.promise;}return Response.json(url.startsWith('/api/cars/')?null:[]);};
 const navigate=await mountDetails();
 await act(async()=>{void view.root.findByProps({id:'scanner-ia-action-btn'}).props.onClick();await tick();});
 await act(async()=>navigate('/encontrar/sc-002'));
 assert.equal(analysisSignal.aborted,true);
 await act(async()=>{pending.resolve(Response.json({resposta:'Análise antiga indevida',pontos_avaria:[]}));await tick();});
 assert.doesNotMatch(text(view),/Análise antiga indevida/);
});

test('falha na análise visual exibe indisponibilidade sem inventar aprovação',async()=>{
 globalThis.Image=class{set src(_value){queueMicrotask(()=>this.onerror());}};
 globalThis.fetch=async url=>url==='/api/analise-visual'?Response.json({error:'Indisponível'},{status:503}):Response.json(url.startsWith('/api/cars/')?null:[]);
 await mountDetails();await act(async()=>view.root.findByProps({id:'scanner-ia-action-btn'}).props.onClick());
 assert.match(text(view),/Não foi possível concluir a análise visual/);assert.doesNotMatch(text(view),/Lataria com pintura uniforme/);
});

test('consulta cautelar indisponível não gera um laudo aprovado fictício',async()=>{
 globalThis.fetch=async url=>url.includes('/integracoes/laudo-cautelar/')?Response.json({detail:'Indisponível'},{status:503}):Response.json(url.startsWith('/api/cars/')?null:[]);
 await mountDetails();
 const consult=button(view,'Laudo Cautelar');assert.ok(consult);
 await act(async()=>consult.props.onClick());
 assert.match(text(view),/Não foi possível consultar o laudo cautelar/);assert.doesNotMatch(text(view),/Resultado da Perícia Cautelar/);
});
