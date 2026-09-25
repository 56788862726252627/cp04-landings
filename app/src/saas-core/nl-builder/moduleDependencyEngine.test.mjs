import { test } from "node:test";
import assert from "node:assert/strict";

import { resolveModules } from "./moduleDependencyEngine.js";
import { getSectorPresetById, GENERIC_SECTOR_PRESET } from "./sectorLexicon.js";

const physio = getSectorPresetById("physiotherapy");
const law = getSectorPresetById("law");
const padel = getSectorPresetById("padel-sports");

function findModule(modules, id) {
  return modules.find((m) => m.id === id);
}

test("citas explícito infiere recursos o profesionales cuando el sector no los recomienda de base (preset genérico)", () => {
  const { modules } = resolveModules("necesito reservas para mi negocio", GENERIC_SECTOR_PRESET);
  const citas = findModule(modules, "citas");
  assert.equal(citas.source, "explicit");
  assert.equal(citas.status, "enabled");
  const profesionales = findModule(modules, "profesionales");
  assert.equal(profesionales.status, "enabled");
  assert.equal(profesionales.source, "inferred");
});

test("pagos explícito infiere servicios cuando el sector no los recomienda de base (club de pádel)", () => {
  const { modules } = resolveModules("quiero cobrar pagos online a mis jugadores", padel);
  const servicios = findModule(modules, "servicios");
  assert.equal(servicios.status, "enabled");
  assert.equal(servicios.source, "inferred");
});

test("expedientes activa el flag de permisos reforzados", () => {
  const { modules, hasReinforcedPermissionModules } = resolveModules("necesito expedientes clínicos de pacientes", physio);
  assert.equal(hasReinforcedPermissionModules, true);
  assert.equal(findModule(modules, "expedientes").status, "enabled");
});

test("inventario NUNCA se activa automáticamente sin mención explícita", () => {
  const { modules } = resolveModules("clínica de fisioterapia con reservas y pagos", physio);
  const inventario = findModule(modules, "inventario");
  assert.equal(inventario, undefined, "inventario no debería aparecer en absoluto si nunca se menciona ni se recomienda");
});

test("inventario SÍ se activa si el usuario lo pide explícitamente", () => {
  const { modules } = resolveModules("clínica de fisioterapia que también necesita gestionar inventario de material", physio);
  const inventario = findModule(modules, "inventario");
  assert.equal(inventario.status, "enabled");
  assert.equal(inventario.source, "explicit");
});

test("facturación no añade ni activa integración de pagos por sí sola", () => {
  const { modules } = resolveModules("necesito facturación para mi despacho", law);
  const facturacion = findModule(modules, "facturacion");
  assert.equal(facturacion.status, "enabled");
  assert.equal(facturacion.source, "explicit");
});

test("un módulo fuera de lo recomendado para el sector, pedido explícitamente, se acepta con confianza reducida y nota", () => {
  const { modules } = resolveModules("despacho de abogados que también quiero que tenga torneos y ranking", law);
  const torneos = findModule(modules, "torneos");
  assert.equal(torneos.source, "explicit");
  assert.equal(torneos.status, "enabled");
  assert.ok(torneos.confidence <= 0.5);
  assert.match(torneos.justification, /fuera de lo habitual/);
});

test("un módulo fuera de lo recomendado, NO pedido, nunca se activa en silencio (rejected en vez de enabled)", () => {
  const { modules } = resolveModules("despacho de abogados con citas y documentos", law);
  const torneos = findModule(modules, "torneos");
  if (torneos) assert.equal(torneos.status, "rejected");
});

test("módulos base (clientes, soporte, configuración, autenticación) siempre están presentes", () => {
  const { modules } = resolveModules("un negocio cualquiera", physio);
  for (const id of ["clientes", "soporte", "configuracion", "autenticacion"]) {
    assert.ok(findModule(modules, id), `falta módulo base ${id}`);
  }
});

test("el orden de salida es siempre el orden de declaración de MODULE_CATALOG (determinista)", () => {
  const run1 = resolveModules("clínica de fisioterapia con reservas, pagos y recordatorios", physio).modules.map((m) => m.id);
  const run2 = resolveModules("clínica de fisioterapia con reservas, pagos y recordatorios", physio).modules.map((m) => m.id);
  assert.deepEqual(run1, run2);
});

test("módulos sugeridos (upsell) no se marcan enabled, solo suggested", () => {
  const { modules } = resolveModules("clínica de fisioterapia con reservas", physio);
  const informes = findModule(modules, "informes");
  assert.equal(informes.status, "suggested");
});
