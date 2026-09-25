// Regresión: garantiza que el contador de 50 flujos Make llegó realmente a
// App.jsx (PLAYER/STAFF/ADMIN comparten el Home; SUPPORT además ve Centro
// Técnico) y que no queda ninguna referencia obsoleta visible al viejo
// recuento de 38/43 o "43 flujos/procesos". Lee el código fuente real de
// App.jsx (no un mock) para que un futuro hardcodeo accidental rompa el test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { computeMasterCounters } from "./makeMasterRegistry.js";

const appJsxPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "App.jsx");
const appSource = readFileSync(appJsxPath, "utf-8");

test("App.jsx: no contiene ninguna referencia visible a 38/43 o 43 flujos/procesos", () => {
  assert.doesNotMatch(appSource, /38\/43/);
  assert.doesNotMatch(appSource, /38 de 43/);
  assert.doesNotMatch(appSource, /\b43\s*flujos\b/i);
  assert.doesNotMatch(appSource, /\/43\b/);
  assert.doesNotMatch(appSource, /43\s+process/i);
  assert.doesNotMatch(appSource, /43\s+procesos/i);
});

test("App.jsx: importa el registro maestro y deriva MAKE_FLUJOS_COUNTERS (no hardcodea el total)", () => {
  assert.match(appSource, /from ["']\.\/data\/makeMasterRegistry\.js["']/);
  assert.match(appSource, /computeMasterCounters\(\)/);
});

test("App.jsx: el Home compartido (Inicio) y el panel Admin usan MAKE_FLUJOS_COUNTERS, no un número hardcodeado", () => {
  const homeMatches = appSource.match(/MAKE_FLUJOS_COUNTERS\.conectados}\/\$\{MAKE_FLUJOS_COUNTERS\.total/g) || [];
  assert.equal(homeMatches.length, 2, "se esperaban 2 usos: Home compartido (todos los roles) + panel Admin");
});

test("computeMasterCounters().total es 50 — lo que ven realmente PLAYER, STAFF, ADMIN y SUPPORT en el Home compartido", () => {
  assert.equal(computeMasterCounters().total, 50);
});
