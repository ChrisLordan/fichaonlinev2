/* =========================================================
   CALCULOS — Funções puras para derivar valores
   ========================================================= */

import { ESPECIALIZACOES } from './especializacoes.js';
import { GRAU_POR_NIVEL } from './especializacoes.js';

export function modificador(valor) {
  return Math.floor((Number(valor || 0) - 10) / 2);
}

export function formatMod(m) {
  if (m >= 0) return `+${m}`;
  return `${m}`;
}

/* ---------- PV/PE Temporário (regra oficial, p.46) ----------
   • Não acumulam (mantém o maior valor)
   • Teto padrão = metade do máximo comum
   • Exceções: `acumula: true` (Sanguinário, Aura Drenadora) ou
     `semLimite: true` (Cobrir-se do Lutador, nv 11+) */

export function tempMaxPara(max) {
  return Math.floor((max || 0) / 2);
}

export function setTempHP(char, novo, opcoes = {}) {
  const p = char.pontos = char.pontos || {};
  const valor = Math.max(0, Math.floor(Number(novo) || 0));
  if (opcoes.acumula) {
    p.pvTemp = Math.max(0, (p.pvTemp || 0) + valor);
  } else {
    p.pvTemp = Math.max(p.pvTemp || 0, valor);
    if (!opcoes.semLimite) p.pvTemp = Math.min(p.pvTemp, tempMaxPara(p.pvMax));
  }
  return p.pvTemp;
}

export function setTempPE(char, novo, opcoes = {}) {
  const p = char.pontos = char.pontos || {};
  const valor = Math.max(0, Math.floor(Number(novo) || 0));
  if (opcoes.acumula) {
    p.peTemp = Math.max(0, (p.peTemp || 0) + valor);
  } else {
    p.peTemp = Math.max(p.peTemp || 0, valor);
    if (!opcoes.semLimite) p.peTemp = Math.min(p.peTemp, tempMaxPara(p.peMax));
  }
  return p.peTemp;
}

export function aplicarDano(char, dano, opcoes = {}) {
  const p = char.pontos = char.pontos || {};
  let d = Math.max(0, Math.floor(Number(dano) || 0));
  if (opcoes.danoAlma) {
    const antes = p.pvAtual || 0;
    p.pvAtual = Math.max(0, antes - d);
    return { danoTemp: 0, danoPV: antes - p.pvAtual };
  }
  const temp = p.pvTemp || 0;
  const danoTemp = Math.min(temp, d);
  p.pvTemp = temp - danoTemp;
  d -= danoTemp;
  const pvAntes = p.pvAtual || 0;
  const danoPV = Math.min(pvAntes, d);
  p.pvAtual = pvAntes - danoPV;
  return { danoTemp, danoPV, pvRestante: p.pvAtual, tempRestante: p.pvTemp };
}

export function aplicarCura(char, cura) {
  const p = char.pontos = char.pontos || {};
  p.pvAtual = Math.min(p.pvMax || 0, (p.pvAtual || 0) + Math.max(0, Math.floor(Number(cura) || 0)));
  return p.pvAtual;
}

export function aplicarConsumoPE(char, custo) {
  const p = char.pontos = char.pontos || {};
  p.peAtual = Math.max(0, (p.peAtual || 0) - Math.max(0, Math.floor(Number(custo) || 0)));
  return p.peAtual;
}

export function bonusTreinamento(nivel) {
  // +2 nos níveis 1-4, +3 em 5-8, +4 em 9-12, +5 em 13-16, +6 em 17-20
  if (nivel <= 4) return 2;
  if (nivel <= 8) return 3;
  if (nivel <= 12) return 4;
  if (nivel <= 16) return 5;
  return 6;
}

/* Faixas do Bônus de Treinamento (regra oficial, p.46):
   nv 1-4: +2 | 5-8: +3 | 9-12: +4 | 13-16: +5 | 17-20: +6 */
