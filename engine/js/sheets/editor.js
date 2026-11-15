/* =========================================================
   EDITOR — Edição completa da ficha com 10 abas
   ========================================================= */

import { getChar, saveChar, deleteChar, exportChar, importChar } from '../storage/cookies.js';
import { ORIGENS } from '../data/origens.js';
import { CLANS } from '../data/clans.js';
import { ESPECIALIZACOES, ESTILOS_COMBATE, POSTURAS, GRAUS, GRAU_POR_NIVEL, podeAdicionarMulticlasse, listarEspParaMulticlasse, adicionarMulticlasse, removerMulticlasse, migrarEspecializacoes, nivelEfetivo, aplicarTreinamentosEsp } from '../data/especializacoes.js';
import { pendenciasPorNivel, tabelaAteNivel, limiteAtributo, pontosAtributoRecebidos } from '../data/pendencias.js';
import { ARMAS_SIMPLES, ARMAS_COMPLEXAS, UNIFORMES, ESCUDOS, KITS, ITENS_ESPECIAIS } from '../data/equipamentos.js';
import { APTIDOES, TREINAMENTOS, APTIDAO_BY_ID } from '../data/aptidoes.js';
import { PERICIAS, TESTES_RESISTENCIA, TIPOS_DANO, CONDICOES, modificador, formatMod, derivar, totalPericia, bonusTreinamento, infoBonusTreinamento, pvInicial, dadoVida, peInicial, pePorNivel, aplicarLevelUp, recalcularPontos, tempMaxPara, setTempHP, setTempPE } from '../data/calculos.js';
import { toast } from '../ui/toast.js';
import { CUSTOM_ORIGIN, customOriginForm } from '../ui/custom-origin.js';
import { renderAbilityCatalog } from '../ui/ability-catalog.js';
import {isRestricted,resourcePoints,labelResources} from '../data/resources.js';
import {renderMartial,renderGifts,renderTraining} from '../ui/restricted.js?v=20261115-training-2';
import {renderAttackChecks} from '../ui/attack-checks.js';
import { confirmDialog, promptDialog, openModal, alertDialog, el } from '../ui/modais.js';

const FAB_SECTIONS = [
  { id: "ident", label: "Identificação", icon: "👤" },
  { id: "aspectos", label: "Aspectos", icon: "📋" },
  { id: "atributos", label: "Atributos", icon: "📊" },
  { id: "recursos", label: "Recursos", icon: "💎" },
  { id: "pericias", label: "Perícias & TR", icon: "🎯" },
  { id: "ataques", label: "Ataques & CDs", icon: "⚔" },
  { id: "tecnica", label: "Técnica & Feitiços", icon: "🌀" },
  { id: "habilidades", label: "Habilidades", icon: "⭐" },
  { id: "inventario", label: "Inventário", icon: "🎒" },
  { id: "anotacoes", label: "Anotações", icon: "🗒" },
];

let state = null;
let saveTimeout = null;

function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  setEditorSaveState('saving');
  saveTimeout = setTimeout(() => {
    if (!state) return;
    try { saveChar(state); setEditorSaveState('saved'); }
    catch (error) { setEditorSaveState('error'); toast(error.message, "error"); }
  }, 400);
}

function setEditorSaveState(value){document.querySelector('.save-indicator')?.setAttribute('data-state',value);}

export function renderEditor(app, id) {
  const data = getChar(id);
  if (!data) {
    app.innerHTML = `
      <div class="app-main">
        <div class="empty-state">
          <h3>Ficha não encontrada</h3>
          <p>Esta ficha não existe ou foi excluída.</p>
          <p style="margin-top: var(--gap-4);">
            <a href="#/characters" class="btn btn--primary">Voltar para a lista</a>
          </p>
        </div>
      </div>
    `;
    return;
  }
  migrarEspecializacoes(data);
  recalcularPontos(data);
  state = data;

  app.innerHTML = `
    <div class="app-header">
      <div class="app-header__row">
        <a href="#/characters" class="app-header__brand">
          <div class="app-header__brand-mark">FM</div>
          <div>
            <div>${escapeHtml(state.identificacao?.nome) || "Ficha sem nome"}</div>
            <small>Nv ${state.identificacao?.nivel || 1} • ${escapeHtml(state.identificacao?.origem===CUSTOM_ORIGIN?`${state.origemPersonalizada?.nome||'Origem Personalizada'} (Homebrew)`:state.identificacao?.origem) || "—"} • ${escapeHtml(state.identificacao?.especializacao) || "—"}</small>
          </div>
        </a>
        <div class="app-header__spacer"></div>
        <div class="save-indicator" data-state="saved">
          <span class="save-indicator__dot"></span>
          <span>Salvo</span>
        </div>
        <div class="app-header__actions">
          <a href="#/character/${id}/combat" class="btn btn--subtle btn--sm">
            <span class="btn__icon" aria-hidden="true">⚔</span><span>Combate</span>
          </a>
          <a href="#/character/${id}/summons" class="btn btn--subtle btn--sm">
            <span class="btn__icon" aria-hidden="true">⛧</span><span>Invocações</span>
          </a>
          <button class="btn btn--ghost btn--sm" id="btn-export">
            <span class="btn__icon" aria-hidden="true">⤓</span><span>Exportar</span>
          </button>
          <button class="btn btn--danger btn--sm" id="btn-delete">
            <span class="btn__icon" aria-hidden="true">🗑</span><span>Excluir</span>
          </button>
        </div>
      </div>
    </div>
    <div class="app-main" style="padding-bottom: 100px;">
      <div id="editor-content"></div>
    </div>

    <div class="fab-stack" id="fab-stack">
      <div class="fab-menu" id="fab-menu" hidden>
        ${FAB_SECTIONS.map(s => `
          <button class="fab-item" data-section="${s.id}">
            <span class="fab-item__icon" aria-hidden="true">${s.icon}</span>
            <span>${s.id==='tecnica'&&isRestricted(state)?'Estilo e Técnicas Marciais':s.label}</span>
          </button>
        `).join("")}
      </div>
      <button class="fab" id="fab-toggle" aria-label="Abrir menu de seções">
        <span class="fab__icon" id="fab-icon">+</span>
      </button>
    </div>
  `;

  renderVisaoCentral(app.querySelector("#editor-content"));
  bindFab(app, id);

  // Ações
  app.querySelector("#btn-export").onclick = () => exportar(id);
  app.querySelector("#btn-delete").onclick = async () => {
    const ok = await confirmDialog("Excluir esta ficha permanentemente?", { title: "Excluir", danger: true, confirmText: "Excluir" });
    if (ok) {
      deleteChar(id);
      toast("Ficha excluída", "success");
      location.hash = "#/characters";
    }
  };

  return () => { if (saveTimeout) clearTimeout(saveTimeout); };
}

function renderTab(tab, container) {
  try{
  if (tab === "ident") return renderIdentificacao(container);
  if (tab === "aspectos") return renderAspectos(container);
  if (tab === "atributos") return renderAtributos(container);
  if (tab === "recursos") return renderRecursos(container);
  if (tab === "pericias") return renderPericias(container);
  if (tab === "ataques") return renderAtaques(container);
  if (tab === "tecnica") return renderTecnica(container);
  if (tab === "habilidades") return renderHabilidades(container);
  if (tab === "inventario") return renderInventario(container);
  if (tab === "anotacoes") return renderAnotacoes(container);
  }finally{labelResources(container,state);}
}

/* =========================================================
   VISÃO CENTRAL — Tela principal da ficha
   ========================================================= */

