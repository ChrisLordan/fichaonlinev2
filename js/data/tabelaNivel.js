/* =========================================================
   TABELAS DE NÍVEL — O que cada especialização concede
   Fonte: Feiticeiros & Maldições — Livro de Regras v2.5.2
   =========================================================
   NOTA: As regras globais (mestre nv 10, +1 BT em 5/9/13/17,
   +2 pontos de atributo a cada 4 níveis, aptidão amaldiçoada
   por nível, opção de Talento no lugar da Habilidade) são
   tratadas em pendencias.js e no relatório de aplicarLevelUp.
   Aqui ficam apenas os marcos/específicos de cada especialização. */

export const TABELA_LUTADOR = [
  { nivel: 1,  ganho: "Habilidade Base — Corpo Treinado e Empolgação" },
  { nivel: 2,  ganho: "Reflexo Evasivo + Habilidade de Lutador" },
  { nivel: 3,  ganho: "Habilidade de Lutador" },
  { nivel: 4,  ganho: "2 Pontos de Atributo + Habilidade de Lutador" },
  { nivel: 5,  ganho: "Gosto pela Luta + Habilidade de Lutador" },
  { nivel: 6,  ganho: "Habilidade de Lutador" },
  { nivel: 7,  ganho: "Habilidade de Lutador" },
  { nivel: 8,  ganho: "2 Pontos de Atributo + Habilidade de Lutador" },
  { nivel: 9,  ganho: "Habilidade de Lutador" },
  { nivel: 10, ganho: "Habilidade de Lutador" },
  { nivel: 11, ganho: "Habilidade de Lutador" },
  { nivel: 12, ganho: "2 Pontos de Atributo + Habilidade de Lutador" },
  { nivel: 13, ganho: "Habilidade de Lutador" },
  { nivel: 14, ganho: "Habilidade de Lutador" },
  { nivel: 15, ganho: "Habilidade de Lutador" },
  { nivel: 16, ganho: "2 Pontos de Atributo + Habilidade de Lutador" },
  { nivel: 17, ganho: "Habilidade de Lutador" },
  { nivel: 18, ganho: "Habilidade de Lutador" },
  { nivel: 19, ganho: "Habilidade de Lutador" },
  { nivel: 20, ganho: "Lutador Superior + 2 Pontos de Atributo + Habilidade de Lutador" },
];

export const TABELA_ESP_COMBATE = [
  { nivel: 1,  ganho: "Habilidade Base — Repertório do Especialista e Artes do Combate" },
  { nivel: 2,  ganho: "Habilidade de Especialista em Combate" },
  { nivel: 3,  ganho: "Habilidade de Especialista em Combate" },
  { nivel: 4,  ganho: "2 Pontos de Atributo + Golpe Especial + Habilidade de Especialista em Combate" },
  { nivel: 5,  ganho: "Habilidade de Especialista em Combate" },
  { nivel: 6,  ganho: "Renovação pelo Sangue + Habilidade de Especialista em Combate" },
  { nivel: 7,  ganho: "Habilidade de Especialista em Combate" },
  { nivel: 8,  ganho: "2 Pontos de Atributo + Habilidade de Especialista em Combate" },
  { nivel: 9,  ganho: "Habilidade de Especialista em Combate" },
  { nivel: 10, ganho: "Habilidade de Especialista em Combate" },
  { nivel: 11, ganho: "Habilidade de Especialista em Combate" },
  { nivel: 12, ganho: "2 Pontos de Atributo + Habilidade de Especialista em Combate" },
  { nivel: 13, ganho: "Habilidade de Especialista em Combate" },
  { nivel: 14, ganho: "Habilidade de Especialista em Combate" },
  { nivel: 15, ganho: "Habilidade de Especialista em Combate" },
  { nivel: 16, ganho: "2 Pontos de Atributo + Habilidade de Especialista em Combate" },
  { nivel: 17, ganho: "Habilidade de Especialista em Combate" },
  { nivel: 18, ganho: "Habilidade de Especialista em Combate" },
  { nivel: 19, ganho: "Habilidade de Especialista em Combate" },
  { nivel: 20, ganho: "Autossuficiente + 2 Pontos de Atributo + Habilidade de Especialista em Combate" },
];

export const TABELA_ESP_TECNICA = [
  { nivel: 1,  ganho: "Habilidade Base — Domínio dos Fundamentos e Conjuração Aprimorada" },
  { nivel: 2,  ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 3,  ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 4,  ganho: "2 Pontos de Atributo + Adiantar Evolução + Habilidade de Especialista em Técnicas" },
  { nivel: 5,  ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 6,  ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 7,  ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 8,  ganho: "2 Pontos de Atributo + Habilidade de Especialista em Técnicas" },
  { nivel: 9,  ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 10, ganho: "Foco Amaldiçoado + Habilidade de Especialista em Técnicas" },
  { nivel: 11, ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 12, ganho: "2 Pontos de Atributo + Habilidade de Especialista em Técnicas" },
  { nivel: 13, ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 14, ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 15, ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 16, ganho: "2 Pontos de Atributo + Habilidade de Especialista em Técnicas" },
  { nivel: 17, ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 18, ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 19, ganho: "Habilidade de Especialista em Técnicas" },
  { nivel: 20, ganho: "2 Pontos de Atributo + Habilidade de Especialista em Técnicas + O Honrado" },
];

