import test from "node:test";
import assert from "node:assert/strict";

import {
  TORNEO_CATEGORIAS,
  TORNEO_MODALIDADES,
  validateTorneoNombre,
  validateTorneoFecha,
  validateTorneoHora,
  validateTorneoCategoria,
  validateTorneoModalidad,
  validateTorneoCustomCount,
  validateTorneoParejasCompletas,
  validateTorneoParejasDuplicadas,
  validateTorneoParaPublicar,
  torneoFirstErrorMessage,
  torneoIsPairNamed,
  torneoCanMarkWinner,
  torneoEligibleForBye,
  torneoPairHasAdvanced,
  torneoSanitizePairs,
} from "./torneoValidation.js";
import { torneoBuildFullBracket } from "./torneoBracket.js";

const HOY = "2026-07-11";
const MANANA = "2026-07-12";
const AYER = "2026-07-10";

function makePair(id, p1, p2) {
  return { id, player1: p1, player2: p2 };
}

const parejasValidas = [makePair("p1", "Ana López", "Sofía Ruiz"), makePair("p2", "Luis Gil", "Marta Vega")];
const bracketValido = torneoBuildFullBracket(parejasValidas, null);

function torneoValidoBase(overrides = {}) {
  return {
    nombre: "Torneo de Verano",
    fecha: MANANA,
    hora: "10:00",
    categoria: "Mixto",
    modalidad: "Eliminación directa",
    pairs: parejasValidas,
    bracket: bracketValido,
    todayISOStr: HOY,
    ...overrides,
  };
}

// 1. nombre vacío
test("nombre vacío es inválido", () => {
  assert.equal(validateTorneoNombre(""), "El nombre del torneo es obligatorio.");
  assert.equal(validateTorneoNombre("   "), "El nombre del torneo es obligatorio.");
  assert.equal(validateTorneoNombre(undefined), "El nombre del torneo es obligatorio.");
});

// 2. nombre válido
test("nombre válido no produce error", () => {
  assert.equal(validateTorneoNombre("Torneo de Verano"), null);
});

test("nombre demasiado corto o demasiado largo es inválido", () => {
  assert.match(validateTorneoNombre("ab"), /al menos/);
  assert.match(validateTorneoNombre("x".repeat(81)), /superar/);
});

// 3. fecha inválida
test("fecha inválida (formato, fecha inexistente, o pasada) es inválida", () => {
  assert.match(validateTorneoFecha("", HOY), /obligatoria/);
  assert.match(validateTorneoFecha("11-07-2026", HOY), /formato/);
  assert.match(validateTorneoFecha("2026-02-30", HOY), /fecha real/);
  assert.match(validateTorneoFecha(AYER, HOY), /anterior a hoy/);
});

// 4. fecha válida
test("fecha válida (hoy o futuro, formato real) no produce error", () => {
  assert.equal(validateTorneoFecha(HOY, HOY), null);
  assert.equal(validateTorneoFecha(MANANA, HOY), null);
});

// 5. hora inválida
test("hora inválida es inválida", () => {
  assert.match(validateTorneoHora(""), /obligatoria/);
  assert.match(validateTorneoHora("25:00"), /formato/);
  assert.match(validateTorneoHora("10-30"), /formato/);
});

// 6. hora válida
test("hora válida no produce error", () => {
  assert.equal(validateTorneoHora("09:30"), null);
  assert.equal(validateTorneoHora("23:59"), null);
});

// 7. categoría ausente
test("categoría ausente es inválida", () => {
  assert.match(validateTorneoCategoria(""), /Selecciona/);
});

// 8. categoría válida
test("categoría válida (vocabulario ya usado en RANKING_PRO/i18n) no produce error", () => {
  for (const c of TORNEO_CATEGORIAS) assert.equal(validateTorneoCategoria(c), null);
  assert.match(validateTorneoCategoria("Otra cosa"), /no válida/);
});

