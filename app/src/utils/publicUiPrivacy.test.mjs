// Club Pádel 04 · Guardarraíl de privacidad de la interfaz pública.
//
// Objetivo: ningún jugador (rol PLAYER) debe ver nunca nombres de proveedor
// ni jerga de infraestructura interna (Airtable, Make, Worker, Cloudflare,
// webhook, backend, endpoint, base de datos, cuota, token, credenciales...).
// Esos términos SOLO están permitidos en las claves de traducción que
// pertenecen a superficies exclusivas de ADMIN/SUPPORT (admin.*, soporte.*,
// flujos.* = Centro Técnico) — ver CP04_PROTECTED_SECTIONS /
// CP04_SUPPORT_ONLY_SECTIONS en rbac.js, que son la autoridad real de qué
// rol ve qué sección.
//
// Este test no ejecuta React (el repo no tiene jsdom/testing-library): lee
// el código fuente como texto y evalúa cada par "clave":"valor" del
// diccionario TRANSLATIONS de App.jsx. Es deliberadamente "fail-safe": una
// clave nueva que no esté en la lista de prefijos internos se trata como
// pública y se le exige estar limpia, en vez de exigir que alguien recuerde
// añadirla a una lista de comprobación.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const appJsxPath = path.join(here, "..", "App.jsx");
const authServicePath = path.join(here, "..", "auth", "authService.js");
const indexHtmlPath = path.join(here, "..", "..", "index.html");

const appJsxSource = readFileSync(appJsxPath, "utf8");
const authServiceSource = readFileSync(authServicePath, "utf8");
const indexHtmlSource = readFileSync(indexHtmlPath, "utf8");

// Mismos términos que la auditoría de privacidad pidió eliminar de la UI
// pública, más "supabase"/"demo" (revisión 2026-07-11 #2: "Contraseña
// actualizada (modo demo local)." se coló porque las rondas anteriores no
// vigilaban la palabra "demo"). \bAPI\b se deja fuera del escaneo genérico
// de traducciones porque aparece dentro de rutas públicas legítimas como
// "/api/auth/forgot-password" (no es un término prohibido en sí, son las
// palabras "endpoint"/"webhook"/"token"/etc. las que delatan infraestructura).
const BANNED_TERMS_REGEX =
  /airtable|make\.com|\bwebhook\b|base de datos|límite mensual|\bcuota\b|cloudflare|\bworker\b|\btoken\b|credencial|\bbackend\b|\bendpoint\b|supabase|\bdemo\b/i;

// Prefijos de clave que pertenecen a superficies exclusivas de ADMIN/SUPPORT
// (nunca renderizadas para PLAYER — ver cp04CanAccessSection en rbac.js).
// Todo lo que NO empiece por uno de estos prefijos se trata como
// potencialmente visible por un jugador.
const INTERNAL_ONLY_KEY_PREFIXES = [
  "admin.",
  "soporte.",
  "flujos.",
  "gestion.",
  "alta_jugador.",
  "cancelar.",
  "reprogramar.",
  "role.STAFF.",
  "role.ADMIN.",
  "role.SUPPORT.",
  "auth.pending_desc",
  "auth.pending_badge",
  "nav.admin",
  "nav.soporte",
  "nav.flujos_make",
  "nav.gestion",
  "nav.alta_jugador",
  "nav.cancelar",
  "nav.reprogramar",
];

function isInternalOnlyKey(key) {
  return INTERNAL_ONLY_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

// Extrae el bloque TRANSLATIONS completo (todos los idiomas) del código
// fuente de App.jsx, delimitado por sus propios marcadores estables.
function extractTranslationsBlock(source) {
  const start = source.indexOf("const TRANSLATIONS = {");
  const end = source.indexOf("\nfunction t(key", start);
  assert.ok(
    start !== -1 && end !== -1 && end > start,
    "No se pudo localizar el bloque TRANSLATIONS en App.jsx (¿cambió su forma?)",
  );
  return source.slice(start, end);
}

// Pares "clave":"valor" tal como se escriben en TRANSLATIONS (valor en una
// única línea, sin comillas sin escapar dentro).
const TRANSLATION_ENTRY_REGEX = /"([a-z_]+(?:\.[a-z_]+)+)":"((?:[^"\\]|\\.)*)"/g;