export function infoBonusTreinamento(nivel) {
  const valor = bonusTreinamento(nivel);
  const faixa = nivel <= 4 ? "Nv 1-4"
    : nivel <= 8 ? "Nv 5-8"
    : nivel <= 12 ? "Nv 9-12"
    : nivel <= 16 ? "Nv 13-16"
    : "Nv 17-20";
  const proxMudanca = nivel < 5 ? 5
    : nivel < 9 ? 9
    : nivel < 13 ? 13
    : nivel < 17 ? 17
    : null;
  return { valor, faixa, proxMudanca };
}

export function defesaTotal({ destreza, nivel, equipamento = 0, outros = 0 }) {
  return 10 + modificador(destreza) + Math.floor(nivel / 2) + equipamento + outros;
}

export function iniciativaTotal({ destreza, outros = 0 }) {
  return modificador(destreza) + outros;
}

export function atencaoTotal({ periciaOutros = 0, outros = 0, modPercepcao = 0 }) {
  return 10 + modPercepcao + periciaOutros + outros;
}

export function cdEspecializacaoTotal({ atributoChave, prof = 0, nivel, outros = 0 }) {
  return 8 + modificador(atributoChave) + prof + Math.floor(nivel / 2) + outros;
}

export function cdAmaldicoadoTotal({ atributoChave, prof = 0, nivel, outros = 0 }) {
  // CD amaldiçoado é sempre treinado (soma prof)
  return 8 + modificador(atributoChave) + prof + Math.floor(nivel / 2) + outros;
}

export function totalPericia({ modAtributo, treinado = false, mestre = false, nivel, outros = 0, prof = 0 }) {
  let total = modAtributo;
  if (treinado) total += prof;
  if (mestre) total += Math.floor(prof / 2);
  // Bônus de metade do nível para perícias treinadas
  total += Math.floor(nivel / 2);
  total += outros;
  return total;
}

export function totalTesteResistencia({ prof, nivel, outros = 0 }) {
  return prof + Math.floor(nivel / 2) + outros;
}

export function limiteCarga(modFor) {
  if (modFor < 0) return Math.max(0, 8 + 2 * modFor);
  return 8 + 2 * modFor;
}

export function pvInicial(especializacao, modCon) {
  const base = {
    "Lutador": 12,
    "Especialista em Combate": 12,
    "Especialista em Técnica": 10,
    "Controlador": 10,
    "Suporte": 10,
    "Restringido": 16,
  }[especializacao] ?? 10;
  return base + modCon;
}

export function dadoVida(especializacao) {
  return {
    "Lutador": 10,
    "Especialista em Combate": 10,
    "Especialista em Técnica": 8,
    "Controlador": 8,
    "Suporte": 8,
    "Restringido": 12,
  }[especializacao] ?? 8;
}

export function peInicial(especializacao, modAtributoChave) {
  const base = {
    "Lutador": 4,
    "Especialista em Combate": 4,
    "Especialista em Técnica": 6,
    "Controlador": 5,
    "Suporte": 5,
    "Restringido": 0,
  }[especializacao] ?? 0;
  if (especializacao === "Especialista em Técnica" ||
      especializacao === "Controlador" ||
      especializacao === "Suporte") {
    return base + modAtributoChave;
  }
  return base;
}

export function pePorNivel(especializacao) {
  return {
    "Lutador": 4,
    "Especialista em Combate": 4,
    "Especialista em Técnica": 6,
    "Controlador": 5,
    "Suporte": 5,
    "Restringido": 0,
  }[especializacao] ?? 0;
}

/* ---------- Multiclasse: PV/PE por especialização ----------
   Regra do livro (p.47):
   - 1º nv da esp PRIMÁRIA: pvInicialBase + modCon
   - 1º nv de esp SECUNDÁRIA (multiclasse): valor subsequente (Math.ceil(dX/2)+1+modCon)
   - 2º+ nv: valor subsequente
   - PE 1º nv primária: peInicial (com mod se somaModificadorNoPE)
   - PE 1º nv secundária: apenas pePorNivel (sem mod)
   - PE 2º+ nv: pePorNivel
*/

function valorSubsequente(dV, modCon) {
  return Math.ceil(dV / 2) + 1 + modCon;
}

