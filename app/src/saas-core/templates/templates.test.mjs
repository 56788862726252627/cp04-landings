import { test } from "node:test";
import assert from "node:assert/strict";
import { SECTOR_TEMPLATES, SECTOR_TEMPLATE_IDS, getTemplate } from "./templates.js";
import { SECTOR_PRESETS, SECTOR_PRESET_IDS, getPreset } from "./presets.js";
import { validateTenantConfig, KNOWN_BUSINESS_TYPES, KNOWN_SECTORS } from "../tenant/tenantSchema.js";
import { CORE_MODULE_CATALOG, GENERIC_ROLES } from "../modules/moduleRegistry.js";
import { findLeakedSportsTerms, buildTerminology } from "../terminology/terminology.js";
import { findUnknownCapabilities } from "../automations/capabilityMap.js";

const CATALOG_IDS = new Set(CORE_MODULE_CATALOG.map((m) => m.id));

test("existen exactamente las 7 plantillas base pedidas", () => {
  assert.deepEqual([...SECTOR_TEMPLATE_IDS].sort(), [
    "beauty-salon", "healthcare-clinic", "local-service", "padel-club",
    "professional-services", "sports-club", "veterinary-clinic",
  ].sort());
});

test("existen exactamente los 8 presets pedidos", () => {
  assert.deepEqual([...SECTOR_PRESET_IDS].sort(), [
    "dental-clinic", "fertility-clinic", "hair-salon",
    "law-firm", "physiotherapy-clinic", "psychology-practice", "speech-therapy", "veterinarian",
  ].sort());
});

test("cada plantilla declara businessType y sector dentro de las listas conocidas del esquema", () => {
  for (const template of Object.values(SECTOR_TEMPLATES)) {
    assert.ok(KNOWN_BUSINESS_TYPES.includes(template.businessType), `${template.templateId}: businessType desconocido`);
    assert.ok(KNOWN_SECTORS.includes(template.sector), `${template.templateId}: sector desconocido`);
  }
});

test("cada módulo listado por una plantilla existe en el catálogo genérico", () => {
  for (const template of Object.values(SECTOR_TEMPLATES)) {
    for (const moduleId of template.modules) {
      assert.ok(CATALOG_IDS.has(moduleId), `${template.templateId}: módulo desconocido "${moduleId}"`);
    }
  }
});

test("ninguna plantilla activa centro_tecnico por defecto (es interno de agencia, no de cliente)", () => {
  for (const template of Object.values(SECTOR_TEMPLATES)) {
    assert.ok(!template.modules.includes("centro_tecnico"), `${template.templateId} no debería activar centro_tecnico`);
  }
});

test("las plantillas no deportivas no filtran terminología de pádel", () => {
  for (const template of Object.values(SECTOR_TEMPLATES)) {
    if (template.sector === "padel" || template.sector === "sports") continue;
    const { dictionary } = buildTerminology(template.terminologyOverrides);
    const offenders = findLeakedSportsTerms(template.sector, dictionary);
    assert.deepEqual(offenders, [], `${template.templateId} filtra vocabulario de pádel: ${offenders.join(", ")}`);
  }
});

test("cada plantilla recomienda solo capacidades de automatización conocidas", () => {
  for (const template of Object.values(SECTOR_TEMPLATES)) {
    const unknown = findUnknownCapabilities(template.recommendedAutomationCapabilities);
    assert.deepEqual(unknown, [], `${template.templateId}: capacidades desconocidas ${unknown.join(", ")}`);
  }
});

test("cada plantilla define permisos para los 4 roles genéricos", () => {
  for (const template of Object.values(SECTOR_TEMPLATES)) {
    assert.deepEqual(Object.keys(template.permissions).sort(), [...GENERIC_ROLES].sort());
  }
});

test("un tenant construido a partir de cada plantilla valida contra el esquema central", () => {
  for (const template of Object.values(SECTOR_TEMPLATES)) {
    const tenantConfig = {
      schemaVersion: 1,
      tenantId: `demo-${template.templateId}`,
      slug: `demo-${template.templateId}`,
      legalName: `Demo ${template.name}`,
      displayName: `Demo ${template.name}`,
      businessType: template.businessType,
      sector: template.sector,
      locale: "es-ES",
      timezone: "Europe/Madrid",
      currency: "EUR",
      country: "ES",
      roles: template.roles,
      permissions: template.permissions,
      modulesEnabled: template.modules,
    };
    const { valid, errors } = validateTenantConfig(tenantConfig);
    assert.deepEqual(errors, [], `plantilla ${template.templateId} genera un tenant inválido`);
    assert.equal(valid, true);
  }
});

test("getTemplate/getPreset devuelven null (no lanzan) para ids inexistentes", () => {
  assert.equal(getTemplate("no-existe"), null);
  assert.equal(getPreset("no-existe"), null);
});

// --- Presets ---

test("cada preset hereda módulos y permisos EXACTOS de su plantilla base (sin duplicar)", () => {
  for (const preset of Object.values(SECTOR_PRESETS)) {
    const base = getTemplate(preset.baseTemplateId);
    assert.deepEqual(preset.modules, base.modules, `${preset.presetId}: módulos divergen de la base`);
    assert.deepEqual(preset.permissions, base.permissions, `${preset.presetId}: permisos divergen de la base`);
  }
});

test("los 5 presets clínicos/legal/fertilidad quedan marcados como sector regulado con revisión de privacidad obligatoria", () => {
  const regulated = ["dental-clinic", "physiotherapy-clinic", "speech-therapy", "psychology-practice", "law-firm", "fertility-clinic", "veterinarian"];
  for (const id of regulated) {
    const preset = getPreset(id);
    assert.equal(preset.policies.regulatedSector, true, `${id} debería estar marcado como regulado`);
    assert.equal(preset.policies.privacyReviewRequired, true, `${id} debería requerir revisión de privacidad`);
  }
});

test("hair-salon (peluquería) no se marca como sector regulado", () => {
  assert.equal(getPreset("hair-salon").policies.regulatedSector, false);
});

test("ningún preset introduce un módulo fuera del catálogo genérico", () => {
  for (const preset of Object.values(SECTOR_PRESETS)) {
    for (const moduleId of preset.modules) {
      assert.ok(CATALOG_IDS.has(moduleId), `${preset.presetId}: módulo desconocido "${moduleId}"`);
    }
  }
});

test("los presets de salud/legal/veterinaria no muestran terminología de pádel", () => {
  for (const preset of Object.values(SECTOR_PRESETS)) {
    const offenders = findLeakedSportsTerms(preset.sector, preset.terminology);
    assert.deepEqual(offenders, [], `${preset.presetId} filtra vocabulario de pádel: ${offenders.join(", ")}`);
  }
});

test("un tenant construido a partir de cada preset valida contra el esquema central", () => {
  for (const preset of Object.values(SECTOR_PRESETS)) {
    const tenantConfig = {
      schemaVersion: 1,
      tenantId: `demo-${preset.presetId}`,
      slug: `demo-${preset.presetId}`,
      legalName: `Demo ${preset.name}`,
      displayName: `Demo ${preset.name}`,
      businessType: preset.businessType,
      sector: preset.sector,
      locale: "es-ES",
      timezone: "Europe/Madrid",
      currency: "EUR",
      country: "ES",
      roles: preset.roles,
      permissions: preset.permissions,
      modulesEnabled: preset.modules,
      policies: preset.policies,
    };
    const { valid, errors } = validateTenantConfig(tenantConfig);
    assert.deepEqual(errors, [], `preset ${preset.presetId} genera un tenant inválido`);
    assert.equal(valid, true);
  }
});
