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

// Traduce el `reason`/error crudo devuelto por el Worker (o por el propio
// fetch) a un mensaje accionable, SOLO en el caso concreto que causaba
// confusión real: el navegador no tiene un access_token real de Supabase
// (p.ej. porque se entró por el selector de rol demo "Acceso por roles" en
// vez de "Acceso real" con email/contraseña) y por eso el Worker responde
// fail-closed con 401 MISSING_TOKEN. Para cualquier otro motivo (rol
// insuficiente con sesión real, Make no disponible, error de red, etc.) NO
// se sustituye nada: se deja pasar el motivo real tal cual, para no mostrar
// nunca una razón inventada o distinta de la real (ver tests de regresión).
export function describeLiveIssue(reason, hasAccessToken) {
  if (!reason) return null;
  if (!hasAccessToken && (reason === "MISSING_TOKEN" || reason === "HTTP_401")) {
    return "No hay una sesión real de Supabase en este navegador: el acceso rápido por roles (demo) no genera un token real. Inicia sesión con tu email y contraseña reales para consultar el inventario en vivo.";
  }
  return null;
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
