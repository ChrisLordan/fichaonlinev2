/* =========================================================
   WIZARD — Criação guiada de ficha
   ========================================================= */

import { createEmpty, saveChar } from '../storage/cookies.js';
import { ORIGENS } from '../data/origens.js';
import { CLANS } from '../data/clans.js';
import { ESPECIALIZACOES, METODOS_ATRIBUTO, GRAU_POR_NIVEL, aplicarTreinamentosEsp } from '../data/especializacoes.js';
import { TESTES_RESISTENCIA } from '../data/calculos.js';
import { formatMod, recalcularPontos } from '../data/calculos.js';
import { toast } from '../ui/toast.js';
import { promptEscolherTR } from '../ui/modais.js';
import { CUSTOM_ORIGIN, customOriginForm } from '../ui/custom-origin.js';

const ATRIBUTOS = [
  { id: "forca", nome: "Força" },
  { id: "destreza", nome: "Destreza" },
  { id: "constituicao", nome: "Constituição" },
  { id: "inteligencia", nome: "Inteligência" },
  { id: "sabedoria", nome: "Sabedoria" },
  { id: "presenca", nome: "Presença" },
];

export function renderWizard(app) {
  const state = {
    step: 1,
    totalSteps: 6,
    nome: "",
    jogador: "",
    origemId: "Inato",
    origemPersonalizada: { nome: '', caracteristicas: [] },
    clanId: "",
    metodo: "fixos",
    valores: { forca: 15, destreza: 14, constituicao: 13, inteligencia: 12, sabedoria: 10, presenca: 8 },
    pontos: 17, // para compra
    rolados: [10, 10, 10, 10, 10, 10],
    roladosEscolhidos: { forca: -1, destreza: -1, constituicao: -1, inteligencia: -1, sabedoria: -1, presenca: -1 },
    valoresFixosEscolhidos: { forca: 15, destreza: 14, constituicao: 13, inteligencia: 12, sabedoria: 10, presenca: 8 },
    especializacaoId: "",
  };

  // Pré-selecionar especialização padrão baseada em origem
  function especializacoesValidas(origem) {
    if (origem === "Restringido") return ESPECIALIZACOES.filter(e => e.id === "Restringido");
    if (origem === "Sem Técnica") return ESPECIALIZACOES.filter(e => e.id !== "Especialista em Técnica");
    return ESPECIALIZACOES.filter(e => e.id !== "Restringido");
  }

  function render() {
    app.innerHTML = `
      <div class="app-main">
        <div class="wizard">
          <div class="wizard__step">Passo ${state.step} de ${state.totalSteps}</div>
          <h2 class="wizard__title">${tituloStep(state.step)}</h2>
          <div id="wiz-body"></div>
          <div class="wizard__nav">
            <button class="btn btn--ghost" id="wiz-prev" ${state.step === 1 ? "disabled" : ""}>
              <span class="btn__icon" aria-hidden="true">←</span><span>Voltar</span>
            </button>
            <div class="row">
              <a href="#/characters" class="btn btn--ghost">
                <span class="btn__icon" aria-hidden="true">✕</span><span>Cancelar</span>
              </a>
              <button class="btn btn--primary" id="wiz-next">
                <span>${state.step === state.totalSteps ? "Criar ficha" : "Próximo"}</span>
                <span class="btn__icon" aria-hidden="true">${state.step === state.totalSteps ? "✓" : "→"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    renderStepBody();
    document.getElementById("wiz-prev").onclick = prev;
    document.getElementById("wiz-next").onclick = next;
  }

  function tituloStep(s) {
    return [
      "Identificação",
      "Origem",
      "Atributos",
      "Especialização",
      "Clã (opcional)",
      "Confirmar",
    ][s - 1];
  }

  function renderStepBody() {
    const body = document.getElementById("wiz-body");
    body.innerHTML = "";
    if (state.step === 1) return body.appendChild(step1());
    if (state.step === 2) return body.appendChild(step2());
    if (state.step === 3) return body.appendChild(step3());
    if (state.step === 4) return body.appendChild(step4());
    if (state.step === 5) return body.appendChild(step5());
    if (state.step === 6) return body.appendChild(step6());
  }

  function step1() {
    const wrap = document.createElement("div");
    wrap.className = "col";
    wrap.innerHTML = `
      <div class="field">
        <label class="field__label">Nome do personagem *</label>
        <input class="input" id="wiz-nome" type="text" placeholder="Ex: Kento Nanami" value="${state.nome}">
      </div>
      <div class="field">
        <label class="field__label">Seu nome (jogador)</label>
        <input class="input" id="wiz-jogador" type="text" placeholder="Seu nome" value="${state.jogador}">
      </div>
    `;
    setTimeout(() => {
      const n = document.getElementById("wiz-nome");
      const j = document.getElementById("wiz-jogador");
      n.oninput = () => { state.nome = n.value; };
      j.oninput = () => { state.jogador = j.value; };
      n.focus();
    }, 0);
    return wrap;
  }

  function step2() {
    const wrap = document.createElement("div");
    wrap.className = "col";
    wrap.innerHTML = `
      <p class="text-soft">Escolha a origem do seu poder. Cada uma define como você acessa a energia amaldiçoada.</p>
      <div class="grid grid-2" id="wiz-origens"></div>
    `;
    const grid = wrap.querySelector("#wiz-origens");
    ORIGENS.forEach(o => {
      const card = document.createElement("div");
      card.className = "card card--hover";
      if (state.origemId === o.id) card.style.borderColor = "var(--purple)";
      card.innerHTML = `
        <div class="row" style="margin-bottom: var(--gap-2);">
          <strong style="color: ${o.cor};">${o.nome}</strong>
        </div>
        <p class="text-soft text-sm">${o.descricao}</p>
        <ul class="text-xs text-soft" style="margin-top: var(--gap-2); padding-left: var(--gap-4);">
          ${o.caracteristicas.map(c => `<li>${c}</li>`).join("")}
        </ul>
      `;
      card.onclick = () => {
        state.origemId = o.id;
        // Reset especialização se for incompatível
        const validas = especializacoesValidas(state.origemId).map(e => e.id);
        if (!validas.includes(state.especializacaoId)) state.especializacaoId = "";
        renderStepBody();
      };
      grid.appendChild(card);
    });
    if(state.origemId===CUSTOM_ORIGIN)wrap.append(customOriginForm(state.origemPersonalizada));
    return wrap;
  }

  function step3() {
    const wrap = document.createElement("div");
    wrap.className = "col";
    wrap.innerHTML = `
      <p class="text-soft">Escolha o método de distribuição de atributos.</p>
      <div class="pill-group" id="wiz-metodos" style="margin-bottom: var(--gap-4);">
        ${METODOS_ATRIBUTO.map(m => `
          <button class="pill" data-metodo="${m.id}" aria-pressed="${state.metodo === m.id}">${m.nome}</button>
        `).join("")}
      </div>
      <p class="text-xs text-soft" id="wiz-metodo-desc">${METODOS_ATRIBUTO.find(m => m.id === state.metodo).desc}</p>
      <div id="wiz-atr-body"></div>
    `;
    wrap.querySelectorAll("[data-metodo]").forEach(btn => {
      btn.onclick = () => {
        state.metodo = btn.dataset.metodo;
        // Reset valores
        if (state.metodo === "fixos") {
          state.valores = { forca: 15, destreza: 14, constituicao: 13, inteligencia: 12, sabedoria: 10, presenca: 8 };
          state.valoresFixosEscolhidos = { forca: 15, destreza: 14, constituicao: 13, inteligencia: 12, sabedoria: 10, presenca: 8 };
          state.pontos = 17;
          state.rolados = [10, 10, 10, 10, 10, 10];
          state.roladosEscolhidos = { forca: -1, destreza: -1, constituicao: -1, inteligencia: -1, sabedoria: -1, presenca: -1 };
        } else if (state.metodo === "compra") {
          state.valores = { forca: 10, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, presenca: 10 };
          state.pontos = 17;
        } else {
          state.rolados = rolar6();
          state.roladosEscolhidos = { forca: -1, destreza: -1, constituicao: -1, inteligencia: -1, sabedoria: -1, presenca: -1 };
          state.valores = { forca: 10, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, presenca: 10 };
        }
        renderStepBody();
      };
    });
    wrap.appendChild(renderAtributos());
    return wrap;
  }

  function renderAtributos() {
    const container = document.createElement("div");
    if (state.metodo === "fixos") {
      container.innerHTML = `
        <p class="text-soft text-sm">Distribua os valores 15, 14, 13, 12, 10 e 8 entre os atributos.</p>
        <p class="text-xs text-soft" id="wiz-restantes">Valores restantes: <span id="wiz-rest"></span></p>
        <div class="grid grid-3" id="wiz-atr"></div>
      `;
      const usados = [15, 14, 13, 12, 10, 8];
      const grid = container.querySelector("#wiz-atr");
      ATRIBUTOS.forEach(a => {
        const cell = document.createElement("div");
        cell.className = "attr-card";
        const valorAtual = state.valoresFixosEscolhidos[a.id];
        const ocupados = new Set(Object.entries(state.valoresFixosEscolhidos).filter(([id]) => id !== a.id).map(([,v]) => v));
        cell.innerHTML = `
          <div class="attr-card__label">${a.nome}</div>
          <select class="input input--center" data-atr="${a.id}">
            <option value="0" ${valorAtual ? "" : "selected"}>—</option>
            ${usados.filter(v => !ocupados.has(v)).map(v => `<option value="${v}" ${valorAtual === v ? "selected" : ""}>${v}</option>`).join("")}
          </select>
          <div class="attr-card__mod">${formatMod(Math.floor((state.valores[a.id] - 10) / 2))}</div>
        `;
        grid.appendChild(cell);
      });
      container.querySelectorAll("select[data-atr]").forEach(sel => {
        sel.onchange = () => {
          const value = Number(sel.value);
          state.valoresFixosEscolhidos[sel.dataset.atr] = value || 0;
          state.valores[sel.dataset.atr] = value || 10;
          // Recompute modais
          renderStepBody();
        };
      });
    } else if (state.metodo === "compra") {
      const custo = (v) => {
        if (v === 8) return -2;
        if (v === 9) return -1;
        if (v === 10) return 0;
        if (v === 11) return 2;
        if (v === 12) return 3;
        if (v === 13) return 4;
        if (v === 14) return 5;
        if (v === 15) return 7;
        return 99;
      };
      // PDF v2.5.2, p.18: custo relativo ao valor inicial 10.
      container.innerHTML = `
        <p class="text-soft text-sm">Cada atributo começa em 10. Você tem 17 pontos para distribuir (limite 15 por atributo).</p>
        <p class="text-xs text-accent" id="wiz-pontos">Pontos restantes: <span id="wiz-pontos-val">${state.pontos}</span></p>
        <div class="grid grid-3" id="wiz-atr"></div>
      `;
      const grid = container.querySelector("#wiz-atr");
      ATRIBUTOS.forEach(a => {
        const cell = document.createElement("div");
        cell.className = "attr-card";
        cell.innerHTML = `
          <div class="attr-card__label">${a.nome}</div>
          <div class="row">
            <button class="btn btn--subtle btn--sm btn--icon" data-dec="${a.id}">−</button>
            <input class="input input--num" type="number" min="8" max="15" value="${state.valores[a.id]}" data-atr="${a.id}">
            <button class="btn btn--subtle btn--sm btn--icon" data-inc="${a.id}">+</button>
          </div>
          <div class="attr-card__mod">${formatMod(Math.floor((state.valores[a.id] - 10) / 2))}</div>
        `;
        grid.appendChild(cell);
      });
      const recalc = () => {
        let gastos = 0;
        for (const a of ATRIBUTOS) {
          gastos += custo(state.valores[a.id]);
        }
        state.pontos = 17 - gastos;
        container.querySelector("#wiz-pontos-val").textContent = state.pontos;
        if (state.pontos < 0) container.querySelector("#wiz-pontos").style.color = "var(--danger)";
        else container.querySelector("#wiz-pontos").style.color = "var(--text-accent)";
        container.querySelectorAll("[data-inc]").forEach(btn => {
          const id = btn.dataset.inc;
          btn.disabled = state.valores[id] >= 15 || gastos + custo(state.valores[id] + 1) - custo(state.valores[id]) > 17;
        });
      };
      recalc();
      container.querySelectorAll("[data-inc]").forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.inc;
          const atual = custo(state.valores[id]);
          const proximo = custo(state.valores[id] + 1);
          const gastosAtuais = ATRIBUTOS.reduce((sum, a) => sum + custo(state.valores[a.id]), 0);
          if (state.valores[id] < 15 && gastosAtuais + proximo - atual <= 17) {
            state.valores[id]++;
            renderStepBody();
          }
        };
      });
      container.querySelectorAll("[data-dec]").forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.dec;
          if (state.valores[id] > 8) {
            state.valores[id]--;
            renderStepBody();
          }
        };
      });
      container.querySelectorAll("input[data-atr]").forEach(inp => {
        inp.onchange = () => {
          let v = Number(inp.value);
          v = Math.max(8, Math.min(15, v));
          const novosGastos = ATRIBUTOS.reduce((sum, a) => sum + custo(a.id === inp.dataset.atr ? v : state.valores[a.id]), 0);
          if (novosGastos > 17) { renderStepBody(); return; }
          state.valores[inp.dataset.atr] = v;
          renderStepBody();
        };
      });
    } else {
      // Rolagem
      container.innerHTML = `
        <p class="text-soft text-sm">Seus 6 valores rolados (4d6, descarta menor). Atribua cada um a um atributo.</p>
        <div class="row row--wrap" style="margin-bottom: var(--gap-3);">
          ${state.rolados.map((v, i) => `
            <div class="tag" style="padding: var(--gap-2) var(--gap-3); font-size: var(--fs-md);">
              <strong>${v}</strong>
            </div>
          `).join("")}
          <button class="btn btn--subtle btn--sm" id="wiz-rerolar">↻ Rerolar</button>
        </div>
        <div class="grid grid-3" id="wiz-atr"></div>
      `;
      const grid = container.querySelector("#wiz-atr");
      ATRIBUTOS.forEach(a => {
        const cell = document.createElement("div");
        cell.className = "attr-card";
        cell.innerHTML = `
          <div class="attr-card__label">${a.nome}</div>
          <select class="input input--center" data-atr="${a.id}">
            <option value="-1" ${state.roladosEscolhidos[a.id] < 0 ? "selected" : ""}>—</option>
            ${state.rolados.map((v, i) => {
              const usado = state.roladosEscolhidos[a.id] === i;
              const ocupado = Object.entries(state.roladosEscolhidos).some(([id, idx]) => id !== a.id && idx === i);
              return `<option value="${i}" ${usado ? "selected" : ""} ${ocupado ? "disabled" : ""}>${v}</option>`;
            }).join("")}
          </select>
          <div class="attr-card__mod">${state.valores[a.id] === 10 ? "—" : formatMod(Math.floor((state.valores[a.id] - 10) / 2))}</div>
        `;
        grid.appendChild(cell);
      });
      container.querySelectorAll("select[data-atr]").forEach(sel => {
        sel.onchange = () => {
          const index = Number(sel.value);
          state.roladosEscolhidos[sel.dataset.atr] = Number.isInteger(index) ? index : -1;
          state.valores[sel.dataset.atr] = index < 0 ? 10 : state.rolados[index];
          renderStepBody();
        };
      });
      container.querySelector("#wiz-rerolar").onclick = () => {
        state.rolados = rolar6();
        state.roladosEscolhidos = { forca: -1, destreza: -1, constituicao: -1, inteligencia: -1, sabedoria: -1, presenca: -1 };
        state.valores = { forca: 10, destreza: 10, constituicao: 10, inteligencia: 10, sabedoria: 10, presenca: 10 };
        renderStepBody();
      };
    }
    return container;
  }

  function step4() {
    const wrap = document.createElement("div");
    wrap.className = "col";
    wrap.innerHTML = `
      <p class="text-soft">Escolha sua especialização inicial. A especialização <em>Restringido</em> só está disponível para a origem Restringido.</p>
      <div class="grid grid-2" id="wiz-esp"></div>
    `;
    const validas = especializacoesValidas(state.origemId);
    const grid = wrap.querySelector("#wiz-esp");
    validas.forEach(e => {
      const card = document.createElement("div");
      card.className = "card card--hover";
      if (state.especializacaoId === e.id) card.style.borderColor = "var(--purple)";
      card.innerHTML = `
        <div class="row" style="margin-bottom: var(--gap-2);">
          <strong style="color: ${e.cor};">${e.nome}</strong>
          <span class="tag">PV ${e.pvInicialBase} | d${e.dadoVida} | ${e.pePorNivel} PE/nv</span>
        </div>
        <p class="text-soft text-sm">${e.descricao}</p>
        <p class="text-xs text-mute" style="margin-top: var(--gap-2);">Exemplos: ${e.exemplos.join(", ")}</p>
      `;
      card.onclick = () => {
        state.especializacaoId = e.id;
        renderStepBody();
      };
      grid.appendChild(card);
    });
    return wrap;
  }

  function step5() {
    const wrap = document.createElement("div");
    wrap.className = "col";
    if (state.origemId !== "Herdado") {
      wrap.innerHTML = `
        <p class="text-soft">Sua origem <strong>${state.origemId}</strong> não exige escolha de clã. Você pode prosseguir.</p>
        <p class="text-mute text-xs">Dica: ser narrativamente parte de um clã é sempre possível, mas só a origem Herdado concede bônus mecânicos.</p>
      `;
      return wrap;
    }
    wrap.innerHTML = `
      <p class="text-soft">Por ser Herdado, escolha seu clã. Ele define seus bônus e técnica inicial.</p>
      <div class="grid grid-2" id="wiz-clans"></div>
    `;
    const grid = wrap.querySelector("#wiz-clans");
    CLANS.forEach(c => {
      const card = document.createElement("div");
      card.className = "card card--hover";
      if (state.clanId === c.id) card.style.borderColor = "var(--purple)";
      card.innerHTML = `
        <div class="row" style="margin-bottom: var(--gap-2);">
          <strong style="color: ${c.cor};">${c.nome}</strong>
        </div>
        <p class="text-xs text-soft">Técnica: ${c.tecnicas}</p>
        <ul class="text-xs text-soft" style="margin-top: var(--gap-2); padding-left: var(--gap-4);">
          ${c.caracteristicas.map(cc => `<li>${cc}</li>`).join("")}
        </ul>
      `;
      card.onclick = () => {
        state.clanId = c.id;
        renderStepBody();
      };
      grid.appendChild(card);
    });
    return wrap;
  }

  function step6() {
    const wrap = document.createElement("div");
    wrap.className = "col";
    const mods = {};
    for (const a of ATRIBUTOS) mods[a.id] = Math.floor((state.valores[a.id] - 10) / 2);
    const fmtMod = (m) => m >= 0 ? `+${m}` : `${m}`;

    const origem = ORIGENS.find(o => o.id === state.origemId);
    const esp = ESPECIALIZACOES.find(e => e.id === state.especializacaoId);
    const clan = CLANS.find(c => c.id === state.clanId);

    wrap.innerHTML = `
      <p class="text-soft">Confira o resumo da sua ficha antes de criar.</p>
      <div class="card">
        <h3>${escapeHtml(state.nome) || "Sem nome"}</h3>
        <p class="text-soft text-sm">Jogador: ${escapeHtml(state.jogador) || "—"}</p>
        <hr>
        <div class="grid grid-2">
          <div>
            <h6>Origem</h6>
            <p>${state.origemId===CUSTOM_ORIGIN?`${escapeHtml(state.origemPersonalizada.nome)} — Homebrew`:origem.nome}${clan ? ` (${clan.nome})` : ""}</p>
            <h6 style="margin-top:var(--gap-3)">Especialização</h6>
            <p>${esp ? esp.nome : "—"}</p>
          </div>
          <div>
            <h6>Atributos</h6>
            <div class="grid grid-3" style="gap: var(--gap-2);">
              ${ATRIBUTOS.map(a => `
                <div class="row" style="font-size: var(--fs-sm);">
                  <span class="text-soft">${a.nome.slice(0, 3).toUpperCase()}</span>
                  <span class="text-mono">${state.valores[a.id]}</span>
                  <span class="text-accent text-mono">${fmtMod(mods[a.id])}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
      <p class="text-mute text-xs">Você poderá editar tudo isto depois.</p>
    `;
    return wrap;
  }

  function prev() {
    if (state.step > 1) {
      state.step--;
      render();
    }
  }

  function next() {
    // Validações
    if(state.step===2&&state.origemId===CUSTOM_ORIGIN&&!state.origemPersonalizada.nome.trim()){
      toast('Dê um nome à origem personalizada', 'error');return;
    }
    if (state.step === 1 && !state.nome.trim()) {
      toast("Dê um nome ao personagem", "error");
      return;
    }
    if (state.step === 3) {
      // Verificar valores preenchidos
      for (const a of ATRIBUTOS) {
        if (state.metodo === "rolagem" && state.valores[a.id] === 10) continue;
        if (state.valores[a.id] < 8) state.valores[a.id] = 8;
        if (state.valores[a.id] > 15 && state.metodo !== "rolagem") state.valores[a.id] = 15;
      }
      const fixosEscolhidos = Object.values(state.valoresFixosEscolhidos).filter(Boolean);
      if (state.metodo === "fixos" && (fixosEscolhidos.length !== 6 || new Set(fixosEscolhidos).size !== 6)) {
        toast("Distribua cada um dos seis valores fixos uma única vez", "error"); return;
      }
      if (state.metodo === "compra" && state.pontos < 0) {
        toast("A compra por pontos não pode ultrapassar os 17 pontos disponíveis", "error"); return;
      }
    }
    if (state.step === 4 && !state.especializacaoId) {
      toast("Escolha uma especialização", "error");
      return;
    }
    if (state.step === 5 && state.origemId === "Herdado" && !state.clanId) {
      toast("Escolha um clã", "error");
      return;
    }
    if (state.step === state.totalSteps) {
      criar();
      return;
    }
    state.step++;
    render();
  }

  async function criar() {
    const char = createEmpty();
    char.identificacao.nome = state.nome;
    char.identificacao.jogador = state.jogador;
    char.identificacao.origem = state.origemId;
    if(state.origemId===CUSTOM_ORIGIN){
      char.origemPersonalizada=structuredClone(state.origemPersonalizada);
      char.origemDetalhes={caracteristicas:[...state.origemPersonalizada.caracteristicas],personalizado:true};
    }
    char.identificacao.clan = state.clanId;
    char.identificacao.especializacao = state.especializacaoId;
    char.identificacao.especializacoes = [{ id: state.especializacaoId, nivel: 1 }];
    char.atributos = { ...state.valores };
    char.identificacao.grau = GRAU_POR_NIVEL(char.identificacao.nivel);

    // Aplica treinamentos de especialização (perícias + TR)
    const result = aplicarTreinamentosEsp(char, state.especializacaoId);

    // Se a esp exige escolha de TR (ex: Astúcia OU Vontade), perguntar
    if (result.exigeEscolhaTR.length > 0) {
      const opcoes = result.exigeEscolhaTR.map(id => {
        const tr = TESTES_RESISTENCIA.find(t => t.id === id);
        return tr ? { id: tr.id, nome: tr.nome, atributo: tr.atributo } : { id, nome: id, atributo: "—" };
      });
      const escolhidos = await promptEscolherTR(opcoes, {
        titulo: `TR de ${char.identificacao.especializacao}`,
        mensagem: "Sua especialização permite escolher 1 Teste de Resistência:",
      });
      if (escolhidos.length > 0) {
        for (const trid of escolhidos) {
          if (!char.testesResistencia[trid]) char.testesResistencia[trid] = { treino: false, mestre: false, outros: 0 };
          char.testesResistencia[trid].treino = true;
        }
      }
    }

    // Recalcula PV/PE baseado nos atributos finais
    const recalc = recalcularPontos(char);
    if (recalc.mudou) {
      char.pontos.pvAtual = char.pontos.pvMax;
      char.pontos.peAtual = char.pontos.peMax;
      char.pontos.estaminaAtual = char.pontos.estaminaMax||0;
    }

    saveChar(char);
    toast("Ficha criada!", "success");
    requestAnimationFrame(() => {
      location.hash = "#/character/" + char.id;
    });
  }

  function rolar4d6() {
    const rolls = [];
    for (let i = 0; i < 4; i++) rolls.push(1 + Math.floor(Math.random() * 6));
    rolls.sort((a, b) => b - a);
    return rolls[0] + rolls[1] + rolls[2]; // descarta o menor
  }

  function rolar6() {
    const out = [];
    for (let i = 0; i < 6; i++) out.push(rolar4d6());
    return out.sort((a, b) => b - a);
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  render();
}

