import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Regresión de la Inconsistencia 1 (auditoría App↔API Reservas,
// 2026-08-12): ReprogramarReserva.submit sondeaba /api/disponibilidad hasta
// 15 veces (~30s) DESPUÉS de que el Worker ya hubiera confirmado la
// reprogramación (res.ok && data.ok !== false), y si la disponibilidad no
// reflejaba el cambio a tiempo, convertía una reprogramación ya confirmada
// en un error ("reschedule_not_confirmed") — un falso fallo, justo lo
// opuesto al falso éxito que el resto de la app ya evita. La corrección
// hace que la respuesta ok:true del Worker sea la confirmación autoritativa
// (mismo criterio que crear_reserva/Alta/Baja/Cierre Temporal), sin
// reenviar la reprogramación ni bloquear el éxito en un sondeo posterior.
//
// No existe harness de render de React en este proyecto (ver
// twoButtonsMigration.test.mjs para el mismo patrón ya establecido de
// inspección de fuente): estos tests verifican la estructura real de
// App.jsx en vez de montar el componente.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appJsxPath = path.join(__dirname, "App.jsx");
const appJsx = readFileSync(appJsxPath, "utf8");

function extractFunctionSource(source, functionName) {
  const startMatch = source.match(new RegExp(`^function ${functionName}\\(`, "m"));
  assert.ok(startMatch, `no se encontró "function ${functionName}(" en App.jsx`);
  const start = startMatch.index;

  const nextTopLevelFn = source.slice(start + 1).search(/^function [A-Za-z0-9_]+\(/m);
  assert.ok(nextTopLevelFn !== -1, `no se encontró el siguiente function top-level tras ${functionName}`);

  return source.slice(start, start + 1 + nextTopLevelFn);
}

const reprogramarSrc = extractFunctionSource(appJsx, "ReprogramarReserva");
const reservasSrc = extractFunctionSource(appJsx, "Reservas");

test("ReprogramarReserva ya no sondea disponibilidad para decidir éxito/error (sin bucle bloqueante de confirmación)", () => {
  assert.equal(reprogramarSrc.includes("destinationConfirmed"), false);
  // "reschedule_not_confirmed" puede seguir mencionado en un comentario
  // explicando el porqué del cambio; lo que no debe existir es el throw
  // real que convertía la ausencia de disponibilidad actualizada en error.
  assert.equal(/throw\s+new Error\(\s*["']reschedule_not_confirmed["']/.test(reprogramarSrc), false);
  assert.equal(/for\s*\(\s*let attempt/.test(reprogramarSrc), false);
});

test("ReprogramarReserva.submit marca éxito inmediatamente tras la respuesta autoritativa del Worker (res.ok && data.ok !== false), sin await intermedio de disponibilidad", () => {
  const gateIndex = reprogramarSrc.indexOf('if (!res.ok || data?.ok === false)');
  assert.ok(gateIndex !== -1, "no se encontró el guard de respuesta del Worker");
  // El modo demo (más arriba en la función) también hace setStatus("success"),
  // así que se busca la ocurrencia real tras el guard, no la primera del archivo.
  const successIndex = reprogramarSrc.indexOf('setStatus("success")', gateIndex);
  assert.ok(successIndex !== -1, "no se encontró setStatus(\"success\")");
  assert.ok(successIndex > gateIndex, "el éxito debe declararse después del guard de respuesta");

  const between = reprogramarSrc.slice(gateIndex, successIndex);
  assert.equal(/await\s+fetchDisponibilidad/.test(between), false, "no debe haber ninguna consulta de disponibilidad bloqueando el éxito");
  assert.equal(/await\s+new Promise/.test(between), false, "no debe haber ninguna espera bloqueante entre la respuesta del Worker y el éxito");
});

test("ReprogramarReserva realiza como máximo un único POST de reprogramación por envío (sin reenvío tras el sondeo eliminado)", () => {
  const postCalls = reprogramarSrc.match(/authFetch\(CONFIG\.bookingEndpoint/g) || [];
  assert.equal(postCalls.length, 1, `se esperaba exactamente 1 llamada a authFetch(CONFIG.bookingEndpoint) en submit, hubo ${postCalls.length}`);
});

test("refreshDisponibilidadAfterChange sigue invocándose tras el éxito, como efecto secundario no bloqueante (sin await)", () => {
  assert.match(reprogramarSrc, /setStatus\("success"\);\s*\n\s*refreshDisponibilidadAfterChange\(form\.nueva_fecha_reserva\);/);
  assert.equal(/await\s+refreshDisponibilidadAfterChange/.test(reprogramarSrc), false, "refreshDisponibilidadAfterChange no debe esperarse: es best-effort");
});

test("Reservas.send (crear_reserva) mantiene su criterio original de confianza inmediata en la respuesta del Worker, sin sondeo — mismo criterio ahora unificado con Reprogramar", () => {
  assert.equal(reservasSrc.includes("destinationConfirmed"), false);
  assert.match(reservasSrc, /await sendBooking\(payload\);\s*\n\s*refreshDisponibilidadAfterChange\(form\.fecha\);\s*\n\s*setStatus\("success"\);/);
});