function renderVisaoCentral(container) {
  if (!container) container = document.getElementById("editor-content");
  if (!container) return;
  const idf = state.identificacao = state.identificacao || {};
  const atr = state.atributos = state.atributos || {};
  const p = resourcePoints(state);
  const d = derivar(state);
  const nivel = idf.nivel || 1;
  const btInfo = infoBonusTreinamento(nivel);
  const esp = ESPECIALIZACOES.find(e => e.id === idf.especializacao);

  const ATRIBUTOS = [
    { id: "forca", nome: "Força", abbr: "FOR" },
    { id: "destreza", nome: "Destreza", abbr: "DES" },
    { id: "constituicao", nome: "Constituição", abbr: "CON" },
    { id: "inteligencia", nome: "Inteligência", abbr: "INT" },
    { id: "sabedoria", nome: "Sabedoria", abbr: "SAB" },
    { id: "presenca", nome: "Presença", abbr: "PRE" },
  ];

  const pericias = state.pericias || {};
  const periciaRows = [...PERICIAS,...TESTES_RESISTENCIA.map(p=>({...p,tr:true}))].map(per => {
    const pd = (per.tr?state.testesResistencia:pericias)?.[per.id] || {};
    const mod = d.mods[per.atributo] || 0;
    const tot = totalPericia({
      modAtributo: mod,
      treinado: !!pd.treino,
      mestre: !!pd.mestre,
      nivel,
      outros: pd.outros || 0,
      prof: bonusTreinamento(nivel),
    });
    const tags = [];
    if (pd.treino) tags.push('<span class="tag tag--accent" style="font-size:9px;padding:1px 5px;">T</span>');
    if (pd.mestre) tags.push('<span class="tag" style="font-size:9px;padding:1px 5px;background:color-mix(in srgb, var(--site-color-4ade80, #4ade80) 15%, transparent);border-color:color-mix(in srgb, var(--site-color-4ade80, #4ade80) 30%, transparent);color:var(--success);">M</span>');
    return `
      <button type="button" class="visao-pericia roll-trigger" data-roll-name="${escapeHtml(per.nome)}" data-roll-bonus="${tot}" title="Rolar ${escapeHtml(per.nome)}">
        <span class="visao-pericia__nome">${per.nome}${per.tr?' (TR)':''}</span>
        <span class="visao-pericia__total">${formatMod(tot)}</span>
        <span class="visao-pericia__tags">${tags.join("")}</span>
      </button>
    `;
  }).join("");

  // Função para gerar lista de ataques
  const ataques = state.ataques || [];
  const atkRows = ataques.map(a => {
    const mod = d.mods[a.atributo] || 0;
    const bonus = mod + (a.bonus || 0) + bonusTreinamento(nivel) + Math.floor(nivel/2);
    return `
      <div class="visao-atk">
        <div>
          <button type="button" class="visao-atk__nome roll-trigger" data-roll-name="Ataque: ${escapeHtml(a.nome)}" data-roll-bonus="${bonus}">${escapeHtml(a.nome)} ⚄</button>
          <div class="visao-atk__meta text-xs text-mute">${a.alcance || "—"} • ${a.tipo || "—"}</div>
        </div>
        <div class="text-right">
          <div class="text-mono text-accent" style="font-size: var(--fs-md); font-weight: 600;">${formatMod(bonus)}</div>
          <div class="text-mono text-xs text-soft">${a.dano || "1d8"}</div>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="visao-central anim-fade-in">

      <!-- Recursos -->
      <div class="card visao-card visao-card--destaque" id="visao-recursos">
        <div class="visao-trackers">
          <div class="visao-tracker">
            <div class="row row--between">
              <span class="visao-tracker__label">PV</span>
              <span class="text-xs text-mute">PV máximo</span>
            </div>
            <div class="visao-tracker__bar">
              <div class="visao-tracker__fill" style="width: ${Math.min(100, (p.pvAtual / Math.max(1, p.pvMax)) * 100)}%;"></div>
              ${p.pvTemp ? `<div class="visao-tracker__fill-temp" style="width: ${Math.min(100 - Math.min(100, (p.pvAtual / Math.max(1, p.pvMax)) * 100), (p.pvTemp / Math.max(1, p.pvMax)) * 100)}%;"></div>` : ""}
            </div>
            <div class="row row--between" style="margin-top: 6px;">
              <span class="text-mono" style="font-size: var(--fs-2xl); font-weight: 700; color: var(--text-base);">${p.pvAtual ?? 0}${p.pvTemp ? ` <span style="font-size: var(--fs-md); color: var(--success);">(+${p.pvTemp})</span>` : ""}</span>
              <span class="text-mono text-soft">/ ${p.pvMax ?? 0}</span>
            </div>
            <div class="visao-tracker__btns">
              <button class="visao-btn" data-pv-step="-5" aria-label="−5 PV">−5</button>
              <button class="visao-btn" data-pv-step="-1" aria-label="−1 PV">−</button>
              <button class="visao-btn" data-pv-step="1" aria-label="+1 PV">+</button>
              <button class="visao-btn" data-pv-step="5" aria-label="+5 PV">+5</button>
            </div>
          </div>
          <div class="visao-tracker">
            <div class="row row--between">
              <span class="visao-tracker__label">PE</span>
              <span class="text-xs text-mute">Energia Amaldiçoada</span>
            </div>
            <div class="visao-tracker__bar">
              <div class="visao-tracker__fill" style="width: ${Math.min(100, (p.peAtual / Math.max(1, p.peMax)) * 100)}%; background: linear-gradient(90deg, var(--site-color-790c1a, #790c1a), var(--site-color-ff263e, #ff263e));"></div>
              ${p.peTemp ? `<div class="visao-tracker__fill-temp" style="width: ${Math.min(100 - Math.min(100, (p.peAtual / Math.max(1, p.peMax)) * 100), (p.peTemp / Math.max(1, p.peMax)) * 100)}%;"></div>` : ""}
            </div>
            <div class="row row--between" style="margin-top: 6px;">
              <span class="text-mono" style="font-size: var(--fs-2xl); font-weight: 700; color: var(--text-base);">${p.peAtual ?? 0}${p.peTemp ? ` <span style="font-size: var(--fs-md); color: var(--success);">(+${p.peTemp})</span>` : ""}</span>
              <span class="text-mono text-soft">/ ${p.peMax ?? 0}</span>
            </div>
            <div class="visao-tracker__btns">
              <button class="visao-btn" data-pe-step="-5" aria-label="−5 PE">−5</button>
              <button class="visao-btn" data-pe-step="-1" aria-label="−1 PE">−</button>
              <button class="visao-btn" data-pe-step="1" aria-label="+1 PE">+</button>
              <button class="visao-btn" data-pe-step="5" aria-label="+5 PE">+5</button>
            </div>
          </div>
        </div>
        <div class="visao-stats">
          <div class="visao-stat">
            <div class="visao-stat__label">DEF</div>
            <div class="visao-stat__value">${d.defesa}</div>
          </div>
          <button type="button" class="visao-stat roll-trigger" data-roll-name="Iniciativa" data-roll-bonus="${d.iniciativa}" title="Rolar iniciativa">
            <div class="visao-stat__label">INIC ⚄</div>
            <div class="visao-stat__value">${formatMod(d.iniciativa)}</div>
          </button>
          <div class="visao-stat">
            <div class="visao-stat__label">ATEN</div>
            <div class="visao-stat__value">${d.atencao}</div>
          </div>
          <div class="visao-stat">
            <div class="visao-stat__label">CARGA</div>
            <div class="visao-stat__value">${d.limite}</div>
          </div>
          <div class="visao-stat" title="Bônus de Treinamento — ${btInfo.faixa}${btInfo.proxMudanca ? ` (próx. mudança nv ${btInfo.proxMudanca})` : ''}">
            <div class="visao-stat__label">BT</div>
            <div class="visao-stat__value">+${d.prof}</div>
          </div>
        </div>
      </div>

      <!-- Atributos -->
      <div class="card visao-card">
        <div class="row row--between" style="margin-bottom: var(--gap-3);">
          <strong>Atributos</strong>
          <span class="text-xs text-mute">${esp ? esp.nome : "—"}</span>
        </div>
        <div class="visao-atributos">
          ${ATRIBUTOS.map(a => {
            const v = atr[a.id] || 10;
            const m = d.mods[a.id] || 0;
            return `
              <div class="visao-attr">
                <div class="visao-attr__abbr">${a.abbr}</div>
                <input class="visao-attr__value" type="number" min="1" max="30" value="${v ?? 10}" data-atr="${a.id}" title="Clique para editar">
                <button type="button" class="roll-trigger" data-roll-name="${a.nome}" data-roll-bonus="${m}" title="Rolar teste de ${a.nome}">${formatMod(m)} ⚄</button>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Especializações (multiclasse) -->
      ${(() => {
        const lista = state.identificacao.especializacoes || [];
        if (lista.length === 0) return "";
        return `
        <div class="card visao-card">
          <div class="row row--between" style="margin-bottom: var(--gap-2);">
            <strong>Especializações</strong>
            <span class="text-xs text-mute">${lista.length === 1 ? "single-class" : "multiclasse"}</span>
          </div>
          <div class="visao-esps">
            ${lista.map((item, idx) => {
              const e = ESPECIALIZACOES.find(x => x.id === item.id);
              const isPrim = idx === 0;
              const nvEfet = nivelEfetivo(state, item.id);
              return `
                <div class="visao-esp ${isPrim ? "visao-esp--prim" : ""}">
                  <span class="visao-esp__dot" style="background:${e?.cor || "var(--text-mute)"}"></span>
                  <div class="visao-esp__info">
                    <div class="visao-esp__nome">${escapeHtml(e?.nome || item.id)}${isPrim ? ' <span class="tag tag--accent" style="font-size:9px;padding:1px 5px;">P</span>' : ""}</div>
                    <div class="visao-esp__meta text-xs text-mute">Nv ${item.nivel}${nvEfet !== item.nivel ? ` → efetivo ${nvEfet}` : ""}</div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>`;
      })()}

      <!-- Pendências do Nível (regra oficial) -->
      ${(() => {
        const pend = pendenciasPorNivel(state);
        if (pend.length === 0) return "";
        return `
        <div class="card visao-card" id="visao-pendencias" style="border-left: 3px solid var(--warning);">
          <div class="row row--between" style="margin-bottom: var(--gap-2);">
            <strong>📋 Pendências de Nv ${idf.nivel || 1}</strong>
            <span class="text-xs text-mute">${pend.length} pendência(s)</span>
          </div>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px;">
            ${pend.map(p => `
              <li class="text-sm" style="display: flex; align-items: flex-start; gap: 8px;">
                <span class="tag" style="background: color-mix(in srgb, var(--site-color-fbbf24, #fbbf24) 15%, transparent); border-color: color-mix(in srgb, var(--site-color-fbbf24, #fbbf24) 40%, transparent); color: var(--warning); padding: 2px 6px; font-size: 9px; flex-shrink: 0;">Nv ${p.nivel}</span>
                <span>${escapeHtml(p.texto)}</span>
              </li>
            `).join("")}
          </ul>
        </div>`;
      })()}

      <!-- CDs -->
      <div class="visao-cds">
        <div class="card visao-card" style="text-align: center;">
          <div class="text-xs text-soft text-uppercase" style="letter-spacing: 0.08em;">CD Esp.</div>
          <div class="text-mono text-accent" style="font-size: var(--fs-3xl); font-weight: 700; line-height: 1; margin: 4px 0;">${d.cdEspecializacao}</div>
          <div class="text-xs text-mute">8 + mod + prof + nv/2</div>
        </div>
        <div class="card visao-card" style="text-align: center;">
          <div class="text-xs text-soft text-uppercase" style="letter-spacing: 0.08em;">CD Ama.</div>
          <div class="text-mono text-accent" style="font-size: var(--fs-3xl); font-weight: 700; line-height: 1; margin: 4px 0;">${d.cdAmaldicoado}</div>
          <div class="text-xs text-mute">8 + mod + prof + nv/2</div>
        </div>
      </div>

      <!-- Perícias -->
      <div class="card visao-card">
        <div class="row row--between" style="margin-bottom: var(--gap-3);">
          <strong>Perícias & Testes de Resistência</strong>
          <span class="text-xs text-mute">Prof. atual: +${bonusTreinamento(nivel)}</span>
        </div>
        <div class="visao-pericias">
          ${periciaRows}
        </div>
      </div>

      <!-- Ataques -->
      ${ataques.length > 0 ? `
        <div class="card visao-card">
          <div class="row row--between" style="margin-bottom: var(--gap-3);">
            <strong>Ataques Principais</strong>
            <span class="text-xs text-mute">${ataques.length} ${ataques.length === 1 ? "ataque" : "ataques"}</span>
          </div>
          <div class="visao-ataques">
            ${atkRows}
          </div>
        </div>
      ` : ""}

    </div>
  `;

  // Atributos editáveis na visão central
  renderAttackChecks(container.querySelector('.visao-central'),state,scheduleSave);
  bindAtributoInputs(container, () => {
    renderVisaoCentral(container);
  });

  // Botões +/- de PV/PE
  bindStepButtons(container, "pv", "pvMax", "pvAtual");
  bindStepButtons(container, "pe", "peMax", "peAtual");
  // (Estamina removida — Restringido segue tabela oficial, sem Est)
  // Botões de temp (PV/PE)
  bindTempButtons(container, "pv");
  bindTempButtons(container, "pe");
  labelResources(container,state);
}

/* =========================================================
   FAB — Botão flutuante que abre menu de seções
   ========================================================= */

function bindFab(app, id) {
  const fab = app.querySelector("#fab-toggle");
  const menu = app.querySelector("#fab-menu");
  const icon = app.querySelector("#fab-icon");
  if (!fab || !menu || !icon) return;

  let isOpen = false;

  fab.addEventListener("click", () => {
    isOpen = !isOpen;
    menu.hidden = !isOpen;
    fab.classList.toggle("fab--open", isOpen);
    icon.textContent = isOpen ? "×" : "+";
  });

  menu.querySelectorAll("[data-section]").forEach(btn => {
    btn.addEventListener("click", () => {
      const sec = btn.dataset.section;
      openSectionModal(sec, id);
      // Não fecha o menu — usuário pode escolher outra seção
    });
  });
}

function openSectionModal(sec, id) {
  const label = sec==='tecnica'&&isRestricted(state)?'Estilo e Técnicas Marciais':FAB_SECTIONS.find(s => s.id === sec)?.label || sec;
  const wrap = document.createElement("div");
  wrap.id = "section-modal-body";
  wrap.style.minHeight = "60vh";
  wrap.innerHTML = `<div class="section-loading text-center text-soft" style="padding: var(--gap-6);">Carregando…</div>`;
  openModal({
    title: label,
    body: wrap,
    fullscreen: true,
    onClose: () => {
      // Re-renderiza a visão central com os valores atualizados
      renderVisaoCentral();
      scheduleSave();
    },
  });
  // Renderiza a seção após o modal abrir
  setTimeout(() => {
    const body = document.getElementById("section-modal-body");
    if (body) {
      body.innerHTML = "";
      try {
        // renderTab chama bindFields internamente para o path da seção
        renderTab(sec, body);
      } catch (e) {
        console.error("Erro ao renderizar seção", sec, e);
        body.innerHTML = `<p class="text-danger">Erro ao carregar seção: ${e.message}</p>`;
      }
    }
  }, 30);
}

/* =========================================================
   LEVEL UP — Modal com relatório
   ========================================================= */

function showLevelUpReport(relatorio, novoNivel) {
  const items = relatorio.map(l => {
    if (l.tipo === "valor") {
      return `<li class="levelup-item levelup-item--valor"><span class="text-accent">●</span> ${escapeHtml(l.texto)}</li>`;
    }
    if (l.tipo === "aviso") {
      return `<li class="levelup-item levelup-item--aviso"><span class="text-warning">◆</span> ${escapeHtml(l.texto)}</li>`;
    }
    return `<li class="levelup-item levelup-item--info"><span class="text-soft">▸</span> ${escapeHtml(l.texto)}</li>`;
  }).join("");

  const body = `
    <div class="levelup-report">
      <div class="levelup-header">
        <div class="levelup-badge">Nv ${novoNivel}</div>
        <p class="text-soft text-sm" style="margin-top: var(--gap-2);">
          Recursos derivados foram recalculados automaticamente. Os itens marcados com ◆ são escolhas que você deve fazer.
        </p>
      </div>
      <ul class="levelup-list">
        ${items}
      </ul>
    </div>
  `;

  openModal({
    title: "Mudanças de Nível",
    body,
    confirmText: "Entendi",
  });
}

/* =========================================================
   ABA 1 — IDENTIFICAÇÃO
   ========================================================= */

function renderIdentificacao(container) {
  const idf = state.identificacao;
  const espacos = [
    fieldInput("Nome", "nome", idf.nome, "text", "Kento Nanami"),
    fieldInput("Jogador", "jogador", idf.jogador, "text", "Seu nome"),
    fieldInput("Campanha", "campanha", idf.campanha, "text", "Minha campanha"),
  ];
  const num = [
    fieldInput("Nível", "nivel", idf.nivel, "number", "1", { min: 1, max: 20 }),
    fieldInput("Experiência", "exp", idf.exp, "number", "0", { min: 0 }),
    fieldInput("Grau", "grau", idf.grau, "select", null, { options: GRAUS }),
  ];
  const escolhas = [
    fieldInput("Origem", "origem", idf.origem, "select", null, { options: ORIGENS.map(o => o.nome) }),
    fieldInput("Especialização", "especializacao", idf.especializacao, "select", null, { options: opcoesEspecializacaoParaOrigem(idf.origem) }),
    fieldInput("Clã (se Herdado)", "clan", idf.clan, "select", null, { options: ["", ...CLANS.map(c => c.nome)] }),
    fieldInput(isRestricted(state)?"Estilo Marcial":"Técnica Amaldiçoada", "tecnica", idf.tecnica, "text", isRestricted(state)?"Nome do estilo":"Proporções, Dez Sombras…"),
  ];

  // Lista de especializações (multiclasse)
  const listaEsp = (idf.especializacoes && idf.especializacoes.length)
    ? idf.especializacoes
    : (idf.especializacao ? [{ id: idf.especializacao, nivel: idf.nivel || 1 }] : []);
  const podeMulticlasse = idf.especializacao !== "Restringido";
  const temEspSecundaria = listaEsp.length > 0;
  const espItems = listaEsp.map((item, idx) => {
    const esp = ESPECIALIZACOES.find(e => e.id === item.id);
    const isPrim = idx === 0;
    const nvEfet = nivelEfetivo(state, item.id);
    return `
      <div class="esp-item ${isPrim ? "esp-item--primaria" : ""}">
        <span class="esp-item__dot" style="background:${esp?.cor || "var(--text-mute)"}"></span>
        <div class="esp-item__info">
          <span class="esp-item__nome">${escapeHtml(esp?.nome || item.id)}</span>
          <span class="esp-item__meta">Nv ${item.nivel}${nvEfet !== item.nivel ? ` • Nv efetivo para hab: ${nvEfet}` : ""}</span>
        </div>
        ${isPrim
          ? '<span class="tag tag--accent">Primária</span>'
          : `<button class="esp-item__remove" data-action="remover-esp" data-id="${escapeHtml(item.id)}" aria-label="Remover">×</button>`}
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="card">
      <div class="section-title">Básico <small>nome, jogador, campanha</small></div>
      <div class="grid grid-3">${espacos.map(renderField).join("")}</div>
    </div>
    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Progressão <small>nível, XP, grau</small></div>
      <div class="grid grid-3">${num.map(renderField).join("")}</div>
    </div>
    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Escolhas de classe <small>origem, especialização, clã, técnica</small></div>
      <div class="grid grid-2">${escolhas.map(renderField).join("")}</div>
    </div>
    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">
        Especializações
        <small>multiclasse: combine especializações respeitando os requisitos de atributo</small>
      </div>
      <div class="esp-list">${espItems || '<p class="text-mute text-sm">Nenhuma especialização definida.</p>'}</div>
      ${podeMulticlasse && temEspSecundaria
        ? `<button class="btn btn--subtle" id="btn-add-multiclasse" style="margin-top: var(--gap-3);">
            <span class="btn__icon" aria-hidden="true">+</span><span>Adicionar Multiclasse</span>
          </button>`
        : ""}
      ${!podeMulticlasse
        ? '<p class="text-xs text-mute" style="margin-top: var(--gap-3);">Restringidos não podem realizar Multiclasse (regra do livro).</p>'
        : ""}
    </div>

    ${(() => {
      const tab = tabelaAteNivel(state);
      if (tab.length === 0) return "";
      return `
    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">
        Progressão de ${escapeHtml(idf.especializacao || "—")}
        <small>tabela de Nv 1 a 20 — o nível atual está destacado</small>
      </div>
      <div class="tabela-nivel" style="display: flex; flex-direction: column; gap: 2px; max-height: 360px; overflow-y: auto;">
        ${tab.map(l => `
          <div class="tabela-nivel__linha ${l.atual ? "tabela-nivel__linha--atual" : ""}" style="display: flex; gap: 10px; padding: 6px 8px; border-radius: var(--radius-sm); ${l.atual ? "background: color-mix(in srgb, var(--site-color-dc172c, #dc172c) 15%, transparent); border: 1px solid var(--purple);" : ""}">
            <span class="text-mono ${l.atual ? "text-accent" : "text-mute"}" style="min-width: 30px; font-weight: 600;">Nv ${l.nivel}</span>
            <span class="text-sm" style="flex: 1; ${l.atual ? "color: var(--text-base); font-weight: 500;" : "color: var(--text-soft);"}">${escapeHtml(l.ganho)}</span>
          </div>
        `).join("")}
      </div>
    </div>`;
    })()}
  `;

  bindFields(container, "identificacao");
  if(idf.origem===CUSTOM_ORIGIN){
    state.origemPersonalizada ||= {nome:'',caracteristicas:[]};
    const originSelect=container.querySelector('select[data-key="origem"],select[data-k="origem"],select[data-field="origem"]')||[...container.querySelectorAll('select')].find(s=>s.value===CUSTOM_ORIGIN);
    if(originSelect){const option=[...originSelect.options].find(o=>o.value===CUSTOM_ORIGIN);if(option)option.textContent=`${state.origemPersonalizada.nome||'Origem Personalizada'} (Homebrew)`;
      const form=customOriginForm(state.origemPersonalizada,()=>{
        option.textContent=`${state.origemPersonalizada.nome||'Origem Personalizada'} (Homebrew)`;
        state.origemDetalhes={...state.origemDetalhes,personalizado:true,caracteristicas:[...state.origemPersonalizada.caracteristicas]};scheduleSave();
      });form.style.gridColumn='1 / -1';originSelect.closest('.field')?.after(form);
    }
  }

  // Eventos de multiclasse
  const btnAdd = container.querySelector("#btn-add-multiclasse");
  if (btnAdd) btnAdd.onclick = () => openAddMulticlasseModal();
  container.querySelectorAll('[data-action="remover-esp"]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const r = removerMulticlasse(state, id);
      if (!r.ok) {
        toast(r.motivo, "error");
        return;
      }
      toast("Especialização removida", "success");
      // Re-renderizar
      const content = container.closest("#editor-content") || document.getElementById("editor-content");
      if (content) {
        renderIdentificacao(content);
        renderVisaoCentral(content);
      }
      scheduleSave();
    };
  });
}

function opcoesEspecializacaoParaOrigem(origem) {
  if (origem === "Restringido") return ["Restringido"];
  if (origem === "Sem Técnica") return ESPECIALIZACOES.filter(e => e.id !== "Restringido" && e.id !== "Especialista em Técnica").map(e => e.nome);
  return ESPECIALIZACOES.filter(e => e.id !== "Restringido").map(e => e.nome);
}

function fieldInput(label, key, val, tipo = "text", placeholder = "", extra = {}) {
  let control = "";
  if (tipo === "select") {
    const options = (extra.options || []).map(o => `<option value="${escapeHtml(o)}" ${o === val ? "selected" : ""}>${escapeHtml(o) || "—"}</option>`).join("");
    control = `<select class="select" data-field="${key}">${options}</select>`;
  } else {
    const attrs = Object.entries(extra).filter(([k]) => k !== "options").map(([k, v]) => `${k}="${v}"`).join(" ");
    control = `<input class="input" data-field="${key}" type="${tipo}" placeholder="${escapeHtml(placeholder || "")}" value="${val ?? ""}" ${attrs}>`;
  }
  return `
    <div class="field">
      <label class="field__label">${label}</label>
      ${control}
    </div>
  `;
}

function renderField(html) {
  return html;
}

function bindFields(container, path) {
  container.querySelectorAll("[data-field]").forEach(inp => {
    const handler = () => {
      const key = inp.dataset.field;
      let v = inp.value;
      if (inp.type === "number") v = Number(v) || 0;

      // Caso especial: nível — calcular nivelAntigo ANTES de mutar
      // (aplicarLevelUp lê idf.nivel para detectar mudança)
      if (path === "identificacao" && key === "nivel") {
        const nivelAntigo = state.identificacao?.nivel || 1;
        const novoNivel = Math.max(1, Math.min(20, Number(v) || 1));
        if (novoNivel === nivelAntigo) {
          scheduleSave();
          return;
        }
        const lista = state.identificacao.especializacoes || [];
        const isMulti = lista.length > 1;
        if (isMulti) {
          promptEspLevelUp(novoNivel, (espId) => {
            const result = aplicarLevelUp(state, novoNivel, espId);
            if (result.mudou) showLevelUpReport(result.relatorio, novoNivel);
            recarregarTudoAposNivel();
            scheduleSave();
            const content = document.getElementById("editor-content");
            if (content) renderIdentificacao(content);
          });
        } else {
          const result = aplicarLevelUp(state, novoNivel);
          if (result.mudou) showLevelUpReport(result.relatorio, novoNivel);
          recarregarTudoAposNivel();
          scheduleSave();
        }
        return;
      }

      if (!state[path]) state[path] = {};
      state[path][key] = v;
      // Reage a mudanças que afetam outras coisas
      if (path === "identificacao" && key === "origem") {
        // Limpar especialização se incompatível
        const validas = opcoesEspecializacaoParaOrigem(v);
        if (!validas.includes(state.identificacao.especializacao)) {
          state.identificacao.especializacao = "";
        }
        // Re-render para atualizar dropdown de especialização
        renderTab("ident", container);
        scheduleSave();
        return;
      }
      if (path === "identificacao" && key === "especializacao") {
        // Aplica treinamentos da nova especialização (perícias + TR)
        // Apenas se o char já tem nível (não é criação inicial via wizard)
        if (state.identificacao?.nivel) {
          const result = aplicarTreinamentosEsp(state, v);
          // Se exige escolha de TR, perguntar (mesmo componente do wizard)
          if (result.exigeEscolhaTR.length > 0) {
            const opcoes = result.exigeEscolhaTR.map(id => {
              const tr = TESTES_RESISTENCIA.find(t => t.id === id);
              return tr ? { id: tr.id, nome: tr.nome, atributo: tr.atributo } : { id, nome: id, atributo: "—" };
            });
            import('../ui/modais.js').then(({ promptEscolherTR }) => {
              promptEscolherTR(opcoes, {
                titulo: `TR de ${v}`,
                mensagem: "Sua nova especialização permite escolher 1 TR. (Para reescolher, desmarque na aba Perícias.)",
              }).then(escolhidos => {
                if (escolhidos.length > 0) {
                  for (const trid of escolhidos) {
                    if (!state.testesResistencia[trid]) state.testesResistencia[trid] = { treino: false, mestre: false, outros: 0 };
                    state.testesResistencia[trid].treino = true;
                  }
                }
                recarregarVisaoCentral();
                scheduleSave();
              });
            });
          } else {
            recarregarVisaoCentral();
          }
        }
        scheduleSave();
        return;
      }
      scheduleSave();
    };
    inp.addEventListener("change", handler);
    if (inp.tagName === "INPUT" && inp.type === "text") {
      inp.addEventListener("input", handler);
    } else if (inp.tagName === "SELECT") {
      inp.addEventListener("change", handler);
    }
  });
}

function recarregarVisaoCentral() {
  const content = document.getElementById("editor-content");
  if (content) renderVisaoCentral(content);
}

/* =========================================================
   ABA 2 — ASPECTOS
   ========================================================= */

function renderAspectos(container) {
  const asp = state.aspectos || {};
  const apar = state.aparencia || {};
  container.innerHTML = `
    <div class="card">
      <div class="section-title">Aspectos Pessoais <small>personalidade, ideais, etc.</small></div>
      <div class="grid grid-2">
        <div class="field">
          <label class="field__label">Traços de Personalidade</label>
          <textarea class="textarea" data-field="personalidade" rows="3">${escapeHtml(asp.personalidade)}</textarea>
        </div>
        <div class="field">
          <label class="field__label">Ideais</label>
          <textarea class="textarea" data-field="ideais" rows="3">${escapeHtml(asp.ideais)}</textarea>
        </div>
        <div class="field">
          <label class="field__label">Ligações</label>
          <textarea class="textarea" data-field="ligacoes" rows="3">${escapeHtml(asp.ligacoes)}</textarea>
        </div>
        <div class="field">
          <label class="field__label">Complicações</label>
          <textarea class="textarea" data-field="complicacoes" rows="3">${escapeHtml(asp.complicacoes)}</textarea>
        </div>
        <div class="field" style="grid-column: 1/-1;">
          <label class="field__label">Domínio Inato</label>
          <textarea class="textarea" data-field="dominioInato" rows="3" placeholder="Qual seria o lugar que define o seu personagem?">${escapeHtml(asp.dominioInato)}</textarea>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Aparência <small>características físicas</small></div>
      <div class="grid grid-3">
        <div class="field"><label class="field__label">Idade</label><input class="input" data-field="idade" value="${escapeHtml(apar.idade)}"></div>
        <div class="field"><label class="field__label">Altura</label><input class="input" data-field="altura" value="${escapeHtml(apar.altura)}"></div>
        <div class="field"><label class="field__label">Peso</label><input class="input" data-field="peso" value="${escapeHtml(apar.peso)}"></div>
        <div class="field"><label class="field__label">Gênero</label><input class="input" data-field="genero" value="${escapeHtml(apar.genero)}"></div>
        <div class="field"><label class="field__label">Cabelos</label><input class="input" data-field="cabelos" value="${escapeHtml(apar.cabelos)}"></div>
        <div class="field"><label class="field__label">Olhos</label><input class="input" data-field="olhos" value="${escapeHtml(apar.olhos)}"></div>
        <div class="field"><label class="field__label">Pele</label><input class="input" data-field="pele" value="${escapeHtml(apar.pele)}"></div>
        <div class="field"><label class="field__label">Roupas</label><input class="input" data-field="roupas" value="${escapeHtml(apar.roupas)}"></div>
        <div class="field"><label class="field__label">Marcas</label><input class="input" data-field="marcas" value="${escapeHtml(apar.marcas)}"></div>
      </div>
    </div>
  `;
  container.querySelectorAll("[data-field]").forEach(inp => {
    const handler = () => {
      const key = inp.dataset.field;
      state.aspectos = state.aspectos || {};
      state.aparencia = state.aparencia || {};
      if (["idade", "altura", "peso", "genero", "cabelos", "olhos", "pele", "roupas", "marcas"].includes(key)) {
        state.aparencia[key] = inp.value;
      } else {
        state.aspectos[key] = inp.value;
      }
      scheduleSave();
    };
    inp.addEventListener("input", handler);
    inp.addEventListener("change", handler);
  });
}

/* =========================================================
   ABA 3 — ATRIBUTOS & DEFENSIVOS
   ========================================================= */

function renderAtributos(container) {
  const atr = state.atributos || {};
  const def = state.defesa || {};
  const d = derivar(state);
  const modFor = d.mods.forca;
  const modDes = d.mods.destreza;
  const modCon = d.mods.constituicao;
  const modInt = d.mods.inteligencia;
  const modSab = d.mods.sabedoria;
  const modPre = d.mods.presenca;

  container.innerHTML = `
    <div class="card">
      <div class="section-title">Atributos <small>modificadores calculados automaticamente</small></div>
      <div class="grid grid-6">
        ${attrCard("forca", "Força", atr.forca, modFor)}
        ${attrCard("destreza", "Destreza", atr.destreza, modDes)}
        ${attrCard("constituicao", "Constituição", atr.constituicao, modCon)}
        ${attrCard("inteligencia", "Inteligência", atr.inteligencia, modInt)}
        ${attrCard("sabedoria", "Sabedoria", atr.sabedoria, modSab)}
        ${attrCard("presenca", "Presença", atr.presenca, modPre)}
      </div>
      <p class="text-xs text-mute" style="margin-top: var(--gap-3);">Limite padrão: 20. Algumas origens/classes permitem até 30.</p>
    </div>
    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Defensivos <small>defesa, atenção, iniciativa, deslocamento</small></div>
      <div class="grid grid-4">
        <div class="field">
          <label class="field__label">Defesa <span class="text-accent text-mono text-sm">${d.defesa}</span></label>
          <p class="text-xs text-mute">10 + mod DES (${formatMod(modDes)}) + nv/2 (${Math.floor((state.identificacao?.nivel||1)/2)}) + equip + outros</p>
        </div>
        <div class="field">
          <label class="field__label">Bônus de Equipamento</label>
          <input class="input" type="number" data-def="equipamento" value="${def.equipamento || 0}">
        </div>
        <div class="field">
          <label class="field__label">Outros</label>
          <input class="input" type="number" data-def="outros" value="${def.outros || 0}">
        </div>
        <div class="field">
          <label class="field__label">Deslocamento (m)</label>
          <input class="input" type="number" data-def="deslocamento" value="${def.deslocamento || 9}">
        </div>
        <div class="field">
          <label class="field__label">Atenção <span class="text-accent text-mono text-sm">${d.atencao}</span></label>
          <p class="text-xs text-mute">10 + Percepção + outros</p>
        </div>
        <div class="field">
          <label class="field__label">Iniciativa <span class="text-accent text-mono text-sm">${formatMod(d.iniciativa)}</span></label>
          <p class="text-xs text-mute">mod DES (${formatMod(modDes)}) + outros</p>
        </div>
        <div class="field">
          <label class="field__label">Bônus de Treinamento <span class="text-accent text-mono text-sm">+${d.prof}</span></label>
          <p class="text-xs text-mute">+2 nv 1-4, +3 nv 5-8, +4 nv 9-12, +5 nv 13-16, +6 nv 17-20</p>
        </div>
        <div class="field">
          <label class="field__label">Limite de Carga <span class="text-accent text-mono text-sm">${d.limite}</span></label>
          <p class="text-xs text-mute">8 + 2×mod FOR</p>
        </div>
      </div>
    </div>
  `;

  bindAtributoInputs(container, () => {
    renderTab("atributos", container);
    renderVisaoCentral(container.closest("#editor-content") || document.getElementById("editor-content"));
  });

  container.querySelectorAll("[data-def]").forEach(inp => {
    inp.addEventListener("change", () => {
      const k = inp.dataset.def;
      const v = Number(inp.value);
      state.defesa[k] = v;
      renderTab("atributos", container);
      scheduleSave();
    });
  });
}

function attrCard(id, label, val, mod) {
  const modClass = mod < 0 ? " attr-card__mod--neg" : "";
  return `
    <div class="attr-card">
      <div class="attr-card__label">${label}</div>
      <input class="attr-card__value" type="number" min="1" max="30" value="${val ?? 10}" data-atr="${id}">
      <div class="attr-card__mod${modClass}">${formatMod(mod)}</div>
    </div>
  `;
}

/* =========================================================
   ABA 4 — RECURSOS
   ========================================================= */

function renderRecursos(container) {
  const p = resourcePoints(state);
  const idf = state.identificacao || {};
  const modCon = modificador(state.atributos?.constituicao || 10);
  const esp = ESPECIALIZACOES.find(e => e.id === idf.especializacao);
  const tetoPvTemp = tempMaxPara(p.pvMax);
  const tetoPeTemp = tempMaxPara(p.peMax);

  container.innerHTML = `
    <div class="card">
      <div class="section-title">Pontos de Vida <small>PV: 12 + mod. Constituição (Lutador/Esp.Combate); 10 + mod.Con (Esp.Técnica/Controlador/Suporte); 16 + mod.Con (Restringido)</small></div>
      <div class="row" style="gap: var(--gap-3); flex-wrap: wrap; align-items: flex-end;">
        <div class="tracker" style="flex: 1; min-width: 240px;">
          <span class="tracker__label">PV</span>
          <input class="tracker__current" type="number" data-pv="atual" value="${p.pvAtual ?? 10}">
          <span class="tracker__sep">/</span>
          <input class="tracker__max" type="number" data-pv="max" value="${p.pvMax ?? 10}">
          <div class="tracker__bar"><div class="tracker__fill" style="width: ${Math.min(100, (p.pvAtual / Math.max(1, p.pvMax)) * 100)}%"></div></div>
          <div class="tracker__btns">
            <button class="tracker__btn" data-pv-step="-5" aria-label="−5 PV">−5</button>
            <button class="tracker__btn" data-pv-step="-1" aria-label="−1 PV">−</button>
            <button class="tracker__btn" data-pv-step="1" aria-label="+1 PV">+</button>
            <button class="tracker__btn" data-pv-step="5" aria-label="+5 PV">+5</button>
          </div>
        </div>
        <div class="field" style="min-width: 200px;">
          <label class="field__label">PV Temporário <span class="text-xs text-mute">(teto ${tetoPvTemp})</span></label>
          <div class="tracker__btns">
            <button class="tracker__btn" data-temp-pv-step="-1" aria-label="−1 temp">−</button>
            <input class="input input--mono" type="number" data-pv="temp" value="${p.pvTemp ?? 0}">
            <button class="tracker__btn" data-temp-pv-step="1" aria-label="+1 temp">+</button>
            <button class="tracker__btn" data-temp-pv-step="5" aria-label="+5 temp">+5</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Pontos de Energia Amaldiçoada <small>PE por nível: 4 (Lutador/Esp.Combate), 6 (Esp.Técnica), 5 (Controlador/Suporte), — (Restringido)</small></div>
      <div class="row" style="gap: var(--gap-3); flex-wrap: wrap; align-items: flex-end;">
        <div class="tracker" style="flex: 1; min-width: 240px;">
          <span class="tracker__label">PE</span>
          <input class="tracker__current" type="number" data-pe="atual" value="${p.peAtual ?? 0}">
          <span class="tracker__sep">/</span>
          <input class="tracker__max" type="number" data-pe="max" value="${p.peMax ?? 0}">
          <div class="tracker__bar"><div class="tracker__fill" style="width: ${Math.min(100, (p.peAtual / Math.max(1, p.peMax)) * 100)}%"></div></div>
          <div class="tracker__btns">
            <button class="tracker__btn" data-pe-step="-5" aria-label="−5 PE">−5</button>
            <button class="tracker__btn" data-pe-step="-1" aria-label="−1 PE">−</button>
            <button class="tracker__btn" data-pe-step="1" aria-label="+1 PE">+</button>
            <button class="tracker__btn" data-pe-step="5" aria-label="+5 PE">+5</button>
          </div>
        </div>
        <div class="field" style="min-width: 200px;">
          <label class="field__label">PE Temporário <span class="text-xs text-mute">(teto ${tetoPeTemp})</span></label>
          <div class="tracker__btns">
            <button class="tracker__btn" data-temp-pe-step="-1" aria-label="−1 temp">−</button>
            <input class="input input--mono" type="number" data-pe="temp" value="${p.peTemp ?? 0}">
            <button class="tracker__btn" data-temp-pe-step="1" aria-label="+1 temp">+</button>
            <button class="tracker__btn" data-temp-pe-step="5" aria-label="+5 temp">+5</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Integridade da Alma <small>igual ao máximo de PV. Reduzida por habilidades únicas.</small></div>
      <div class="row" style="gap: var(--gap-3); flex-wrap: wrap;">
        <div class="tracker" style="flex: 1; min-width: 240px;">
          <span class="tracker__label">IA</span>
          <input class="tracker__current" type="number" data-ia="atual" value="${p.integridadeAtual ?? p.pvMax ?? 10}">
          <span class="tracker__sep">/</span>
          <input class="tracker__max" type="number" data-ia="max" value="${p.integridadeMax ?? p.pvMax ?? 10}">
        </div>
      </div>
    </div>
  `;

  function bind(prefix, target) {
    container.querySelectorAll(`[data-${prefix}]`).forEach(inp => {
      inp.addEventListener("change", () => {
        const k = inp.dataset[prefix];
        const v = Number(inp.value);
        if (!state[target]) state[target] = {};
        if (prefix === "pv") {
          if (k === "atual") state.pontos.pvAtual = v;
          if (k === "max") { state.pontos.pvMax = v; state.pontos.integridadeMax = v; }
          if (k === "temp") setTempHP(state, v);
        } else if (prefix === "pe") {
          if (k === "atual") resourcePoints(state).peAtual = v;
          if (k === "max") resourcePoints(state).peMax = v;
          if (k === "temp") setTempPE(state, v);
        } else if (prefix === "ia") {
          if (k === "atual") state.pontos.integridadeAtual = v;
          if (k === "max") state.pontos.integridadeMax = v;
        }
        renderTab("recursos", container);
        renderVisaoCentral(document.getElementById("editor-content"));
        scheduleSave();
      });
    });
  }
  bind("pv", "pontos");
  bind("pe", "pontos");
  bind("ia", "pontos");

  // Botões +/- PV/PE
  bindStepButtons(container, "pv", "pvMax", "pvAtual");
  bindStepButtons(container, "pe", "peMax", "peAtual");
  // (Estamina removida — Restringido segue tabela oficial, sem Est)
  // Botões temp PV/PE
  bindTempButtons(container, "pv");
  bindTempButtons(container, "pe");
}

/* =========================================================
   ABA 5 — PERÍCIAS & TESTES DE RESISTÊNCIA
   ========================================================= */

function renderPericias(container) {
  if (!state.pericias) state.pericias = {};
  if (!state.testesResistencia) state.testesResistencia = {};

  const d = derivar(state);
  const nivel = state.identificacao?.nivel || 1;
  const prof = d.prof;

  function calcPericia(p, atr) {
    const mod = d.mods[atr] || 0;
    let total = mod;
    if (p.treino) total += prof;
    if (p.mestre) total += Math.floor(prof / 2);
    total += Math.floor(nivel / 2);
    total += p.outros || 0;
    return total;
  }

  function calcTR(t) {
    let total = 0;
    if (t.treino) total += prof;
    if (t.mestre) total += Math.floor(prof / 2);
    total += Math.floor(nivel / 2);
    total += t.outros || 0;
    return total;
  }

  const perHTML = PERICIAS.map(p => {
    if (!state.pericias[p.id]) state.pericias[p.id] = { treino: false, mestre: false, outros: 0 };
    const v = state.pericias[p.id];
    const total = calcPericia(v, p.atributo);
    const m = d.mods[p.atributo] || 0;
    return `
      <tr>
        <td><button type="button" class="roll-trigger" data-roll-name="${escapeHtml(p.nome)}" data-roll-bonus="${total}">${p.nome} ⚄</button>${p.tr ? ' <span class="tag">TR</span>' : ''}</td>
        <td class="text-mute text-xs">${p.atributo.slice(0,3).toUpperCase()}</td>
        <td class="text-center"><label class="check"><input type="checkbox" data-per="${p.id}" data-key="treino" ${v.treino ? "checked" : ""}><span class="check__box"></span><span class="check__label text-xs">T</span></label></td>
        <td class="text-center"><label class="check"><input type="checkbox" data-per="${p.id}" data-key="mestre" ${v.mestre ? "checked" : ""}><span class="check__box"></span><span class="check__label text-xs">M</span></label></td>
        <td><input class="input input--mono" type="number" data-per="${p.id}" data-key="outros" value="${v.outros || 0}"></td>
        <td class="text-right text-mono text-accent">${formatMod(total)}</td>
      </tr>
    `;
  }).join("");

  const trHTML = TESTES_RESISTENCIA.map(t => {
    if (!state.testesResistencia[t.id]) state.testesResistencia[t.id] = { treino: false, mestre: false, outros: 0 };
    const v = state.testesResistencia[t.id];
    const total = calcTR(v, t.atributo);
    return `
      <tr>
        <td><button type="button" class="roll-trigger" data-roll-name="TR: ${escapeHtml(t.nome)}" data-roll-bonus="${total}">${t.nome} ⚄</button></td>
        <td class="text-center"><label class="check"><input type="checkbox" data-tr="${t.id}" data-key="treino" ${v.treino ? "checked" : ""}><span class="check__box"></span><span class="check__label text-xs">T</span></label></td>
        <td class="text-center"><label class="check"><input type="checkbox" data-tr="${t.id}" data-key="mestre" ${v.mestre ? "checked" : ""}><span class="check__box"></span><span class="check__label text-xs">M</span></label></td>
        <td><input class="input input--mono" type="number" data-tr="${t.id}" data-key="outros" value="${v.outros || 0}"></td>
        <td class="text-right text-mono text-accent">${formatMod(total)}</td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div class="card">
      <div class="section-title">Perícias <small>T = treinado, M = mestre. Bônus de treinamento atual: +${prof}</small></div>
      <div style="overflow-x: auto;">
        <table class="table">
          <thead>
            <tr>
              <th>Perícia</th><th>Atributo</th><th class="text-center">T</th><th class="text-center">M</th><th>Outros</th><th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>${perHTML}</tbody>
        </table>
      </div>
    </div>
    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Testes de Resistência</div>
      <div style="overflow-x: auto;">
        <table class="table">
          <thead>
            <tr><th>Teste</th><th class="text-center">T</th><th class="text-center">M</th><th>Outros</th><th class="text-right">Total</th></tr>
          </thead>
          <tbody>${trHTML}</tbody>
        </table>
      </div>
    </div>
  `;

  container.querySelectorAll("[data-per]").forEach(inp => {
    inp.addEventListener("change", () => {
      const id = inp.dataset.per;
      const k = inp.dataset.key;
      if (!state.pericias[id]) state.pericias[id] = { treino: false, mestre: false, outros: 0 };
      if (inp.type === "checkbox") state.pericias[id][k] = inp.checked;
      else state.pericias[id][k] = Number(inp.value) || 0;
      renderTab("pericias", container);
      scheduleSave();
    });
  });
  container.querySelectorAll("[data-tr]").forEach(inp => {
    inp.addEventListener("change", () => {
      const id = inp.dataset.tr;
      const k = inp.dataset.key;
      if (!state.testesResistencia[id]) state.testesResistencia[id] = { treino: false, mestre: false, outros: 0 };
      if (inp.type === "checkbox") state.testesResistencia[id][k] = inp.checked;
      else state.testesResistencia[id][k] = Number(inp.value) || 0;
      renderTab("pericias", container);
      scheduleSave();
    });
  });
}

/* =========================================================
   ABA 6 — ATAQUES & CDs
   ========================================================= */

function renderAtaques(container) {
  if (!state.ataques) state.ataques = [];
  if (!state.cd) state.cd = { especializacao: { atributo: "forca", outros: 0 }, amaldicoado: { atributo: "presenca", outros: 0 } };

  const d = derivar(state);
  const nivel = state.identificacao?.nivel || 1;
  const atrList = Object.keys(d.mods);
  const atrOptions = atrList.map(a => `<option value="${a}">${a}</option>`).join("");

  function calcAtaque(at) {
    const mod = d.mods[at.atributo] || 0;
    const prof = d.prof;
    return formatMod(mod + prof + Math.floor(nivel/2) + (at.bonus || 0));
  }

  const ataqHTML = state.ataques.map((at, i) => `
    <tr>
      <td><input class="input" data-atk="${i}" data-k="nome" value="${escapeHtml(at.nome)}"></td>
      <td>
        <select class="select" data-atk="${i}" data-k="atributo">${atrList.map(a => `<option value="${a}" ${at.atributo === a ? "selected" : ""}>${a}</option>`).join("")}</select>
      </td>
      <td><input class="input" type="number" data-atk="${i}" data-k="bonus" value="${at.bonus || 0}"></td>
      <td class="text-right text-mono text-accent">${calcAtaque(at)}</td>
      <td><input class="input" data-atk="${i}" data-k="dano" value="${escapeHtml(at.dano)}"></td>
      <td><input class="input" type="number" data-atk="${i}" data-k="critico" value="${at.critico || 20}" min="2" max="20"></td>
      <td>
        <select class="select" data-atk="${i}" data-k="tipo">
          <option value="Ct" ${at.tipo === "Ct" ? "selected" : ""}>Ct</option>
          <option value="Pf" ${at.tipo === "Pf" ? "selected" : ""}>Pf</option>
          <option value="Im" ${at.tipo === "Im" ? "selected" : ""}>Im</option>
          <option value="En" ${at.tipo === "En" ? "selected" : ""}>En</option>
          <option value="Al" ${at.tipo === "Al" ? "selected" : ""}>Al</option>
        </select>
      </td>
      <td><input class="input" data-atk="${i}" data-k="alcance" value="${escapeHtml(at.alcance)}"></td>
      <td>
        <button class="btn btn--danger btn--sm btn--icon" data-rm-atk="${i}">×</button>
      </td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div class="card">
      <div class="section-title">Jogadas de Ataque <small>ataque corpo-a-corpo, à distância, amaldiçoado</small></div>
      <div style="overflow-x: auto;">
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th><th>Atributo</th><th>Outros</th><th class="text-right">Total</th><th>Dano</th><th>Crít.</th><th>Tipo</th><th>Alcance</th><th></th>
            </tr>
          </thead>
          <tbody>${ataqHTML}</tbody>
        </table>
      </div>
      <button class="btn btn--subtle btn--sm" id="add-atk" style="margin-top: var(--gap-3);">+ Adicionar ataque</button>
    </div>

    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Classes de Dificuldade <small>CD de Especialização e Amaldiçoado</small></div>
      <div class="grid grid-2">
        <div class="card" style="background: var(--bg-elev);">
          <h4>CD de Especialização <span class="text-accent text-mono">${d.cdEspecializacao}</span></h4>
          <p class="text-xs text-mute">8 + mod atributo + prof + nv/2 + outros</p>
          <div class="row" style="margin-top: var(--gap-3);">
            <select class="select" style="flex: 1;" data-cd="esp" data-k="atributo">
              ${atrList.map(a => `<option value="${a}" ${state.cd.especializacao.atributo === a ? "selected" : ""}>${a}</option>`).join("")}
            </select>
            <input class="input input--num" type="number" data-cd="esp" data-k="outros" value="${state.cd.especializacao.outros || 0}" placeholder="outros">
          </div>
        </div>
        <div class="card" style="background: var(--bg-elev);">
          <h4>CD Amaldiçoado <span class="text-accent text-mono">${d.cdAmaldicoado}</span></h4>
          <p class="text-xs text-mute">8 + mod atributo + prof + nv/2 + outros (sempre treinado)</p>
          <div class="row" style="margin-top: var(--gap-3);">
            <select class="select" style="flex: 1;" data-cd="ama" data-k="atributo">
              ${atrList.map(a => `<option value="${a}" ${state.cd.amaldicoado.atributo === a ? "selected" : ""}>${a}</option>`).join("")}
            </select>
            <input class="input input--num" type="number" data-cd="ama" data-k="outros" value="${state.cd.amaldicoado.outros || 0}" placeholder="outros">
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll("[data-atk]").forEach(inp => {
    inp.addEventListener("change", () => {
      const i = Number(inp.dataset.atk);
      const k = inp.dataset.k;
      let v = inp.value;
      if (k === "bonus" || k === "critico") v = Number(v) || 0;
      state.ataques[i][k] = v;
      if (k === "atributo" || k === "bonus") renderTab("ataques", container);
      scheduleSave();
    });
  });
  container.querySelectorAll("[data-rm-atk]").forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.rmAtk);
      state.ataques.splice(i, 1);
      renderTab("ataques", container);
      scheduleSave();
    };
  });
  container.querySelector("#add-atk").onclick = () => {
    state.ataques.push({ nome: "Novo", atributo: "forca", bonus: 0, dano: "1d6", critico: 20, tipo: "Ct", alcance: "1,5m", propriedades: "" });
    renderTab("ataques", container);
    scheduleSave();
  };

  container.querySelectorAll("[data-cd]").forEach(inp => {
    inp.addEventListener("change", () => {
      const which = inp.dataset.cd; // esp | ama
      const k = inp.dataset.k;
      let v = inp.value;
      if (k === "outros") v = Number(v) || 0;
      if (which === "esp") state.cd.especializacao[k] = v;
      else state.cd.amaldicoado[k] = v;
      renderTab("ataques", container);
      scheduleSave();
    });
  });
}

/* =========================================================
   ABA 7 — TÉCNICA & FEITIÇOS
   ========================================================= */

function renderTecnica(container) {
  if(isRestricted(state)){renderMartial(container,state,()=>{recalcularPontos(state);scheduleSave();});return;}
  if (!state.tecnica) state.tecnica = { nome: "", atributoChave: "presenca", descricao: "", maxTecnicas: 1, feiticos: [], expansaoDominio: { nome: "", tipo: "", tecnicaGarantida: false, descricao: "" } };

  const t = state.tecnica;
  const idf = state.identificacao || {};
  const origem = idf.origem;
  const permiteTecnica = ORIGENS.find(o => o.id === origem)?.permiteTecnica !== false;

  const feiHTML = (t.feiticos || []).map((f, i) => `
    <tr>
      <td><input class="input input--num" type="number" data-fei="${i}" data-k="nivel" value="${f.nivel || 0}" min="0" max="5"></td>
      <td><input class="input" data-fei="${i}" data-k="nome" value="${escapeHtml(f.nome || "")}"></td>
      <td><input class="input input--num" type="number" data-fei="${i}" data-k="custo" value="${f.custo || 1}" min="0"></td>
      <td><input class="input" data-fei="${i}" data-k="alcance" value="${escapeHtml(f.alcance || "")}"></td>
      <td><input class="input" data-fei="${i}" data-k="alvo" value="${escapeHtml(f.alvo || "")}"></td>
      <td><input class="input" data-fei="${i}" data-k="duracao" value="${escapeHtml(f.duracao || "")}"></td>
      <td><input class="input" data-fei="${i}" data-k="descricao" value="${escapeHtml(f.descricao || "")}"></td>
      <td><button class="btn btn--danger btn--sm btn--icon" data-rm-fei="${i}">×</button></td>
    </tr>
  `).join("");

  container.innerHTML = `
    ${!permiteTecnica ? `<div class="card" style="background: color-mix(in srgb, var(--site-color-fbbf24, #fbbf24) 10%, transparent); border-color: color-mix(in srgb, var(--site-color-fbbf24, #fbbf24) 40%, transparent);"><p class="text-warning">⚠ Sua origem <strong>${origem}</strong> não possui técnica amaldiçoada. Esta aba é apenas narrativa.</p></div>` : ""}
    <div class="card">
      <div class="section-title">Técnica Amaldiçoada</div>
      <div class="grid grid-2">
        <div class="field">
          <label class="field__label">Nome da técnica</label>
          <input class="input" data-tec="nome" value="${escapeHtml(t.nome)}" placeholder="Ex: Proporções, Dez Sombras">
        </div>
        <div class="field">
          <label class="field__label">Atributo principal</label>
          <select class="select" data-tec="atributoChave">
            ${["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "presenca"].map(a => `<option value="${a}" ${t.atributoChave === a ? "selected" : ""}>${a}</option>`).join("")}
          </select>
        </div>
        <div class="field" style="grid-column: 1/-1;">
          <label class="field__label">Funcionamento básico</label>
          <textarea class="textarea" data-tec="descricao" rows="3">${escapeHtml(t.descricao)}</textarea>
        </div>
        <div class="field">
          <label class="field__label">Máx. técnicas conhecidas</label>
          <input class="input" type="number" data-tec="maxTecnicas" value="${t.maxTecnicas || 1}" min="1">
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Feitiços <small>lista de feitiços da técnica</small></div>
      <div style="overflow-x: auto;">
        <table class="table">
          <thead>
            <tr>
              <th>Nv</th><th>Nome</th><th>PE</th><th>Alcance</th><th>Alvo</th><th>Duração</th><th>Descrição</th><th></th>
            </tr>
          </thead>
          <tbody>${feiHTML || `<tr><td colspan="8" class="text-center text-mute" style="padding: var(--gap-4);">Nenhum feitiço adicionado.</td></tr>`}</tbody>
        </table>
      </div>
      <button class="btn btn--subtle btn--sm" id="add-fei" style="margin-top: var(--gap-3);">+ Adicionar feitiço</button>
    </div>

    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Expansão de Domínio <small>opcional — cap 9</small></div>
      <div class="grid grid-2">
        <div class="field">
          <label class="field__label">Nome do domínio</label>
          <input class="input" data-dom="nome" value="${escapeHtml(t.expansaoDominio.nome || "")}">
        </div>
        <div class="field">
          <label class="field__label">Tipo</label>
          <input class="input" data-dom="tipo" value="${escapeHtml(t.expansaoDominio.tipo || "")}" placeholder="Ex: Void, Charnel…">
        </div>
        <div class="field" style="grid-column: 1/-1;">
          <label class="field__label">Descrição</label>
          <textarea class="textarea" data-dom="descricao" rows="3">${escapeHtml(t.expansaoDominio.descricao || "")}</textarea>
        </div>
        <div class="field">
          <label class="check">
            <input type="checkbox" data-dom="tecnicaGarantida" ${t.expansaoDominio.tecnicaGarantida ? "checked" : ""}>
            <span class="check__box"></span>
            <span class="check__label">Técnica garantida (não pode ser esquivada)</span>
          </label>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll("[data-tec]").forEach(inp => {
    inp.addEventListener("change", () => {
      const k = inp.dataset.tec;
      let v = inp.value;
      if (k === "maxTecnicas") v = Number(v) || 1;
      state.tecnica[k] = v;
      scheduleSave();
    });
    if (inp.tagName === "TEXTAREA") inp.addEventListener("input", () => {
      state.tecnica[inp.dataset.tec] = inp.value;
      scheduleSave();
    });
  });

  container.querySelectorAll("[data-fei]").forEach(inp => {
    inp.addEventListener("change", () => {
      const i = Number(inp.dataset.fei);
      const k = inp.dataset.k;
      let v = inp.value;
      if (k === "nivel" || k === "custo") v = Number(v) || 0;
      if (!state.tecnica.feiticos[i]) state.tecnica.feiticos[i] = {};
      state.tecnica.feiticos[i][k] = v;
      scheduleSave();
    });
  });

  container.querySelectorAll("[data-rm-fei]").forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.rmFei);
      state.tecnica.feiticos.splice(i, 1);
      renderTab("tecnica", container);
      scheduleSave();
    };
  });

  container.querySelector("#add-fei").onclick = () => {
    if (!state.tecnica.feiticos) state.tecnica.feiticos = [];
    state.tecnica.feiticos.push({ nivel: 1, nome: "Novo feitiço", custo: 1, alcance: "9m", alvo: "1 criatura", duracao: "instantâneo", descricao: "" });
    renderTab("tecnica", container);
    scheduleSave();
  };

  container.querySelectorAll("[data-dom]").forEach(inp => {
    const handler = () => {
      const k = inp.dataset.dom;
      let v = inp.type === "checkbox" ? inp.checked : inp.value;
      if (!state.tecnica.expansaoDominio) state.tecnica.expansaoDominio = {};
      state.tecnica.expansaoDominio[k] = v;
      scheduleSave();
    };
    inp.addEventListener("change", handler);
    if (inp.tagName === "TEXTAREA") inp.addEventListener("input", handler);
  });
}

/* =========================================================
   ABA 8 — HABILIDADES
   ========================================================= */

function renderHabilidades(container) {
  // Sub-abas: Origem | Especialização | Talentos | Aptidões | Treinamentos
  let sub = "origem";
  const state_local = { current: "origem" };

  function render() {
    container.innerHTML = `
      <div class="subtabs" id="hab-subtabs">
        ${["origem", "especializacao", "talentos", "aptidoes", "treinamentos"].map(s => `
          <button class="subtab" data-sub="${s}" aria-current="${state_local.current === s ? "true" : "false"}">${s==='aptidoes'&&isRestricted(state)?'Dádivas do Céu':s.charAt(0).toUpperCase() + s.slice(1)}</button>
        `).join("")}
      </div>
      <div id="hab-body"></div>
    `;
    container.querySelectorAll("[data-sub]").forEach(btn => {
      btn.onclick = () => {
        state_local.current = btn.dataset.sub;
        render();
      };
    });
    const body = container.querySelector("#hab-body");
    if (state_local.current === "origem") renderOrigemDetalhe(body);
    if (state_local.current === "especializacao") renderEspDetalhe(body);
    if (state_local.current === "talentos") renderTalentos(body);
    if (state_local.current === "aptidoes") renderAptidoes(body);
    if (state_local.current === "treinamentos") renderTreinamentos(body);
  }

  function renderOrigemDetalhe(body) {
    if(state.identificacao?.origem===CUSTOM_ORIGIN){
      state.origemPersonalizada ||= {nome:'',caracteristicas:[]};
      body.replaceChildren(customOriginForm(state.origemPersonalizada,()=>{
        state.origemDetalhes={...state.origemDetalhes,personalizado:true,caracteristicas:[...state.origemPersonalizada.caracteristicas]};
        scheduleSave();
      }));return;
    }
    const o = ORIGENS.find(x => x.id === state.identificacao?.origem);
    if (!o) {
      body.innerHTML = `<div class="card"><p class="text-soft">Selecione uma origem na aba Identificação.</p></div>`;
      return;
    }
    if (!state.origemDetalhes) state.origemDetalhes = { caracteristicas: [] };

    const carHTML = (o.caracteristicas || []).map((c, i) => `
      <li class="row" style="padding: var(--gap-2) 0; border-bottom: 1px solid var(--border-soft);">
        <span>${c}</span>
        <span class="text-mute text-xs">automático</span>
      </li>
    `).join("");

    body.innerHTML = `
      <div class="card">
        <div class="row" style="margin-bottom: var(--gap-3);">
          <h3 style="color: ${o.cor};">${o.nome}</h3>
          <span class="tag">Origem</span>
        </div>
        <p class="text-soft">${o.descricao}</p>
        <hr>
        <h4>Características</h4>
        <ul style="list-style: none; padding: 0;">${carHTML}</ul>
      </div>
      ${o.id === "Feto Amaldiçoado Híbrido" ? `
      <div class="card" style="margin-top: var(--gap-4);">
        <h4>Características de Anatomia</h4>
        <p class="text-xs text-soft">Escolha características para seu corpo amaldiçoado. A cada 5 níveis, mais uma.</p>
        <div data-anatomy-options></div>
      </div>
      ` : ""}
    `;
    if(o.id==='Feto Amaldiçoado Híbrido')anatomiaFetoEditor(body);
  }

  function anatomiaFetoEditor(body) {
    const wrap=body.querySelector('[data-anatomy-options]');
    if(!wrap)return;
    const ANATOMIAS = ["Alma Maldita", "Capacidade de Voo", "Carapaça Mutante", "Corpo Especializado", "Desenvolvimento Exagerado", "Devorador de Energia", "Instinto Sanguinário", "Anatomia Incompreensível", "Arma Natural", "Articulações Extensas", "Braços Extras", "Olhos Sombrios", "Pernas Extras", "Presença Nefasta", "Sangue Tóxico"];
    if (!state.origemDetalhes.anatomias) state.origemDetalhes.anatomias = [];
    const html = ANATOMIAS.map(a => {
      const tem = state.origemDetalhes.anatomias.includes(a);
      return `<label class="check" style="margin: var(--gap-1) 0;">
        <input type="checkbox" data-anat="${a}" ${tem ? "checked" : ""}>
        <span class="check__box"></span>
        <span class="check__label text-sm">${a}</span>
      </label>`;
    }).join("");
    wrap.className='grid grid-2';
    wrap.style.marginTop='var(--gap-3)';
    wrap.innerHTML = html;
    wrap.querySelectorAll("[data-anat]").forEach(inp => {
      inp.onchange = () => {
        const a = inp.dataset.anat;
        const arr = state.origemDetalhes.anatomias || [];
        if (inp.checked) {
          if (!arr.includes(a)) arr.push(a);
        } else {
          const idx = arr.indexOf(a);
          if (idx >= 0) arr.splice(idx, 1);
        }
        state.origemDetalhes.anatomias = arr;
        scheduleSave();
      };
    });
    return "";
  }

  function renderEspDetalhe(body) {
    const esp = ESPECIALIZACOES.find(e => e.id === state.identificacao?.especializacao);
    if (!esp) {
      body.innerHTML = `<div class="card"><p class="text-soft">Selecione uma especialização na aba Identificação.</p></div>`;
      return;
    }
    if (!state.especializacaoDetalhes) state.especializacaoDetalhes = { estilo: "", habilidades: [], estilos: [] };

    const estilosOpcoes = esp.id === "Especialista em Combate" ? ESTILOS_COMBATE : [];

    body.innerHTML = `
      <div class="card">
        <div class="row" style="margin-bottom: var(--gap-3);">
          <h3 style="color: ${esp.cor};">${esp.nome}</h3>
          <span class="tag">Especialização</span>
        </div>
        <p class="text-soft">${esp.descricao}</p>
        <p class="text-xs text-mute" style="margin-top: var(--gap-2);">Exemplos: ${esp.exemplos.join(", ")}</p>
        <hr>
        <div class="grid grid-3 text-xs">
          <div><span class="text-mute">PV inicial:</span> <strong>${esp.pvInicialBase} + mod.Con</strong></div>
          <div><span class="text-mute">Dado de vida:</span> <strong>d${esp.dadoVida}</strong></div>
          <div><span class="text-mute">${isRestricted(state)?'Estamina':'PE'} por nível:</span> <strong>${isRestricted(state)?4:esp.pePorNivel}${esp.somaModificadorNoPE ? " + mod.atributo (1ª vez)" : ""}</strong></div>
        </div>
        ${estilosOpcoes.length > 0 ? `
          <hr>
          <h4>Estilo de Combate</h4>
          <div class="grid grid-2">
            ${estilosOpcoes.map(s => `
              <label class="check" style="padding: var(--gap-2); border: 1px solid var(--border-soft); border-radius: var(--radius);">
                <input type="checkbox" data-estilo="${s.id}" ${(state.especializacaoDetalhes.estilos || []).includes(s.id) ? "checked" : ""}>
                <span class="check__box"></span>
                <span>
                  <strong>${s.nome}</strong>
                  <div class="text-xs text-soft">${s.desc}</div>
                </span>
              </label>
            `).join("")}
          </div>
        ` : ""}
        <hr>
        <h4>Habilidades da Especialização</h4>
        <div id="ability-catalog"></div>
      </div>
    `;
    renderAbilityCatalog(body.querySelector('#ability-catalog'),state,()=>{
      scheduleSave();
      const panel=document.querySelector('#visao-pendencias');
      if(panel){
        const pending=pendenciasPorNivel(state);
        if(!pending.length)panel.remove();
        else{
          const list=panel.querySelector('ul');
          if(list)list.innerHTML=pending.map(p=>`<li class="text-sm"><span class="tag">Nv ${p.nivel}</span> ${escapeHtml(p.texto)}</li>`).join('');
          const count=panel.querySelector('.row .text-xs');if(count)count.textContent=`${pending.length} pendência(s)`;
        }
      }
    });
    body.querySelectorAll('[data-estilo]').forEach(inp=>{inp.onchange=()=>{
      const selected=new Set(state.especializacaoDetalhes.estilos||[]);
      if(inp.checked)selected.add(inp.dataset.estilo);else selected.delete(inp.dataset.estilo);
      state.especializacaoDetalhes.estilos=[...selected];scheduleSave();
    };});
  }

  function bindHabilidades(body) {
    const lista = (state.especializacaoDetalhes.habilidades || []);
    function renderList() {
      const listEl = body.querySelector("#hab-list");
      listEl.innerHTML = lista.map((h, i) => `
        <div class="card" style="background: var(--bg-elev); margin-top: var(--gap-2);">
          <div class="row">
            <input class="input" data-hab-i="${i}" data-k="nome" value="${escapeHtml(h.nome || "")}" placeholder="Nome da habilidade" style="flex: 1;">
            <input class="input" type="number" data-hab-i="${i}" data-k="nivel" value="${h.nivel || 1}" placeholder="Nível" style="width: 80px;">
            <button class="btn btn--danger btn--sm btn--icon" data-rm-hab="${i}">×</button>
          </div>
          <textarea class="textarea" data-hab-i="${i}" data-k="descricao" rows="2" style="margin-top: var(--gap-2);" placeholder="Descrição">${escapeHtml(h.descricao || "")}</textarea>
        </div>
      `).join("") || `<p class="text-mute text-sm">Nenhuma habilidade adicionada.</p>`;
      listEl.querySelectorAll("[data-hab-i]").forEach(inp => {
        inp.addEventListener("input", () => {
          const i = Number(inp.dataset.habI);
          const k = inp.dataset.k;
          let v = inp.value;
          if (k === "nivel") v = Number(v) || 1;
          state.especializacaoDetalhes.habilidades[i][k] = v;
          scheduleSave();
        });
      });
      listEl.querySelectorAll("[data-rm-hab]").forEach(btn => {
        btn.onclick = () => {
          const i = Number(btn.dataset.rmHab);
          state.especializacaoDetalhes.habilidades.splice(i, 1);
          renderList();
          scheduleSave();
        };
      });
    }
    renderList();
    body.querySelector("#add-hab").onclick = () => {
      state.especializacaoDetalhes.habilidades.push({ nome: "", nivel: 1, descricao: "" });
      renderList();
      scheduleSave();
    };
    body.querySelectorAll("[data-estilo]").forEach(inp => {
      inp.onchange = () => {
        const id = inp.dataset.estilo;
        if (!state.especializacaoDetalhes.estilos) state.especializacaoDetalhes.estilos = [];
        if (inp.checked) {
          if (!state.especializacaoDetalhes.estilos.includes(id)) state.especializacaoDetalhes.estilos.push(id);
        } else {
          state.especializacaoDetalhes.estilos = state.especializacaoDetalhes.estilos.filter(x => x !== id);
        }
        scheduleSave();
      };
    });
  }

  function renderTalentos(body) {
    if (!state.talentos) state.talentos = [];
    body.innerHTML = `
      <div class="card">
        <div class="section-title">Talentos <small>escolhidos a cada nível par (1, 4, 7, 10...)</small></div>
        <p class="text-xs text-soft">Lista manual de talentos (ref. cap. 7). Origem Inato recebe 1 talento extra no 1° nível.</p>
        <div id="tal-list"></div>
        <button class="btn btn--subtle btn--sm" id="add-tal">+ Adicionar talento</button>
      </div>
    `;
    const lista = state.talentos;
    function renderList() {
      const el = body.querySelector("#tal-list");
      el.innerHTML = lista.map((t, i) => `
        <div class="card" style="background: var(--bg-elev); margin-top: var(--gap-2);">
          <div class="row">
            <input class="input" data-tal-i="${i}" data-k="nome" value="${escapeHtml(t.nome || "")}" placeholder="Nome do talento" style="flex: 1;">
            <input class="input" data-tal-i="${i}" data-k="origem" value="${escapeHtml(t.origem || "")}" placeholder="Origem (Geral / Origem)" style="width: 200px;">
            <button class="btn btn--danger btn--sm btn--icon" data-rm-tal="${i}">×</button>
          </div>
          <textarea class="textarea" data-tal-i="${i}" data-k="descricao" rows="2" style="margin-top: var(--gap-2);" placeholder="Descrição e efeito">${escapeHtml(t.descricao || "")}</textarea>
        </div>
      `).join("") || `<p class="text-mute text-sm">Nenhum talento adicionado.</p>`;
      el.querySelectorAll("[data-tal-i]").forEach(inp => {
        inp.addEventListener("input", () => {
          const i = Number(inp.dataset.talI);
          const k = inp.dataset.k;
          state.talentos[i][k] = inp.value;
          scheduleSave();
        });
      });
      el.querySelectorAll("[data-rm-tal]").forEach(btn => {
        btn.onclick = () => {
          const i = Number(btn.dataset.rmTal);
          state.talentos.splice(i, 1);
          renderList();
          scheduleSave();
        };
      });
    }
    renderList();
    body.querySelector("#add-tal").onclick = () => {
      state.talentos.push({ nome: "", origem: "Geral", descricao: "" });
      renderList();
      scheduleSave();
    };
  }

  function renderAptidoes(body) {
    if(isRestricted(state)){renderGifts(body,state,()=>{recalcularPontos(state);scheduleSave();}).catch(e=>body.textContent=e.message);return;}
    if (!state.aptidoes) state.aptidoes = { aura: 0, controle: 0, dominio: 0, barreira: 0, energiaReversa: 0, completas: {} };

    body.innerHTML = `
      <div class="card">
        <div class="section-title">Aptidões Amaldiçoadas <small>uma por nível. Cap 8 do livro.</small></div>
        <div class="grid grid-auto" id="apt-grid"></div>
      </div>
    `;
    const grid = body.querySelector("#apt-grid");
    APTIDOES.forEach(a => {
      const nivel = state.aptidoes[a.id] || 0;
      const card = document.createElement("div");
      card.className = "card";
      card.style.background = "var(--bg-elev)";
      card.innerHTML = `
        <div class="row" style="margin-bottom: var(--gap-2);">
          <strong style="color: var(--text-accent);">${a.nome}</strong>
          <span class="tag">Nv ${nivel}/4</span>
        </div>
        <p class="text-xs text-soft" style="margin-bottom: var(--gap-2);">${a.descricao}</p>
        <div class="row" style="margin-bottom: var(--gap-2);">
          <button class="btn btn--subtle btn--sm" data-apt="${a.id}" data-d="-1">−</button>
          <span class="text-mono" style="min-width: 24px; text-align: center;">${nivel}</span>
          <button class="btn btn--subtle btn--sm" data-apt="${a.id}" data-d="1">+</button>
        </div>
        <div class="text-xs">
          ${a.etapas.slice(0, nivel).map(e => `<div style="padding: var(--gap-1) 0; border-top: 1px dashed var(--border-soft);"><strong>${e.nivel}. ${e.nome}</strong> — ${e.desc}</div>`).join("")}
        </div>
        <label class="check" style="margin-top: var(--gap-2);">
          <input type="checkbox" data-apt-comp="${a.id}" ${state.aptidoes.completas?.[a.id] ? "checked" : ""}>
          <span class="check__box"></span>
          <span class="check__label text-xs">Treino completo (conjurar)</span>
        </label>
      `;
      grid.appendChild(card);
    });

    body.querySelectorAll("[data-apt]").forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.apt;
        const d = Number(btn.dataset.d);
        state.aptidoes[id] = Math.max(0, Math.min(4, (state.aptidoes[id] || 0) + d));
        renderAptidoes(body);
        scheduleSave();
      };
    });
    body.querySelectorAll("[data-apt-comp]").forEach(inp => {
      inp.onchange = () => {
        if (!state.aptidoes.completas) state.aptidoes.completas = {};
        state.aptidoes.completas[inp.dataset.aptComp] = inp.checked;
        scheduleSave();
      };
    });
  }

  function renderTreinamentos(body) {
    renderTraining(body,state,()=>{recalcularPontos(state);scheduleSave();}).catch(e=>body.textContent=e.message);return;
    if (!state.treinamentos) state.treinamentos = {};
    body.innerHTML = `
      <div class="card">
        <div class="section-title">Treinamentos <small>v2.0+. Cada treinamento tem 4 etapas + completo.</small></div>
        <div class="grid grid-auto" id="tr-grid"></div>
      </div>
    `;
    const grid = body.querySelector("#tr-grid");
    TREINAMENTOS.forEach(t => {
      if (!state.treinamentos[t.id]) state.treinamentos[t.id] = [false, false, false, false, false];
      const etapas = state.treinamentos[t.id];
      const card = document.createElement("div");
      card.className = "card";
      card.style.background = "var(--bg-elev)";
      card.innerHTML = `
        <div class="row" style="margin-bottom: var(--gap-2);">
          <strong>${t.nome}</strong>
        </div>
        <p class="text-xs text-soft" style="margin-bottom: var(--gap-2);">${t.desc}</p>
        <div class="row" style="gap: var(--gap-1);">
          ${[0, 1, 2, 3].map(i => `
            <label class="check" style="flex: 1;">
              <input type="checkbox" data-tr="${t.id}" data-i="${i}" ${etapas[i] ? "checked" : ""}>
              <span class="check__box"></span>
              <span class="check__label text-xs">Etapa ${i + 1}</span>
            </label>
          `).join("")}
        </div>
        <label class="check" style="margin-top: var(--gap-2);">
          <input type="checkbox" data-tr-comp="${t.id}" ${etapas[4] ? "checked" : ""}>
          <span class="check__box"></span>
          <span class="check__label text-xs">Treino completo</span>
        </label>
      `;
      grid.appendChild(card);
    });

    body.querySelectorAll("[data-tr]").forEach(inp => {
      inp.onchange = () => {
        const id = inp.dataset.tr;
        const i = Number(inp.dataset.i);
        if (!state.treinamentos[id]) state.treinamentos[id] = [false, false, false, false, false];
        state.treinamentos[id][i] = inp.checked;
        scheduleSave();
      };
    });
    body.querySelectorAll("[data-tr-comp]").forEach(inp => {
      inp.onchange = () => {
        const id = inp.dataset.trComp;
        if (!state.treinamentos[id]) state.treinamentos[id] = [false, false, false, false, false];
        state.treinamentos[id][4] = inp.checked;
        scheduleSave();
      };
    });
  }

  render();
}

/* =========================================================
   ABA 9 — INVENTÁRIO
   ========================================================= */

function renderInventario(container) {
  if (!state.inventario) state.inventario = { itens: [], limite: 8, ocupado: 0 };
  const inv = state.inventario;

  const d = derivar(state);
  const limite = d.limite;
  const ocupado = inv.itens.reduce((acc, it) => acc + (it.quantidade || 1) * (it.espacos || 1), 0);
  inv.limite = limite;
  inv.ocupado = ocupado;

  const todasArmas = [...ARMAS_SIMPLES, ...ARMAS_COMPLEXAS];
  const pickerHTML = `
    <div class="grid grid-2" id="eq-picker">
      <div>
        <h6>Armas</h6>
        <select class="select" id="eq-armas" size="6">
          ${todasArmas.map(a => `<option value="arma:${a.nome}">${a.nome} — ${a.dano} (${a.espacos}␣)</option>`).join("")}
        </select>
      </div>
      <div class="col">
        <div>
          <h6>Uniformes</h6>
          <select class="select" id="eq-uniformes" size="3">
            ${UNIFORMES.map(u => `<option value="uniforme:${u.nome}">${u.nome} (${u.espacos}␣, RD ${u.rd})</option>`).join("")}
          </select>
        </div>
        <div>
          <h6>Escudos</h6>
          <select class="select" id="eq-escudos" size="3">
            ${ESCUDOS.map(e => `<option value="escudo:${e.nome}">${e.nome} (+${e.def} DEF, ${e.espacos}␣)</option>`).join("")}
          </select>
        </div>
        <div>
          <h6>Kits</h6>
          <select class="select" id="eq-kits" size="2">
            ${KITS.map(k => `<option value="kit:${k.nome}">${k.nome}</option>`).join("")}
          </select>
        </div>
        <div>
          <h6>Itens Especiais</h6>
          <select class="select" id="eq-especiais" size="2">
            ${ITENS_ESPECIAIS.map(i => `<option value="especial:${i.nome}">${i.nome}</option>`).join("")}
          </select>
        </div>
      </div>
    </div>
  `;

  const itensHTML = inv.itens.map((it, i) => `
    <tr>
      <td><input class="input" data-inv="${i}" data-k="nome" value="${escapeHtml(it.nome)}"></td>
      <td><input class="input" type="number" data-inv="${i}" data-k="quantidade" value="${it.quantidade || 1}" min="1" style="width: 70px;"></td>
      <td><input class="input" type="number" data-inv="${i}" data-k="espacos" value="${it.espacos || 1}" min="0" step="0.5" style="width: 70px;"></td>
      <td><input class="input" type="number" data-inv="${i}" data-k="preco" value="${it.preco || 0}" min="0" style="width: 80px;"></td>
      <td><input class="input" data-inv="${i}" data-k="descricao" value="${escapeHtml(it.descricao || "")}"></td>
      <td><button class="btn btn--danger btn--sm btn--icon" data-rm-inv="${i}">×</button></td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div class="card">
      <div class="row row--between" style="margin-bottom: var(--gap-3);">
        <div>
          <h3>Inventário</h3>
          <p class="text-xs text-soft">${ocupado} / ${limite} espaços ocupados</p>
        </div>
        <div class="row">
          <div class="tracker__bar" style="width: 200px;"><div class="tracker__fill" style="width: ${Math.min(100, (ocupado / Math.max(1, limite)) * 100)}%"></div></div>
        </div>
      </div>
      <div style="overflow-x: auto;">
        <table class="table">
          <thead>
            <tr>
              <th>Nome</th><th>Qtd</th><th>Espaços (cada)</th><th>Preço</th><th>Descrição</th><th></th>
            </tr>
          </thead>
          <tbody>${itensHTML || `<tr><td colspan="6" class="text-center text-mute" style="padding: var(--gap-4);">Inventário vazio.</td></tr>`}</tbody>
        </table>
      </div>
      <button class="btn btn--subtle btn--sm" id="add-inv" style="margin-top: var(--gap-3);">+ Adicionar item manual</button>
    </div>

    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Adicionar equipamento</div>
      ${pickerHTML}
      <button class="btn btn--primary btn--sm" id="add-eq" style="margin-top: var(--gap-3);">Adicionar à mochila</button>
    </div>
  `;

  function bindInv() {
    container.querySelectorAll("[data-inv]").forEach(inp => {
      inp.addEventListener("input", () => {
        const i = Number(inp.dataset.inv);
        const k = inp.dataset.k;
        let v = inp.value;
        if (["quantidade", "espacos", "preco"].includes(k)) v = Number(v) || 0;
        if (!state.inventario.itens[i]) state.inventario.itens[i] = {};
        state.inventario.itens[i][k] = v;
        scheduleSave();
      });
    });
    container.querySelectorAll("[data-rm-inv]").forEach(btn => {
      btn.onclick = () => {
        const i = Number(btn.dataset.rmInv);
        state.inventario.itens.splice(i, 1);
        renderTab("inventario", container);
        scheduleSave();
      };
    });
  }
  bindInv();
  container.querySelector("#add-inv").onclick = () => {
    state.inventario.itens.push({ nome: "Novo item", quantidade: 1, espacos: 1, preco: 0, descricao: "" });
    renderTab("inventario", container);
    scheduleSave();
  };
  container.querySelector("#add-eq").onclick = () => {
    const sel = ["#eq-armas", "#eq-uniformes", "#eq-escudos", "#eq-kits", "#eq-especiais"]
      .map(s => container.querySelector(s)).find(s => s && s.value);
    if (!sel || !sel.value) return;
    const [tipo, nome] = sel.value.split(":");
    let espacos = 1;
    let descricao = "";
    if (tipo === "arma") {
      const a = todasArmas.find(x => x.nome === nome);
      espacos = a.espacos;
      descricao = `${a.dano} • ${a.props}`;
    } else if (tipo === "uniforme") {
      const u = UNIFORMES.find(x => x.nome === nome);
      espacos = u.espacos;
      descricao = u.desc;
    } else if (tipo === "escudo") {
      const e = ESCUDOS.find(x => x.nome === nome);
      espacos = e.espacos;
      descricao = e.desc;
    } else if (tipo === "kit") {
      const k = KITS.find(x => x.nome === nome);
      descricao = k.desc;
    } else if (tipo === "especial") {
      const e = ITENS_ESPECIAIS.find(x => x.nome === nome);
      descricao = e.desc;
    }
    state.inventario.itens.push({ nome, quantidade: 1, espacos, preco: 0, descricao });
    renderTab("inventario", container);
    scheduleSave();
    toast(`${nome} adicionado`, "success");
  };
}

/* =========================================================
   ABA 10 — ANOTAÇÕES
   ========================================================= */

function renderAnotacoes(container) {
  if (!state.anotacoes) state.anotacoes = { caracteristicas: "", anotacoes: "", inspiracao: false };
  if (!state.apostilas) state.apostilas = { idiomas: "", ferramentas: "", outros: "" };
  const a = state.anotacoes;
  const ap = state.apostilas;

  container.innerHTML = `
    <div class="card">
      <div class="section-title">Anotações livres</div>
      <div class="field">
        <label class="field__label">Anotações</label>
        <textarea class="textarea" data-anot="anotacoes" rows="6">${escapeHtml(a.anotacoes || "")}</textarea>
      </div>
      <div class="field" style="margin-top: var(--gap-3);">
        <label class="field__label">Características / Treinamentos extras</label>
        <textarea class="textarea" data-anot="caracteristicas" rows="4">${escapeHtml(a.caracteristicas || "")}</textarea>
      </div>
      <label class="check" style="margin-top: var(--gap-3);">
        <input type="checkbox" data-anot="inspiracao" ${a.inspiracao ? "checked" : ""}>
        <span class="check__box"></span>
        <span class="check__label">Inspiração (caixinha de sucesso automático)</span>
      </label>
    </div>

    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Proficiências & Idiomas</div>
      <div class="grid grid-2">
        <div class="field">
          <label class="field__label">Idiomas</label>
          <input class="input" data-apo="idiomas" value="${escapeHtml(ap.idiomas)}" placeholder="Japonês, Inglês…">
        </div>
        <div class="field">
          <label class="field__label">Ferramentas / Veículos</label>
          <input class="input" data-apo="ferramentas" value="${escapeHtml(ap.ferramentas)}" placeholder="Veículos, ferramentas…">
        </div>
        <div class="field" style="grid-column: 1/-1;">
          <label class="field__label">Outros (armas, escudos, kits)</label>
          <input class="input" data-apo="outros" value="${escapeHtml(ap.outros)}">
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: var(--gap-4);">
      <div class="section-title">Backup <small>exportar/importar JSON</small></div>
      <div class="row">
        <button class="btn btn--subtle" id="exp-json">Exportar JSON</button>
        <button class="btn btn--subtle" id="imp-json">Importar JSON</button>
        <input type="file" id="imp-file" accept="application/json" style="display: none;">
      </div>
      <p class="text-xs text-mute" style="margin-top: var(--gap-2);">Os cookies têm limite de 4KB. Exportar para JSON é uma forma segura de backup.</p>
    </div>
  `;

  container.querySelectorAll("[data-anot]").forEach(inp => {
    const handler = () => {
      const k = inp.dataset.anot;
      if (inp.type === "checkbox") state.anotacoes[k] = inp.checked;
      else state.anotacoes[k] = inp.value;
      scheduleSave();
    };
    inp.addEventListener("input", handler);
    inp.addEventListener("change", handler);
  });
  container.querySelectorAll("[data-apo]").forEach(inp => {
    inp.addEventListener("input", () => {
      state.apostilas[inp.dataset.apo] = inp.value;
      scheduleSave();
    });
  });

  container.querySelector("#exp-json").onclick = () => {
    const json = exportChar(state.id);
    if (!json) return toast("Erro ao exportar", "error");
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(state.identificacao?.nome || "ficha").replace(/[^a-z0-9]/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Exportado", "success");
  };
  container.querySelector("#imp-json").onclick = () => container.querySelector("#imp-file").click();
  container.querySelector("#imp-file").onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const text = await f.text();
    const novoId = importChar(text);
    if (novoId) {
      toast("Ficha importada", "success");
      location.hash = "#/character/" + novoId;
    } else {
      toast("JSON inválido", "error");
    }
  };
}

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   MULTICLASSE — Modais
   ========================================================= */

function openAddMulticlasseModal() {
  const opcoes = listarEspParaMulticlasse(state);
  if (opcoes.length === 0) {
    toast("Não há mais especializações válidas para adicionar", "info");
    return;
  }

  const body = `
    <p class="text-soft text-sm" style="margin-bottom: var(--gap-4);">
      Escolha uma especialização. Os requisitos de atributo são validados.
      Ao adicionar, você começa no <strong>nível 1</strong> dessa especialização e,
      segundo as regras do livro, <em>não recebe novos treinamentos</em>.
    </p>
    <div class="grid grid-2" id="multiclasse-grid">
      ${opcoes.map(({ esp, check }) => {
        const req = esp.reqMulticlasse;
        const reqTxt = req
          ? `${req.atributo.map(a => a.toUpperCase()).join(" ou ")} ≥ ${req.min}`
          : "—";
        return `
          <div class="card esp-card ${check.ok ? "" : "esp-card--invalid"}" data-id="${escapeHtml(esp.id)}" data-ok="${check.ok}">
            <div class="row" style="margin-bottom: var(--gap-2);">
              <strong style="color: ${esp.cor};">${escapeHtml(esp.nome)}</strong>
              <span class="tag">PV ${esp.pvInicialBase} • d${esp.dadoVida} • ${esp.pePorNivel} PE/nv</span>
            </div>
            <p class="text-xs text-soft" style="margin-bottom: var(--gap-2);">${escapeHtml(esp.descricao)}</p>
            <div class="esp-card__req">
              <span class="text-xs text-mute">Requisito: ${reqTxt}</span>
              ${check.ok
                ? '<span class="esp-card__check esp-card__check--ok">✓</span>'
                : `<span class="esp-card__check esp-card__check--no" title="${escapeHtml(check.motivo || "")}">✕ ${escapeHtml(check.motivo || "Indisponível")}</span>`}
            </div>
            <button class="btn ${check.ok ? "btn--primary" : "btn--ghost"} btn--sm btn--block"
                    data-action="adicionar-esp" data-id="${escapeHtml(esp.id)}"
                    ${check.ok ? "" : "disabled"}>
              ${check.ok ? "Adicionar" : "Bloqueado"}
            </button>
          </div>
        `;
      }).join("")}
    </div>
  `;

  openModal({
    title: "Adicionar Multiclasse",
    body,
    wide: true,
    onClose: () => {},
  });

  setTimeout(() => {
    document.querySelectorAll('[data-action="adicionar-esp"]').forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const result = adicionarMulticlasse(state, id);
        if (!result.ok) {
          toast(result.motivo, "error");
          return;
        }
        const r = result.recalc;
        const parts = [];
        if (r.diff.pv) parts.push(`PV ${r.diff.pv > 0 ? "+" : ""}${r.diff.pv}`);
        if (r.diff.pe) parts.push(`PE ${r.diff.pe > 0 ? "+" : ""}${r.diff.pe}`);
        const msg = parts.length
          ? `Multiclasse em ${id} adicionada — ${parts.join(" / ")}`
          : `Multiclasse em ${id} adicionada`;
        toast(msg, "success");
        // Fechar modal e re-renderizar
        document.getElementById("modal-close")?.click();
        const content = document.getElementById("editor-content");
        if (content) {
          renderIdentificacao(content);
          renderVisaoCentral(content);
        }
        scheduleSave();
      });
    });
  }, 30);
}

