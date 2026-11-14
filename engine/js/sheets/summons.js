/* =========================================================
   SUMMONS — Gestão de invocações / shikigamis
   ========================================================= */

import { getChar, saveChar } from '../storage/cookies.js';
import { formatMod, modificador, derivar } from '../data/calculos.js';
import { toast } from '../ui/toast.js';

let char = null;

export function renderSummons(app, id) {
  char = getChar(id);
  if (!char) {
    app.innerHTML = `<div class="app-main"><div class="empty-state"><h3>Ficha não encontrada</h3></div></div>`;
    return;
  }
  if (!char.invocacoes) char.invocacoes = [];

  app.innerHTML = `
    <div class="app-header">
      <div class="app-header__row">
        <a href="#/character/${id}" class="app-header__brand">
          <div class="app-header__brand-mark">⛧</div>
          <div>
            <div>Invocações — ${escapeHtml(char.identificacao?.nome) || "Ficha"}</div>
            <small>${char.invocacoes.length} ${char.invocacoes.length === 1 ? "invocação" : "invocações"}</small>
          </div>
        </a>
        <div class="app-header__spacer"></div>
        <div class="app-header__actions">
          <a href="#/character/${id}/combat" class="btn btn--subtle btn--sm">
            <span class="btn__icon" aria-hidden="true">⚔</span><span>Combate</span>
          </a>
          <a href="#/character/${id}" class="btn btn--ghost btn--sm">
            <span class="btn__icon" aria-hidden="true">←</span><span>Voltar à ficha</span>
          </a>
        </div>
      </div>
    </div>
    <div class="app-main">
      <div class="page-header">
        <div>
          <h1>Invocações & Shikigamis</h1>
          <div class="page-header__sub">Cada invocação tem seus próprios atributos, PV, PE e ações.</div>
        </div>
        <button class="btn btn--primary" id="add-summon">+ Nova invocação</button>
      </div>
      <div id="summons-list"></div>
    </div>
  `;

  renderList();
  document.getElementById("add-summon").onclick = () => {
    char.invocacoes.push(criarInvocacaoVazia());
    saveChar(char);
    renderList();
  };
}

function criarInvocacaoVazia() {
  return {
    nome: "Nova invocação",
    grau: "4°",
    pvMax: 10,
    pvAtual: 10,
    defesa: 10,
    deslocamento: 9,
    atributos: { forca: 10, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, presenca: 10 },
    acoes: [],
    pericias: [],
    descricao: "",
  };
}

