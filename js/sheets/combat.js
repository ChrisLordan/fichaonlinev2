/* =========================================================
   COMBAT — Modo de combate com rolagens e trackers
   ========================================================= */

import { getChar, saveChar } from '../storage/cookies.js';
import { CONDICOES, formatMod, modificador, derivar } from '../data/calculos.js';
import { ESPECIALIZACOES } from '../data/especializacoes.js';
import { toast } from '../ui/toast.js';

let char = null;
let rollLog = [];
let combateState = null;

export function renderCombat(app, id) {
  char = getChar(id);
  if (!char) {
    app.innerHTML = `<div class="app-main"><div class="empty-state"><h3>Ficha não encontrada</h3></div></div>`;
    return;
  }
  combateState = char.combateEstado || { empolgacao: 0, pontosPreparo: 0, exaustao: 0, condicoes: [], iniciativa: null };
  if (!char.combateEstado) char.combateEstado = combateState;

  app.innerHTML = `
    <div class="app-header">
      <div class="app-header__row">
        <a href="#/character/${id}" class="app-header__brand">
          <div class="app-header__brand-mark">⚔</div>
          <div>
            <div>Combate — ${escapeHtml(char.identificacao?.nome) || "Ficha"}</div>
            <small>Nv ${char.identificacao?.nivel || 1} • ${escapeHtml(char.identificacao?.origem) || "—"} • ${escapeHtml(char.identificacao?.especializacao) || "—"}</small>
          </div>
        </a>
        <div class="app-header__spacer"></div>
        <div class="app-header__actions">
          <a href="#/character/${id}/summons" class="btn btn--subtle btn--sm">
            <span class="btn__icon" aria-hidden="true">⛧</span><span>Invocações</span>
          </a>
          <a href="#/character/${id}" class="btn btn--ghost btn--sm">
            <span class="btn__icon" aria-hidden="true">←</span><span>Voltar à ficha</span>
          </a>
        </div>
      </div>
    </div>
    <div class="app-main">
      <div class="split-layout">
        <div id="combat-main"></div>
        <div class="dice-panel" id="dice-panel"></div>
      </div>
    </div>
  `;

  renderMain();
  renderDice();
  renderLog();
}

