import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CP04_DELIVERABLE_TYPES,
  CP04_DELIVERABLE_TYPE_IDS,
  cp04GetDeliverableType,
  cp04IsFormatValidForDeliverable,
  cp04ListDeliverablesByPipeline,
} from "./deliverablesCatalog.js";
import { CP04_EXPORT_FORMAT_IDS } from "./exportFormats.js";

const EXPECTED_TYPES = [
  "contrato", "propuesta_comercial",
  "mockup_movil", "mockup_tablet", "mockup_escritorio", "mockup_android", "mockup_iphone", "mockup_ipad", "mockup_windows", "mockup_macos",
  "logotipo", "icono", "fondo", "banner",
  "presentacion", "manual", "informe", "documentacion_tecnica", "documentacion_comercial",
];

test("existen exactamente los 19 tipos de entregable pedidos por el enunciado", () => {
  assert.equal(CP04_DELIVERABLE_TYPE_IDS.length, EXPECTED_TYPES.length);
  for (const id of EXPECTED_TYPES) assert.ok(CP04_DELIVERABLE_TYPES[id], `falta el entregable "${id}"`);
});

test("cada entregable declara al menos un formato, y todos son formatos reales del registro de exportación", () => {
  for (const id of CP04_DELIVERABLE_TYPE_IDS) {
    const type = CP04_DELIVERABLE_TYPES[id];
    assert.ok(type.formats.length > 0, `${id} no declara ningún formato`);
    for (const format of type.formats) {
      assert.ok(CP04_EXPORT_FORMAT_IDS.includes(format), `${id} declara un formato inexistente: "${format}"`);
    }
  }
});

test("cada entregable declara un pipeline y una carpeta de Drive", () => {
  for (const id of CP04_DELIVERABLE_TYPE_IDS) {
    const type = CP04_DELIVERABLE_TYPES[id];
    assert.ok(type.pipeline, `${id} no declara pipeline`);
    assert.ok(type.folder, `${id} no declara folder`);
  }
});

test("los 8 mockups de dispositivo usan el pipeline 'mockup'", () => {
  const mockups = cp04ListDeliverablesByPipeline("mockup");
  assert.equal(mockups.length, 8);
});

test("cp04IsFormatValidForDeliverable rechaza un formato no permitido para ese entregable", () => {
  assert.equal(cp04IsFormatValidForDeliverable("contrato", "markdown"), true);
  assert.equal(cp04IsFormatValidForDeliverable("contrato", "mp4"), false);
  assert.equal(cp04IsFormatValidForDeliverable("no-existe", "markdown"), false);
});

test("cp04GetDeliverableType devuelve null para un tipo inexistente", () => {
  assert.equal(cp04GetDeliverableType("no-existe"), null);
});
