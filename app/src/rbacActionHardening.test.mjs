import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { cp04Can } from "./utils/permissions.js";

// Prompt 8 (Mejora 2.10, 2026-07-27): auditoría y endurecimiento de RBAC por
// acción. Verifica, por inspección de fuente sobre App.jsx (no es un módulo
// exportable, mismo enfoque usado en toda esta serie de prompts), que la
// pantalla de Torneos:
//  1) recibe selectedRole y calcula canManage con la nueva capa de acción;
//  2) TODOS los handlers mutables comprueban canManage al principio, no
//     solo el botón que los dispara (FASE 5: "no basta con ocultar el
//     botón; el handler debe comprobar permiso");
//  3) los controles de gestión están condicionados a canManage en el JSX.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appJsx = readFileSync(path.join(__dirname, "App.jsx"), "utf8");
const torneoSection = appJsx.slice(appJsx.indexOf("function Torneos("), appJsx.indexOf("const RANKING_STYLE ="));

test("Torneos recibe selectedRole y calcula canManage con cp04Can(selectedRole, \"tournaments:manage\")", () => {
  assert.match(torneoSection, /function Torneos\(\{ selectedRole \}[^)]*\)\s*\{/);
  assert.match(torneoSection, /const canManage = cp04Can\(selectedRole, "tournaments:manage"\);/);
});

test("los 15 handlers mutables de Torneos comprueban canManage antes de hacer nada (defensa en profundidad: ocultar el botón no basta)", () => {
  const guardedHandlers = [
    "handleUndo", "handleRedo", "handleRestoreVersion", "applyFormat", "applyCustom",
    "handleReorder", "handleAutoAssign", "handleSave", "handlePublish", "handleAddPair",
    "handleDeletePair", "handleEditSave", "handleMarkWinner", "handleExportJSON", "handleExportCSV",
  ];
  for (const name of guardedHandlers) {
    const re = new RegExp(`const ${name} = \\([^)]*\\) => \\{\\s*(?:\\/\\/[^\\n]*\\n\\s*)?if \\(!canManage\\) return;`);
    assert.match(torneoSection, re, `${name} debería denegar la ejecución si !canManage, como primera línea`);
  }
});

test("el modules map de App.jsx pasa selectedRole a <Torneos /> (si no, canManage siempre sería PLAYER por defecto y bloquearía también a ADMIN)", () => {
  assert.match(appJsx, /torneos: <Torneos selectedRole=\{selectedRole\} \/>/);
});

test("los controles de gestión (Añadir, editar/eliminar pareja, panel de Controles/Exportar/Historial, marcar ganador) están condicionados a canManage en el JSX", () => {
  assert.match(torneoSection, /\{canManage && \(\s*<button type="button" className="cp04-control-btn primary" onClick=\{handleAddPair\}/);
  assert.match(torneoSection, /\{canManage && \(\s*<button type="button" title="Editar"/);
  assert.match(torneoSection, /\{canManage \? "cp04-tournament-grid" : ""\}/);
  assert.match(torneoSection, /\{canManage && \(\s*<div className="cp04-tournament-side">/);
  assert.match(torneoSection, /canManage && !match\.winner && pA && pA\.player1/);
  assert.match(torneoSection, /canManage && !match\.winner && pB && pB\.player1/);
});

test("se muestra un aviso honesto de modo solo lectura cuando !canManage (no se oculta sin explicación, tampoco se declara seguridad de backend)", () => {
  assert.match(torneoSection, /!canManage[\s\S]{0,400}modo solo lectura/);
});

test("verificación cruzada con permissions.js: PLAYER, STAFF y SUPPORT no tienen tournaments:manage; ADMIN sí (mismo resultado que usará canManage en runtime)", () => {
  assert.equal(cp04Can("PLAYER", "tournaments:manage"), false);
  assert.equal(cp04Can("STAFF", "tournaments:manage"), false);
  assert.equal(cp04Can("SUPPORT", "tournaments:manage"), false);
  assert.equal(cp04Can("ADMIN", "tournaments:manage"), true);
});

test("la vista de solo lectura sigue mostrando el ranking del torneo a todos los roles (ver no es gestionar)", () => {
  // La sección de Ranking del torneo (showRanking) no está condicionada a
  // canManage en ningún punto — sigue siendo visible para todos los roles
  // que ya pueden abrir el módulo, tal como pide la FASE 7 (PLAYER: "ver
  // ranking").
  const rankingBlock = torneoSection.match(/\{\/\* RANKING \*\/\}[\s\S]*?<\/div>\s*\);/)?.[0] || "";
  assert.ok(rankingBlock, "debe existir el bloque de ranking del torneo");
  assert.equal(/canManage/.test(rankingBlock), false);
});
