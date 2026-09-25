import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GENERIC_AUTOMATION_CAPABILITIES,
  findUnknownCapabilities,
  describeCapability,
} from "./capabilityMap.js";
import { MAKE_INVENTORY } from "../../data/makeInventory.js";

test("la matriz de 50 flujos de Club Pádel 04 sigue intacta (solo lectura desde este paso)", () => {
  assert.equal(MAKE_INVENTORY.length, 50);
});

test("catálogo de 17 capacidades genéricas pedidas por la Fase 11", () => {
  const expected = [
    "alta_cliente", "baja_cliente", "confirmacion", "cancelacion", "recordatorio",
    "seguimiento", "pago", "impago", "encuesta", "recuperacion", "campana",
    "documento", "alerta", "backup", "auditoria", "soporte", "fidelizacion",
  ];
  assert.deepEqual([...GENERIC_AUTOMATION_CAPABILITIES].sort(), [...expected].sort());
});

test("findUnknownCapabilities detecta capacidades inventadas sin lanzar", () => {
  assert.deepEqual(findUnknownCapabilities(["pago", "teletransporte"]), ["teletransporte"]);
  assert.deepEqual(findUnknownCapabilities(["pago", "recordatorio"]), []);
});

test("describeCapability nunca marca una capacidad como conectada", () => {
  const desc = describeCapability("pago");
  assert.equal(desc.connected, false);
  assert.equal(desc.recommendedProvider, "payments");
  assert.equal(describeCapability("no-existe"), null);
});
