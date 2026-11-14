import assert from 'node:assert/strict';
import {rollTest} from '../engine/js/ui/rolls.js';
import {recalcularPontos} from '../engine/js/data/calculos.js';
assert.deepEqual(rollTest(3,()=>0),{natural:1,bonus:3,total:4});
assert.deepEqual(rollTest(-2,()=>0.999999),{natural:20,bonus:-2,total:18});
const char={identificacao:{nivel:5,especializacao:'Lutador'},atributos:{constituicao:14},pontos:{integridadeAtual:100}};
recalcularPontos(char);assert.equal(char.pontos.integridadeMax,char.pontos.pvMax);assert.equal(char.pontos.integridadeAtual,char.pontos.pvMax);
char.pontos.integridadeAtual=5;char.atributos.constituicao=16;recalcularPontos(char);assert.equal(char.pontos.integridadeAtual,5);assert.equal(char.pontos.integridadeMax,51);
console.log('Rolagens d20 nos extremos, bônus negativos e recálculo de Integridade: OK');
