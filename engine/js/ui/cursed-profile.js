import {derivar} from '../data/calculos.js';
import {isRestricted} from '../data/resources.js';
import {APTIDOES} from '../data/aptidoes.js';

const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
export function renderCursedProfile(root,char,handlers){
 const css=make('link');css.rel='stylesheet';css.href=new URL('../../../css/cursed-profile.css',import.meta.url).href;
 const nav=make('div',null,'subtabs'),content=make('div');root.replaceChildren(css,nav,content);
 const restricted=isRestricted(char);let active='overview';
 const tabs=[['overview','Perfil Amaldiçoado'],['skills','Habilidades'],['training','Treinamentos']];
 function render(){nav.replaceChildren();for(const [key,label]of tabs){const b=make('button',label,'subtab');b.type='button';b.dataset.profileTab=key;b.setAttribute('aria-current',String(active===key));b.onclick=()=>{active=key;render();};nav.append(b);}content.replaceChildren();
  if(active==='skills')handlers.abilities(content,'especializacao');
  else if(active==='training')handlers.abilities(content,'treinamentos');
  else overview();
 }
 function input(parent,label,object,key,multiline=false){const l=make('label',label,'field'),el=make(multiline?'textarea':'input',null,multiline?'textarea':'input');el.value=object[key]||'';if(multiline)el.rows=4;el.oninput=()=>{object[key]=el.value;handlers.save();};l.append(el);parent.append(l);}
 function panel(title,cls=''){const p=make('section',null,`cursed-panel ${cls}`);p.append(make('h3',title));return p;}
 function overview(){
  const d=derivar(char),grid=make('div',null,'cursed-profile-grid');
  char.tecnica ||= {nome:'',descricao:'',feiticos:[],atributoChave:'presenca'};
  char.estiloMarcial ||= {nome:'',fundamento:'',tecnicas:[]};
  char.aptidoes ||= {aura:0,controle:0,barreira:0,dominio:0,energiaReversa:0,completas:{}};
  delete char.aptidoes.escolhas;
  const t=restricted?char.estiloMarcial:char.tecnica;
  const identity=panel(restricted?'Técnica Marcial':'Técnica Amaldiçoada','cursed-identity');
  input(identity,'Nome da Técnica',t,'nome');input(identity,restricted?'Descrição do Estilo':'Descrição da Técnica',t,restricted?'fundamento':'descricao',true);
  if(!restricted){const label=make('label','Atributo Principal','field'),select=make('select',null,'select');for(const key of ['forca','destreza','constituicao','inteligencia','sabedoria','presenca'])select.add(new Option(key,key));select.value=t.atributoChave||'presenca';select.onchange=()=>{t.atributoChave=select.value;handlers.save();render();};label.append(select);identity.append(label);}
  const techniques=restricted?t.tecnicas||[]:t.feiticos||[];
  const stats=make('div',null,'cursed-profile-stats');
  for(const [label,value] of [[restricted?'Técnicas Marciais':'Feitiços Conhecidos',techniques.length],['CD Técnica',d.cdEspecializacao],...(!restricted?[['CD Amaldiçoada',d.cdAmaldicoado]]:[])]){const item=make('div');item.append(make('small',label),make('strong',String(value)));stats.append(item);}identity.append(stats);grid.append(identity);

  const apt=panel('Aptidões Amaldiçoadas','cursed-aptitudes');
  char.aptidoes.personalizadas ||= [];
  const table=make('div',null,'cursed-custom-aptitudes');
  const header=make('div',null,'cursed-custom-aptitude-row cursed-custom-aptitude-head');
  for(const label of ['Nome','Atual','Máx.','Custo',''])header.append(make('span',label));table.append(header);
  const fieldInput=(value,type,label)=>{const el=make('input');el.type=type;el.value=value??'';el.setAttribute('aria-label',label);return el;};
  char.aptidoes.personalizadas.forEach((entry,index)=>{const row=make('div',null,'cursed-custom-aptitude-row');
   for(const [key,label,type]of [['nome','Nome','text'],['atual','Atual','number'],['maximo','Máximo','number'],['custo','Custo','text']]){const el=fieldInput(entry[key],type,`${label} da aptidão ${index+1}`);if(type==='number')el.min='0';el.oninput=()=>{entry[key]=type==='number'?(el.value===''?'':Number(el.value)):el.value;handlers.save();};row.append(el);}
   const remove=make('button','×','btn btn--subtle btn--sm');remove.type='button';remove.setAttribute('aria-label',`Remover aptidão ${index+1}`);remove.onclick=()=>{char.aptidoes.personalizadas.splice(index,1);handlers.save();render();};row.append(remove);table.append(row);
  });
  const add=make('button','+ Adicionar aptidão','btn btn--subtle btn--sm');add.type='button';add.onclick=()=>{char.aptidoes.personalizadas.push({nome:'',atual:0,maximo:0,custo:''});handlers.save();render();};apt.append(table,add);grid.append(apt);

  const list=panel(restricted?'Lista de Artes Marciais':'Lista de Feitiço','cursed-spells');
  function openSpellModal(spell=null,index=-1){
   const overlay=make('div',null,'cursed-spell-modal-backdrop'),dialog=make('section',null,'cursed-spell-modal');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','cursed-spell-modal-title');
   const title=make('h2',spell?'Editar Feitiço':'Adicionar Feitiço');title.id='cursed-spell-modal-title';dialog.append(title);
   const nameWrap=make('label','Nome','field'),name=make('input');name.type='text';name.value=spell?.nome||'';name.placeholder='Nome do feitiço';name.required=true;nameWrap.append(name);
   const descriptionWrap=make('label','Descrição','field'),description=make('textarea');description.rows=6;description.value=spell?.descricao||'';description.placeholder='Descrição do feitiço';descriptionWrap.append(description);
   const levelWrap=make('label','Nível','field'),level=make('select');for(let n=0;n<=5;n++)level.add(new Option('Nível '+n,String(n)));level.value=String(spell?.nivel??1);levelWrap.append(level);
   let onKey;const close=()=>{overlay.remove();document.removeEventListener('keydown',onKey);};
   const actions=make('div',null,'cursed-spell-modal-actions'),cancel=make('button','Cancelar','btn btn--subtle'),save=make('button','Salvar Feitiço','btn btn--primary');cancel.type=save.type='button';cancel.onclick=close;save.onclick=()=>{if(!name.value.trim()){name.focus();return;}const target=spell||{};target.nome=name.value.trim();target.descricao=description.value;target.nivel=Number(level.value);if(!spell){char.tecnica.feiticos ||= [];char.tecnica.feiticos.push(target);}handlers.save();close();render();};
   actions.append(cancel,save);
   if(spell){const remove=make('button','Remover Feitiço','btn btn--danger');remove.type='button';remove.onclick=()=>{char.tecnica.feiticos.splice(index,1);handlers.save();close();render();};actions.append(remove);}
   dialog.append(nameWrap,descriptionWrap,levelWrap,actions);overlay.append(dialog);content.append(overlay);overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
   onKey=event=>{if(event.key==='Escape')close();};document.addEventListener('keydown',onKey);name.focus();
  }
  if(!restricted){const addSpell=make('button','+ Adicionar feitiço','btn btn--subtle btn--sm');addSpell.type='button';addSpell.onclick=()=>openSpellModal();list.append(addSpell);}
  const rows=make('div',null,'cursed-spell-levels');
  for(let level=0;level<=5;level++){const group=make('section');group.append(make('h4',restricted?'Arte Marcial Nível '+level:'Feitiços Nível '+level));const found=techniques.map((item,index)=>({item,index})).filter(({item})=>Number(item.nivel||0)===level);if(!found.length)group.append(make('p','—','text-xs text-mute'));for(const {item:technique,index} of found){const note=make('details',null,'cursed-spell-note'),summary=make('summary',technique.nome||'Sem nome');note.append(summary);
    if(restricted)note.append(make('p',technique.descricao||'Sem descrição.'));
    else summary.onclick=event=>{event.preventDefault();openSpellModal(technique,index);};
    group.append(note);
   }rows.append(group);}list.append(rows);grid.append(list);  const aptLevels=panel('Níveis de Aptidão','cursed-aptitude-levels-panel'),levels=make('div',null,'cursed-aptitude-levels');
  for(const a of APTIDOES){const item=make('label',null,'cursed-aptitude-item'),inputLevel=make('input');inputLevel.type='number';inputLevel.min='0';inputLevel.step='1';inputLevel.value=char.aptidoes[a.id]||0;inputLevel.setAttribute('aria-label',`Nível de ${a.nome}`);inputLevel.onchange=()=>{char.aptidoes[a.id]=Math.max(0,Math.floor(Number(inputLevel.value)||0));handlers.save();};item.append(inputLevel,make('small',a.nome));levels.append(item);}aptLevels.append(levels);grid.append(aptLevels);

  if(!restricted){char.tecnica.expansaoDominio ||= {nome:'',tipo:'',descricao:''};const domain=panel('Expansão de Domínio','cursed-domain');input(domain,'Nome da Expansão',char.tecnica.expansaoDominio,'nome');input(domain,'Tipo de Expansão',char.tecnica.expansaoDominio,'tipo');input(domain,'Descrição da Expansão',char.tecnica.expansaoDominio,'descricao',true);grid.append(domain);
   char.tecnica.tecnicaMaxima ||= {nome:'',descricao:''};const maximum=panel('Técnica Máxima','cursed-maximum');input(maximum,'Nome da Técnica',char.tecnica.tecnicaMaxima,'nome');input(maximum,'Descrição da Técnica Máxima',char.tecnica.tecnicaMaxima,'descricao',true);grid.append(maximum);
  }
  content.append(make('h2','Perfil Amaldiçoado','cursed-profile-title'),grid);
 }
 render();
}
