// Tests: CommunityPoller + ClubAwarePollerManager
// Ejecutar: node --test src/utils/communityPolling.test.mjs

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  createCommunityPoller,
  createClubAwarePollerManager,
} from "./communityPolling.js";

// Tiempos cortos para test (<100ms total)
const FAST = 10;

// Espera controlada usando setImmediate/setTimeout en secuencia.
function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// createCommunityPoller — creación
// ---------------------------------------------------------------------------

describe("createCommunityPoller — creación", () => {
  it("lanza si onTick no es función", () => {
    assert.throws(() => createCommunityPoller({ onTick: "no" }), /onTick/);
    assert.throws(() => createCommunityPoller({}), /onTick/);
  });

  it("lanza si intervalMs <= 0", () => {
    assert.throws(
      () => createCommunityPoller({ onTick: () => {}, intervalMs: 0 }),
      /intervalMs/
    );
  });

  it("lanza si maxIntervalMs < intervalMs", () => {
    assert.throws(
      () => createCommunityPoller({ onTick: () => {}, intervalMs: 100, maxIntervalMs: 50 }),
      /maxIntervalMs/
    );
  });

  it("crea poller con métodos esperados", () => {
    const poller = createCommunityPoller({ onTick: () => {} });
    assert.equal(typeof poller.start, "function");
    assert.equal(typeof poller.stop, "function");
    assert.equal(typeof poller.destroy, "function");
    assert.equal(typeof poller.isRunning, "function");
    assert.equal(typeof poller.getTickCount, "function");
    assert.equal(typeof poller.getErrorCount, "function");
    assert.equal(typeof poller.getCurrentInterval, "function");
    assert.equal(typeof poller.isDestroyed, "function");
  });

  it("no está corriendo después de crear", () => {
    const poller = createCommunityPoller({ onTick: () => {} });
    assert.equal(poller.isRunning(), false);
    assert.equal(poller.isDestroyed(), false);
    assert.equal(poller.getTickCount(), 0);
  });
});

// ---------------------------------------------------------------------------
// start / stop / isRunning
// ---------------------------------------------------------------------------

describe("createCommunityPoller — start/stop", () => {
  it("start() hace isRunning() = true", () => {
    const poller = createCommunityPoller({ onTick: async () => {}, intervalMs: 60000 });
    poller.start();
    assert.equal(poller.isRunning(), true);
    poller.destroy();
  });

  it("stop() hace isRunning() = false", () => {
    const poller = createCommunityPoller({ onTick: async () => {}, intervalMs: 60000 });
    poller.start();
    poller.stop();
    assert.equal(poller.isRunning(), false);
  });

  it("start() es idempotente — no crea timers duplicados", async () => {
    let tickCount = 0;
    const poller = createCommunityPoller({
      onTick: async () => { tickCount++; },
      intervalMs: FAST,
    });
    poller.start();
    poller.start(); // segunda llamada — no debe crear segundo timer
    poller.start(); // tercera llamada
    poller.stop();
    // Dar tiempo a un tick si hubiera escapado
    await wait(FAST * 3);
    assert.ok(tickCount <= 1, `Solo debería ejecutarse 0 o 1 ticks, ejecutados: ${tickCount}`);
  });

  it("ejecuta ticks con el intervalo esperado", async () => {
    let ticks = 0;
    const poller = createCommunityPoller({
      onTick: async () => { ticks++; },
      intervalMs: FAST,
    });
    poller.start();
    await wait(FAST * 3.5);
    poller.destroy();
    // Con intervalMs=FAST y 3.5 ciclos, deberían haberse ejecutado 2-4 ticks
    assert.ok(ticks >= 2 && ticks <= 5, `Ticks inesperados: ${ticks}`);
  });
});

// ---------------------------------------------------------------------------
// backoff en errores
// ---------------------------------------------------------------------------

describe("createCommunityPoller — backoff", () => {
  it("el intervalo aumenta con backoffFactor en errores consecutivos", async () => {
    const errors = [];
    const poller = createCommunityPoller({
      onTick: async () => { throw new Error("fallo simulado"); },
      intervalMs: FAST,
      maxIntervalMs: FAST * 100,
      backoffFactor: 3,
      onError: (err, count) => errors.push(count),
    });

    poller.start();
    await wait(FAST * 1.5); // tiempo para 1 tick
    poller.stop();

    // El intervalo debe haberse multiplicado por backoffFactor tras el error
    assert.ok(
      poller.getCurrentInterval() >= FAST * 3,
      `Intervalo esperado >= ${FAST * 3}, actual: ${poller.getCurrentInterval()}`
    );
    assert.ok(errors.length >= 1);
  });

  it("el intervalo se resetea al volver a éxito", async () => {
    let callCount = 0;
    const poller = createCommunityPoller({
      onTick: async () => {
        callCount++;
        if (callCount === 1) throw new Error("primer error");
        // Segundo tick: éxito
      },
      intervalMs: FAST,
      maxIntervalMs: FAST * 100,
      backoffFactor: 2,
    });

    poller.start();
    await wait(FAST * 5); // tiempo para al menos 2 ticks
    poller.destroy();

    // Después de recuperarse, el intervalo debe volver al base
    assert.equal(poller.getCurrentInterval(), FAST);
  });

  it("el backoff no supera maxIntervalMs", async () => {
    const poller = createCommunityPoller({
      onTick: async () => { throw new Error("siempre falla"); },
      intervalMs: FAST,
      maxIntervalMs: FAST * 4,
      backoffFactor: 10,
    });
    poller.start();
    await wait(FAST * 2);
    poller.stop();

    assert.ok(
      poller.getCurrentInterval() <= FAST * 4,
      `Intervalo excede maxIntervalMs: ${poller.getCurrentInterval()}`
    );
  });
});

