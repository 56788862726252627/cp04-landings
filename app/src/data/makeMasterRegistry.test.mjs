import { test } from "node:test";
import assert from "node:assert/strict";
import { MAKE_ARCHITECTURE_MATRIX } from "./makeArchitectureMatrix.js";
import { MAKE_INVENTORY } from "./makeInventory.js";
import {
  MAKE_MASTER_REGISTRY,
  MAKE_ESTADOS_FUNCIONALES,
  deriveEstadoFuncional,
  computeMasterCounters,
  filterMasterRegistry,
} from "./makeMasterRegistry.js";

test("MAKE_MASTER_REGISTRY: contiene exactamente 50 entradas", () => {
  assert.equal(MAKE_MASTER_REGISTRY.length, 50);
});

test("MAKE_MASTER_REGISTRY: los ids son únicos", () => {
  const ids = MAKE_MASTER_REGISTRY.map((f) => f.id);
  assert.equal(new Set(ids).size, 50);
});

test("MAKE_MASTER_REGISTRY: los números van de 1 a 50 sin huecos ni duplicados", () => {
  const numeros = MAKE_MASTER_REGISTRY.map((f) => f.numero).sort((a, b) => a - b);
  assert.deepEqual(numeros, Array.from({ length: 50 }, (_, i) => i + 1));
});

test("MAKE_MASTER_REGISTRY: coincide 1:1 con MAKE_ARCHITECTURE_MATRIX y MAKE_INVENTORY (mismos 50 ids, sin huérfanos)", () => {
  const idsRegistro = new Set(MAKE_MASTER_REGISTRY.map((f) => f.id));
  const idsMatrix = new Set(MAKE_ARCHITECTURE_MATRIX.map((f) => f.id));
  const idsInventory = new Set(MAKE_INVENTORY.map((f) => f.id));
  assert.deepEqual(idsRegistro, idsMatrix);
  assert.deepEqual(idsRegistro, idsInventory);
});

test("MAKE_MASTER_REGISTRY: cada entrada trae los 13 campos exigidos por el registro maestro", () => {
  const camposObligatorios = [
    "id", "numero", "nombre", "categoria", "descripcion", "rolesAutorizados",
    "modulo", "accionIniciadora", "webhookEsperado", "servicioDestino",
    "estadoFuncional", "evidencia", "notas",
  ];
  for (const flujo of MAKE_MASTER_REGISTRY) {
    for (const campo of camposObligatorios) {
      assert.ok(campo in flujo, `falta el campo "${campo}" en el flujo ${flujo.id}`);
      assert.notEqual(flujo[campo], undefined, `el campo "${campo}" es undefined en el flujo ${flujo.id}`);
    }
  }
});

test("MAKE_MASTER_REGISTRY: estadoFuncional siempre es uno de los 7 estados permitidos", () => {
  const validos = new Set(Object.values(MAKE_ESTADOS_FUNCIONALES));
  assert.equal(validos.size, 7);
  for (const flujo of MAKE_MASTER_REGISTRY) {
    assert.ok(validos.has(flujo.estadoFuncional), `estado inválido "${flujo.estadoFuncional}" en el flujo ${flujo.id}`);
  }
});

test("MAKE_MASTER_REGISTRY: cada flujo declara al menos un rol autorizado no vacío", () => {
  for (const flujo of MAKE_MASTER_REGISTRY) {
    assert.ok(Array.isArray(flujo.rolesAutorizados));
    assert.ok(flujo.rolesAutorizados.length > 0, `sin roles autorizados en el flujo ${flujo.id}`);
  }
});

test("MAKE_MASTER_REGISTRY: nunca declara 50/50 operativos sin evidencia — solo Alta de Jugador y GDPR Acceso/Olvido son OPERATIVO", () => {
  const operativos = MAKE_MASTER_REGISTRY.filter((f) => f.estadoFuncional === MAKE_ESTADOS_FUNCIONALES.OPERATIVO);
  const nombres = operativos.map((f) => f.nombre).sort();
  assert.deepEqual(nombres, ["⚖️ Solicitud GDPR Acceso u Olvido de Datos", "🎾 Alta de Jugador"].sort());
});

test("computeMasterCounters: total es siempre 50 y coincide con registry.length, nunca hardcodeado", () => {
  const counters = computeMasterCounters();
  assert.equal(counters.total, MAKE_MASTER_REGISTRY.length);
  assert.equal(counters.total, 50);
});

test("computeMasterCounters: conectados + no_conectados + no_aplica = total", () => {
  const counters = computeMasterCounters();
  const noConectado = counters.porEstado[MAKE_ESTADOS_FUNCIONALES.NO_CONECTADO];
  const noAplica = counters.porEstado[MAKE_ESTADOS_FUNCIONALES.NO_APLICA];
  assert.equal(counters.conectados + noConectado + noAplica, counters.total);
});

