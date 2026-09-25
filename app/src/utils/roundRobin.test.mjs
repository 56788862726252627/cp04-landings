import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ROUND_ROBIN_POINTS,
  buildRoundRobinMatches,
  getRoundRobinRestingPairId,
  getRoundRobinTotalRounds,
  applyRoundRobinResult,
  computeRoundRobinStandings,
  sortRoundRobinStandings,
  isRoundRobinComplete,
  getRoundRobinChampion,
} from "./roundRobin.js";

function makePairs(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    player1: `Jugador${i}A`,
    player2: `Jugador${i}B`,
  }));
}

function unorderedKey(a, b) {
  return [a, b].sort().join("|");
}

// --- Generación de calendario ---

test("buildRoundRobinMatches: con 4 parejas (par) genera exactamente C(4,2)=6 partidos, sin descansos", () => {
  const pairs = makePairs(4);
  const matches = buildRoundRobinMatches(pairs);
  assert.equal(matches.length, 6);
  const totalRounds = getRoundRobinTotalRounds(matches);
  assert.equal(totalRounds, 3);
  for (let r = 1; r <= totalRounds; r++) {
    assert.equal(getRoundRobinRestingPairId(pairs, matches, r), null);
  }
});

test("buildRoundRobinMatches: con 5 parejas (impar) genera C(5,2)=10 partidos y cada pareja descansa exactamente una jornada", () => {
  const pairs = makePairs(5);
  const matches = buildRoundRobinMatches(pairs);
  assert.equal(matches.length, 10);
  const totalRounds = getRoundRobinTotalRounds(matches);
  assert.equal(totalRounds, 5);

  const restCounts = new Map(pairs.map((p) => [p.id, 0]));
  for (let r = 1; r <= totalRounds; r++) {
    const restingId = getRoundRobinRestingPairId(pairs, matches, r);
    assert.ok(restingId, `la jornada ${r} debe tener una pareja que descansa`);
    restCounts.set(restingId, restCounts.get(restingId) + 1);
  }
  for (const [, count] of restCounts) {
    assert.equal(count, 1, "cada pareja debe descansar exactamente una jornada");
  }
});

test("buildRoundRobinMatches: nunca genera un descanso como partido visible (ninguna pareja rival es null)", () => {
  const pairs = makePairs(7);
  const matches = buildRoundRobinMatches(pairs);
  matches.forEach((m) => {
    assert.notEqual(m.pairA, null);
    assert.notEqual(m.pairB, null);
  });
});

test("buildRoundRobinMatches: ninguna pareja se enfrenta dos veces a la misma rival (sin duplicados)", () => {
  const pairs = makePairs(8);
  const matches = buildRoundRobinMatches(pairs);
  const seen = new Set();
  matches.forEach((m) => {
    const key = unorderedKey(m.pairA, m.pairB);
    assert.equal(seen.has(key), false, `enfrentamiento duplicado: ${key}`);
    seen.add(key);
  });
  // Con 8 parejas, cada una debe cruzarse con las otras 7 exactamente una vez.
  assert.equal(seen.size, (8 * 7) / 2);
});

test("buildRoundRobinMatches: con menos de 2 parejas no genera ningún partido (nada que jugar)", () => {
  assert.deepEqual(buildRoundRobinMatches(makePairs(0)), []);
  assert.deepEqual(buildRoundRobinMatches(makePairs(1)), []);
});

test("buildRoundRobinMatches: con 2 parejas genera un único partido", () => {
  const matches = buildRoundRobinMatches(makePairs(2));
  assert.equal(matches.length, 1);
  assert.equal(matches[0].played, false);
});

// --- Registro de resultados ---