function promptEspLevelUp(novoNivel, onConfirm) {
  const lista = state.identificacao.especializacoes || [];
  if (lista.length <= 1) {
    onConfirm(lista[0]?.id || state.identificacao.especializacao);
    return;
  }
  const body = `
    <p class="text-soft text-sm" style="margin-bottom: var(--gap-4);">
      Você tem mais de uma especialização. Em qual delas você ganha o próximo nível?
    </p>
    <div class="grid grid-2">
      ${lista.map(item => {
        const esp = ESPECIALIZACOES.find(e => e.id === item.id);
        const isPrim = item.id === state.identificacao.especializacao;
        return `
          <div class="card card--hover esp-card" data-id="${escapeHtml(item.id)}" style="cursor:pointer;">
            <div class="row">
              <span class="esp-item__dot" style="background:${esp?.cor || "var(--text-mute)"}"></span>
              <strong style="color: ${esp?.cor || "inherit"};">${escapeHtml(esp?.nome || item.id)}</strong>
              ${isPrim ? '<span class="tag tag--accent">Primária</span>' : ""}
            </div>
            <p class="text-xs text-mute" style="margin-top: var(--gap-2);">Nv atual: ${item.nivel} → ${item.nivel + 1}</p>
            ${!isPrim && item.nivel === 0
              ? '<p class="text-xs text-warn">Será o 1º nv dessa especialização (regra de Multiclasse se aplica).</p>'
              : ""}
          </div>
        `;
      }).join("")}
    </div>
  `;
  openModal({
    title: `Subir para Nível ${novoNivel}`,
    body,
    wide: true,
    onClose: () => {},
  });
  setTimeout(() => {
    document.querySelectorAll(".esp-card[data-id]").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        document.getElementById("modal-close")?.click();
        onConfirm(id);
      });
    });
  }, 30);
}

