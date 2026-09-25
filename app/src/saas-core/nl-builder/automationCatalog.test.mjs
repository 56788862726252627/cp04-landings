import { test } from "node:test";
import assert from "node:assert/strict";

import { AUTOMATION_CATALOG, recommendAutomations } from "./automationCatalog.js";
import { GENERIC_AUTOMATION_CAPABILITIES } from "../automations/capabilityMap.js";
import { getSectorPresetById } from "./sectorLexicon.js";

test("cada automatización del catálogo usa una capacidad genérica ya existente en capabilityMap.js", () => {
  for (const automation of AUTOMATION_CATALOG) {
    assert.ok(GENERIC_AUTOMATION_CAPABILITIES.includes(automation.capability), `${automation.id}: capacidad desconocida "${automation.capability}"`);
  }
});

test("cada automatización trae los campos mínimos exigidos por el Paso 11", () => {
  for (const a of AUTOMATION_CATALOG) {
    for (const field of ["trigger", "conditions", "actions", "dataNeeded", "errorHandling", "idempotency", "logs", "priority", "qualitativeROI", "recommendedImplementation", "testData"]) {
      assert.ok(a[field] !== undefined, `${a.id}: falta el campo ${field}`);
    }
    assert.ok(["aplicación", "app", "backend", "worker", "serverless", "make", "manual"].includes(a.recommendedImplementation), `${a.id}: implementación desconocida "${a.recommendedImplementation}"`);
  }
});

test("recommendAutomations para fisioterapia con citas habilitadas propone recordatorios y confirmación, sin duplicados", () => {
  const physio = getSectorPresetById("physiotherapy");
  const modules = [{ id: "citas", status: "enabled" }, { id: "clientes", status: "enabled" }];
  const result = recommendAutomations(modules, physio);
  const ids = result.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length, "no debe haber duplicados");
  assert.ok(ids.includes("confirmacion_reserva"));
  assert.ok(ids.includes("recordatorio_24h"));
});

test("recommendAutomations no propone automatizaciones cuyo módulo requerido no está habilitado", () => {
  const law = getSectorPresetById("law");
  const modules = [{ id: "documentos", status: "enabled" }];
  const result = recommendAutomations(modules, law);
  assert.ok(!result.some((a) => a.requiredModules.includes("citas")));
});

test("recommendAutomations es determinista (mismo input -> mismo orden)", () => {
  const physio = getSectorPresetById("physiotherapy");
  const modules = [{ id: "citas", status: "enabled" }, { id: "clientes", status: "enabled" }, { id: "servicios", status: "enabled" }];
  const a = recommendAutomations(modules, physio).map((x) => x.id);
  const b = recommendAutomations(modules, physio).map((x) => x.id);
  assert.deepEqual(a, b);
});

test("las automatizaciones de alta prioridad aparecen antes que las de baja prioridad", () => {
  const physio = getSectorPresetById("physiotherapy");
  const modules = [{ id: "citas", status: "enabled" }, { id: "clientes", status: "enabled" }, { id: "servicios", status: "enabled" }];
  const result = recommendAutomations(modules, physio);
  const priorityRank = { alta: 0, media: 1, baja: 2 };
  for (let i = 1; i < result.length; i++) {
    assert.ok(priorityRank[result[i - 1].priority] <= priorityRank[result[i].priority]);
  }
});
