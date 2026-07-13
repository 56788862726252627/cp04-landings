// Club Pádel 04 · Cierre funcional local del módulo Torneos (2026-07-12).
//
// Mismo criterio que App.tenantRuntimeIntegration.test.mjs/App.uxPolish.test.mjs
// (el repo no tiene jsdom/testing-library, App.jsx no se puede renderizar):
// se lee el código fuente como texto para verificar que los handlers de
// Torneos() están realmente conectados a los nuevos helpers puros
// (torneoValidation.js/torneoExport.js), no solo importados sin usar. La
// lógica pura en sí (torneoIsPairNamed, torneoCanMarkWinner,
// torneoEligibleForBye, torneoPairHasAdvanced, torneoSanitizePairs,
// torneoPairStatus, torneoBuildRanking, torneoCsvEscapeField) ya tiene su
// propia cobertura exhaustiva en torneoValidation.test.mjs/torneoExport.test.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const appJsxSource = readFileSync(path.join(here, "App.jsx"), "utf8");
const tutorialStepsSource = readFileSync(path.join(here, "data", "tutorialSteps.js"), "utf8");
const tournamentCssSource = readFileSync(path.join(here, "tournament-module.css"), "utf8");

function sliceFunction(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.ok(start !== -1, `No se pudo localizar "${startMarker}"`);
  const end = source.indexOf(endMarker, start);
  assert.ok(end !== -1 && end > start, `No se pudo localizar el final de "${startMarker}" (marcador "${endMarker}")`);
  return source.slice(start, end);
}

test("App.jsx importa los nuevos helpers de torneoValidation.js y torneoExport.js (reutiliza, no duplica)", () => {
  assert.match(appJsxSource, /torneoCanMarkWinner/);
  assert.match(appJsxSource, /torneoEligibleForBye/);
  assert.match(appJsxSource, /torneoPairHasAdvanced/);
  assert.match(appJsxSource, /torneoSanitizePairs/);
  assert.match(
    appJsxSource,
    /import\s*\{\s*torneoPairStatus,\s*torneoBuildRanking,\s*torneoCsvEscapeField\s*\}\s*from\s*"\.\/utils\/torneoExport\.js"/,
  );
});

test("torneoLoadSaved sanea las parejas cargadas con torneoSanitizePairs (localStorage manipulado no debe crashear el módulo)", () => {
  const body = sliceFunction(appJsxSource, "function torneoLoadSaved(tenantId) {", "function torneoLoadHist(");
  assert.match(body, /const pairs = torneoSanitizePairs\(rawPairs\)/);
});

test("formatMode/customMode/customInput usan inicialización perezosa (useState(() => ...)), igual que pairs/bracket", () => {
  const body = sliceFunction(appJsxSource, "function Torneos({ selectedRole }) {", "const currentMax");
  assert.match(body, /const \[formatMode, setFormatMode\] = useState\(\(\) => saved\?\.formatMode \?\? "32"\)/);
  assert.match(body, /const \[customMode, setCustomMode\] = useState\(\(\) => saved\?\.customMode \?\? "pairs"\)/);
  assert.match(body, /const \[customInput, setCustomInput\] = useState\(\(\) => saved\?\.customInput \?\? ""\)/);
});

test("el botón \"＋ Añadir\" se deshabilita al alcanzar el límite de parejas (antes solo avisaba tras el clic)", () => {
  const body = sliceFunction(appJsxSource, "function Torneos({ selectedRole }) {", "function RankingAvatar(");
  assert.match(body, /const pairsAtMax = Boolean\(currentMax && pairs\.length >= currentMax\) \|\| pairs\.length >= 32;/);
  assert.match(body, /onClick=\{handleAddPair\} disabled=\{pairsAtMax\}/);
});

test("handleAddPair notifica también en el camino de éxito, no solo al chocar con el límite", () => {
  const body = sliceFunction(appJsxSource, "const handleAddPair = () => {", "const handleDeletePair = (id) => {");
  assert.match(body, /showNotice\("Pareja añadida\."\);/);
});

