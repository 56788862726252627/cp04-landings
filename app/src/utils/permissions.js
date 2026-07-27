// Club Pádel 04 · RBAC por ACCIÓN (Prompt 8, Mejora 2.10).
//
// `rbac.js` ya resuelve correctamente una pregunta: "¿puede este rol abrir
// esta pantalla?" (cp04CanAccessSection). Ese gate está bien y no se toca ni
// se duplica aquí. La pregunta que faltaba, y que el Prompt 7 demostró que
// faltaba de verdad (Torneos: PLAYER veía y podía ejecutar los mismos
// controles de gestión que ADMIN dentro de una pantalla a la que ambos
// tienen acceso legítimo), es distinta: "¿puede este rol ejecutar ESTA
// ACCIÓN concreta dentro de una pantalla a la que ya tiene acceso?".
//
// Este módulo añade esa segunda capa, sin sustituir ni duplicar la primera:
// toda actionId sigue exigiendo el gate de módulo de rbac.js como condición
// necesaria (fail-closed), y solo añade una restricción extra para las
// pocas acciones donde de verdad hace falta (hoy: una sola,
// "tournaments:manage"). La inmensa mayoría de acciones de la app resuelven
// 1:1 con su módulo porque no hay ninguna pantalla con mezcla de roles
// aparte de Torneos — eso también es un resultado real de esta auditoría,
// no una omisión: se documenta explícitamente en vez de inventar
// restricciones que no existían.

import { cp04NormalizeRole, cp04CanAccessSection, CP04_ROLE_PERMISSIONS } from "./rbac.js";

// actionId -> moduleId (el mismo id de sección que usa CP04_ROLE_PERMISSIONS)
// o `null` si la acción no depende de ningún módulo protegido (login,
// cambiar idioma, cambiar de rol demo desde la pantalla de selección: son
// acciones previas a tener un rol, o transversales a todos los roles).
//
// Nota de inventario (FASE 2 del Prompt 8): "tournaments:join" y
// "community:moderate" se documentan aquí porque el prompt las pide en el
// inventario, aunque hoy no existe ningún handler real que las implemente
// (no hay botón "Inscribirse a torneo" en el código, y la moderación de
// Comunidad es una demo deliberadamente abierta a los 4 roles — ver
// ModeracionTab en ComunidadDemo.jsx, ya documentado en el propio JSX).
export const CP04_ACTION_MODULE_MAP = {
  // Autenticación y sesión
  "auth:login": null,
  "auth:logout": null,
  "auth:forgot_password": null,
  "auth:change_role_demo": null,
  "language:change": null,

  // Reservas
  "reservations:create": "reservas",
  "reservations:view": "reservas",
  "reservations:reprogram": "reprogramar",
  "reservations:cancel": "cancelar",
  "reservations:close_court": "cierre_pistas",
  "reservations:waitlist": "lista_espera",
  "reservations:qr_access": "control_qr",
  "reservations:availability": "calendario_disponibilidad",
  "reservations:court_reminders": "pistas_recordatorios",

  // Jugadores
  "players:create": "alta_jugador",
  "players:disable": "baja_jugador",

  // Torneos y ranking
  "tournaments:view": "torneos",
  "tournaments:join": "torneos",
  "tournaments:manage": "torneos",
  "ranking:view": "ranking",

  // Comunidad
  "community:view": "comunidad",
  "community:moderate": "comunidad",

  // Administración de negocio
  "admin:view_kpi": "admin",
  "admin:dashboard_kpi": "dashboard_kpi",
  "admin:billing": "facturacion_pagos",
  "admin:backups": "backups_seguridad",
  "admin:automation": "automatizaciones_bots",
  "admin:member_comms": "comunicaciones_socio",

  // Soporte técnico (separado explícitamente de administración de negocio)
  "support:technical_center": "flujos_make",
  "support:panel": "soporte",

  // Perfil (siempre sobre los propios datos, nunca los de terceros)
  "profile:view": "perfil",
  "profile:edit": "perfil",
};

// Restricción adicional por acción, más allá del gate de módulo. Cada rol
// listado aquí debe además tener acceso al módulo de CP04_ACTION_MODULE_MAP
// (fail-closed en las dos capas, no basta con estar en esta lista).
//
// tournaments:manage — hallazgo prioritario del Prompt 7: dentro de
// "torneos" los 4 roles pueden ver el mismo cuadro/parejas/ranking, pero
// crear, editar, eliminar, reordenar, autoasignar, publicar, marcar
// ganador, deshacer/rehacer y exportar son acciones de gestión que este
// prompt reserva a ADMIN por defecto (matriz de la FASE 7: STAFF no tiene
// ninguna necesidad operativa documentada sobre torneos más allá de
// consultar, y SUPPORT es explícitamente solo diagnóstico/observación).
export const CP04_ACTION_ROLE_OVERRIDE = {
  "tournaments:manage": ["ADMIN"],
};

// Acción desconocida (typo, actionId que no existe) = denegada, nunca
// "permitida por defecto". Mismo criterio fail-closed que cp04NormalizeRole.
export function cp04Can(role, actionId) {
  if (!Object.prototype.hasOwnProperty.call(CP04_ACTION_MODULE_MAP, actionId)) {
    return false;
  }
  const safeRole = cp04NormalizeRole(role);
  const moduleId = CP04_ACTION_MODULE_MAP[actionId];
  if (moduleId !== null && !cp04CanAccessSection(safeRole, moduleId)) {
    return false;
  }
  const override = CP04_ACTION_ROLE_OVERRIDE[actionId];
  if (override) {
    return override.includes(safeRole);
  }
  return true;
}

export function cp04CanAny(role, actionIds) {
  return (actionIds || []).some((actionId) => cp04Can(role, actionId));
}

export function cp04CanAll(role, actionIds) {
  return (actionIds || []).every((actionId) => cp04Can(role, actionId));
}

export function cp04GetAllowedModules(role) {
  const safeRole = cp04NormalizeRole(role);
  return CP04_ROLE_PERMISSIONS[safeRole] || CP04_ROLE_PERMISSIONS.PLAYER;
}

export function cp04GetAllowedActions(role) {
  return Object.keys(CP04_ACTION_MODULE_MAP).filter((actionId) => cp04Can(role, actionId));
}
