import assert from 'node:assert/strict';
import { emptySheet } from '../js/storage.js';
import { calculateController, calculateSpecialization, applyAutomation } from '../js/automation.js';
const sheet=emptySheet();sheet.specialization.name='Controlador';sheet.attributes.values.constituicao=14;sheet.attributes.values.sabedoria=16;sheet.automation={enabled:true,techniqueAttribute:'sabedoria'};
assert.equal(calculateController(sheet).hp,12);assert.equal(calculateController(sheet).energy,8);
sheet.information.level=5;assert.equal(calculateController(sheet).hp,40);assert.equal(calculateController(sheet).energy,28);
sheet.resources.hpCurrent=100;applyAutomation(sheet);assert.equal(sheet.resources.hpCurrent,40);
const before=structuredClone(sheet);applyAutomation(sheet);assert.deepEqual(sheet,before);
sheet.attributes.values.constituicao=16;assert.equal(calculateController(sheet).hp,45);
sheet.automation.techniqueAttribute='';assert.equal(calculateController(sheet).energy,null);
sheet.information.level=21;assert.throws(()=>calculateController(sheet));
console.log('Controlador: PV, PE pelo atributo da técnica, progressão fixa, limites e idempotência OK.');
const cases=[['Lutador',12,6,4,0],['Especialista em Combate',12,6,4,0],['Especialista em Técnica',10,5,6,3],['Controlador',10,5,5,3],['Suporte',10,5,5,3],['Restringido',16,7,0,0]];
for(const [name,initial,gain,energy,bonus]of cases){
  for(let level=1;level<=20;level++){
    const s=emptySheet();s.specialization.name=name;s.information.level=level;s.attributes.values.constituicao=14;s.attributes.values.sabedoria=16;s.automation={enabled:true,techniqueAttribute:'sabedoria'};
    const r=calculateSpecialization(s);
    assert.equal(r.hp,initial+2+(level-1)*(gain+2));assert.equal(r.energy,energy*level+bonus);assert.equal(r.stamina,name==='Restringido'?4*level:0);
    applyAutomation(s);const snapshot=structuredClone(s);applyAutomation(s);assert.deepEqual(s,snapshot);
    s.attributes.values.constituicao=16;assert.equal(calculateSpecialization(s).hp,r.hp+level);
  }
}
const changing=emptySheet();changing.automation={enabled:true,techniqueAttribute:'sabedoria'};changing.specialization.name='Restringido';applyAutomation(changing);assert.equal(changing.resources.staminaMax,4);changing.specialization.name='Lutador';applyAutomation(changing);assert.equal(changing.resources.staminaMax,0);assert.equal(changing.resources.energyMax,4);
console.log('Seis especializações × níveis 1–20, Constituição, PE, Estamina, troca e idempotência: OK.');