/* =========================================================
   ATRIBUTOS — Helper para inputs editáveis (compartilhado)
   ========================================================= */

function bindAtributoInputs(container, onChange) {
  container.querySelectorAll("[data-atr]").forEach(inp => {
    inp.addEventListener("change", () => {
      const k = inp.dataset.atr;
      const v = Number(inp.value);
      const novo = Math.max(1, Math.min(30, v || 10));
      if (state.atributos[k] === novo) return;
      state.atributos[k] = novo;

      // Recalcula PV/PE (modCon afeta PV; modAtributoChave afeta PE)
      const recalc = recalcularPontos(state);
      if (recalc.mudou) {
        const parts = [];
        if (recalc.diff.pv) parts.push(`PV ${recalc.diff.pv > 0 ? "+" : ""}${recalc.diff.pv}`);
        if (recalc.diff.pe) parts.push(`PE ${recalc.diff.pe > 0 ? "+" : ""}${recalc.diff.pe}`);
        if (parts.length) toast("Recalculado: " + parts.join(" / "), "info");
      }
      if (typeof onChange === "function") onChange();
      scheduleSave();
    });
  });
}

/* =========================================================
   RECURSOS — Botões +/- de PV/PE/Est (compartilhados)
   Clamp em [0, max + temp] para temp funcionar como buffer.
   ========================================================= */

