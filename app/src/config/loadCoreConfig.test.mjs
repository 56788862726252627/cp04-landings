import { test } from "node:test";
import assert from "node:assert/strict";
import { loadCoreConfig } from "./loadCoreConfig.js";

test("loadCoreConfig() sin argumentos carga y valida config/core-config.default.json", () => {
  const core = loadCoreConfig();
  assert.equal(core.layer, "core");
  assert.deepEqual(core.roles, ["PLAYER", "STAFF", "ADMIN", "SUPPORT"]);
  assert.equal(core.featureDefaults.pagos, false);
  assert.equal(core.featureDefaults.ia, false);
  assert.equal(core.featureDefaults.whatsapp, false);
});

test("loadCoreConfig() acepta un objeto ya parseado (inyección de dependencia)", () => {
  const core = loadCoreConfig();
  const same = loadCoreConfig(core);
  assert.deepEqual(same, core);
});

test("loadCoreConfig() lanza si el documento no valida contra el schema", () => {
  const invalid = { schemaVersion: "1.0.0", layer: "core" }; // faltan required
  assert.throws(() => loadCoreConfig(invalid), /core-config inválido/);
});

test("loadCoreConfig() lanza si roles incluye un valor fuera del enum", () => {
  const core = loadCoreConfig();
  const invalid = { ...core, roles: [...core.roles, "OWNER"] };
  assert.throws(() => loadCoreConfig(invalid), /core-config inválido/);
});
