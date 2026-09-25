import { test } from "node:test";
import assert from "node:assert/strict";

import { DEMO_REQUESTS, FICTIONAL_MARKER_PATTERN } from "./demoRequests.js";
import { interpretBusinessDescription } from "./intentExtractor.js";
import { composeBlueprintFromIntent } from "./blueprintComposer.js";
import { validateBusinessIntent } from "./businessIntentSchema.js";
import { validateBusinessBlueprint } from "../factory/businessBlueprintSchema.js";
import { runFactoryPipeline } from "../factory/orchestrator.js";

test("las 8 demos producen siempre un intent y un blueprint válidos, de punta a punta", () => {
  assert.equal(DEMO_REQUESTS.length, 8);
  for (const demo of DEMO_REQUESTS) {
    const intent = interpretBusinessDescription(demo.prompt, { seed: demo.seed });
    const { valid: intentValid, errors: intentErrors } = validateBusinessIntent(intent);
    assert.equal(intentValid, true, `[${demo.id}] intent inválido: ${JSON.stringify(intentErrors)}`);

    const blueprint = composeBlueprintFromIntent(intent);
    const { valid: blueprintValid, errors: blueprintErrors } = validateBusinessBlueprint(blueprint);
    assert.equal(blueprintValid, true, `[${demo.id}] blueprint inválido: ${JSON.stringify(blueprintErrors)}`);
  }
});

test("cada demo produce el mismo intent y el mismo blueprint en dos ejecuciones (determinismo)", () => {
  for (const demo of DEMO_REQUESTS) {
    const intentA = interpretBusinessDescription(demo.prompt, { seed: demo.seed });
    const intentB = interpretBusinessDescription(demo.prompt, { seed: demo.seed });
    assert.deepEqual(intentA, intentB, `[${demo.id}] el intent no es determinista`);

    const blueprintA = composeBlueprintFromIntent(intentA);
    const blueprintB = composeBlueprintFromIntent(intentB);
    assert.deepEqual(blueprintA, blueprintB, `[${demo.id}] el blueprint no es determinista`);
  }
});

test("todas las demos son idempotentes contra el orquestador de Paso 10 (dos dry-run consecutivos: mismo resultado)", async () => {
  for (const demo of DEMO_REQUESTS) {
    const intent = interpretBusinessDescription(demo.prompt, { seed: demo.seed });
    const blueprint = composeBlueprintFromIntent(intent);
    const first = await runFactoryPipeline({ blueprint, dryRun: true });
    const second = await runFactoryPipeline({ blueprint, dryRun: true });
    assert.deepEqual(first.filesCreated.sort(), second.filesCreated.sort(), `[${demo.id}] dry-run no determinista`);
    assert.equal(first.collisions.length, 0, `[${demo.id}] no debería haber colisiones en un dry-run limpio`);
  }
});

test("demo E (ambigua): tiene menor confianza y al menos una ambigüedad no bloqueante de sector", () => {
  const demo = DEMO_REQUESTS.find((d) => d.id === "ambiguo");
  const intent = interpretBusinessDescription(demo.prompt, { seed: demo.seed });
  assert.ok(intent.confidence.overall < 0.6, `confianza demasiado alta para una petición ambigua: ${intent.confidence.overall}`);
  assert.ok(intent.ambiguities.some((a) => a.field === "business.sector"));
});

test("demo F (contradictoria): produce al menos una ambigüedad BLOQUEANTE sobre pagos", () => {
  const demo = DEMO_REQUESTS.find((d) => d.id === "contradictorio");
  const intent = interpretBusinessDescription(demo.prompt, { seed: demo.seed });
  assert.ok(intent.ambiguities.some((a) => a.blocking === true && a.field === "modules.pagos"));
});

test("demo G (módulos no recomendados): torneos/ranking se aceptan por ser explícitos, con confianza reducida y ambigüedad asociada; inventario NO aparece (nunca se pidió)", () => {
  const demo = DEMO_REQUESTS.find((d) => d.id === "modulos-no-recomendados");
  const intent = interpretBusinessDescription(demo.prompt, { seed: demo.seed });
  const inventario = intent.modules.find((m) => m.id === "inventario");
  assert.equal(inventario, undefined, "inventario no debería aparecer: nunca se mencionó en la petición");
  const torneos = intent.modules.find((m) => m.id === "torneos");
  assert.equal(torneos.status, "enabled");
  assert.equal(torneos.source, "explicit");
  assert.ok(torneos.confidence <= 0.5);
  assert.ok(intent.ambiguities.some((a) => a.field === "modules.torneos"));
});

test("demo H (inglés): se detecta language=en y el sector dental igualmente", () => {
  const demo = DEMO_REQUESTS.find((d) => d.id === "ingles");
  const intent = interpretBusinessDescription(demo.prompt, { seed: demo.seed });
  assert.equal(intent.language, "en");
  assert.equal(intent.business.sector, "dental");
});

test("demo A (club de pádel): detecta el sector padel y los módulos de torneos/ranking explícitos", () => {
  const demo = DEMO_REQUESTS.find((d) => d.id === "club-padel");
  const intent = interpretBusinessDescription(demo.prompt, { seed: demo.seed });
  assert.equal(intent.business.sector, "padel");
  assert.ok(intent.modules.some((m) => m.id === "torneos" && m.status === "enabled"));
});

test("demo D (restaurante): usa el sector restaurant (nuevo en Paso 11) y terminología de mesas/comensales", () => {
  const demo = DEMO_REQUESTS.find((d) => d.id === "restaurante");
  const intent = interpretBusinessDescription(demo.prompt, { seed: demo.seed });
  assert.equal(intent.business.sector, "restaurant");
  assert.ok(intent.entities.includes("mesa"));
});

test("ninguna demo contiene datos personales reales identificables ni secretos en el prompt fuente", () => {
  for (const demo of DEMO_REQUESTS) {
    assert.match(demo.prompt, FICTIONAL_MARKER_PATTERN, `[${demo.id}] el prompt debería dejar claro que el negocio es ficticio (o ser deliberadamente ambiguo)`);
    assert.ok(!/sk_live|sk_test|whsec_|AIza|xox[baprs]-/.test(demo.prompt));
  }
});
