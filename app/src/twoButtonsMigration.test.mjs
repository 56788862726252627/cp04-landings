import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Prompt 3 (Mejora 2.5, 2026-07-26): cp04-two-buttons-fix.js localizaba
// botones por texto visible en español (`includes('reservar pista')`,
// `=== 'pista 1'`, etc.) para forzarles texto blanco. Estos tests son la
// prueba de que esa lógica no ha vuelto a colarse: los botones se
// identifican por clases estáticas puestas en el JSX, no por su texto.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appJsxPath = path.join(__dirname, "App.jsx");
const cssPath = path.join(__dirname, "cp04-legibility-polish.css");
const appJsx = readFileSync(appJsxPath, "utf8");
const css = readFileSync(cssPath, "utf8");

test("cp04-two-buttons-fix.js, cp04-sidebar-fix.js y cp04-login-enter-white-final.js ya no existen", () => {
  assert.equal(existsSync(path.join(__dirname, "cp04-two-buttons-fix.js")), false);
  assert.equal(existsSync(path.join(__dirname, "cp04-sidebar-fix.js")), false);
  assert.equal(existsSync(path.join(__dirname, "cp04-login-enter-white-final.js")), false);
});

test("App.jsx no importa ninguno de los tres scripts eliminados", () => {
  assert.equal(appJsx.includes("cp04-two-buttons-fix"), false);
  assert.equal(appJsx.includes("cp04-sidebar-fix"), false);
  assert.equal(appJsx.includes("cp04-login-enter-white-final"), false);
});

test("los 4 botones reales llevan su clase estable puesta directamente en el JSX", () => {
  assert.match(appJsx, /className=["'{]*.*cp04-fix-dar-alta-btn/);
  assert.match(appJsx, /className=\{.*cp04-fix-pista-1-btn/);
  assert.match(appJsx, /className="cp04-fix-white-action-btn cp04-fix-reprogramar-reserva-btn"/);
  assert.match(appJsx, /className="cp04-fix-white-action-btn cp04-fix-consultar-reservas-btn"/);
});

test("el botón Pista 1 se identifica por id interno (c.id===1 / item.id===1), nunca por el texto 'Pista 1'", () => {
  const pista1Matches = [...appJsx.matchAll(/cp04-fix-pista-1-btn/g)];
  assert.ok(pista1Matches.length >= 2, "se esperaban al menos 2 apariciones (Reservas y ReprogramarReserva)");
  assert.match(appJsx, /c\.id===1\?"cp04-fix-white-action-btn cp04-fix-pista-1-btn"/);
  assert.match(appJsx, /item\.id === 1 \? "cp04-fix-white-action-btn cp04-fix-pista-1-btn"/);
});

test("el botón Entrar del login tiene su clase estable y color blanco fijado directamente (no depende del texto 'entrar')", () => {
  assert.match(appJsx, /className="cp04-menu-button cp04-login-entrar-white-btn"/);
  assert.match(appJsx, /color:"#ffffff",\s*fontWeight:900\s*\}\}>\s*\{ltx\("login\.entrar"\)\}/);
});

test("no queda ningún matching de texto visible (innerText/textContent/includes sobre etiquetas) en App.jsx relacionado con estos botones", () => {
  // Nota: "reservar pista" aparece como subcadena inocente dentro de
  // "reservar pistas" en un párrafo de marketing (línea ~8120) — no es
  // matching de botones, así que se comprueba el patrón `.includes(...)`
  // explícito, no la subcadena suelta.
  assert.equal(/\.includes\(\s*['"]reservar pista['"]\s*\)/i.test(appJsx), false);
  assert.equal(/\.includes\(\s*['"]ir a reservas['"]\s*\)/i.test(appJsx), false);
  assert.equal(/\.includes\(\s*['"]dar de alta['"]\s*\)/i.test(appJsx), false);
  assert.equal(/\.includes\(\s*['"]reprogramar reserva['"]\s*\)/i.test(appJsx), false);
  assert.equal(/\.includes\(\s*['"]consultar reservas['"]\s*\)/i.test(appJsx), false);
  assert.equal(/===\s*['"]pista 1['"]/i.test(appJsx), false);
});

test("cp04-legibility-polish.css: las clases muertas (reservar-pista, ir-reservas, login-entrar-definitivo, login-enter-white-final) ya no tienen reglas propias", () => {
  assert.equal(/button\.cp04-fix-reservar-pista-btn\s*[,{]/.test(css), false);
  assert.equal(/button\.cp04-fix-ir-reservas-btn\s*[,{]/.test(css), false);
  assert.equal(/button\.cp04-login-entrar-definitivo\s*[,{:]/.test(css), false);
  assert.equal(/button\.cp04-login-enter-white-final\s*[,{]/.test(css), false);
});

test("cp04-legibility-polish.css: las 4 clases reales y el botón Entrar sí tienen reglas, incluida su variante :disabled", () => {
  for (const cls of ["cp04-fix-dar-alta-btn", "cp04-fix-pista-1-btn", "cp04-fix-reprogramar-reserva-btn", "cp04-fix-consultar-reservas-btn"]) {
    assert.match(css, new RegExp(`button\\.${cls}\\s*[,{]`));
    assert.match(css, new RegExp(`button\\.${cls}:disabled`));
  }
  assert.match(css, /button\.cp04-login-entrar-white-btn\s*[,{]/);
});
