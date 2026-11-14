import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
for(const file of ['editor.html','ficha.html']){const html=read(file);assert.ok(!html.includes('character-form'));assert.ok(!html.includes('class="session"'));assert.ok(html.includes('location.replace'));assert.ok(html.indexOf('location.replace')<html.indexOf('<body>'));}
for(const file of ['index.html','fichas.html','sistema.html']){const html=read(file);assert.ok(!html.includes('href="editor.html"'));for(const css of ['settings','color-picker','responsive'])assert.ok(html.indexOf(`href="css/${css}.css"`)<html.indexOf('</head>'));assert.ok(html.indexOf('js/theme-bootstrap.js')<html.indexOf('</head>'));}
assert.ok(read('sistema.html').includes('href="fichas.html">Minhas Fichas'));
console.log('Navegação direta, páginas antigas sem formulário e estilos/tema carregados antes do conteúdo: OK.');
