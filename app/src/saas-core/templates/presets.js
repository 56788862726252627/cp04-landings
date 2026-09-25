// Paso 09 · Fase 4 — Presets sectoriales derivados de las plantillas base.
//
// Un preset NUNCA redefine módulos desde cero: hereda `modules` (y por
// tanto `permissions`, derivados de la misma jerarquía de roles genérica)
// de su plantilla base y solo sobrescribe terminología, servicios típicos,
// campos opcionales, recomendaciones e indicadores de revisión normativa.

import { getTemplate } from "./templates.js";
import { buildTerminology } from "../terminology/terminology.js";

const REGULATED_SECTORS = Object.freeze(["dental", "physiotherapy", "speech-therapy", "psychology", "law", "fertility", "veterinary"]);

function definePreset({
  presetId,
  baseTemplateId,
  name,
  sector,
  terminologyOverrides = {},
  commonServices,
  optionalFields,
  recommendedAutomationCapabilities,
  recommendedIntegrations,
  dashboards,
  demoData,
  launchChecklistExtra = [],
}) {
  const base = getTemplate(baseTemplateId);
  if (!base) throw new Error(`Preset "${presetId}" referencia una plantilla base inexistente: "${baseTemplateId}"`);

  const mergedTerminologyOverrides = { ...base.terminologyOverrides, ...terminologyOverrides };
  const { dictionary, ignoredKeys } = buildTerminology(mergedTerminologyOverrides);
  if (ignoredKeys.length > 0) {
    throw new Error(`Preset "${presetId}" tiene claves de terminología inválidas: ${ignoredKeys.join(", ")}`);
  }

  return Object.freeze({
    presetId,
    baseTemplateId,
    name,
    businessType: base.businessType,
    sector,
    modules: base.modules, // heredado, sin duplicar
    roles: base.roles,
    permissions: base.permissions, // heredado de la misma jerarquía genérica
    terminologyOverrides: Object.freeze(mergedTerminologyOverrides),
    terminology: Object.freeze(dictionary),
    commonServices: Object.freeze([...(commonServices || base.commonServices)]),
    optionalFields: Object.freeze([...(optionalFields || base.optionalFields)]),
    recommendedAutomationCapabilities: Object.freeze([...(recommendedAutomationCapabilities || base.recommendedAutomationCapabilities)]),
    recommendedIntegrations: Object.freeze([...(recommendedIntegrations || base.recommendedIntegrations)]),
    dashboards: Object.freeze([...(dashboards || base.dashboards)]),
    demoData: Object.freeze({ ...base.demoData, ...(demoData || {}) }),
    launchChecklist: Object.freeze([...base.launchChecklist, ...launchChecklistExtra]),
    policies: Object.freeze({
      privacyReviewRequired: REGULATED_SECTORS.includes(sector),
      regulatedSector: REGULATED_SECTORS.includes(sector),
      sensitiveDataCategories: REGULATED_SECTORS.includes(sector) ? ["salud_o_legal_placeholder"] : [],
    }),
  });
}

