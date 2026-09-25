import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04ContrastRatio, cp04MeetsAA } from "./contrastCheck.js";
import { T } from "../theme.js";

// Prompt 4 (Mejora 2.6, 2026-07-26): estos pares de color son los que
// realmente usa la app en los botones de login/PWA auditados. Fijar aquí
// el contraste esperado es lo que habría detectado el bug real antes de
// que un usuario lo viera (texto casi invisible en varios botones del
// login, confirmado con Chromium: ratio ~1:1 en algunos casos).

test("cp04ContrastRatio: blanco sobre negro y negro sobre blanco dan el máximo (21:1)", () => {
  assert.equal(Math.round(cp04ContrastRatio("#ffffff", "#000000") * 100) / 100, 21);
});

test("cp04ContrastRatio: mismo color da 1:1 (el mínimo posible, ilegible)", () => {
  assert.equal(cp04ContrastRatio("#ff5e3a", "#ff5e3a"), 1);
});

test("aviso 'sin conexión' (T.danger + #2a0700): cumple AA con holgura", () => {
  const ratio = cp04ContrastRatio("#2a0700", T.danger);
  assert.ok(ratio >= 4.5, `ratio real: ${ratio}`);
  assert.ok(cp04MeetsAA(ratio, { isLargeText: false }));
});

test("aviso 'nueva versión disponible' (T.accent + #06100a): cumple AA con holgura", () => {
  const ratio = cp04ContrastRatio("#06100a", T.accent);
  assert.ok(ratio >= 4.5, `ratio real: ${ratio}`);
});

test("botón Entrar / Crear cuenta / Enviar instrucciones sobre fondo real oscuro del rol-screen: blanco cumple AA", () => {
  // Fondo real medido con Chromium tras el fix (Prompt 4): rgb(5,9,24)
  // aprox., la mezcla de rgba(8,13,25,.24) sobre el navy base — se usa
  // el navy base directamente como cota inferior conservadora.
  const ratio = cp04ContrastRatio("#ffffff", "#05080d");
  assert.ok(ratio >= 4.5, `ratio real: ${ratio}`);
});

test("regresión conocida: el bug real (#071000 sobre fondo oscuro ~#05080d) NO cumplía AA — así se veía antes del fix", () => {
  const ratio = cp04ContrastRatio("#071000", "#05080d");
  assert.ok(ratio < 4.5, `este par debía fallar (documenta el bug ya corregido), ratio real: ${ratio}`);
});
