// Club Pádel 04 · Guardarraíl de la pasada de UX/responsive premium.
//
// Mismo criterio que publicUiPrivacy.test.mjs/App.tenantRuntimeIntegration.test.mjs
// (el repo no tiene jsdom/testing-library, así que App.jsx no se puede
// renderizar en un test): se lee el código fuente como texto para verificar
// que los componentes Notice/EmptyState introducidos en esta pasada están
// realmente conectados donde se pretendía, y que no queda ningún resto del
// texto muerto que se limpió (el ternario "Fuente: base de datos" cuyas dos
// ramas devolvían siempre el mismo valor).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const appJsxPath = path.join(here, "App.jsx");
const appJsxSource = readFileSync(appJsxPath, "utf8");

test("Notice() y EmptyState() existen como componentes compartidos junto a Card/Btn", () => {
  assert.match(appJsxSource, /function Notice\(\{ tone = "error", children \}\) \{/);
  assert.match(appJsxSource, /function EmptyState\(\{ icon = "🔍", title, description \}\) \{/);
});

test("los 4 mensajes de error de nivel de pantalla (login/registro/rol/recuperar contraseña) usan <Notice>, ninguno quedó con <div role=\"alert\"> suelto", () => {
  assert.match(appJsxSource, /<Notice tone="error">\{loginError\}<\/Notice>/);
  assert.match(appJsxSource, /<Notice tone="error">\{registerError\}<\/Notice>/);
  assert.match(appJsxSource, /<Notice tone="error">\{roleError\}<\/Notice>/);
  assert.match(appJsxSource, /<Notice tone="error">\{forgotPwdEmailError\}<\/Notice>/);

  // Regresión directa: ninguno de estos 4 debe volver al patrón antiguo de
  // <div role="alert" ...>{variable}</div> sin pasar por Notice.
  for (const varName of ["loginError", "registerError", "roleError", "forgotPwdEmailError"]) {
    const rawPattern = new RegExp(`<div role="alert"[^>]*>\\{${varName}\\}</div>`);
    assert.doesNotMatch(appJsxSource, rawPattern, `${varName} no debería volver a un <div role="alert"> suelto`);
  }
});

test("Gestion() usa <EmptyState> para \"No se encontraron reservas\", ya no un <strong>/<p> suelto", () => {
  const start = appJsxSource.indexOf("function Gestion() {");
  const end = appJsxSource.indexOf("function AltaJugador(", start);
  assert.ok(start !== -1 && end !== -1 && end > start, "No se pudo localizar Gestion() en App.jsx");
  const body = appJsxSource.slice(start, end);

  assert.match(body, /<EmptyState\s*\n?\s*icon="📋"\s*\n?\s*title="No se encontraron reservas"/);
  assert.match(body, /No hay registros que coincidan con los filtros seleccionados\./);
});

test("el texto muerto \"Fuente: base de datos\" (ternario con las dos ramas idénticas) ya no existe en App.jsx", () => {
  assert.doesNotMatch(appJsxSource, /fuenteReservas \? "base de datos" : "base de datos"/);
  assert.doesNotMatch(appJsxSource, /· Fuente:/);
  // El estado en sí (dead state, nunca influía en el render) se eliminó
  // por completo en vez de dejarlo declarado sin uso.
  assert.doesNotMatch(appJsxSource, /fuenteReservas/);
});

test("las clases CSS nuevas (cp04-notice, cp04-empty-state, hover de cp04-card) están declaradas en globalStyles", () => {
  const start = appJsxSource.indexOf("const globalStyles = `");
  const end = appJsxSource.indexOf("`;\n\n\nconst GALLERY_FORCE_STYLES", start);
  assert.ok(start !== -1 && end !== -1 && end > start, "No se pudo localizar el bloque globalStyles");
  const block = appJsxSource.slice(start, end);

  assert.match(block, /\.cp04-notice\s*\{/);
  assert.match(block, /\.cp04-notice-error\s*\{/);
  assert.match(block, /\.cp04-notice-success\s*\{/);
  assert.match(block, /\.cp04-empty-state\s*\{/);
  assert.match(block, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(block, /\.cp04-card:hover\s*\{/);

  // El hover de tarjeta debe respetar prefers-reduced-motion, igual que ya
  // hacía .cp04-btn:hover — no se introduce una animación que ignore esa
  // preferencia de accesibilidad ya establecida en el resto del archivo.
  const reducedMotionBlock = block.slice(block.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(reducedMotionBlock.slice(0, 400), /\.cp04-card:hover\s*\{\s*transform:\s*none;\s*\}/);
});

test("privacidad: el texto nuevo de Notice/EmptyState no introduce jerga técnica ni nombres de proveedor", () => {
  const BANNED_TERMS_REGEX =
    /airtable|make\.com|\bwebhook\b|base de datos|límite mensual|\bcuota\b|cloudflare|\bworker\b|\btoken\b|credencial|\bbackend\b|\bendpoint\b|supabase|\bdemo\b/i;

  // Notice() solo renderiza contenido dinámico (mensajes ya existentes,
  // ya cubiertos por publicUiPrivacy.test.mjs) más un icono estático — se
  // verifica aquí que el propio componente no añade texto fijo prohibido.
  const noticeStart = appJsxSource.indexOf('function Notice({ tone = "error", children }) {');
  const noticeEnd = appJsxSource.indexOf("function EmptyState(", noticeStart);
  assert.doesNotMatch(appJsxSource.slice(noticeStart, noticeEnd), BANNED_TERMS_REGEX);

  // EmptyState() aplicado en Gestion(): título y descripción son texto fijo
  // nuevo, se comprueban literalmente.
  assert.doesNotMatch("No se encontraron reservas", BANNED_TERMS_REGEX);
  assert.doesNotMatch("No hay registros que coincidan con los filtros seleccionados.", BANNED_TERMS_REGEX);
});
