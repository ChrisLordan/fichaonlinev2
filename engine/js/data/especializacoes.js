/* =========================================================
   ESPECIALIZAÇÕES — 6 especializações do F&M v2.5
   ========================================================= */

export const ESPECIALIZACOES = [
  {
    id: "Lutador",
    nome: "Lutador",
    pvInicialBase: 12,
    dadoVida: 10,
    pePorNivel: 4,
    atributoChave: ["forca", "destreza"],
    atributoChavePadrao: "forca",
    treinamentos: {
      armas: ["simples", "marcial"],
      escudos: ["leve"],
      tr: ["fortitude", "reflexos"],
      trObrigatorio: false,
      pericias: ["oficio1", "atletismo", "acrobacia"],
      periciasAdicionais: 3,
    },
    reqMulticlasse: { atributo: ["forca", "destreza"], min: 16 },
    cor: "var(--site-color-f87171, #f87171)",
    descricao: "Especialista em combate físico com armas marciais ou desarmado. Resistente, móvel e potente.",
    exemplos: ["Yuuji Itadori", "Kinji Hakari", "Hajime Kashimo"],
  },
  {
    id: "Especialista em Combate",
    nome: "Especialista em Combate",
    pvInicialBase: 12,
    dadoVida: 10,
    pePorNivel: 4,
    atributoChave: ["forca", "destreza", "sabedoria"],
    atributoChavePadrao: "forca",
    treinamentos: {
      armas: ["todas"],
      escudos: ["todos"],
      tr: ["fortitude", "reflexos"],
      trObrigatorio: false,
      pericias: ["oficio1", "oficio2", "atletismo", "acrobacia"],
      periciasAdicionais: 3,
    },
    reqMulticlasse: { atributo: ["forca", "destreza", "sabedoria"], min: 16 },
    cor: "var(--site-color-fbbf24, #fbbf24)",
    descricao: "Combate como arte, com estratégia, versatilidade e domínio do campo de batalha.",
    exemplos: ["Kento Nanami", "Yuta Okkotsu", "Atsuya Kusakabe"],
  },
  {
    id: "Especialista em Técnica",
    nome: "Especialista em Técnica",
    pvInicialBase: 10,
    dadoVida: 8,
    pePorNivel: 6,
    atributoChave: ["inteligencia", "sabedoria"],
    atributoChavePadrao: "inteligencia",
    somaModificadorNoPE: true,
    treinamentos: {
      armas: ["simples", "distancia"],
      escudos: [],
      tr: ["astucia", "vontade"],
      trObrigatorio: false,
      pericias: ["oficio1", "oficio2", "feiticaria", "ocultismo"],
      periciasAdicionais: 2,
    },
    reqMulticlasse: { atributo: ["inteligencia", "sabedoria"], min: 16 },
    cor: "var(--site-color-ff263e, #ff263e)",
    descricao: "Estuda ao máximo a energia amaldiçoada, dominando-a e alterando seus fundamentos.",
    exemplos: ["Satoru Gojo", "Suguru Geto"],
  },
  {
    id: "Controlador",
    nome: "Controlador",
    pvInicialBase: 10,
    dadoVida: 8,
    pePorNivel: 5,
    atributoChave: ["presenca", "sabedoria"],
    atributoChavePadrao: "presenca",
    somaModificadorNoPE: true,
    treinamentos: {
      armas: ["simples", "distancia"],
      escudos: [],
      tr: ["astucia", "vontade"],
      trObrigatorio: false,
      pericias: ["oficio1", "percepcao", "persuasao"],
      periciasAdicionais: 2,
    },
    reqMulticlasse: { atributo: ["presenca", "sabedoria"], min: 16 },
    cor: "var(--site-color-dc172c, #dc172c)",
    descricao: "Cria marionetes ou domina shikigamis com maestria superior.",
    exemplos: ["Megumi Fushiguro", "Noritoshi Kamo"],
  },
  {
    id: "Suporte",
    nome: "Suporte",
    pvInicialBase: 10,
    dadoVida: 8,
    pePorNivel: 5,
    atributoChave: ["presenca", "sabedoria"],
    atributoChavePadrao: "presenca",
    somaModificadorNoPE: true,
    treinamentos: {
      armas: ["simples"],
      escudos: ["todos"],
      tr: ["astucia", "vontade"],
      trObrigatorio: false,
      pericias: ["oficio1", "oficio2", "medicina", "prestidigitacao"],
      periciasAdicionais: 3,
    },
    reqMulticlasse: { atributo: ["presenca", "sabedoria"], min: 16 },
    cor: "var(--site-color-4ade80, #4ade80)",
    descricao: "Apoia aliados, garante integridade e saúde, motivando e fortalecendo o time.",
    exemplos: ["Aoi Todo", "Utahime Iori"],
  },
  {
    id: "Restringido",
    nome: "Restringido",
    pvInicialBase: 16,
    dadoVida: 12,
    pePorNivel: 0,
    atributoChave: ["qualquer"],
    atributoChavePadrao: "forca",
    treinamentos: {
      armas: ["todas"],
      escudos: ["todos"],
      tr: ["fortitude", "reflexos"],
      trObrigatorio: true,
      pericias: ["qualquer4"],
      periciasExcluidas: ["feiticaria"],
    },
    reqMulticlasse: null,
    cor: "var(--site-color-a1a1aa, #a1a1aa)",
    descricao: "Sem energia amaldiçoada, mas com desenvolvimento físico anormal e técnicas marciais.",
    exemplos: ["Toji Fushiguro", "Maki Zenin"],
  },
];