function renderMain() {
  const main = document.getElementById("combat-main");
  if (!main) return;
  const d = derivar(char);
  const esp = ESPECIALIZACOES.find(e => e.id === char.identificacao?.especializacao);
  const p = char.pontos || {};
  const idf = char.identificacao || {};
  const nivel = idf.nivel || 1;
  const modSab = d.mods.sabedoria;
  const modCon = d.mods.constituicao;

  const pontosPreparoMax = esp?.id === "Especialista em Combate" ? nivel + modSab : 0;
  const empolgacaoMax = esp?.id === "Lutador" ? 5 : 0;

  main.innerHTML = `
    <div class="card" style="background: var(--bg-elev);">
      <div class="row row--between row--wrap" style="gap: var(--gap-4);">
        <div class="tracker" style="min-width: 260px; flex: 1;">
          <span class="tracker__label">PV</span>
          <input class="tracker__current" type="number" id="pv-atual" value="${p.pvAtual ?? 10}">
          <span class="tracker__sep">/</span>
          <input class="tracker__max" type="number" id="pv-max" value="${p.pvMax ?? 10}">
          <div class="tracker__bar"><div class="tracker__fill" style="width: ${pct(p.pvAtual, p.pvMax)}%"></div></div>
        </div>
        <div class="row">
          <button class="btn btn--danger btn--sm" data-dano="5">-5</button>
          <button class="btn btn--danger btn--sm" data-dano="10">-10</button>
          <button class="btn btn--danger btn--sm" data-dano="custom">Outro</button>
          <button class="btn btn--subtle btn--sm" data-cura="5">+5</button>
          <button class="btn btn--subtle btn--sm" data-cura="10">+10</button>
          <button class="btn btn--subtle btn--sm" data-cura="custom">Outro</button>
        </div>
      </div>
    </div>

    <div class="grid grid-3" style="margin-top: var(--gap-3);">
      <div class="card" style="background: var(--bg-elev);">
        <div class="row row--between">
          <span class="text-soft text-xs text-uppercase">Pontos de Energia</span>
          <span class="text-mute text-xs">PE</span>
        </div>
        <div class="row" style="margin-top: var(--gap-2);">
          <input class="tracker__current" type="number" id="pe-atual" value="${p.peAtual ?? 0}">
          <span class="tracker__sep">/</span>
          <input class="tracker__max" type="number" id="pe-max" value="${p.peMax ?? 0}">
        </div>
        <div class="row" style="margin-top: var(--gap-2); gap: var(--gap-1);">
          <button class="btn btn--subtle btn--sm" data-pe-delta="-1">-1</button>
          <button class="btn btn--subtle btn--sm" data-pe-delta="1">+1</button>
          <button class="btn btn--subtle btn--sm" data-pe-delta="custom">Outro</button>
        </div>
      </div>

      <div class="card" style="background: var(--bg-elev);">
        <div class="row row--between">
          <span class="text-soft text-xs text-uppercase">Defesa & Iniciativa</span>
        </div>
        <div class="row" style="margin-top: var(--gap-2); gap: var(--gap-3);">
          <div>
            <div class="text-xs text-mute">DEF</div>
            <div class="text-mono text-accent" style="font-size: var(--fs-2xl);">${d.defesa}</div>
          </div>
          <div>
            <div class="text-xs text-mute">INIC</div>
            <div class="text-mono text-accent" style="font-size: var(--fs-2xl);">${formatMod(d.iniciativa)}</div>
          </div>
          <div>
            <div class="text-xs text-mute">ATEN</div>
            <div class="text-mono text-accent" style="font-size: var(--fs-2xl);">${d.atencao}</div>
          </div>
        </div>
        <button class="btn btn--primary btn--sm" id="rolar-iniciativa" style="margin-top: var(--gap-2);">Rolar iniciativa</button>
      </div>

      <div class="card" style="background: var(--bg-elev);">
        <div class="row row--between">
          <span class="text-soft text-xs text-uppercase">Recursos de Classe</span>
        </div>
        <div class="col" style="margin-top: var(--gap-2);">
          ${empolgacaoMax > 0 ? `
            <div>
              <div class="text-xs text-soft">Empolgação (Lutador)</div>
              <div class="row" style="gap: var(--gap-1); margin-top: var(--gap-1);">
                <button class="btn btn--subtle btn--sm" data-emp="-1">−</button>
                <span class="text-mono text-accent" style="min-width: 24px; text-align: center;">${combateState.empolgacao}</span>
                <button class="btn btn--subtle btn--sm" data-emp="1">+</button>
                <span class="text-xs text-mute">/ ${empolgacaoMax}</span>
                <button class="btn btn--ghost btn--sm" data-emp="reset" style="margin-left: auto;">Reset</button>
              </div>
            </div>
          ` : ""}
          ${pontosPreparoMax > 0 ? `
            <div>
              <div class="text-xs text-soft">Pontos de Preparo (Esp. Combate)</div>
              <div class="row" style="gap: var(--gap-1); margin-top: var(--gap-1);">
                <button class="btn btn--subtle btn--sm" data-pp="-1">−</button>
                <span class="text-mono text-accent" style="min-width: 24px; text-align: center;">${combateState.pontosPreparo}</span>
                <button class="btn btn--subtle btn--sm" data-pp="1">+</button>
                <span class="text-xs text-mute">/ ${pontosPreparoMax}</span>
              </div>
            </div>
          ` : ""}
          <div>
            <div class="text-xs text-soft">Exaustão</div>
            <div class="row" style="gap: var(--gap-1); margin-top: var(--gap-1);">
              <button class="btn btn--subtle btn--sm" data-exa="-1">−</button>
              <span class="text-mono" style="min-width: 24px; text-align: center;">${combateState.exaustao}</span>
              <button class="btn btn--subtle btn--sm" data-exa="1">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: var(--gap-3); background: var(--bg-elev);">
      <div class="row row--between" style="margin-bottom: var(--gap-2);">
        <strong>Condições</strong>
        <button class="btn btn--subtle btn--sm" id="limpar-cond">Limpar todas</button>
      </div>
      <div class="cond-grid">
        ${CONDICOES.map(c => `
          <button class="chip ${(combateState.condicoes || []).includes(c) ? "chip--active" : ""}" data-cond="${c}">${c}</button>
        `).join("")}
      </div>
    </div>
  `;

  // Bind
  main.querySelectorAll("[data-dano]").forEach(btn => {
    btn.onclick = async () => {
      let v = btn.dataset.dano;
      if (v === "custom") {
        v = prompt("Quanto de dano?");
        if (!v) return;
        v = Number(v);
      } else v = Number(v);
      aplicarDano(v);
    };
  });
  main.querySelectorAll("[data-cura]").forEach(btn => {
    btn.onclick = async () => {
      let v = btn.dataset.cura;
      if (v === "custom") {
        v = prompt("Quanto curar?");
        if (!v) return;
        v = Number(v);
      } else v = Number(v);
      aplicarCura(v);
    };
  });
  main.querySelectorAll("[data-pe-delta]").forEach(btn => {
    btn.onclick = () => {
      let v = btn.dataset.peDelta;
      if (v === "custom") {
        v = prompt("Alterar PE em quanto? (+ recupera, − gasta)");
        if (!v) return;
        v = Number(v);
      } else v = Number(v);
      char.pontos.peAtual = Math.max(0, Math.min(char.pontos.peMax, (char.pontos.peAtual || 0) + v));
      saveChar(char);
      renderMain();
    };
  });
  main.querySelector("#pv-atual").onchange = (e) => { char.pontos.pvAtual = clamp(Number(e.target.value), 0, char.pontos.pvMax + (char.pontos.pvTemp || 0)); saveChar(char); renderMain(); };
  main.querySelector("#pv-max").onchange = (e) => { char.pontos.pvMax = Math.max(1, Number(e.target.value) || 1); saveChar(char); renderMain(); };
  main.querySelector("#pe-atual").onchange = (e) => { char.pontos.peAtual = clamp(Number(e.target.value), 0, char.pontos.peMax + (char.pontos.peTemp || 0)); saveChar(char); renderMain(); };
  main.querySelector("#pe-max").onchange = (e) => { char.pontos.peMax = Math.max(0, Number(e.target.value) || 0); saveChar(char); renderMain(); };

  main.querySelector("#rolar-iniciativa").onclick = () => {
    const btn = main.querySelector("#rolar-iniciativa");
    btn.classList.remove("btn--rolling");
    void btn.offsetWidth;
    btn.classList.add("btn--rolling");
    setTimeout(() => btn.classList.remove("btn--rolling"), 500);
    const r = rolarDado(20);
    const total = r + d.iniciativa;
    combateState.iniciativa = { roll: r, total, when: Date.now() };
    char.combateEstado = combateState;
    saveChar(char);
    addLog(`Iniciativa: <strong class="roll-result">${total}</strong> (d20 ${r} + ${formatMod(d.iniciativa)})`);
    toast(`Iniciativa: ${total}`, "info");
    renderLog();
  };

  main.querySelectorAll("[data-emp]").forEach(btn => {
    btn.onclick = () => {
      if (btn.dataset.emp === "reset") combateState.empolgacao = 0;
      else combateState.empolgacao = clamp((combateState.empolgacao || 0) + Number(btn.dataset.emp), 0, 5);
      char.combateEstado = combateState;
      saveChar(char);
      renderMain();
    };
  });
  main.querySelectorAll("[data-pp]").forEach(btn => {
    btn.onclick = () => {
      combateState.pontosPreparo = clamp((combateState.pontosPreparo || 0) + Number(btn.dataset.pp), 0, pontosPreparoMax);
      char.combateEstado = combateState;
      saveChar(char);
      renderMain();
    };
  });
  main.querySelectorAll("[data-exa]").forEach(btn => {
    btn.onclick = () => {
      combateState.exaustao = clamp((combateState.exaustao || 0) + Number(btn.dataset.exa), 0, 6);
      char.combateEstado = combateState;
      saveChar(char);
      renderMain();
    };
  });

  main.querySelectorAll("[data-cond]").forEach(btn => {
    btn.onclick = () => {
      const c = btn.dataset.cond;
      const arr = combateState.condicoes || [];
      const idx = arr.indexOf(c);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(c);
      combateState.condicoes = arr;
      char.combateEstado = combateState;
      saveChar(char);
      renderMain();
    };
  });
  main.querySelector("#limpar-cond").onclick = () => {
    combateState.condicoes = [];
    char.combateEstado = combateState;
    saveChar(char);
    renderMain();
  };
}