// 9. modalidad ausente
test("modalidad ausente es inválida", () => {
  assert.match(validateTorneoModalidad(""), /Selecciona/);
});

// 10. modalidad válida
test("modalidad válida (única soportada por el motor) no produce error", () => {
  for (const m of TORNEO_MODALIDADES) assert.equal(validateTorneoModalidad(m), null);
  assert.match(validateTorneoModalidad("Liga"), /no válida/);
});

// 11. formato (Personalizado) inválido
test("formato personalizado inválido: no numérico, impar en jugadores, fuera de rango", () => {
  assert.equal(validateTorneoCustomCount("pairs", "abc").ok, false);
  assert.equal(validateTorneoCustomCount("players", "7").ok, false); // impar
  assert.equal(validateTorneoCustomCount("players", "1").ok, false); // < 2
  assert.equal(validateTorneoCustomCount("players", "66").ok, false); // > 64
  assert.equal(validateTorneoCustomCount("pairs", "33").ok, false); // > 32
});

// 12. formato personalizado válido
test("formato personalizado válido calcula el nº de parejas correctamente", () => {
  assert.deepEqual(validateTorneoCustomCount("pairs", "9"), { ok: true, count: 9 });
  assert.deepEqual(validateTorneoCustomCount("players", "18"), { ok: true, count: 9 });
});

// 13. número de parejas inválido
test("número de parejas inválido: cero parejas o parejas incompletas", () => {
  assert.match(validateTorneoParejasCompletas([]), /Añade al menos/);
  assert.match(validateTorneoParejasCompletas([makePair("p1", "Ana López", "")]), /ambos jugadores/);
  assert.match(validateTorneoParejasCompletas([makePair("p1", "", "Sofía Ruiz")]), /ambos jugadores/);
});

test("número de parejas válido: todas completas", () => {
  assert.equal(validateTorneoParejasCompletas(parejasValidas), null);
});

// 14. Personalizado válido (nº de parejas, caso 9 — no potencia de 2)
test("Personalizado válido con 9 parejas (no potencia de 2) es una cuenta de parejas válida", () => {
  const r = validateTorneoCustomCount("pairs", "9");
  assert.equal(r.ok, true);
  assert.equal(r.count, 9);
});

// 15. Personalizado inválido
test("Personalizado inválido con 0 o negativo", () => {
  assert.equal(validateTorneoCustomCount("pairs", "0").ok, false);
  assert.equal(validateTorneoCustomCount("pairs", "-3").ok, false);
});

// Duplicados (parte de "evitar duplicados accidentales", Fase 2)
test("detecta jugador duplicado entre dos parejas distintas", () => {
  const pairs = [makePair("p1", "Ana López", "Sofía Ruiz"), makePair("p2", "ana lópez", "Marta Vega")];
  assert.match(validateTorneoParejasDuplicadas(pairs), /aparece en más de una pareja/);
});

test("detecta pareja duplicada (mismos dos nombres, distinto orden) vía el propio chequeo por jugador", () => {
  const pairs = [makePair("p1", "Ana López", "Sofía Ruiz"), makePair("p2", "Sofía Ruiz", "Ana López")];
  assert.match(validateTorneoParejasDuplicadas(pairs), /aparece en más de una pareja/);
});

test("sin duplicados no produce error", () => {
  assert.equal(validateTorneoParejasDuplicadas(parejasValidas), null);
});

// 16. publicación válida
test("publicación válida: torneo completo (nombre/fecha/hora/categoría/modalidad/parejas/bracket) pasa íntegro", () => {
  const r = validateTorneoParaPublicar(torneoValidoBase());
  assert.equal(r.ok, true);
  assert.deepEqual(r.errors, {});
});

// 17. publicación bloqueada por datos incompletos
test("publicación bloqueada: faltan nombre/fecha/hora/categoría/modalidad", () => {
  const r = validateTorneoParaPublicar(torneoValidoBase({ nombre: "", fecha: "", hora: "", categoria: "", modalidad: "" }));
  assert.equal(r.ok, false);
  assert.ok(r.errors.nombre);
  assert.ok(r.errors.fecha);
  assert.ok(r.errors.hora);
  assert.ok(r.errors.categoria);
  assert.ok(r.errors.modalidad);
});