// ---------------------------------------------------------------------------
// destroy
// ---------------------------------------------------------------------------

describe("createCommunityPoller — destroy", () => {
  it("destroy() marca el poller como destruido", () => {
    const poller = createCommunityPoller({ onTick: async () => {} });
    poller.start();
    poller.destroy();
    assert.equal(poller.isDestroyed(), true);
    assert.equal(poller.isRunning(), false);
  });

  it("start() después de destroy() lanza", () => {
    const poller = createCommunityPoller({ onTick: async () => {} });
    poller.destroy();
    assert.throws(() => poller.start(), /destruido/);
  });

  it("ticks no se ejecutan después de destroy()", async () => {
    let ticks = 0;
    const poller = createCommunityPoller({
      onTick: async () => { ticks++; },
      intervalMs: FAST,
    });
    poller.start();
    poller.destroy();
    await wait(FAST * 3);
    assert.equal(ticks, 0);
  });
});

// ---------------------------------------------------------------------------
// onError callback
// ---------------------------------------------------------------------------

describe("createCommunityPoller — onError", () => {
  it("llama a onError con el error y el número de errores", async () => {
    const captured = [];
    const poller = createCommunityPoller({
      onTick: async () => { throw new Error("error-test"); },
      intervalMs: FAST,
      onError: (err, count) => captured.push({ msg: err.message, count }),
    });
    poller.start();
    await wait(FAST * 2);
    poller.destroy();
    assert.ok(captured.length >= 1);
    assert.equal(captured[0].msg, "error-test");
    assert.equal(captured[0].count, 1);
  });

  it("onError puede lanzar sin romper el poller", async () => {
    let ticks = 0;
    const poller = createCommunityPoller({
      onTick: async () => {
        ticks++;
        throw new Error("fallo");
      },
      intervalMs: FAST,
      maxIntervalMs: FAST * 100,
      backoffFactor: 1,
      onError: () => { throw new Error("error en onError"); },
    });
    poller.start();
    await wait(FAST * 2.5);
    poller.destroy();
    assert.ok(ticks >= 1);
  });
});

// ---------------------------------------------------------------------------
// createClubAwarePollerManager
// ---------------------------------------------------------------------------

describe("createClubAwarePollerManager", () => {
  it("lanza si onTick no es función", () => {
    assert.throws(() => createClubAwarePollerManager({}), /onTick/);
  });

  it("switchToClub inicia el poller para el club indicado", async () => {
    const calls = [];
    const mgr = createClubAwarePollerManager({
      onTick: (clubId) => calls.push(clubId),
      intervalMs: FAST,
    });
    mgr.switchToClub("club-a");
    assert.equal(mgr.getActiveClubId(), "club-a");
    assert.ok(mgr.getActivePoller().isRunning());
    await wait(FAST * 1.5);
    mgr.stop();
    assert.ok(calls.some((c) => c === "club-a"), "No se llamó onTick con club-a");
  });

  it("switchToClub destruye el poller anterior al cambiar de club", async () => {
    const mgr = createClubAwarePollerManager({
      onTick: async () => {},
      intervalMs: FAST,
    });
    mgr.switchToClub("club-a");
    const pollerA = mgr.getActivePoller();
    mgr.switchToClub("club-b");
    assert.equal(pollerA.isDestroyed(), true);
    assert.equal(mgr.getActiveClubId(), "club-b");
    mgr.stop();
  });

  it("switchToClub mismo club no crea un segundo poller", () => {
    const mgr = createClubAwarePollerManager({
      onTick: async () => {},
      intervalMs: FAST,
    });
    mgr.switchToClub("club-a");
    const poller1 = mgr.getActivePoller();
    mgr.switchToClub("club-a"); // mismo club
    const poller2 = mgr.getActivePoller();
    assert.equal(poller1, poller2);
    mgr.stop();
  });

  it("stop() destruye el poller activo", () => {
    const mgr = createClubAwarePollerManager({
      onTick: async () => {},
      intervalMs: FAST,
    });
    mgr.switchToClub("club-a");
    mgr.stop();
    assert.equal(mgr.getActiveClubId(), null);
    assert.equal(mgr.getActivePoller(), null);
  });
});
