import { test } from "node:test";
import assert from "node:assert/strict";
import { MAKE_INVENTORY } from "./makeInventory.js";
import { MAKE_APP_INTEGRATION_MAP } from "./makeAppIntegrationMap.js";
import {
  MAKE_ARCHITECTURE_MATRIX,
  MAKE_ARCH_ESTADOS,
  MAKE_ARCH_AREAS,
  computeArchitectureResumen,
  filterArchitectureMatrix,
} from "./makeArchitectureMatrix.js";
import { CP04_ROLE_PERMISSIONS, CP04_ROLES } from "../utils/rbac.js";

test("MAKE_ARCHITECTURE_MATRIX: contiene exactamente 50 flujos", () => {
  assert.equal(MAKE_ARCHITECTURE_MATRIX.length, 50);
});

test("MAKE_ARCHITECTURE_MATRIX: no hay ids duplicados", () => {
  const ids = MAKE_ARCHITECTURE_MATRIX.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("MAKE_ARCHITECTURE_MATRIX: coincide 1:1 con MAKE_INVENTORY y MAKE_APP_INTEGRATION_MAP", () => {
  const inventoryIds = new Set(MAKE_INVENTORY.map((s) => s.id));
  const mapIds = new Set(MAKE_APP_INTEGRATION_MAP.map((s) => s.id));
  for (const f of MAKE_ARCHITECTURE_MATRIX) {
    assert.ok(inventoryIds.has(f.id), `id ${f.id} no existe en MAKE_INVENTORY`);
    assert.ok(mapIds.has(f.id), `id ${f.id} no existe en MAKE_APP_INTEGRATION_MAP`);
  }
});

test("MAKE_ARCHITECTURE_MATRIX: todos los estados son uno de los 4 valores permitidos", () => {
  const validos = new Set(Object.values(MAKE_ARCH_ESTADOS));
  assert.equal(validos.size, 4);
  for (const f of MAKE_ARCHITECTURE_MATRIX) {
    assert.ok(validos.has(f.estado), `estado inválido '${f.estado}' en flujo ${f.id}`);
  }
});

test("MAKE_ARCHITECTURE_MATRIX: todas las áreas declaradas están en MAKE_ARCH_AREAS", () => {
  const areasValidas = new Set(MAKE_ARCH_AREAS);
  for (const f of MAKE_ARCHITECTURE_MATRIX) {
    assert.ok(areasValidas.has(f.area), `área desconocida '${f.area}' en flujo ${f.id}`);
  }
});

test("MAKE_ARCHITECTURE_MATRIX: cada flujo declara al menos un rol autorizado válido", () => {
  const rolesValidos = new Set(CP04_ROLES);
  for (const f of MAKE_ARCHITECTURE_MATRIX) {
    assert.ok(Array.isArray(f.rolesAutorizados) && f.rolesAutorizados.length > 0, `flujo ${f.id} sin roles autorizados`);
    for (const rol of f.rolesAutorizados) {
      assert.ok(rolesValidos.has(rol), `rol inválido '${rol}' en flujo ${f.id}`);
    }
  }
});

test("MAKE_ARCHITECTURE_MATRIX: la ruta de cada flujo existe como sección real permitida a alguno de sus roles autorizados", () => {
  for (const f of MAKE_ARCHITECTURE_MATRIX) {
    for (const rol of f.rolesAutorizados) {
      assert.ok(
        CP04_ROLE_PERMISSIONS[rol].includes(f.ruta),
        `flujo ${f.id} (${f.nombre}): el rol ${rol} no tiene acceso a la ruta declarada '${f.ruta}'`
      );
    }
  }
});

test("MAKE_ARCHITECTURE_MATRIX: solo Alta de Jugador está marcado como operational con probadoE2E=true, con evidencia objetiva", () => {
  const operativos = MAKE_ARCHITECTURE_MATRIX.filter((f) => f.estado === MAKE_ARCH_ESTADOS.OPERATIONAL);
  assert.equal(operativos.length, 1, "no debe declararse ningún flujo operativo sin evidencia objetiva de ejecución E2E real");
  assert.equal(operativos[0].id, 6199248);
  assert.equal(operativos[0].probadoE2E, true);
});

test("MAKE_ARCHITECTURE_MATRIX: probadoE2E=true únicamente en flujos con estado operational (ningún otro estado finge validación E2E)", () => {
  for (const f of MAKE_ARCHITECTURE_MATRIX) {
    if (f.probadoE2E) {
      assert.equal(f.estado, MAKE_ARCH_ESTADOS.OPERATIONAL, `flujo ${f.id} tiene probadoE2E=true sin estado operational`);
    }
  }
});

test("MAKE_ARCHITECTURE_MATRIX: los flujos planned no tienen contrato preparado ni interfaz completa", () => {
  for (const f of MAKE_ARCHITECTURE_MATRIX) {
    if (f.estado === MAKE_ARCH_ESTADOS.PLANNED) {
      assert.equal(f.tieneContratoPreparado, false, `flujo planificado ${f.id} no debería tener contrato preparado`);
    }
  }
});

test("MAKE_ARCHITECTURE_MATRIX: ningún flujo expone tokens, secrets ni URLs de webhook en sus campos de texto", () => {
  const camposTexto = ["nombre", "descripcion", "accionIniciadora", "datosEntrada", "resultadoEsperado", "ultimaValidacionConocida", "siguienteAccionNecesaria"];
  const patronSospechoso = /(https?:\/\/hook|https?:\/\/[^ ]*webhook[^ ]*\/[a-z0-9]{16,}|sk_live|sk_test|Bearer [A-Za-z0-9._-]{10,})/i;
  for (const f of MAKE_ARCHITECTURE_MATRIX) {
    for (const campo of camposTexto) {
      assert.doesNotMatch(String(f[campo] || ""), patronSospechoso, `posible secreto/URL de webhook expuesto en flujo ${f.id}, campo ${campo}`);
    }
  }
});

test("computeArchitectureResumen: los contadores por estado suman exactamente el total y coinciden con un recuento manual", () => {
  const resumen = computeArchitectureResumen(MAKE_ARCHITECTURE_MATRIX);
  assert.equal(resumen.total, 50);
  const suma = Object.values(resumen.porEstado).reduce((a, b) => a + b, 0);
  assert.equal(suma, 50);

  const manual = { operational: 0, prepared: 0, externally_blocked: 0, planned: 0 };
  for (const f of MAKE_ARCHITECTURE_MATRIX) manual[f.estado] += 1;
  assert.deepEqual(resumen.porEstado, manual);
});

test("computeArchitectureResumen: los contadores por área suman exactamente el total", () => {
  const resumen = computeArchitectureResumen(MAKE_ARCHITECTURE_MATRIX);
  const suma = Object.values(resumen.porArea).reduce((a, b) => a + b, 0);
  assert.equal(suma, 50);
});

test("computeArchitectureResumen: no admite un array vacío como matriz por defecto (usa siempre MAKE_ARCHITECTURE_MATRIX)", () => {
  const resumen = computeArchitectureResumen([]);
  assert.equal(resumen.total, 0);
  assert.equal(resumen.porEstado[MAKE_ARCH_ESTADOS.OPERATIONAL], 0);
});

test("filterArchitectureMatrix: sin filtros devuelve la matriz completa", () => {
  assert.equal(filterArchitectureMatrix(MAKE_ARCHITECTURE_MATRIX, {}).length, 50);
});

test("filterArchitectureMatrix: filtra por área correctamente", () => {
  const reservas = filterArchitectureMatrix(MAKE_ARCHITECTURE_MATRIX, { area: "Reservas" });
  assert.ok(reservas.length > 0);
  for (const f of reservas) assert.equal(f.area, "Reservas");
});

test("filterArchitectureMatrix: filtra por estado correctamente", () => {
  const planificados = filterArchitectureMatrix(MAKE_ARCHITECTURE_MATRIX, { estado: MAKE_ARCH_ESTADOS.PLANNED });
  assert.equal(planificados.length, 10);
  for (const f of planificados) assert.equal(f.estado, MAKE_ARCH_ESTADOS.PLANNED);
});

test("filterArchitectureMatrix: filtra por rol autorizado correctamente", () => {
  const dePlayer = filterArchitectureMatrix(MAKE_ARCHITECTURE_MATRIX, { rol: "PLAYER" });
  for (const f of dePlayer) assert.ok(f.rolesAutorizados.includes("PLAYER"));
  // PLAYER solo debe ver flujos de cara al jugador, nunca los de gestión interna.
  assert.ok(dePlayer.length < MAKE_ARCHITECTURE_MATRIX.length);
});

test("filterArchitectureMatrix: combinando filtros aplica todas las condiciones (AND, no OR)", () => {
  const resultado = filterArchitectureMatrix(MAKE_ARCHITECTURE_MATRIX, { area: "Jugadores", estado: MAKE_ARCH_ESTADOS.EXTERNALLY_BLOCKED });
  for (const f of resultado) {
    assert.equal(f.area, "Jugadores");
    assert.equal(f.estado, MAKE_ARCH_ESTADOS.EXTERNALLY_BLOCKED);
  }
});
