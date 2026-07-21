import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  parseCliArgs,
  resolvePromptFromArgs,
  resolveSeedFromArgs,
  resolveAnswersFromArgs,
  loadIntentFromFile,
  renderIntentInFormat,
  writeOutputIfRequested,
  writeRequestArtifacts,
  resolveRequestDir,
  hasBlockingAmbiguities,
  interpretBusinessDescription,
  composeBlueprintFromIntent,
  NlBuilderCliError,
  DEFAULT_NL_REQUESTS_DIR,
} from "./nlBuilderCli.mjs";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "nl-builder-cli-test-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("resolvePromptFromArgs con --prompt devuelve el texto tal cual", async () => {
  const text = await resolvePromptFromArgs(parseCliArgs(["--prompt", "clínica dental de Málaga"]));
  assert.equal(text, "clínica dental de Málaga");
});

test("resolvePromptFromArgs con --prompt-file lee el archivo", async () => {
  await withTempDir(async (dir) => {
    const filePath = path.join(dir, "request.txt");
    await writeFile(filePath, "clínica dental de Málaga con reservas", "utf8");
    const text = await resolvePromptFromArgs(parseCliArgs(["--prompt-file", filePath]));
    assert.equal(text, "clínica dental de Málaga con reservas");
  });
});

test("resolvePromptFromArgs con --demo=<id> resuelve una de las 8 demos", async () => {
  const text = await resolvePromptFromArgs(parseCliArgs(["--demo", "club-padel"]));
  assert.match(text, /pádel/i);
});

test("resolvePromptFromArgs sin ningún flag lanza NlBuilderCliError", async () => {
  await assert.rejects(() => resolvePromptFromArgs(parseCliArgs([])), NlBuilderCliError);
});

test("resolveSeedFromArgs usa 'default-seed' si no se indica --seed", () => {
  assert.equal(resolveSeedFromArgs(parseCliArgs([])), "default-seed");
  assert.equal(resolveSeedFromArgs(parseCliArgs(["--seed", "demo-001"])), "demo-001");
});

test("resolveAnswersFromArgs sin --answers devuelve un objeto vacío", async () => {
  assert.deepEqual(await resolveAnswersFromArgs(parseCliArgs([])), {});
});

test("resolveAnswersFromArgs con --answers=<json inválido> lanza NlBuilderCliError legible", async () => {
  await withTempDir(async (dir) => {
    const filePath = path.join(dir, "answers.json");
    await writeFile(filePath, "no es json", "utf8");
    await assert.rejects(() => resolveAnswersFromArgs(parseCliArgs(["--answers", filePath])), NlBuilderCliError);
  });
});

test("resolveAnswersFromArgs con --answers=<json válido> devuelve el objeto parseado", async () => {
  await withTempDir(async (dir) => {
    const filePath = path.join(dir, "answers.json");
    await writeFile(filePath, JSON.stringify({ "business.sector": "dental" }), "utf8");
    const answers = await resolveAnswersFromArgs(parseCliArgs(["--answers", filePath]));
    assert.deepEqual(answers, { "business.sector": "dental" });
  });
});

test("loadIntentFromFile rechaza un intent corrupto/JSON inválido con NlBuilderCliError", async () => {
  await withTempDir(async (dir) => {
    const filePath = path.join(dir, "intent.json");
    await writeFile(filePath, "{ corrupto", "utf8");
    await assert.rejects(() => loadIntentFromFile(filePath), NlBuilderCliError);
  });
});

test("loadIntentFromFile rechaza un JSON válido que no es un Business Intent válido", async () => {
  await withTempDir(async (dir) => {
    const filePath = path.join(dir, "intent.json");
    await writeFile(filePath, JSON.stringify({ foo: "bar" }), "utf8");
    await assert.rejects(() => loadIntentFromFile(filePath), NlBuilderCliError);
  });
});

test("loadIntentFromFile carga un intent válido generado por interpretBusinessDescription", async () => {
  await withTempDir(async (dir) => {
    const intent = interpretBusinessDescription("clínica dental de Málaga", { seed: "s1" });
    const filePath = path.join(dir, "intent.json");
    await writeFile(filePath, JSON.stringify(intent), "utf8");
    const loaded = await loadIntentFromFile(filePath);
    assert.equal(loaded.requestId, intent.requestId);
  });
});

test("renderIntentInFormat soporta json/markdown/summary y rechaza un formato desconocido", () => {
  const intent = interpretBusinessDescription("clínica dental de Málaga", { seed: "s1" });
  assert.doesNotThrow(() => JSON.parse(renderIntentInFormat(intent, "json")));
  assert.match(renderIntentInFormat(intent, "markdown"), /^# Business Intent/);
  assert.match(renderIntentInFormat(intent, "summary"), /Confianza global/);
  assert.throws(() => renderIntentInFormat(intent, "xml"), NlBuilderCliError);
});

test("writeOutputIfRequested no escribe nada si no se pasa --output", async () => {
  const result = await writeOutputIfRequested(parseCliArgs([]), "contenido");
  assert.equal(result, null);
});

test("writeOutputIfRequested escribe SOLO en la ruta explícita indicada por el usuario", async () => {
  await withTempDir(async (dir) => {
    const outPath = path.join(dir, "nested", "out.json");
    const result = await writeOutputIfRequested(parseCliArgs(["--output", outPath]), "contenido-de-prueba");
    assert.equal(result, outPath);
    assert.equal(await readFile(outPath, "utf8"), "contenido-de-prueba");
  });
});

test("resolveRequestDir usa el directorio controlado de Paso 11 por defecto, distinto de saas-core/businesses", () => {
  const dir = resolveRequestDir("negocio-demo");
  assert.equal(dir, path.join(DEFAULT_NL_REQUESTS_DIR, "negocio-demo"));
  assert.ok(!dir.includes(path.join("saas-core", "businesses")));
});

test("writeRequestArtifacts escribe intent.json y business.blueprint.json dentro del directorio del negocio", async () => {
  await withTempDir(async (dir) => {
    const intent = interpretBusinessDescription("clínica dental de Málaga", { seed: "s1" });
    const blueprint = composeBlueprintFromIntent(intent);
    const result = await writeRequestArtifacts({ businessId: blueprint.businessId, intent, blueprint, baseDir: dir });
    assert.equal(result.dir, path.join(dir, blueprint.businessId));
    const writtenIntent = JSON.parse(await readFile(result.intentPath, "utf8"));
    assert.equal(writtenIntent.requestId, intent.requestId);
    const writtenBlueprint = JSON.parse(await readFile(result.blueprintPath, "utf8"));
    assert.equal(writtenBlueprint.businessId, blueprint.businessId);
  });
});

test("hasBlockingAmbiguities detecta correctamente una ambigüedad bloqueante", () => {
  const withBlocking = interpretBusinessDescription("clínica dental ficticia con pagos pero sin pagos online", { seed: "s1" });
  const withoutBlocking = interpretBusinessDescription("clínica dental de Málaga con reservas y pagos", { seed: "s1" });
  assert.equal(hasBlockingAmbiguities(withBlocking), true);
  assert.equal(hasBlockingAmbiguities(withoutBlocking), false);
});
