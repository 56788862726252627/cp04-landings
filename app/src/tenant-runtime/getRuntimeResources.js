// Contrato de recursos operativos (Fase 7). Deriva su forma de
// config/client-config.schema.json#courts/#bookingHours y de
// vertical-config#bookingModalitiesDefault/#bookingLevelsDefault (ya
// resueltos por mergeConfigLayers en resolvedConfig.bookingModalities/
// bookingLevels). "rooms"/"services" no existen todavía en ningún schema
// (el único vertical real hoy es padel, cuyo recurso reservable son
// "courts") — se devuelven como null en vez de fabricarse, mismo principio
// de "no inventar datos" ya aplicado en src/data/clientConfig.default.js.

const DURATION_FIELDS = Object.freeze({ price60: 60, price90: 90, price120: 120 });

function extractDurations(courts) {
  const found = new Set();
  for (const court of courts) {
    for (const [field, minutes] of Object.entries(DURATION_FIELDS)) {
      if (court[field] !== undefined) found.add(minutes);
    }
  }
  return [...found].sort((a, b) => a - b);
}

/**
 * @param {object} resolvedConfig Salida de mergeConfigLayers()/loadResolvedRuntimeConfig().
 * @returns {object} resourcesContext
 */
export function getRuntimeResources(resolvedConfig) {
  if (!resolvedConfig?.tenantId) {
    throw new Error("getRuntimeResources requiere un resolvedConfig ya resuelto (usar loadResolvedRuntimeConfig primero)");
  }
  const courts = resolvedConfig.courts ?? [];

  return {
    courts,
    rooms: null,
    services: null,
    durations: extractDurations(courts),
    businessHours: resolvedConfig.bookingHours ?? [],
    bookingRules: {
      modalities: resolvedConfig.bookingModalities ?? [],
      levels: resolvedConfig.bookingLevels ?? [],
    },
    operationalLimits: resolvedConfig.plan?.limits ?? null,
  };
}
