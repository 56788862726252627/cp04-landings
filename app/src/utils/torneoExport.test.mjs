import test from "node:test";
import assert from "node:assert/strict";

import { torneoPairStatus, torneoBuildRanking, torneoCsvEscapeField } from "./torneoExport.js";
import { torneoBuildFullBracket, torneoAdvanceWinner } from "./torneoBracket.js";

function makePair(id, p1, p2) {
  return { id, player1: p1, player2: p2 };
}

test("torneoPairStatus: 'bye' tiene prioridad sobre cualquier otro estado", () => {
  const pairs = [makePair("p1", "Ana", "Sofía")];
  const bracket = torneoBuildFullBracket(pairs, "p1");
  assert.equal(torneoPairStatus("p1", bracket, "p1"), "bye");
});

test("torneoPairStatus: 'avanza' cuando la pareja ganó su partido más reciente", () => {
  const pairs = [makePair("p1", "Ana", "Sofía"), makePair("p2", "Luis", "Marta")];
  let bracket = torneoBuildFullBracket(pairs, null);
  const r1 = bracket.find((m) => m.round === 1);
  bracket = torneoAdvanceWinner(bracket, r1.id, "p1");
  assert.equal(torneoPairStatus("p1", bracket, null), "avanza");
});

test("torneoPairStatus: 'eliminada' cuando la pareja perdió (winner es la otra)", () => {
  const pairs = [makePair("p1", "Ana", "Sofía"), makePair("p2", "Luis", "Marta")];
  let bracket = torneoBuildFullBracket(pairs, null);
  const r1 = bracket.find((m) => m.round === 1);
  bracket = torneoAdvanceWinner(bracket, r1.id, "p1");
  assert.equal(torneoPairStatus("p2", bracket, null), "eliminada");
});

test("torneoPairStatus: 'pendiente' cuando el partido todavía no tiene ganador", () => {
  const pairs = [makePair("p1", "Ana", "Sofía"), makePair("p2", "Luis", "Marta")];
  const bracket = torneoBuildFullBracket(pairs, null);
  assert.equal(torneoPairStatus("p1", bracket, null), "pendiente");
});

test("torneoPairStatus: bracket vacío o sin partidos para la pareja no lanza, devuelve 'pendiente'", () => {
  assert.equal(torneoPairStatus("p1", [], null), "pendiente");
  assert.equal(torneoPairStatus("p1", undefined, null), "pendiente");
});

test("torneoBuildRanking: refleja victorias/derrotas reales del bracket, no el orden de creación del array", () => {
  const pairs = [makePair("p1", "Ana", "Sofía"), makePair("p2", "Luis", "Marta")];
  let bracket = torneoBuildFullBracket(pairs, null);
  const r1 = bracket.find((m) => m.round === 1);
  // p2 (segunda en el array de parejas) gana — el ranking debe reflejarlo
  // primero, no dejarla en la posición 2 solo por haberse creado después.
  bracket = torneoAdvanceWinner(bracket, r1.id, "p2");

  const ranking = torneoBuildRanking(pairs, bracket, null);
  assert.equal(ranking[0].jugador1, "Luis");
  assert.equal(ranking[0].estado, "avanza");
  assert.equal(ranking[0].pos, 1);
  assert.equal(ranking[1].jugador1, "Ana");
  assert.equal(ranking[1].estado, "eliminada");
  assert.equal(ranking[1].pos, 2);
});

test("torneoBuildRanking: orden de prioridad avanza > pendiente > bye > eliminada", () => {
  const pairs = [
    makePair("winner", "Gana", "Ronda1"),
    makePair("pending", "Aun", "Sinjugar"),
    makePair("bye", "Pase", "Directo"),
    makePair("loser", "Pierde", "Ronda1"),
  ];
  let bracket = torneoBuildFullBracket(pairs, "bye");
  const r1WinnerMatch = bracket.find((m) => m.round === 1 && (m.pairA === "winner" || m.pairB === "winner"));
  bracket = torneoAdvanceWinner(bracket, r1WinnerMatch.id, "winner");

  const ranking = torneoBuildRanking(pairs, bracket, "bye");
  assert.deepEqual(
    ranking.map((r) => r.estado),
    ["avanza", "pendiente", "bye", "eliminada"]
  );
});

test("torneoBuildRanking: lista de parejas vacía devuelve ranking vacío, no lanza", () => {
  assert.deepEqual(torneoBuildRanking([], [], null), []);
  assert.deepEqual(torneoBuildRanking(undefined, undefined, null), []);
});

test("torneoCsvEscapeField: no toca un valor simple sin caracteres especiales", () => {
  assert.equal(torneoCsvEscapeField("Ana López"), "Ana López");
});

test("torneoCsvEscapeField: envuelve entre comillas y duplica las comillas internas (RFC 4180)", () => {
  assert.equal(torneoCsvEscapeField('Jugador "El Muro" Pérez'), '"Jugador ""El Muro"" Pérez"');
});

test("torneoCsvEscapeField: envuelve entre comillas si el valor contiene una coma (rompería columnas)", () => {
  assert.equal(torneoCsvEscapeField("Pérez, Ana"), '"Pérez, Ana"');
});

test("torneoCsvEscapeField: envuelve entre comillas si el valor contiene un salto de línea", () => {
  assert.equal(torneoCsvEscapeField("Ana\nLópez"), '"Ana\nLópez"');
});

test("torneoCsvEscapeField: null/undefined se convierten en cadena vacía, no en la palabra 'null'/'undefined'", () => {
  assert.equal(torneoCsvEscapeField(null), "");
  assert.equal(torneoCsvEscapeField(undefined), "");
});