test("applyRoundRobinResult: registra un resultado válido y marca el partido como jugado", () => {
  const matches = buildRoundRobinMatches(makePairs(2));
  const matchId = matches[0].id;
  const res = applyRoundRobinResult(matches, matchId, 6, 3);
  assert.equal(res.ok, true);
  const updated = res.matches.find((m) => m.id === matchId);
  assert.equal(updated.played, true);
  assert.equal(updated.scoreA, 6);
  assert.equal(updated.scoreB, 3);
});

test("applyRoundRobinResult: rechaza un resultado empatado (el pádel no tiene empates)", () => {
  const matches = buildRoundRobinMatches(makePairs(2));
  const res = applyRoundRobinResult(matches, matches[0].id, 5, 5);
  assert.equal(res.ok, false);
  assert.equal(res.error, "INVALID_RESULT");
  assert.equal(res.matches[0].played, false, "el partido no debe quedar modificado tras un resultado inválido");
});

test("applyRoundRobinResult: rechaza puntuaciones negativas o no enteras", () => {
  const matches = buildRoundRobinMatches(makePairs(2));
  assert.equal(applyRoundRobinResult(matches, matches[0].id, -1, 3).ok, false);
  assert.equal(applyRoundRobinResult(matches, matches[0].id, 2.5, 3).ok, false);
  assert.equal(applyRoundRobinResult(matches, matches[0].id, NaN, 3).ok, false);
});

test("applyRoundRobinResult: rechaza un id de partido inexistente", () => {
  const matches = buildRoundRobinMatches(makePairs(2));
  const res = applyRoundRobinResult(matches, "no-existe", 6, 3);
  assert.equal(res.ok, false);
  assert.equal(res.error, "MATCH_NOT_FOUND");
});

test("applyRoundRobinResult: permite cambiar un resultado ya guardado", () => {
  const pairs = makePairs(2);
  let matches = buildRoundRobinMatches(pairs);
  const matchId = matches[0].id;
  matches = applyRoundRobinResult(matches, matchId, 6, 3).matches;
  const res2 = applyRoundRobinResult(matches, matchId, 4, 6);
  assert.equal(res2.ok, true);
  const updated = res2.matches.find((m) => m.id === matchId);
  assert.equal(updated.scoreA, 4);
  assert.equal(updated.scoreB, 6);
});

// --- Clasificación ---

test("computeRoundRobinStandings: calcula PJ/PG/PP/PF/PC/diferencia/puntos correctamente", () => {
  const pairs = makePairs(3);
  let matches = buildRoundRobinMatches(pairs); // p0-p1, p0-p2, p1-p2 en algún orden
  matches = applyRoundRobinResult(matches, matches.find((m) => unorderedKey(m.pairA, m.pairB) === unorderedKey("p0", "p1")).id, 6, 2).matches;
  matches = applyRoundRobinResult(matches, matches.find((m) => unorderedKey(m.pairA, m.pairB) === unorderedKey("p0", "p2")).id, 3, 6).matches;
  matches = applyRoundRobinResult(matches, matches.find((m) => unorderedKey(m.pairA, m.pairB) === unorderedKey("p1", "p2")).id, 6, 1).matches;

  const standings = computeRoundRobinStandings(pairs, matches);
  const byId = Object.fromEntries(standings.map((s) => [s.pairId, s]));

  // p0: gana a p1 (6-2), pierde con p2 (3-6) -> 1 victoria, 1 derrota
  assert.equal(byId.p0.played, 2);
  assert.equal(byId.p0.won, 1);
  assert.equal(byId.p0.lost, 1);
  assert.equal(byId.p0.scoreFor, 9);
  assert.equal(byId.p0.scoreAgainst, 8);
  assert.equal(byId.p0.diff, 1);
  assert.equal(byId.p0.points, ROUND_ROBIN_POINTS.win + ROUND_ROBIN_POINTS.loss);

  // p1: pierde con p0 (2-6), gana a p2 (6-1)
  assert.equal(byId.p1.won, 1);
  assert.equal(byId.p1.lost, 1);

  // p2: gana a p0 (6-3), pierde con p1 (1-6)
  assert.equal(byId.p2.won, 1);
  assert.equal(byId.p2.lost, 1);
});