export const SECTOR_PRESETS = Object.freeze({
  "dental-clinic": definePreset({
    presetId: "dental-clinic",
    baseTemplateId: "healthcare-clinic",
    name: "Clínica dental",
    sector: "dental",
    terminologyOverrides: {
      customer: { singular: "paciente", plural: "pacientes", short: "Paciente" },
      staff: { singular: "dentista", plural: "dentistas", short: "Dentista" },
      organization: { singular: "clínica dental", plural: "clínicas dentales", short: "Clínica dental" },
    },
    commonServices: ["Revisión general", "Limpieza dental", "Ortodoncia (consulta)"],
    launchChecklistExtra: ["Revisión normativa sanitaria/odontológica antes de producción"],
  }),

  "physiotherapy-clinic": definePreset({
    presetId: "physiotherapy-clinic",
    baseTemplateId: "healthcare-clinic",
    name: "Clínica de fisioterapia",
    sector: "physiotherapy",
    terminologyOverrides: {
      staff: { singular: "fisioterapeuta", plural: "fisioterapeutas", short: "Fisio" },
      organization: { singular: "clínica de fisioterapia", plural: "clínicas de fisioterapia", short: "Clínica" },
    },
    commonServices: ["Sesión de fisioterapia", "Valoración inicial", "Rehabilitación deportiva"],
    launchChecklistExtra: ["Revisión normativa sanitaria antes de producción"],
  }),

  "speech-therapy": definePreset({
    presetId: "speech-therapy",
    baseTemplateId: "healthcare-clinic",
    name: "Logopedia",
    sector: "speech-therapy",
    terminologyOverrides: {
      staff: { singular: "logopeda", plural: "logopedas", short: "Logopeda" },
      organization: { singular: "consulta de logopedia", plural: "consultas de logopedia", short: "Consulta" },
    },
    commonServices: ["Sesión de logopedia", "Evaluación inicial del lenguaje"],
    launchChecklistExtra: ["Revisión normativa sanitaria antes de producción"],
  }),

  "psychology-practice": definePreset({
    presetId: "psychology-practice",
    baseTemplateId: "healthcare-clinic",
    name: "Consulta de psicología",
    sector: "psychology",
    terminologyOverrides: {
      staff: { singular: "psicólogo/a", plural: "psicólogos/as", short: "Psicólogo/a" },
      resource: { singular: "sala de consulta", plural: "salas de consulta", short: "Sala" },
      organization: { singular: "consulta de psicología", plural: "consultas de psicología", short: "Consulta" },
    },
    commonServices: ["Primera sesión", "Sesión de seguimiento", "Terapia de pareja"],
    launchChecklistExtra: ["Revisión normativa de salud mental/datos sensibles antes de producción"],
  }),

  "law-firm": definePreset({
    presetId: "law-firm",
    baseTemplateId: "professional-services",
    name: "Despacho de abogados",
    sector: "law",
    terminologyOverrides: {
      customer: { singular: "cliente", plural: "clientes", short: "Cliente" },
      staff: { singular: "abogado/a", plural: "abogados/as", short: "Abogado/a" },
      resource: { singular: "despacho", plural: "despachos", short: "Despacho" },
      organization: { singular: "despacho de abogados", plural: "despachos de abogados", short: "Despacho" },
    },
    commonServices: ["Consulta inicial", "Representación en procedimiento", "Revisión de contrato"],
    launchChecklistExtra: ["Revisión normativa de secreto profesional/protección de datos antes de producción"],
  }),

  "fertility-clinic": definePreset({
    presetId: "fertility-clinic",
    baseTemplateId: "healthcare-clinic",
    name: "Clínica de fertilidad",
    sector: "fertility",
    terminologyOverrides: {
      staff: { singular: "especialista en fertilidad", plural: "especialistas en fertilidad", short: "Especialista" },
      organization: { singular: "clínica de fertilidad", plural: "clínicas de fertilidad", short: "Clínica" },
    },
    commonServices: ["Primera consulta", "Seguimiento de tratamiento", "Prueba diagnóstica"],
    launchChecklistExtra: ["Revisión normativa sanitaria de alta sensibilidad antes de producción (dato clínico especialmente protegido)"],
  }),

  "hair-salon": definePreset({
    presetId: "hair-salon",
    baseTemplateId: "beauty-salon",
    name: "Peluquería",
    sector: "hair-salon",
    terminologyOverrides: {
      staff: { singular: "peluquero/a", plural: "peluqueros/as", short: "Peluquero/a" },
      organization: { singular: "peluquería", plural: "peluquerías", short: "Peluquería" },
    },
    commonServices: ["Corte", "Peinado", "Coloración"],
  }),

  veterinarian: definePreset({
    presetId: "veterinarian",
    baseTemplateId: "veterinary-clinic",
    name: "Veterinario independiente",
    sector: "veterinary",
    terminologyOverrides: {
      organization: { singular: "consulta veterinaria", plural: "consultas veterinarias", short: "Consulta" },
    },
    demoData: { sampleStaff: 1 },
    launchChecklistExtra: ["Revisión normativa veterinaria antes de producción"],
  }),
});

export const SECTOR_PRESET_IDS = Object.freeze(Object.keys(SECTOR_PRESETS));

export function getPreset(presetId) {
  return SECTOR_PRESETS[presetId] || null;
}