function renderList() {
  const list = document.getElementById("summons-list");
  if (!list) return;
  if (char.invocacoes.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⛧</div>
        <h3>Nenhuma invocação</h3>
        <p class="text-soft">Adicione shikigamis, marionetes ou corpos amaldiçoados controlados.</p>
      </div>
    `;
    return;
  }
  list.innerHTML = `<div class="grid grid-auto">${char.invocacoes.map((s, i) => renderSummonCard(s, i)).join("")}</div>`;
  bindList();
}

function renderSummonCard(s, i) {
  const mods = {};
  for (const a of Object.keys(s.atributos)) mods[a] = modificador(s.atributos[a]);
  return `
    <div class="card" style="background: var(--bg-elev);">
      <div class="row" style="margin-bottom: var(--gap-2);">
        <input class="input" data-sum="${i}" data-k="nome" value="${escapeHtml(s.nome)}" style="flex: 1; font-weight: 600;">
        <select class="select" data-sum="${i}" data-k="grau" style="width: 80px;">
          ${["4°", "3°", "2°", "1°", "Especial"].map(g => `<option ${s.grau === g ? "selected" : ""}>${g}</option>`).join("")}
        </select>
      </div>

      <div class="row" style="gap: var(--gap-2); margin-bottom: var(--gap-3);">
        <div class="tracker" style="flex: 1;">
          <span class="tracker__label">PV</span>
          <input class="tracker__current" type="number" data-sum="${i}" data-k="pvAtual" value="${s.pvAtual ?? 0}">
          <span class="tracker__sep">/</span>
          <input class="tracker__max" type="number" data-sum="${i}" data-k="pvMax" value="${s.pvMax ?? 0}">
        </div>
        <div class="field" style="width: 100px;">
          <label class="field__label">DEF</label>
          <input class="input input--num" type="number" data-sum="${i}" data-k="defesa" value="${s.defesa ?? 10}">
        </div>
        <div class="field" style="width: 80px;">
          <label class="field__label">DESL</label>
          <input class="input input--num" type="number" data-sum="${i}" data-k="deslocamento" value="${s.deslocamento ?? 9}">
        </div>
      </div>

      <div class="grid grid-6" style="gap: var(--gap-2); margin-bottom: var(--gap-3);">
        ${Object.keys(s.atributos).map(a => `
          <div class="attr-card" style="padding: var(--gap-2);">
            <div class="attr-card__label" style="font-size: 9px;">${a.slice(0,3).toUpperCase()}</div>
            <input class="attr-card__value" type="number" data-sum-a="${i}" data-a="${a}" value="${s.atributos[a]}" min="1" max="30">
            <div class="attr-card__mod" style="font-size: var(--fs-md);">${formatMod(mods[a])}</div>
          </div>
        `).join("")}
      </div>

      <div class="field" style="margin-bottom: var(--gap-3);">
        <label class="field__label">Descrição</label>
        <textarea class="textarea" data-sum="${i}" data-k="descricao" rows="2">${escapeHtml(s.descricao || "")}</textarea>
      </div>

      <div style="margin-bottom: var(--gap-3);">
        <div class="row row--between" style="margin-bottom: var(--gap-1);">
          <strong class="text-sm">Ações</strong>
          <button class="btn btn--subtle btn--sm" data-add-acao="${i}">+ Ação</button>
        </div>
        ${(s.acoes || []).map((a, ai) => `
          <div class="row" style="gap: var(--gap-1); margin-top: var(--gap-1);">
            <input class="input" data-sum-ac="${i}" data-ai="${ai}" data-k="nome" value="${escapeHtml(a.nome || "")}" placeholder="Nome da ação" style="flex: 1;">
            <input class="input input--num" type="number" data-sum-ac="${i}" data-ai="${ai}" data-k="usos" value="${a.usos ?? 0}" placeholder="Usos" style="width: 60px;">
            <input class="input input--num" type="number" data-sum-ac="${i}" data-ai="${ai}" data-k="usosMax" value="${a.usosMax ?? 0}" placeholder="Max" style="width: 60px;">
            <button class="btn btn--danger btn--sm btn--icon" data-rm-acao="${i}" data-ai="${ai}">×</button>
          </div>
          <textarea class="textarea" data-sum-ac="${i}" data-ai="${ai}" data-k="descricao" rows="1" style="margin-top: 2px; font-size: var(--fs-xs);" placeholder="Descrição">${escapeHtml(a.descricao || "")}</textarea>
        `).join("") || `<p class="text-mute text-xs">Nenhuma ação.</p>`}
      </div>

      <div class="row" style="border-top: 1px solid var(--border-soft); padding-top: var(--gap-2);">
        <button class="btn btn--danger btn--sm" data-rm-sum="${i}">Excluir invocação</button>
      </div>
    </div>
  `;
}

function bindList() {
  const list = document.getElementById("summons-list");
  list.querySelectorAll("[data-sum]").forEach(inp => {
    inp.addEventListener("change", () => {
      const i = Number(inp.dataset.sum);
      const k = inp.dataset.k;
      let v = inp.value;
      if (["pvMax", "pvAtual", "defesa", "deslocamento"].includes(k)) v = Number(v) || 0;
      char.invocacoes[i][k] = v;
      saveChar(char);
      if (k === "nome" || k === "descricao" || k === "grau") renderList();
    });
    if (inp.tagName === "TEXTAREA") {
      inp.addEventListener("input", () => {
        const i = Number(inp.dataset.sum);
        const k = inp.dataset.k;
        char.invocacoes[i][k] = inp.value;
        scheduleSave();
      });
    }
  });
  list.querySelectorAll("[data-sum-a]").forEach(inp => {
    inp.addEventListener("change", () => {
      const i = Number(inp.dataset.sumA);
      const a = inp.dataset.a;
      const v = Number(inp.value) || 10;
      char.invocacoes[i].atributos[a] = Math.max(1, Math.min(30, v));
      saveChar(char);
      renderList();
    });
  });
  list.querySelectorAll("[data-add-acao]").forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.addAcao);
      if (!char.invocacoes[i].acoes) char.invocacoes[i].acoes = [];
      char.invocacoes[i].acoes.push({ nome: "", descricao: "", usos: 0, usosMax: 0 });
      saveChar(char);
      renderList();
    };
  });
  list.querySelectorAll("[data-sum-ac]").forEach(inp => {
    inp.addEventListener("change", () => {
      const i = Number(inp.dataset.sumAc);
      const ai = Number(inp.dataset.ai);
      const k = inp.dataset.k;
      let v = inp.value;
      if (k === "usos" || k === "usosMax") v = Number(v) || 0;
      if (!char.invocacoes[i].acoes[ai]) char.invocacoes[i].acoes[ai] = {};
      char.invocacoes[i].acoes[ai][k] = v;
      saveChar(char);
    });
  });
  list.querySelectorAll("[data-rm-acao]").forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.rmAcao);
      const ai = Number(btn.dataset.ai);
      char.invocacoes[i].acoes.splice(ai, 1);
      saveChar(char);
      renderList();
    };
  });
  list.querySelectorAll("[data-rm-sum]").forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.rmSum);
      if (confirm(`Excluir invocação "${char.invocacoes[i].nome}"?`)) {
        char.invocacoes.splice(i, 1);
        saveChar(char);
        renderList();
        toast("Invocação removida", "success");
      }
    };
  });
}

let saveTimeout = null;
function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveChar(char), 400);
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
