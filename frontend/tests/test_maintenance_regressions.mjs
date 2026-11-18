import { test, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';

// Verify the shared context after separating the hook from its provider.
const saved = Object.fromEntries(['window','document'].map(key=>[key,globalThis[key]]));
let server, view, TourProvider, useTour;
before(async()=>{
 server=await createServer({envFile:false,server:{middlewareMode:true},appType:'custom',logLevel:'silent',plugins:[{
  name:'maintenance-boundaries',enforce:'pre',resolveId(id){if(id.endsWith('/useAuth'))return '\0maintenance-auth';},
  load(id){if(id==='\0maintenance-auth')return "export const useAuth=()=>({user:{id:'test',role:'comum'}});";}
 }]});
 ({TourProvider}=await server.ssrLoadModule('/src/contexts/TourContext.jsx'));
 ({useTour}=await server.ssrLoadModule('/src/contexts/useTour.js'));
});
after(async()=>{await server?.close();for(const [key,value] of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}});
beforeEach(()=>{globalThis.window={innerWidth:1280,scrollTo(){}};globalThis.document={body:{style:{}},documentElement:{clientWidth:1280}};});
afterEach(async()=>{if(view)await act(async()=>view.unmount());view=null;});

test('hook de tour separado usa o contexto do provider e preserva abrir/fechar',async()=>{
 let tour;function Probe(){tour=useTour();return null;}
 await act(async()=>{view=TestRenderer.create(React.createElement(MemoryRouter,null,React.createElement(TourProvider,null,React.createElement(Probe))));});
 assert.equal(tour.introModal.isOpen,false);
 await act(async()=>tour.openTourIntro('comprar'));assert.equal(tour.introModal.isOpen,true);assert.equal(document.body.style.overflow,'hidden');
 await act(async()=>tour.closeTourIntro());assert.equal(tour.introModal.isOpen,false);assert.equal(document.body.style.overflow,'');
});
