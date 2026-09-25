import { test } from "node:test";
import assert from "node:assert/strict";
import {
  TERMINOLOGY_KEYS,
  BASE_TERMINOLOGY,
  buildTerminology,
  resolveTerm,
  findLeakedSportsTerms,
} from "./terminology.js";

test("la terminología base cubre las 7 claves semánticas y coincide con CP04", () => {
  assert.equal(TERMINOLOGY_KEYS.length, 7);
  assert.equal(BASE_TERMINOLOGY.customer.singular, "jugador");
  assert.equal(BASE_TERMINOLOGY.resource.singular, "pista");
  assert.equal(BASE_TERMINOLOGY.appointment.singular, "reserva");
  assert.equal(BASE_TERMINOLOGY.staff.singular, "entrenador");
});

test("buildTerminology sin overrides devuelve exactamente la base", () => {
  const { dictionary, ignoredKeys } = buildTerminology();
  assert.deepEqual(dictionary, BASE_TERMINOLOGY);
  assert.deepEqual(ignoredKeys, []);
});

test("buildTerminology aplica overrides parciales por clave", () => {
  const { dictionary } = buildTerminology({
    customer: { singular: "paciente", plural: "pacientes", short: "Paciente" },
  });
  assert.equal(dictionary.customer.singular, "paciente");
  assert.equal(dictionary.resource.singular, "pista"); // no tocado, sigue en base
});

test("buildTerminology ignora claves desconocidas sin lanzar", () => {
  const { ignoredKeys } = buildTerminology({ notARealKey: { singular: "x", plural: "y", short: "Z" } });
  assert.deepEqual(ignoredKeys, ["notARealKey"]);
});

test("resolveTerm devuelve singular/plural/short y hace fallback a la base", () => {
  const { dictionary } = buildTerminology({ staff: { singular: "abogado", plural: "abogados", short: "Abogado" } });
  assert.equal(resolveTerm(dictionary, "staff", "plural"), "abogados");
  assert.equal(resolveTerm(dictionary, "event", "singular"), "torneo");
  assert.equal(resolveTerm({}, "customer"), "jugador");
  assert.equal(resolveTerm({}, "unknown-key"), "unknown-key");
});

test("findLeakedSportsTerms no marca nada para el sector pádel", () => {
  assert.deepEqual(findLeakedSportsTerms("padel", BASE_TERMINOLOGY), []);
});

test("findLeakedSportsTerms detecta vocabulario deportivo filtrado en un preset dental", () => {
  const { dictionary } = buildTerminology({
    customer: { singular: "paciente", plural: "pacientes", short: "Paciente" },
    resource: { singular: "pista", plural: "pistas", short: "Pista" }, // filtración deliberada para el test
  });
  const offenders = findLeakedSportsTerms("dental", dictionary);
  assert.ok(offenders.includes("resource.singular"));
  assert.ok(offenders.includes("resource.plural"));
});
