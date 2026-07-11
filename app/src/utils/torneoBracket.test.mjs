import { test } from "node:test";
import assert from "node:assert/strict";
import {
  torneoBuildFullBracket,
  torneoAdvanceWinner,
  torneoPropagateWinner,
} from "./torneoBracket.js";

// ---------------------------------------------------------------------------
// Harness: construye N parejas, arma el bracket (con el mismo criterio de
// BYE que usa handleReorder en App.jsx — un único BYE explícito solo cuando
// N es impar) y resuelve automáticamente todo partido jugable (eligiendo
// siempre pairA como ganador) hasta que no quede ningún partido pendiente,
// exactamente como jugaría un torneo real de principio a fin.
// ---------------------------------------------------------------------------

function buildPairs(n) {
  return Array.from({ length: n }, (_, i) => ({ id: `p${i}`, player1: `J${i}A`, player2: `J${i}B` }));
}

function simulateToChampion(n, { pickB = () => false } = {}) {
  const pairs = buildPairs(n);
  const byeId = n % 2 !== 0 ? pairs[pairs.length - 1].id : null;
  let bracket = torneoBuildFullBracket(pairs, byeId);
  const initialBracket = bracket;
  let guard = 0;
  const maxIterations = n * 4 + 50;
  for (;;) {
    const playable = bracket.find(m => !m.winner && m.pairA && m.pairB);
    if (!playable) break;
    const winner = pickB(playable) ? playable.pairB : playable.pairA;
    bracket = torneoAdvanceWinner(bracket, playable.id, winner);
    guard++;
    if (guard > maxIterations) {
      throw new Error(`Simulación N=${n}: posible bucle infinito o bracket que no converge (>${maxIterations} iteraciones)`);
    }
  }
  return { pairs, byeId, bracket, initialBracket };
}

function roundsOf(bracket) {
  return [...new Set(bracket.map(m => m.round))].sort((a, b) => a - b);
}

function matchesInRound(bracket, r) {
  return bracket.filter(m => m.round === r);
}

// ---------------------------------------------------------------------------
// Invariantes estructurales, verificadas para cada tamaño de la lista pedida
// por la misión, más los tamaños del §0.1 de TORNEOS_BRACKET_BYE_AUDIT.md
// que quedaban explícitamente rotos (6, 10, 13, 14) como regresión extra.
// ---------------------------------------------------------------------------

const SIZES = [2, 3, 4, 5, 7, 8, 9, 11, 12, 15, 16, 17, 24, 31, 32];
const AUDIT_BROKEN_SIZES = [5, 6, 9, 10, 11, 12, 13, 14];