test("ninguna clave de traducción pública contiene jerga de infraestructura interna", () => {
  const block = extractTranslationsBlock(appJsxSource);
  const offenders = [];

  for (const match of block.matchAll(TRANSLATION_ENTRY_REGEX)) {
    const [, key, value] = match;
    if (isInternalOnlyKey(key)) continue;
    if (BANNED_TERMS_REGEX.test(value)) {
      offenders.push(`${key} -> "${value}"`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Claves públicas con términos técnicos prohibidos:\n${offenders.join("\n")}`,
  );
});

test("los mensajes de disponibilidad y reserva en App.jsx son los textos públicos aprobados", () => {
  assert.match(
    appJsxSource,
    /No se pudo actualizar la disponibilidad\. Inténtalo de nuevo en unos minutos\./,
  );
  assert.doesNotMatch(appJsxSource, /No se pudo actualizar la disponibilidad\. Inténtalo de nuevo\.["`]/);
});

test("los mensajes de error de login/registro no filtran error.message en crudo al jugador", () => {
  assert.doesNotMatch(appJsxSource, /Detalle: \$\{error\?\.message/);
  assert.match(appJsxSource, /No se pudo iniciar sesión\. Inténtalo de nuevo en unos minutos\./);
  assert.match(appJsxSource, /No se pudo crear la cuenta\. Inténtalo de nuevo en unos minutos\./);
});

test("authService.js no expone la palabra backend en sus mensajes de error de sesión", () => {
  const messageLines = authServiceSource
    .split("\n")
    .filter((line) => /message:\s*"/.test(line));

  const offenders = messageLines.filter((line) => BANNED_TERMS_REGEX.test(line));

  assert.deepEqual(
    offenders,
    [],
    `authService.js tiene mensajes con jerga técnica:\n${offenders.join("\n")}`,
  );
});

test("la meta description pública de index.html no menciona infraestructura interna", () => {
  const descriptionMatch = indexHtmlSource.match(
    /<meta\s+name="description"\s+content="([^"]*)"/,
  );
  assert.ok(descriptionMatch, "No se encontró <meta name=\"description\"> en index.html");
  assert.doesNotMatch(descriptionMatch[1], BANNED_TERMS_REGEX);
});

// Los componentes PLAYER también escriben texto JSX suelto directamente
// (fuera de TRANSLATIONS) — es lo que se escapó en la revisión visual
// anterior ("Autenticación real: Supabase conectado", "...backend de
// autenticación segura" en Perfil). Este test extrae el cuerpo fuente de
// cada componente accesible por PLAYER (delimitado por la siguiente
// declaración "function X(" de nivel superior, patrón estable en este
// archivo) y lo escanea igual que las traducciones, más nombres de
// proveedor que no están en BANNED_TERMS_REGEX pero son igual de reveladores.
const PLAYER_COMPONENT_BOUNDARIES = [
  ["Sidebar", "function Sidebar(", "function Inicio("],
  ["Inicio", "function Inicio(", "function Reservas("],
  ["Reservas", "function Reservas(", "function CancelarReserva("],
  ["Torneos", "function Torneos(", "function RankingAvatar("],
  ["Ranking", "function Ranking(", "function Admin("],
  ["Perfil", "function Perfil(", "function PwaStatusBanners("],
];

const PROVIDER_NAME_REGEX = /supabase/i;

// Los comentarios de código (// ... y /* ... */) no se renderizan nunca,
// para ningún rol — este archivo está lleno de comentarios de diseño que
// mencionan legítimamente Airtable/Worker/backend/Supabase al explicar el
// estado de la integración. Se descartan antes de escanear para que el test
// solo mire texto que realmente puede llegar al navegador de un jugador.
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

test("los componentes PLAYER no contienen texto JSX suelto con jerga técnica o nombres de proveedor", () => {
  const offenders = [];

  for (const [name, startMarker, endMarker] of PLAYER_COMPONENT_BOUNDARIES) {
    const start = appJsxSource.indexOf(startMarker);
    const end = appJsxSource.indexOf(endMarker, start);
    assert.ok(
      start !== -1 && end !== -1 && end > start,
      `No se pudo localizar el componente ${name} en App.jsx (¿cambiaron los marcadores?)`,
    );
    const body = stripComments(appJsxSource.slice(start, end));

    if (BANNED_TERMS_REGEX.test(body)) {
      offenders.push(`${name}: coincide con término técnico prohibido`);
    }
    if (PROVIDER_NAME_REGEX.test(body)) {
      offenders.push(`${name}: menciona un proveedor por nombre (Supabase)`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `Componentes PLAYER con texto técnico expuesto:\n${offenders.join("\n")}`,
  );
});

test("Perfil() usa los textos públicos aprobados para sesión y cambio de contraseña", () => {
  const start = appJsxSource.indexOf("function Perfil(");
  const end = appJsxSource.indexOf("function PwaStatusBanners(", start);
  const body = appJsxSource.slice(start, end);

  assert.match(body, /Sesión verificada/);
  assert.match(body, /Actualiza tu contraseña de acceso de forma segura\./);
});

test("Sidebar() usa \"Sesión segura\" (ES) en la tarjeta de entorno protegido", () => {
  assert.match(appJsxSource, /"common\.modo_seguro":"Sesión segura"/);
});

test("el mensaje de contraseña actualizada no revela el modo demo, en ningún idioma", () => {
  assert.doesNotMatch(appJsxSource, /"perfil\.pwd_guardada":"[^"]*[Dd]emo[^"]*"/);
});
