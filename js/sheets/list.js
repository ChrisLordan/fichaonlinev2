/* =========================================================
   LIST — Tela de listagem de fichas
   ========================================================= */

import { listChars, getChar, deleteChar, duplicateChar, storageInfo } from '../storage/cookies.js';
import { confirmDialog, promptDialog, alertDialog } from '../ui/modais.js';
import { toast } from '../ui/toast.js';

function iniciais(nome) {
  if (!nome) return "?";
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1][0] || "")).toUpperCase();
}

function corAvatar(nome) {
  // Cor derivada do nome (hash simples)
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `linear-gradient(135deg, hsl(${hue} 60% 30%), hsl(${(hue + 40) % 360} 70% 50%))`;
}

function formatRel(timestamp) {
  if (!timestamp) return "—";
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora há pouco";
  if (min < 60) return `${min} min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d atrás`;
  return new Date(timestamp).toLocaleDateString("pt-BR");
}

export function renderList(app) {
  const chars = listChars();
  const info = storageInfo();
  const QUOTA_BYTES = 50 * 4096;
  const pct = Math.min(100, (info.bytes / QUOTA_BYTES) * 100);
  const pctLabel = pct < 1 ? pct.toFixed(1) : Math.round(pct);

  app.innerHTML = `
    <div class="app-main">
      <div class="page-header">
        <div>
          <h1>Suas fichas</h1>
          <div class="page-header__sub">
            ${chars.length === 0 ? "Nenhuma ficha salva" : `${chars.length} ${chars.length === 1 ? "ficha" : "fichas"} • ${info.kb} KB usados em cookies`}
          </div>
          <div class="storage-bar">
            <div class="storage-bar__stats">
              <span><strong>${info.fichas}</strong> ${info.fichas === 1 ? "ficha" : "fichas"}</span>
              <span class="storage-bar__dot" aria-hidden="true">•</span>
              <span><strong>${info.cookies}</strong> cookies</span>
              <span class="storage-bar__dot" aria-hidden="true">•</span>
              <span><strong>${info.kb}</strong> KB <span class="storage-bar__pct">(${pctLabel}%)</span></span>
            </div>
            <div class="storage-bar__track" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100" aria-label="Uso de cookies">
              <div class="storage-bar__fill" style="width: ${pct}%"></div>
            </div>
          </div>
        </div>
        <div class="row">
          <a href="#/" class="btn btn--ghost">
            <span class="btn__icon" aria-hidden="true">←</span><span>Início</span>
          </a>
          <a href="#/character/new" class="btn btn--primary">
            <span class="btn__icon" aria-hidden="true">+</span><span>Nova ficha</span>
          </a>
        </div>
      </div>

      ${chars.length === 0
        ? `<div class="empty-state">
            <div class="empty-state__icon">⊕</div>
            <h3>Sua coleção está vazia</h3>
            <p class="text-soft">Comece criando sua primeira ficha de personagem.</p>
            <p style="margin-top: var(--gap-4);">
              <a href="#/character/new" class="btn btn--primary">Criar ficha</a>
            </p>
          </div>`
        : `<div class="grid grid-auto">
            ${chars.map((c, i) => renderCharCard(c, i)).join("")}
          </div>`
      }
    </div>
  `;

  // Eventos
  app.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      handleAction(action, id);
    });
  });

  app.querySelectorAll(".char-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-action]")) return;
      location.hash = "#/character/" + card.dataset.id;
    });
  });
}

function renderCharCard(c, index = 0) {
  const delay = Math.min(index, 5) + 1;
  return `
    <div class="card char-card card--lift anim-fade-in-up anim-delay-${delay}" data-id="${c.id}">
      <div class="char-card__head">
        <div class="char-card__avatar" style="background: ${corAvatar(c.nome || "?")}">
          ${iniciais(c.nome)}
        </div>
        <div class="char-card__title">
          <div class="char-card__name">${escapeHtml(c.nome) || "Sem nome"}</div>
          <div class="char-card__meta">Nível ${c.nivel} • ${formatRel(c.updatedAt)}</div>
        </div>
      </div>
      <div class="char-card__tags">
        <span class="tag tag--accent">${escapeHtml(c.origem || "—")}</span>
        <span class="tag">${escapeHtml(c.especializacao || "—")}</span>
      </div>
      <div class="char-card__actions">
        <a href="#/character/${c.id}" class="btn btn--subtle btn--sm" style="flex:1;">
          <span class="btn__icon" aria-hidden="true">▸</span><span>Abrir</span>
        </a>
        <button class="btn btn--ghost btn--sm" data-action="duplicate" data-id="${c.id}">
          <span class="btn__icon" aria-hidden="true">⎘</span><span>Duplicar</span>
        </button>
        <button class="btn btn--danger btn--sm" data-action="delete" data-id="${c.id}">
          <span class="btn__icon" aria-hidden="true">✕</span><span>Excluir</span>
        </button>
      </div>
    </div>
  `;
}

async function handleAction(action, id) {
  if (action === "delete") {
    const ok = await confirmDialog("Excluir esta ficha permanentemente? Esta ação não pode ser desfeita.", {
      title: "Excluir ficha",
      danger: true,
      confirmText: "Excluir",
    });
    if (ok) {
      deleteChar(id);
      toast("Ficha excluída", "success");
      renderList(document.getElementById("app"));
    }
  } else if (action === "duplicate") {
    const newId = duplicateChar(id);
    if (newId) {
      toast("Ficha duplicada", "success");
      renderList(document.getElementById("app"));
    } else {
      toast("Erro ao duplicar", "error");
    }
  } else if (action === "rename") {
    const ch = getChar(id);
    if (!ch) return;
    const newName = await promptDialog("Novo nome da ficha:", {
      title: "Renomear",
      defaultValue: ch.identificacao?.nome || "",
    });
    if (newName != null) {
      ch.identificacao = ch.identificacao || {};
      ch.identificacao.nome = newName;
      // re-salvar
      import('../storage/cookies.js').then(({ saveChar }) => {
        saveChar(ch);
        toast("Renomeada", "success");
        renderList(document.getElementById("app"));
      });
    }
  }
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