test("computeMasterCounters: operativos <= probados <= conectados <= total (jerarquía honesta, sin sobreclamar)", () => {
  const counters = computeMasterCounters();
  assert.ok(counters.operativos <= counters.probados);
  assert.ok(counters.probados <= counters.conectados);
  assert.ok(counters.conectados <= counters.total);
});

test("computeMasterCounters: los contadores por estado suman exactamente el total", () => {
  const counters = computeMasterCounters();
  const suma = Object.values(counters.porEstado).reduce((a, b) => a + b, 0);
  assert.equal(suma, counters.total);
});

test("computeMasterCounters: no admite un registro vacío por defecto (siempre usa MAKE_MASTER_REGISTRY)", () => {
  const counters = computeMasterCounters();
  assert.ok(counters.total > 0);
});

test("deriveEstadoFuncional: OPERATIONAL con probadoE2E true da OPERATIVO", () => {
  const arch = { estado: "operational", probadoE2E: true };
  assert.equal(deriveEstadoFuncional(arch, { grupo: "A", integradoEnApp: true }, { estadoVerificacion: "confirmado" }), MAKE_ESTADOS_FUNCIONALES.OPERATIVO);
});

test("deriveEstadoFuncional: OPERATIONAL sin probadoE2E nunca da OPERATIVO (evita fingir E2E)", () => {
  const arch = { estado: "operational", probadoE2E: false };
  const estado = deriveEstadoFuncional(arch, { grupo: "A", integradoEnApp: true }, { estadoVerificacion: "confirmado" });
  assert.notEqual(estado, MAKE_ESTADOS_FUNCIONALES.OPERATIVO);
});

test("deriveEstadoFuncional: EXTERNALLY_BLOCKED siempre da BLOQUEADO, independientemente del grupo", () => {
  const arch = { estado: "externally_blocked", probadoE2E: false };
  assert.equal(deriveEstadoFuncional(arch, { grupo: "B", integradoEnApp: true }, {}), MAKE_ESTADOS_FUNCIONALES.BLOQUEADO);
});

test("deriveEstadoFuncional: grupo D (autónomo en Make) da NO_APLICA", () => {
  const arch = { estado: "prepared", probadoE2E: false };
  assert.equal(deriveEstadoFuncional(arch, { grupo: "D", integradoEnApp: false }, {}), MAKE_ESTADOS_FUNCIONALES.NO_APLICA);
});

test("deriveEstadoFuncional: grupo E (sin integración) da NO_CONECTADO", () => {
  const arch = { estado: "prepared", probadoE2E: false };
  assert.equal(deriveEstadoFuncional(arch, { grupo: "E", integradoEnApp: false }, {}), MAKE_ESTADOS_FUNCIONALES.NO_CONECTADO);
});

test("deriveEstadoFuncional: no integrado y sin grupo D/E cae en NO_CONECTADO por defecto seguro", () => {
  const arch = { estado: "prepared", probadoE2E: false };
  assert.equal(deriveEstadoFuncional(arch, { grupo: "B", integradoEnApp: false }, {}), MAKE_ESTADOS_FUNCIONALES.NO_CONECTADO);
});

test("filterMasterRegistry: sin filtros devuelve el registro completo", () => {
  assert.equal(filterMasterRegistry(MAKE_MASTER_REGISTRY, {}).length, 50);
});

test("filterMasterRegistry: filtra por rol autorizado correctamente", () => {
  const soloPlayer = filterMasterRegistry(MAKE_MASTER_REGISTRY, { rol: "PLAYER" });
  assert.ok(soloPlayer.length > 0);
  assert.ok(soloPlayer.every((f) => f.rolesAutorizados.includes("PLAYER")));
});

test("filterMasterRegistry: filtra por estadoFuncional correctamente", () => {
  const bloqueados = filterMasterRegistry(MAKE_MASTER_REGISTRY, { estadoFuncional: MAKE_ESTADOS_FUNCIONALES.BLOQUEADO });
  assert.ok(bloqueados.every((f) => f.estadoFuncional === MAKE_ESTADOS_FUNCIONALES.BLOQUEADO));
});

test("MAKE_MASTER_REGISTRY: ningún campo de texto expone tokens, secrets ni URLs de webhook", () => {
  const patronSensible = /(https?:\/\/|hook[A-Za-z]*\s*[:=]\s*\d|token\s*[:=]|secret\s*[:=]|api[_-]?key)/i;
  for (const flujo of MAKE_MASTER_REGISTRY) {
    const texto = `${flujo.descripcion} ${flujo.webhookEsperado} ${flujo.servicioDestino} ${flujo.evidencia} ${flujo.notas}`;
    assert.doesNotMatch(texto, patronSensible, `posible dato sensible en el flujo ${flujo.id}`);
  }
});
