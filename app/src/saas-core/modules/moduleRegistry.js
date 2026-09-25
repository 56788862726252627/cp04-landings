// Paso 09 · Fase 6 — Módulos y navegación configurables.
//
// Dos espacios de identificadores conviven a propósito:
//   1. Ids LEGACY de CP04 (p.ej. "alta_jugador", "flujos_make") — vienen
//      literalmente de src/utils/rbac.js y solo los usa el tenant por
//      defecto `club-padel-04`, para poder demostrar equivalencia exacta
//      con el comportamiento actual sin tocar App.jsx.
//   2. Ids del CATÁLOGO GENÉRICO (p.ej. "citas", "clientes") — los que
//      usan todas las plantillas/presets nuevos (Fase 4) para cualquier
//      sector. Un tenant generado por el CLI nunca usa ids legacy.
//
// Ambos espacios comparten el mismo motor de activación/permiso
// (isModuleEnabled/canAccessModule/assertRouteAllowed): el motor no sabe
// ni le importa de qué espacio de ids viene cada string, solo compara
// contra `tenant.modulesEnabled` y `tenant.permissions`.

export const MODULE_STATUS = Object.freeze({
  PREPARED: "prepared", // existe una implementación real para al menos un tenant (CP04)
  PENDING: "pending", // solo diseño/configuración, sin UI real todavía
});

export const MODULE_GROUPS = Object.freeze([
  "principal",
  "agenda",
  "personas",
  "operaciones",
  "automatizacion",
  "contenido",
  "soporte",
  "configuracion",
  "deportivo",
  "tecnico",
]);

// Roles genéricos del catálogo (independientes de los roles legacy de
// CP04). Cualquier plantilla/preset nuevo usa estos 4 roles; el tenant
// legacy `club-padel-04` sigue usando PLAYER/STAFF/ADMIN/SUPPORT.
export const GENERIC_ROLES = Object.freeze(["CLIENT", "STAFF", "ADMIN", "SUPPORT"]);

/**
 * Catálogo genérico mínimo pedido por la Fase 6. `verticalHint` documenta
 * de qué vertical es más natural el módulo, pero no restringe nada por sí
 * solo (eso lo deciden las plantillas al listar `modules` — Fase 4).
 * `defaultRoleTiers` es la recomendación genérica de qué roles ven el
 * módulo *si* la plantilla lo activa; las plantillas pueden decidir no
 * activar el módulo en absoluto, pero no reordenan la jerarquía de roles.
 */
export const CORE_MODULE_CATALOG = Object.freeze([
  { id: "inicio", group: "principal", status: MODULE_STATUS.PREPARED, verticalHint: "core", defaultRoleTiers: ["CLIENT", "STAFF", "ADMIN", "SUPPORT"] },
  { id: "agenda", group: "agenda", status: MODULE_STATUS.PREPARED, verticalHint: "core", defaultRoleTiers: ["STAFF", "ADMIN", "SUPPORT"] },
  { id: "citas", group: "agenda", status: MODULE_STATUS.PREPARED, verticalHint: "core", defaultRoleTiers: ["CLIENT", "STAFF", "ADMIN", "SUPPORT"] },
  { id: "clientes", group: "personas", status: MODULE_STATUS.PREPARED, verticalHint: "core", defaultRoleTiers: ["STAFF", "ADMIN", "SUPPORT"] },
  { id: "profesionales", group: "personas", status: MODULE_STATUS.PENDING, verticalHint: "core", defaultRoleTiers: ["ADMIN", "SUPPORT"] },
  { id: "servicios", group: "operaciones", status: MODULE_STATUS.PENDING, verticalHint: "core", defaultRoleTiers: ["CLIENT", "STAFF", "ADMIN", "SUPPORT"] },
  { id: "recursos", group: "operaciones", status: MODULE_STATUS.PREPARED, verticalHint: "core", defaultRoleTiers: ["STAFF", "ADMIN", "SUPPORT"] },
  { id: "pagos", group: "operaciones", status: MODULE_STATUS.PREPARED, verticalHint: "core", defaultRoleTiers: ["CLIENT", "STAFF", "ADMIN", "SUPPORT"] },
  { id: "automatizaciones", group: "automatizacion", status: MODULE_STATUS.PREPARED, verticalHint: "core", defaultRoleTiers: ["ADMIN", "SUPPORT"] },
  { id: "campanas", group: "contenido", status: MODULE_STATUS.PENDING, verticalHint: "core", defaultRoleTiers: ["ADMIN", "SUPPORT"] },
  { id: "documentos", group: "contenido", status: MODULE_STATUS.PENDING, verticalHint: "core", defaultRoleTiers: ["STAFF", "ADMIN", "SUPPORT"] },
  { id: "formularios", group: "contenido", status: MODULE_STATUS.PENDING, verticalHint: "core", defaultRoleTiers: ["STAFF", "ADMIN", "SUPPORT"] },
  { id: "soporte", group: "soporte", status: MODULE_STATUS.PREPARED, verticalHint: "core", defaultRoleTiers: ["STAFF", "ADMIN", "SUPPORT"] },
  { id: "informes", group: "configuracion", status: MODULE_STATUS.PREPARED, verticalHint: "core", defaultRoleTiers: ["ADMIN", "SUPPORT"] },
  { id: "configuracion", group: "configuracion", status: MODULE_STATUS.PREPARED, verticalHint: "core", defaultRoleTiers: ["ADMIN", "SUPPORT"] },
  { id: "torneos", group: "deportivo", status: MODULE_STATUS.PREPARED, verticalHint: "sports", defaultRoleTiers: ["CLIENT", "STAFF", "ADMIN", "SUPPORT"] },
  { id: "ranking", group: "deportivo", status: MODULE_STATUS.PREPARED, verticalHint: "sports", defaultRoleTiers: ["CLIENT", "STAFF", "ADMIN", "SUPPORT"] },
  { id: "control_acceso", group: "configuracion", status: MODULE_STATUS.PENDING, verticalHint: "core", defaultRoleTiers: ["ADMIN", "SUPPORT"] },
  { id: "centro_tecnico", group: "tecnico", status: MODULE_STATUS.PREPARED, verticalHint: "internal", defaultRoleTiers: ["SUPPORT"] },
]);

