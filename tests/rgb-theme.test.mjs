import assert from 'node:assert/strict';
import {rgbColorAt,configureRgb} from '../js/rgb-theme.js';
assert.equal(rgbColorAt(0),rgbColorAt(18000));assert.notEqual(rgbColorAt(0),rgbColorAt(6000));
const props=new Map();globalThis.document={hidden:false,addEventListener(){},documentElement:{classList:{toggle(){}},style:{*[Symbol.iterator](){yield*props.keys();},setProperty:(k,v)=>props.set(k,v),removeProperty:k=>props.delete(k)}}};globalThis.window={addEventListener(){},matchMedia:()=>({matches:false})};
let scheduled=0,cancelled=0;globalThis.requestAnimationFrame=()=>++scheduled;globalThis.cancelAnimationFrame=()=>cancelled++;
configureRgb(true,{});configureRgb(true,{});assert.equal(scheduled,1);
configureRgb(false,{'#dc172c':'#123456'});assert.equal(props.get('--site-color-dc172c'),'#123456');assert.ok(cancelled>0);
console.log('RGB: ciclo, ausência de loops duplicados e restauração da cor fixa OK.');
