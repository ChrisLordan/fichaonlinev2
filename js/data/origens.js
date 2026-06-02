/* =========================================================
   ORIGENS — 7 origens do F&M v2.5
   Cada origem define bônus de atributo e características.
   ========================================================= */

export const ORIGENS = [
  {
    id: "Inato",
    nome: "Inato",
    bonus: { tipo: "padrao", a: 2, b: 1 },
    descricao: "Nasceu com afinidade para a energia amaldiçoada e uma técnica própria.",
    caracteristicas: [
      "Bônus: +2 em um atributo, +1 em outro",
      "Talento Natural: 1 talento a sua escolha no 1° nível (+1 aos 4)",
      "Marca Registrada: 1 Feitiço adicional com custo -1 PE",
    ],
    cor: "#c084fc",
    permiteTecnica: true,
  },
  {
    id: "Herdado",
    nome: "Herdado",
    bonus: { tipo: "clan" },
    descricao: "Técnica passada pela linhagem sanguínea de um clã jujutsu.",
    caracteristicas: [
      "Bônus de atributo depende do clã escolhido",
      "Treinamentos e Herança de Clã",
      "Pode escolher entre: Gojo, Inumaki, Kamo, Zenin",
    ],
    cor: "#a78bfa",
    permiteTecnica: true,
    exigeClan: true,
    clansDisponiveis: ["Gojo", "Inumaki", "Kamo", "Zenin"],
  },
  {
    id: "Derivado",
    nome: "Derivado",
    bonus: { tipo: "padrao", a: 2, b: 1 },
    descricao: "Energia e técnica amaldiçoada que derivaram de uma fonte alternativa.",
    caracteristicas: [
      "Bônus: +2 em um atributo, +1 em outro",
      "Energia Antinatural: 1 aptidão de Aura; recuperar 2×bônus de treinamento de PE 1x/dia",
      "Desenvolvimento Inesperado: a cada 4 níveis, +1 atributo e limite +1",
    ],
    cor: "#f472b6",
    permiteTecnica: true,
  },
  {
    id: "Restringido",
    nome: "Restringido",
    bonus: { tipo: "restrito" },
    descricao: "Energia quase nula em troca de um físico sobre-humano. Vinculado à especialização Restringido.",
    caracteristicas: [
      "Bônus: +1 em FOR/DES/CON + 2 pontos a distribuir",
      "Físico Abençoado: +3m deslocamento, imune a doenças",
      "Ápice Corporal: limite de FOR/DES/CON = 30",
      "Resiliência Imediata: reduzir dano n×BT/descanso longo",
    ],
    cor: "#94a3b8",
    permiteTecnica: false,
    forcaEspecializacao: "Restringido",
  },
  {
    id: "Feto Amaldiçoado Híbrido",
    nome: "Feto Amaldiçoado Híbrido",
    bonus: { tipo: "padrao", a: 2, b: 1 },
    descricao: "Espírito amaldiçoado em estado embrionário que se tornou híbrido humano-maldição.",
    caracteristicas: [
      "Bônus: +2 em um atributo, +1 em outro",
      "Herança Maldita: cura de energia reversa reduzida à metade",
      "Físico Amaldiçoado: 1 Característica de Anatomia inicial",
      "Vigor Maldito: curar 5+mod.Con 1x/descanso longo",
    ],
    cor: "#34d399",
    permiteTecnica: true,
  },
  {
    id: "Sem Técnica",
    nome: "Sem Técnica",
    bonus: { tipo: "distribuir", total: 4, max: 3 },
    descricao: "Não possui técnica amaldiçoada, mas se dedica para compensar.",
    caracteristicas: [
      "4 pontos para distribuir, máx 3 no mesmo atributo",
      "Estudos Dedicados: treinado em 2 perícias",
      "Empenho Implacável: talento/aptidão no 1°, etc.",
      "A partir do 4° nível: Novo Estilo da Sombra",
    ],
    cor: "#fbbf24",
    permiteTecnica: false,
    bloqueiaEspecializacao: ["Especialista em Técnica"],
  },
  {
    id: "Corpo Amaldiçoado Mutante",
    nome: "Corpo Amaldiçoado Mutante",
    bonus: { tipo: "distribuir", total: 2, max: 2 },
    descricao: "Corpo amaldiçoado com consciência própria, fonte renovável de energia e múltiplos núcleos.",
    caracteristicas: [
      "2 pontos para distribuir",
      "Forma de Vida Sintética: imune a veneno",
      "Mutação Abrupta: 3 núcleos (escolher 1 primário)",
    ],
    cor: "#fb923c",
    permiteTecnica: true,
  },
];

export const ANATOMIAS_FETO = [
  "Alma Maldita", "Capacidade de Voo", "Carapaça Mutante", "Corpo Especializado",
  "Desenvolvimento Exagerado", "Devorador de Energia", "Instinto Sanguinário",
  "Anatomia Incompreensível", "Arma Natural", "Articulações Extensas",
  "Braços Extras", "Olhos Sombrios", "Pernas Extras", "Presença Nefasta",
  "Sangue Tóxico",
];
