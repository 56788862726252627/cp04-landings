import { test } from "node:test";
import assert from "node:assert/strict";

import { interpretBusinessDescription } from "./intentExtractor.js";
import { validateBusinessIntent } from "./businessIntentSchema.js";

const PHYSIO_PROMPT =
  "Crea un SaaS para una clínica de fisioterapia de Málaga con reservas, expedientes de pacientes, recordatorios, bonos, facturación, panel de administración, landing premium, PWA y automatizaciones de captación y seguimiento.";

test("produce siempre un Business Intent que valida contra el schema", () => {
  const intent = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  const { valid, errors } = validateBusinessIntent(intent);
  assert.equal(valid, true, JSON.stringify(errors));
});

test("determinista: mismo texto + mismo seed produce el mismo requestId y el mismo intent completo", () => {
  const a = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  const b = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  assert.equal(a.requestId, b.requestId);
  assert.deepEqual(a, b);
});

test("distinto seed produce distinto requestId (aunque el resto del intent sea idéntico)", () => {
  const a = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "seed-a" });
  const b = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "seed-b" });
  assert.notEqual(a.requestId, b.requestId);
});

test("detecta correctamente sector, ciudad y módulos explícitos de la petición de fisioterapia", () => {
  const intent = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  assert.equal(intent.business.sector, "physiotherapy");
  assert.equal(intent.business.locations[0].city, "Málaga");
  const explicitIds = intent.requestedFeatures.map((f) => f.id);
  assert.ok(explicitIds.includes("citas"));
  assert.ok(explicitIds.includes("expedientes"));
});

test("entrada vacía nunca lanza y produce un intent con ambigüedad bloqueante", () => {
  const intent = interpretBusinessDescription("", { seed: "demo-empty" });
  assert.ok(intent.ambiguities.some((a) => a.blocking === true));
  const { valid } = validateBusinessIntent(intent);
  assert.equal(valid, true);
});

test("entrada extremadamente larga nunca lanza (se trunca de forma segura)", () => {
  const longText = "clínica dental de Málaga con reservas. ".repeat(500);
  const intent = interpretBusinessDescription(longText, { seed: "demo-long" });
  assert.equal(intent.generationMetadata.truncatedInput, true);
  const { valid } = validateBusinessIntent(intent);
  assert.equal(valid, true);
});

test("caracteres especiales/inyección de formato no rompen la interpretación", () => {
  const weirdText = "Crea un SaaS para \"clínica\" <script>alert(1)</script> con reservas 😀 & recordatorios";
  const intent = interpretBusinessDescription(weirdText, { seed: "demo-weird" });
  const { valid } = validateBusinessIntent(intent);
  assert.equal(valid, true);
});

test("inglés básico se detecta como language=en", () => {
  const intent = interpretBusinessDescription("Create a saas for a dental clinic in London with bookings and reminders", { seed: "demo-en" });
  assert.equal(intent.language, "en");
});

test("--answers resuelve una ambigüedad y elimina la pregunta recomendada correspondiente", () => {
  const ambiguousText = "quiero un software para gestionar mi negocio";
  const without = interpretBusinessDescription(ambiguousText, { seed: "demo-answers" });
  const sectorAmbiguityBefore = without.ambiguities.some((a) => a.field === "business.sector");
  assert.ok(sectorAmbiguityBefore);

  const withAnswers = interpretBusinessDescription(ambiguousText, { seed: "demo-answers", answers: { "business.sector": "dental" } });
  assert.ok(!withAnswers.ambiguities.some((a) => a.field === "business.sector"));
  assert.ok(withAnswers.assumptions.some((a) => a.field === "business.sector" && a.assumedValue === "dental"));
});

test("un módulo fuera de lo recomendado pedido explícitamente aparece en modules con confianza reducida y ambigüedad asociada", () => {
  const intent = interpretBusinessDescription("despacho de abogados que también quiero que tenga torneos y ranking", { seed: "demo-out-of-sector" });
  const torneos = intent.modules.find((m) => m.id === "torneos");
  assert.ok(torneos);
  assert.equal(torneos.status, "enabled");
  assert.ok(torneos.confidence <= 0.5);
  assert.ok(intent.ambiguities.some((a) => a.field === "modules.torneos"));
});

test("nunca incluye secretos ni valores de credenciales en el intent generado", () => {
  const intent = interpretBusinessDescription(PHYSIO_PROMPT, { seed: "demo-001" });
  const flat = JSON.stringify(intent);
  assert.ok(!/sk_live|sk_test|whsec_|AIza|xox[baprs]-/.test(flat));
  for (const provider of Object.values(intent.integrations)) {
    assert.equal(provider.status, "not_configured");
  }
});
