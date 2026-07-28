// App 3 · Prompt 2/6 — Proyecto demo.
//
// Datos del proyecto de demostración usado para probar el flujo
// end-to-end de la fábrica de entregables (Prompt 1/6). Cliente,
// sector y branding son deliberadamente ficticios: se alinean a
// propósito con el negocio de ejemplo ya existente en
// src/saas-core/businesses/clinica-de-fisioterapia-malaga/ (generado en
// una sesión anterior por la fábrica SaaS) para no inventar una entidad
// nueva sin motivo — pero este módulo no importa ese JSON en tiempo de
// ejecución, para mantener deliverables/ desacoplado de businesses/.

export const CP04_DEMO_CLIENT_SLUG = "clinica-de-fisioterapia-malaga-demo";

export function cp04BuildDemoProject() {
  return Object.freeze({
    projectId: `demo_${CP04_DEMO_CLIENT_SLUG}`,
    displayName: "Clínica De Fisioterapia Málaga (demo)",
    client: "Clínica De Fisioterapia Málaga (cliente ficticio, sin datos reales)",
    sector: "physiotherapy",
    sectorLabel: "Fisioterapia y rehabilitación",
    language: "es-ES",
    country: "ES",
    branding: Object.freeze({
      primaryColor: "#1d4e89",
      accentColor: "#1f7a34",
      backgroundColor: "#ffffff",
      textColor: "#0c1420",
      logoLabel: "CFM",
      tone: "cercano-profesional",
    }),
    description:
      "Proyecto de demostración end-to-end de la fábrica de entregables de la Agencia de IA: genera el paquete completo de documentos, previsualizaciones y especificaciones de mockup para un negocio local ficticio, sin conectar ningún servicio externo.",
    targetDevices: Object.freeze([
      "movil-android-vertical",
      "movil-ios-vertical",
      "tablet-android-horizontal",
      "ipad-horizontal",
      "escritorio-windows",
      "escritorio-macos",
      "escritorio-linux",
      "web-pwa-responsive",
    ]),
    targetOperatingSystems: Object.freeze(["Android", "iOS", "Windows", "macOS", "Linux", "Web/PWA"]),
    requestedDeliverables: Object.freeze([
      "contrato",
      "propuesta_comercial",
      "informe",
      "documentacion_tecnica",
      "documentacion_comercial",
      "presentacion",
      "logotipo",
      "icono",
      "fondo",
      "banner",
    ]),
  });
}
