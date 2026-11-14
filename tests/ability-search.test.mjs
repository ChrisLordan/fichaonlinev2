import assert from 'node:assert/strict';
import {matchesAbility} from '../engine/js/ui/ability-catalog.js';
const ability={nome:'EMPOLGAÇÃO',descricao:'Você recebe um bônus de proteção.'};
assert.ok(matchesAbility(ability,'empolgacao'));assert.ok(matchesAbility(ability,' PROTECAO '));assert.ok(matchesAbility(ability,''));assert.ok(!matchesAbility(ability,'inexistente'));
console.log('Pesquisa por nome e descrição sem distinção de acentos: OK.');
