import test from "node:test";
import assert from "node:assert/strict";

import { resolveTenantStatusScreen } from "./resolveTenantStatusScreen.js";

test("resolveTenantStatusScreen: active -> null (renderiza la app normal)", () => {
  assert.equal(resolveTenantStatusScreen({ status: "active" }), null);
});

test("resolveTenantStatusScreen: staging -> null (mismo tratamiento que active)", () => {
  assert.equal(resolveTenantStatusScreen({ status: "staging" }), null);
});

test("resolveTenantStatusScreen: disabled -> pantalla dedicada", () => {
  const screen = resolveTenantStatusScreen({ status: "disabled" });
  assert.equal(screen.title, "Servicio no disponible");
});

test("resolveTenantStatusScreen: maintenance -> pantalla dedicada", () => {
  const screen = resolveTenantStatusScreen({ status: "maintenance" });
  assert.equal(screen.title, "Mantenimiento programado");
});

test("resolveTenantStatusScreen: unknown_domain -> pantalla dedicada", () => {
  const screen = resolveTenantStatusScreen({ status: "unknown_domain" });
  assert.equal(screen.title, "Dominio no reconocido");
});
