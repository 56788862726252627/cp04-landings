import test from "node:test";
import assert from "node:assert/strict";

import { loadBrowserRuntimeConfig } from "./loadBrowserRuntimeConfig.js";

test("loadBrowserRuntimeConfig: resuelve Club Pádel 04 (cp04) sin tocar disco en runtime (JSON estático)", () => {
  const { resolvedConfig, validation } = loadBrowserRuntimeConfig();
  assert.equal(resolvedConfig.tenantId, "cp04");
  assert.equal(resolvedConfig.slug, "club-padel-04");
  assert.equal(validation.valid, true, JSON.stringify(validation.errors));
});

test("loadBrowserRuntimeConfig: preserva las pistas/horario reales de Club Pádel 04 (mismos valores que src/data/clientConfig.default.js)", async () => {
  const { COURTS_DEFAULT, BOOKING_HOURS_DEFAULT } = await import("../data/clientConfig.default.js");
  const { resolvedConfig } = loadBrowserRuntimeConfig();
  assert.deepEqual(resolvedConfig.courts, COURTS_DEFAULT);
  assert.deepEqual(resolvedConfig.bookingHours, BOOKING_HOURS_DEFAULT);
});

test("loadBrowserRuntimeConfig: features.pagos/ia/whatsapp forzados a false (nunca activos por defecto)", () => {
  const { resolvedConfig } = loadBrowserRuntimeConfig();
  assert.equal(resolvedConfig.features.pagos, false);
  assert.equal(resolvedConfig.features.ia, false);
  assert.equal(resolvedConfig.features.whatsapp, false);
});

test("loadBrowserRuntimeConfig: registry devuelto trae los 4 tenants fixture (cp04 activo + 3 estados de QA)", () => {
  const { registry } = loadBrowserRuntimeConfig();
  const byStatus = Object.fromEntries(registry.tenants.map((t) => [t.status, t.tenantId]));
  assert.equal(byStatus.active, "cp04");
  assert.equal(byStatus.staging, "fixture-club-02");
  assert.equal(byStatus.disabled, "fixture-club-03");
  assert.equal(byStatus.maintenance, "fixture-club-04");
});
