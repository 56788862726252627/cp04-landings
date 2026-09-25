// Paso 09 · Fase 12 — Seguridad y privacidad por diseño.
//
// Controles TÉCNICOS y documentales únicamente. Este módulo NO afirma
// cumplimiento RGPD, sanitario, PCI, ni de ningún marco legal — eso
// requiere auditoría específica por un profesional cualificado, fuera de
// alcance de este paso. Su única función es dar visibilidad y forzar una
// bandera explícita en los sectores que la necesitan.

export const PRIVACY_CHECKLIST = Object.freeze([
  { id: "least_privilege", label: "Cada rol solo ve los módulos que necesita (mínimos privilegios)", category: "acceso" },
  { id: "role_based_routes", label: "Las rutas comprueban rol Y módulo activo antes de renderizar (assertRouteAllowed)", category: "acceso" },
  { id: "no_secrets_in_repo", label: "Ningún secreto/credencial vive en el repositorio; solo nombres de variables de entorno", category: "secretos" },
  { id: "synthetic_demo_data", label: "Los datos demo son sintéticos, no personas reales", category: "datos" },
  { id: "id_sanitization", label: "tenantId/slug se sanean (regex) antes de usarse como identificador o ruta de archivo", category: "datos" },
  { id: "tenant_provider_separation", label: "La configuración de tenant nunca incluye credenciales de proveedor, solo estado/envVars", category: "secretos" },
  { id: "logging_no_sensitive_data", label: "Cualquier logging futuro debe excluir PII/datos clínicos/legales reales", category: "observabilidad" },
  { id: "regulated_sector_flag", label: "Sectores regulados quedan marcados con policies.regulatedSector=true y bloquean el checklist de producción hasta revisión", category: "cumplimiento" },
]);

// Sectores que, por su naturaleza (salud, psicología, fertilidad, legal,
// veterinaria), requieren revisión normativa especializada ANTES de
// producción real. Ningún dato clínico/legal/financiero real debe
// introducirse en este sistema sin esa revisión.
export const SECTORS_REQUIRING_REGULATORY_REVIEW = Object.freeze([
  "dental", "physiotherapy", "speech-therapy", "psychology", "law", "fertility", "veterinary",
]);

export function requiresRegulatoryReview(sector) {
  return SECTORS_REQUIRING_REGULATORY_REVIEW.includes(sector);
}

export const MODULE_SENSITIVITY = Object.freeze({
  inicio: "low",
  agenda: "medium",
  citas: "medium",
  clientes: "high",
  profesionales: "medium",
  servicios: "low",
  recursos: "low",
  pagos: "high",
  automatizaciones: "medium",
  campanas: "medium",
  documentos: "high",
  formularios: "high",
  soporte: "medium",
  informes: "medium",
  configuracion: "high",
  torneos: "low",
  ranking: "low",
  control_acceso: "high",
  centro_tecnico: "high",
});

export function classifyModuleSensitivity(moduleId) {
  return MODULE_SENSITIVITY[moduleId] || "unknown";
}

/**
 * Texto de aviso obligatorio a mostrar en cualquier checklist de puesta en
 * producción para un tenant de sector regulado. Deliberadamente NO afirma
 * cumplimiento — solo exige revisión humana.
 */
export function buildRegulatoryNotice(sector) {
  if (!requiresRegulatoryReview(sector)) return null;
  return (
    `El sector "${sector}" maneja datos potencialmente sensibles (salud, ` +
    "situación legal o datos especialmente protegidos). Este núcleo SaaS " +
    "no implementa ni certifica cumplimiento RGPD/sanitario/legal " +
    "específico. Antes de producción real: revisión por un profesional " +
    "cualificado en protección de datos y normativa sectorial."
  );
}