function pvPorEspecializacao(esp, nivel, modCon, isPrimariaOuUnica) {
  if (!esp) return 0;
  const basePrimeiro = pvInicial(esp.id, modCon);
  const valor = valorSubsequente(dadoVida(esp.id), modCon);
  if (nivel <= 0) return 0;
  if (isPrimariaOuUnica) {
    return basePrimeiro + Math.max(0, nivel - 1) * valor;
  }
  return Math.max(0, nivel) * valor; // multiclasse: 1º nv já é subsequente
}

function pePorEspecializacao(esp, nivel, modChave, isPrimaria) {
  if (!esp) return 0;
  if (nivel <= 0) return 0;
  const peBase = peInicial(esp.id, modChave);
  const peNivel = pePorNivel(esp.id);
  let total = isPrimaria ? peBase : 0;
  total += Math.max(0, nivel - (isPrimaria ? 1 : 0)) * peNivel;
  return total;
}

export function calcularPVTotal(char) {
  const atr = char.atributos || {};
  const modCon = modificador(atr.constituicao);
  const lista = char.identificacao?.especializacoes?.length
    ? char.identificacao.especializacoes
    : [{ id: char.identificacao?.especializacao, nivel: char.identificacao?.nivel || 1 }];
  let total = 0;
  for (let i = 0; i < lista.length; i++) {
    const item = lista[i];
    const esp = ESPECIALIZACOES.find(e => e.id === item.id);
    if (!esp) continue;
    const isPrimaria = i === 0;
    total += pvPorEspecializacao(esp, item.nivel, modCon, isPrimaria);
  }
  if(char.dadivas?.includes('Vigor Infindável'))total+=Number(char.identificacao.nivel);
  const resistance=char.treinamentos?.treinoResistencia||[];
  total+=(resistance[0]?4:0)+(resistance[3]?6:0)+(resistance[4]?10:0);
  return total;
}

export function calcularPETotal(char) {
  const atr = char.atributos || {};
  const lista = char.identificacao?.especializacoes?.length
    ? char.identificacao.especializacoes
    : [{ id: char.identificacao?.especializacao, nivel: char.identificacao?.nivel || 1 }];
  let total = 0;
  for (let i = 0; i < lista.length; i++) {
    const item = lista[i];
    const esp = ESPECIALIZACOES.find(e => e.id === item.id);
    if (!esp) continue;
    const modChave = modificador(atr[char.tecnica?.atributoChave || esp.atributoChavePadrao] ?? 10);
    const isPrimaria = i === 0;
    total += pePorEspecializacao(esp, item.nivel, modChave, isPrimaria);
  }
  if(char.identificacao?.especializacao!=='Restringido')for(const key of ['compreensao','controleEnergia'])total+=(char.treinamentos?.[key]?.[0]?2:0)+(char.treinamentos?.[key]?.[2]?3:0);
  return total;
}

/* Recalcula PV/PE aplicados ao char e ajusta atuais.
   Retorna { mudou, diff: { pv, pe } } para feedback. */
export function recalcularPontos(char) {
  if (!char.pontos) char.pontos = {};
  const p = char.pontos;

  const pvMaxAntigo = p.pvMax || 0;
  const peMaxAntigo = p.peMax || 0;

  const pvMaxNovo = calcularPVTotal(char);
  const peMaxNovo = calcularPETotal(char);

  const mudou = pvMaxNovo !== pvMaxAntigo || peMaxNovo !== peMaxAntigo;

  p.pvMax = pvMaxNovo;
  // PDF v2.5.2 p.20: Integridade da Alma máxima igual ao PV máximo.
  p.integridadeMax = pvMaxNovo;
  p.integridadeAtual = Math.min(p.integridadeAtual ?? pvMaxNovo, pvMaxNovo);
  p.peMax = peMaxNovo;
  // PDF v2.5.2, p.114: Restringido usa 4 pontos de Estamina por nível.
  const restrito = char.identificacao?.especializacao === 'Restringido';
  p.estaminaMax = restrito ? 4 * char.identificacao.nivel + (char.treinamentos?.potencialFisico?.[0]?2:0)+(char.treinamentos?.potencialFisico?.[2]?4:0)+(char.dadivas?.includes('Vigor Infindável')?Math.floor(char.identificacao.nivel/2):0) : 0;
  p.estaminaAtual = Math.min(p.estaminaAtual || 0, p.estaminaMax);

  if ((p.pvAtual || 0) > pvMaxNovo) p.pvAtual = pvMaxNovo;
  if ((p.peAtual || 0) > peMaxNovo) p.peAtual = peMaxNovo;

  return {
    mudou,
    diff: {
      pv: pvMaxNovo - pvMaxAntigo,
      pe: peMaxNovo - peMaxAntigo,
    },
  };
}

