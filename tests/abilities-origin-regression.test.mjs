import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ORIGENS} from '../engine/js/data/origens.js';
import {ESPECIALIZACOES} from '../engine/js/data/especializacoes.js';
const source=readFileSync(new URL('../engine/js/sheets/editor.js',import.meta.url),'utf8');
const functions=source.slice(source.indexOf('  function renderOrigemDetalhe(body)'),source.indexOf('  function renderEspDetalhe(body)'));
for(const spec of ESPECIALIZACOES){
 const state={identificacao:{origem:'Feto Amaldiçoado Híbrido',especializacao:spec.id},origemDetalhes:{anatomias:['Alma Maldita']}};
 let saved=0,html='',mounted=false;
 const inputs=[];
 const wrap={style:{},set innerHTML(value){inputs.length=0;for(const match of value.matchAll(/data-anat="([^"]+)"\s*(checked)?/g))inputs.push({dataset:{anat:match[1]},checked:!!match[2]});},querySelectorAll(){return inputs;}};
 const body={set innerHTML(value){html=value;mounted=value.includes('data-anatomy-options');},querySelector(selector){return selector==='[data-anatomy-options]'&&mounted?wrap:null;}};
 const render=new Function('state','ORIGENS','CUSTOM_ORIGIN','customOriginForm','scheduleSave',functions+'; return renderOrigemDetalhe;')(state,ORIGENS,'Origem Personalizada (Homebrew)',()=>{},()=>saved++);
 render(body);assert.ok(html.includes('Características de Anatomia'));assert.equal(inputs.length,15,spec.id);assert.ok(inputs.find(i=>i.dataset.anat==='Alma Maldita').checked);
 const chosen=inputs.find(i=>i.dataset.anat==='Corpo Especializado');chosen.checked=true;chosen.onchange();assert.ok(state.origemDetalhes.anatomias.includes('Corpo Especializado'));assert.equal(saved,1);
 render(body);assert.ok(inputs.find(i=>i.dataset.anat==='Corpo Especializado').checked);
}
console.log('Regressão: painel de anatomia montado antes dos controles; seis especializações e escolhas preservadas OK.');
