import assert from 'node:assert/strict';
import {hexToHsv,hsvToHex,paletteFromColor} from '../js/color-picker.js';
import {THEME_COLORS} from '../js/theme-palette.js';
for(const c of ['#ff0000','#00ff00','#0000ff','#ffffff','#000000','#dc172c','#0091ff'])assert.equal(hsvToHex(hexToHsv(c)),c);
const palette=paletteFromColor('#0091ff');assert.equal(Object.keys(palette).length,THEME_COLORS.length);assert.equal(palette['#dc172c'],'#0091ff');for(const value of Object.values(palette))assert.match(value,/^#[0-9a-f]{6}$/);
assert.ok(hexToHsv(palette['#09090b']).v<0.06);assert.ok(hexToHsv(palette['#f5f5f5']).v>0.9);
console.log('Seletor: conversões RGB/HSV, paleta completa e hierarquia de luminosidade OK.');
