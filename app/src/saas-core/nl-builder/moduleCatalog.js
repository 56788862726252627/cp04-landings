// Paso 11 · Fase 7 — Catálogo de módulos detectables y sus dependencias.
//
// Identificadores propios del Natural Language Business Builder (no
// necesariamente los mismos que moduleRegistry.CORE_MODULE_CATALOG de
// Paso 09, que describe navegación de la app ya construida). Aquí un
// "módulo" es una CAPACIDAD candidata a incluirse en modules[] del
// Business Blueprint; businessBlueprintSchema solo exige que sea un array
// de strings, así que estos ids son válidos aunque no todos tengan today
// una pantalla dedicada en Club Pádel 04.

export const MODULE_CATALOG = Object.freeze([
  { id: "autenticacion", label: "Autenticación", keywords: ["autenticación", "login", "inicio de sesión"], dependsOn: [], base: true },
  { id: "usuarios", label: "Usuarios", keywords: ["usuarios", "cuentas de usuario"], dependsOn: [] },
  { id: "clientes", label: "Clientes/pacientes", keywords: ["clientes", "pacientes", "socios", "alumnos"], dependsOn: [], base: true },
  { id: "citas", label: "Reservas/citas", keywords: ["reservas", "citas", "agenda", "bookings", "appointments"], dependsOn: ["__resource_or_staff__"] },
  { id: "calendario", label: "Calendario", keywords: ["calendario"], dependsOn: ["citas"] },
  { id: "pagos", label: "Pagos", keywords: ["pagos", "cobros", "pasarela de pago", "payments"], dependsOn: ["servicios"] },
  { id: "facturacion", label: "Facturación", keywords: ["facturación", "facturas", "invoicing"], dependsOn: [] },
  { id: "bonos", label: "Bonos", keywords: ["bonos", "paquetes de sesiones"], dependsOn: ["servicios"] },
  { id: "membresias", label: "Membresías", keywords: ["membresías", "suscripciones", "cuotas de socio"], dependsOn: [] },
  { id: "documentos", label: "Documentos", keywords: ["documentos"], dependsOn: [] },
  { id: "expedientes", label: "Expedientes/historial clínico", keywords: ["expedientes", "historial clínico", "historial médico", "ficha clínica"], dependsOn: ["clientes"], requiresReinforcedPermissions: true },
  { id: "inventario", label: "Inventario", keywords: ["inventario", "stock"], dependsOn: [], requiresExplicitMention: true },
  { id: "servicios", label: "Servicios", keywords: ["servicios"], dependsOn: [] },
  { id: "profesionales", label: "Profesionales", keywords: ["profesionales", "especialistas", "dentistas", "odontólogos", "fisioterapeutas", "abogados", "veterinarios", "peluqueros", "estilistas", "mecánicos", "agentes", "profesores", "dentists", "therapists"], dependsOn: [] },
  { id: "recursos", label: "Recursos (pistas/salas/mesas)", keywords: ["pistas", "salas", "mesas", "recursos", "consultas", "cabinas"], dependsOn: [] },
  { id: "incidencias", label: "Incidencias", keywords: ["incidencias", "reclamaciones"], dependsOn: [] },
  { id: "soporte", label: "Soporte", keywords: ["soporte"], dependsOn: [], base: true },
  { id: "campanas", label: "Campañas", keywords: ["campañas", "marketing"], dependsOn: [] },
  { id: "crm", label: "CRM", keywords: ["crm"], dependsOn: ["clientes"] },
  { id: "leads", label: "Leads/captación", keywords: ["leads", "captación", "captacion"], dependsOn: [] },
  { id: "recordatorios", label: "Recordatorios", keywords: ["recordatorio"], dependsOn: ["citas"] },
  { id: "notificaciones", label: "Notificaciones", keywords: ["notificaciones"], dependsOn: [] },
  { id: "informes", label: "Informes", keywords: ["informes", "reportes", "analítica"], dependsOn: [] },
  { id: "dashboard", label: "Panel de administración", keywords: ["dashboard", "panel de administración", "panel de control"], dependsOn: [] },
  { id: "configuracion", label: "Configuración", keywords: ["configuración"], dependsOn: [], base: true },
  { id: "auditoria", label: "Auditoría", keywords: ["auditoría"], dependsOn: [] },
  { id: "backups", label: "Backups", keywords: ["backup", "copias de seguridad"], dependsOn: [] },
  { id: "consentimientos", label: "Consentimientos", keywords: ["consentimiento", "rgpd", "gdpr"], dependsOn: [] },
  { id: "contenidos", label: "Contenidos", keywords: ["contenidos", "blog"], dependsOn: [] },
  { id: "landing", label: "Landing", keywords: ["landing", "página web", "web premium", "website"], dependsOn: [] },
  { id: "pwa", label: "PWA", keywords: ["pwa", "app móvil", "aplicación móvil", "mobile app"], dependsOn: [] },
  { id: "formularios", label: "Formularios", keywords: ["formularios", "forms"], dependsOn: [] },
  { id: "torneos", label: "Torneos", keywords: ["torneos", "competiciones"], dependsOn: [] },
  { id: "ranking", label: "Ranking", keywords: ["ranking", "clasificación"], dependsOn: ["torneos"] },
]);

export const MODULE_IDS = Object.freeze(MODULE_CATALOG.map((m) => m.id));
export const BASE_MODULE_IDS = Object.freeze(MODULE_CATALOG.filter((m) => m.base).map((m) => m.id));

export function getModuleDefinition(id) {
  return MODULE_CATALOG.find((m) => m.id === id) || null;
}
