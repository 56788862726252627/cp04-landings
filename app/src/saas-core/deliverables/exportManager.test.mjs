import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04CreateExportManager } from "./exportManager.js";

test("requestExport exige projectId", async () => {
  const manager = cp04CreateExportManager();
  const result = await manager.requestExport({ deliverableType: "contrato", format: "markdown", payload: {} });
  assert.equal(result.status, "failed");
});

test("requestExport rechaza un tipo de entregable desconocido", async () => {
  const manager = cp04CreateExportManager();
  const result = await manager.requestExport({ projectId: "p1", deliverableType: "no-existe", format: "markdown", payload: {} });
  assert.equal(result.status, "failed");
});

test("requestExport rechaza un formato desconocido", async () => {
  const manager = cp04CreateExportManager();
  const result = await manager.requestExport({ projectId: "p1", deliverableType: "contrato", format: "no-existe", payload: {} });
  assert.equal(result.status, "failed");
});

test("requestExport rechaza un formato no permitido para ese entregable (p. ej. mp4 para un contrato)", async () => {
  const manager = cp04CreateExportManager();
  const result = await manager.requestExport({ projectId: "p1", deliverableType: "contrato", format: "mp4", payload: {} });
  assert.equal(result.status, "failed");
  assert.match(result.reason, /no está permitido/);
});

test("requestExport de un contrato válido en markdown se completa y registra el asset", async () => {
  const manager = cp04CreateExportManager();
  const result = await manager.requestExport({
    projectId: "p1",
    deliverableType: "contrato",
    format: "markdown",
    payload: { partyA: "A", partyB: "B", effectiveDate: "2026-08-01", scope: "Alcance de prueba", name: "Contrato de prueba" },
  });
  assert.equal(result.status, "completed");
  assert.ok(result.assetId);
  assert.equal(result.folder, "Contratos");
  assert.equal(manager.registry.count(), 1);
});

test("requestExport de un mockup válido en svg se completa", async () => {
  const manager = cp04CreateExportManager();
  const result = await manager.requestExport({ projectId: "p1", deliverableType: "mockup_movil", format: "svg", payload: { deviceId: "movil", label: "Home" } });
  assert.equal(result.status, "completed");
  assert.equal(result.folder, "Mockups");
});

test("requestExport de un logotipo (pipeline preview) en svg se completa con contenido SVG real", async () => {
  const manager = cp04CreateExportManager();
  const result = await manager.requestExport({ projectId: "p1", deliverableType: "logotipo", format: "svg", payload: { label: "Mi Marca" } });
  assert.equal(result.status, "completed");
  assert.match(result.content, /<svg/);
});

test("requestExport de un logotipo en PNG devuelve not_implemented y NO registra ningún asset", async () => {
  const manager = cp04CreateExportManager();
  const result = await manager.requestExport({ projectId: "p1", deliverableType: "logotipo", format: "png", payload: { label: "Mi Marca" } });
  assert.equal(result.status, "not_implemented");
  assert.equal(manager.registry.count(), 0, "un entregable no completado nunca debe registrarse como asset");
});

test("requestExport de un contrato con datos inválidos falla y no registra nada", async () => {
  const manager = cp04CreateExportManager();
  const result = await manager.requestExport({ projectId: "p1", deliverableType: "contrato", format: "markdown", payload: { partyA: "Solo A" } });
  assert.equal(result.status, "failed");
  assert.equal(manager.registry.count(), 0);
});

test("requestExport de una presentación válida en markdown se completa", async () => {
  const manager = cp04CreateExportManager();
  const result = await manager.requestExport({
    projectId: "p1",
    deliverableType: "presentacion",
    format: "markdown",
    payload: { title: "Deck", slides: [{ title: "S1", bullets: ["a"] }], name: "Deck de prueba" },
  });
  assert.equal(result.status, "completed");
  assert.equal(result.folder, "Presentaciones");
});

test("requestExport de un informe (pipeline document) en html se completa", async () => {
  const manager = cp04CreateExportManager();
  const result = await manager.requestExport({
    projectId: "p1",
    deliverableType: "informe",
    format: "html",
    payload: { title: "Informe mensual", sections: [{ heading: "Resumen", body: "Todo correcto." }], name: "Informe" },
  });
  assert.equal(result.status, "completed");
  assert.equal(result.folder, "Informes");
});

test("dos ExportManager creados por separado tienen registros de assets aislados", async () => {
  const m1 = cp04CreateExportManager();
  const m2 = cp04CreateExportManager();
  await m1.requestExport({ projectId: "p1", deliverableType: "logotipo", format: "svg", payload: { label: "X" } });
  assert.equal(m1.registry.count(), 1);
  assert.equal(m2.registry.count(), 0);
});
