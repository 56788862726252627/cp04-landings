import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Prompt 7 (Mejora 2.9, 2026-07-27): auditoría funcional de Torneos y
// Ranking. Dos hallazgos reales corregidos, confirmados con Chromium
// contra la app real en localhost:5175:
//
// 1) Los ids de nueva pareja (`handleAddPair`) y de cada snapshot del
//    historial (`pushHistory`) se generaban con `Date.now()` a secas.
//    Dos clics en el mismo milisegundo (doble pulsación real, o el mismo
//    evento disparado dos veces) producían el mismo id: parejas
//    duplicadas con una sola key de React, y `handleDeletePair` borrando
//    ambas a la vez en vez de una. `torneoUid()` añade un contador
//    incremental para garantizar unicidad aunque el reloj no avance.
// 2) `handleDeletePair` no avisaba si la pareja eliminada ya tenía
//    resultados registrados en el cuadro (bracket): el corte posterior
//    de esos partidos era silencioso. Ahora se detecta y se muestra un
//    aviso explícito.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appJsx = readFileSync(path.join(__dirname, "App.jsx"), "utf8");

// Aislar la sección de Torneos para no dar falsos positivos contra otros
// módulos que también usan Date.now() (p. ej. nombres de archivo de
// exportación, donde una colisión no tiene ningún efecto observable).
const torneoSection = appJsx.slice(appJsx.indexOf("const TORNEO_STORE ="), appJsx.indexOf("const RANKING_STYLE ="));

test("existe un generador de ids con contador incremental (torneoUid) para el módulo de Torneos", () => {
  assert.match(torneoSection, /function torneoUid\(prefix\)\s*\{/);
  assert.match(torneoSection, /torneoIdSeq\s*\+=\s*1/);
});

test("handleAddPair ya no genera el id de la nueva pareja con Date.now() a secas (colisionaba en doble pulsación)", () => {
  assert.equal(/id:\s*`p\$\{Date\.now\(\)\}`/.test(torneoSection), false);
  assert.match(torneoSection, /const np = \{ id: torneoUid\("p"\), player1: "", player2: "" \};/);
});

test("pushHistory ya no usa Date.now() a secas como id/key del snapshot de historial", () => {
  assert.equal(/id:\s*Date\.now\(\),\s*\n\s*ts: new Date/.test(torneoSection), false);
  assert.match(torneoSection, /id: torneoUid\("h"\),/);
});

test("torneoBuildEmptyPairs sigue diferenciando cada pareja por índice (no depende solo del reloj)", () => {
  // Este patrón ya era seguro (ts compartido + índice distinto por pareja)
  // y no se ha tocado: se confirma que sigue así tras el cambio de arriba.
  assert.match(torneoSection, /id: `p\$\{ts\}_\$\{i\}`/);
});

test("handleDeletePair detecta si la pareja eliminada ya tenía progreso en el cuadro y muestra un aviso explícito", () => {
  const handlerBlock = torneoSection.match(/const handleDeletePair = \(id\) => \{[\s\S]*?\n  \};/)?.[0] || "";
  assert.ok(handlerBlock, "debe existir el handler handleDeletePair");
  assert.match(handlerBlock, /affectsBracket/);
  assert.match(handlerBlock, /m\.winner \|\| m\.round > 1/);
  assert.match(handlerBlock, /showNotice\(`⚠️.*invalidado.*rondas posteriores/s);
});

test("el aviso de eliminación con progreso usa noticeErr=true (estilo de advertencia, no de éxito)", () => {
  const handlerBlock = torneoSection.match(/const handleDeletePair = \(id\) => \{[\s\S]*?\n  \};/)?.[0] || "";
  assert.match(handlerBlock, /showNotice\(`⚠️[^`]*`,\s*true\)/);
});

test("el módulo de Torneos no implementa Round Robin (solo eliminación directa con BYE) — confirma que no se ha inventado esa función", () => {
  assert.equal(/round.?robin/i.test(torneoSection), false);
});

test("el módulo Torneos ahora recibe selectedRole y lo usa para el permiso de acción tournaments:manage (hallazgo del Prompt 7, corregido en el Prompt 8 — ver rbacActionHardening.test.mjs)", () => {
  const torneosComponent = torneoSection.match(/function Torneos\(\{ selectedRole \}[\s\S]*/)?.[0] || "";
  assert.ok(torneosComponent, "Torneos debe declarar selectedRole como prop");
  assert.match(torneosComponent, /cp04Can\(selectedRole, "tournaments:manage"\)/);
});
