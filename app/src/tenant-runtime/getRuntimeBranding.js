// Contrato de binding de marca para una futura integración de frontend
// (Fase 6). Deriva su forma de config/client-config.schema.json#brand y
// #theme (ya validados) — no inventa campos nuevos, solo los reordena en
// la forma que pide la misión (logo/acentos/fondo/nombre/contacto/locale/tz).
// theme es opcional en el schema (fail-safe a los defaults de src/theme.js
// si se omite) — por eso primaryAccent/secondaryAccent pueden ser null.
//
// legalLinks: pedido explícitamente por la misión de cierre del runtime
// (Fase 5) pero client-config.schema.json v1.0.0 no tiene ese campo (ver
// "brand.legalLinks (pendiente, no en v1)" en config/CLIENT_CONFIG_SCHEMA_GUIDE.md)
// y este módulo no fabrica datos. Se expone como null explícito (no se omite
// la clave) para que un futuro v2.0.0 del schema solo tenga que dejar de
// devolver siempre null, sin que el consumidor del contrato tenga que
// añadir el campo por primera vez.

/**
 * @param {object} resolvedConfig Salida de mergeConfigLayers()/loadResolvedRuntimeConfig().
 * @returns {object} brandingContext
 */
export function getRuntimeBranding(resolvedConfig) {
  if (!resolvedConfig?.brand) {
    throw new Error("getRuntimeBranding requiere resolvedConfig.brand (usar loadResolvedRuntimeConfig primero)");
  }
  const theme = resolvedConfig.theme ?? null;

  return {
    clubName: resolvedConfig.brand.name,
    legalName: resolvedConfig.brand.legalName ?? null,
    logo: resolvedConfig.brand.logo ?? null,
    favicon: resolvedConfig.brand.favicon ?? null,
    backgroundAssets: resolvedConfig.brand.images ?? [],
    primaryAccent: theme?.accent ?? null,
    secondaryAccent: theme?.accent2 ?? null,
    theme,
    contact: resolvedConfig.contact ?? null,
    locale: resolvedConfig.locale ?? null,
    timezone: resolvedConfig.timezone ?? null,
    legalLinks: resolvedConfig.brand.legalLinks ?? null,
  };
}
