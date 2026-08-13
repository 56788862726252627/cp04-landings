import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Prompt 6 (Mejora 2.8, 2026-07-26): auditoría de primera visita,
// onboarding y estados vacíos. Verificación por inspección de fuente de
// los comportamientos confirmados con Chromium durante la auditoría
// (aislamiento de flag por rol, foco atrapado + Escape, sin
// selectores de texto/posición para identificar los controles del
// tutorial).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tutorialJsx = readFileSync(path.join(__dirname, "components", "CP04GuidedTutorial.jsx"), "utf8");

test("la clave de 'tutorial visto' está namespaced por rol (sin plantilla, dos roles compartirían el mismo flag)", () => {
  assert.match(tutorialJsx, /storageKey\s*=\s*\(role\)\s*=>\s*`cp04_tutorial_seen_\$\{role\}`/);
});

test("solo 'Finalizar tutorial' (último paso) y 'No volver a mostrar el tutorial' persisten el flag de visto; 'Saltar' y Escape solo cierran sin persistir (comportamiento ya confirmado como el especificado: Saltar cierra, Finalizar guarda)", () => {
  // close(true) persiste; close(false) no. "Saltar" y Escape deben usar
  // close(false); el botón "No mostrar más" y el flujo isLast deben
  // usar close(true).
  assert.match(tutorialJsx, /onClick=\{\(\) => close\(false\)\}[\s\S]{0,60}style=\{btnGhostSkip\}/);
  assert.match(tutorialJsx, /onClick=\{\(\) => close\(true\)\}[\s\S]{0,60}style=\{btnGhostDismiss\}/);
  assert.match(tutorialJsx, /if \(isLast\) close\(true\); else setStep/);
});

test("el tutorial atrapa el foco dentro del diálogo y cierra con Escape (sin esto, Tab escaparía hacia elementos ocultos detrás del overlay)", () => {
  assert.match(tutorialJsx, /e\.key === "Escape"/);
  assert.match(tutorialJsx, /if \(e\.shiftKey && document\.activeElement === firstEl\)/);
  assert.match(tutorialJsx, /else if \(!e\.shiftKey && document\.activeElement === lastEl\)/);
});

test("el tutorial no usa textContent/innerText ni selectores de posición para identificar sus propios botones (identifica el target de cada paso por selector CSS de datos, no por texto)", () => {
  assert.equal(/document\.activeElement\.textContent/.test(tutorialJsx), false);
  assert.equal(tutorialJsx.includes("nth-of-type"), false);
  assert.equal(tutorialJsx.includes("nth-child"), false);
});

test("el tutorial no depende del idioma para decidir si mostrarse: la condición de 'primera vez' es solo localStorage, no texto visible ni idioma activo", () => {
  const autoShowEffect = tutorialJsx.match(/Auto-show primera vez por rol[\s\S]{0,400}/)?.[0] || "";
  assert.ok(autoShowEffect, "debe existir el efecto de auto-mostrar en la primera visita");
  assert.equal(/cp04_language/.test(autoShowEffect), false);
  assert.match(autoShowEffect, /localStorage\.getItem\(storageKey\(selectedRole\)\)/);
});
