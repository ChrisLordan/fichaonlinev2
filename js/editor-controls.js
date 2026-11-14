import { clampResource } from './validation.js';

export function setupEditorControls(form) {
  const level = form.elements.level;
  level.min = '1'; level.max = '20'; level.step = '1';
  const wrapper = document.createElement('div');
  wrapper.className = 'level-control';
  level.before(wrapper);
  const minus = document.createElement('button'), plus = document.createElement('button');
  for (const button of [minus, plus]) { button.type = 'button'; button.className = 'button'; }
  minus.textContent = '−'; plus.textContent = '+';
  minus.setAttribute('aria-label', 'Diminuir nível'); plus.setAttribute('aria-label', 'Aumentar nível');
  wrapper.append(minus, level, plus);
  const notice = document.createElement('small'); notice.className = 'warning'; notice.setAttribute('role', 'status');
  wrapper.after(notice);
  function refresh() {
    const n = Number(level.value);
    const valid = Number.isInteger(n) && n >= 1 && n <= 20;
    level.setCustomValidity(valid ? '' : 'Escolha um nível inteiro de 1 a 20.');
    notice.textContent = valid ? '' : 'Escolha um nível inteiro de 1 a 20 para salvar.';
    minus.disabled = n <= 1; plus.disabled = n >= 20;
  }
  minus.onclick = () => { level.value = Math.max(1, Number(level.value) - 1); level.dispatchEvent(new Event('input', { bubbles: true })); };
  plus.onclick = () => { level.value = Math.min(20, Number(level.value) + 1); level.dispatchEvent(new Event('input', { bubbles: true })); };
  form.addEventListener('input', refresh); refresh();

  const panels = [];
  for (const section of form.querySelectorAll('.editor-section')) {
    const title = section.querySelector('h2');
    const content = document.createElement('div'); content.className = 'accordion-content';
    content.id = `panel-${section.dataset.section}`;
    const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'accordion-toggle';
    toggle.setAttribute('aria-controls', content.id); toggle.setAttribute('aria-expanded', 'false');
    const caption = document.createElement('span'); caption.textContent = title.textContent;
    const summary = document.createElement('small');
    toggle.append(caption, summary); title.remove();
    content.append(...section.childNodes); section.append(toggle, content);
    content.hidden = true;
    const open = (value) => { content.hidden = !value; toggle.setAttribute('aria-expanded', String(value)); };
    toggle.onclick = () => open(content.hidden);
    const update = () => {
      const fields = [...content.querySelectorAll('input:not([type=file]),select,textarea')];
      summary.textContent = `${fields.filter(f => f.value.trim()).length} de ${fields.length} campos preenchidos`;
    };
    form.addEventListener('input', update); form.addEventListener('change', update); update();
    panels.push({ section, open });
  }
  const collapse = document.createElement('button'); collapse.type = 'button'; collapse.className = 'button collapse-all';
  collapse.textContent = 'Recolher tudo'; collapse.onclick = () => panels.forEach(p => p.open(false)); form.before(collapse);
  document.querySelectorAll('#editor-nav button').forEach(button => {
    button.onclick = () => {
      const panel = panels.find(p => p.section.dataset.section === button.dataset.section);
      panel.open(true); panel.section.scrollIntoView({ block: 'start' });
    };
  });
  form.addEventListener('input', () => {
    for (const resource of ['hp', 'energy', 'stamina']) {
      const current = form.elements[`${resource}Current`], max = form.elements[`${resource}Max`];
      current.max = Math.max(0, Number(max.value) || 0);
      current.value = clampResource(current.value, max.value);
    }
  }, true);
}
