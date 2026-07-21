// Paso 09 · Tenant por defecto: Club Pádel 04.
//
// Representa, en el esquema central, el negocio que HOY corre en producción.
// Los roles y el mapa `permissions` están copiados literalmente de
// src/utils/rbac.js (CP04_ROLES / CP04_ROLE_PERMISSIONS): no se derivan
// dinámicamente para que un cambio accidental aquí no pueda alterar el
// comportamiento real de la app, y para que el test de equivalencia en
// modules/moduleRegistry.test.mjs compare dos fuentes independientes.

import { TENANT_SCHEMA_VERSION } from "./tenantSchema.js";

export const CLUB_PADEL_04_TENANT = Object.freeze({
  schemaVersion: TENANT_SCHEMA_VERSION,
  tenantId: "club-padel-04",
  slug: "club-padel-04",
  legalName: "Club Pádel 04",
  displayName: "Club Pádel 04",
  businessType: "padel-club",
  sector: "padel",
  locale: "es-ES",
  timezone: "Europe/Madrid",
  currency: "EUR",
  country: "ES",
  branding: {
    colors: {
      bg: "#05080d",
      surface: "#0b111d",
      accent: "#b6ff00",
      accent2: "#20e3b2",
      primary: "#2f6bff",
      danger: "#ff5e3a",
      warning: "#ffad47",
    },
    fontDisplay: "'Syne', sans-serif",
    fontBody: "'DM Sans', sans-serif",
  },
  contact: {
    email: "info@clubpadel04.example",
  },
  roles: ["PLAYER", "STAFF", "ADMIN", "SUPPORT"],
  // Copia literal de CP04_ROLE_PERMISSIONS (src/utils/rbac.js) a fecha
  // 2026-07-21. Si rbac.js cambia, este objeto debe actualizarse a mano:
  // el test de equivalencia fallará como recordatorio.
  permissions: {
    PLAYER: ["inicio", "reservas", "torneos", "ranking", "comunidad", "perfil"],
    STAFF: ["inicio", "reservas", "alta_jugador", "baja_jugador", "reprogramar", "cancelar", "gestion", "cierre_pistas", "lista_espera", "control_qr", "pistas_recordatorios", "comunicaciones_socio", "calendario_disponibilidad", "torneos", "comunidad", "perfil"],
    ADMIN: ["inicio", "reservas", "alta_jugador", "baja_jugador", "reprogramar", "cancelar", "gestion", "cierre_pistas", "lista_espera", "control_qr", "pistas_recordatorios", "comunicaciones_socio", "calendario_disponibilidad", "torneos", "ranking", "comunidad", "admin", "dashboard_kpi", "backups_seguridad", "facturacion_pagos", "automatizaciones_bots", "perfil"],
    SUPPORT: ["inicio", "reservas", "alta_jugador", "baja_jugador", "reprogramar", "cancelar", "gestion", "cierre_pistas", "lista_espera", "control_qr", "pistas_recordatorios", "comunicaciones_socio", "calendario_disponibilidad", "torneos", "ranking", "comunidad", "admin", "dashboard_kpi", "backups_seguridad", "facturacion_pagos", "automatizaciones_bots", "flujos_make", "soporte", "perfil"],
  },
  // Unión exacta de todos los ids que aparecen en `permissions` (arriba),
  // sea cual sea el rol. Estos son los ids LEGACY de CP04 (los mismos que
  // usa rbac.js), no los ids del catálogo genérico de módulos — CP04 se
  // representa con su propio espacio de identificadores por diseño (ver
  // docs/paso-09-saas-core-replicable/03-modulos-y-navegacion.md).
  modulesEnabled: [
    "inicio", "reservas", "torneos", "ranking", "comunidad", "perfil",
    "alta_jugador", "baja_jugador", "reprogramar", "cancelar", "gestion",
    "cierre_pistas", "lista_espera", "control_qr", "pistas_recordatorios",
    "comunicaciones_socio", "calendario_disponibilidad", "admin",
    "dashboard_kpi", "backups_seguridad", "facturacion_pagos",
    "automatizaciones_bots", "flujos_make", "soporte",
  ],
  featuresEnabled: [],
  terminologyOverrides: {},
  integrations: {
    automation: { status: "configured_untested", envVars: ["MAKE_WEBHOOK_URL"] },
    dataRepository: { status: "configured_untested", envVars: ["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID"] },
    payments: { status: "not_configured", envVars: ["STRIPE_SECRET_KEY"] },
    messaging: { status: "not_configured", envVars: ["WHATSAPP_BUSINESS_TOKEN"] },
    email: { status: "not_configured", envVars: ["GMAIL_OAUTH_CLIENT_ID"] },
    calendar: { status: "not_configured", envVars: ["GOOGLE_CALENDAR_CLIENT_ID"] },
  },
  policies: {
    privacyReviewRequired: false,
    regulatedSector: false,
    sensitiveDataCategories: [],
  },
  demoData: { enabled: true, source: "cp04DemoData" },
  flags: {},
  meta: {
    templateId: "padel-club",
    presetId: null,
    isDefaultTenant: true,
    note: "Tenant de producción real. No generado por el CLI de aprovisionamiento.",
  },
});