test("computeRoundRobinStandings: ignora partidos sin jugar (no cuentan en PJ ni en puntos)", () => {
  const pairs = makePairs(2);
  const matches = buildRoundRobinMatches(pairs); // sin resultado
  const standings = computeRoundRobinStandings(pairs, matches);
  standings.forEach((s) => {
    assert.equal(s.played, 0);
    assert.equal(s.points, 0);
  });
});

test("computeRoundRobinStandings: actualiza la clasificación al cambiar un resultado ya guardado", () => {
  const pairs = makePairs(2);
  let matches = buildRoundRobinMatches(pairs);
  const matchId = matches[0].id;
  matches = applyRoundRobinResult(matches, matchId, 6, 3).matches;
  let standings = computeRoundRobinStandings(pairs, matches);
  assert.equal(standings.find((s) => s.pairId === "p0").won, 1);

  // Se corrige el resultado: ahora gana p1
  matches = applyRoundRobinResult(matches, matchId, 3, 6).matches;
  standings = computeRoundRobinStandings(pairs, matches);
  assert.equal(standings.find((s) => s.pairId === "p0").won, 0);
  assert.equal(standings.find((s) => s.pairId === "p0").lost, 1);
  assert.equal(standings.find((s) => s.pairId === "p1").won, 1);
});

// --- Desempates ---

test("sortRoundRobinStandings: ordena primero por puntos de clasificación (descendente)", () => {
  const standings = [
    { pairId: "a", points: 3, diff: 0, scoreFor: 0 },
    { pairId: "b", points: 6, diff: 0, scoreFor: 0 },
    { pairId: "c", points: 0, diff: 0, scoreFor: 0 },
  ];
  const sorted = sortRoundRobinStandings(standings, []);
  assert.deepEqual(sorted.map((s) => s.pairId), ["b", "a", "c"]);
});

test("sortRoundRobinStandings: con puntos empatados, decide por enfrentamiento directo si existe", () => {
  const pairs = makePairs(3);
  let matches = buildRoundRobinMatches(pairs);
  // p0 gana a p1, p1 gana a p2, p2 gana a p0 (triangulo, ambas con 1 victoria/1 derrota => empatadas a puntos las 3)
  matches = applyRoundRobinResult(matches, matches.find((m) => unorderedKey(m.pairA, m.pairB) === unorderedKey("p0", "p1")).id, 6, 1).matches;
  matches = applyRoundRobinResult(matches, matches.find((m) => unorderedKey(m.pairA, m.pairB) === unorderedKey("p1", "p2")).id, 6, 1).matches;
  matches = applyRoundRobinResult(matches, matches.find((m) => unorderedKey(m.pairA, m.pairB) === unorderedKey("p2", "p0")).id, 6, 1).matches;
  const standings = computeRoundRobinStandings(pairs, matches);
  // Las 3 parejas quedan con 1 victoria/1 derrota (3 puntos cada una): el
  // enfrentamiento directo no aplica de forma no ambigua a un triángulo de
  // 3, así que debe resolverse por diferencia de puntos (todas +5/-5 aquí
  // también, iguales) y terminar en orden estable de entrada.
  const sorted = sortRoundRobinStandings(standings, matches);
  assert.deepEqual(sorted.map((s) => s.pairId), ["p0", "p1", "p2"]);
});

test("sortRoundRobinStandings: con exactamente 2 parejas empatadas a puntos, decide por su enfrentamiento directo", () => {
  const pairs = makePairs(2);
  let matches = buildRoundRobinMatches(pairs);
  matches = applyRoundRobinResult(matches, matches[0].id, 6, 3).matches; // p0 gana el único cruce
  const standingsTied = [
    { pairId: "p0", points: 3, diff: 0, scoreFor: 0 },
    { pairId: "p1", points: 3, diff: 0, scoreFor: 0 },
  ];
  const sorted = sortRoundRobinStandings(standingsTied, matches);
  assert.deepEqual(sorted.map((s) => s.pairId), ["p0", "p1"]);
});

