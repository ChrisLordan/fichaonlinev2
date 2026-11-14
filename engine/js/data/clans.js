/* =========================================================
   CLÃS — 4 clãs do F&M v2.5 (para origem Herdado)
   ========================================================= */

export const CLANS = [
  {
    id: "Gojo",
    nome: "Clã Gojo",
    atributoA: "inteligencia",
    atributoB: "sabedoria",
    bonus: { a: 2, b: 1 },
    treinamentos: ["feiticaria", "percepcao", "intuicao"],
    caracteristicas: [
      "Potencial Lendário: +1 PE em níveis pares",
      "+1 Feitiço no 1° nível e nos níveis 5, 10, 15, 20",
    ],
    tecnicas: "Seis Olhos, Ilimitado",
    cor: "var(--site-color-ff8390, #ff8390)",
  },
  {
    id: "Inumaki",
    nome: "Clã Inumaki",
    atributoA: "inteligencia",
    atributoB: "presenca",
    bonus: { a: 2, b: 1 },
    treinamentos: ["feiticaria", "percepcao", "intuicao"],
    caracteristicas: [
      "Olhos de Cobra e Presas: BT vezes por descanso, dar comando bônus para aliado como reação",
    ],
    tecnicas: "Fala Amaldiçoada",
    cor: "var(--site-color-ff263e, #ff263e)",
  },
  {
    id: "Kamo",
    nome: "Clã Kamo",
    atributoA: "constituicao",
    atributoB: "sabedoria",
    bonus: { a: 2, b: 1 },
    treinamentos: ["atletismo", "medicina", "persuasao"],
    caracteristicas: [
      "Valor do Sangue: +1 PV por nível; no 10° soma mod. Con",
    ],
    tecnicas: "Manipulação Sanguínea",
    cor: "var(--site-color-f87171, #f87171)",
  },
  {
    id: "Zenin",
    nome: "Clã Zenin",
    atributoA: "qualquer",
    atributoB: "qualquer",
    bonus: { a: 2, b: 1 },
    treinamentos: ["qualquer2"],
    caracteristicas: [
      "Foco no Poder: 1 Feitiço Focado no 1° nível (dado+1, alcance×2, CD+BT, etc.)",
      "Mais Feitiço Focado nos níveis 5, 10, 15, 20",
    ],
    tecnicas: "Dez Sombras, Projeção",
    cor: "var(--site-color-fbbf24, #fbbf24)",
  },
];
