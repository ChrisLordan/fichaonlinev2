import {modificador,bonusTreinamento} from '../data/calculos.js';
import {isRestricted} from '../data/resources.js';
export function renderAttackChecks(root,char,save){
 char.testesAcerto ||= {};
 const section=document.createElement('section');section.className='card visao-card visao-checks-card';const heading=document.createElement('h3');heading.textContent='Jogadas de Ataque';section.append(heading);
 for(const [id,name,attribute]of [['corpo','Corpo a corpo','forca'],['distancia','À distância','destreza'],['amaldicoado','Amaldiçoado',char.tecnica?.atributoChave||'presenca']]){
  if(id==='amaldicoado'&&isRestricted(char))continue;
  const item=char.testesAcerto[id] ||= {atributo:attribute,treinado:id==='amaldicoado'};
  const row=document.createElement('div');row.className='row';const button=document.createElement('button');button.type='button';button.className='roll-trigger';
  const select=document.createElement('select');select.className='select';select.setAttribute('aria-label',`Atributo do acerto ${name}`);
  for(const key of id==='corpo'?['forca','destreza']:id==='distancia'?['destreza']:Object.keys(char.atributos))select.add(new Option(key,key));select.value=item.atributo;
  const label=document.createElement('label');label.className='check';const training=document.createElement('input');training.type='checkbox';training.checked=item.treinado;training.disabled=id==='amaldicoado';label.append(training,'Treinado');
  function update(){const total=modificador(char.atributos[item.atributo])+Math.floor(char.identificacao.nivel/2)+(item.treinado?bonusTreinamento(char.identificacao.nivel):0);button.textContent=`${name} ${total>=0?'+':''}${total} ⚄`;button.dataset.rollName=`Acerto ${name}`;button.dataset.rollBonus=total;}
  select.onchange=()=>{item.atributo=select.value;update();save();};training.onchange=()=>{item.treinado=training.checked;update();save();};update();row.append(button,select,label);section.append(row);
 }
 const source=document.createElement('small');source.textContent='1d20 + atributo + metade do nível + treinamento (se aplicável). Marque Treinado conforme a arma utilizada.';section.append(source);root.append(section);
}
