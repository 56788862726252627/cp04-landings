// Accesor dedicado de horario (la misión lo pide como función propia,
// separada de getRuntimeResources). bookingHours es una lista plana de
// horas de inicio de franja (config/client-config.schema.json#bookingHours)
// — no existe un modelo "apertura/cierre por día de la semana" en el
// código actual, así que no se fabrica uno aquí.

/**
 * @param {object} resolvedConfig Salida de mergeConfigLayers()/loadResolvedRuntimeConfig().
 * @returns {{slots: string[], timezone: string|null}}
 */
export function getRuntimeBusinessHours(resolvedConfig) {
  if (!resolvedConfig?.tenantId) {
    throw new Error("getRuntimeBusinessHours requiere un resolvedConfig ya resuelto (usar loadResolvedRuntimeConfig primero)");
  }
  return {
    slots: resolvedConfig.bookingHours ?? [],
    timezone: resolvedConfig.timezone ?? null,
  };
}
