// Lógica pura de TenantStatusGate.jsx, separada a propósito (mismo patrón
// que buildTenantRuntimeContextValue.js/TenantConfigProvider.jsx) para poder
// probarla con node:test sin depender de un entorno de render de React —
// este proyecto no tiene infraestructura de render de componentes (jsdom/
// testing-library), así que la lógica no trivial nunca debe vivir solo
// dentro de un .jsx.
const SCREENS = Object.freeze({
  disabled: Object.freeze({
    title: "Servicio no disponible",
    message: "Este club no tiene el servicio activo en este momento. Si crees que esto es un error, contacta con soporte.",
  }),
  maintenance: Object.freeze({
    title: "Mantenimiento programado",
    message: "Estamos realizando tareas de mantenimiento. La aplicación estará disponible de nuevo en breve.",
  }),
  unknown_domain: Object.freeze({
    title: "Dominio no reconocido",
    message: "Esta dirección no está asociada a ningún club activo de Club Pádel 04.",
  }),
});

/**
 * @param {{status: string}} tenantStatus
 * @returns {{title: string, message: string}|null} null si el status debe
 *   renderizar la app normal (active/staging) — cualquier otro status
 *   (disabled/maintenance/unknown_domain) devuelve la pantalla a mostrar.
 */
export function resolveTenantStatusScreen(tenantStatus) {
  return SCREENS[tenantStatus?.status] ?? null;
}
