import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activateDialog } from '../src/utils/dialogFocus.js';
function environment() {
 const listeners=new Map();
 const document={activeElement:null,defaultView:{getComputedStyle:element=>({display:element.hidden?'none':'block',visibility:'visible'})},addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},removeEventListener(type,fn){listeners.get(type)?.delete(fn);}};
 const event=(type,props={})=>{const e={defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},stopPropagation(){},...props};for(const listener of [...(listeners.get(type)||[])])listener(e);return e;};
 const control=(name,hidden=false)=>({name,hidden,tabIndex:0,isConnected:true,focus(){document.activeElement=this;},closest(){return null;}});
 const dialog=items=>({ownerDocument:document,querySelectorAll:()=>items,querySelector:()=>null,contains:node=>items.includes(node),focus(){document.activeElement=this;}});
 return {document,event,control,dialog,listeners};
}
test('foco inicial ignora controle oculto, Tab circula e fechar devolve ao acionador',()=>{
 const e=environment(),trigger=e.control('abrir'),first=e.control('primeiro'),last=e.control('último');trigger.focus();
 const dispose=activateDialog(e.dialog([e.control('oculto',true),first,last]),()=>{});
 assert.equal(e.document.activeElement,first);last.focus();assert.equal(e.event('keydown',{key:'Tab'}).defaultPrevented,true);assert.equal(e.document.activeElement,first);
 e.event('keydown',{key:'Tab',shiftKey:true});assert.equal(e.document.activeElement,last);dispose();assert.equal(e.document.activeElement,trigger);
 assert.equal(e.listeners.get('keydown').size,0);
});
test('somente diálogo superior recebe Escape e foco retorna ao diálogo pai',()=>{
 const e=environment(),trigger=e.control('abrir'),first=e.control('pai'),child=e.control('filho');let parentClosed=0,childClosed=0;trigger.focus();
 const disposeParent=activateDialog(e.dialog([first]),()=>parentClosed++);const disposeChild=activateDialog(e.dialog([child]),()=>childClosed++);
 e.event('keydown',{key:'Escape'});assert.equal(childClosed,1);assert.equal(parentClosed,0);
 trigger.focus();e.event('focusin',{target:trigger});assert.equal(e.document.activeElement,child);
 disposeChild();assert.equal(e.document.activeElement,first);disposeParent();assert.equal(e.document.activeElement,trigger);
});
test('diálogo sem controles recebe foco e origem removida não recebe foco ao fechar',()=>{
 const e=environment(),trigger=e.control('removido');trigger.focus();const root=e.dialog([]);const dispose=activateDialog(root,()=>{});assert.equal(e.document.activeElement,root);
 assert.equal(e.event('keydown',{key:'Tab'}).defaultPrevented,true);trigger.isConnected=false;dispose();assert.equal(e.document.activeElement,root);
});
test('desmontar pai antes do filho não rouba foco do diálogo superior',()=>{
 const e=environment(),first=e.control('pai'),child=e.control('filho');const disposeParent=activateDialog(e.dialog([first]),()=>{});const disposeChild=activateDialog(e.dialog([child]),()=>{});
 disposeParent();assert.equal(e.document.activeElement,child);first.isConnected=false;disposeChild();assert.equal(e.listeners.get('keydown').size,0);
});