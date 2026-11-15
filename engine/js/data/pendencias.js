/* =========================================================
   PENDÊNCIAS POR NÍVEL — Cálculo automático do que
   o personagem deveria ter recebido até o nível atual.
   Fonte: Feiticeiros & Maldições — Livro de Regras v2.5.2
   ========================================================= */

import { ESPECIALIZACOES } from './especializacoes.js';
import { infoBonusTreinamento } from './calculos.js';
import { tabelaPorEspecializacao } from './tabelaNivel.js';
import { missingAbilityChoices } from './ability-selection.js';

/* Devolve o limite de atributo (20 padrão; 30 para Restringido) */
export function limiteAtributo(char) {
  if (char.identificacao?.especializacao === "Restringido") return 30;
  return 20;
}

/* Total de "Pontos de Atributo" que o personagem deveria ter recebido
   do level-up (2 pontos a cada 4 níveis) */
export function pontosAtributoRecebidos(char) {
  const nivel = char.identificacao?.nivel || 1;
  return Math.floor(nivel / 4) * 2;
}

/* Quantidade de vezes que o BT subiu (nv 5/9/13/17) */
export function quantidadeSubidasBT(char) {
  const nivel = char.identificacao?.nivel || 1;
  return [5, 9, 13, 17].filter(n => n <= nivel).length;
}

/* Quantas vezes o personagem se tornou mestre em 1 perícia (nv 10) */
export function quantidadeMestrePericia(char) {
  const nivel = char.identificacao?.nivel || 1;
  return nivel >= 10 ? 1 : 0;
}

/* Quantas aptidões amaldiçoadas o personagem deveria ter
   (1 por nível) */
export function aptidoesEsperadas(char) {
  const nivel = char.identificacao?.nivel || 1;
  return nivel;
}

/* Quantas habilidades de especialização OU talentos o personagem deveria ter
   (1 por nível a partir do nv 1) */
export function habilidadesEspEsperadas(char) {
  const nivel = char.identificacao?.nivel || 1;
  return nivel;
}

/* O que a tabela da especialização diz para o nível atual */
export function ganhoDoNivelAtual(char) {
  const nivel = char.identificacao?.nivel || 1;
  const espId = char.identificacao?.especializacao;
  const tab = tabelaPorEspecializacao(espId);
  return tab.find(t => t.nivel === nivel) || null;
}

/* Resumo de pendências: tudo que o jogador deve lembrar */
export function pendenciasPorNivel(char) {
  const nivel = char.identificacao?.nivel || 1;
  const idf = char.identificacao || {};
  const esp = ESPECIALIZACOES.find(e => e.id === idf.especializacao);
  const aptidoes = char.aptidoes || {};
  const habilidades = char.habilidades || [];
  const tab = tabelaPorEspecializacao(idf.especializacao);
  const ganhoAtual = tab.find(t => t.nivel === nivel);
  const btInfo = infoBonusTreinamento(nivel);

  const pendencias = [];

  // 1. +2 Pontos de Atributo a cada 4 níveis
  if (nivel >= 4) {
    const totalReceber = Math.floor(nivel / 4) * 2;
    const totalGasto = (char.pontosAtributoGastos || 0);
    if (totalGasto < totalReceber) {
      pendencias.push({
        tipo: "atributo",
        texto: `${totalReceber - totalGasto} ponto(s) de atributo pendente(s)`,
        nivel,
      });
    }
  }

  // 2. +1 BT em 5/9/13/17 (informativo, já automático)
  if ([5, 9, 13, 17].includes(nivel)) {
    pendencias.push({
      tipo: "bt",
      texto: `Bônus de Treinamento subiu para +${btInfo.valor}!`,
      nivel,
    });
  }

  // 3. Mestre em 1 perícia no nv 10
  if (nivel >= 10) {
    const mestrados = Object.values(char.pericias || {}).filter(p => p.mestre).length;
    const esperado = 1;
    if (mestrados < esperado) {
      pendencias.push({
        tipo: "mestre",
        texto: "Torne-se mestre em 1 perícia à sua escolha",
        nivel: 10,
      });
    }
  }

  // 4. Aptidões amaldiçoadas (1 por nível, todas as especializações)
  const esperado = nivel;
  const escolhasAptidao = aptidoes.escolhas && typeof aptidoes.escolhas === 'object'
    ? Object.values(aptidoes.escolhas).filter(Boolean).length
    : Object.entries(aptidoes).filter(([key]) => !['completas', 'escolhas'].includes(key)).reduce((sum, [, value]) => sum + (Number(value) || 0), 0);
  if (idf.especializacao!=='Restringido' && escolhasAptidao < esperado) {
    pendencias.push({
      tipo: "aptidao",
      texto: `${esperado - escolhasAptidao} aptidão(ões) amaldiçoada(s) pendente(s) (1 por nível)`,
      nivel,
    });
  }

  // 5. Habilidade de especialização ou talento
  if (ganhoAtual) {
    const texto = ganhoAtual.ganho;
    if (/Habilidade de /.test(texto) || /talento/i.test(texto)) {
      const faltam = missingAbilityChoices(char,idf.especializacao);
      if (faltam > 0) {
        pendencias.push({
          tipo: "habilidade",
          texto: `${faltam} escolha(s) de habilidade de ${idf.especializacao} pendente(s)`,
          nivel,
        });
      }
    }
  }

  // 6. Limite de atributo
  const limite = limiteAtributo(char);
  const maiores = Object.entries(char.atributos || {})
    .filter(([_, v]) => v > limite);
  if (maiores.length) {
    pendencias.push({
      tipo: "limite",
      texto: `Atributo(s) acima do limite ${limite}: ${maiores.map(([k]) => k.toUpperCase()).join(", ")}`,
      nivel,
    });
  }

  return pendencias;
}

/* Tabela completa do que a especialização concede até o nível atual,
   com o nível atual em destaque */
export function tabelaAteNivel(char) {
  const nivel = char.identificacao?.nivel || 1;
  const tab = tabelaPorEspecializacao(char.identificacao?.especializacao);
  return tab.map(linha => ({ ...linha, atual: linha.nivel === nivel }));
}
