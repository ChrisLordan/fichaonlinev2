/* =========================================================
   APTIDÕES — 5 árvores de aptidões amaldiçoadas
   Cap 8 do livro de regras
   ========================================================= */

export const APTIDOES = [
  {
    id: "aura",
    nome: "Aura",
    descricao: "Manifestar energia amaldiçoada como presença, pressão ou armadura.",
    etapas: [
      { nivel: 1, nome: "Aura Pressurizante", desc: "Você consegue projetar uma aura de energia, ganhando +1 em Intimidação. Enquanto ela estiver ativa, criaturas hostis a até 1,5m devem passar em teste de Vontade (CD Amaldiçoada) ou ficam abaladas por 1 rodada." },
      { nivel: 2, nome: "Aura Combustiva", desc: "Sua energia pode se acumular e ser liberada em uma explosão. Como ação, cause 2d6 de dano Energético em área de 3m (Reflexos reduz à metade)." },
      { nivel: 3, nome: "Aura Flamejante", desc: "Sua aura se torna intensa, com chamas amaldiçoadas. Dano de aura aumenta para 3d6+mod. Causa dano contínuo em quem permanecer dentro." },
      { nivel: 4, nome: "Aura Soberana", desc: "Sua presença é absoluta. Criaturas não podem usar reações dentro de 3m, e ataques contra você têm desvantagem." },
    ],
  },
  {
    id: "controle",
    nome: "Controle e Leitura",
    descricao: "Manipular energia amaldiçoada com precisão para técnicas, detecção e ofuscação.",
    etapas: [
      { nivel: 1, nome: "Imbuição Simples", desc: "Você pode imbuir sua energia em uma arma ou objeto com ação bônus, fazendo-a causar +1d4 de dano Energético por 1 minuto." },
      { nivel: 2, nome: "Leitura de Energia", desc: "Você consegue ler rastros e vestígios de energia, recebendo +5 em testes de Percepção para detectar usuários e técnicas." },
      { nivel: 3, nome: "Controle Avançado", desc: "Imbuição pode ser feita em duas armas simultaneamente e dano aumenta para +1d6." },
      { nivel: 4, nome: "Domínio Quântico", desc: "Você enxerga perfeitamente o traçado da alma de criaturas, identificando vulnerabilidades. +2d6 em ataques contra alvos desprevenidos." },
    ],
  },
  {
    id: "dominio",
    nome: "Domínio",
    descricao: "Manipular barreiras e espaços, criar domínios e domínios simples.",
    etapas: [
      { nivel: 1, nome: "Barreira Simples", desc: "Você pode erguer uma barreira de 3x3m que concede +2 em Defesa por 1 minuto. Custa 1 PE." },
      { nivel: 2, nome: "Barreira Aprimorada", desc: "Barreira agora cobre 6x6m e pode ser mantida por 10 minutos. Custa 2 PE." },
      { nivel: 3, nome: "Domínio Simples", desc: "Você pode ativar um Domínio Simples: 4,5m de raio, +2 em CD de Feitiços dentro, garantir 1 feitiço. Custa 4 PE por rodada." },
      { nivel: 4, nome: "Expansão de Domínio", desc: "Você pode aprender e ativar uma Expansão de Domínio completa. Consulte o livro." },
    ],
  },
  {
    id: "barreira",
    nome: "Barreira",
    descricao: "Técnicas de barreira mais refinadas para defesa, ocultação e prisão.",
    etapas: [
      { nivel: 1, nome: "Cortina", desc: "Você pode ocultar uma área (3x3m) por 1 hora, impedindo a visualização externa. Custa 2 PE." },
      { nivel: 2, nome: "Moldura", desc: "Cria uma barreira com moldura fixa, em forma de cúpula. Defesa da barreira = 10 + mod Presença + nível." },
      { nivel: 3, nome: "Prisão", desc: "Uma barreira de 4,5m em torno de um alvo. O alvo fica preso por 1 minuto ou até romper a barreira (Fortitude CD contra dano). Custa 4 PE." },
      { nivel: 4, nome: "Véu", desc: "A barreira se torna invisível para observação normal. Apenas usuários de energia ou técnicas específicas podem percebê-la." },
    ],
  },
  {
    id: "energiaReversa",
    nome: "Energia Reversa",
    descricao: "Manipular energia positiva para cura e benfeitorias.",
    etapas: [
      { nivel: 1, nome: "Toque Curativo", desc: "Como ação, gaste 1 PE para curar 1d6 + nível. Pode ser usado em si mesmo ou aliado adjacente." },
      { nivel: 2, nome: "Cura em Área", desc: "Aura de cura de 3m. Aliados dentro recuperam 1d6 PV no começo de seus turnos. Custa 2 PE por rodada." },
      { nivel: 3, nome: "Cura Cirúrgica", desc: "Cura pode ser usada para regenerar membros perdidos (1 semana de descanso). 5 PE." },
      { nivel: 4, nome: "Ressurreição", desc: "Permite reverter uma morte recente (até 1 minuto após o óbito), restaurando o alvo a 1 PV. Custa 20 PE." },
    ],
  },
];

export const TREINAMENTOS = [
  { id: "compreensao", nome: "Compreensão", desc: "Estudo para entender melhor as técnicas." },
  { id: "potencialFisico", nome: "Potencial Físico", desc: "Treino para potencializar o corpo." },
  { id: "controleEnergia", nome: "Controle de Energia", desc: "Dominar a manipulação de energia amaldiçoada." },
  { id: "treinoDominios", nome: "Treino de Domínios", desc: "Aprender a manifestar e controlar domínios." },
  { id: "treinoResistencia", nome: "Treino de Resistência", desc: "Fortalecer o corpo contra energia amaldiçoada." },
  { id: "energiaReversa", nome: "Energia Reversa", desc: "Aprender a manipular energia positiva." },
];

export const APTIDAO_BY_ID = Object.fromEntries(APTIDOES.map(a => [a.id, a]));