function aplicarDano(v) {
  let pv = char.pontos.pvAtual || 0;
  let temp = char.pontos.pvTemp || 0;
  // Absorve temp primeiro
  if (temp > 0) {
    if (v <= temp) {
      char.pontos.pvTemp = temp - v;
      v = 0;
    } else {
      v = v - temp;
      char.pontos.pvTemp = 0;
    }
  }
  char.pontos.pvAtual = Math.max(0, pv - v);
  saveChar(char);
  addLog(`Dano: <strong>${v}</strong> (PV: ${pv} → ${char.pontos.pvAtual})`);
  if (char.pontos.pvAtual === 0) toast("PV zerado! Teste de morte.", "warning");
  renderMain();
  renderLog();
}

function aplicarCura(v) {
  char.pontos.pvAtual = Math.min(char.pontos.pvMax, (char.pontos.pvAtual || 0) + v);
  saveChar(char);
  addLog(`Cura: <strong>+${v}</strong> (PV: ${char.pontos.pvAtual})`);
  renderMain();
  renderLog();
}

function pct(a, b) {
  if (!b) return 0;
  return Math.max(0, Math.min(100, (a / b) * 100));
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function rolarDado(faces) {
  return 1 + Math.floor(Math.random() * faces);
}

function addLog(html) {
  rollLog.unshift({ html, t: Date.now() });
  if (rollLog.length > 20) rollLog.pop();
}

function renderLog() {
  const log = document.getElementById("roll-log");
  if (!log) return;
  log.innerHTML = rollLog.map((l, i) => `
    <div class="roll-log__line">
      <span>${l.html}</span>
      <span class="text-mute">${new Date(l.t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
    </div>
  `).join("") || `<div class="roll-log__line"><span class="text-mute">Sem rolagens ainda</span></div>`;
}

function renderDice() {
  const dp = document.getElementById("dice-panel");
  if (!dp) return;
  dp.innerHTML = `
    <div class="card" style="background: var(--bg-elev);">
      <h4 style="margin-bottom: var(--gap-2);">Rolador de dados</h4>
      <div class="dice-row">
        <button class="dice-btn dice-btn--primary" data-d="d20">d20</button>
      </div>
      <div class="dice-row" style="margin-top: var(--gap-2);">
        <button class="dice-btn" data-d="d4">d4</button>
        <button class="dice-btn" data-d="d6">d6</button>
        <button class="dice-btn" data-d="d8">d8</button>
        <button class="dice-btn" data-d="d10">d10</button>
        <button class="dice-btn" data-d="d12">d12</button>
        <button class="dice-btn" data-d="d100">d100</button>
      </div>
      <div class="field" style="margin-top: var(--gap-3);">
        <label class="field__label">Modificador</label>
        <div class="row" style="gap: var(--gap-1); flex-wrap: wrap;">
          ${[-3, -2, -1, 0, 1, 2, 3, 4, 5].map(m => `
            <button class="pill" data-mod="${m}" aria-pressed="false">${formatMod(m)}</button>
          `).join("")}
        </div>
      </div>
      <div class="field" style="margin-top: var(--gap-3);">
        <label class="field__label">Teste contra CD</label>
        <input class="input" type="number" id="teste-cd" placeholder="ex: 15">
      </div>
      <div class="row" style="margin-top: var(--gap-3);">
        <button class="btn btn--subtle btn--sm btn--block" id="rolar-mod">Rolar d20 com modificador</button>
      </div>
      <h4 style="margin: var(--gap-4) 0 var(--gap-2);">Histórico</h4>
      <div class="roll-log" id="roll-log"></div>
      <button class="btn btn--ghost btn--sm btn--block" id="limpar-log" style="margin-top: var(--gap-2);">Limpar histórico</button>
    </div>
  `;

  let mod = 0;
  let modBtns = dp.querySelectorAll("[data-mod]");
  modBtns.forEach(b => {
    b.onclick = () => {
      modBtns.forEach(x => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      mod = Number(b.dataset.mod);
    };
  });
  // default 0
  modBtns[3].setAttribute("aria-pressed", "true");

  dp.querySelectorAll("[data-d]").forEach(btn => {
    btn.onclick = () => {
      const sides = Number(btn.dataset.d.slice(1));
      btn.classList.remove("btn--rolling");
      void btn.offsetWidth; // reflow para reiniciar animação
      btn.classList.add("btn--rolling");
      setTimeout(() => btn.classList.remove("btn--rolling"), 500);
      const r = rolarDado(sides);
      addLog(`${btn.dataset.d}: <strong class="roll-result">${r}</strong>`);
      renderLog();
    };
  });
  dp.querySelector("#rolar-mod").onclick = () => {
    const btn = dp.querySelector("#rolar-mod");
    btn.classList.remove("btn--rolling");
    void btn.offsetWidth;
    btn.classList.add("btn--rolling");
    setTimeout(() => btn.classList.remove("btn--rolling"), 500);
    const r = rolarDado(20);
    const total = r + mod;
    const cd = Number(dp.querySelector("#teste-cd").value);
    let res = "";
    if (cd) {
      if (total >= cd) res = ` <span class="text-success">✓ ${cd}+</span>`;
      else res = ` <span class="text-danger">✗ ${cd}+</span>`;
    }
    addLog(`d20${mod !== 0 ? formatMod(mod) : ""}: <strong class="roll-result">${total}</strong>${res}`);
    renderLog();
  };
  dp.querySelector("#limpar-log").onclick = () => { rollLog = []; renderLog(); };
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
