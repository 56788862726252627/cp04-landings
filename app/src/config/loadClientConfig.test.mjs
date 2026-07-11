import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadClientConfig } from "./loadClientConfig.js";
import { repoPath } from "./paths.js";

function loadJson(...segments) {
  return JSON.parse(readFileSync(repoPath(...segments), "utf8"));
}

test("loadClientConfig() lanza sin argumentos — no hay cliente por defecto", () => {
  assert.throws(() => loadClientConfig(), /requiere una ruta o un objeto/);
});

test("loadClientConfig() carga config/client-config.example.valid.json (Club Pádel 04, cliente real)", () => {
  const client = loadClientConfig(repoPath("config", "client-config.example.valid.json"));
  assert.equal(client.tenantId, "cp04");
  assert.equal(client.slug, "club-padel-04");
  assert.equal(client.features.pagos, false); // declarado explícitamente en el ejemplo real
});

test("loadClientConfig() rechaza config/client-config.example.invalid.json (10 violaciones conocidas)", () => {
  const raw = loadJson("config", "client-config.example.invalid.json");
  assert.throws(() => loadClientConfig(raw), /client-config inválido/);
});

test("loadClientConfig() acepta el fixture del segundo club técnico (no real)", () => {
  const client = loadClientConfig(repoPath("fixtures", "tenant-config", "valid-second-club-fixture.client-config.json"));
  assert.equal(client.tenantId, "fixture-club-02");
  assert.match(client.brand.name, /FIXTURE TÉCNICO/);
});