/* ---------- Perícias: definição das 20+ principais ---------- */

export const PERICIAS = [
  { id: "atletismo", nome: "Atletismo", atributo: "forca" },
  { id: "acrobacia", nome: "Acrobacia", atributo: "destreza" },
  { id: "furtividade", nome: "Furtividade", atributo: "destreza" },
  { id: "prestidigitacao", nome: "Prestidigitação", atributo: "destreza" },
  { id: "feiticaria", nome: "Feitiçaria", atributo: "inteligencia" },
  { id: "historia", nome: "História", atributo: "inteligencia" },
  { id: "investigacao", nome: "Investigação", atributo: "inteligencia" },
  { id: "oficio1", nome: "Ofício 1", atributo: "inteligencia", custom: true },
  { id: "oficio2", nome: "Ofício 2", atributo: "inteligencia", custom: true },
  { id: "oficio3", nome: "Ofício 3", atributo: "inteligencia", custom: true },
  { id: "tecnologia", nome: "Tecnologia", atributo: "inteligencia" },
  { id: "intuicao", nome: "Intuição", atributo: "sabedoria" },
  { id: "medicina", nome: "Medicina", atributo: "sabedoria" },
  { id: "ocultismo", nome: "Ocultismo", atributo: "sabedoria" },
  { id: "percepcao", nome: "Percepção", atributo: "sabedoria" },
  { id: "teologia", nome: "Teologia", atributo: "inteligencia", complementar:true },
  { id: "direcao", nome: "Direção", atributo: "sabedoria", complementar:true },
  { id: "sobrevivencia", nome: "Sobrevivência", atributo: "sabedoria" },
  { id: "persuasao", nome: "Persuasão", atributo: "presenca" },
  { id: "enganacao", nome: "Enganação", atributo: "presenca" },
  { id: "intimidacao", nome: "Intimidação", atributo: "presenca" },
  { id: "performance", nome: "Performance", atributo: "presenca" },
];

export const TESTES_RESISTENCIA = [
  { id: "astucia", nome: "Astúcia", atributo: "inteligencia" },
  { id: "fortitude", nome: "Fortitude", atributo: "constituicao" },
  { id: "reflexos", nome: "Reflexos", atributo: "destreza" },
  { id: "vontade", nome: "Vontade", atributo: "sabedoria" },
  { id: "integridade", nome: "Integridade", atributo: "constituicao" },
];

/* ---------- Tipos de dano ---------- */

export const TIPOS_DANO = [
  "Cortante",
  "Perfurante",
  "Impacto",
  "Energético",
  "Alma",
  "Fogo",
  "Frio",
  "Elétrico",
  "Ácido",
  "Necrótico",
  "Radiante",
  "Psíquico",
  "Verdadeiro",
];

/* ---------- Condições de combate ---------- */

export const CONDICOES = [
  "Amedrontado",
  "Atordoado",
  "Confuso",
  "Envenenado",
  "Cego",
  "Surdo",
  "Enfeitiçado",
  "Incapacitado",
  "Inconsciente",
  "Paralisado",
  "Petrificado",
  "Agarrado",
  "Caído",
  "Imóvel",
  "Sangramento Leve",
  "Sangramento Médio",
  "Sangramento Grave",
  "Abalado",
  "Desprevenido",
  "Morrendo",
  "Exausto",
  "Asfixiado",
];

