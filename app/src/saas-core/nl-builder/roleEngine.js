// Paso 11 · Fase 8 — Roles y permisos.
//
// Reutiliza los roles ya declarados por sectorLexicon.js (uno por sector,
// mismo orden que la petición humana esperaría verlos) y añade SOLO la
// matriz de permisos: qué módulos habilitados puede ver cada rol, aplicando
// mínimo privilegio. No inventa roles nuevos por negocio: cada rol de un
// preset se clasifica en un "tier" fijo y conocido, y el tier decide el
// conjunto de módulos accesibles.

import { getModuleDefinition } from "./moduleCatalog.js";

// Todo rol que aparece en algún preset de sectorLexicon.js (o en
// GENERIC_SECTOR_PRESET) debe tener una entrada aquí. Un rol desconocido
// (nunca debería ocurrir, pero nunca debe romper el pipeline) cae a
// "reception" por seguridad: acceso operativo, nunca administrativo ni a
// módulos con permisos reforzados.
export const ROLE_TIERS = Object.freeze({
  jugador: "client",
  paciente: "client",
  propietario: "client",
  cliente: "client",
  alumno: "client",
  comensal: "client",
  recepcion: "reception",
  sala: "reception",
  entrenador: "professional",
  dentista: "professional",
  veterinario: "professional",
  estilista: "professional",
  abogado: "professional",
  fisioterapeuta: "professional",
  profesor: "professional",
  mecanico: "professional",
  agente: "professional",
  administracion: "admin",
  direccion: "admin",
  soporte: "support",
});

const CLIENT_ALLOWED_MODULES = Object.freeze(["citas", "servicios", "documentos", "pwa", "landing"]);
const RECEPTION_ALLOWED_MODULES = Object.freeze([
  "citas", "clientes", "servicios", "recursos", "profesionales", "pagos", "facturacion",
  "bonos", "membresias", "recordatorios", "notificaciones", "incidencias", "formularios",
  "campanas", "leads", "crm", "calendario",
]);
const PROFESSIONAL_ALLOWED_MODULES = Object.freeze([
  "citas", "clientes", "servicios", "profesionales", "documentos", "expedientes",
  "recordatorios", "notificaciones", "informes", "calendario", "recursos",
]);
const SUPPORT_ALLOWED_MODULES = Object.freeze(["soporte", "incidencias", "notificaciones", "auditoria"]);

const ALLOWED_BY_TIER = Object.freeze({
  client: CLIENT_ALLOWED_MODULES,
  reception: RECEPTION_ALLOWED_MODULES,
  professional: PROFESSIONAL_ALLOWED_MODULES,
  support: SUPPORT_ALLOWED_MODULES,
  admin: "ALL",
});

export function getRoleTier(roleId) {
  return ROLE_TIERS[roleId] || "reception";
}

/**
 * Construye roles + matriz de permisos para un negocio. Determinista: mismo
 * preset + mismo conjunto de módulos habilitados ⇒ misma salida, en el
 * mismo orden que declara el preset.
 * @param {object} sectorPreset preset de sectorLexicon.js (o GENERIC_SECTOR_PRESET)
 * @param {{id: string, status: string}[]} resolvedModules salida de moduleDependencyEngine.resolveModules
 * @returns {{roles: string[], permissions: Record<string, string[]>, matrix: {role: string, tier: string, modules: string[]}[]}}
 */
export function buildRolesAndPermissions(sectorPreset, resolvedModules) {
  const enabledIds = resolvedModules.filter((m) => m.status === "enabled").map((m) => m.id);
  const roles = [...sectorPreset.roles];

  const permissions = {};
  const matrix = [];
  for (const role of roles) {
    const tier = getRoleTier(role);
    const allowed = ALLOWED_BY_TIER[tier];
    let modules;
    if (allowed === "ALL") {
      modules = [...enabledIds];
    } else {
      modules = enabledIds.filter((id) => {
        const def = getModuleDefinition(id);
        if (def?.requiresReinforcedPermissions && tier !== "professional" && tier !== "admin") return false;
        return allowed.includes(id);
      });
    }
    permissions[role] = modules;
    matrix.push({ role, tier, modules });
  }

  return { roles, permissions, matrix };
}
