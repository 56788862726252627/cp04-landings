// Club Pádel 04 · lógica pura del refresco en vivo del Centro Técnico.
//
// Extraído de CentroTecnico.jsx para poder testear con node --test la
// decisión de qué fuente mostrar (EN VIVO / SNAPSHOT / NO DISPONIBLE) y el
// guard anti doble-petición, sin necesitar un harness de render de React
// (este proyecto no tiene infraestructura de testing de componentes; las
// piezas de lógica pura sí se prueban directamente, igual que
// evaluateSlotAvailability o el RBAC).

// Decide qué conjunto de escenarios mostrar y con qué etiqueta de frescura,
// sin mentir nunca sobre el origen real de los datos:
// - liveOk + al menos un escenario en vivo -> "live"
// - si no, pero hay snapshot con datos -> "snapshot"
// - si no hay ni lo uno ni lo otro -> "unavailable"
export function resolveMakeInventorySource({ liveOk, liveScenarios, snapshotScenarios }) {
  if (liveOk && Array.isArray(liveScenarios) && liveScenarios.length > 0) {
    return { source: "live", scenarios: liveScenarios };
  }
  if (Array.isArray(snapshotScenarios) && snapshotScenarios.length > 0) {
    return { source: "snapshot", scenarios: snapshotScenarios };
  }
  return { source: "unavailable", scenarios: [] };
}

// Guard "single-flight": evita que dos llamadas concurrentes (doble efecto
// de StrictMode, doble clic en "Actualizar estado") disparen dos peticiones
// en paralelo. tryStart() devuelve false si ya hay una operación en curso;
// finish() libera el guard para la siguiente vez.
export function createSingleFlightGuard() {
  let inFlight = false;
  return {
    tryStart() {
      if (inFlight) return false;
      inFlight = true;
      return true;
    },
    finish() {
      inFlight = false;
    },
    get isInFlight() {
      return inFlight;
    },
  };
}