/* ---------- Cálculo agregado: dado o estado completo, retorna derivados ---------- */

export function derivar(char) {
  const idf = char.identificacao || {};
  const atr = char.atributos || {};
  const def = char.defesa || {};
  const cd = char.cd || {};
  const prof = bonusTreinamento(idf.nivel || 1);

  const modFor = modificador(atr.forca);
  const modDes = modificador(atr.destreza);
  const modCon = modificador(atr.constituicao);
  const modInt = modificador(atr.inteligencia);
  const modSab = modificador(atr.sabedoria);
  const modPre = modificador(atr.presenca);
  const mods = { forca: modFor, destreza: modDes, constituicao: modCon, inteligencia: modInt, sabedoria: modSab, presenca: modPre };

  const defesa = 10 + modDes + Math.floor((idf.nivel || 1) / 2) + (def.equipamento || 0) + (def.outros || 0);
  const iniciativa = modDes + (def.iniciativaOutros || 0);
  const percepcao = char.pericias?.percepcao || {};
  const atencao = 10 + totalPericia({modAtributo:modSab,treinado:!!percepcao.treino,mestre:!!percepcao.mestre,nivel:idf.nivel||1,outros:Number(percepcao.outros)||0,prof});
  const limite = limiteCarga(modFor);

  const cdEspMod = modificador(mods[cd.especializacao?.atributo] != null ? atr[cd.especializacao.atributo] : 10);
  const cdAmaMod = modificador(mods[cd.amaldicoado?.atributo] != null ? atr[cd.amaldicoado.atributo] : 10);

  const cdEsp = 8 + cdEspMod + prof + Math.floor((idf.nivel || 1) / 2) + (cd.especializacao?.outros || 0);
  const cdAma = 8 + cdAmaMod + prof + Math.floor((idf.nivel || 1) / 2) + (cd.amaldicoado?.outros || 0);

  return {
    mods, prof,
    defesa, iniciativa, atencao, limite,
    cdEspecializacao: cdEsp,
    cdAmaldicoado: cdAma,
  };
}

/* =========================================================
   LEVEL UP — Recalcula recursos derivados do nível
   Aplica no objeto char in-place e retorna um relatório.
   ========================================================= */

