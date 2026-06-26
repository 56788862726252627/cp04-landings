/*
  CLUB PÁDEL 04 · Fix local módulo Torneos
  - Sin tocar reservas, auth, Airtable, Make ni APIs.
  - Gestiona parejas en localStorage.
  - Oculta histórico público.
  - Añade edición Jugador 1 / Jugador 2.
  - Respeta límite de parejas.
  - Permite torneo personalizado par entre 2 y 64 jugadores.
*/

(function () {
  const STORAGE_KEY = "cp04_tournament_pairs_state_v1";

  const defaultState = {
    players: 32,
    status: "En curso",
    pairs: []
  };

  const readState = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return saved && typeof saved === "object" ? { ...defaultState, ...saved } : { ...defaultState };
    } catch {
      return { ...defaultState };
    }
  };

  const saveState = (state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  let state = readState();

  const maxPairs = () => Math.max(1, Math.floor(Number(state.players || 2) / 2));

  const normalizePlayers = (value) => {
    let n = Number(value);
    if (!Number.isFinite(n)) n = 2;
    n = Math.floor(n);
    if (n < 2) n = 2;
    if (n > 64) n = 64;
    if (n % 2 !== 0) n -= 1;
    if (n < 2) n = 2;
    return n;
  };

  const ensurePairs = () => {
    const limit = maxPairs();
    if (!Array.isArray(state.pairs)) state.pairs = [];
    state.pairs = state.pairs.slice(0, limit);

    while (state.pairs.length < Math.min(limit, 8)) {
      const index = state.pairs.length + 1;
      state.pairs.push({
        id: "pair_" + Date.now() + "_" + index,
        player1: "Jugador " + index + "A",
        player2: "Jugador " + index + "B",
        points: Math.max(160, 1245 - (index - 1) * 35),
        pj: index <= 8 ? 6 : 0,
        wins: index <= 2 ? 6 : index <= 4 ? 5 : index <= 6 ? 4 : index <= 8 ? 3 : 0
      });
    }

    saveState(state);
  };

  const toast = (message) => {
    let el = document.querySelector(".cp04-tournament-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "cp04-tournament-toast";
      document.body.appendChild(el);
    }
    el.textContent = "✅ " + message;
    el.classList.add("is-visible");
    clearTimeout(window.__cp04TournamentToastTimer);
    window.__cp04TournamentToastTimer = setTimeout(() => {
      el.classList.remove("is-visible");
    }, 2200);
  };

  const textOf = (el) => (el?.textContent || "").trim();

  const findTournamentRoot = () => {
    const headings = [...document.querySelectorAll("h1,h2,h3,strong,div,section")];
    const title = headings.find((el) => textOf(el).includes("Torneos · Ranking"));
    return title?.closest("main,section,div") || document.body;
  };

  const hidePublicHistory = () => {
    const nodes = [...document.querySelectorAll("div,aside,section,article")];
    nodes.forEach((node) => {
      const t = textOf(node);
      if (
        t.includes("Acciones del torneo") ||
        t.includes("Modo demo local") ||
        t.includes("añadida localmente") ||
        t.includes("eliminada del bracket") ||
        t.includes("editada como")
      ) {
        const smallEnough = t.length < 1400;
        if (smallEnough) node.style.display = "none";
      }
    });
  };

  const updateSummaryTexts = () => {
    const root = findTournamentRoot();
    const persons = String(state.players);
    const pairs = String(maxPairs());
    const groups = String(Math.max(1, Math.ceil(maxPairs() / 4)));

    const all = [...root.querySelectorAll("*")];

    all.forEach((el) => {
      const t = textOf(el);

      if (t.includes("Torneo Club Pádel 04 ·")) {
        el.childNodes.forEach((n) => {
          if (n.nodeType === Node.TEXT_NODE && n.textContent.includes("Torneo Club Pádel 04")) {
            n.textContent = "🏆 Torneo Club Pádel 04 · " + persons + " jugadores";
          }
        });
      }

      if (t === "personas" || t === "parejas" || t === "grupos") {
        const prev = el.previousElementSibling;
        if (prev && textOf(prev).match(/^\d+$/)) {
          if (t === "personas") prev.textContent = persons;
          if (t === "parejas") prev.textContent = pairs;
          if (t === "grupos") prev.textContent = groups;
        }
      }
    });
  };

  const setFormat = (players) => {
    state.players = normalizePlayers(players);
    state.pairs = state.pairs.slice(0, maxPairs());
    ensurePairs();
    saveState(state);
    renderAll();
    toast("Torneo ajustado a " + state.players + " jugadores / " + maxPairs() + " parejas");
  };

  const createCustomControl = () => {
    if (document.querySelector(".cp04-custom-players-box")) return;

    const formatButtons = [...document.querySelectorAll("button")].filter((btn) =>
      textOf(btn).includes("jugadores /")
    );

    const container = formatButtons[0]?.parentElement;
    if (!container) return;

    const box = document.createElement("div");
    box.className = "cp04-custom-players-box";
    box.innerHTML = `
      <label>Nº jugadores personalizado</label>
      <div>
        <input class="cp04-custom-players-input" type="number" min="2" max="64" step="2" value="${state.players}" />
        <button class="cp04-custom-players-apply" type="button">Aplicar</button>
      </div>
      <small>Solo números pares entre 2 y 64.</small>
    `;

    container.after(box);

    box.querySelector(".cp04-custom-players-apply").addEventListener("click", () => {
      const input = box.querySelector(".cp04-custom-players-input");
      const raw = Number(input.value);
      const fixed = normalizePlayers(raw);

      if (raw !== fixed) {
        input.value = fixed;
        toast("Ajustado automáticamente a número par válido: " + fixed);
      }

      setFormat(fixed);
    });
  };

  const bindFormatButtons = () => {
    [...document.querySelectorAll("button")].forEach((btn) => {
      const t = textOf(btn);
      if (btn.dataset.cp04FormatBound === "1") return;

      if (t.includes("16 jugadores")) {
        btn.dataset.cp04FormatBound = "1";
        btn.addEventListener("click", () => setTimeout(() => setFormat(16), 0), true);
      }

      if (t.includes("32 jugadores")) {
        btn.dataset.cp04FormatBound = "1";
        btn.addEventListener("click", () => setTimeout(() => setFormat(32), 0), true);
      }

      if (t.includes("64 jugadores")) {
        btn.dataset.cp04FormatBound = "1";
        btn.addEventListener("click", () => setTimeout(() => setFormat(64), 0), true);
      }
    });
  };

  const pairLabel = (pair) => {
    const a = pair.player1 || "Jugador 1";
    const b = pair.player2 || "Jugador 2";
    return a + " / " + b;
  };

  const editPair = (id) => {
    const pair = state.pairs.find((p) => p.id === id);
    if (!pair) return;

    const p1 = prompt("Jugador 1:", pair.player1 || "");
    if (p1 === null) return;

    const p2 = prompt("Jugador 2:", pair.player2 || "");
    if (p2 === null) return;

    pair.player1 = String(p1 || "Jugador 1").trim();
    pair.player2 = String(p2 || "Jugador 2").trim();

    saveState(state);
    renderAll();
    toast("Pareja actualizada");
  };

  const deletePair = (id) => {
    const pair = state.pairs.find((p) => p.id === id);
    if (!pair) return;

    if (!confirm("¿Eliminar esta pareja?\n\n" + pairLabel(pair))) return;

    state.pairs = state.pairs.filter((p) => p.id !== id);
    saveState(state);
    renderAll();
    toast("Pareja eliminada");
  };

  const addPair = () => {
    ensurePairs();

    if (state.pairs.length >= maxPairs()) {
      toast("Límite alcanzado: este torneo ya tiene " + maxPairs() + " parejas.");
      return;
    }

    const index = state.pairs.length + 1;
    state.pairs.push({
      id: "pair_" + Date.now() + "_" + index,
      player1: "Jugador " + index + "A",
      player2: "Jugador " + index + "B",
      points: Math.max(160, 1245 - (index - 1) * 35),
      pj: 0,
      wins: 0
    });

    saveState(state);
    renderAll();
    toast("Pareja añadida");
  };

  const autoAssign = () => {
    const limit = maxPairs();
    state.pairs = [];

    for (let i = 1; i <= limit; i++) {
      state.pairs.push({
        id: "pair_auto_" + i,
        player1: "Jugador " + i + "A",
        player2: "Jugador " + i + "B",
        points: Math.max(160, 1245 - (i - 1) * 35),
        pj: i <= 8 ? 6 : 0,
        wins: i <= 2 ? 6 : i <= 4 ? 5 : i <= 6 ? 4 : i <= 8 ? 3 : 0
      });
    }

    saveState(state);
    renderAll();
    toast("Autoasignación completada");
  };

  const reorderPairs = () => {
    state.pairs = [...state.pairs].reverse();
    saveState(state);
    renderAll();
    toast("Cruces reordenados");
  };

  const saveBracket = () => {
    saveState(state);
    toast("Cuadro guardado en este dispositivo");
  };

  const publishTournament = () => {
    state.status = "Publicado / En curso";
    saveState(state);
    renderAll();
    toast("Torneo publicado en modo local");
  };

  const openExport = () => {
    const exportBtn = [...document.querySelectorAll("button")].find((btn) => textOf(btn) === "Exportar");
    if (exportBtn) {
      exportBtn.click();
      toast("Vista Exportar abierta");
    } else {
      toast("Exportación preparada");
    }
  };

  const renderPairManager = () => {
    ensurePairs();

    const bracketTitle = [...document.querySelectorAll("h2,h3,strong")].find((el) =>
      textOf(el).includes("Bracket interactivo")
    );

    const bracketCard = bracketTitle?.closest("section,article,div");
    if (!bracketCard) return;

    bracketCard.querySelector(".cp04-pair-manager")?.remove();

    const manager = document.createElement("div");
    manager.className = "cp04-pair-manager";
    manager.innerHTML = `
      <div class="cp04-pair-manager-head">
        <div>
          <strong>Gestión real de parejas</strong>
          <p>${state.players} jugadores / ${maxPairs()} parejas máximo</p>
        </div>
        <span>${state.pairs.length}/${maxPairs()} parejas</span>
      </div>
      <div class="cp04-pair-list"></div>
    `;

    const list = manager.querySelector(".cp04-pair-list");

    state.pairs.forEach((pair, index) => {
      const row = document.createElement("div");
      row.className = "cp04-pair-row";
      row.innerHTML = `
        <button type="button" class="cp04-pair-edit" data-id="${pair.id}" title="Editar pareja">
          <span>${index + 1}</span>
          <strong>${pairLabel(pair)}</strong>
          <small>Editar jugadores</small>
        </button>
        <button type="button" class="cp04-pair-delete" data-id="${pair.id}" title="Eliminar pareja">🗑️</button>
      `;
      list.appendChild(row);
    });

    bracketCard.appendChild(manager);

    manager.querySelectorAll(".cp04-pair-edit").forEach((btn) => {
      btn.addEventListener("click", () => editPair(btn.dataset.id));
    });

    manager.querySelectorAll(".cp04-pair-delete").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        deletePair(btn.dataset.id);
      });
    });
  };

  const renderFullRanking = () => {
    const existing = document.querySelector(".cp04-full-ranking-card");
    if (!existing) return;

    const title = existing.querySelector("h2,h3,strong") || existing;
    const tableWrap = existing.querySelector(".cp04-full-ranking-wrap") || existing;

    const rows = Array.from({ length: maxPairs() }, (_, i) => {
      const pair = state.pairs[i] || {
        player1: "Jugador " + (i + 1) + "A",
        player2: "Jugador " + (i + 1) + "B",
        points: Math.max(160, 1245 - i * 35),
        pj: 0,
        wins: 0
      };

      return `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${pairLabel(pair)}</strong></td>
          <td>${pair.points ?? Math.max(160, 1245 - i * 35)}</td>
          <td>${pair.pj ?? 0}</td>
          <td>${pair.wins ?? 0}</td>
          <td><span class="cp04-demo-pill">Demo</span></td>
        </tr>
      `;
    }).join("");

    existing.innerHTML = `
      <div class="cp04-full-ranking-head">
        <div>
          <h3>Ranking completo del torneo</h3>
          <p>Clasificación completa para ${state.players} jugadores / ${maxPairs()} parejas. Datos demo preparados para sustituirse después por Airtable/API.</p>
        </div>
        <span>${maxPairs()} parejas</span>
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
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  };

  const bindControls = () => {
    [...document.querySelectorAll("button")].forEach((btn) => {
      if (btn.dataset.cp04ControlBound === "1") return;

      const t = textOf(btn);

      const bind = (fn) => {
        btn.dataset.cp04ControlBound = "1";
        btn.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          fn();
        }, true);
      };

      if (t.includes("Añadir pareja")) bind(addPair);
      else if (t.includes("Reordenar cruces")) bind(reorderPairs);
      else if (t.includes("Autoasignar")) bind(autoAssign);
      else if (t.includes("Guardar cuadro")) bind(saveBracket);
      else if (t === "Publicar") bind(publishTournament);
      else if (t === "Exportar") bind(openExport);
      else if (t.includes("Ver ranking completo")) {
        bind(() => {
          setTimeout(() => {
            renderFullRanking();
            toast("Ranking completo actualizado");
          }, 80);
        });
      }
    });
  };

  const renderAll = () => {
    ensurePairs();
    hidePublicHistory();
    createCustomControl();
    bindFormatButtons();
    bindControls();
    updateSummaryTexts();
    renderPairManager();
    renderFullRanking();
  };

  const start = () => {
    renderAll();
    setInterval(renderAll, 1400);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
