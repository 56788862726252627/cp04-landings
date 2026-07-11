import { test } from "node:test";
import assert from "node:assert/strict";
import { T, CORE_THEME, THEME_TOKEN_KEYS, resolveTheme } from "./theme.js";

test("T sigue siendo exactamente CORE_THEME (compatibilidad retroactiva completa)", () => {
  assert.deepEqual(T, CORE_THEME);
  assert.equal(T.accent, "#b6ff00");
  assert.equal(T.fontDisplay, "'Syne', sans-serif");
  assert.equal(Object.keys(T).length, THEME_TOKEN_KEYS.length);
});

test("1. default sin override devuelve exactamente CORE_THEME", () => {
  const resolved = resolveTheme();
  assert.deepEqual(resolved, CORE_THEME);
});

test("2. override vertical se aplica cuando no hay override de cliente", () => {
  const resolved = resolveTheme(CORE_THEME, { accent: "#123456" }, {});
  assert.equal(resolved.accent, "#123456");
  assert.equal(resolved.bg, CORE_THEME.bg);
});

test("3. override de cliente se aplica", () => {
  const resolved = resolveTheme(CORE_THEME, {}, { accent: "#abcdef" });
  assert.equal(resolved.accent, "#abcdef");
  assert.equal(resolved.bg, CORE_THEME.bg);
});

test("4. override parcial: solo las claves indicadas cambian, el resto cae a CORE", () => {
  const resolved = resolveTheme(CORE_THEME, {}, { accent: "#111111", fontBody: "'Inter', sans-serif" });
  assert.equal(resolved.accent, "#111111");
  assert.equal(resolved.fontBody, "'Inter', sans-serif");
  for (const key of THEME_TOKEN_KEYS) {
    if (key === "accent" || key === "fontBody") continue;
    assert.equal(resolved[key], CORE_THEME[key], `${key} debería mantener el valor CORE`);
  }
});

test("5. clave desconocida en el override se ignora en silencio (fail-safe)", () => {
  const resolved = resolveTheme(CORE_THEME, {}, { accent: "#222222", noEsUnToken: "algo", otraClaveInventada: 42 });
  assert.equal(resolved.accent, "#222222");
  assert.equal("noEsUnToken" in resolved, false);
  assert.equal("otraClaveInventada" in resolved, false);
  assert.equal(Object.keys(resolved).length, THEME_TOKEN_KEYS.length);
});

test("6. valor inválido en un override se descarta y cae al siguiente nivel", () => {
  const resolvedNumero = resolveTheme(CORE_THEME, {}, { accent: 12345 });
  assert.equal(resolvedNumero.accent, CORE_THEME.accent);

  const resolvedVacio = resolveTheme(CORE_THEME, {}, { accent: "" });
  assert.equal(resolvedVacio.accent, CORE_THEME.accent);

  const resolvedNull = resolveTheme(CORE_THEME, { accent: null }, { accent: undefined });
  assert.equal(resolvedNull.accent, CORE_THEME.accent);
});

test("7. precedencia CLIENT > VERTICAL > CORE cuando los tres definen la misma clave", () => {
  const resolved = resolveTheme(
    { ...CORE_THEME, accent: "#core0000" },
    { accent: "#vertical00" },
    { accent: "#client000" }
  );
  assert.equal(resolved.accent, "#client000");
});

test("7b. sin override de cliente, gana vertical sobre core", () => {
  const resolved = resolveTheme(
    { ...CORE_THEME, accent: "#core0000" },
    { accent: "#vertical00" },
    {}
  );
  assert.equal(resolved.accent, "#vertical00");
});

test("8. identidad visual actual intacta sin override (build actual de Club Pádel 04)", () => {
  const resolved = resolveTheme();
  assert.deepEqual(resolved, T);
  assert.equal(resolved.bg, "#05080d");
  assert.equal(resolved.accent, "#b6ff00");
  assert.equal(resolved.accent2, "#20e3b2");
  assert.equal(resolved.primary, "#2f6bff");
  assert.equal(resolved.danger, "#ff5e3a");
  assert.equal(resolved.warning, "#ffad47");
  assert.equal(resolved.fontDisplay, "'Syne', sans-serif");
  assert.equal(resolved.fontBody, "'DM Sans', sans-serif");
});

test("coreTheme/overrides no objeto (tipo inválido) caen a defaults seguros sin lanzar", () => {
  assert.doesNotThrow(() => resolveTheme("no-es-un-objeto", null, ["tampoco"]));
  const resolved = resolveTheme("no-es-un-objeto", null, ["tampoco"]);
  assert.deepEqual(resolved, CORE_THEME);
});

test("el resultado de resolveTheme está congelado (Object.freeze)", () => {
  const resolved = resolveTheme();
  assert.throws(() => {
    "use strict";
    resolved.accent = "#000000";
  });
});
