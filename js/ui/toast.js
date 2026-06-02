/* =========================================================
   TOAST — Feedback rápido
   ========================================================= */

let toastSeq = 0;

export function toast(message, type = "info", duration = 2400) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const id = "toast-" + ++toastSeq;
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.id = id;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add("toast--leaving");
    setTimeout(() => el.remove(), 250);
  }, duration);
}

export const toastTypes = {
  success: "success",
  error: "error",
  info: "info",
  warning: "warning",
};
