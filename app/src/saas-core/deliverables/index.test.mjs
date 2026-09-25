import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04CreateDeliverablesFactory } from "./index.js";

test("cp04CreateDeliverablesFactory devuelve exportManager, driveSyncManager y registry funcionales", () => {
  const factory = cp04CreateDeliverablesFactory();
  assert.equal(typeof factory.exportManager.requestExport, "function");
  assert.equal(typeof factory.driveSyncManager.enqueue, "function");
  assert.equal(typeof factory.registry.registerAsset, "function");
});

test("la sincronización con Drive está desactivada por defecto en la fábrica completa (coste 0€, sin conectar nada)", async () => {
  const factory = cp04CreateDeliverablesFactory({ env: {} });
  factory.driveSyncManager.enqueue({ folderPath: "X", fileName: "a.svg", content: "1" });
  const [result] = await factory.driveSyncManager.processQueue();
  assert.equal(result.status, "skipped_disabled");
});

test("un export completado a través de la fábrica queda en el mismo registro que usa exportManager", async () => {
  const factory = cp04CreateDeliverablesFactory();
  await factory.exportManager.requestExport({ projectId: "p1", deliverableType: "icono", format: "svg", payload: { label: "I" } });
  assert.equal(factory.registry.count(), 1);
});

test("dos fábricas creadas por separado están completamente aisladas entre sí", async () => {
  const f1 = cp04CreateDeliverablesFactory();
  const f2 = cp04CreateDeliverablesFactory();
  await f1.exportManager.requestExport({ projectId: "p1", deliverableType: "icono", format: "svg", payload: { label: "I" } });
  assert.equal(f1.registry.count(), 1);
  assert.equal(f2.registry.count(), 0);
});