const CATALOG_BY_ID = new Map(CORE_MODULE_CATALOG.map((m) => [m.id, m]));

export function getModuleMeta(moduleId) {
  return CATALOG_BY_ID.get(moduleId) || null;
}

function normalizeRoleKey(tenant, role) {
  const roles = Array.isArray(tenant?.roles) ? tenant.roles : [];
  const value = String(role || "").trim();
  return roles.includes(value) ? value : null;
}

/** ¿Está el módulo habilitado para el tenant (sin mirar rol todavía)? */
export function isModuleEnabled(tenant, moduleId) {
  return Array.isArray(tenant?.modulesEnabled) && tenant.modulesEnabled.includes(moduleId);
}

/**
 * Ids habilitados para un rol: intersección de lo que el rol tiene
 * concedido (`tenant.permissions[role]`) con lo que el tenant tiene
 * activado (`tenant.modulesEnabled`). Cualquier id concedido a un rol pero
 * no declarado en modulesEnabled se descarta (fail-closed: un permiso
 * "huérfano" nunca habilita nada).
 */
export function getEnabledSectionsForRole(tenant, role) {
  const safeRole = normalizeRoleKey(tenant, role);
  if (!safeRole) return [];
  const granted = (tenant.permissions && tenant.permissions[safeRole]) || [];
  const enabled = new Set(tenant.modulesEnabled || []);
  return granted.filter((id) => enabled.has(id));
}

/** ¿Puede este rol acceder a este módulo, en este tenant, ahora mismo? */
export function canAccessModule(tenant, role, moduleId) {
  return getEnabledSectionsForRole(tenant, role).includes(moduleId);
}

/**
 * Guard de ruta: una URL directa a un módulo deshabilitado o sin permiso
 * de rol no debe "abrirse". Devuelve un veredicto explícito en vez de
 * lanzar, para que la UI decida (redirigir, mostrar 403, etc.).
 */
export function assertRouteAllowed(tenant, role, moduleId) {
  if (!tenant || typeof tenant !== "object") {
    return { allowed: false, reason: "no_tenant" };
  }
  if (!isModuleEnabled(tenant, moduleId)) {
    return { allowed: false, reason: "module_disabled" };
  }
  if (!canAccessModule(tenant, role, moduleId)) {
    return { allowed: false, reason: "role_not_permitted" };
  }
  return { allowed: true, reason: null };
}

/**
 * Navegación agrupada para el catálogo genérico: solo tiene sentido para
 * tenants generados por plantilla (ids del catálogo genérico). Para el
 * tenant legacy `club-padel-04` los ids no están en el catálogo y se
 * devuelven con group "legacy"/status "prepared" (ya funcionan en
 * producción vía App.jsx, fuera del catálogo genérico).
 */
export function buildSidebarNavigation(tenant, role) {
  const enabledIds = getEnabledSectionsForRole(tenant, role);
  return enabledIds.map((id) => {
    const meta = getModuleMeta(id);
    if (meta) return { id, ...meta };
    return { id, group: "legacy", status: MODULE_STATUS.PREPARED, verticalHint: "legacy" };
  });
}

/** Módulos "pending" nunca deben presentarse como operativos en UI. */
export function isModuleOperational(moduleId) {
  const meta = getModuleMeta(moduleId);
  return meta ? meta.status === MODULE_STATUS.PREPARED : false;
}

/**
 * Deriva un mapa {rol: [moduleId,...]} a partir de una lista de módulos
 * habilitados y de `defaultRoleTiers` del catálogo. Usado por las
 * plantillas (Fase 4) para no tener que escribir a mano 4 arrays de
 * permisos por plantilla — la jerarquía de roles es una sola fuente de
 * verdad en CORE_MODULE_CATALOG. Ids que no están en el catálogo (por
 * ejemplo ids legacy de CP04) se ignoran aquí a propósito.
 * @param {string[]} enabledModuleIds
 */
export function deriveGenericRolePermissions(enabledModuleIds) {
  const enabledSet = new Set(enabledModuleIds);
  const permissions = Object.fromEntries(GENERIC_ROLES.map((role) => [role, []]));
  for (const moduleMeta of CORE_MODULE_CATALOG) {
    if (!enabledSet.has(moduleMeta.id)) continue;
    for (const role of moduleMeta.defaultRoleTiers) {
      permissions[role].push(moduleMeta.id);
    }
  }
  return permissions;
}