export const ESTILOS_COMBATE = [
  { id: "Defensivo", nome: "Estilo Defensivo", desc: "+2 Defesa (aumenta em +1 nos níveis 4, 8, 12, 16)" },
  { id: "Arremessador", nome: "Estilo do Arremessador", desc: "Sacar arma de arremesso como parte do ataque, +2 dano" },
  { id: "Duelista", nome: "Estilo do Duelista", desc: "+1 acerto e +2 dano com arma em uma mão" },
  { id: "Interceptador", nome: "Estilo do Interceptador", desc: "Reação: reduzir dano de aliado em 1d10+mod" },
  { id: "Protetor", nome: "Estilo do Protetor", desc: "Reação: impor desvantagem em ataque a aliado adjacente" },
  { id: "Distante", nome: "Estilo Distante", desc: "+1 acerto e +2 dano com armas a distância" },
  { id: "Duplo", nome: "Estilo Duplo", desc: "Duas armas: somar atributo no dano da 2ª arma +1" },
  { id: "Massivo", nome: "Estilo Massivo", desc: "Rerrolar 1-2 no dano com armas pesadas" },
];

export const POSTURAS = [
  "Postura do Sol", "Postura da Lua", "Postura da Terra", "Postura do Dragão",
  "Postura da Fortuna", "Postura da Devastação", "Postura da Tempestade", "Postura do Céu",
];

export const GRAUS = ["4°", "3°", "2°", "1°", "Especial"];
export const GRAU_POR_NIVEL = (n) => {
  if (n <= 4) return "4°";
  if (n <= 7) return "3°";
  if (n <= 13) return "2°";
  if (n <= 18) return "1°";
  return "Especial";
};

export const METODOS_ATRIBUTO = [
  { id: "fixos", nome: "Valores Fixos", desc: "Distribua 15, 14, 13, 12, 10 e 8 entre os atributos." },
  { id: "compra", nome: "Compra por Pontos", desc: "Todos iniciam em 10, você tem 17 pontos para distribuir (limite 15)." },
  { id: "rolagem", nome: "Rolagem", desc: "Role 4d6, descarte o menor, some os 3 maiores. Faça 6 vezes e distribua." },
];

/* =========================================================
   MULTICLASSE — Validação e helpers (regras do livro, p.47)
   ========================================================= */

import { recalcularPontos } from './calculos.js';

export function podeAdicionarMulticlasse(char, novaEspId) {
  const idf = char.identificacao || {};
  const prim = ESPECIALIZACOES.find(e => e.id === idf.especializacao);
  const nova = ESPECIALIZACOES.find(e => e.id === novaEspId);
  const lista = idf.especializacoes || [];

  if (prim?.id === "Restringido")
    return { ok: false, motivo: "Restringidos não podem realizar Multiclasse." };
  if (nova?.id === "Restringido")
    return { ok: false, motivo: "Não é possível Multiclasse para Restringido." };
  if (novaEspId === prim?.id)
    return { ok: false, motivo: "Essa já é sua especialização primária." };
  if (lista.some(e => e.id === novaEspId))
    return { ok: false, motivo: "Você já tem essa especialização." };

  const req = nova?.reqMulticlasse;
  if (req) {
    const v1 = char.atributos?.[req.atributo[0]] || 0;
    const v2 = char.atributos?.[req.atributo[1] || req.atributo[0]] || 0;
    if (v1 < req.min && v2 < req.min) {
      const nomes = req.atributo.map(a => a.toUpperCase()).join(" ou ");
      return { ok: false, motivo: `Requer ${nomes} ≥ ${req.min}.` };
    }
  }
  return { ok: true };
}

