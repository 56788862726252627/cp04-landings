import { test } from "node:test";
import assert from "node:assert/strict";

import { SECTOR_LEXICON, SECTOR_PRESET_IDS, GENERIC_SECTOR_PRESET, matchSectorPreset, getSectorPresetById } from "./sectorLexicon.js";
import { KNOWN_SECTORS } from "../tenant/tenantSchema.js";

test("hay exactamente 10 presets sectoriales, según el Paso 11", () => {
  assert.equal(SECTOR_LEXICON.length, 10);
});

test("cada preset (incluido el genérico) resuelve a un sector conocido por tenantSchema", () => {
  for (const preset of [...SECTOR_LEXICON, GENERIC_SECTOR_PRESET]) {
    assert.ok(KNOWN_SECTORS.includes(preset.blueprintSector), `${preset.presetId}: sector desconocido "${preset.blueprintSector}"`);
    for (const variant of preset.sectorVariants || []) {
      assert.ok(KNOWN_SECTORS.includes(variant.blueprintSector), `${preset.presetId}: variante con sector desconocido "${variant.blueprintSector}"`);
    }
  }
});

test("cada preset trae actores, entidades, módulos, roles, procesos y automatizaciones sugeridas no vacíos", () => {
  for (const preset of SECTOR_LEXICON) {
    assert.ok(preset.actors.length > 0, preset.presetId);
    assert.ok(preset.entities.length > 0, preset.presetId);
    assert.ok(preset.recommendedModules.length > 0, preset.presetId);
    assert.ok(preset.roles.length > 0, preset.presetId);
    assert.ok(preset.processes.length > 0, preset.presetId);
    assert.ok(preset.automationHints.length > 0, preset.presetId);
    assert.ok(Array.isArray(preset.doNotAutoAdd), preset.presetId);
  }
});

test("matchSectorPreset detecta clínica dental por palabra clave", () => {
  const { preset, blueprintSector, matchedKeywords } = matchSectorPreset("clínica dental de málaga con tres dentistas");
  assert.equal(preset.presetId, "dental");
  assert.equal(blueprintSector, "dental");
  assert.ok(matchedKeywords >= 1);
});

test("matchSectorPreset distingue la variante 'sports' de 'padel' por texto", () => {
  const { blueprintSector } = matchSectorPreset("queremos gestionar un polideportivo municipal");
  assert.equal(blueprintSector, "sports");
});

test("matchSectorPreset resuelve pádel explícito a sector padel", () => {
  const { blueprintSector } = matchSectorPreset("club de pádel con tres pistas");
  assert.equal(blueprintSector, "padel");
});

test("matchSectorPreset cae al preset genérico cuando no hay coincidencias", () => {
  const { preset, matchedKeywords } = matchSectorPreset("un negocio muy raro sin ningún término conocido");
  assert.equal(preset.presetId, "generic-local-service");
  assert.equal(matchedKeywords, 0);
});

test("matchSectorPreset detecta restaurante, academia, taller e inmobiliaria (sectores nuevos de Paso 11)", () => {
  assert.equal(matchSectorPreset("un restaurante familiar en el centro").blueprintSector, "restaurant");
  assert.equal(matchSectorPreset("una academia de idiomas con varios profesores").blueprintSector, "education");
  assert.equal(matchSectorPreset("un taller mecánico de coches").blueprintSector, "automotive");
  assert.equal(matchSectorPreset("una agencia inmobiliaria con varios agentes").blueprintSector, "real-estate");
});

test("getSectorPresetById devuelve null para un id desconocido y el preset genérico para su propio id", () => {
  assert.equal(getSectorPresetById("no-existe"), null);
  assert.equal(getSectorPresetById("generic-local-service").presetId, "generic-local-service");
});

test("SECTOR_PRESET_IDS coincide 1:1 con los presetId declarados", () => {
  assert.deepEqual(SECTOR_PRESET_IDS, SECTOR_LEXICON.map((p) => p.presetId));
});
