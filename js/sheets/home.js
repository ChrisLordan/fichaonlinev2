/* =========================================================
   HOME — Tela inicial com os dois botões
   ========================================================= */

export function renderHome(app) {
  app.innerHTML = `
    <div class="landing anim-fade-in-up">
      <div class="landing__brand">
        <div class="landing__mark">F&amp;M</div>
        <h1 class="landing__title">F.&amp;.M V5.0</h1>
      </div>
      <p class="landing__lede anim-fade-in-up anim-delay-2">
        Projeto Nao Oficial Onigiri
      </p>
      <div class="landing__actions anim-fade-in-up anim-delay-3">
        <a href="#/character/new" class="btn btn--primary btn--xl" id="btn-criar">
          <span class="btn__icon" aria-hidden="true">+</span>
          <span>Criar ficha</span>
        </a>
        <a href="#/characters" class="btn btn--ghost btn--xl" id="btn-acessar">
          <span class="btn__icon" aria-hidden="true">☰</span>
          <span>Acessar fichas</span>
        </a>
      </div>
    </div>
  `;
}
