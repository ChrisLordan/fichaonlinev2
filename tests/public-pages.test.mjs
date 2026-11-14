import assert from 'node:assert/strict';
import {emptySheet,saveSheet,duplicateSheet,importSheet,getSheet}from '../js/storage.js';
import {getChar,saveChar,createEmpty}from '../engine/js/storage/cookies.js';
const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
const old=emptySheet();old.information.name='Original';saveSheet(old);const modern=getChar(old.id);saveChar(modern);
const copy=duplicateSheet(old.id);assert.notEqual(copy.id,old.id);assert.equal(getChar(copy.id).id,copy.id);assert.equal(getChar(copy.id).identificacao.nome,'Original (cópia)');assert.equal(getChar(old.id).identificacao.nome,'Original');
const imported=await importSheet({text:async()=>JSON.stringify(createEmpty())});assert.ok(getChar(imported.id));
const importedEnvelope=await importSheet({text:async()=>JSON.stringify(copy)});assert.notEqual(importedEnvelope.id,copy.id);assert.equal(getChar(importedEnvelope.id).id,importedEnvelope.id);assert.ok(getSheet(old.id));
console.log('Minhas Fichas: duplicação e importação nos dois formatos preservam IDs e originais.');