export function aplicarLevelUp(char, novoNivel, espId = null) {
  const idf = char.identificacao = char.identificacao || {};
  const atr = char.atributos = char.atributos || {};
  const p = char.pontos = char.pontos || {};

  const nivelAntigo = idf.nivel || 1;
  novoNivel = Math.max(1, Math.min(20, Number(novoNivel) || 1));
  if (novoNivel === nivelAntigo) {
    return { mudou: false, relatorio: [], pvMax: p.pvMax, peMax: p.peMax };
  }

  // Garante especializacoes populado
  if (!Array.isArray(idf.especializacoes) || idf.especializacoes.length === 0) {
    idf.especializacoes = idf.especializacao
      ? [{ id: idf.especializacao, nivel: nivelAntigo }]
      : [];
  }

  // Decide em qual especialização o nível vai
  const targetId = espId || idf.especializacao || idf.especializacoes[0]?.id;
  const targetIdx = idf.especializacoes.findIndex(e => e.id === targetId);
  // Se espId foi passado explicitamente, essa esp sobe 1 nível.
  // Senão, é single-class: a primária absorve todos os diff níveis.
  const diffNivel = novoNivel - nivelAntigo;
  const niveisParaTarget = espId ? 1 : diffNivel;
  if (targetIdx < 0) {
    idf.especializacoes.push({ id: targetId, nivel: Math.max(1, niveisParaTarget) });
  } else {
    idf.especializacoes[targetIdx].nivel = Math.max(0, (idf.especializacoes[targetIdx].nivel || 0)) + niveisParaTarget;
  }
  const targetEntry = idf.especializacoes.find(e => e.id === targetId);
  const isFirstLevelOfSecondary = targetIdx > 0 && targetEntry.nivel === 1;

  // Cálculos de PV/PE
  const espPrim = ESPECIALIZACOES.find(e => e.id === idf.especializacao);

  const pvMaxAntigo = p.pvMax || 0;
  const peMaxAntigo = p.peMax || 0;

  const pvMaxNovo = calcularPVTotal(char);
  const peMaxNovo = calcularPETotal(char);

  // Monta relatório
  const rel = [];
  const diff = novoNivel - nivelAntigo;
  const sinal = diff > 0 ? "+" : "";

  rel.push({ tipo: "info", texto: `Nível ${nivelAntigo} → ${novoNivel} (${sinal}${diff})` });
  rel.push({ tipo: "info", texto: `Grau: ${GRAU_POR_NIVEL(novoNivel)}` });

  if (isFirstLevelOfSecondary) {
    const espNova = ESPECIALIZACOES.find(e => e.id === targetId);
    rel.push({ tipo: "info", texto: `Multiclasse: 1º nv em ${espNova?.nome || targetId}` });
    rel.push({ tipo: "aviso", texto: `Sem novos treinamentos/equipamentos (regra de Multiclasse)` });
    rel.push({ tipo: "aviso", texto: `PV segue fórmula de nível subsequente (1d${espNova?.dadoVida || 8}+modCon)` });
    if (espNova) {
      rel.push({ tipo: "aviso", texto: `PE máximo +${espNova.pePorNivel || 0} (valor da nova especialização)` });
    }
  }

  if (pvMaxNovo !== pvMaxAntigo) {
    rel.push({ tipo: "valor", texto: `PV máximo: ${pvMaxAntigo} → ${pvMaxNovo} (${sinal}${pvMaxNovo - pvMaxAntigo})` });
  }
  if (peMaxNovo !== peMaxAntigo) {
    rel.push({ tipo: "valor", texto: `PE máximo: ${peMaxAntigo} → ${peMaxNovo} (${sinal}${peMaxNovo - peMaxAntigo})` });
  }

  // Lembretes para o novo nível (e cada nível que passou)
  const niveisPassados = [];
  if (diff > 0) {
    for (let n = nivelAntigo + 1; n <= novoNivel; n++) niveisPassados.push(n);
  } else {
    niveisPassados.push(novoNivel);
  }

  for (const nv of niveisPassados) {
    // Habilidade de especialização ou talento
    rel.push({ tipo: "aviso", texto: `Nv ${nv}: escolha 1 habilidade de especialização OU 1 talento` });
    // Aptidão amaldiçoada
    rel.push({ tipo: "aviso", texto: `Nv ${nv}: escolha 1 aptidão amaldiçoada` });
    // +2 pontos de atributo a cada 4 níveis
    if (nv % 4 === 0) {
      rel.push({ tipo: "aviso", texto: `Nv ${nv}: +2 pontos de atributo` });
    }
    // +1 bônus de treinamento nos níveis 5, 9, 13, 17
    if ([5, 9, 13, 17].includes(nv)) {
      const novoProf = bonusTreinamento(nv);
      rel.push({ tipo: "valor", texto: `Nv ${nv}: bônus de treinamento agora é +${novoProf}` });
    }
    // Mestre em 1 perícia no nível 10
    if (nv === 10) {
      rel.push({ tipo: "aviso", texto: `Nv ${nv}: torne-se mestre em 1 perícia à sua escolha` });
    }
  }

  // Aplica no char
  idf.nivel = novoNivel;
  idf.grau = GRAU_POR_NIVEL(novoNivel);
  p.pvMax = pvMaxNovo;
  p.peMax = peMaxNovo;
  // Ajusta atuais se excederem
  recalcularPontos(char);
  if ((p.pvAtual || 0) > pvMaxNovo) p.pvAtual = pvMaxNovo;
  if ((p.peAtual || 0) > peMaxNovo) p.peAtual = peMaxNovo;

  return {
    mudou: true,
    relatorio: rel,
    pvMax: pvMaxNovo,
    peMax: peMaxNovo,
  };
}
