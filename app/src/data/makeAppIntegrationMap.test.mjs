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

// PASO 07O (2026-07-20): consolidación de módulos de sidebar para 14
// escenarios más del inventario, agrupados en 4 módulos visuales nuevos
// (Control QR/Accesos, Pistas libres y recordatorios, Dashboard KPI y NPS,
// Backups y seguridad). Ninguno tiene Worker/endpoint real todavía —
// mismo criterio que Gestión Lista de Espera (Paso 07N): Grupo B,
// integradoEnApp true, integradoEnWorker false, nunca confirmado
// end-to-end sin prueba real contra Make/Airtable.
test("PASO 07O: Control Acceso QR y Generación QR Acceso pasan a integrados en app SIN Worker (módulo Control QR/Accesos)", () => {
  for (const nombre of ["Control Acceso QR", "Generación QR Acceso"]) {
    const escenario = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes(nombre));
    assert.ok(escenario, `${nombre} debe existir en el mapa`);
    assert.equal(escenario.grupo, MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER);
    assert.equal(escenario.integradoEnApp, true);
    assert.equal(escenario.integradoEnWorker, false);
    assert.equal(escenario.soloInventariado, false);
  }
});

test("PASO 07O: Alerta Pistas Libres, Recordatorios y Seguimiento No-Show pasan a integrados en app SIN Worker (módulo Pistas libres y recordatorios)", () => {
  for (const nombre of ["Alerta Pistas Libres", "Recordatorio 24h Antes", "Recordatorio 2h Antes", "Seguimiento No-Show"]) {
    const escenario = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes(nombre));
    assert.ok(escenario, `${nombre} debe existir en el mapa`);
    assert.equal(escenario.grupo, MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER);
    assert.equal(escenario.integradoEnApp, true);
    assert.equal(escenario.integradoEnWorker, false);
  }
});

test("PASO 07O: Dashboard Ejecutivo, Panel KPI, Informe Mensual y Análisis NPS pasan a integrados en app SIN Worker (módulo Dashboard KPI y NPS)", () => {
  for (const nombre of ["Dashboard Ejecutivo Diario", "Panel KPI Semanal", "Informe Mensual", "Análisis NPS Semanal"]) {
    const escenario = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes(nombre));
    assert.ok(escenario, `${nombre} debe existir en el mapa`);
    assert.equal(escenario.grupo, MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER);
    assert.equal(escenario.integradoEnApp, true);
    assert.equal(escenario.integradoEnWorker, false);
  }
});

test("PASO 07O: Encuesta Post-Partido NO se integra pese a compartir módulo temático con NPS — sigue en Grupo E por su 89% de tasa de error histórica en Make (hallazgo previo, Paso 07B)", () => {
  const encuesta = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes("Encuesta Post-Partido"));
  assert.ok(encuesta);
  assert.equal(encuesta.grupo, MAKE_INTEGRATION_GROUPS.SIN_INTEGRACION);
  assert.equal(encuesta.integradoEnApp, false);
  assert.equal(encuesta.soloInventariado, true);
});

test("PASO 07O: Backup Semanal, Backup Plantilla Drive, Solicitud GDPR y Alerta Seguridad pasan a integrados en app SIN Worker (módulo Backups y seguridad)", () => {
  for (const nombre of ["Backup Semanal", "Backup Plantilla Drive", "Solicitud GDPR", "Alerta Seguridad Acceso Sospechoso"]) {
    const escenario = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes(nombre));
    assert.ok(escenario, `${nombre} debe existir en el mapa`);
    assert.equal(escenario.grupo, MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER);
    assert.equal(escenario.integradoEnApp, true);
    assert.equal(escenario.integradoEnWorker, false);
  }
});

// PASO 07P (2026-07-20): 20 escenarios más, agrupados en 4 módulos
// visuales nuevos (Comunicaciones y ciclo de socio, Facturación y pagos,
// Calendario y disponibilidad, Automatizaciones y bots). Mismo criterio
// que 07N/07O: Grupo B, integradoEnWorker false, nunca confirmado
// end-to-end.
test("PASO 07P: 9 escenarios de ciclo de vida del socio pasan a integrados en app SIN Worker (módulo Comunicaciones y ciclo de socio)", () => {
  for (const nombre of [
    "Reactivación Inactivos 30d", "Felicitación Cumpleaños", "Recordatorio Cuota Mensual",
    "Monitor Prueba Gratuita", "Congelación + Reactivación Membresía", "Bienvenida Nuevo Socio",
    "Onboarding Secuencial", "Programa de Referidos", "Emparejamiento Sin Pareja",
  ]) {
    const escenario = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes(nombre));
    assert.ok(escenario, `${nombre} debe existir en el mapa`);
    assert.equal(escenario.grupo, MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER);
    assert.equal(escenario.integradoEnApp, true);
    assert.equal(escenario.integradoEnWorker, false);
  }
});

