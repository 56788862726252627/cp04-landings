import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PRIVACY_CHECKLIST,
  SECTORS_REQUIRING_REGULATORY_REVIEW,
  requiresRegulatoryReview,
  classifyModuleSensitivity,
  buildRegulatoryNotice,
  MODULE_SENSITIVITY,
} from "./privacyChecklist.js";
import { CORE_MODULE_CATALOG } from "../modules/moduleRegistry.js";
import { SECTOR_PRESETS } from "../templates/presets.js";

test("el checklist de privacidad tiene al menos 8 controles técnicos", () => {
  assert.ok(PRIVACY_CHECKLIST.length >= 8);
  for (const item of PRIVACY_CHECKLIST) {
    assert.ok(item.id && item.label && item.category);
  }
});

test("todo módulo del catálogo genérico tiene una clasificación de sensibilidad", () => {
  for (const mod of CORE_MODULE_CATALOG) {
    assert.notEqual(classifyModuleSensitivity(mod.id), "unknown", `${mod.id} sin clasificar`);
  }
});

test("los 7 sectores regulados pedidos por la Fase 12 exigen revisión normativa", () => {
  assert.deepEqual([...SECTORS_REQUIRING_REGULATORY_REVIEW].sort(), [
    "dental", "fertility", "law", "physiotherapy", "psychology", "speech-therapy", "veterinary",
  ].sort());
  for (const sector of SECTORS_REQUIRING_REGULATORY_REVIEW) {
    assert.equal(requiresRegulatoryReview(sector), true);
  }
});

test("hair-salon y padel no exigen revisión normativa especial", () => {
  assert.equal(requiresRegulatoryReview("hair-salon"), false);
  assert.equal(requiresRegulatoryReview("padel"), false);
});

test("buildRegulatoryNotice nunca afirma cumplimiento, solo exige revisión humana", () => {
  const notice = buildRegulatoryNotice("psychology");
  assert.match(notice, /no implementa ni certifica cumplimiento/);
  assert.match(notice, /revisión por un profesional/);
  assert.equal(buildRegulatoryNotice("hair-salon"), null);
});

test("todos los presets de sector regulado producen un aviso normativo no nulo", () => {
  for (const preset of Object.values(SECTOR_PRESETS)) {
    if (preset.policies.regulatedSector) {
      assert.notEqual(buildRegulatoryNotice(preset.sector), null, `${preset.presetId} debería generar aviso`);
    }
  }
});

test("MODULE_SENSITIVITY marca pagos/clientes/documentos/formularios/configuracion como sensibilidad alta", () => {
  for (const id of ["pagos", "clientes", "documentos", "formularios", "configuracion", "control_acceso", "centro_tecnico"]) {
    assert.equal(MODULE_SENSITIVITY[id], "high", `${id} debería ser sensibilidad alta`);
  }
});
