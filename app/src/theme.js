// Club Pádel 04 · tokens de diseño compartidos.
// Extraído de App.jsx para que otros componentes (p. ej. CentroTecnico)
// puedan usar exactamente la misma identidad visual sin crear un import
// circular con App.jsx.
//
// Capas (ver docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md):
//   CORE_THEME      — defaults de la plataforma, válidos para cualquier
//                      cliente/vertical si no se especifica nada más.
//   verticalOverride — defaults propios de un sector (opcional).
//   clientOverride    — valores concretos de un cliente (opcional).
// Precedencia de resolveTheme(): CLIENT > VERTICAL > CORE.
//
// `T` sigue siendo, sin cambios, el mismo objeto de siempre: incluso con
// este archivo ampliado, `import { T } from "./theme.js"` (488 usos en
// App.jsx, 91 en CentroTecnico.jsx) sigue devolviendo exactamente las
// mismas claves y los mismos valores que antes. Nada de lo añadido aquí
// se conecta todavía a App.jsx ni a CentroTecnico.jsx.

const THEME_TOKEN_KEYS = [
  "bg",
  "surface",
  "surface2",
  "surface3",
  "accent",
  "accent2",
  "primary",
  "text",
  "textDim",
  "line",
  "danger",
  "warning",
  "fontDisplay",
  "fontBody",
];

const CORE_THEME = Object.freeze({
  bg: "#05080d",
  surface: "#0b111d",
  surface2: "#111a2b",
  surface3: "#18243a",
  accent: "#b6ff00",
  accent2: "#20e3b2",
  primary: "#2f6bff",
  text: "#ffffff",
  textDim: "#9aa8bd",
  line: "rgba(255,255,255,0.10)",
  danger: "#ff5e3a",
  warning: "#ffad47",
  fontDisplay: "'Syne', sans-serif",
  fontBody: "'DM Sans', sans-serif",
});

// Export histórico, sin cambios de forma ni de valor.
export const T = CORE_THEME;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Resuelve el tema efectivo combinando CORE, VERTICAL y CLIENT.
 * - Solo se resuelven las claves ya conocidas de CORE_THEME: cualquier
 *   clave desconocida en verticalOverride/clientOverride se ignora en
 *   silencio (fail-safe: nunca cuela un token no soportado por la UI).
 * - Un valor inválido (no string, o string vacío) en un override se
 *   descarta y cae al siguiente nivel — nunca produce un token vacío/roto.
 * - Sin overrides, devuelve exactamente CORE_THEME.
 */
export function resolveTheme(coreTheme = CORE_THEME, verticalOverride = {}, clientOverride = {}) {
  const safeCore = isPlainObject(coreTheme) ? coreTheme : CORE_THEME;
  const safeVertical = isPlainObject(verticalOverride) ? verticalOverride : {};
  const safeClient = isPlainObject(clientOverride) ? clientOverride : {};

  const resolved = {};
  for (const key of THEME_TOKEN_KEYS) {
    const clientValue = safeClient[key];
    const verticalValue = safeVertical[key];
    const coreValue = safeCore[key];
    resolved[key] = isNonEmptyString(clientValue)
      ? clientValue
      : isNonEmptyString(verticalValue)
        ? verticalValue
        : isNonEmptyString(coreValue)
          ? coreValue
          : CORE_THEME[key];
  }
  return Object.freeze(resolved);
}

export { CORE_THEME, THEME_TOKEN_KEYS };
