import assert from 'node:assert/strict';
import {createEmpty,saveChar,getChar,duplicateChar,exportChar,importChar} from '../engine/js/storage/cookies.js';
import {CUSTOM_ORIGIN} from '../engine/js/ui/custom-origin.js';
const map=new Map();globalThis.localStorage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
const char=createEmpty();char.identificacao.origem=CUSTOM_ORIGIN;char.origemPersonalizada={nome:'Origem <especial>',caracteristicas:['Primeira característica','Descrição longa\ncom segunda linha']};
const before=structuredClone(char.atributos);saveChar(char);assert.deepEqual(getChar(char.id).origemPersonalizada,char.origemPersonalizada);assert.deepEqual(getChar(char.id).atributos,before);
const copyId=duplicateChar(char.id);assert.deepEqual(getChar(copyId).origemPersonalizada,char.origemPersonalizada);
const importedId=importChar(exportChar(char.id));assert.deepEqual(getChar(importedId).origemPersonalizada,char.origemPersonalizada);
console.log('Origem Homebrew: nome e características preservados ao salvar, duplicar e exportar/importar.');