export function listarEspParaMulticlasse(char) {
  const idf = char.identificacao || {};
  const lista = idf.especializacoes || [];
  return ESPECIALIZACOES
    .filter(e =>
      e.id !== "Restringido" &&
      e.id !== idf.especializacao &&
      !lista.some(x => x.id === e.id)
    )
    .map(e => ({ esp: e, check: podeAdicionarMulticlasse(char, e.id) }));
}

export function adicionarMulticlasse(char, novaEspId) {
  const check = podeAdicionarMulticlasse(char, novaEspId);
  if (!check.ok) return { ok: false, motivo: check.motivo };

  char.identificacao = char.identificacao || {};
  char.identificacao.especializacoes = char.identificacao.especializacoes || [];
  if (char.identificacao.especializacoes.length === 0 && char.identificacao.especializacao) {
    char.identificacao.especializacoes.push({ id: char.identificacao.especializacao, nivel: char.identificacao.nivel || 1 });
  }
  char.identificacao.especializacoes.push({ id: novaEspId, nivel: 1 });

  // Recalcula PV/PE/Estamina automaticamente (regra do livro, p.47)
  const recalc = recalcularPontos(char);
  return { ok: true, recalc };
}

export function removerMulticlasse(char, espId) {
  if (espId === char.identificacao?.especializacao) return { ok: false, motivo: "Não pode remover a primária." };
  char.identificacao.especializacoes = (char.identificacao.especializacoes || []).filter(e => e.id !== espId);
  return { ok: true };
}

export function migrarEspecializacoes(char) {
  char.identificacao = char.identificacao || {};
  if (!Array.isArray(char.identificacao.especializacoes) || char.identificacao.especializacoes.length === 0) {
    const prim = char.identificacao.especializacao;
    if (prim) {
      char.identificacao.especializacoes = [{ id: prim, nivel: char.identificacao.nivel || 1 }];
    } else {
      char.identificacao.especializacoes = [];
    }
  }
  return char;
}

/** Aplica os treinamentos de uma especialização ao char (state.pericias e state.testesResistencia).
 *  - Perícias pré-definidas em `treinamentos.pericias` são marcadas como treino: true
 *  - Se `treinamentos.trObrigatorio: true`, TODOS os TRs do array são marcados
 *  - Se `treinamentos.trObrigatorio: false` (ou ausente), NENHUM TR é marcado — UI deve mostrar prompt
 *  Retorna { periciasMarcadas: string[], trsMarcados: string[], exigeEscolhaTR: string[] } */
export function aplicarTreinamentosEsp(char, espId) {
  const esp = ESPECIALIZACOES.find(e => e.id === espId);
  if (!esp) return { periciasMarcadas: [], trsMarcados: [], exigeEscolhaTR: [] };
  char.pericias = char.pericias || {};
  char.testesResistencia = char.testesResistencia || {};

  const periciasMarcadas = [];
  for (const pid of esp.treinamentos?.pericias || []) {
    if (pid === "qualquer4") continue;
    if (!char.pericias[pid]) char.pericias[pid] = { treino: false, mestre: false, outros: 0 };
    char.pericias[pid].treino = true;
    periciasMarcadas.push(pid);
  }

  const trs = esp.treinamentos?.tr || [];
  const trsMarcados = [];
  let exigeEscolhaTR = [];
  if (esp.treinamentos?.trObrigatorio === true) {
    for (const trid of trs) {
      if (!char.testesResistencia[trid]) char.testesResistencia[trid] = { treino: false, mestre: false, outros: 0 };
      char.testesResistencia[trid].treino = true;
      trsMarcados.push(trid);
    }
  } else if (trs.length > 0) {
    exigeEscolhaTR = [...trs];
  }
  return { periciasMarcadas, trsMarcados, exigeEscolhaTR };
}

/** Nível efetivo de uma especialização para habilidades (regra do livro):
 *  nv_da_esp + metade_arredondada_para_baixo(nv_em_outras_esp).
 *  NÃO usar para pré-requisitos. */
export function nivelEfetivo(char, espId) {
  const lista = (char.identificacao?.especializacoes || []);
  const alvo = lista.find(e => e.id === espId);
  if (!alvo) return 0;
  const outras = lista.filter(e => e.id !== espId).reduce((s, e) => s + e.nivel, 0);
  return alvo.nivel + Math.floor(outras / 2);
}