function bindStepButtons(container, prefix, maxKey, currentKey) {
  container.querySelectorAll(`[data-${prefix}-step]`).forEach(btn => {
    btn.addEventListener("click", () => {
      const step = Number(btn.dataset[`${prefix}Step`]);
      const p = resourcePoints(state);
      const max = (p[maxKey] || 0) + (p[prefix + "Temp"] || 0);
      const atual = p[currentKey] || 0;
      const novo = atual + step;
      if (novo < 0) {
        p[currentKey] = 0;
        toast("Mínimo atingido (0)", "warn");
      } else if (novo > max) {
        p[currentKey] = max;
        const temp = p[prefix + "Temp"] || 0;
        toast(`Máximo atingido (${max}${temp ? ", incluindo +" + temp + " temp" : ""})`, "warn");
      } else {
        p[currentKey] = novo;
      }
      // Re-render escopo local + visão
      const local = container.closest("#section-modal-body");
      if (local) renderTab("recursos", local);
      else renderVisaoCentral(container);
      renderVisaoCentral(document.getElementById("editor-content"));
      scheduleSave();
    });
  });
}

/* Botões de temp HP/PE (input adjacente).
   Usa setTempHP/setTempPE que aplicam a regra do livro (teto = max/2, sem acumular). */
function bindTempButtons(container, prefix) {
  container.querySelectorAll(`[data-temp-${prefix}-step]`).forEach(btn => {
    btn.addEventListener("click", () => {
      const step = Number(btn.dataset[`temp${prefix.toUpperCase()}Step`]);
      const p = resourcePoints(state);
      const atual = p[prefix + "Temp"] || 0;
      const novo = Math.max(0, atual + step);
      const result = prefix === "pv" ? setTempHP(state, novo) : setTempPE(state, novo);
      const maxKey = prefix === "pv" ? "pvMax" : "peMax";
      const teto = tempMaxPara(p[maxKey]);
      if (novo > teto && !p[prefix + "Temp"] === result) {
        toast(`Temp máximo: ${teto} (metade de ${p[maxKey]})`, "warn");
      }
      const local = container.closest("#section-modal-body");
      if (local) renderTab("recursos", local);
      else renderVisaoCentral(container);
      renderVisaoCentral(document.getElementById("editor-content"));
      scheduleSave();
    });
  });
}

