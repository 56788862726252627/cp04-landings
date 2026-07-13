import { test } from "node:test";
import assert from "node:assert/strict";
import { loadVerticalConfig } from "./loadVerticalConfig.js";

test("loadVerticalConfig() sin argumentos carga y valida config/vertical-config.padel.json", () => {
  const vertical = loadVerticalConfig();
  assert.equal(vertical.layer, "vertical");
  assert.equal(vertical.verticalId, "padel");
  assert.equal(vertical.resourceType, "pista");
  assert.equal(vertical.eventType, "torneo");
});

test("loadVerticalConfig() lanza si verticalId no cumple el pattern", () => {
  const vertical = loadVerticalConfig();
  const invalid = { ...vertical, verticalId: "Padel Club!" };
  assert.throws(() => loadVerticalConfig(invalid), /vertical-config inválido/);
});

test("loadVerticalConfig() lanza si roleLabels no cubre los 4 roles CORE", () => {
  const vertical = loadVerticalConfig();
  const { SUPPORT, ...incomplete } = vertical.roleLabels;
  assert.throws(() => loadVerticalConfig({ ...vertical, roleLabels: incomplete }), /vertical-config inválido/);
});
