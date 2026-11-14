import { createEmpty as sourceEmpty } from './legacy-schema.js';
import { validateLevel } from '../../../js/validation.js';
const KEY='jujutsu-rpg-sheets-v1';
function read(){const data=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(data))throw Error('Armazenamento inválido');return data;}
export function createEmpty(){const c=sourceEmpty();c.id=crypto.randomUUID();c.ataques=[];return c;}
export function fromLegacy(s){
 if(s.referenceData)return structuredClone(s.referenceData);
 const c=createEmpty(),i=s.information||{},r=s.resources||{};c.id=s.id;
 Object.assign(c.identificacao,{nome:i.name||'',nivel:i.level||1,origem:s.origin?.name||'',especializacao:s.specialization?.name||'',grau:i.grade||'',especializacoes:s.specialization?.name?[{id:s.specialization.name,nivel:i.level||1}]:[]});
 for(const k of Object.keys(c.atributos))c.atributos[k]=Number(s.attributes?.values?.[k]??10)+Number(s.attributes?.bonuses?.[k]||0);
 c.aparencia.imagemBase64=i.avatar||'';c.aparencia.idade=i.age||'';
 for(const [a,b]of [['hpMax','pvMax'],['hpCurrent','pvAtual'],['energyMax','peMax'],['energyCurrent','peAtual'],['staminaMax','estaminaMax'],['staminaCurrent','estaminaAtual']])c.pontos[b]=Number(r[a]||0);
 c.aspectos={personalidade:s.personal?.personality||'',ideais:s.personal?.ideals||'',ligacoes:s.personal?.bonds||'',complicacoes:s.personal?.complications||'',dominioInato:s.personal?.domain||''};
 c.tecnica.nome=s.technique?.name||'';c.tecnica.descricao=s.technique?.description||'';c.defesa.outros=Number(r.defenseBonus||0);c.anotacoes.anotacoes=s.notes||'';
 c.tecnica.feiticos=(s.spells||[]).map(row=>({nome:row[0],descricao:row.slice(1).join(' · ')}));c.talentos=(s.talents||[]).map(row=>({nome:row[0],descricao:row.slice(1).join(' · ')}));c.inventario.itens=(s.inventory||[]).map(row=>({nome:row[0],descricao:row.slice(1).join(' · '),quantidade:1,espacos:0}));
 c.legacySnapshot=structuredClone(s);return c;
}
export function getChar(id){const s=read().find(s=>s.id===id);return s?fromLegacy(s):null;}
export function listChars(){return read().map(s=>{const c=fromLegacy(s),i=c.identificacao;return{id:s.id,nome:i.nome,nivel:i.nivel,origem:i.origem,especializacao:i.especializacao,updatedAt:new Date(s.updatedAt||Date.now()).getTime()};});}
export function saveChar(c){validateLevel(c.identificacao?.nivel);c.id ||= crypto.randomUUID();c.updatedAt=Date.now();const all=read(),index=all.findIndex(s=>s.id===c.id),prior=index>=0?all[index]:{};const entry={...prior,id:c.id,schemaVersion:2,system:'Feiticeiros & Maldições',rulesVersion:'2.5.2',createdAt:prior.createdAt||new Date().toISOString(),updatedAt:new Date(c.updatedAt).toISOString(),information:{...prior.information,name:c.identificacao.nome,level:c.identificacao.nivel,grade:c.identificacao.grau,avatar:c.aparencia?.imagemBase64||''},origin:{...prior.origin,name:c.identificacao.origem},specialization:{...prior.specialization,name:c.identificacao.especializacao},referenceData:structuredClone(c)};if(index>=0)all[index]=entry;else all.push(entry);localStorage.setItem(KEY,JSON.stringify(all));return c.id;}
export function deleteChar(id){localStorage.setItem(KEY,JSON.stringify(read().filter(s=>s.id!==id)));}
export function duplicateChar(id){const c=getChar(id);if(!c)return null;c.id=crypto.randomUUID();c.identificacao.nome+=' (cópia)';return saveChar(c);}
export function exportChar(id){const c=getChar(id);return c?JSON.stringify(c,null,2):null;}
export function importChar(text){try{let c=JSON.parse(text);if(c.information)c=fromLegacy(c);if(!c.identificacao||!c.atributos||!c.pontos)throw Error('Ficha inválida');validateLevel(c.identificacao.nivel);c.id=crypto.randomUUID();return saveChar(c);}catch{return null;}}
export function getActiveId(){return localStorage.getItem('jujutsu-active');}
export function setActiveId(id){if(id)localStorage.setItem('jujutsu-active',id);else localStorage.removeItem('jujutsu-active');}
export function storageInfo(){const all=read(),bytes=new TextEncoder().encode(JSON.stringify(all)).length;return{fichas:all.length,cookies:0,bytes,kb:(bytes/1024).toFixed(1)};}
