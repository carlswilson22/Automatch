import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

// Legacy components are mounted only in this isolated harness, never in application routes.
const saved = Object.fromEntries(['window','document'].map(key=>[key,globalThis[key]]));
const content = node => typeof node === 'string' ? node : (node?.children || []).map(content).join('');
const button = label => view.root.findAllByType('button').find(node=>content(node).includes(label));
const text = () => JSON.stringify(view.toJSON());
let server, view, Acoustic, Tires, TourProvider, useTour;
before(async()=>{
 server=await createServer({envFile:false,server:{middlewareMode:true},ssr:{noExternal:['framer-motion','axios']},appType:'custom',logLevel:'silent',plugins:[{
  name:'maintenance-boundaries',enforce:'pre',resolveId(id){if(id==='framer-motion')return '\0maintenance-motion';if(id==='axios')return '\0maintenance-axios';if(id.endsWith('/useAuth'))return '\0maintenance-auth';},
  load(id){if(id==='\0maintenance-motion')return 'export const motion=new Proxy({}, {get:(_target,name)=>name});export function AnimatePresence({children}){return children;}';if(id==='\0maintenance-axios')return 'export default {post:(...args)=>globalThis.__maintenancePost(...args)};';if(id==='\0maintenance-auth')return "export const useAuth=()=>({user:{id:'test',role:'comum'}});";}
 }]});
 Acoustic=(await server.ssrLoadModule('/src/components/vehicle/EngineAcousticScanner.jsx')).default;
 Tires=(await server.ssrLoadModule('/src/components/vehicle/TireDepthScanner.jsx')).default;
 ({TourProvider}=await server.ssrLoadModule('/src/contexts/TourContext.jsx'));
 ({useTour}=await server.ssrLoadModule('/src/contexts/useTour.js'));
});
after(async()=>{await server?.close();for(const [key,value] of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}delete globalThis.__maintenancePost;});
beforeEach(()=>{globalThis.window={innerWidth:1280,scrollTo(){}};globalThis.document={body:{style:{}},documentElement:{clientWidth:1280}};});
afterEach(async()=>{if(view)await act(async()=>view.unmount());view=null;});
async function mount(Component,props){await act(async()=>{view=TestRenderer.create(React.createElement(Component,props));});}

test('hook de tour separado usa o contexto do provider e preserva abrir/fechar',async()=>{
 let tour;function Probe(){tour=useTour();return null;}
 await act(async()=>{view=TestRenderer.create(React.createElement(MemoryRouter,null,React.createElement(TourProvider,null,React.createElement(Probe))));});
 assert.equal(tour.introModal.isOpen,false);
 await act(async()=>tour.openTourIntro('comprar'));assert.equal(tour.introModal.isOpen,true);assert.equal(document.body.style.overflow,'hidden');
 await act(async()=>tour.closeTourIntro());assert.equal(tour.introModal.isOpen,false);assert.equal(document.body.style.overflow,'');
});

test('efeito acústico legado cancela resposta anterior sem loop ao recriar o objeto do veículo',async()=>{
 let resolveOld;const calls=[];
 globalThis.__maintenancePost=(_url,payload,options)=>{calls.push({payload,signal:options.signal});if(calls.length===1)return new Promise(resolve=>{resolveOld=resolve;});return Promise.resolve({data:{status:'success',status_geral:'Atual B',score_motor:40,itens_checados:[]}});};
 const car={id:'a',name:'A',brand:'Marca',km:0,specs:{motor:'2.0'}};
 await mount(Acoustic,{car});assert.equal(calls.length,1);assert.equal(calls[0].payload.car_context.km,0);
 await act(async()=>view.update(React.createElement(Acoustic,{car:{...car,specs:{motor:'2.0'}}})));assert.equal(calls.length,1);
 await act(async()=>view.update(React.createElement(Acoustic,{car:{...car,id:'b',name:'B'}})));assert.equal(calls.length,2);assert.equal(calls[0].signal.aborted,true);
 await act(async()=>resolveOld({data:{status:'success',status_geral:'Resultado antigo A',score_motor:99}}));assert.match(text(),/Atual B/);assert.doesNotMatch(text(),/Resultado antigo A/);
 await act(async()=>button('Reavaliar Áudio').props.onClick());assert.equal(calls.length,3);
});

test('efeito legado de rodas reutiliza cache por veículo e refaz consulta quando solicitado',async()=>{
 const calls=[];globalThis.__maintenancePost=(_url,payload,options)=>{calls.push({payload,signal:options.signal});return Promise.resolve({data:{status:'success',profundidade_mm:4,vida_util_restante_pct:50,km_estimado_restante:10000,limite_legal_contran_mm:1.6,condicao:'Amostra',status_cor:'amber',laudo_resumo:'Amostra',aprovado_contran:false}});};
 const car={id:'a',brand:'Marca',model:'Modelo',km:0};
 await mount(Tires,{car});assert.equal(calls.length,1);assert.equal(calls[0].payload.car_context.km,0);
 await act(async()=>view.update(React.createElement(Tires,{car:{...car}})));assert.equal(calls.length,1);
 await act(async()=>button('D.D.').props.onClick());assert.equal(calls.length,2);
 await act(async()=>button('D.E.').props.onClick());assert.equal(calls.length,2);
 await act(async()=>button('Reescanear Pneu').props.onClick());assert.equal(calls.length,3);
 await act(async()=>view.update(React.createElement(Tires,{car:{...car,id:'b'}})));assert.equal(calls.length,4);
});
