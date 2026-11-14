import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
let JSDOM;
try{({JSDOM}=createRequire(import.meta.url)('jsdom'));}catch{({JSDOM}=createRequire(new URL('../.test-runtime/package.json',import.meta.url))('jsdom'));}
const dom=new JSDOM('<div id="app"></div><div id="modal-container"></div><div id="toast-container"></div>',{url:'http://localhost/sistema.html#/character/test',pretendToBeVisual:true});
for(const name of ['window','document','Node','MutationObserver','localStorage','sessionStorage','location','HTMLElement'])globalThis[name]=dom.window[name];
globalThis.requestAnimationFrame=dom.window.requestAnimationFrame.bind(dom.window);globalThis.cancelAnimationFrame=dom.window.cancelAnimationFrame.bind(dom.window);window.matchMedia=()=>({matches:false});
globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(url,'utf8'))});
const {createEmpty,saveChar}=await import('../engine/js/storage/cookies.js');
const {renderEditor}=await import('../engine/js/sheets/editor.js');
const errors=[];window.addEventListener('error',event=>errors.push(event.error));
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const specs=['Controlador','Lutador','Especialista em Combate','Especialista em Técnica','Suporte','Restringido'];
for(const origin of ['Inato','Herdado','Derivado','Feto Amaldiçoado Híbrido','Sem Técnica','Corpo Amaldiçoado Mutante','Restringido','Origem Personalizada (Homebrew)'])for(const spec of specs){
 const c=createEmpty();c.identificacao.especializacao=spec;c.identificacao.especializacoes=[{id:spec,nivel:2}];c.identificacao.nivel=2;c.identificacao.origem=origin;saveChar(c);
 const cleanup=renderEditor(document.querySelector('#app'),c.id);document.querySelector('[data-section="habilidades"]').click();await wait(100);
 const body=document.querySelector('#section-modal-body');assert.ok(!body.textContent.includes('Erro ao carregar'),body.textContent);
 assert.ok(body.querySelector('[data-sub="especializacao"]'),'Sub-abas ausentes');body.querySelector('[data-sub="especializacao"]').click();await wait(100);
 assert.ok(body.querySelector('.ability-name'),`Catálogo ausente para ${spec}: ${body.textContent}`);
 document.querySelector('.modal__header button').click();cleanup();
 console.log(`${origin} / ${spec}: Habilidades e catálogo OK`);
}
assert.deepEqual(errors,[]);dom.window.close();
