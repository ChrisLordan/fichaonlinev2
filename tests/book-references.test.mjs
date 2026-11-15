import assert from 'node:assert/strict';
import {withoutBookPages}from '../js/book-references.js';
for(const input of ['Livro p.124 e 247–248.','Livro v2.5.2 · p. 339','arma improvisada (Página 326)','Dano de Fontes Externas (p.327)','alma (veja página 312)','veja a página 246.'])assert.doesNotMatch(withoutBookPages(input),/página|p\.\s*\d/i);
assert.equal(withoutBookPages('Nível 4: 12 Pontos de Estamina.'),'Nível 4: 12 Pontos de Estamina.');
console.log('Citações de páginas removidas da apresentação; níveis, custos e efeitos preservados.');
