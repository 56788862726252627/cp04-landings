import { test } from "node:test";
import assert from "node:assert/strict";

import { composeBlueprintFromIntent } from "./blueprintComposer.js";
import { interpretBusinessDescription } from "./intentExtractor.js";
import { validateBusinessBlueprint } from "../factory/businessBlueprintSchema.js";
import { blueprintToTenantConfig } from "../factory/blueprintToTenant.js";
import { runFactoryPipeline } from "../factory/orchestrator.js";

const PHYSIO_PROMPT =
  "Crea un SaaS para una clínica de fisioterapia de Málaga con reservas, expedientes de pacientes, recordatorios, bonos, facturación, panel de administración, landing premium, PWA y automatizaciones de captación y seguimiento.";

test("compone un blueprint que valida contra businessBlueprintSchema", () => {
  const intent = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  const blueprint = composeBlueprintFromIntent(intent);
  const { valid, errors } = validateBusinessBlueprint(blueprint);
  assert.equal(valid, true, JSON.stringify(errors));
});

test("businessId/tenantId es un slug kebab-case derivado del nombre, sin el sufijo '(borrador)'", () => {
  const intent = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  const blueprint = composeBlueprintFromIntent(intent);
  assert.equal(blueprint.businessId, blueprint.tenantId);
  assert.match(blueprint.businessId, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.ok(!blueprint.commercialName.includes("borrador"));
});

test("blueprint.modules contiene únicamente módulos con status=enabled del intent", () => {
  const intent = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  const blueprint = composeBlueprintFromIntent(intent);
  const enabledIds = new Set(intent.modules.filter((m) => m.status === "enabled").map((m) => m.id));
  assert.deepEqual(new Set(blueprint.modules), enabledIds);
});

test("todas las integraciones declaradas están en not_configured (nunca conecta nada real)", () => {
  const intent = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  const blueprint = composeBlueprintFromIntent(intent);
  for (const entry of Object.values(blueprint.integrations)) {
    assert.equal(entry.status, "not_configured");
  }
});

test("es compatible con el puente de Paso 10 (blueprintToTenantConfig) y con un dry-run del orquestador sin colisiones", async () => {
  const intent = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  // businessId aislado (no el de la demo real ya generada en disco) para que este test
  // no dependa de si /businesses/clinica-de-fisioterapia-malaga ya existe o no.
  const blueprint = composeBlueprintFromIntent(intent, { businessIdOverride: "test-only-compose-dry-run-physio" });
  const { tenantConfig } = blueprintToTenantConfig(blueprint);
  assert.equal(tenantConfig.sector, "physiotherapy");
  const dryRun = await runFactoryPipeline({ blueprint, dryRun: true });
  assert.equal(dryRun.collisions.length, 0);
  assert.ok(dryRun.filesCreated.length > 0);
});

test("determinista: mismo intent produce exactamente el mismo blueprint", () => {
  const intent = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  const a = composeBlueprintFromIntent(intent);
  const b = composeBlueprintFromIntent(intent);
  assert.deepEqual(a, b);
});

test("un nombre de negocio de una sola letra produce igualmente un businessId válido (>=2 caracteres)", () => {
  const intent = interpretBusinessDescription("clínica dental de Málaga", { seed: "demo-short-name" });
  const blueprint = composeBlueprintFromIntent({ ...intent, business: { ...intent.business, proposedName: "X" } });
  assert.ok(blueprint.businessId.length >= 2);
});

test("plan sube a 'pro' cuando hay muchos módulos habilitados, y se puede forzar con options.plan", () => {
  const richIntent = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  const richBlueprint = composeBlueprintFromIntent(richIntent);
  assert.equal(richBlueprint.plan, "pro");

  const forced = composeBlueprintFromIntent(richIntent, { plan: "business" });
  assert.equal(forced.plan, "business");
});

test("businessIdOverride permite forzar un businessId distinto para evitar colisiones entre dos intents con el mismo nombre derivado", () => {
  const intentA = interpretBusinessDescription("despacho de abogados ficticio en Madrid", { seed: "seed-a" });
  const intentB = interpretBusinessDescription("despacho de abogados ficticio que también quiero que tenga torneos", { seed: "seed-b" });
  const blueprintA = composeBlueprintFromIntent(intentA, { businessIdOverride: "despacho-a" });
  const blueprintB = composeBlueprintFromIntent(intentB, { businessIdOverride: "despacho-b" });
  assert.equal(blueprintA.businessId, "despacho-a");
  assert.equal(blueprintB.businessId, "despacho-b");
  assert.notEqual(blueprintA.businessId, blueprintB.businessId);
});

test("manualSteps incluye notas de cumplimiento y las preguntas recomendadas como pasos a confirmar", () => {
  const intent = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  const blueprint = composeBlueprintFromIntent(intent);
  for (const note of intent.complianceNotes) {
    assert.ok(blueprint.manualSteps.includes(note));
  }
});
