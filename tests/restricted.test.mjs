import assert from 'node:assert/strict';
import {readFileSync}from 'node:fs';
import {createRequire}from 'node:module';
let JSDOM;try{({JSDOM}=createRequire(import.meta.url)('jsdom'));}catch{({JSDOM}=createRequire(new URL('../.test-runtime/package.json',import.meta.url))('jsdom'));}
const dom=new JSDOM('<main></main>',{url:'http://localhost'});for(const key of ['window','document','Node','Option'])globalThis[key]=dom.window[key];
const {resourcePoints,labelResources}=await import('../engine/js/data/resources.js');
const {recalcularPontos,PERICIAS,totalPericia}=await import('../engine/js/data/calculos.js');
const {renderMartial,renderGifts,renderTraining}=await import('../engine/js/ui/restricted.js');
const data=JSON.parse(readFileSync(new URL('../engine/js/data/restricted-training.json',import.meta.url),'utf8'));globalThis.fetch=async()=>({json:async()=>data});
assert.equal(data.trainings.length,11);assert.equal(data.gifts.length,9);assert.ok(!PERICIAS.some(p=>['luta','pontaria'].includes(p.id)));assert.equal(totalPericia({modAtributo:2,nivel:4,prof:2}),4);
const char={identificacao:{especializacao:'Restringido',nivel:20},atributos:{constituicao:14},pontos:{peAtual:0},treinamentos:{},dadivas:[]};recalcularPontos(char);
const p=resourcePoints(char);assert.equal(p.peMax,80);p.peAtual=33;assert.equal(char.pontos.estaminaAtual,33);assert.equal(char.pontos.peAtual,0);
const root=document.querySelector('main');root.textContent='Pontos de Energia Amaldiçoada PE';labelResources(root,char);assert.equal(root.textContent,'Pontos de Estamina Estamina');
renderMartial(root,char,()=>{});assert.ok(root.textContent.includes('Técnicas Marciais'));root.querySelector('button').click();assert.equal(char.estiloMarcial.tecnicas.length,1);assert.equal(char.estiloMarcial.tecnicas[0].custo,2);
await renderGifts(root,char,()=>{});assert.equal(root.querySelectorAll('details').length,9);root.querySelector('button').click();assert.equal(char.dadivas.length,1);
await renderTraining(root,char,()=>{});assert.equal(root.querySelectorAll('.training-card').length,11);assert.equal(root.querySelectorAll('input[type=checkbox]').length,44);
char.dadivas=['Vigor Infindável'];recalcularPontos(char);assert.equal(char.pontos.estaminaMax,90);dom.window.close();console.log('Restringido: Estamina, técnicas marciais, nove dádivas, onze treinos e perícias OK.');
