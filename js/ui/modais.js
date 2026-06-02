/* =========================================================
   MODAIS — Confirmação, alerta, picker
   ========================================================= */

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "style") Object.assign(node.style, v);
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "html") {
      node.innerHTML = v;
    } else {
      node.setAttribute(k, v);
    }
  }
  for (const c of children) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

export function openModal({ title, body, footer, wide = false, fullscreen = false, onClose }) {
  const container = document.getElementById("modal-container");
  if (!container) return;
  container.innerHTML = "";

  const close = () => {
    backdrop.remove();
    if (onClose) onClose();
  };

  const backdrop = el("div", { class: "modal-backdrop" + (fullscreen ? " modal-backdrop--fullscreen" : ""), onClick: (e) => { if (e.target === backdrop) close(); } });
  const modalCls = "modal" + (wide ? " modal--wide" : "") + (fullscreen ? " modal--fullscreen" : "");
  const modal = el("div", { class: modalCls });
  const header = el("div", { class: "modal__header" }, [
    el("h2", { class: "modal__title" }, title || ""),
    el("button", { class: "btn btn--ghost btn--sm btn--icon", onClick: close, "aria-label": "Fechar" }, "×"),
  ]);
  const bodyEl = el("div", { class: "modal__body" });
  if (typeof body === "string") bodyEl.innerHTML = body;
  else if (body instanceof Node) bodyEl.appendChild(body);

  modal.appendChild(header);
  modal.appendChild(bodyEl);
  if (footer) {
    const footerEl = el("div", { class: "modal__footer" });
    for (const f of footer) footerEl.appendChild(f);
    modal.appendChild(footerEl);
  }
  backdrop.appendChild(modal);
  container.appendChild(backdrop);

  // Esc fecha
  const onKey = (e) => {
    if (e.key === "Escape") {
      close();
      document.removeEventListener("keydown", onKey);
    }
  };
  document.addEventListener("keydown", onKey);

  return { close, modal, body: bodyEl };
}

export function confirmDialog(message, { title = "Confirmar", confirmText = "Confirmar", cancelText = "Cancelar", danger = false } = {}) {
  return new Promise((resolve) => {
    const cancelBtn = el("button", { class: "btn btn--ghost" }, cancelText);
    const confirmBtn = el("button", { class: "btn " + (danger ? "btn--danger" : "btn--primary") }, confirmText);
    const { close } = openModal({
      title,
      body: el("p", { class: "text-soft" }, message),
      footer: [cancelBtn, confirmBtn],
    });
    cancelBtn.onclick = () => { close(); resolve(false); };
    confirmBtn.onclick = () => { close(); resolve(true); };
  });
}

export function alertDialog(message, { title = "Aviso" } = {}) {
  return new Promise((resolve) => {
    const okBtn = el("button", { class: "btn btn--primary" }, "OK");
    const { close } = openModal({
      title,
      body: el("p", { class: "text-soft" }, message),
      footer: [okBtn],
    });
    okBtn.onclick = () => { close(); resolve(); };
  });
}

export function promptDialog(message, { title = "Entrada", defaultValue = "", okText = "OK", cancelText = "Cancelar" } = {}) {
  return new Promise((resolve) => {
    const input = el("input", { class: "input", type: "text", value: defaultValue });
    const cancelBtn = el("button", { class: "btn btn--ghost" }, cancelText);
    const okBtn = el("button", { class: "btn btn--primary" }, okText);
    const body = el("div", { class: "col" }, [el("p", { class: "text-soft" }, message), input]);
    input.focus();
    input.select();
    const submit = () => { const v = input.value; close(); resolve(v); };
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
    const { close } = openModal({ title, body, footer: [cancelBtn, okBtn] });
    cancelBtn.onclick = () => { close(); resolve(null); };
    okBtn.onclick = submit;
  });
}

/** Prompt para escolher 1 (ou N) TRs de uma lista.
 *  @param {Array<{id, nome, atributo}>} opcoes - lista de TRs disponíveis
 *  @param {{ titulo?: string, mensagem?: string, maxEscolhas?: number, selecionaveisIniciais?: string[] }} opts
 *  @returns {Promise<string[]>} - array de ids escolhidos (vazio se cancelou)
 */
export function promptEscolherTR(opcoes, opts = {}) {
  const { titulo = "Escolha Teste de Resistência", mensagem = "Selecione 1 Teste de Resistência:", maxEscolhas = 1, selecionaveisIniciais = [] } = opts;
  return new Promise((resolve) => {
    let escolhidos = new Set(selecionaveisIniciais);
    const list = el("div", { class: "col" });
    const checkboxes = [];
    opcoes.forEach(opt => {
      const cb = el("input", { type: "checkbox", value: opt.id });
      cb.checked = escolhidos.has(opt.id);
      cb.addEventListener("change", () => {
        if (cb.checked) {
          if (maxEscolhas === 1) {
            escolhidos.clear();
            checkboxes.forEach(c => { if (c !== cb) c.checked = false; });
            escolhidos.add(opt.id);
          } else {
            escolhidos.add(opt.id);
          }
        } else {
          escolhidos.delete(opt.id);
        }
      });
      checkboxes.push(cb);
      const lbl = el("label", { class: "row", style: { gap: "var(--gap-2)", padding: "var(--gap-2)", cursor: "pointer", background: "var(--bg-elev)", borderRadius: "var(--radius-md)" } }, [
        cb,
        el("span", {}, [el("strong", {}, opt.nome), el("small", { class: "text-soft", style: { marginLeft: "var(--gap-2)" } }, `(${opt.atributo})`)]),
      ]);
      list.appendChild(lbl);
    });
    const body = el("div", { class: "col" }, [
      el("p", { class: "text-soft text-sm" }, mensagem),
      list,
    ]);
    const cancelBtn = el("button", { class: "btn btn--ghost" }, "Cancelar");
    const okBtn = el("button", { class: "btn btn--primary" }, "Confirmar");
    const submit = () => {
      const arr = Array.from(escolhidos);
      close();
      resolve(arr);
    };
    const { close } = openModal({ title: titulo, body, footer: [cancelBtn, okBtn] });
    cancelBtn.onclick = () => { close(); resolve([]); };
    okBtn.onclick = submit;
  });
}

export { el };
