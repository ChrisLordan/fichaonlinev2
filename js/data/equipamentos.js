/* =========================================================
   EQUIPAMENTOS — Armas, escudos, uniformes, kits
   Extraído do Livro de Regras v2.5
   ========================================================= */

export const ARMAS_SIMPLES = [
  { nome: "Adaga", dano: "1d6 Pf", crit: 18, props: "Apunhaladora, arremessável [6/18m], fineza, leve, marcial, modular Ct", grupo: "Faca", espacos: 1, custo: 1 },
  { nome: "Bastão", dano: "1d6/1d8 Im", crit: 19, props: "Amplo, dupla, marcial, versátil", grupo: "Bastão", espacos: 1, custo: 1 },
  { nome: "Clava", dano: "1d8/1d10 Im", crit: 20, props: "Versátil", grupo: "Bastão", espacos: 1, custo: 1 },
  { nome: "Espada Curta", dano: "1d6 Ct", crit: 19, props: "Fineza, leve, marcial, modular Pf", grupo: "Espada", espacos: 1, custo: 1 },
  { nome: "Faixas", dano: "1d6 Ct", crit: 19, props: "Especial", grupo: "Pugilato", espacos: 1, custo: 1 },
  { nome: "Foice", dano: "1d6/1d8 Pf", crit: 19, props: "Fineza, leve, marcial", grupo: "Haste", espacos: 1, custo: 1 },
  { nome: "Lança", dano: "1d6 Im", crit: 18, props: "Arremessável [6/18m], estendida, versátil", grupo: "Haste", espacos: 1, custo: 1 },
  { nome: "Leque", dano: "1d6 Im", crit: 20, props: "Fineza, enérgica, leve, especial", grupo: "—", espacos: 1, custo: 1 },
  { nome: "Machado", dano: "1d8/1d10 Ct", crit: 20, props: "Versátil", grupo: "Machado", espacos: 1, custo: 1 },
  { nome: "Mangual", dano: "1d8 Im", crit: 20, props: "Ampla, enérgica", grupo: "Chicote", espacos: 1, custo: 1 },
  { nome: "Manoplas", dano: "Especial", crit: 20, props: "Aparar, duas mãos, dupla, especial, pesado [16]", grupo: "Pugilato", espacos: 1, custo: 1 },
  { nome: "Martelo", dano: "1d8/1d10 Im", crit: 20, props: "Versátil", grupo: "Martelo", espacos: 1, custo: 1 },
  { nome: "Soco Inglês", dano: "Especial", crit: 19, props: "Enérgica, especial, fineza, marcial", grupo: "Pugilato", espacos: 1, custo: 1 },
  { nome: "Tridente", dano: "1d6/1d8 Pf", crit: 19, props: "Arremessável [6/18m], estendida, versátil", grupo: "Haste", espacos: 1, custo: 1 },
  { nome: "Arco Curto", dano: "1d6 Pf", crit: 19, props: "Duas mãos, mortal d10, alcance [24/48m]", grupo: "Arco", espacos: 2, custo: 1 },
  { nome: "Besta Leve", dano: "1d8 Pf", crit: 19, props: "Mortal d10, leve, alcance [24/48m], recarga [1]", grupo: "Arco", espacos: 2, custo: 1 },
  { nome: "Pistola", dano: "1d10 Pf", crit: 19, props: "Alcance [36/72m], emperrar, leve, recarga [12]", grupo: "Tiro", espacos: 1, custo: 2 },
  { nome: "Azagaia", dano: "1d6 Pf", crit: 20, props: "Leve, alcance [12/24m]", grupo: "Dardo", espacos: 1, custo: 1 },
  { nome: "Dardo", dano: "1d4 Pf", crit: 20, props: "Leve, alcance [12/24m], especial", grupo: "Dardo", espacos: 1, custo: 1 },
  { nome: "Faca de Arremesso", dano: "1d6 Pf", crit: 18, props: "Leve, alcance [12/24m], modular Ct", grupo: "Faca", espacos: 1, custo: 1 },
];

