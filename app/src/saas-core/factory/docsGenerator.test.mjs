import { test } from "node:test";
import assert from "node:assert/strict";

import { buildReadme, buildQuickGuide, buildOnboarding, buildTechnicalChecklist, buildCommercialChecklist } from "./docsGenerator.js";
import { blueprintToTenantConfig, buildNavigationPreview } from "./blueprintToTenant.js";
import { FULL_BUSINESS_BLUEPRINT } from "./businessBlueprintExamples.js";

const { tenantConfig, base } = blueprintToTenantConfig(FULL_BUSINESS_BLUEPRINT);
const navigationByRole = buildNavigationPreview(tenantConfig);

test("buildReadme nunca afirma 'listo para producción' sin evidencia", () => {
  const readme = buildReadme({ blueprint: FULL_BUSINESS_BLUEPRINT, tenantConfig, navigationByRole });
  assert.doesNotMatch(readme, /listo para producci[oó]n/i);
});

test("buildReadme etiqueta la sección generada automáticamente", () => {
  const readme = buildReadme({ blueprint: FULL_BUSINESS_BLUEPRINT, tenantConfig, navigationByRole });
  assert.match(readme, /\[GENERADO AUTOMÁTICAMENTE\]/);
});

test("buildTechnicalChecklist incluye aviso normativo para sector regulado (dental)", () => {
  const checklist = buildTechnicalChecklist({ blueprint: FULL_BUSINESS_BLUEPRINT, tenantConfig, base });
  assert.match(checklist, /PENDIENTE LEGAL\/REGULATORIO/);
  assert.match(checklist, /revisión por un profesional cualificado/i);
});

test("buildTechnicalChecklist marca cada integración como pendiente de proveedor externo", () => {
  const checklist = buildTechnicalChecklist({ blueprint: FULL_BUSINESS_BLUEPRINT, tenantConfig, base });
  for (const provider of Object.keys(tenantConfig.integrations)) {
    assert.match(checklist, new RegExp(`Conectar ${provider}`));
  }
});

test("buildCommercialChecklist marca el negocio como no validado con cliente real", () => {
  const checklist = buildCommercialChecklist({ blueprint: FULL_BUSINESS_BLUEPRINT });
  assert.match(checklist, /\[NO VALIDADO\]/);
});

test("buildQuickGuide y buildOnboarding producen contenido no vacío", () => {
  assert.ok(buildQuickGuide({ blueprint: FULL_BUSINESS_BLUEPRINT }).length > 20);
  assert.ok(buildOnboarding({ blueprint: FULL_BUSINESS_BLUEPRINT }).length > 20);
});
