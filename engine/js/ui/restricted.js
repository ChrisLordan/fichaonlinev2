let data;
const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
async function load(){return data ||= fetch(new URL('../data/restricted-training.json?v=20261115-training-2',import.meta.url)).then(r=>r.json());}
export function renderMartial(root,char,save){
 char.estiloMarcial ||= {nome:'',fundamento:'',tecnicas:[]};const m=char.estiloMarcial,nivel=char.identificacao.nivel;
 const maxLevel=nivel>=15?4:nivel>=9?3:nivel>=5?2:1,limit=2+Math.floor((nivel-1)/2),cost={1:2,2:5,3:8,4:12};
 function field(parent,label,key,obj,multiline=false){const l=make('label',label,'field'),input=make(multiline?'textarea':'input',null,multiline?'textarea':'input');input.value=obj[key]||'';if(multiline)input.rows=4;input.oninput=()=>{obj[key]=input.value;save();};l.append(input);parent.append(l);}
 function render(){root.replaceChildren(make('h3','Estilo e Técnicas Marciais'),make('p',`${m.tecnicas.length}/${limit} técnicas; acesso até nível ${maxLevel}.`,'text-soft'));field(root,'Nome do Estilo','nome',m);field(root,'Fundamento Marcial','fundamento',m,true);
 m.tecnicas.forEach((t,index)=>{const card=make('section',null,'card');field(card,'Nome da técnica','nome',t);const label=make('label','Nível','field'),select=make('select',null,'select');for(let level=1;level<=Math.max(maxLevel,Number(t.nivel));level++){const option=new Option(`Nível ${level} — ${cost[level]} Estamina`,level);option.disabled=level>maxLevel;select.add(option);}select.value=t.nivel;select.onchange=()=>{t.nivel=Number(select.value);t.custo=cost[t.nivel];save();};label.append(select);card.append(label);field(card,'Descrição e efeitos (confirme com o Narrador)','descricao',t,true);const remove=make('button','Remover técnica','btn btn--danger');remove.onclick=()=>{m.tecnicas.splice(index,1);save();render();};card.append(remove);root.append(card);});
 const add=make('button','Adicionar Técnica Marcial','btn btn--primary');add.disabled=m.tecnicas.length>=limit;add.onclick=()=>{m.tecnicas.push({nome:'',nivel:1,custo:2,descricao:''});save();render();};root.append(add);
 }render();
}
export async function renderGifts(root,char,save){root.textContent='Carregando Dádivas do Céu…';const {gifts}=await load();char.dadivas ||= [];const limit=Math.floor(char.identificacao.nivel/4)+(char.treinamentos?.potencialFisico?.[3]?1:0);
 function render(){root.replaceChildren(make('h3','Dádivas do Céu'),make('p',`${char.dadivas.length}/${limit} dádivas.`));for(const gift of gifts){const panel=make('details',null,'ability-entry');panel.append(make('summary',gift.nome),make('p',gift.descricao));const selected=char.dadivas.includes(gift.id),button=make('button',selected?'Remover':'Selecionar','btn btn--subtle');button.disabled=!selected&&char.dadivas.length>=limit;button.onclick=()=>{char.dadivas=selected?char.dadivas.filter(id=>id!==gift.id):[...char.dadivas,gift.id];save();render();};panel.append(button);root.append(panel);}}render();
}
export async function renderTraining(root,char,save){
 root.textContent='Carregando treinamentos…';const {trainings}=await load();char.treinamentos ||= {};
 const css=make('link');css.rel='stylesheet';css.href=new URL('../../../css/training-grid.css',import.meta.url).href;
 const title=make('h3','TREINAMENTOS','training-title'),grid=make('div',null,'training-grid');root.replaceChildren(css,title,grid);
 for(const training of trainings){
  char.treinamentos[training.id] ||= [false,false,false,false,false];const values=char.treinamentos[training.id];
  const panel=make('section',null,'training-card');panel.setAttribute('aria-label',training.nome);panel.append(make('h4',training.nome));
  const completed=make('strong','Treinamento Completo','training-complete');
  const update=()=>{const complete=!!values[4]||values.slice(0,4).every(Boolean);panel.classList.toggle('is-complete',complete);completed.setAttribute('aria-label',complete?'Treinamento completo':'Benefício de treinamento completo');};
  for(let i=0;i<4;i++){
   const row=make('div',null,'training-stage'),note=make('details',null,'training-stage-note');note.append(make('summary',`${i+1}ª Etapa`));
   const stage=training.etapas?.[i];if(stage)note.append(make('p',`Focos: ${stage.focos}\nRequisitos: ${stage.requisitos}\n${stage.beneficio}`));
   const label=make('label',null,'training-stage-check'),check=make('input');check.type='checkbox';check.checked=!!values[i];check.setAttribute('aria-label',`${training.nome} — ${i+1}ª etapa`);
   check.onchange=()=>{values[i]=check.checked;values[4]=values.slice(0,4).every(Boolean);update();save();};
   label.append(check);row.append(note,label);panel.append(row);
  }
  panel.append(completed,make('p',training.completo?.replace(/\s+/g,' ').trim()||'Consulte o benefício no livro.','training-benefit'));update();grid.append(panel);
 }
}