for (const n of SIZES) {
  test(`N=${n}: produce un campeón único y ningún partido imposible`, () => {
    const { pairs, bracket } = simulateToChampion(n);

    // Toda pareja aparece exactamente una vez en la construcción inicial de R1.
    const r1 = matchesInRound(bracket, 1);
    const r1Slots = r1.flatMap(m => [m.pairA, m.pairB]).filter(Boolean);
    assert.equal(r1Slots.length, new Set(r1Slots).size, `N=${n}: alguna pareja aparece más de una vez en R1`);
    assert.equal(new Set(r1Slots).size, n, `N=${n}: no todas las parejas quedaron colocadas en R1`);

    // No hay partidos imposibles: al terminar de resolver todo lo jugable,
    // todo partido del bracket tiene un ganador (ninguno se queda "colgado"
    // con un solo lado para siempre).
    const stuck = bracket.filter(m => !m.winner);
    assert.equal(stuck.length, 0, `N=${n}: quedan partidos sin ganador tras resolver todo lo jugable: ${JSON.stringify(stuck)}`);

    // La final tiene exactamente un partido, y ese partido tiene ganador.
    const rounds = roundsOf(bracket);
    const totalRounds = rounds[rounds.length - 1];
    const finalMatches = matchesInRound(bracket, totalRounds);
    assert.equal(finalMatches.length, 1, `N=${n}: la ronda final no tiene exactamente 1 partido`);
    assert.ok(finalMatches[0].winner, `N=${n}: la final no tiene ganador`);

    // Existe exactamente un campeón identificable, y es una pareja real de N.
    const championId = finalMatches[0].winner;
    assert.ok(pairs.some(p => p.id === championId), `N=${n}: el campeón "${championId}" no es una pareja válida del torneo`);

    // No hay nodos huérfanos: todo partido de una ronda no final debe tener
    // un slot válido en round+1 al que apuntar.
    for (const m of bracket) {
      if (m.round === totalRounds) continue;
      const next = bracket.find(x => x.round === m.round + 1 && x.pos === Math.floor(m.pos / 2));
      assert.ok(next, `N=${n}: partido ${m.id} (ronda ${m.round}, pos ${m.pos}) no tiene destino válido en la ronda siguiente`);
    }

    // No hay duplicados de id de partido.
    const ids = bracket.map(m => m.id);
    assert.equal(ids.length, new Set(ids).size, `N=${n}: hay ids de partido duplicados`);
  });

  test(`N=${n}: ninguna pareja eliminada reaparece en una ronda posterior`, () => {
    const { bracket } = simulateToChampion(n);
    const rounds = roundsOf(bracket);
    const eliminatedBefore = new Set();
    for (const r of rounds) {
      const matches = matchesInRound(bracket, r);
      for (const m of matches) {
        if (m.pairA) assert.ok(!eliminatedBefore.has(m.pairA), `N=${n}: pareja eliminada ${m.pairA} reaparece en ronda ${r} (partido ${m.id})`);
        if (m.pairB) assert.ok(!eliminatedBefore.has(m.pairB), `N=${n}: pareja eliminada ${m.pairB} reaparece en ronda ${r} (partido ${m.id})`);
      }
      for (const m of matches) {
        const loser = m.pairA && m.pairB ? (m.winner === m.pairA ? m.pairB : m.pairA) : null;
        if (loser) eliminatedBefore.add(loser);
      }
    }
  });
}

test("Regresión §0.1 de la auditoría: los tamaños antes rotos (5,6,9,10,11,12,13,14) ahora coronan campeón", () => {
  for (const n of AUDIT_BROKEN_SIZES) {
    const { bracket } = simulateToChampion(n);
    const rounds = roundsOf(bracket);
    const totalRounds = rounds[rounds.length - 1];
    const final = matchesInRound(bracket, totalRounds);
    assert.equal(final.length, 1, `N=${n}: sigue sin tener una final única`);
    assert.ok(final[0].winner, `N=${n}: sigue sin coronar campeón (regresión del P0)`);
  }
});

test("Regresión presets 8/16/32: siguen sin usar ningún BYE (ya eran potencias de 2 de R1) y sin cambiar de forma", () => {
  for (const n of [8, 16, 32]) {
    const pairs = buildPairs(n);
    const bracket = torneoBuildFullBracket(pairs, null);
    const r1 = matchesInRound(bracket, 1);
    assert.equal(r1.length, n / 2, `N=${n}: R1 debería tener ${n / 2} partidos reales`);
    assert.ok(r1.every(m => !m.isBye), `N=${n}: no debería haber ningún partido BYE en R1`);
    const rounds = roundsOf(bracket);
    // Cada ronda debe tener exactamente la mitad de partidos que la anterior
    // (potencia de 2 pura, sin BYEs implícitos en ninguna ronda).
    for (let i = 1; i < rounds.length; i++) {
      const prev = matchesInRound(bracket, rounds[i - 1]).length;
      const cur = matchesInRound(bracket, rounds[i]).length;
      assert.equal(cur, prev / 2, `N=${n}: ronda ${rounds[i]} no tiene la mitad exacta de partidos que la ronda ${rounds[i - 1]}`);
    }
  }
});

