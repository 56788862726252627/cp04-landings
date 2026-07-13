import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  SMOKE_CHECK_NAMES_EXPANDED,
  checkCancelBookingEndpointContract,
  checkRescheduleBookingEndpointContract,
  checkPlayerSignupEndpointContract,
  checkServiceWorkerLocal,
  checkTenantResolution,
  checkFeatureFlags,
  checkReleaseManifestValidity,
  checkAvailabilityEndpointContract,
  runAllSmokeChecksExpanded,
} from "../../scripts/release/smoke-tests.mjs";
import { validateAgainstSchema } from "../../src/config/schemaValidator.js";
import { repoPath } from "../../src/config/paths.js";

const cancelSchema = JSON.parse(readFileSync(repoPath("schemas", "make-qa", "payload-api-reservas-cancelar.schema.json"), "utf8"));
const rescheduleSchema = JSON.parse(readFileSync(repoPath("schemas", "make-qa", "payload-api-reservas-reprogramar.schema.json"), "utf8"));
const playerSignupSchema = JSON.parse(readFileSync(repoPath("schemas", "make-qa", "payload-alta-jugador.schema.json"), "utf8"));
const validRegistry = JSON.parse(readFileSync(repoPath("config", "tenant-registry.example.valid.json"), "utf8"));
const coreConfig = JSON.parse(readFileSync(repoPath("config", "core-config.default.json"), "utf8"));
const validManifest = JSON.parse(readFileSync(repoPath("fixtures", "release", "release-manifest.example.valid-staging.json"), "utf8"));

test("SMOKE_CHECK_NAMES_EXPANDED: 9 originales + 8 nuevos = 17", () => {
  assert.equal(SMOKE_CHECK_NAMES_EXPANDED.length, 17);
});

test("smoke cancel booking contract: payload sintético válido -> PASS, sin POST real", () => {
  const result = checkCancelBookingEndpointContract({
    validateAgainstSchema,
    schema: cancelSchema,
    samplePayload: { accion: "cancelar_reserva", clave_reserva: "QA_CP04_abcdef123" },
  });
  assert.equal(result.status, "PASS");
});

test("smoke cancel booking contract: clave_reserva sin prefijo QA_CP04_ -> FAIL (no debe poder colisionar con una reserva real)", () => {
  const result = checkCancelBookingEndpointContract({
    validateAgainstSchema,
    schema: cancelSchema,
    samplePayload: { accion: "cancelar_reserva", clave_reserva: "reserva-real-12345" },
  });
  assert.equal(result.status, "FAIL");
});

test("smoke reschedule booking contract: payload sintético válido -> PASS, sin POST real", () => {
  const result = checkRescheduleBookingEndpointContract({
    validateAgainstSchema,
    schema: rescheduleSchema,
    samplePayload: {
      accion: "reprogramar_reserva",
      clave_reserva: "QA_CP04_abcdef123",
      nueva_fecha_reserva: "2026-08-01",
      nueva_hora_inicio: "10:00",
      nueva_hora_fin: "11:00",
      nueva_pista: "QA_PISTA_1",
    },
  });
  assert.equal(result.status, "PASS");
});

test("smoke reschedule booking contract: nueva_pista sin prefijo QA_ -> FAIL", () => {
  const result = checkRescheduleBookingEndpointContract({
    validateAgainstSchema,
    schema: rescheduleSchema,
    samplePayload: {
      accion: "reprogramar_reserva",
      clave_reserva: "QA_CP04_abcdef123",
      nueva_fecha_reserva: "2026-08-01",
      nueva_hora_inicio: "10:00",
      nueva_hora_fin: "11:00",
      nueva_pista: "pista-real-1",
    },
  });
  assert.equal(result.status, "FAIL");
});

test("smoke player signup contract: payload sintético válido -> PASS, sin alta real", () => {
  const result = checkPlayerSignupEndpointContract({
    validateAgainstSchema,
    schema: playerSignupSchema,
    samplePayload: {
      nombre: "QA_CP04_Test",
      apellidos: "TEST_Apellido",
      email: "admin+qacp04test@example.com",
      nivel: "iniciacion",
      comentarios: "QA_CP04 comentario de prueba",
      telefono: "600000000",
      fecha_nacimiento: "2000-01-01",
      genero: "no_especificado",
      acepta_condiciones: true,
      origen: "QA_TERMINAL7",
    },
  });
  assert.equal(result.status, "PASS");
});

test("smoke player signup contract: email sin alias '+qacp04' -> FAIL (regla de aislamiento de la suite)", () => {
  const result = checkPlayerSignupEndpointContract({
    validateAgainstSchema,
    schema: playerSignupSchema,
    samplePayload: {
      nombre: "QA_CP04_Test",
      apellidos: "TEST_Apellido",
      email: "jugador-real@example.com",
      nivel: "iniciacion",
      comentarios: "QA_CP04 comentario de prueba",
      telefono: "600000000",
      fecha_nacimiento: "2000-01-01",
      genero: "no_especificado",
      acepta_condiciones: true,
      origen: "QA_TERMINAL7",
    },
  });
  assert.equal(result.status, "FAIL");
});