test("sortRoundRobinStandings: sin puntos ni enfrentamiento decisivo, desempata por diferencia y luego a favor", () => {
  const byDiff = sortRoundRobinStandings(
    [
      { pairId: "a", points: 3, diff: 2, scoreFor: 10 },
      { pairId: "b", points: 3, diff: 5, scoreFor: 8 },
    ],
    []
  );
  assert.deepEqual(byDiff.map((s) => s.pairId), ["b", "a"]);

  const byFor = sortRoundRobinStandings(
    [
      { pairId: "a", points: 3, diff: 4, scoreFor: 10 },
      { pairId: "b", points: 3, diff: 4, scoreFor: 12 },
    ],
    []
  );
  assert.deepEqual(byFor.map((s) => s.pairId), ["b", "a"]);
});

test("sortRoundRobinStandings: si todo es igual, conserva el orden estable de entrada", () => {
  const sorted = sortRoundRobinStandings(
    [
      { pairId: "a", points: 3, diff: 4, scoreFor: 10 },
      { pairId: "b", points: 3, diff: 4, scoreFor: 10 },
      { pairId: "c", points: 3, diff: 4, scoreFor: 10 },
    ],
    []
  );
  assert.deepEqual(sorted.map((s) => s.pairId), ["a", "b", "c"]);
});

// --- Ganador / estado incompleto ---

test("isRoundRobinComplete / getRoundRobinChampion: sin todos los partidos jugados, no hay ganador todavía", () => {
  const pairs = makePairs(3);
  const matches = buildRoundRobinMatches(pairs);
  const oneDone = applyRoundRobinResult(matches, matches[0].id, 6, 1).matches;
  assert.equal(isRoundRobinComplete(oneDone), false);
  assert.equal(getRoundRobinChampion(pairs, oneDone), null);
});

test("isRoundRobinComplete / getRoundRobinChampion: al completar todos los partidos, determina la pareja campeona", () => {
  const pairs = makePairs(3);
  let matches = buildRoundRobinMatches(pairs);
  // p0 gana los dos partidos que juega; p1 y p2 se reparten el suyo.
  matches = applyRoundRobinResult(matches, matches.find((m) => unorderedKey(m.pairA, m.pairB) === unorderedKey("p0", "p1")).id, 6, 1).matches;
  matches = applyRoundRobinResult(matches, matches.find((m) => unorderedKey(m.pairA, m.pairB) === unorderedKey("p0", "p2")).id, 6, 1).matches;
  matches = applyRoundRobinResult(matches, matches.find((m) => unorderedKey(m.pairA, m.pairB) === unorderedKey("p1", "p2")).id, 4, 6).matches;

  assert.equal(isRoundRobinComplete(matches), true);
  const champion = getRoundRobinChampion(pairs, matches);
  assert.ok(champion, "debe determinarse una pareja campeona");
  assert.equal(champion.id, "p0");
});

test("isRoundRobinComplete: con cero partidos (menos de 2 parejas) no se considera completo", () => {
  assert.equal(isRoundRobinComplete([]), false);
});

test("computeRoundRobinStandings: no revienta si un partido referencia una pareja ya eliminada de `pairs`", () => {
  const pairs = makePairs(2);
  let matches = buildRoundRobinMatches(pairs);
  matches = applyRoundRobinResult(matches, matches[0].id, 6, 3).matches;
  const standings = computeRoundRobinStandings([pairs[0]], matches); // p1 ya no está en pairs
  assert.equal(standings.length, 1);
  assert.equal(standings[0].played, 0, "el partido contra una pareja ya no existente no debe contarse");
});
