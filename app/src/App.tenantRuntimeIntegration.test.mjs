// Club Pádel 04 · Prueba de que la integración runtime multi-tenant descrita
// en docs/agencia-ia/RUNTIME_INTEGRATION_SAFE_PLAN.md (STEPs 6-7) está
// realmente conectada en App.jsx, no solo montada "en el aire" en main.jsx.
//
// Antes de este lote, TenantConfigProvider envolvía el árbol en main.jsx sin
// ningún consumidor real (ver comentario histórico en
// src/tenant-runtime/TenantConfigProvider.jsx: "NO se integra en App.jsx
// todavía") y App.jsx seguía leyendo/escribiendo localStorage con claves
// planas sin namespace de tenant/usuario para rol, modo de auth, email y
// datos de perfil (avatar/bio/deporte/privacidad).
//
// Este repo no tiene jsdom/testing-library (ver publicUiPrivacy.test.mjs):
// App.jsx no se puede renderizar ni montar en un test real. Se aplica el
// mismo criterio ya establecido ahí — leer el código fuente como texto y
// comprobar los puntos exactos de integración — para tener una prueba real
// de regresión: si alguien revierte la integración (vuelve a "localStorage.
// getItem('cp04_role')" plano, o quita el import de useTenantConfig), estos
// tests fallan.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const appJsxPath = path.join(here, "App.jsx");
const mainJsxPath = path.join(here, "main.jsx");

const appJsxSource = readFileSync(appJsxPath, "utf8");
const mainJsxSource = readFileSync(mainJsxPath, "utf8");

function sliceFunction(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.ok(start !== -1, `No se pudo localizar "${startMarker}" en el código fuente`);
  const end = endMarker ? source.indexOf(endMarker, start) : source.length;
  assert.ok(end !== -1 && end > start, `No se pudo localizar el final de "${startMarker}" (marcador "${endMarker}")`);
  return source.slice(start, end);
}

test("main.jsx sigue montando TenantConfigProvider envolviendo <App /> (precondición de esta integración)", () => {
  const providerIdx = mainJsxSource.indexOf("<TenantConfigProvider");
  const appIdx = mainJsxSource.indexOf("<App />");
  assert.ok(providerIdx !== -1 && appIdx !== -1 && providerIdx < appIdx, "TenantConfigProvider debe envolver <App /> en main.jsx");
});

test("App.jsx importa useTenantConfig() del tenant-runtime (no reimplementa una segunda fuente de tenantId)", () => {
  assert.match(
    appJsxSource,
    /import\s*\{\s*useTenantConfig\s*\}\s*from\s*"\.\/tenant-runtime\/TenantConfigProvider\.jsx"/,
  );
});

test("App.jsx importa los helpers de storage tenant-aware desde src/utils/tenantAwareAppStorage.js (reutiliza buildStorageKey, no lo duplica)", () => {
  assert.match(
    appJsxSource,
    /import\s*\{\s*cp04ReadTenantAware,\s*cp04WriteTenantAware,\s*cp04RemoveTenantAware\s*\}\s*from\s*"\.\/utils\/tenantAwareAppStorage\.js"/,
  );
});

test("el componente raíz ClubPadel04SaaSApp llama a useTenantConfig() y consume tenantId de verdad, no solo lo importa", () => {
  const body = sliceFunction(appJsxSource, "export default function ClubPadel04SaaSApp() {", null);
  assert.match(body, /const\s*\{\s*tenantId\s*\}\s*=\s*useTenantConfig\(\)/);
  // tenantId debe usarse realmente en el cuerpo, no quedar como variable muerta.
  const usages = (body.match(/\btenantId\b/g) || []).length;
  assert.ok(usages >= 4, `tenantId debería reutilizarse en varios puntos del componente raíz (selectedRole, confirmRoleAccess, clearRole...), se encontraron ${usages} usos`);
});

