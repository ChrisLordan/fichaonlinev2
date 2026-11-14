export function specializationLevel(sheet,name){
  const list=sheet.identificacao?.especializacoes;
  if(list?.length)return Number(list.find(s=>s.id===name)?.nivel||0);
  return sheet.identificacao?.especializacao===name?Number(sheet.identificacao.nivel||1):0;
}
export function chosenAbilities(sheet,name){return (sheet.especializacaoDetalhes?.habilidades||[]).filter(h=>h.tipo==='Escolha'&&h.especializacao===name&&h.catalogId);}
export function missingAbilityChoices(sheet,name){return Math.max(0,specializationLevel(sheet,name)-1-chosenAbilities(sheet,name).length);}
export function abilityBlockReason(sheet,ability){
  const level=specializationLevel(sheet,ability.especializacao);
  if(!level)return 'Esta especialização não pertence ao personagem.';
  if(ability.nivel>level)return `Requer nível ${ability.nivel} de ${ability.especializacao}.`;
  if((sheet.especializacaoDetalhes?.habilidades||[]).some(h=>h.catalogId===ability.id))return 'Habilidade já adicionada.';
  if(ability.tipo!=='Escolha')return 'Benefício-base ou regra complementar.';
  if(!missingAbilityChoices(sheet,ability.especializacao))return 'Todas as escolhas de habilidade disponíveis foram preenchidas.';
  return '';
}
export function addAbility(sheet,ability){
  const reason=abilityBlockReason(sheet,ability);if(reason)throw Error(reason);
  sheet.especializacaoDetalhes ||= {habilidades:[]};sheet.especializacaoDetalhes.habilidades ||= [];
  sheet.especializacaoDetalhes.habilidades.push({...ability,catalogId:ability.id});
}
export function syncBaseAbilities(sheet,catalog){
  sheet.especializacaoDetalhes ||= {habilidades:[]};sheet.especializacaoDetalhes.habilidades ||= [];
  const list=sheet.especializacaoDetalhes.habilidades;
  for(const a of catalog.filter(a=>a.tipo==='Base'&&a.nivel<=specializationLevel(sheet,a.especializacao)))if(!list.some(h=>h.catalogId===a.id))list.push({...a,catalogId:a.id,automatica:true});
}
