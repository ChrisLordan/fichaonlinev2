/* =========================================================
   TABS — Sistema de abas genérico
   ========================================================= */

export function makeTabs({ container, tabs, initial = null, onChange = null }) {
  let current = initial || (tabs[0] && tabs[0].id);

  function render() {
    container.innerHTML = "";
    const nav = document.createElement("div");
    nav.className = "section-tabs";
    for (const t of tabs) {
      const btn = document.createElement("button");
      btn.className = "section-tab";
      btn.textContent = t.label;
      if (t.icon) btn.textContent = (t.icon + "  ") + t.label;
      if (t.id === current) btn.setAttribute("aria-current", "page");
      btn.onclick = () => {
        if (current === t.id) return;
        current = t.id;
        render();
        if (onChange) onChange(current);
      };
      nav.appendChild(btn);
    }
    container.appendChild(nav);
  }

  render();
  return {
    get current() { return current; },
    set(id) { current = id; render(); if (onChange) onChange(current); },
  };
}
