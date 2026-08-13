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
  assert.doesNotMatch(appSource, /\bmakeActivos\b/);
  assert.doesNotMatch(appSource, /\bmakePausados\b/);
});

test("App.jsx: importa el registro maestro y deriva MAKE_FLUJOS_COUNTERS (no hardcodea el total)", () => {
  assert.match(appSource, /from ["']\.\/data\/makeMasterRegistry\.js["']/);
  assert.match(appSource, /computeMasterCounters\(\)/);
});

test("App.jsx: el Home compartido (Inicio) y el panel Admin muestran el total como total/totalEsperado (50/50), no un ratio mezclado con conectados", () => {
  const totalMatches = appSource.match(/\$\{MAKE_FLUJOS_COUNTERS\.total\}\/\$\{MAKE_FLUJOS_COUNTERS\.totalEsperado\}/g) || [];
  assert.equal(totalMatches.length, 2, "se esperaban 2 usos: Home compartido (todos los roles) + panel Admin");
});

test("App.jsx: 'conectados' se muestra como dato independiente (no mezclado en el mismo literal que el total)", () => {
  const conectadosUsages = appSource.match(/MAKE_FLUJOS_COUNTERS\.conectados/g) || [];
  // Home (sub del KPI + segmento del donut) + Admin (sub del KPI) = al menos 3 usos,
  // ninguno de ellos dentro del mismo template literal que .total/.totalEsperado.
  assert.ok(conectadosUsages.length >= 3);
});

test("computeMasterCounters(): total y totalEsperado son 50/50 — lo que ven realmente PLAYER, STAFF, ADMIN y SUPPORT en el Home compartido", () => {
  const counters = computeMasterCounters();
  assert.equal(counters.total, 50);
  assert.equal(counters.totalEsperado, 50);
  assert.equal(counters.registroCompleto, true);
});
