import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('../engine/js/data/abilities.json',import.meta.url),'utf8'));
assert.equal(new Set(catalog.map(a=>a.especializacao)).size,6);
assert.equal(new Set(catalog.map(a=>a.id)).size,catalog.length);
for(const ability of catalog){assert.ok(ability.nome.trim());assert.ok(ability.descricao.trim(),ability.nome);assert.ok(ability.pagina>=49&&ability.pagina<=127);if(ability.nivel!==null)assert.ok(ability.nivel>=1&&ability.nivel<=20);assert.ok(!ability.nome.includes('\ufffd'));}
const find=(spec,name)=>catalog.find(a=>a.especializacao===spec&&a.nome===name);
assert.equal(find('Lutador','APARAR ATAQUE').nivel,2);
assert.match(find('Lutador','APARAR ATAQUE').descricao,/gastar 1 PE/);
assert.equal(find('Lutador','Lutador Superior').nivel,20);
assert.equal(find('Controlador','FANTOCHE SUPREMO').nivel,16);
assert.match(find('Controlador','INVOCAÇÕES RESISTENTES').descricao,/multiplicado por cinco/);
assert.equal(find('Suporte','Suporte Absoluto').nivel,20);
assert.equal(find('Restringido','Libertação do Destino').nivel,20);
assert.equal(find('Especialista em Técnica','O Honrado').nivel,20);
console.log(`${catalog.length} registros: seis especializações, páginas, descrições e níveis verificados.`);