test("handleDeletePair bloquea eliminar una pareja que ya avanzó de ronda (evita romper la ronda siguiente del bracket)", () => {
  const body = sliceFunction(appJsxSource, "const handleDeletePair = (id) => {", "const handleEditSave = () => {");
  assert.match(body, /if \(torneoPairHasAdvanced\(id, bracket\)\) \{/);
  assert.match(body, /showNotice\("Esta pareja ya ganó un cruce y avanzó de ronda: no se puede eliminar sin deshacer antes ese resultado\.", true\);/);
});

test("handleReorder pide confirmación si ya hay resultados marcados, y excluye parejas vacías del sorteo de BYE", () => {
  const body = sliceFunction(appJsxSource, "const handleReorder = () => {", "const handleAutoAssign = () => {");
  assert.match(body, /if \(bracket\.some\(m => m\.winner\)\) \{/);
  assert.match(body, /window\.confirm\(/);
  assert.match(body, /const eligible = torneoEligibleForBye\(shuffled\);/);
});

test("las 2 acciones de marcar ganador (✓A/✓B) exigen que AMBOS lados tengan nombre (torneoCanMarkWinner), no solo el que se marca", () => {
  const body = sliceFunction(appJsxSource, "function Torneos({ selectedRole }) {", "function RankingAvatar(");
  const usages = (body.match(/torneoCanMarkWinner\(pA, pB\)/g) || []).length;
  assert.equal(usages, 2, "torneoCanMarkWinner(pA, pB) debería aparecer exactamente 2 veces (botón ✓A y botón ✓B)");
  // Regresión directa: no debe quedar el patrón antiguo que solo comprobaba
  // el propio lado (pA.player1 / pB.player1) sin comprobar el rival.
  assert.doesNotMatch(body, /pA && pA\.player1 && match\.pairB/);
  assert.doesNotMatch(body, /pB && pB\.player1 && match\.pairA/);
});

test("la tabla de Ranking en pantalla usa torneoPairStatus (misma fuente que el JSON exportado, sin lógica duplicada)", () => {
  const body = sliceFunction(appJsxSource, "function Torneos({ selectedRole }) {", "function RankingAvatar(");
  assert.match(body, /const status = torneoPairStatus\(pair\.id, bracket, byePair\?\.id \?\? null\);/);
});

test("handleExportJSON usa torneoBuildRanking (ranking real por resultado, no por orden de creación del array)", () => {
  const body = sliceFunction(appJsxSource, "const handleExportJSON = () => {", "const handleExportCSV = () => {");
  assert.match(body, /ranking: torneoBuildRanking\(pairs, bracket, byePair\?\.id \?\? null\)/);
  // Regresión directa: no debe quedar el patrón antiguo (pos: i + 1 fijo al
  // índice del array, ignorando el resultado real del bracket).
  assert.doesNotMatch(body, /ranking: pairs\.map\(\(p, i\) => \(\{ pos: i \+ 1, jugador1: p\.player1, jugador2: p\.player2 \}\)\)/);
});

test("handleExportCSV escapa los campos con torneoCsvEscapeField (RFC 4180), ya no interpola comillas literales", () => {
  const body = sliceFunction(appJsxSource, "const handleExportCSV = () => {", "const bracketByRound");
  assert.match(body, /torneoCsvEscapeField\(p\.player1 \|\| ""\)/);
  assert.match(body, /torneoCsvEscapeField\(p\.player2 \|\| ""\)/);
});

test("TORNEO_DEMO_NAMES tiene 32 pares de nombres sin duplicados (antes 16, se repetían literalmente en un cuadro de 32 parejas)", () => {
  const start = appJsxSource.indexOf("const TORNEO_DEMO_NAMES = [");
  const end = appJsxSource.indexOf("];", start) + 2;
  const block = appJsxSource.slice(start, end);
  const matches = [...block.matchAll(/\["([^"]+)",\s*"([^"]+)"\]/g)];
  assert.equal(matches.length, 32);
  const names = matches.flatMap((m) => [m[1], m[2]]);
  assert.equal(new Set(names).size, names.length, "no debería haber ningún nombre repetido");
});

test("el paso de Torneos del tutorial guiado ya no promete \"inscripciones\" (funcionalidad que no existe)", () => {
  assert.doesNotMatch(tutorialStepsSource, /inscripcion/i);
});

test("el paso de Torneos del tutorial guiado apunta a un selector real (sidebar-torneos), no a uno inexistente", () => {
  const torneosSteps = [...tutorialStepsSource.matchAll(/\{ step: \d+, title: "Torneos[^}]*\}/g)];
  assert.ok(torneosSteps.length >= 3, "deberían existir al menos 3 pasos de Torneos (PLAYER/STAFF/ADMIN)");
  for (const [stepText] of torneosSteps) {
    assert.match(stepText, /selector: "\[data-tour='sidebar-torneos'\]"/, `paso sin selector real: ${stepText}`);
    assert.doesNotMatch(stepText, /nav-torneos|torneos-panel/);
  }
});

test("existe una regla @media print en tournament-module.css que oculta navegación/controles al imprimir el bracket", () => {
  assert.match(tournamentCssSource, /@media print \{/);
  assert.match(tournamentCssSource, /\.cp04-sidebar,/);
  assert.match(tournamentCssSource, /\.cp04-tournament-control,/);
});
