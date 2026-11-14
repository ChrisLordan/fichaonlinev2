// Fontes verificadas: Livro de Regras v2.5.2, p. 18-19.
export const ATTRIBUTES=['forca','destreza','constituicao','inteligencia','sabedoria','presenca'];
export const ATTRIBUTE_LABELS={forca:'Força',destreza:'Destreza',constituicao:'Constituição',inteligencia:'Inteligência',sabedoria:'Sabedoria',presenca:'Presença'};
export const pointCost={8:-2,9:-1,10:0,11:2,12:3,13:4,14:5,15:7};
export function modifier(value){return Math.floor((Number(value)-10)/2)}
export function rollAttribute(){const dice=Array.from({length:4},()=>Math.floor(Math.random()*6)+1);const kept=[...dice].sort((a,b)=>a-b).slice(1);return{dice,value:kept.reduce((a,b)=>a+b,0)}}
export function pointBuySpent(values){return Object.values(values).reduce((n,v)=>n+(pointCost[Number(v)]??999),0)}
export function derived(sheet){const a=sheet.attributes.values,b=sheet.attributes.bonuses;const final=k=>Number(a[k]||0)+Number(b[k]||0);const dex=modifier(final('destreza')),level=Number(sheet.information.level||1);const r=sheet.resources;return{defense:10+dex+Math.floor(level/2)+Number(r.defenseBonus||0),attention:10+Number(r.perceptionBonus||0),initiative:dex}}
