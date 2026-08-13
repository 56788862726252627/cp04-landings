import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Prompt 5 (Mejora 2.7, 2026-07-26): cierre global de conflictos color/
// fondo. Hallazgo principal: el botón "Siguiente" del tutorial guiado
// usaba un selector CSS por POSICIÓN (`button:nth-of-type(2)`) para
// aplicar su fondo lima + texto oscuro. Como el botón "Atrás" solo se
// renderiza a partir del paso 2 (`{!isFirst && <button>...}`), en el
// paso 1 la posición 2 la ocupaba "Saltar" en su lugar: "Saltar" salía
// con el estilo de botón principal y "Siguiente" con el de secundario —
// invertido. Confirmado con Chromium en los 4 roles antes del fix.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssWithComments = readFileSync(path.join(__dirname, "cp04-legibility-polish.css"), "utf8");
// Los comentarios documentan a propósito el selector roto de antes
// (`button:nth-of-type(2)`, `[aria-label="Siguiente"]`) como explicación
// histórica — se quitan antes de comprobar que ya no queda NINGÚN
// selector real así, para no dar un falso positivo contra la propia
// documentación del fix.
const css = cssWithComments.replace(/\/\*[\s\S]*?\*\//g, "");
const tutorialJsx = readFileSync(path.join(__dirname, "components", "CP04GuidedTutorial.jsx"), "utf8");

test("el tutorial guiado usa aria-label real (no 'Siguiente' literal, que nunca existió) para el botón principal", () => {
  assert.match(tutorialJsx, /aria-label=\{isLast \? "Finalizar tutorial" : "Paso siguiente"\}/);
});

test("cp04-legibility-polish.css ya no usa button:nth-of-type(N) para identificar los botones del tutorial", () => {
  assert.equal(css.includes("nth-of-type"), false, "no debe quedar ningún selector posicional para botones");
});

test("el botón principal del tutorial se identifica por los dos aria-label reales (Paso siguiente / Finalizar tutorial)", () => {
  assert.match(css, /button\[aria-label="Paso siguiente"\]/);
  assert.match(css, /button\[aria-label="Finalizar tutorial"\]/);
});

test("el selector muerto [aria-label=\"Siguiente\"] (nunca coincidía con nada) ya no está en el CSS", () => {
  assert.equal(css.includes('[aria-label="Siguiente"]'), false);
});

test("el botón principal del tutorial fija color oscuro con especificidad mayor que la regla genérica de botones secundarios (.cp04-tour-btn)", () => {
  // Especificidad: `.cp04-tour-btn` = (0,1,0); `button[aria-label="..."]` =
  // (0,1,1) — el elemento `button` adicional hace que el principal gane
  // siempre, sin depender del orden de las reglas en el archivo.
  const primaryBlock = css.match(/button\[aria-label="Paso siguiente"\][\s\S]{0,20}button\[aria-label="Finalizar tutorial"\][\s\S]{0,300}/);
  assert.ok(primaryBlock, "debe existir el bloque de reglas del botón principal");
  assert.match(primaryBlock[0], /color: #071000 !important/);
});
