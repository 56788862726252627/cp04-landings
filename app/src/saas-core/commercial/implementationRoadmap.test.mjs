import { test } from "node:test";
import assert from "node:assert/strict";

import { buildImplementationRoadmap } from "./implementationRoadmap.js";
import { computeIntegrationReadiness } from "./integrationReadiness.js";

test("sin integrationsReadiness: solo pasos de módulos del perfil, en orden", () => {
  const roadmap = buildImplementationRoadmap({ profileId: "restaurante" });
  assert.ok(roadmap.steps.length > 0);
  assert.equal(roadmap.steps[0].order, 1);
  assert.equal(roadmap.steps.every((s) => s.type === "module"), true);
});

test("con integrationsReadiness: se añaden pasos de bloqueo tras los módulos, con detail y nextSteps", () => {
  const readiness = computeIntegrationReadiness({});
  const roadmap = buildImplementationRoadmap({ profileId: "restaurante", integrationsReadiness: readiness });
  const blockerSteps = roadmap.steps.filter((s) => s.type === "integration_blocker");
  assert.ok(blockerSteps.length > 0);
  assert.ok(blockerSteps[0].detail);
  assert.ok(blockerSteps[0].nextSteps.length > 0);
});

test("totalEstimatedWeeks suma solo los pasos de módulo (los bloqueos de integración no tienen semanas estimadas)", () => {
  const roadmap = buildImplementationRoadmap({ profileId: "restaurante" });
  const moduleWeeks = roadmap.steps.filter((s) => s.type === "module").reduce((sum, s) => sum + s.estimatedWeeks, 0);
  assert.equal(roadmap.totalEstimatedWeeks, moduleWeeks);
});

test("es determinista", () => {
  const readiness = computeIntegrationReadiness({});
  const a = buildImplementationRoadmap({ profileId: "clinica", integrationsReadiness: readiness });
  const b = buildImplementationRoadmap({ profileId: "clinica", integrationsReadiness: readiness });
  assert.deepEqual(a, b);
});

test("perfil desconocido/nulo cae en genérico sin lanzar", () => {
  const roadmap = buildImplementationRoadmap({});
  assert.equal(roadmap.profileId, "generic");
});
