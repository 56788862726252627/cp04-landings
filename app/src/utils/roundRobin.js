// Club Pádel 04 · Motor puro de Round Robin (liga: todos contra todos)
// para el módulo de Torneos.
//
// No depende de React ni del DOM: solo de los datos que se le pasan
// (parejas y partidos). Esto permite testearlo con node --test sin
// levantar la app (ver roundRobin.test.mjs), siguiendo la misma
// convención que availability.js, rbac.js o permissions.js.
//
// Regla de puntuación de clasificación (documentada aquí porque el
// proyecto no tenía ninguna definida para este formato antes de esto):
// 3 puntos por partido ganado, 0 por partido perdido. El pádel no tiene
// empates (se juega a sets), así que no existe puntuación de empate ni
// se acepta un resultado con el mismo marcador para ambas parejas.
export const ROUND_ROBIN_POINTS = Object.freeze({ win: 3, loss: 0 });

// Algoritmo del círculo (circle method): genera un calendario de n-1
// jornadas donde cada pareja se enfrenta exactamente una vez a todas las
// demás, sin enfrentamientos duplicados. Si el número de parejas es
// impar, se añade una plaza vacía (null) que actúa de "descanso"
// rotatorio: la pareja emparejada con esa plaza descansa esa jornada,
// sin crear un partido ni una pareja rival falsa visible en el
// calendario (se filtra antes de devolver los partidos).
export function buildRoundRobinMatches(pairs) {
  const ids = (pairs || []).map((p) => p.id);
  if (ids.length < 2) return [];

  const withBye = ids.length % 2 !== 0 ? [...ids, null] : [...ids];
  const n = withBye.length;
  const totalRounds = n - 1;
  const half = n / 2;
  let arr = [...withBye];
  const matches = [];
  let seq = 0;

  for (let round = 1; round <= totalRounds; round++) {
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a == null || b == null) continue;
      seq += 1;
      matches.push({
        id: `rr_r${round}_${seq}`,
        round,
        pairA: a,
        pairB: b,
        scoreA: null,
        scoreB: null,
        played: false,
      });
    }
    // Rotación estándar del método del círculo: el primer elemento queda
    // fijo, el resto rota una posición.
    arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
  }

  return matches;
}

// Id de la pareja que descansa en una jornada concreta (o null si esa
// jornada no tiene descanso, p. ej. número par de parejas).
export function getRoundRobinRestingPairId(pairs, matches, round) {
  const playingIds = new Set();
  (matches || [])
    .filter((m) => m.round === round)
    .forEach((m) => {
      playingIds.add(m.pairA);
      playingIds.add(m.pairB);
    });
  const resting = (pairs || []).find((p) => !playingIds.has(p.id));
  return resting ? resting.id : null;
}

export function getRoundRobinTotalRounds(matches) {
  return (matches || []).reduce((max, m) => Math.max(max, m.round), 0);
}

function isValidResult(scoreA, scoreB) {
  return (
    Number.isInteger(scoreA) &&
    Number.isInteger(scoreB) &&
    scoreA >= 0 &&
    scoreB >= 0 &&
    scoreA !== scoreB
  );
}

// Registra o corrige el resultado de un partido. No muta el array
// recibido; devuelve uno nuevo (o el mismo si el resultado no es válido,
// junto con { ok:false, error }), para que el llamador decida si informa
// al usuario del rechazo.
export function applyRoundRobinResult(matches, matchId, scoreA, scoreB) {
  if (!isValidResult(scoreA, scoreB)) {
    return { ok: false, error: "INVALID_RESULT", matches };
  }
  const exists = (matches || []).some((m) => m.id === matchId);
  if (!exists) {
    return { ok: false, error: "MATCH_NOT_FOUND", matches };
  }
  const updated = matches.map((m) =>
    m.id === matchId ? { ...m, scoreA, scoreB, played: true } : m
  );
  return { ok: true, matches: updated };
}

// Clasificación sin ordenar: un registro por pareja con partidos
// jugados/ganados/perdidos, puntos a favor/en contra, diferencia y
// puntos de clasificación. Ignora partidos de parejas que ya no existan
// en `pairs` (p. ej. si se eliminó una pareja tras generar el
// calendario) en vez de fallar.
export function computeRoundRobinStandings(pairs, matches) {
  const stats = new Map();
  (pairs || []).forEach((p) => {
    stats.set(p.id, {
      pairId: p.id,
      played: 0,
      won: 0,
      lost: 0,
      scoreFor: 0,
      scoreAgainst: 0,
      points: 0,
    });
  });

  (matches || []).forEach((m) => {
    if (!m.played || m.scoreA == null || m.scoreB == null) return;
    const a = stats.get(m.pairA);
    const b = stats.get(m.pairB);
    if (!a || !b) return;

    a.played += 1;
    b.played += 1;
    a.scoreFor += m.scoreA;
    a.scoreAgainst += m.scoreB;
    b.scoreFor += m.scoreB;
    b.scoreAgainst += m.scoreA;

    if (m.scoreA > m.scoreB) {
      a.won += 1;
      a.points += ROUND_ROBIN_POINTS.win;
      b.lost += 1;
      b.points += ROUND_ROBIN_POINTS.loss;
    } else {
      b.won += 1;
      b.points += ROUND_ROBIN_POINTS.win;
      a.lost += 1;
      a.points += ROUND_ROBIN_POINTS.loss;
    }
  });

  return Array.from(stats.values()).map((s) => ({ ...s, diff: s.scoreFor - s.scoreAgainst }));
}

// Criterios de desempate, en este orden (regla local documentada — no
// había ninguna especificación previa en el proyecto para Round Robin):
//   1. Puntos de clasificación.
//   2. Enfrentamiento directo, solo cuando aplica: exactamente dos
//      parejas empatadas que ya se hayan enfrentado entre sí. Con
//      empates a 3 o más, este criterio se salta (no hay una forma no
//      ambigua de aplicarlo) y se pasa directamente al siguiente.
//   3. Diferencia de puntos/juegos (a favor − en contra).
//   4. Puntos/juegos a favor.
//   5. Orden estable como último recurso técnico: Array.prototype.sort
//      es estable desde ES2019, así que si todo lo anterior es igual se
//      conserva el orden de entrada (el de `pairs`).
export function sortRoundRobinStandings(standings, matches) {
  const findHeadToHead = (idA, idB) =>
    (matches || []).find(
      (m) =>
        m.played &&
        ((m.pairA === idA && m.pairB === idB) || (m.pairA === idB && m.pairB === idA))
    );

  return [...(standings || [])].sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points;

    const h2h = findHeadToHead(x.pairId, y.pairId);
    if (h2h) {
      const xScore = h2h.pairA === x.pairId ? h2h.scoreA : h2h.scoreB;
      const yScore = h2h.pairA === x.pairId ? h2h.scoreB : h2h.scoreA;
      if (xScore !== yScore) return yScore - xScore;
    }

    if (y.diff !== x.diff) return y.diff - x.diff;
    if (y.scoreFor !== x.scoreFor) return y.scoreFor - x.scoreFor;
    return 0;
  });
}

export function isRoundRobinComplete(matches) {
  return (matches || []).length > 0 && matches.every((m) => m.played);
}

export function getRoundRobinChampion(pairs, matches) {
  if (!isRoundRobinComplete(matches)) return null;
  const standings = sortRoundRobinStandings(computeRoundRobinStandings(pairs, matches), matches);
  if (standings.length === 0) return null;
  return (pairs || []).find((p) => p.id === standings[0].pairId) ?? null;
}