test("publicación bloqueada: sin bracket generado (aunque el resto sea válido)", () => {
  const r = validateTorneoParaPublicar(torneoValidoBase({ bracket: [] }));
  assert.equal(r.ok, false);
  assert.match(r.errors.bracket, /Reordenar cruces/);
});

test("publicación bloqueada: parejas incompletas o duplicadas, con mensaje de primer error disponible", () => {
  const r = validateTorneoParaPublicar(torneoValidoBase({ pairs: [makePair("p1", "Ana López", "")] }));
  assert.equal(r.ok, false);
  assert.ok(r.errors.parejas);
  assert.equal(torneoFirstErrorMessage(r.errors), r.errors.parejas);
});

// 18. guardar borrador — GUARDAR no pasa por esta validación (Fase 3): un
// objeto de torneo a medias es una entrada perfectamente representable,
// esta prueba documenta que la validación de publicación NO lanza ni
// bloquea nada al recibir un borrador a medias, solo informa (ok:false +
// errores), dejando que sea App.jsx (handlePublish) quien decida bloquear
// la publicación sin tocar el guardado.
test("guardar borrador: un torneo a medias no lanza excepción, solo reporta qué falta", () => {
  assert.doesNotThrow(() => validateTorneoParaPublicar({ pairs: [], bracket: [], todayISOStr: HOY }));
  const r = validateTorneoParaPublicar({ pairs: [], bracket: [], todayISOStr: HOY });
  assert.equal(r.ok, false);
});

// 19. no pérdida de datos: la validación es de solo lectura, no muta pairs/bracket de entrada
test("la validación no muta los datos de entrada (no pérdida de datos)", () => {
  const pairsInput = [makePair("p1", "Ana López", "Sofía Ruiz")];
  const bracketInput = torneoBuildFullBracket(pairsInput, null);
  const snapshotPairs = JSON.stringify(pairsInput);
  const snapshotBracket = JSON.stringify(bracketInput);
  validateTorneoParaPublicar(torneoValidoBase({ pairs: pairsInput, bracket: bracketInput }));
  assert.equal(JSON.stringify(pairsInput), snapshotPairs);
  assert.equal(JSON.stringify(bracketInput), snapshotBracket);
});

// 20-23: compatibilidad con el motor de bracket para N=8/16/32/Personalizado
// no potencia de 2 — el motor en sí ya tiene 38 tests dedicados en
// torneoBracket.test.mjs (Lote C); aquí solo se confirma que la capa de
// validación de publicación es agnóstica al tamaño N (no reintroduce el
// P0 de bracket, no exige que N sea potencia de 2).
for (const n of [8, 16, 32, 9]) {
  test(`publicación válida es alcanzable con N=${n} parejas (compatibilidad con el motor de bracket, incluye no potencia de 2)`, () => {
    const pairs = Array.from({ length: n }, (_, i) => makePair(`p${i}`, `Jugador ${i}A`, `Jugador ${i}B`));
    const bracket = torneoBuildFullBracket(pairs, n % 2 !== 0 ? pairs[0].id : null);
    const r = validateTorneoParaPublicar(torneoValidoBase({ pairs, bracket }));
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });
}

// --- Cierre funcional local (2026-07-12) ---------------------------------

test("torneoIsPairNamed: true si player1 o player2 tienen contenido, false si ambos están vacíos/solo espacios", () => {
  assert.equal(torneoIsPairNamed(makePair("p1", "Ana", "")), true);
  assert.equal(torneoIsPairNamed(makePair("p1", "", "Sofía")), true);
  assert.equal(torneoIsPairNamed(makePair("p1", "", "")), false);
  assert.equal(torneoIsPairNamed(makePair("p1", "   ", "  ")), false);
  assert.equal(torneoIsPairNamed(null), false);
  assert.equal(torneoIsPairNamed(undefined), false);
});