/* =========================================================
   NÍVEL — Recarrega Visão Central + cabeçalho + modal aberto
   ========================================================= */

function recarregarTudoAposNivel() {
  // 1. Visão central (canônica dos derivados)
  const content = document.getElementById("editor-content");
  if (content) renderVisaoCentral(content);

  // 2. Cabeçalho
  const idf = state.identificacao || {};
  const headerSub = document.querySelector(".app-header__brand small");
  if (headerSub) {
    headerSub.textContent = `Nv ${idf.nivel || 1} • ${idf.origem || "—"} • ${idf.especializacao || "—"}`;
  }

  // 3. Modal de seção aberto (Recursos/Perícias/Ataques/Técnica)
  const body = document.getElementById("section-modal-body");
  const titleEl = document.querySelector(".modal__title");
  if (body && titleEl) {
    const sec = FAB_SECTIONS.find(s => s.label === titleEl.textContent.trim());
    if (sec) renderTab(sec.id, body);
  }

  // 4. Página de combate aberta
  const pvMaxEl = document.getElementById("pv-max");
  if (pvMaxEl) pvMaxEl.value = state.pontos.pvMax;
  const peMaxEl = document.getElementById("pe-max");
  if (peMaxEl) peMaxEl.value = resourcePoints(state).peMax;
}
