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
  char.aptidoes.escolhas ||= {};
  const t=restricted?char.estiloMarcial:char.tecnica;
  const identity=panel(restricted?'Técnica Marcial':'Técnica Amaldiçoada','cursed-identity');
  input(identity,'Nome da Técnica',t,'nome');input(identity,restricted?'Descrição do Estilo':'Descrição da Técnica',t,restricted?'fundamento':'descricao',true);
  if(!restricted){const label=make('label','Atributo Principal','field'),select=make('select',null,'select');for(const key of ['forca','destreza','constituicao','inteligencia','sabedoria','presenca'])select.add(new Option(key,key));select.value=t.atributoChave||'presenca';select.onchange=()=>{t.atributoChave=select.value;handlers.save();render();};label.append(select);identity.append(label);}
  const techniques=restricted?t.tecnicas||[]:t.feiticos||[];
  const stats=make('div',null,'cursed-profile-stats');
  for(const [label,value] of [['Feitiços Conhecidos',techniques.length],['CD Técnica',d.cdEspecializacao],...(!restricted?[['CD Amaldiçoada',d.cdAmaldicoado]]:[])]){const item=make('div');item.append(make('small',label),make('strong',String(value)));stats.append(item);}identity.append(stats);grid.append(identity);

  const apt=panel('Aptidões Amaldiçoadas','cursed-aptitudes');
  const choices=make('div',null,'cursed-aptitude-choices');
  const charLevel=Math.max(1,Number(char.identificacao?.nivel)||1);
  for(let level=1;level<=charLevel;level++){const row=make('label',`Nível ${level}`,'field'),select=make('select',null,'select');select.add(new Option('Selecione uma aptidão',''));for(const a of APTIDOES)select.add(new Option(a.nome,a.id));select.value=char.aptidoes.escolhas[level]||'';select.onchange=()=>{if(select.value)char.aptidoes.escolhas[level]=select.value;else delete char.aptidoes.escolhas[level];handlers.save();};row.append(select);choices.append(row);}apt.append(choices);
  const levels=make('div',null,'cursed-aptitude-levels');
  for(const a of APTIDOES){const item=make('label',null,'cursed-aptitude-item'),inputLevel=make('input');inputLevel.type='number';inputLevel.min='0';inputLevel.step='1';inputLevel.value=char.aptidoes[a.id]||0;inputLevel.setAttribute('aria-label',`Nível de ${a.nome}`);inputLevel.onchange=()=>{char.aptidoes[a.id]=Math.max(0,Math.floor(Number(inputLevel.value)||0));handlers.save();};item.append(inputLevel,make('small',a.nome));levels.append(item);}apt.append(levels);grid.append(apt);

  const list=panel(restricted?'Lista de Artes Marciais':'Feitiços Conhecidos','cursed-spells');const rows=make('div',null,'cursed-spell-levels');
  for(let level=restricted?0:0;level<=(restricted?5:5);level++){const group=make('section');group.append(make('h4',restricted?`Arte Marcial Nível ${level}`:`Nível ${level}`));const found=techniques.filter(x=>Number(x.nivel||0)===level);if(!found.length)group.append(make('p','—','text-xs text-mute'));for(const technique of found){const note=make('details',null,'cursed-spell-note');note.append(make('summary',technique.nome||'Sem nome'),make('p',technique.descricao||'Sem descrição.'));group.append(note);}rows.append(group);}list.append(rows);grid.append(list);

  if(!restricted){char.tecnica.expansaoDominio ||= {nome:'',tipo:'',descricao:''};const domain=panel('Expansão de Domínio','cursed-domain');input(domain,'Nome da Expansão',char.tecnica.expansaoDominio,'nome');input(domain,'Tipo de Expansão',char.tecnica.expansaoDominio,'tipo');input(domain,'Descrição da Expansão',char.tecnica.expansaoDominio,'descricao',true);grid.append(domain);
   char.tecnica.tecnicaMaxima ||= {nome:'',descricao:''};const maximum=panel('Técnica Máxima','cursed-maximum');input(maximum,'Nome da Técnica',char.tecnica.tecnicaMaxima,'nome');input(maximum,'Descrição da Técnica Máxima',char.tecnica.tecnicaMaxima,'descricao',true);grid.append(maximum);
  }
  content.append(grid);
 }
 render();
}
