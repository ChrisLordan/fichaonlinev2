import {derivar,formatMod} from '../data/calculos.js';
import {isRestricted} from '../data/resources.js';
const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
export function renderCursedProfile(root,char,handlers){
 const css=make('link');css.rel='stylesheet';css.href=new URL('../../../css/cursed-profile.css',import.meta.url).href;
 const nav=make('div',null,'subtabs'),content=make('div');root.replaceChildren(css,nav,content);
 const restricted=isRestricted(char);let active='overview';
 const tabs=[['overview','Visão geral'],['technique',restricted?'Estilo e Técnicas Marciais':'Técnica e Feitiços'],['aptitudes',restricted?'Dádivas do Céu':'Aptidões'],['skills','Habilidades'],['training','Treinamentos']];
 function render(){nav.replaceChildren();for(const [key,label]of tabs){const b=make('button',label,'subtab');b.type='button';b.dataset.profileTab=key;b.setAttribute('aria-current',String(active===key));b.onclick=()=>{active=key;render();};nav.append(b);}content.replaceChildren();
  if(active==='technique')handlers.technique(content);
  else if(active==='aptitudes')handlers.abilities(content,'aptidoes');
  else if(active==='skills')handlers.abilities(content,'especializacao');
  else if(active==='training')handlers.abilities(content,'treinamentos');
  else overview();
 }
 function field(parent,label,object,key,multiline=false){const l=make('label',label,'field'),input=make(multiline?'textarea':'input',null,multiline?'textarea':'input');input.value=object[key]||'';if(multiline)input.rows=4;input.oninput=()=>{object[key]=input.value;handlers.save();};l.append(input);parent.append(l);}
 function panel(title,cls=''){const p=make('section',null,`cursed-panel ${cls}`);p.append(make('h3',title));return p;}
 function overview(){
  const d=derivar(char),grid=make('div',null,'cursed-profile-grid');
  char.tecnica ||= {nome:'',descricao:'',feiticos:[],atributoChave:'presenca'};
  char.estiloMarcial ||= {nome:'',fundamento:'',tecnicas:[]};
  const t=restricted?char.estiloMarcial:char.tecnica;
  const identity=panel(restricted?'Estilo Marcial':'Técnica Amaldiçoada','cursed-identity');field(identity,'Nome',t,'nome');field(identity,restricted?'Fundamento Marcial':'Funcionamento básico',t,restricted?'fundamento':'descricao',true);
  if(!restricted){const label=make('label','Atributo principal','field'),select=make('select',null,'select');for(const key of ['forca','destreza','constituicao','inteligencia','sabedoria','presenca'])select.add(new Option(key,key));select.value=t.atributoChave;select.onchange=()=>{t.atributoChave=select.value;handlers.save();render();};label.append(select);identity.append(label);}
  const spells=restricted?t.tecnicas||[]:t.feiticos||[];
  const stats=make('div',null,'cursed-profile-stats');for(const [label,value]of [['Conhecidos',spells.length],['CD de Especialização',d.cdEspecializacao],...(!restricted?[['CD Amaldiçoada',d.cdAmaldicoado]]:[])]){const item=make('div');item.append(make('small',label),make('strong',String(value)));stats.append(item);}identity.append(stats);grid.append(identity);
  const list=panel(restricted?'Técnicas Marciais':'Feitiços conhecidos','cursed-spells');const levels=make('div',null,'cursed-spell-levels');
  for(let level=restricted?1:0;level<=(restricted?4:5);level++){const group=make('section');group.append(make('h4',`Nível ${level}`));const rows=spells.filter(s=>Number(s.nivel||0)===level);if(!rows.length)group.append(make('p','Nenhum registro.','text-xs text-mute'));for(const spell of rows){const note=make('details',null,'cursed-spell-note');note.append(make('summary',spell.nome||'Sem nome'),make('p',spell.descricao||'Sem descrição.'));group.append(note);}levels.append(group);}list.append(levels);
  const manage=make('button',restricted?'Gerenciar técnicas marciais':'Gerenciar feitiços','btn btn--subtle');manage.onclick=()=>{active='technique';render();};list.append(manage);grid.append(list);
  const apt=panel(restricted?'Dádivas do Céu':'Níveis de Aptidão','cursed-aptitudes');
  if(restricted){const gifts=char.dadivas||[];apt.append(make('p',gifts.join(' · ')||'Nenhuma dádiva selecionada.'));}
  else{const levels=make('div',null,'cursed-aptitude-levels');for(const [key,label]of [['aura','Aura'],['controle','Controle e Leitura'],['barreira','Barreiras'],['dominio','Domínio'],['energiaReversa','Energia Reversa']]){const item=make('div');item.append(make('strong',String(char.aptidoes?.[key]||0)),make('small',label));levels.append(item);}apt.append(levels);}
  const edit=make('button',restricted?'Gerenciar dádivas':'Gerenciar aptidões','btn btn--subtle');edit.onclick=()=>{active='aptitudes';render();};apt.append(edit);grid.append(apt);
  if(!restricted){char.tecnica.expansaoDominio ||= {nome:'',tipo:'',descricao:''};const domain=panel('Expansão de Domínio','cursed-domain');field(domain,'Nome',char.tecnica.expansaoDominio,'nome');field(domain,'Tipo',char.tecnica.expansaoDominio,'tipo');field(domain,'Descrição',char.tecnica.expansaoDominio,'descricao',true);grid.append(domain);
   char.tecnica.tecnicaMaxima ||= {nome:'',descricao:''};const maximum=panel('Técnica Máxima','cursed-maximum');field(maximum,'Nome',char.tecnica.tecnicaMaxima,'nome');field(maximum,'Descrição',char.tecnica.tecnicaMaxima,'descricao',true);grid.append(maximum);
  }
  content.append(grid);
 }
 render();
}
