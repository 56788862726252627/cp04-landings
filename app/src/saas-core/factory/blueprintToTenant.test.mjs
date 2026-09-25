import { test } from "node:test";
import assert from "node:assert/strict";

import { blueprintToTenantConfig, buildNavigationPreview } from "./blueprintToTenant.js";
import { validateTenantConfig } from "../tenant/tenantSchema.js";
import { MINIMAL_BUSINESS_BLUEPRINT, FULL_BUSINESS_BLUEPRINT } from "./businessBlueprintExamples.js";
import { SECTOR_TEMPLATE_IDS } from "../templates/templates.js";
import { getTemplate } from "../templates/templates.js";

test("blueprintToTenantConfig produce un tenant.config.json que valida contra el esquema central", () => {
  const { tenantConfig } = blueprintToTenantConfig(FULL_BUSINESS_BLUEPRINT);
  const { valid, errors } = validateTenantConfig(tenantConfig);
  assert.equal(valid, true, JSON.stringify(errors));
  assert.equal(tenantConfig.tenantId, FULL_BUSINESS_BLUEPRINT.tenantId);
  assert.equal(tenantConfig.sector, "dental");
});

test("blueprintToTenantConfig con el blueprint mínimo también produce un tenant válido", () => {
  const { tenantConfig } = blueprintToTenantConfig(MINIMAL_BUSINESS_BLUEPRINT);
  const { valid, errors } = validateTenantConfig(tenantConfig);
  assert.equal(valid, true, JSON.stringify(errors));
});

test("blueprintToTenantConfig resuelve el preset correcto por sector (dental -> dental-clinic)", () => {
  const { base, sourceKind } = blueprintToTenantConfig(FULL_BUSINESS_BLUEPRINT);
  assert.equal(sourceKind, "preset");
  assert.equal(base.presetId, "dental-clinic");
});

test("blueprintToTenantConfig nunca escribe un valor en envVars, solo nombres", () => {
  const { tenantConfig } = blueprintToTenantConfig(FULL_BUSINESS_BLUEPRINT);
  for (const entry of Object.values(tenantConfig.integrations)) {
    for (const envVar of entry.envVars) {
      assert.doesNotMatch(envVar, /=.+/);
    }
  }
});

test("buildNavigationPreview devuelve navegación no vacía para ADMIN", () => {
  const { tenantConfig } = blueprintToTenantConfig(FULL_BUSINESS_BLUEPRINT);
  const nav = buildNavigationPreview(tenantConfig);
  assert.ok(Array.isArray(nav.ADMIN));
  assert.ok(nav.ADMIN.length > 0);
});

test("cada plantilla/sector conocido produce un tenant válido vía el puente (sin generar código específico)", () => {
  for (const templateId of SECTOR_TEMPLATE_IDS) {
    const template = getTemplate(templateId);
    const blueprint = {
      ...MINIMAL_BUSINESS_BLUEPRINT,
      businessId: `prueba-${templateId}`,
      tenantId: `prueba-${templateId}`,
      sector: template.sector,
    };
    const { tenantConfig } = blueprintToTenantConfig(blueprint);
    const { valid, errors } = validateTenantConfig(tenantConfig);
    assert.equal(valid, true, `${templateId}: ${JSON.stringify(errors)}`);
  }
});
