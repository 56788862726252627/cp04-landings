import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  listaEsperaAdd,
  listaEsperaSetEstado,
  listaEsperaRemove,
  listaEsperaGetActivos,
  LISTA_ESPERA_ESTADOS,
} from "./listaEsperaLocal.js";

// listaEsperaLoad / listaEsperaSave usan window.localStorage y son pruebas de
// integración browser; no se incluyen aquí. Todas las funciones de transformación
// son puras y se prueban directamente.

const FORM_MINIMO = {
  nombre: "María",
  apellidos: "García López",
  email: "maria@ejemplo.es",
  telefono: "611222333",
  pista_preferida: "Pista 1",
  fecha_preferida: "2026-10-15",
  observaciones: "Prefiere mañanas",
};

describe("listaEsperaAdd", () => {
  it("añade una entrada con estado pendiente", () => {
    const result = listaEsperaAdd([], FORM_MINIMO);
    assert.equal(result.length, 1);
    assert.equal(result[0].estado, "pendiente");
    assert.equal(result[0].nombre, "María");
    assert.equal(result[0].apellidos, "García López");
  });

  it("normaliza el email a minúsculas", () => {
    const result = listaEsperaAdd([], { ...FORM_MINIMO, email: "MARIA@EJEMPLO.ES" });
    assert.equal(result[0].email, "maria@ejemplo.es");
  });

  it("recorta espacios en nombre, apellidos y observaciones", () => {
    const result = listaEsperaAdd([], { ...FORM_MINIMO, nombre: "  Ana  ", apellidos: "  Ruiz  ", observaciones: "  Nota  " });
    assert.equal(result[0].nombre, "Ana");
    assert.equal(result[0].apellidos, "Ruiz");
    assert.equal(result[0].observaciones, "Nota");
  });

  it("genera ids únicos para dos entradas consecutivas", () => {
    const r1 = listaEsperaAdd([], FORM_MINIMO);
    const r2 = listaEsperaAdd(r1, FORM_MINIMO);
    assert.notEqual(r2[0].id, r2[1].id);
    assert.match(r2[0].id, /^le-\d+-[a-z0-9]+$/);
  });

  it("asigna createdAt como ISO string válido", () => {
    const result = listaEsperaAdd([], FORM_MINIMO);
    const parsed = new Date(result[0].createdAt);
    assert.ok(!Number.isNaN(parsed.getTime()));
  });

  it("no muta el array original", () => {
    const original = [];
    listaEsperaAdd(original, FORM_MINIMO);
    assert.equal(original.length, 0);
  });

  it("acepta campos opcionales vacíos sin error", () => {
    const form = { nombre: "Juan", apellidos: "Pérez", email: "j@e.es", telefono: "600000000" };
    const result = listaEsperaAdd([], form);
    assert.equal(result[0].pista_preferida, "");
    assert.equal(result[0].fecha_preferida, "");
    assert.equal(result[0].observaciones, "");
  });
});

describe("listaEsperaSetEstado", () => {
  it("cambia el estado de la entrada correcta", () => {
    const entries = listaEsperaAdd([], FORM_MINIMO);
    const updated = listaEsperaSetEstado(entries, entries[0].id, "promovido");
    assert.equal(updated[0].estado, "promovido");
  });

  it("no modifica otras entradas al cambiar una", () => {
    let entries = listaEsperaAdd([], FORM_MINIMO);
    entries = listaEsperaAdd(entries, { ...FORM_MINIMO, nombre: "Pedro" });
    const updated = listaEsperaSetEstado(entries, entries[0].id, "contactado");
    assert.equal(updated[0].estado, "contactado");
    assert.equal(updated[1].estado, "pendiente");
  });

  it("ignora un estado no válido y devuelve la lista sin cambios", () => {
    const entries = listaEsperaAdd([], FORM_MINIMO);
    const result = listaEsperaSetEstado(entries, entries[0].id, "inexistente");
    assert.equal(result[0].estado, "pendiente");
  });

  it("id inexistente no modifica ninguna entrada", () => {
    const entries = listaEsperaAdd([], FORM_MINIMO);
    const result = listaEsperaSetEstado(entries, "id-que-no-existe", "promovido");
    assert.equal(result[0].estado, "pendiente");
  });

  it("acepta los cuatro estados válidos", () => {
    for (const estado of LISTA_ESPERA_ESTADOS) {
      const entries = listaEsperaAdd([], FORM_MINIMO);
      const result = listaEsperaSetEstado(entries, entries[0].id, estado);
      assert.equal(result[0].estado, estado, `Falló para estado: ${estado}`);
    }
  });
});

describe("listaEsperaRemove", () => {
  it("elimina la entrada con el id dado", () => {
    const entries = listaEsperaAdd([], FORM_MINIMO);
    const result = listaEsperaRemove(entries, entries[0].id);
    assert.equal(result.length, 0);
  });

  it("no elimina otras entradas", () => {
    let entries = listaEsperaAdd([], FORM_MINIMO);
    entries = listaEsperaAdd(entries, { ...FORM_MINIMO, nombre: "Pedro" });
    const result = listaEsperaRemove(entries, entries[0].id);
    assert.equal(result.length, 1);
    assert.equal(result[0].nombre, "Pedro");
  });

  it("id inexistente devuelve la lista original intacta", () => {
    const entries = listaEsperaAdd([], FORM_MINIMO);
    const result = listaEsperaRemove(entries, "no-existe");
    assert.equal(result.length, 1);
  });

  it("no muta el array original", () => {
    const entries = listaEsperaAdd([], FORM_MINIMO);
    const copy = [...entries];
    listaEsperaRemove(entries, entries[0].id);
    assert.deepEqual(entries, copy);
  });
});

describe("listaEsperaGetActivos", () => {
  it("excluye entradas con estado eliminado", () => {
    let entries = listaEsperaAdd([], FORM_MINIMO);
    entries = listaEsperaSetEstado(entries, entries[0].id, "eliminado");
    assert.equal(listaEsperaGetActivos(entries).length, 0);
  });

  it("incluye pendiente, contactado y promovido", () => {
    let entries = [];
    entries = listaEsperaAdd(entries, FORM_MINIMO);
    entries = listaEsperaAdd(entries, FORM_MINIMO);
    entries = listaEsperaAdd(entries, FORM_MINIMO);
    entries = listaEsperaSetEstado(entries, entries[0].id, "contactado");
    entries = listaEsperaSetEstado(entries, entries[1].id, "promovido");
    const activos = listaEsperaGetActivos(entries);
    assert.equal(activos.length, 3);
  });

  it("lista vacía devuelve array vacío", () => {
    assert.deepEqual(listaEsperaGetActivos([]), []);
  });

  it("no muta el array original", () => {
    let entries = listaEsperaAdd([], FORM_MINIMO);
    entries = listaEsperaSetEstado(entries, entries[0].id, "eliminado");
    const original = [...entries];
    listaEsperaGetActivos(entries);
    assert.deepEqual(entries, original);
  });
});

describe("LISTA_ESPERA_ESTADOS", () => {
  it("incluye los cuatro estados esperados", () => {
    for (const estado of ["pendiente", "contactado", "promovido", "eliminado"]) {
      assert.ok(LISTA_ESPERA_ESTADOS.includes(estado), `Falta estado: ${estado}`);
    }
  });

  it("tiene exactamente 4 estados", () => {
    assert.equal(LISTA_ESPERA_ESTADOS.length, 4);
  });

  it("es inmutable (Object.freeze)", () => {
    assert.throws(() => {
      LISTA_ESPERA_ESTADOS.push("nuevo");
    });
  });
});
