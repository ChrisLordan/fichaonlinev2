import {specializationLevel,abilityBlockReason,addAbility,syncBaseAbilities,missingAbilityChoices} from '../data/ability-selection.js';
let cached;
export function normalizeAbilitySearch(text){return String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');}
export function matchesAbility(ability,query){return normalizeAbilitySearch(`${ability.nome} ${ability.descricao||''}`).includes(normalizeAbilitySearch(query).trim());}

export async function renderAbilityCatalog(root,sheet,onChange=()=>{}){
  root.textContent='Carregando habilidades…';
  try{
    cached ||= fetch(new URL('../data/abilities.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Não foi possível carregar as habilidades.');return r.json();}).catch(e=>{cached=null;throw e;});
    const catalog=await cached;
    syncBaseAbilities(sheet,catalog);onChange();
    const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
    const style=make('link');style.rel='stylesheet';style.href=new URL('../../../css/ability-notes.css',import.meta.url).href;
    const label=make('label','Pesquisar habilidades','ability-search');const search=make('input');search.type='search';search.placeholder='Digite o nome ou parte da descrição…';search.className='input';label.append(search);
    const lists=make('div');
    const note=make('section',null,'ability-note');note.id=`ability-note-${crypto.randomUUID()}`;note.setAttribute('popover','auto');note.setAttribute('role','dialog');note.setAttribute('aria-label','Nota da habilidade');
    root.replaceChildren(style,label,lists,note);
    let current;
    const close=()=>{if(note.matches(':popover-open'))note.hidePopover();note.hidden=true;if(current)current.setAttribute('aria-expanded','false');current=null;};
    note.hidden=true;
    note.addEventListener('toggle',event=>{if(event.newState==='closed'){if(current)current.setAttribute('aria-expanded','false');current=null;}});
    note.addEventListener('keydown',event=>{if(event.key==='Escape'){const anchor=current;close();anchor?.focus();}});
    function openNote(a,anchor){
      if(current&&current!==anchor)current.setAttribute('aria-expanded','false');current=anchor;
      note.replaceChildren();note.hidden=false;
      const closeButton=make('button','×','ability-note__close');closeButton.type='button';closeButton.setAttribute('aria-label','Fechar nota');closeButton.onclick=close;
      note.append(closeButton,make('h4',a.nome),make('small',`${a.tipo||'Registro anterior'}${a.nivel?` · Nível ${a.nivel}`:''}${a.pagina?` · Livro, p. ${a.pagina}`:''}`),make('p',a.descricao||'Sem descrição.'));
      if(a.requisitos)note.append(make('p',a.requisitos,'text-warning'));
      const owned=sheet.especializacaoDetalhes.habilidades.some(h=>h.catalogId===a.id);
      if(a.tipo==='Escolha'&&a.id){
        const reason=abilityBlockReason(sheet,a),button=make('button',owned?'Remover habilidade':'Adicionar habilidade','btn btn--subtle btn--sm');button.type='button';button.disabled=!owned&&!!reason;
        if(reason&&!owned)note.append(make('p',reason,'text-warning'));
        button.onclick=()=>{if(owned)sheet.especializacaoDetalhes.habilidades=sheet.especializacaoDetalhes.habilidades.filter(h=>h.catalogId!==a.id);else addAbility(sheet,a);close();onChange();renderLists();};
        note.append(button);
      }else if(a.tipo==='Base')note.append(make('small',owned?'Recebida automaticamente.':`Disponível no nível ${a.nivel}.`));
      if(note.showPopover&&!note.matches(':popover-open'))note.showPopover();
      anchor.setAttribute('aria-expanded','true');
      const rect=anchor.getBoundingClientRect(),width=Math.min(360,window.innerWidth-24);note.style.width=`${width}px`;
      const x=rect.right+8+width<=window.innerWidth?rect.right+8:Math.max(12,rect.left-width-8);
      note.style.left=`${Math.min(x,window.innerWidth-width-12)}px`;note.style.top=`${Math.max(12,Math.min(rect.top,window.innerHeight-note.getBoundingClientRect().height-12))}px`;
    }
    function row(a){const wrapper=make('div',null,'ability-name-row'),button=make('button',a.nome||'Sem nome','ability-name');button.type='button';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',note.id);button.setAttribute('aria-expanded','false');
      button.onclick=()=>{if(current===button&&!note.hidden)close();else openNote(a,button);};wrapper.append(button);return wrapper;}
    function renderLists(){
      lists.replaceChildren();
      const names=[...new Set(catalog.map(a=>a.especializacao))].filter(name=>specializationLevel(sheet,name)>0);
      const owned=sheet.especializacaoDetalhes.habilidades||[];
      const mine=owned.filter(a=>(!a.especializacao||names.includes(a.especializacao))&&matchesAbility(a,search.value));
      const ownedPanel=make('section',null,'ability-group');ownedPanel.append(make('h4',`Minhas habilidades (${mine.length})`));
      if(!mine.length)ownedPanel.append(make('p',search.value?'Nenhuma habilidade encontrada.':'Nenhuma habilidade adquirida.','text-soft text-sm'));
      for(const a of mine)ownedPanel.append(row(a));lists.append(ownedPanel);
      for(const name of names){
        const section=make('section',null,'ability-group');section.append(make('h4',`${name} — Catálogo`),make('p',`Aquisição livre de habilidades. O nível é informativo. Clique ou toque no nome para ver a nota e adicionar.`,'text-xs text-soft'));
        const rows=catalog.filter(a=>a.especializacao===name&&!owned.some(h=>h.catalogId===a.id)&&matchesAbility(a,search.value)).sort((a,b)=>(a.nivel??99)-(b.nivel??99)||a.nome.localeCompare(b.nome));
        if(!rows.length)section.append(make('p','Nenhuma habilidade encontrada.','text-soft text-sm'));
        for(const a of rows)section.append(row(a));lists.append(section);
      }
    }
    search.oninput=()=>{close();renderLists();};renderLists();
  }catch(error){root.textContent=error.message;}
}