test("torneoCanMarkWinner: requiere que AMBOS lados del cruce tengan nombre, no solo el que se marca ganador", () => {
  const conNombre = makePair("p1", "Ana", "Sofía");
  const vacia = makePair("p2", "", "");
  assert.equal(torneoCanMarkWinner(conNombre, makePair("p3", "Luis", "Marta")), true);
  assert.equal(torneoCanMarkWinner(conNombre, vacia), false, "no debe poder marcarse ganador si el rival está vacío");
  assert.equal(torneoCanMarkWinner(vacia, conNombre), false, "tampoco al revés");
});

test("torneoEligibleForBye: excluye del sorteo a las parejas sin nombre cuando hay al menos una completa", () => {
  const pairs = [
    makePair("p1", "Ana", "Sofía"),
    makePair("p2", "", ""),
    makePair("p3", "Luis", "Marta"),
  ];
  const eligible = torneoEligibleForBye(pairs);
  assert.deepEqual(eligible.map((p) => p.id), ["p1", "p3"]);
});

test("torneoEligibleForBye: si NINGUNA pareja tiene nombre, devuelve todas (no bloquea el sorteo de un cuadro recién creado)", () => {
  const pairs = [makePair("p1", "", ""), makePair("p2", "", "")];
  const eligible = torneoEligibleForBye(pairs);
  assert.deepEqual(eligible.map((p) => p.id), ["p1", "p2"]);
});

test("torneoEligibleForBye: lista vacía devuelve lista vacía, no lanza", () => {
  assert.deepEqual(torneoEligibleForBye([]), []);
  assert.deepEqual(torneoEligibleForBye(undefined), []);
});

test("torneoPairHasAdvanced: true si la pareja aparece como winner en algún partido del bracket", () => {
  const pairs = [makePair("p1", "Ana", "Sofía"), makePair("p2", "Luis", "Marta")];
  const bracket = torneoBuildFullBracket(pairs, null);
  const jugado = bracket.map((m) => (m.pairA === "p1" ? { ...m, winner: "p1" } : m));
  assert.equal(torneoPairHasAdvanced("p1", jugado), true);
  assert.equal(torneoPairHasAdvanced("p2", jugado), false);
});

test("torneoPairHasAdvanced: false para un bracket vacío o sin resultados, nunca lanza", () => {
  assert.equal(torneoPairHasAdvanced("p1", []), false);
  assert.equal(torneoPairHasAdvanced("p1", undefined), false);
});

test("torneoSanitizePairs: conserva parejas con forma válida tal cual", () => {
  const input = [makePair("p1", "Ana", "Sofía"), makePair("p2", "Luis", "Marta")];
  assert.deepEqual(torneoSanitizePairs(input), input);
});

test("torneoSanitizePairs: descarta entradas sin id utilizable (localStorage manipulado a mano)", () => {
  const input = [makePair("p1", "Ana", "Sofía"), { player1: "Sin id", player2: "" }, null, "no es objeto", 42];
  const sane = torneoSanitizePairs(input);
  assert.deepEqual(sane, [{ id: "p1", player1: "Ana", player2: "Sofía" }]);
});

test("torneoSanitizePairs: normaliza player1/player2 no-string a cadena vacía en vez de crashear más adelante", () => {
  const input = [{ id: "p1", player1: 123, player2: null }];
  assert.deepEqual(torneoSanitizePairs(input), [{ id: "p1", player1: "", player2: "" }]);
});

test("torneoSanitizePairs: entrada no-array (undefined/null/objeto suelto) devuelve lista vacía, no lanza", () => {
  assert.deepEqual(torneoSanitizePairs(undefined), []);
  assert.deepEqual(torneoSanitizePairs(null), []);
  assert.deepEqual(torneoSanitizePairs({}), []);
});
