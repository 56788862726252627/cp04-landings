import { test } from "node:test";
import assert from "node:assert/strict";

import {
  extractIds,
  findObsoleteElements,
  extractLandmarks,
  extractFormControls,
  extractLabels,
  extractButtons,
  isValidAriaRole,
  extractRoles,
  extractAriaReferences,
  extractTables,
  extractTabindexes,
  hasAutofocus,
  hasOutlineNoneInCss,
  hasSkipLink,
  extractSvgElements,
  extractMediaElements,
  extractAbbreviations,
  extractColorPairs,
} from "./a11yHtmlExtractors.js";

test("extractIds detecta ids duplicados", () => {
  const { all, counts } = extractIds('<div id="a"></div><div id="b"></div><div id="a"></div>');
  assert.deepEqual(all, ["a", "b", "a"]);
  assert.equal(counts.get("a"), 2);
  assert.equal(counts.get("b"), 1);
});

test("findObsoleteElements detecta etiquetas obsoletas", () => {
  const found = findObsoleteElements("<font color=red>x</font><center>y</center>");
  assert.ok(found.some((f) => f.tag === "font"));
  assert.ok(found.some((f) => f.tag === "center"));
});

test("extractLandmarks detecta nav/main/header/footer y roles equivalentes", () => {
  const landmarks = extractLandmarks('<nav></nav><main></main><div role="banner"></div>');
  assert.ok(landmarks.includes("nav"));
  assert.ok(landmarks.includes("main"));
  assert.ok(landmarks.includes("banner"));
});

test("extractFormControls extrae type/required/aria/placeholder/autocomplete", () => {
  const controls = extractFormControls('<input id="email" type="email" required autocomplete="email"><textarea placeholder="Mensaje"></textarea>');
  assert.equal(controls[0].type, "email");
  assert.equal(controls[0].required, true);
  assert.equal(controls[0].autocomplete, "email");
  assert.equal(controls[1].tagName, "textarea");
  assert.equal(controls[1].placeholder, "Mensaje");
});

test("extractLabels detecta label[for] y label envolvente", () => {
  const { forIds, wrappingCount } = extractLabels('<label for="nombre">Nombre</label><input id="nombre"><label>Email <input type="email"></label>');
  assert.deepEqual(forIds, ["nombre"]);
  assert.equal(wrappingCount, 1);
});

test("extractButtons detecta nombre accesible y solo-icono", () => {
  const buttons = extractButtons('<button>Enviar</button><button aria-label="Cerrar"><svg></svg></button><button><svg></svg></button>');
  assert.equal(buttons[0].hasAccessibleName, true);
  assert.equal(buttons[1].hasAccessibleName, true);
  assert.equal(buttons[2].hasAccessibleName, false);
  assert.equal(buttons[2].hasIconOnly, true);
});

test("isValidAriaRole reconoce roles válidos e inválidos", () => {
  assert.equal(isValidAriaRole("button"), true);
  assert.equal(isValidAriaRole("navigation"), true);
  assert.equal(isValidAriaRole("no-es-un-rol"), false);
});

test("extractRoles lista todos los role= del documento", () => {
  assert.deepEqual(extractRoles('<div role="button"></div><nav role="navigation"></nav>'), ["button", "navigation"]);
});

test("extractAriaReferences detecta aria-label vacío y aria-hidden contradictorio", () => {
  const refs = extractAriaReferences('<span aria-label=""></span><div aria-hidden="true"><button>x</button></div>');
  assert.equal(refs.emptyAriaLabels, 1);
  assert.equal(refs.ariaHiddenTrueWithFocusable, 1);
});

test("extractTables detecta caption/th/scope/headers y celdas vacías", () => {
  const tables = extractTables("<table><caption>Precios</caption><tr><th scope=\"col\">Nombre</th></tr><tr><td></td><td>x</td></tr></table>");
  assert.equal(tables[0].hasCaption, true);
  assert.equal(tables[0].thCount, 1);
  assert.equal(tables[0].hasScope, true);
  assert.equal(tables[0].emptyCellCount, 1);
  assert.equal(tables[0].totalCellCount, 2);
});

test("extractTabindexes detecta valores positivos y negativos", () => {
  const tabs = extractTabindexes('<div tabindex="3"></div><button tabindex="-1"></button>');
  assert.equal(tabs[0].value, 3);
  assert.equal(tabs[1].value, -1);
});

test("hasAutofocus / hasOutlineNoneInCss / hasSkipLink", () => {
  assert.equal(hasAutofocus("<input autofocus>"), true);
  assert.equal(hasOutlineNoneInCss("<style>a:focus{outline:none;}</style>"), true);
  assert.equal(hasSkipLink('<body><a href="#main">Saltar al contenido</a></body>'), true);
  assert.equal(hasSkipLink('<body><a href="#main">Inicio</a></body>'), false);
});

test("extractSvgElements detecta title/aria-label/role=img", () => {
  const svgs = extractSvgElements('<svg><title>Icono de reserva</title></svg><svg aria-hidden="true"></svg>');
  assert.equal(svgs[0].hasTitle, true);
  assert.equal(svgs[1].ariaHidden, true);
});

test("extractMediaElements detecta track/controls/autoplay en video y audio", () => {
  const media = extractMediaElements('<video controls autoplay><track kind="captions"></video><audio></audio>');
  assert.equal(media[0].kind, "video");
  assert.equal(media[0].hasTrack, true);
  assert.equal(media[0].hasAutoplay, true);
  assert.equal(media[1].hasControls, false);
});

test("extractAbbreviations cuenta elementos <abbr>", () => {
  assert.equal(extractAbbreviations("<abbr title=\"World Wide Web\">WWW</abbr> y <abbr>CSS</abbr>"), 2);
});

test("extractColorPairs extrae pares color/background inline", () => {
  const pairs = extractColorPairs('<p style="color:#777777;background-color:#888888">texto</p>');
  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].color, "#777777");
});
