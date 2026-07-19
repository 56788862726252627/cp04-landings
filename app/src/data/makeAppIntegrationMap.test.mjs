import { test } from "node:test";
import assert from "node:assert/strict";
import { MAKE_INVENTORY } from "./makeInventory.js";
import { MAKE_APP_INTEGRATION_MAP, MAKE_INTEGRATION_GROUPS } from "./makeAppIntegrationMap.js";

test("MAKE_APP_INTEGRATION_MAP: los 50 flujos de MAKE_INVENTORY aparecen en el mapa, sin más ni menos", () => {
  assert.equal(MAKE_APP_INTEGRATION_MAP.length, 50);
  const inventoryIds = new Set(MAKE_INVENTORY.map((s) => s.id));
  const mapIds = new Set(MAKE_APP_INTEGRATION_MAP.map((s) => s.id));
  assert.equal(mapIds.size, inventoryIds.size);
  for (const id of inventoryIds) {
    assert.ok(mapIds.has(id), `falta en el mapa el escenario ${id} presente en el inventario`);
  }
  for (const id of mapIds) {
    assert.ok(inventoryIds.has(id), `el mapa tiene un id ${id} que no existe en MAKE_INVENTORY`);
  }
});

test("MAKE_APP_INTEGRATION_MAP: no hay ids duplicados", () => {
  const ids = MAKE_APP_INTEGRATION_MAP.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("MAKE_APP_INTEGRATION_MAP: todos los grupos son uno de A/B/C/D/E", () => {
  const gruposValidos = new Set(Object.values(MAKE_INTEGRATION_GROUPS));
  for (const s of MAKE_APP_INTEGRATION_MAP) {
    assert.ok(gruposValidos.has(s.grupo), `grupo inválido '${s.grupo}' en escenario ${s.id}`);
  }
});

test("API Reservas aparece como integrado en app y Worker, bloqueado por Airtable — no por integración", () => {
  const apiReservas = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes("API Reservas"));
  assert.ok(apiReservas, "API Reservas debe existir en el mapa");
  assert.equal(apiReservas.grupo, MAKE_INTEGRATION_GROUPS.APP_Y_WORKER);
  assert.equal(apiReservas.integradoEnApp, true);
  assert.equal(apiReservas.integradoEnWorker, true);
  assert.equal(apiReservas.soloInventariado, false);
  assert.match(apiReservas.bloqueadorPrincipal, /airtable/i);
});

test("Alta de Jugador aparece como integrado en app y Worker (webhook dedicado)", () => {
  const alta = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes("Alta de Jugador"));
  assert.ok(alta);
  assert.equal(alta.grupo, MAKE_INTEGRATION_GROUPS.APP_Y_WORKER);
  assert.equal(alta.integradoEnApp, true);
  assert.equal(alta.integradoEnWorker, true);
});

test("los flujos marcados soloInventariado=true nunca se marcan como integrados en app ni en Worker", () => {
  for (const s of MAKE_APP_INTEGRATION_MAP) {
    if (s.soloInventariado) {
      assert.equal(s.integradoEnApp, false, `${s.nombre} es soloInventariado pero integradoEnApp=true`);
      assert.equal(s.integradoEnWorker, false, `${s.nombre} es soloInventariado pero integradoEnWorker=true`);
    }
  }
});

test("los flujos del grupo E (sin integración visible) nunca se marcan como funcionales (integradoEnApp/Worker)", () => {
  const grupoE = MAKE_APP_INTEGRATION_MAP.filter((s) => s.grupo === MAKE_INTEGRATION_GROUPS.SIN_INTEGRACION);
  assert.ok(grupoE.length > 0, "debe haber al menos un escenario en grupo E para que este test sea significativo");
  for (const s of grupoE) {
    assert.equal(s.integradoEnApp, false);
    assert.equal(s.integradoEnWorker, false);
  }
});

test("solo los escenarios del grupo A tienen integradoEnApp=true e integradoEnWorker=true", () => {
  const marcadosCompletos = MAKE_APP_INTEGRATION_MAP.filter((s) => s.integradoEnApp && s.integradoEnWorker);
  assert.equal(marcadosCompletos.length, 4);
  for (const s of marcadosCompletos) {
    assert.equal(s.grupo, MAKE_INTEGRATION_GROUPS.APP_Y_WORKER);
  }
});

test("PASO 07C: Baja de Jugador pasa a integrado en app y Worker, pero sigue requiriendo Make manual (webhook sin configurar)", () => {
  const baja = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes("Baja de Jugador"));
  assert.ok(baja);
  assert.equal(baja.grupo, MAKE_INTEGRATION_GROUPS.APP_Y_WORKER);
  assert.equal(baja.integradoEnApp, true);
  assert.equal(baja.integradoEnWorker, true);
  assert.equal(baja.soloInventariado, false);
  // No confirmado end-to-end: el webhook real de Make sigue sin configurar,
  // no se ha probado contra Make/Airtable real (ver worker-reservas/src/index.js
  // handleBajaJugador y baja-jugador.test.mjs).
  assert.equal(baja.requiereMakeManual, true);
  assert.match(baja.bloqueadorPrincipal, /MAKE_BAJA_JUGADOR_WEBHOOK/);
});

test("PASO 07E: Cierre Temporal de Pistas pasa a integrado en app y Worker, pero sigue requiriendo Make manual (webhook sin configurar)", () => {
  const cierre = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes("Cierre Temporal de Pistas"));
  assert.ok(cierre);
  assert.equal(cierre.grupo, MAKE_INTEGRATION_GROUPS.APP_Y_WORKER);
  assert.equal(cierre.integradoEnApp, true);
  assert.equal(cierre.integradoEnWorker, true);
  assert.equal(cierre.soloInventariado, false);
  // No confirmado end-to-end: el webhook real de Make sigue sin configurar,
  // no se ha probado contra Make/Airtable real (ver worker-reservas/src/index.js
  // handleCierreTemporalPista y cierre-temporal-pista.test.mjs).
  assert.equal(cierre.requiereMakeManual, true);
  assert.match(cierre.bloqueadorPrincipal, /MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK/);
});

test("PASO 07N: Gestión Lista de Espera pasa a integrado en app SIN Worker (módulo visual preparado, sin endpoint real)", () => {
  const listaEspera = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes("Gestión Lista de Espera"));
  assert.ok(listaEspera);
  assert.equal(listaEspera.grupo, MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER);
  assert.equal(listaEspera.integradoEnApp, true);
  // Deliberadamente sin Worker: no existe endpoint real que lo respalde
  // todavía (a diferencia de Baja de Jugador o Cierre Temporal, que sí
  // tienen handler en worker-reservas/src/index.js). No confirmado
  // end-to-end: sigue bloqueado por Airtable 429 para su validación real.
  assert.equal(listaEspera.integradoEnWorker, false);
  assert.equal(listaEspera.soloInventariado, false);
  assert.equal(listaEspera.requiereMakeManual, true);
  assert.match(listaEspera.bloqueadorPrincipal, /Airtable 429/);
});

test("Control Acceso QR no tiene integración de app detectada (búsqueda exhaustiva de 'QR' sin resultados en src/)", () => {
  const qr = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes("Control Acceso QR"));
  assert.ok(qr);
  assert.equal(qr.integradoEnApp, false);
  assert.equal(qr.integradoEnWorker, false);
});