test("BYE de R1 avanza correctamente: el partido BYE tiene ganador ya fijado al construir el bracket", () => {
  const pairs = buildPairs(5);
  const byeId = pairs[4].id;
  const bracket = torneoBuildFullBracket(pairs, byeId);
  const byeMatch = bracket.find(m => m.isBye);
  assert.ok(byeMatch, "No se generó ningún partido BYE para N=5");
  assert.equal(byeMatch.winner, byeId, "El BYE no tiene fijado su ganador desde la construcción");
  assert.equal(byeMatch.pairB, null, "El BYE no debería tener rival");
});

test("BYE en cascada (N=9): el ganador del BYE de R1 salta varias rondas automáticamente hasta quedar sin hermano real", () => {
  const pairs = buildPairs(9);
  const byeId = pairs[8].id;
  const bracket = torneoBuildFullBracket(pairs, byeId);
  // Verificado por auditoría (§0.3): con 9 parejas, el BYE de R1 debe llegar
  // directamente hasta la final (pairB de la final = byeId) sin que nadie
  // tenga que "jugar" en su nombre en ninguna ronda intermedia.
  const rounds = roundsOf(bracket);
  const totalRounds = rounds[rounds.length - 1];
  const final = matchesInRound(bracket, totalRounds)[0];
  assert.ok(
    final.pairA === byeId || final.pairB === byeId,
    "El BYE de R1 no llegó propagado hasta la final en N=9"
  );
});

test("Marcar ganador A y marcar ganador B propagan cada uno al slot correcto de la ronda siguiente", () => {
  const pairs = buildPairs(4);
  const bracket = torneoBuildFullBracket(pairs, null);
  const m0 = bracket.find(m => m.round === 1 && m.pos === 0); // isTop → pairA del siguiente
  const m1 = bracket.find(m => m.round === 1 && m.pos === 1); // isBottom → pairB del siguiente

  const afterA = torneoAdvanceWinner(bracket, m0.id, m0.pairA);
  const finalAfterA = afterA.find(m => m.round === 2 && m.pos === 0);
  assert.equal(finalAfterA.pairA, m0.pairA, "Ganador A no se propagó a pairA de la siguiente ronda");

  const afterB = torneoAdvanceWinner(bracket, m1.id, m1.pairB);
  const finalAfterB = afterB.find(m => m.round === 2 && m.pos === 0);
  assert.equal(finalAfterB.pairB, m1.pairB, "Ganador B no se propagó a pairB de la siguiente ronda");
});

test("Avance ronda a ronda hasta el campeón en un bracket de potencia de 2 (8 parejas)", () => {
  const { bracket } = simulateToChampion(8);
  const totalRounds = roundsOf(bracket).length;
  assert.equal(totalRounds, 3, "8 parejas debería producir exactamente 3 rondas (cuartos/semis/final)");
  assert.equal(matchesInRound(bracket, 1).length, 4);
  assert.equal(matchesInRound(bracket, 2).length, 2);
  assert.equal(matchesInRound(bracket, 3).length, 1);
});

test("torneoAdvanceWinner: matchId inexistente devuelve el bracket sin cambios", () => {
  const pairs = buildPairs(4);
  const bracket = torneoBuildFullBracket(pairs, null);
  const result = torneoAdvanceWinner(bracket, "no-existe", pairs[0].id);
  assert.deepEqual(result, bracket);
});

test("torneoPropagateWinner: marcar el ganador de la final no crea nodos ni errores (no hay ronda siguiente)", () => {
  const { bracket } = simulateToChampion(2);
  const final = bracket.find(m => m.round === roundsOf(bracket)[roundsOf(bracket).length - 1]);
  const result = torneoPropagateWinner(bracket, final.id, final.winner);
  assert.equal(result.length, bracket.length, "No debería añadir ni quitar partidos al resolver la final");
});
