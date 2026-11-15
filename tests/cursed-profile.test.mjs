import assert from 'node:assert/strict';
import {createRequire}from 'node:module';
let JSDOM;try{({JSDOM}=createRequire(import.meta.url)('jsdom'));}catch{({JSDOM}=createRequire(new URL('../.test-runtime/package.json',import.meta.url))('jsdom'));}
const dom=new JSDOM('<main></main>');globalThis.document=dom.window.document;globalThis.Option=dom.window.Option;
const {renderCursedProfile}=await import('../engine/js/ui/cursed-profile.js');const root=document.querySelector('main');let saves=0,lastTab;
const char={identificacao:{especializacao:'Lutador',nivel:3},atributos:{forca:14,destreza:12},tecnica:{nome:'Teste',descricao:'Base',atributoChave:'forca',feiticos:[{nome:'Golpe',nivel:1,descricao:'Efeito salvo'}],expansaoDominio:{nome:'Domínio salvo'}}};
const handlers={save:()=>saves++,technique:r=>{lastTab='technique';r.textContent='Editor de técnica';},abilities:(r,tab)=>{lastTab=tab;r.textContent=tab;}};
renderCursedProfile(root,char,handlers);assert.ok(root.textContent.includes('Golpe'));assert.equal(root.querySelector('.cursed-domain input').value,'Domínio salvo');
const name=root.querySelector('.cursed-identity input');name.value='Nova técnica';name.oninput();assert.equal(char.tecnica.nome,'Nova técnica');assert.equal(saves,1);
root.querySelector('[data-profile-tab="skills"]').click();assert.equal(lastTab,'especializacao');root.querySelector('[data-profile-tab="training"]').click();assert.equal(lastTab,'treinamentos');root.querySelector('[data-profile-tab="aptitudes"]').click();assert.equal(lastTab,'aptidoes');
char.identificacao.especializacao='Restringido';char.estiloMarcial={nome:'Estilo salvo',fundamento:'Fundamento',tecnicas:[]};renderCursedProfile(root,char,handlers);assert.equal(root.querySelector('.cursed-identity input').value,'Estilo salvo');assert.ok(root.textContent.includes('Dádivas do Céu'));assert.equal(root.querySelector('.cursed-domain'),null);assert.equal(char.tecnica.expansaoDominio.nome,'Domínio salvo');dom.window.close();console.log('Perfil: dados existentes, edição, navegação e adaptação a Restringido OK.');