export const TABELA_CONTROLADOR = [
  { nivel: 1,  ganho: "Habilidade Base — Treinamento em Controle" },
  { nivel: 2,  ganho: "Habilidade de Controlador" },
  { nivel: 3,  ganho: "Habilidade de Controlador" },
  { nivel: 4,  ganho: "2 Pontos de Atributo + Controle Aprimorado + Habilidade de Controlador" },
  { nivel: 5,  ganho: "Habilidade de Controlador" },
  { nivel: 6,  ganho: "Apogeu + Habilidade de Controlador" },
  { nivel: 7,  ganho: "Habilidade de Controlador" },
  { nivel: 8,  ganho: "2 Pontos de Atributo + Habilidade de Controlador" },
  { nivel: 9,  ganho: "Habilidade de Controlador" },
  { nivel: 10, ganho: "Reserva para Invocação + Habilidade de Controlador" },
  { nivel: 11, ganho: "Habilidade de Controlador" },
  { nivel: 12, ganho: "2 Pontos de Atributo + Habilidade de Controlador" },
  { nivel: 13, ganho: "Habilidade de Controlador" },
  { nivel: 14, ganho: "Habilidade de Controlador" },
  { nivel: 15, ganho: "Habilidade de Controlador" },
  { nivel: 16, ganho: "2 Pontos de Atributo + Habilidade de Controlador" },
  { nivel: 17, ganho: "Habilidade de Controlador" },
  { nivel: 18, ganho: "Habilidade de Controlador" },
  { nivel: 19, ganho: "Habilidade de Controlador" },
  { nivel: 20, ganho: "2 Pontos de Atributo + Habilidade de Controlador + Ápice do Controle" },
];

export const TABELA_SUPORTE = [
  { nivel: 1,  ganho: "Habilidade Base — Suporte em Combate" },
  { nivel: 2,  ganho: "Habilidade de Suporte" },
  { nivel: 3,  ganho: "Presença Inspiradora + Habilidade de Suporte" },
  { nivel: 4,  ganho: "2 Pontos de Atributo + Habilidade de Suporte" },
  { nivel: 5,  ganho: "Versatilidade + Habilidade de Suporte" },
  { nivel: 6,  ganho: "Habilidade de Suporte" },
  { nivel: 7,  ganho: "Habilidade de Suporte" },
  { nivel: 8,  ganho: "2 Pontos de Atributo + Habilidade de Suporte" },
  { nivel: 9,  ganho: "Habilidade de Suporte" },
  { nivel: 10, ganho: "Habilidade de Suporte + Medicina Infalível" },
  { nivel: 11, ganho: "Habilidade de Suporte" },
  { nivel: 12, ganho: "2 Pontos de Atributo + Habilidade de Suporte" },
  { nivel: 13, ganho: "Habilidade de Suporte" },
  { nivel: 14, ganho: "Habilidade de Suporte" },
  { nivel: 15, ganho: "Habilidade de Suporte" },
  { nivel: 16, ganho: "2 Pontos de Atributo + Habilidade de Suporte" },
  { nivel: 17, ganho: "Habilidade de Suporte" },
  { nivel: 18, ganho: "Habilidade de Suporte" },
  { nivel: 19, ganho: "Habilidade de Suporte" },
  { nivel: 20, ganho: "2 Pontos de Atributo + Habilidade de Suporte + Suporte Absoluto" },
];

export const TABELA_RESTRINGIDO = [
  { nivel: 1,  ganho: "Habilidade Base — Restrito pelos Céus" },
  { nivel: 2,  ganho: "Ataque Furtivo + Habilidade de Restringido" },
  { nivel: 3,  ganho: "Esquiva Sobre-humana + Habilidade de Restringido" },
  { nivel: 4,  ganho: "2 Pontos de Atributo + Dádiva do Céu + Habilidade de Restringido" },
  { nivel: 5,  ganho: "Habilidade de Restringido" },
  { nivel: 6,  ganho: "Habilidade de Restringido" },
  { nivel: 7,  ganho: "Habilidade de Restringido" },
  { nivel: 8,  ganho: "2 Pontos de Atributo + Dádiva do Céu + Habilidade de Restringido" },
  { nivel: 9,  ganho: "Habilidade de Restringido" },
  { nivel: 10, ganho: "Restrição Definitiva + Habilidade de Restringido" },
  { nivel: 11, ganho: "Habilidade de Restringido" },
  { nivel: 12, ganho: "2 Pontos de Atributo + Dádiva do Céu + Habilidade de Restringido" },
  { nivel: 13, ganho: "Habilidade de Restringido" },
  { nivel: 14, ganho: "Habilidade de Restringido" },
  { nivel: 15, ganho: "Habilidade de Restringido" },
  { nivel: 16, ganho: "2 Pontos de Atributo + Dádiva do Céu + Habilidade de Restringido" },
  { nivel: 17, ganho: "Habilidade de Restringido" },
  { nivel: 18, ganho: "Habilidade de Restringido" },
  { nivel: 19, ganho: "Habilidade de Restringido" },
  { nivel: 20, ganho: "2 Pontos de Atributo + Dádiva do Céu + Habilidade de Restringido + Liberação do Destino" },
];

export function tabelaPorEspecializacao(espId) {
  return ({
    "Lutador": TABELA_LUTADOR,
    "Especialista em Combate": TABELA_ESP_COMBATE,
    "Especialista em Técnica": TABELA_ESP_TECNICA,
    "Controlador": TABELA_CONTROLADOR,
    "Suporte": TABELA_SUPORTE,
    "Restringido": TABELA_RESTRINGIDO,
  })[espId] || [];
}
