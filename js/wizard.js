// O editor completo continua disponível para fichas existentes.
export function setupWizard(form) {
  if(new URLSearchParams(location.search).has('id'))return;
  const groups=[['Informações básicas',['general']],['Origem',['origin']],['Especialização',['specialization']],['Atributos',['attributes']],['Escolhas adicionais',['personal','technique','talents','inventory']],['Revisão',['values','notes']]];
  let step=0;
  const toolbar=document.createElement('div');toolbar.className='wizard-toolbar';
  const back=document.createElement('button'),next=document.createElement('button'),title=document.createElement('strong');
  for(const b of [back,next]){b.type='button';b.className='button';}back.textContent='← Voltar';
  toolbar.append(back,title,next);form.before(toolbar);
  function render(){title.textContent=`${step+1} / ${groups.length} — ${groups[step][0]}`;back.disabled=step===0;next.textContent=step===groups.length-1?'Salvar e abrir ficha':'Continuar →';form.querySelectorAll('.editor-section').forEach(section=>{section.classList.toggle('wizard-hidden',!groups[step][1].includes(section.dataset.section));});}
  back.onclick=()=>{step--;render();};next.onclick=()=>{if(step<groups.length-1){step++;render();return;}document.querySelector('#save').click();const id=new URLSearchParams(location.search).get('id');if(id&&!document.querySelector('#save-state').textContent.startsWith('Erro'))location.href=`ficha.html?id=${encodeURIComponent(id)}`;};render();
}
