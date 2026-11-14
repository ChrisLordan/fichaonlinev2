/* =========================================================
   APP — Roteador hash + inicialização
   ========================================================= */

import { listChars, getActiveId, setActiveId, getChar, createEmpty, saveChar } from './storage/cookies.js';
import { renderEditor } from './sheets/editor.js';
import { renderCombat } from './sheets/combat.js';
import { renderSummons } from './sheets/summons.js';
import { toast } from './ui/toast.js';
import { installRolls } from './ui/rolls.js';
import { installSettings } from '../../js/settings.js';
document.addEventListener('click',event=>{const a=event.target.closest('a[href="#/characters"],a[href="#/"]');if(a){a.href=a.getAttribute('href')==='#/characters'?'fichas.html':'index.html';}});
installSettings();
installRolls();

// As páginas públicas mantêm a identidade original do site.
function renderHome() { location.replace('index.html'); }
function renderList() { location.replace('fichas.html'); }

const routes = [
  { match: /^#?\/?$/, render: renderHome },
  { match: /^#\/characters\/?$/, render: renderList },
  { match: /^#\/character\/new\/?$/, render: renderWizard },
  { match: /^#\/character\/([^/]+)\/?$/, render: renderEditorRoute },
  { match: /^#\/character\/([^/]+)\/combat\/?$/, render: renderCombatRoute },
  { match: /^#\/character\/([^/]+)\/summons\/?$/, render: renderSummonsRoute },
];

async function renderWizard(app) {
  const { renderWizard: render } = await import('./sheets/wizard.js');
  return render(app);
}

async function renderEditorRoute(app, params) {
  const id = params[1];
  setActiveId(id);
  return renderEditor(app, id);
}

async function renderCombatRoute(app, params) {
  const id = params[1];
  return renderCombat(app, id);
}

async function renderSummonsRoute(app, params) {
  const id = params[1];
  return renderSummons(app, id);
}

function parseHash() {
  const hash = location.hash || "#/";
  for (const r of routes) {
    const m = hash.match(r.match);
    if (m) return { render: r.render, params: m };
  }
  return { render: renderHome, params: [] };
}

let currentCleanup = null;

async function route() {
  const app = document.getElementById("app");
  if (!app) return;

  if (typeof currentCleanup === "function") {
    try { currentCleanup(); } catch (e) { console.warn(e); }
  }

  app.innerHTML = "";
  app.classList.remove("anim-fade-in");
  void app.offsetWidth; // reflow para reiniciar animação
  app.classList.add("anim-fade-in");
  const { render, params } = parseHash();
  try {
    const cleanup = await render(app, params);
    if (typeof cleanup === "function") currentCleanup = cleanup;
    else currentCleanup = null;
  } catch (e) {
    console.error("Erro ao renderizar rota:", e);
    app.innerHTML = `
      <div class="app-main">
        <div class="card">
          <h2>Erro</h2>
          <p class="text-soft">${e.message}</p>
          <p><a href="#/">Voltar ao início</a></p>
        </div>
      </div>
    `;
  }
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);

// Auto-save indicator helper (global)
export function setSaveState(state) {
  const ind = document.querySelector(".save-indicator");
  if (ind) ind.setAttribute("data-state", state);
}

// Expor utilitários para debug
window.fm = { listChars, getChar, createEmpty, saveChar, toast };
