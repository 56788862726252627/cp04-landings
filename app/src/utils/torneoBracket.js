// Club Pádel 04 · Motor de bracket/BYE de Torneos, puro y reutilizable.
//
// Extraído de App.jsx para poder testearlo con node --test sin arrastrar
// React/JSX (mismo patrón ya usado para rbac.js y theme.js). App.jsx importa
// estas mismas funciones — no hay una segunda copia de esta lógica en ningún
// otro sitio. Solo se extraen las funciones estrictamente necesarias para
// el motor de bracket/BYE (LOTE C); el resto de helpers de Torneos()
// (etiquetas de ronda, espaciado, parejas vacías) siguen en App.jsx sin tocar.
//
// LOTE C (2026-07-10): corrige TORNEOS_BRACKET_BYE_AUDIT.md §0 (P0) — el
// bracket no siempre podía coronar un campeón para tamaños "Personalizado"
// cuyo total de partidos de Ronda 1 no era una potencia de 2 (p.ej. 9, 11).
//
// La causa era que solo se propagaba el BYE de R1 un nivel (a R2). Cuando
// una ronda intermedia también tenía un número impar de partidos, la última
// posición de la ronda siguiente se quedaba sin su segundo alimentador para
// siempre (nunca podía jugarse, porque el botón de marcar ganador exige que
// ambos lados existan).
//
// La corrección generaliza esa propagación a torneoPropagateWinner: cuando
// una ronda tiene un número impar de partidos, la última posición no tiene
// "hermano" (no existe pos+1 en esa ronda) — su ganador se propaga en
// cascada como BYE implícito, tantas rondas seguidas como haga falta, hasta
// encontrar una ronda con hermano real o hasta llegar a la final. Es la
// misma lógica tanto si el BYE es el explícito de R1 (número de parejas
// impar) como si surge más adelante porque el número de partidos de una
// ronda ya jugada resultó impar — un solo camino de código, sin lógica
// paralela.

export function torneoBuildFullBracket(pairs, byeId) {
  const active = byeId ? pairs.filter(p => p.id !== byeId) : pairs;
  const r1 = [];
  for (let i = 0; i < active.length; i += 2) {
    r1.push({ id: `r1m${Math.floor(i / 2)}`, round: 1, pos: Math.floor(i / 2), pairA: active[i]?.id ?? null, pairB: active[i + 1]?.id ?? null, winner: null, isBye: false });
  }
  let byeMatchId = null;
  if (byeId) {
    byeMatchId = `byem_${byeId}`;
    r1.push({ id: byeMatchId, round: 1, pos: r1.length, pairA: byeId, pairB: null, winner: byeId, isBye: true });
  }
  let all = [...r1];
  let prevCount = r1.length;
  let round = 2;
  while (prevCount > 1) {
    const thisCount = Math.ceil(prevCount / 2);
    for (let i = 0; i < thisCount; i++) {
      all.push({ id: `r${round}m${i}`, round, pos: i, pairA: null, pairB: null, winner: null, isBye: false });
    }
    prevCount = thisCount;
    round++;
  }
  // El BYE de R1 puede tener que "saltar" varias rondas seguidas si el número
  // de partidos de alguna ronda intermedia también resulta impar (ver
  // torneoPropagateWinner: única fuente de esta lógica, reutilizada también
  // en tiempo real por torneoAdvanceWinner).
  if (byeMatchId) {
    all = torneoPropagateWinner(all, byeMatchId, byeId);
  }
  return all;
}

// Única fuente de la lógica de avance de bracket (round/pos/nextPos + BYE).
// Marca el ganador de `matchId` y lo propaga a la siguiente ronda. Si la
// ronda de origen tiene un número impar de partidos, la última posición
// ("isTop", sin hermano en pos+1) no recibirá nunca un segundo alimentador:
// en ese caso el ganador se propaga automáticamente como BYE implícito,
// en cascada, tantas rondas como haga falta, hasta encontrar una ronda con
// hermano real o hasta llegar a la final. Esto es lo que garantiza que
// cualquier N produzca siempre un campeón único, no solo las potencias de 2.
export function torneoPropagateWinner(bracket, matchId, winnerId) {
  const byId = new Map(bracket.map(m => [m.id, { ...m }]));
  const byRoundPos = new Map(bracket.map(m => [`${m.round}:${m.pos}`, m.id]));
  const roundCounts = new Map();
  bracket.forEach(m => roundCounts.set(m.round, (roundCounts.get(m.round) || 0) + 1));

  const resolve = (id, winner) => {
    const m = byId.get(id);
    if (!m) return;
    m.winner = winner;
    const nextId = byRoundPos.get(`${m.round + 1}:${Math.floor(m.pos / 2)}`);
    if (!nextId) return; // sin ronda siguiente: esta era la final, campeón decidido
    const next = byId.get(nextId);
    const isTop = m.pos % 2 === 0;
    if (isTop) next.pairA = winner; else next.pairB = winner;
    const siblingPos = isTop ? m.pos + 1 : m.pos - 1;
    const roundCount = roundCounts.get(m.round) || 0;
    const siblingExists = siblingPos >= 0 && siblingPos < roundCount;
    if (!siblingExists) {
      // No existe (ni existirá) el otro alimentador de `next`: es un BYE
      // implícito, se resuelve solo y se sigue propagando en cascada.
      next.isBye = true;
      resolve(nextId, winner);
    }
  };

  resolve(matchId, winnerId);
  return Array.from(byId.values());
}

export function torneoAdvanceWinner(bracket, matchId, winnerId) {
  const match = bracket.find(m => m.id === matchId);
  if (!match) return bracket;
  return torneoPropagateWinner(bracket, matchId, winnerId);
}
