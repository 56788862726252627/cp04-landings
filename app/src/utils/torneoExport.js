// Club Pádel 04 · Derivación de estado/ranking y escape de exportación de
// Torneos, puro y reutilizable.
//
// Extraído de App.jsx (handleExportJSON/handleExportCSV y la tabla de
// Ranking dentro de Torneos()) para poder testearse con node --test sin
// arrastrar React/JSX — mismo patrón que rbac.js/torneoBracket.js/
// torneoValidation.js. App.jsx importa estas mismas funciones: la tabla de
// ranking en pantalla y el JSON exportado calculan el estado de cada pareja
// con la MISMA función (torneoPairStatus), no con dos copias de la misma
// lógica que puedan divergir.
//
// Motivación (audit/torneos-modulo/TORNEOS_100_COMPLETION_PLAN.md, LOTE E):
// antes de este módulo, el campo `ranking` del JSON exportado solo
// reflejaba el índice del array de parejas (orden de creación), nunca
// quién había ganado o perdido de verdad en el bracket — un archivo poco
// creíble para enseñar en una demo real.

// Mismo criterio que ya usaba la tabla de Ranking dentro de Torneos(): el
// BYE del sorteo de R1 (byePairId) tiene prioridad de estado sobre lo que
// diga el bracket, porque una pareja BYE nunca juega su primer partido (su
// entrada de bracket ya nace con `winner` puesto, pero el mensaje correcto
// para el usuario es "pase directo", no "ganó un partido").
export function torneoPairStatus(pairId, bracket, byePairId) {
  if (byePairId && pairId === byePairId) return "bye";

  const list = Array.isArray(bracket) ? bracket : [];
  const match = list.find((m) => m.pairA === pairId || m.pairB === pairId);
  if (match?.winner === pairId) return "avanza";
  if (match?.winner && match.winner !== pairId) return "eliminada";
  return "pendiente";
}

const TORNEO_RANKING_STATUS_ORDER = { avanza: 0, pendiente: 1, bye: 2, eliminada: 3 };

// Ranking ordenado por estado real (quién sigue en pie primero, quién ya
// quedó eliminada al final) en vez de por orden de creación del array de
// parejas. `pos` se reasigna tras ordenar para que refleje la posición
// final, no el índice original.
export function torneoBuildRanking(pairs, bracket, byePairId) {
  const list = Array.isArray(pairs) ? pairs : [];
  return list
    .map((p) => ({
      jugador1: p?.player1 || "",
      jugador2: p?.player2 || "",
      estado: torneoPairStatus(p?.id, bracket, byePairId),
    }))
    .sort((a, b) => TORNEO_RANKING_STATUS_ORDER[a.estado] - TORNEO_RANKING_STATUS_ORDER[b.estado])
    .map((entry, i) => ({ pos: i + 1, ...entry }));
}

// LOTE F pendiente: "escapar comillas internas en el CSV" — un nombre con
// una coma, comilla o salto de línea corrompería el archivo sin este
// escape. Regla estándar de CSV (RFC 4180): si el campo contiene `"`, `,`
// o un salto de línea, se envuelve entre comillas dobles y cada `"` interna
// se duplica.
export function torneoCsvEscapeField(value) {
  const str = String(value ?? "");
  if (/["\n,]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
