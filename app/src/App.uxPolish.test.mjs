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

// --- Revisión visual manual en navegador (2026-07-12) ---------------------
// Dos hallazgos concretos de una revisión visual real: el botón "Iniciar
// sesión" no encajaba con el resto de botones premium verde/neón de la app,
// y la tarjeta de "Procesos activos" mostraba "38/43" con un texto
// secundario de "incidencias" — mismo criterio que el resto de este
// archivo: inspección de código fuente (el repo no tiene jsdom/testing-library).

test("el botón \"Iniciar sesión\" usa el mismo degradado premium accent→accent2 que Btn variant=\"primary\", no un relleno plano sin border", () => {
  const start = appJsxSource.indexOf("Iniciar sesión");
  const body = appJsxSource.slice(Math.max(0, start - 700), start);
  assert.match(body, /background: `linear-gradient\(135deg, \$\{T\.accent\}, \$\{T\.accent2\}\)`/);
  assert.match(body, /boxShadow: "0 16px 36px rgba\(182,255,0,\.18\)"/);
  assert.match(body, /border: "none"/);
});

test("el botón \"Iniciar sesión\" se deshabilita solo mientras falten email o contraseña, con opacidad .55 (no un negro/gris que parezca roto)", () => {
  const start = appJsxSource.indexOf("Iniciar sesión");
  const body = appJsxSource.slice(Math.max(0, start - 700), start);
  assert.match(body, /disabled=\{!loginEmail\.trim\(\) \|\| !loginPassword\.trim\(\)\}/);
  assert.match(body, /opacity: \(!loginEmail\.trim\(\) \|\| !loginPassword\.trim\(\)\) \? 0\.55 : 1/);
});

test("el botón \"Iniciar sesión\" sigue usando la clase cp04-menu-button (hereda hover/focus-visible ya definidos globalmente, no se duplica ese CSS)", () => {
  const start = appJsxSource.indexOf("Iniciar sesión");
  const body = appJsxSource.slice(Math.max(0, start - 700), start);
  assert.match(body, /className="cp04-menu-button"/);
});

test("la tarjeta de procesos activos muestra 50/50 en Inicio y en Admin, ya no 38/43", () => {
  assert.doesNotMatch(appJsxSource, /\/43/);
  assert.doesNotMatch(appJsxSource, /\bmakeActivos: 38\b/);
  const homeCard = appJsxSource.match(/<MetricCard label=\{tx\("home\.procesos_activos"\)\}.*?\/>/);
  assert.ok(homeCard, "no se encontró la tarjeta de procesos activos de Inicio");
  assert.match(homeCard[0], /value=\{`\$\{kpi\.makeActivos\}\/50`\}/);

  const adminCard = appJsxSource.match(/<MetricCard label=\{tx\("admin\.procesos"\)\}.*?\/>/);
  assert.ok(adminCard, "no se encontró la tarjeta de procesos de Admin");
  assert.match(adminCard[0], /value=\{`\$\{kpi\.makeActivos\}\/50`\}/);
});

test("el texto secundario de la tarjeta de procesos ya no dice \"X incidencias\" (contradictorio con 50/50): usa home.sistema_preparado", () => {
  const homeCard = appJsxSource.match(/<MetricCard label=\{tx\("home\.procesos_activos"\)\}.*?\/>/)[0];
  assert.match(homeCard, /sub=\{tx\("home\.sistema_preparado"\)\}/);
  assert.doesNotMatch(homeCard, /kpi\.makeErrores/);

  const adminCard = appJsxSource.match(/<MetricCard label=\{tx\("admin\.procesos"\)\}.*?\/>/)[0];
  assert.match(adminCard, /sub=\{tx\("home\.sistema_preparado"\)\}/);
  assert.doesNotMatch(adminCard, /kpi\.tasaExitoMake/);
});

test("DEMO_KPI ya no contradice \"50/50\": makeErrores/makePausados/incidenciasAbiertas en 0 (nunca se afirma verificación real, solo alcance preparado)", () => {
  const start = appJsxSource.indexOf("const DEMO_KPI = {");
  const end = appJsxSource.indexOf("};", start);
  const block = appJsxSource.slice(start, end);
  assert.match(block, /makeActivos: 50,/);
  assert.match(block, /makeErrores: 0,/);
  assert.match(block, /makePausados: 0,/);
  assert.match(block, /incidenciasAbiertas: 0,/);
});

test("home.sistema_preparado existe traducido en los 8 idiomas soportados y ninguna traducción menciona Make/Airtable/API/webhook/proveedor", () => {
  const matches = [...appJsxSource.matchAll(/"home\.sistema_preparado":"([^"]+)"/g)];
  assert.equal(matches.length, 8, "deberían existir 8 traducciones (una por idioma soportado)");
  const BANNED_TERMS_REGEX = /airtable|make|\bwebhook\b|\bapi\b|proveedor|cuota|cloudflare|\bworker\b|\btoken\b/i;
  for (const [, value] of matches) {
    assert.doesNotMatch(value, BANNED_TERMS_REGEX, `traducción sospechosa: "${value}"`);
  }
});

test("privacidad: Inicio() sigue sin jerga técnica tras el cambio del contador (cubierto también por publicUiPrivacy.test.mjs)", () => {
  const start = appJsxSource.indexOf("function Inicio(");
  const end = appJsxSource.indexOf("function Reservas(", start);
  const body = appJsxSource.slice(start, end);
  const BANNED_TERMS_REGEX =
    /airtable|make\.com|\bwebhook\b|base de datos|límite mensual|\bcuota\b|cloudflare|\bworker\b|\btoken\b|credencial|\bbackend\b|\bendpoint\b|supabase/i;
  assert.doesNotMatch(body, BANNED_TERMS_REGEX);
});