test("smoke service worker: public/sw.js real del repo -> PASS", () => {
  const result = checkServiceWorkerLocal();
  assert.equal(result.status, "PASS");
});

test("smoke service worker: fichero ausente -> FAIL", () => {
  const result = checkServiceWorkerLocal({ serviceWorkerPath: "/no/existe/nunca/sw.js" });
  assert.equal(result.status, "FAIL");
});

test("smoke tenant resolution: hostname conocido en el registro -> PASS", () => {
  const result = checkTenantResolution({ hostname: "club-padel-04.pages.dev", tenantRegistry: validRegistry });
  assert.equal(result.status, "PASS");
});

test("smoke tenant resolution: hostname desconocido -> WARN, nunca lanza", () => {
  const result = checkTenantResolution({ hostname: "no-existe.pages.dev", tenantRegistry: validRegistry });
  assert.equal(result.status, "WARN");
});

test("smoke feature flags: core-config real resuelve sin degradación -> PASS", () => {
  const result = checkFeatureFlags({ core: coreConfig });
  assert.equal(result.status, "PASS");
});

test("smoke feature flags: feature ON con dependencia OFF (emparejamientos sin ranking) degrada a WARN, nunca lanza", () => {
  const result = checkFeatureFlags({ core: coreConfig, client: { features: { emparejamientos: true } } });
  assert.equal(result.status, "WARN");
});

test("smoke release manifest validity: manifest válido -> PASS", () => {
  const result = checkReleaseManifestValidity({ manifest: validManifest });
  assert.equal(result.status, "PASS");
});

test("smoke release manifest validity: manifest inválido -> FAIL", () => {
  const result = checkReleaseManifestValidity({ manifest: { ...validManifest, schema_version: "9.9.9" } });
  assert.equal(result.status, "FAIL");
});

test("smoke availability endpoint contract: HTTP 200 -> PASS", async () => {
  const fakeFetch = async () => ({ status: 200 });
  const result = await checkAvailabilityEndpointContract({ baseUrl: "https://example.test", fetchImpl: fakeFetch });
  assert.equal(result.status, "PASS");
});

test("smoke availability endpoint contract: HTTP 400 (sin query params) -> PASS, endpoint vivo", async () => {
  const fakeFetch = async () => ({ status: 400 });
  const result = await checkAvailabilityEndpointContract({ baseUrl: "https://example.test", fetchImpl: fakeFetch });
  assert.equal(result.status, "PASS");
});

test("smoke availability endpoint contract: HTTP 500 -> FAIL", async () => {
  const fakeFetch = async () => ({ status: 500 });
  const result = await checkAvailabilityEndpointContract({ baseUrl: "https://example.test", fetchImpl: fakeFetch });
  assert.equal(result.status, "FAIL");
});

test("runAllSmokeChecksExpanded: sin ningún input nuevo -> los 8 checks nuevos SKIPPED salvo service_worker (local, siempre corre)", async () => {
  const { results } = await runAllSmokeChecksExpanded({});
  assert.equal(results.length, 17);
  const byName = Object.fromEntries(results.map((r) => [r.check, r.status]));
  assert.equal(byName.cancel_booking_contract, "SKIPPED");
  assert.equal(byName.reschedule_booking_contract, "SKIPPED");
  assert.equal(byName.player_signup_contract, "SKIPPED");
  assert.equal(byName.tenant_resolution, "SKIPPED");
  assert.equal(byName.feature_flags, "SKIPPED");
  assert.equal(byName.release_manifest_validity, "SKIPPED");
  assert.equal(byName.availability_endpoint_contract, "SKIPPED");
  assert.notEqual(byName.service_worker, "SKIPPED");
});

test("runAllSmokeChecksExpanded: con todos los inputs -> overall coherente (WARN por manifest_pwa/dependency_status/etc. ya conocidos)", async () => {
  const summary = await runAllSmokeChecksExpanded({
    validateAgainstSchema,
    cancelSchema,
    cancelSamplePayload: { accion: "cancelar_reserva", clave_reserva: "QA_CP04_abcdef123" },
    rescheduleSchema,
    rescheduleSamplePayload: { accion: "reprogramar_reserva", clave_reserva: "QA_CP04_abcdef123", nueva_fecha_reserva: "2026-08-01", nueva_hora_inicio: "10:00", nueva_hora_fin: "11:00", nueva_pista: "QA_PISTA_1" },
    playerSignupSchema,
    playerSignupSamplePayload: { nombre: "QA_CP04_Test", apellidos: "TEST_Apellido", email: "admin+qacp04test@example.com", nivel: "iniciacion", comentarios: "QA_CP04 x", telefono: "600000000", fecha_nacimiento: "2000-01-01", genero: "no_especificado", acepta_condiciones: true, origen: "QA_TERMINAL7" },
    hostname: "club-padel-04.pages.dev",
    tenantRegistry: validRegistry,
    core: coreConfig,
    manifest: validManifest,
  });
  assert.equal(summary.results.length, 17);
  assert.notEqual(summary.overall, "FAIL");
});
