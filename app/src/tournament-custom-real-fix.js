(function () {
  const STORE_KEY = "cp04_tournament_custom_real_v1";
  const BYE_KEY = "cp04_tournament_random_bye_v1";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function textOf(el) {
    return (el?.innerText || el?.textContent || "").trim();
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveState(next) {
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  }

  function toast(message) {
    let el = $(".cp04-tournament-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "cp04-tournament-toast";
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.classList.add("is-visible");

    clearTimeout(window.__cp04TournamentToastTimer);
    window.__cp04TournamentToastTimer = setTimeout(() => {
      el.classList.remove("is-visible");
    }, 2400);
  }

  function getState() {
    const saved = loadState();

    let players = Number(saved.players || 32);
    let pairs = Number(saved.pairs || Math.floor(players / 2));

    if (!Number.isFinite(players) || players < 2) players = 32;
    if (!Number.isFinite(pairs) || pairs < 1) pairs = Math.floor(players / 2);

    players = Math.max(2, Math.min(64, Math.round(players)));
    pairs = Math.max(1, Math.min(32, Math.round(pairs)));

    let currentPairs = Array.isArray(saved.currentPairs) ? saved.currentPairs : [];

    if (!currentPairs.length) {
      currentPairs = Array.from({ length: pairs }, (_, i) => ({
        id: `pair-${i + 1}`,
        jugador1: `Jugador ${i + 1}A`,
        jugador2: `Jugador ${i + 1}B`,
        points: Math.max(0, 1245 - i * 35),
        pj: i < 8 ? 6 : 0,
        wins: i < 2 ? 6 : i < 4 ? 5 : i < 6 ? 4 : i < 8 ? 3 : 0,
      }));
    }

    currentPairs = currentPairs.slice(0, pairs);

    while (currentPairs.length < pairs) {
      const i = currentPairs.length;
      currentPairs.push({
        id: `pair-${i + 1}`,
        jugador1: `Jugador ${i + 1}A`,
        jugador2: `Jugador ${i + 1}B`,
        points: Math.max(0, 1245 - i * 35),
        pj: i < 8 ? 6 : 0,
        wins: i < 2 ? 6 : i < 4 ? 5 : i < 6 ? 4 : i < 8 ? 3 : 0,
      });
    }

    return {
      players,
      pairs,
      mode: saved.mode || "preset",
      currentPairs,
      status: saved.status || "En curso",
      byePairId: saved.byePairId || null,
      byePairName: saved.byePairName || null,
      byeAt: saved.byeAt || null,
    };
  }

  function setState(patch) {
    const current = getState();
    const next = { ...current, ...patch };
    saveState(next);
    setTimeout(renderAll, 40);
    return next;
  }

  function pairName(pair) {
    if (!pair) return "Pareja";
    const j1 = pair.jugador1 || "";
    const j2 = pair.jugador2 || "";
    if (j1 && j2) return `${j1} / ${j2}`;
    return j1 || j2 || "Pareja sin nombre";
  }

  function findTournamentRoot() {
    const title = $$("h1,h2,h3").find((el) => textOf(el).toLowerCase().includes("torneos"));
    return title?.closest("main,section,div") || document.body;
  }

  function findFormatButtons() {
    return $$("button").filter((btn) => {
      const t = textOf(btn).toLowerCase();
      return (
        t.includes("16 jugadores") ||
        t.includes("32 jugadores") ||
        t.includes("64 jugadores") ||
        t.includes("personalizado")
      );
    });
  }

  function ensureCustomOption() {
    const buttons = findFormatButtons();
    const hasCustom = buttons.some((b) => textOf(b).toLowerCase().includes("personalizado"));
    const lastPreset = buttons.find((b) => textOf(b).toLowerCase().includes("64 jugadores"));

    if (lastPreset && !hasCustom) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `${lastPreset.className || ""} cp04-custom-format-btn`;
      btn.textContent = "Personalizado";
      btn.addEventListener("click", () => {
        setState({ mode: "custom" });
        ensureCustomPanel(true);
        toast("Modo personalizado activado");
      });
      lastPreset.insertAdjacentElement("afterend", btn);
    }

    buttons.forEach((btn) => {
      const t = textOf(btn).toLowerCase();

      if (t.includes("16 jugadores")) {
        btn.addEventListener("click", () => setPreset(16), { once: false });
      }

      if (t.includes("32 jugadores")) {
        btn.addEventListener("click", () => setPreset(32), { once: false });
      }

      if (t.includes("64 jugadores")) {
        btn.addEventListener("click", () => setPreset(64), { once: false });
      }
    });
  }

  function setPreset(players) {
    const pairs = players / 2;
    const currentPairs = Array.from({ length: pairs }, (_, i) => ({
      id: `pair-${i + 1}`,
      jugador1: `Jugador ${i + 1}A`,
      jugador2: `Jugador ${i + 1}B`,
      points: Math.max(0, 1245 - i * 35),
      pj: i < 8 ? 6 : 0,
      wins: i < 2 ? 6 : i < 4 ? 5 : i < 6 ? 4 : i < 8 ? 3 : 0,
    }));

    setState({
      players,
      pairs,
      mode: "preset",
      currentPairs,
      byePairId: null,
      byePairName: null,
      byeAt: null,
    });

    toast(`Formato actualizado: ${players} jugadores / ${pairs} parejas`);
  }

  function ensureCustomPanel(open = false) {
    const root = findTournamentRoot();
    let panel = $(".cp04-custom-real-panel");

    if (!panel) {
      panel = document.createElement("section");
      panel.className = "cp04-custom-real-panel";
      panel.innerHTML = `
        <div class="cp04-custom-real-head">
          <div>
            <strong>Formato personalizado</strong>
            <p>Configura torneos por jugadores o por parejas. Permite parejas impares con pase directo por sorteo.</p>
          </div>
          <span class="cp04-custom-real-pill">2–64 jugadores / 1–32 parejas</span>
        </div>

        <div class="cp04-custom-real-grid">
          <label>
            Modo
            <select id="cp04-custom-mode">
              <option value="players">Por jugadores</option>
              <option value="pairs">Por parejas</option>
            </select>
          </label>

          <label>
            Número
            <input id="cp04-custom-number" type="number" min="1" max="64" step="1" value="32" />
          </label>

          <button type="button" id="cp04-custom-apply">Aplicar formato</button>
        </div>

        <small>
          Jugadores: solo números pares entre 2 y 64. Parejas: de 1 a 32, incluyendo número impar con pase directo aleatorio.
        </small>
      `;

      const anchor = findFormatButtons().at(-1);
      if (anchor?.parentElement) {
        anchor.parentElement.insertAdjacentElement("afterend", panel);
      } else {
        root.prepend(panel);
      }

      $("#cp04-custom-apply", panel).addEventListener("click", applyCustomFormat);
    }

    const state = getState();
    const modeInput = $("#cp04-custom-mode", panel);
    const numberInput = $("#cp04-custom-number", panel);

    if (modeInput) modeInput.value = state.mode === "pairs" ? "pairs" : "players";
    if (numberInput) numberInput.value = state.mode === "pairs" ? state.pairs : state.players;

    panel.style.display = open || state.mode === "custom" || state.mode === "pairs" ? "block" : "none";
  }

  function applyCustomFormat() {
    const panel = $(".cp04-custom-real-panel");
    const mode = $("#cp04-custom-mode", panel)?.value || "players";
    const raw = Number($("#cp04-custom-number", panel)?.value || 0);

    if (!Number.isFinite(raw)) {
      toast("Introduce un número válido.");
      return;
    }

    let players;
    let pairs;

    if (mode === "players") {
      players = Math.round(raw);

      if (players < 2) {
        toast("Mínimo permitido: 2 jugadores / 1 pareja.");
        return;
      }

      if (players > 64) {
        toast("Máximo permitido: 64 jugadores / 32 parejas.");
        return;
      }

      if (players % 2 !== 0) {
        toast("El número de jugadores debe ser par.");
        return;
      }

      pairs = players / 2;
    } else {
      pairs = Math.round(raw);

      if (pairs < 1) {
        toast("Mínimo permitido: 1 pareja.");
        return;
      }

      if (pairs > 32) {
        toast("Máximo permitido: 32 parejas.");
        return;
      }

      players = pairs * 2;
    }

    const currentPairs = Array.from({ length: pairs }, (_, i) => ({
      id: `pair-${i + 1}`,
      jugador1: `Jugador ${i + 1}A`,
      jugador2: `Jugador ${i + 1}B`,
      points: Math.max(0, 1245 - i * 35),
      pj: i < 8 ? 6 : 0,
      wins: i < 2 ? 6 : i < 4 ? 5 : i < 6 ? 4 : i < 8 ? 3 : 0,
    }));

    setState({
      players,
      pairs,
      mode: mode === "pairs" ? "pairs" : "custom",
      currentPairs,
      byePairId: null,
      byePairName: null,
      byeAt: null,
    });

    toast(`Formato personalizado aplicado: ${players} jugadores / ${pairs} parejas`);
  }

  function ensurePairManager() {
    const state = getState();
    let panel = $(".cp04-real-pair-manager");

    if (!panel) {
      panel = document.createElement("section");
      panel.className = "cp04-real-pair-manager";
      const bracket = $$("h2,h3,strong").find((el) => textOf(el).toLowerCase().includes("bracket interactivo"));
      const target = bracket?.closest("section,div") || findTournamentRoot();
      target.insertAdjacentElement("beforeend", panel);
    }

    panel.innerHTML = `
      <div class="cp04-real-pair-head">
        <div>
          <strong>Gestión real de parejas</strong>
          <p>${state.players} jugadores / ${state.pairs} parejas máximo</p>
          ${
            state.pairs % 2 !== 0
              ? `<p class="cp04-bye-info">Número impar de parejas: se sorteará un pase directo al iniciar cruces.</p>`
              : ``
          }
          ${
            state.byePairName
              ? `<p class="cp04-bye-info">Pase directo sorteado: <strong>${state.byePairName}</strong></p>`
              : ``
          }
        </div>
        <span>${state.currentPairs.length}/${state.pairs} parejas</span>
      </div>

      <div class="cp04-real-pair-grid">
        ${state.currentPairs
          .map(
            (pair, index) => `
              <div class="cp04-real-pair-card" data-pair-id="${pair.id}">
                <button type="button" class="cp04-real-pair-edit" data-pair-id="${pair.id}">
                  <strong>${index + 1}. ${pairName(pair)}</strong>
                  <small>Editar Jugador 1 y Jugador 2</small>
                </button>
                <button type="button" class="cp04-real-pair-delete" data-pair-id="${pair.id}" aria-label="Eliminar pareja">🗑️</button>
              </div>
            `
          )
          .join("")}
      </div>
    `;

    $$(".cp04-real-pair-edit", panel).forEach((btn) => {
      btn.addEventListener("click", () => editPair(btn.dataset.pairId));
    });

    $$(".cp04-real-pair-delete", panel).forEach((btn) => {
      btn.addEventListener("click", () => deletePair(btn.dataset.pairId));
    });
  }

  function editPair(pairId) {
    const state = getState();
    const pair = state.currentPairs.find((p) => p.id === pairId);
    if (!pair) return;

    const jugador1 = prompt("Jugador 1:", pair.jugador1 || "");
    if (jugador1 === null) return;

    const jugador2 = prompt("Jugador 2:", pair.jugador2 || "");
    if (jugador2 === null) return;

    const nextPairs = state.currentPairs.map((p) =>
      p.id === pairId
        ? {
            ...p,
            jugador1: jugador1.trim() || "Jugador 1",
            jugador2: jugador2.trim() || "Jugador 2",
          }
        : p
    );

    setState({ currentPairs: nextPairs });
    toast("Pareja actualizada");
  }

  function deletePair(pairId) {
    const state = getState();
    const pair = state.currentPairs.find((p) => p.id === pairId);
    if (!pair) return;

    if (!confirm(`¿Eliminar ${pairName(pair)}?`)) return;

    const nextPairs = state.currentPairs.filter((p) => p.id !== pairId);
    setState({
      currentPairs: nextPairs,
      pairs: Math.max(1, nextPairs.length),
      players: Math.max(2, nextPairs.length * 2),
      byePairId: state.byePairId === pairId ? null : state.byePairId,
      byePairName: state.byePairId === pairId ? null : state.byePairName,
      byeAt: state.byePairId === pairId ? null : state.byeAt,
    });

    toast("Pareja eliminada");
  }

  function addPair() {
    const state = getState();

    if (state.currentPairs.length >= 32 || state.currentPairs.length >= state.pairs) {
      toast(`Límite alcanzado: este torneo ya tiene ${state.pairs} parejas.`);
      return;
    }

    const n = state.currentPairs.length + 1;
    const nextPairs = [
      ...state.currentPairs,
      {
        id: `pair-${Date.now()}`,
        jugador1: `Jugador ${n}A`,
        jugador2: `Jugador ${n}B`,
        points: Math.max(0, 1245 - (n - 1) * 35),
        pj: 0,
        wins: 0,
      },
    ];

    setState({ currentPairs: nextPairs });
    toast("Pareja añadida");
  }

  function autoAssign() {
    const state = getState();
    const nextPairs = state.currentPairs.map((p, i) => ({
      ...p,
      jugador1: p.jugador1 || `Jugador ${i + 1}A`,
      jugador2: p.jugador2 || `Jugador ${i + 1}B`,
    }));

    setState({ currentPairs: nextPairs });
    toast("Autoasignación completada");
  }

  function reorderPairs() {
    const state = getState();
    let nextPairs = [...state.currentPairs];

    if (nextPairs.length % 2 !== 0) {
      const randomIndex = Math.floor(Math.random() * nextPairs.length);
      const byePair = nextPairs[randomIndex];

      localStorage.setItem(
        BYE_KEY,
        JSON.stringify({
          pairId: byePair.id,
          pairName: pairName(byePair),
          at: new Date().toISOString(),
          totalPairs: nextPairs.length,
        })
      );

      setState({
        currentPairs: nextPairs,
        byePairId: byePair.id,
        byePairName: pairName(byePair),
        byeAt: new Date().toISOString(),
      });

      toast(`Sorteo realizado: ${pairName(byePair)} pasa directamente a la siguiente ronda.`);
      return;
    }

    nextPairs = nextPairs
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    setState({ currentPairs: nextPairs });
    toast("Cruces reordenados");
  }

  function saveBracket() {
    saveState(getState());
    toast("Cuadro guardado en localStorage");
  }

  function publishTournament() {
    setState({ status: "Publicado" });
    toast("Torneo publicado / en curso preparado");
  }

  function openExport() {
    ensureExportView();
    $(".cp04-export-real-view")?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Vista Exportar abierta");
  }

  function ensureExportView() {
    let view = $(".cp04-export-real-view");
    if (!view) {
      view = document.createElement("section");
      view.className = "cp04-export-real-view";
      findTournamentRoot().appendChild(view);
    }

    const state = getState();

    view.innerHTML = `
      <h2>Exportación del torneo</h2>
      <p>Panel preparado para exportar calendario, ranking, bracket, participantes y resultados.</p>

      <div class="cp04-export-real-grid">
        <article><strong>CSV ranking</strong><span>${state.currentPairs.length} parejas listas</span></article>
        <article><strong>PDF calendario</strong><span>Preparado para publicación</span></article>
        <article><strong>PDF bracket</strong><span>Cuadro preparado</span></article>
        <article><strong>Airtable/API</strong><span>Estructura preparada</span></article>
        <article><strong>Make</strong><span>Disparadores futuros preparados</span></article>
        <article><strong>Stripe</strong><span>Inscripciones futuras preparadas</span></article>
      </div>
    `;
  }

  function openFullRanking() {
    ensureFullRankingView();
    $(".cp04-full-ranking-real-view")?.scrollIntoView({ behavior: "smooth", block: "start" });
    toast("Ranking completo abierto");
  }

  function ensureFullRankingView() {
    let view = $(".cp04-full-ranking-real-view");
    if (!view) {
      view = document.createElement("section");
      view.className = "cp04-full-ranking-real-view";
      const root = findTournamentRoot();
      root.appendChild(view);
    }

    const state = getState();

    view.innerHTML = `
      <div class="cp04-full-ranking-head">
        <div>
          <h2>Ranking completo del torneo</h2>
          <p>Clasificación completa para ${state.players} jugadores / ${state.currentPairs.length} parejas.</p>
        </div>
        <span>${state.currentPairs.length} parejas</span>
      </div>

      <div class="cp04-full-ranking-wrap">
        <table class="cp04-full-ranking-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Pareja</th>
              <th>Puntos</th>
              <th>PJ</th>
              <th>Victorias</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${state.currentPairs
              .map(
                (pair, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${pairName(pair)}</strong></td>
                    <td>${pair.points ?? Math.max(0, 1245 - index * 35)}</td>
                    <td>${pair.pj ?? 0}</td>
                    <td>${pair.wins ?? 0}</td>
                    <td>${state.byePairId === pair.id ? "Pase directo" : "Demo"}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function patchVisibleNumbers() {
    const state = getState();

    $$("button").forEach((btn) => {
      const t = textOf(btn).toLowerCase();
      if (t.includes("ver ranking completo")) {
        btn.textContent = `Ver ranking completo (${state.currentPairs.length})`;
      }
    });
  }

  function bindControls() {
    $$("button").forEach((btn) => {
      if (btn.dataset.cp04CustomRealBound === "1") return;

      const t = textOf(btn).toLowerCase();

      if (t.includes("añadir pareja")) {
        btn.dataset.cp04CustomRealBound = "1";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          addPair();
        }, true);
      }

      if (t.includes("reordenar cruces")) {
        btn.dataset.cp04CustomRealBound = "1";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          reorderPairs();
        }, true);
      }

      if (t.includes("autoasignar")) {
        btn.dataset.cp04CustomRealBound = "1";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          autoAssign();
        }, true);
      }

      if (t.includes("guardar cuadro")) {
        btn.dataset.cp04CustomRealBound = "1";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          saveBracket();
        }, true);
      }

      if (t.includes("publicar")) {
        btn.dataset.cp04CustomRealBound = "1";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          publishTournament();
        }, true);
      }

      if (t === "exportar" || t.includes("exportar")) {
        btn.dataset.cp04CustomRealBound = "1";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          openExport();
        }, true);
      }

      if (t.includes("ver ranking completo")) {
        btn.dataset.cp04CustomRealBound = "1";
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          openFullRanking();
        }, true);
      }
    });
  }

  function hidePublicLogs() {
    $$("h1,h2,h3,strong,div,section,aside").forEach((el) => {
      const t = textOf(el).toLowerCase();
      if (
        t.includes("acciones del torneo") ||
        t.includes("modo demo local") ||
        t.includes("añadida localmente") ||
        t.includes("eliminada del bracket") ||
        t.includes("editada como")
      ) {
        const card = el.closest("section,aside,article,div");
        if (card && !card.classList.contains("cp04-real-pair-manager")) {
          card.classList.add("cp04-hide-internal-log");
        }
      }
    });
  }

  function renderAll() {
    ensureCustomOption();
    ensureCustomPanel();
    ensurePairManager();
    ensureFullRankingView();
    patchVisibleNumbers();
    bindControls();
    hidePublicLogs();
  }

  document.addEventListener("DOMContentLoaded", renderAll);
  document.addEventListener("click", () => setTimeout(renderAll, 120), true);

  setInterval(renderAll, 1500);
  setTimeout(renderAll, 300);
})();
