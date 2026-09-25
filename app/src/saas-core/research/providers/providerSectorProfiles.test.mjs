import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PROVIDER_SECTOR_PROFILES,
  PROVIDER_SECTOR_PROFILE_IDS,
  GENERIC_PROVIDER_SECTOR_PROFILE,
  getProviderSectorProfile,
  mergePolicyOptionsWithProfile,
  getEffectiveAuditPresetForProfile,
} from "./providerSectorProfiles.js";
import { DIMENSION_IDS } from "../dimensionRegistry.js";
import { SECTOR_AUDIT_PRESETS, GENERIC_AUDIT_PRESET } from "../sectorAuditPresets.js";

const REQUIRED_PROFILE_IDS = ["club-deportivo", "clinica", "dentista", "veterinario", "abogado", "restaurante", "hotel", "inmobiliaria", "peluqueria", "centro-estetica"];

test("existen los 10 perfiles mínimos exigidos por el enunciado del Paso 15", () => {
  for (const id of REQUIRED_PROFILE_IDS) assert.ok(PROVIDER_SECTOR_PROFILES[id], `falta el perfil "${id}"`);
  assert.equal(PROVIDER_SECTOR_PROFILE_IDS.length, REQUIRED_PROFILE_IDS.length);
});

test("cada perfil declara solo dimensiones que existen en el registro de 45", () => {
  for (const profile of Object.values(PROVIDER_SECTOR_PROFILES)) {
    for (const dim of profile.relevantDimensions) assert.ok(DIMENSION_IDS.includes(dim), `${profile.id}: dimensión desconocida "${dim}"`);
  }
});

test("cada perfil declara solo proveedores conocidos y nunca solapa recomendados con excluidos", () => {
  const knownIds = ["publicWebsiteFetcher", "lighthouseProvider", "performanceProvider", "speedProvider", "seoProvider", "schemaProvider", "accessibilityProvider", "socialProvider", "technologyProvider", "securityHeadersProvider", "dnsProvider", "whoisProvider", "aiContentProvider"];
  for (const profile of Object.values(PROVIDER_SECTOR_PROFILES)) {
    for (const p of profile.recommendedProviders) assert.ok(knownIds.includes(p), `${profile.id}: proveedor desconocido "${p}"`);
    const overlap = profile.recommendedProviders.filter((p) => profile.exclusions.includes(p));
    assert.deepEqual(overlap, [], `${profile.id}: solapamiento recomendado/excluido`);
  }
});

test("todos los perfiles incluyen publicWebsiteFetcher como primer proveedor (única fuente real hoy)", () => {
  for (const profile of Object.values(PROVIDER_SECTOR_PROFILES)) {
    assert.equal(profile.recommendedProviders[0], "publicWebsiteFetcher", `${profile.id} no antepone el proveedor real`);
  }
});

test("los sectores regulados (clinica/dentista/veterinario/abogado) excluyen aiContentProvider", () => {
  for (const id of ["clinica", "dentista", "veterinario", "abogado"]) {
    assert.ok(PROVIDER_SECTOR_PROFILES[id].exclusions.includes("aiContentProvider"), `${id} debería excluir aiContentProvider`);
  }
});

test("todo perfil que recomienda socialProvider o aiContentProvider exige consentimiento explícito", () => {
  for (const profile of Object.values(PROVIDER_SECTOR_PROFILES)) {
    if (profile.recommendedProviders.includes("socialProvider") || profile.recommendedProviders.includes("aiContentProvider")) {
      assert.equal(profile.consentRequired, true, `${profile.id} recomienda un proveedor con credenciales sin exigir consentimiento`);
      assert.ok(profile.consentNote, `${profile.id}: falta consentNote`);
    }
  }
});

test("getProviderSectorProfile cae al perfil genérico ante un id desconocido o ausente", () => {
  assert.equal(getProviderSectorProfile("no-existe"), GENERIC_PROVIDER_SECTOR_PROFILE);
  assert.equal(getProviderSectorProfile(undefined), GENERIC_PROVIDER_SECTOR_PROFILE);
  assert.equal(getProviderSectorProfile(null), GENERIC_PROVIDER_SECTOR_PROFILE);
});

test("getProviderSectorProfile devuelve el perfil exacto por id", () => {
  assert.equal(getProviderSectorProfile("dentista").id, "dentista");
});

test("mergePolicyOptionsWithProfile: acumula exclusiones del perfil con las ya indicadas explícitamente", () => {
  const merged = mergePolicyOptionsWithProfile({ excludeProviders: ["whoisProvider"] }, PROVIDER_SECTOR_PROFILES.abogado);
  assert.ok(merged.excludeProviders.includes("whoisProvider"));
  assert.ok(merged.excludeProviders.includes("aiContentProvider"));
  assert.ok(merged.excludeProviders.includes("socialProvider"));
});

test("mergePolicyOptionsWithProfile: las prioridades explícitas del llamador ganan sobre las del perfil", () => {
  const merged = mergePolicyOptionsWithProfile({ providerPriorityOverrides: { seoProvider: 1 } }, PROVIDER_SECTOR_PROFILES["club-deportivo"]);
  assert.equal(merged.providerPriorityOverrides.seoProvider, 1);
  assert.ok(merged.providerPriorityOverrides.publicWebsiteFetcher !== undefined);
});

test("mergePolicyOptionsWithProfile: rellena profileId con el del perfil si no se indicó ninguno", () => {
  const merged = mergePolicyOptionsWithProfile({}, PROVIDER_SECTOR_PROFILES.restaurante);
  assert.equal(merged.profileId, "restaurante");
});

test("getEffectiveAuditPresetForProfile: perfiles con auditPresetId heredan los pesos del preset de Paso 12 + los propios", () => {
  const preset = getEffectiveAuditPresetForProfile(PROVIDER_SECTOR_PROFILES.dentista);
  assert.equal(preset.categoryWeights.trust, SECTOR_AUDIT_PRESETS.dental.categoryWeights.trust); // perfil no sobreescribe trust
});

test("getEffectiveAuditPresetForProfile: 'hotel' (sin preset 1:1) cae al preset genérico como base y aplica sus propios pesos", () => {
  const preset = getEffectiveAuditPresetForProfile(PROVIDER_SECTOR_PROFILES.hotel);
  assert.equal(preset.categoryWeights.conversion, 1.3);
  assert.equal(preset.dimensionWeights.bookingCapability, 1.5);
  for (const dim of GENERIC_AUDIT_PRESET.priorityDimensions) assert.ok(preset.priorityDimensions.includes(dim));
});

test("GENERIC_PROVIDER_SECTOR_PROFILE existe y no está en la lista de los 10 mínimos exigidos", () => {
  assert.equal(GENERIC_PROVIDER_SECTOR_PROFILE.id, "generic");
  assert.ok(!PROVIDER_SECTOR_PROFILE_IDS.includes("generic"));
});
