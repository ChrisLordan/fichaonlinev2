import assert from 'node:assert/strict';
import {readFileSync}from 'node:fs';
import {createRequire}from 'node:module';
let JSDOM;try{({JSDOM}=createRequire(import.meta.url)('jsdom'));}catch{({JSDOM}=createRequire(new URL('../.test-runtime/package.json',import.meta.url))('jsdom'));}
const dom=new JSDOM('<main></main>');globalThis.document=dom.window.document;
const data=JSON.parse(readFileSync(new URL('../engine/js/data/restricted-training.json',import.meta.url),'utf8'));globalThis.fetch=async()=>({json:async()=>data});
const {renderTraining}=await import('../engine/js/ui/restricted.js');
const expected=['Treino de Agilidade','Treino de Barreiras','Treino de Compreensão','Controle de Energia','Treino de Domínios','Energia Reversa','Treino de Luta','Manejo de Arma','Treino de Perícia','Potencial Físico','Treino de Resistência'];
const char={treinamentos:{agilidade:[true,true,true,false,false],legado:[true]}};let saves=0;const root=document.querySelector('main');await renderTraining(root,char,()=>saves++);
assert.deepEqual([...root.querySelectorAll('.training-card h4')].map(n=>n.textContent),expected);assert.equal(root.querySelectorAll('input').length,44);
const first=root.querySelector('.training-card'),checks=[...first.querySelectorAll('input')];assert.deepEqual(checks.map(n=>n.checked),[true,true,true,false]);checks[3].checked=true;checks[3].onchange();assert.ok(char.treinamentos.agilidade[4]);assert.ok(first.classList.contains('is-complete'));assert.equal(saves,1);
checks[0].checked=false;checks[0].onchange();assert.equal(char.treinamentos.agilidade[4],false);assert.deepEqual(char.treinamentos.legado,[true]);
assert.equal(root.querySelectorAll('.training-benefit').length,11);assert.ok([...root.querySelectorAll('.training-benefit')].every(n=>n.textContent.length>40));dom.window.close();console.log('Treinamentos: nomes da referência, 44 etapas, benefícios, progresso preservado e conclusão automática OK.');