test("Perfil() consume useTenantConfig() y namespacea datos de perfil por tenant + usuario (o rol demo como fallback documentado)", () => {
  const body = sliceFunction(appJsxSource, "function Perfil(", "function PwaStatusBanners(");
  assert.match(body, /const\s*\{\s*tenantId\s*\}\s*=\s*useTenantConfig\(\)/);
  assert.match(body, /const profileUserId = auth\.user\?\.id \? String\(auth\.user\.id\) : `local-role:\$\{cp04NormalizeRole\(selectedRole\)\}`/);

  // saveProfileFallback/readProfileFallback son el único punto de
  // lectura/escritura real de avatar/bio/deporte/privacidad (via
  // saveProfileField/storageMap) — deben pasar userId: profileUserId.
  assert.match(
    body,
    /function saveProfileFallback\(key, value\) \{\s*const serialized[^}]*cp04WriteTenantAware\(cp04SafeLocalStorage\(\), \{ tenantId, key, userId: profileUserId \}, serialized\);/,
  );
  assert.match(
    body,
    /function readProfileFallback\(key\) \{\s*return cp04ReadTenantAware\(cp04SafeLocalStorage\(\), \{ tenantId, key, userId: profileUserId \}\);/,
  );

  // Las 4 claves de perfil deben seguir pasando por ese storageMap (ninguna
  // se quedó fuera de la migración).
  for (const key of ["cp04_avatar", "cp04_bio", "cp04_deporte", "cp04_privacidad"]) {
    assert.match(body, new RegExp(`"${key}"`), `${key} debería seguir declarada en Perfil()`);
  }

  // handleAvatarDelete es la única escritura de perfil que no pasa por
  // saveProfileFallback (es un remove, no un write) — se verifica aparte.
  assert.match(
    body,
    /cp04RemoveTenantAware\(cp04SafeLocalStorage\(\), \{ tenantId, key: "cp04_avatar", userId: profileUserId \}\)/,
  );
});

test("clearRole() invalida el rol demo con removeLegacy:true (logout real: borra namespaced Y legacy, no un fallback pasivo)", () => {
  const body = sliceFunction(appJsxSource, "function clearRole() {", "function handleUniversalLogin(");
  assert.match(body, /cp04RemoveTenantAware\(cp04SafeLocalStorage\(\),\s*\{\s*tenantId,\s*key:\s*"cp04_role",\s*removeLegacy:\s*true\s*\}\)/);
});

test("ninguna de las 8 claves migradas (rol/auth_mode/email/perfil) se lee o escribe ya con localStorage crudo en App.jsx", () => {
  const migratedKeys = [
    "cp04_role",
    "cp04_auth_mode",
    "cp04_user_email",
    "cp04-reservas-email",
    "cp04_avatar",
    "cp04_bio",
    "cp04_deporte",
    "cp04_privacidad",
  ];

  const offenders = [];
  for (const key of migratedKeys) {
    // Detecta `localStorage.getItem/setItem/removeItem("<key>"` (con o sin
    // `window.` delante) que NO pase por los helpers tenant-aware.
    const rawAccessRegex = new RegExp(`(?<!cp04(?:Read|Write|Remove)TenantAware\\([^)]{0,200})(?:window\\.)?localStorage\\.(?:get|set|remove)Item\\(\\s*"${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`);
    if (rawAccessRegex.test(appJsxSource)) {
      offenders.push(key);
    }
  }

  assert.deepEqual(offenders, [], `Claves con acceso a localStorage crudo pendiente de migrar: ${offenders.join(", ")}`);
});

test("las 8 claves migradas aparecen cerca (misma línea o líneas contiguas) de una llamada a un helper cp04*TenantAware / cp04GetStoredAuthMode / saveProfileFallback", () => {
  // Ventana de proximidad (en vez de balanceo de paréntesis, fácil de romper
  // con llamadas anidadas como cp04SafeLocalStorage() dentro de otra
  // llamada): cada clave debe tener el nombre de un helper tenant-aware
  // dentro de las 3 líneas anteriores o siguientes a su aparición.
  const lines = appJsxSource.split("\n");
  const helperNameRegex = /cp04(?:Read|Write|Remove)TenantAware|cp04GetStoredAuthMode|saveProfileFallback|readProfileFallback/;

  const targets = ["cp04_role", "cp04_auth_mode", "cp04_user_email", "cp04-reservas-email", "cp04_avatar", "cp04_bio", "cp04_deporte", "cp04_privacidad"];
  const missing = [];

  for (const key of targets) {
    const keyLineIndexes = lines
      .map((line, i) => (line.includes(`"${key}"`) ? i : -1))
      .filter((i) => i !== -1);

    const hasNearbyHelper = keyLineIndexes.some((i) => {
      const windowStart = Math.max(0, i - 3);
      const windowEnd = Math.min(lines.length, i + 4);
      const window = lines.slice(windowStart, windowEnd).join("\n");
      return helperNameRegex.test(window);
    });

    if (!hasNearbyHelper) missing.push(key);
  }

  assert.deepEqual(missing, [], `Claves sin un helper tenant-aware cerca de su uso: ${missing.join(", ")}`);
});

test("cp04SafeLocalStorage() existe como fallback defensivo (mismo patrón que authService.safeLocalStorage, no accede a window sin protección)", () => {
  assert.match(appJsxSource, /function cp04SafeLocalStorage\(\)\s*\{/);
});