export const ARMAS_COMPLEXAS = [
  { nome: "Arco Composto", dano: "1d8 Pf", crit: 18, props: "Apunhaladora, duas mãos, fineza, leve, marcial, modular Ct, especial", grupo: "Arco", espacos: 1, custo: 2 },
  { nome: "Besta Pesada", dano: "1d10 Pf", crit: 18, props: "Aparar, apunhaladora, fineza, leve, marcial, modular Ct", grupo: "Arco", espacos: 1, custo: 2 },
  { nome: "Montante", dano: "1d8/1d10 Ct", crit: 20, props: "Duas mãos, estendida, modular Pf, pesada [14], especial", grupo: "Espada", espacos: 1, custo: 2 },
  { nome: "Katana", dano: "1d8/1d10 Ct", crit: 19, props: "Estendida, fineza, leve, especial", grupo: "Espada", espacos: 1, custo: 2 },
  { nome: "Machado Grande", dano: "1d12/1d20 Ct", crit: 19, props: "Estendida, pesada [14], versátil, especial", grupo: "Machado", espacos: 1, custo: 2 },
  { nome: "Naginata", dano: "1d10 Ct", crit: 19, props: "Estendida, fineza, leve, especial", grupo: "Haste", espacos: 1, custo: 2 },
  { nome: "Alabarda", dano: "1d10/1d12 Pf", crit: 20, props: "Duas mãos, pesada [16], oscilante", grupo: "Haste", espacos: 1, custo: 2 },
  { nome: "Martelo de Guerra", dano: "1d10/1d12 Im", crit: 20, props: "Estendida, enérgica, pesada [14], versátil", grupo: "Martelo", espacos: 1, custo: 2 },
  { nome: "Lança Longa", dano: "1d8/1d10 Pf", crit: 20, props: "Fineza, leve, marcial, especial", grupo: "Haste", espacos: 1, custo: 2 },
  { nome: "Corrente", dano: "1d6/1d8 Im", crit: 20, props: "Modular Pf, versátil", grupo: "Chicote", espacos: 1, custo: 2 },
  { nome: "Rapieira", dano: "1d6/1d8 Pf", crit: 18, props: "Versátil, fatal d10, fineza", grupo: "Espada", espacos: 1, custo: 2 },
  { nome: "Machado de Guerra Amplo", dano: "1d12 Ct", crit: 20, props: "Ampla, duas mãos, modular Pf, pesada [14]", grupo: "Machado", espacos: 2, custo: 2 },
];

export const UNIFORMES = [
  { nome: "Uniforme Comum", desc: "Não concede bônus, serve como identificação.", rd: 0, espacos: 0, custo: 1 },
  { nome: "Uniforme c/ Revestimento Leve", desc: "Revestimento fino de proteção.", rd: 1, espacos: 0, custo: 1 },
  { nome: "Uniforme c/ Revestimento Médio", desc: "Revestimento médio, balanceado.", rd: 2, espacos: 2, custo: 2 },
  { nome: "Uniforme Sob Medida", desc: "Feito sob medida, sem restrição de movimento.", rd: 1, espacos: 0, custo: 1 },
  { nome: "Uniforme c/ Revestimento Robusto", desc: "Revestimento pesado, +1 DEF.", rd: 4, espacos: 4, custo: 3, def: 1 },
];

export const ESCUDOS = [
  { nome: "Escudo Leve", desc: "Pequeno e discreto, +1 Defesa.", def: 1, espacos: 1, custo: 1 },
  { nome: "Escudo Médio", desc: "Tamanho médio, +2 Defesa.", def: 2, espacos: 2, custo: 2 },
  { nome: "Escudo Pesado", desc: "Escudo grande, +3 Defesa.", def: 3, espacos: 2, custo: 3 },
];

export const KITS = [
  { nome: "Kit de Artefatos", desc: "Permite criar e manter ferramentas amaldiçoadas." },
  { nome: "Kit de Combate", desc: "Para manutenção de armas e escudos." },
  { nome: "Kit de Medicina", desc: "Para curar ferimentos e preparar antídotos." },
  { nome: "Kit de Sobrevivência", desc: "Para acampar, cozinhar e sobreviver em ambientes hostis." },
  { nome: "Kit de Investigação", desc: "Para analisar cenas, evidências e cenas de crime." },
  { nome: "Kit de Falsificação", desc: "Para falsificar documentos e identidades." },
];

export const ITENS_ESPECIAIS = [
  { nome: "Talismã", desc: "Item consumível, ocupa meio espaço." },
  { nome: "Medicina (1 uso)", desc: "Recupera 2d4+2 PV ou remove envenenado." },
  { nome: "Medicina (3 usos)", desc: "Versão com três cargas." },
  { nome: "Antídoto", desc: "Remove a condição envenenado." },
  { nome: "Maldição de Bolso", desc: "Recipiente amaldiçoado que armazena itens extras." },
  { nome: "Óculos de Visão Amaldiçoada", desc: "Permite ver espíritos amaldiçoados sem energia." },
  { nome: "Amuleto de Proteção", desc: "+1 em testes de resistência contra energia amaldiçoada." },
  { nome: "Sino de Invocação", desc: "Facilita a invocação de shikigamis." },
];

export const TODOS_EQUIPAMENTOS = () => {
  return {
    armas: [...ARMAS_SIMPLES, ...ARMAS_COMPLEXAS],
    uniformes: UNIFORMES,
    escudos: ESCUDOS,
    kits: KITS,
    especiais: ITENS_ESPECIAIS,
  };
};