test("PASO 07P: 4 escenarios de facturación pasan a integrados en app SIN Worker, documentando Stripe como pendiente (módulo Facturación y pagos)", () => {
  for (const nombre of ["Facturación y Cobro", "Pago Confirmado Stripe", "Dunning Cobro Recurrente Stripe", "Escalado Impagos"]) {
    const escenario = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes(nombre));
    assert.ok(escenario, `${nombre} debe existir en el mapa`);
    assert.equal(escenario.grupo, MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER);
    assert.equal(escenario.integradoEnApp, true);
    assert.equal(escenario.integradoEnWorker, false);
    assert.match(escenario.bloqueadorPrincipal, /Stripe/, `${nombre} debe documentar que Stripe sigue pendiente`);
  }
});

test("PASO 07P: 2 escenarios de calendario pasan a integrados en app SIN Worker (módulo Calendario y disponibilidad)", () => {
  for (const nombre of ["Sincronización Multi-Calendario", "Predicción Ocupación"]) {
    const escenario = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes(nombre));
    assert.ok(escenario, `${nombre} debe existir en el mapa`);
    assert.equal(escenario.grupo, MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER);
    assert.equal(escenario.integradoEnApp, true);
    assert.equal(escenario.integradoEnWorker, false);
  }
});

test("PASO 07P: 5 escenarios de bots pasan a integrados en app SIN Worker, documentando WhatsApp/Telegram como pendiente (módulo Automatizaciones y bots)", () => {
  const nombresWhatsapp = ["Atención Socio WhatsApp FAQ", "Campaña Flash WhatsApp", "Bot IA Reservas WhatsApp"];
  for (const nombre of nombresWhatsapp) {
    const escenario = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes(nombre));
    assert.ok(escenario, `${nombre} debe existir en el mapa`);
    assert.equal(escenario.grupo, MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER);
    assert.match(escenario.bloqueadorPrincipal, /WhatsApp/, `${nombre} debe documentar que WhatsApp sigue pendiente`);
  }
  const telegram = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes("Bot IA Reservas Telegram"));
  assert.ok(telegram);
  assert.equal(telegram.grupo, MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER);
  assert.match(telegram.bloqueadorPrincipal, /Telegram/);
  const tally = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes("Tally"));
  assert.ok(tally);
  assert.equal(tally.grupo, MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER);
});

test("PASO 07P: Cruces de Torneo, Resultados y Clasificación, Reto 04 + Puntos, Confirmación Inscripción Torneo, Chatbot Web Reservas y Email Recuperación SaaS siguen SIN integrar (requieren rediseño/decisión fuera de alcance)", () => {
  for (const nombre of [
    "Cruces de Torneo", "Resultados y Clasificación", "Reto 04", "Confirmación Inscripción Torneo",
    "Chatbot Web Reservas", "Email Recuperación de Contraseña SaaS",
  ]) {
    const escenario = MAKE_APP_INTEGRATION_MAP.find((s) => s.nombre.includes(nombre));
    assert.ok(escenario, `${nombre} debe existir en el mapa`);
    assert.equal(escenario.integradoEnApp, false, `${nombre} no debería integrarse todavía`);
  }
});

test("PASO 07P: ningún escenario del Grupo B se marca requiereMakeManual=false sin bloqueadorPrincipal honesto (40/50 con representación de app tras 07N+07O+07P)", () => {
  const grupoB = MAKE_APP_INTEGRATION_MAP.filter((s) => s.grupo === MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER);
  assert.equal(grupoB.length, 35, "Lista de Espera (07N) + 14 escenarios (07O) + 20 escenarios (07P)");
  for (const s of grupoB) {
    assert.equal(s.integradoEnWorker, false, `${s.nombre} es Grupo B pero tiene integradoEnWorker=true`);
    assert.ok(s.bloqueadorPrincipal && s.bloqueadorPrincipal.length > 0, `${s.nombre} debe documentar su bloqueador`);
  }
  const representados = MAKE_APP_INTEGRATION_MAP.filter((s) =>
    s.grupo === MAKE_INTEGRATION_GROUPS.APP_Y_WORKER ||
    s.grupo === MAKE_INTEGRATION_GROUPS.APP_SIN_WORKER ||
    s.grupo === MAKE_INTEGRATION_GROUPS.SOLO_CENTRO_TECNICO
  );
  assert.equal(representados.length, 40, "A + B + C deben sumar 40/50 tras el Paso 07P");
});
