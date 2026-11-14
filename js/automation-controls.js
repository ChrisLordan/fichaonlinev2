import { calculateSpecialization, applyAutomation, SPECIALIZATIONS } from './automation.js';
import { ATTRIBUTE_LABELS } from './rules.js';

export function setupAutomation(form, sheet) {
  const panel = document.createElement('div'); panel.className='rule-note';
  const title = document.createElement('h3'); title.textContent='Recursos de Especialização';
  const label = document.createElement('label');
  const enable = document.createElement('input'); enable.type='checkbox';enable.checked=sheet.automation?.enabled!==false;enable.style.width='auto';
  label.append(enable, ' Calcular recursos automaticamente — progressão fixa de PV');
  const attrLabel = document.createElement('label');attrLabel.textContent=' Atributo da técnica para PE: ';
  const select = document.createElement('select');select.add(new Option('Selecione o atributo da sua técnica',''));
  for(const [key,name] of Object.entries(ATTRIBUTE_LABELS))select.add(new Option(name,key));
  select.value=sheet.automation?.techniqueAttribute||'';attrLabel.append(select);
  const summary=document.createElement('p');panel.append(title,label,document.createElement('br'),attrLabel,summary);
  form.querySelector('[data-section="specialization"]').append(panel);
  function refresh(){
    // Captura os campos de que o cálculo depende também nos eventos change.
    sheet.specialization.name=form.elements.specialization.value;
    sheet.information.level=Number(form.elements.level.value);
    if(!Number.isInteger(sheet.information.level)||sheet.information.level<1||sheet.information.level>20)return;
    const spec=SPECIALIZATIONS[form.elements.specialization.value];
    panel.hidden=!spec;
    attrLabel.hidden=!spec?.technique;
    title.textContent=spec?`${form.elements.specialization.value} — p. ${spec.page}`:'Recursos de Especialização';
    sheet.automation={...sheet.automation,enabled:enable.checked,techniqueAttribute:select.value};
    applyAutomation(sheet);
    const result=calculateSpecialization(sheet);
    for(const name of ['hpMax','energyMax','staminaMax']){
      const controlled=enable.checked&&!!result&&(name!=='energyMax'||result.energy!==null);
      form.elements[name].readOnly=controlled;
      if(controlled)form.elements[name].value=sheet.resources[name];
    }
    if(enable.checked&&result){for(const name of ['hpCurrent','energyCurrent','staminaCurrent'])form.elements[name].value=sheet.resources[name];form.elements.hitDice.value=result.hitDice;}
    for(const name of ['energyMax','energyCurrent'])form.elements[name].closest('label').hidden=!!spec?.stamina;
    for(const name of ['staminaMax','staminaCurrent'])form.elements[name].closest('label').hidden=!spec?.stamina;
    form.elements.hitDice.readOnly=true;
    summary.textContent=result?`${result.hitDice}; PV máximo: ${result.hp}. Progressão: ${spec.fixed} + modificador de Constituição por nível subsequente. ${spec.stamina?`Estamina máxima: ${result.stamina}.`:result.energy===null?'Selecione o atributo da técnica para calcular PE.':`PE máximo: ${result.energy}.`} Valores-base; efeitos adicionais de habilidades ainda precisam de revisão.`:'';
  }
  for(const event of ['input','change'])form.addEventListener(event,()=>{refresh();window.dispatchEvent(new Event('specialization-recalculated'));});
  enable.addEventListener('change',()=>{refresh();form.dispatchEvent(new Event('input',{bubbles:true}));});
  select.addEventListener('change',()=>{refresh();form.dispatchEvent(new Event('input',{bubbles:true}));});
  refresh();
  window.dispatchEvent(new Event('specialization-recalculated'));
}
