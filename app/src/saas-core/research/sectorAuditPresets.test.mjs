import { test } from "node:test";
import assert from "node:assert/strict";

import { SECTOR_AUDIT_PRESETS, GENERIC_AUDIT_PRESET, AUDIT_SECTOR_IDS, getSectorAuditPreset } from "./sectorAuditPresets.js";
import { SECTOR_PRESET_IDS } from "../nl-builder/sectorLexicon.js";
import { DIMENSION_IDS } from "./dimensionRegistry.js";

test("AUDIT_SECTOR_IDS coincide 1:1 con SECTOR_PRESET_IDS de Paso 11 (no inventa sectores nuevos)", () => {
  assert.deepEqual([...AUDIT_SECTOR_IDS], [...SECTOR_PRESET_IDS]);
});

test("existe un preset de auditoría para cada uno de los 10 sectores de Paso 11", () => {
  for (const id of SECTOR_PRESET_IDS) {
    assert.ok(SECTOR_AUDIT_PRESETS[id], `falta preset de auditoría para ${id}`);
  }
});

test("cada preset declara solo dimensiones prioritarias que existen en el registro de 45", () => {
  for (const preset of Object.values(SECTOR_AUDIT_PRESETS)) {
    for (const dim of preset.priorityDimensions) {
      assert.ok(DIMENSION_IDS.includes(dim), `dimensión desconocida en preset ${preset.presetId}: ${dim}`);
    }
  }
});

test("los sectores regulados (dental/fisio/veterinaria/abogados) llevan nota prudente y exclusión de asesoramiento definitivo", () => {
  for (const id of ["dental", "physiotherapy", "veterinary", "law"]) {
    const preset = SECTOR_AUDIT_PRESETS[id];
    assert.ok(preset.prudentNote, `${id} debería tener prudentNote`);
    assert.ok(preset.mustNotAutoInfer.length > 0, `${id} debería excluir inferencias automáticas`);
  }
});

test("getSectorAuditPreset devuelve el preset genérico para 'generic-local-service' y null para un id desconocido", () => {
  assert.equal(getSectorAuditPreset("generic-local-service"), GENERIC_AUDIT_PRESET);
  assert.equal(getSectorAuditPreset("sector-inventado"), null);
});

test("getSectorAuditPreset('padel-sports') prioriza reservas y conversión, coherente con el sector", () => {
  const preset = getSectorAuditPreset("padel-sports");
  assert.ok(preset.priorityDimensions.includes("bookingCapability"));
  assert.ok(preset.categoryWeights.conversion > 1);
});
