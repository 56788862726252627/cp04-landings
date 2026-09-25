import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04GenerateSvgPreview, cp04WrapSvgInHtmlPage } from "./previewGenerator.js";

test("cp04GenerateSvgPreview produce SVG real y bien formado con los valores por defecto", () => {
  const svg = cp04GenerateSvgPreview();
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /width="320" height="320"/);
  assert.match(svg, /<\/svg>$/);
});

test("cp04GenerateSvgPreview respeta width/height/background/foreground explícitos", () => {
  const svg = cp04GenerateSvgPreview({ width: 800, height: 400, background: "#111111", foreground: "#ff0000" });
  assert.match(svg, /width="800" height="400"/);
  assert.match(svg, /fill="#111111"/);
  assert.match(svg, /stroke="#ff0000"/);
});

test("cp04GenerateSvgPreview con shape='circle' produce un <circle>, no un <rect>", () => {
  const svg = cp04GenerateSvgPreview({ shape: "circle", width: 200, height: 200 });
  assert.match(svg, /<circle /);
  assert.equal(/<rect /.test(svg), false);
});

test("cp04GenerateSvgPreview escapa el texto del label (evita inyección XML/XSS básica)", () => {
  const svg = cp04GenerateSvgPreview({ label: "<script>alert(1)</script>" });
  assert.equal(svg.includes("<script>"), false);
  assert.match(svg, /&lt;script&gt;/);
});

test("cp04GenerateSvgPreview con dimensiones inválidas (negativas/no numéricas) cae a los valores por defecto en vez de romper el SVG", () => {
  const svg = cp04GenerateSvgPreview({ width: -10, height: "no-es-un-numero" });
  assert.match(svg, /width="320" height="320"/);
});

test("cp04WrapSvgInHtmlPage produce una página HTML autocontenida con el SVG embebido", () => {
  const svg = cp04GenerateSvgPreview({ label: "Logo" });
  const html = cp04WrapSvgInHtmlPage(svg, "Mi título");
  assert.match(html, /^<!doctype html>/);
  assert.ok(html.includes(svg));
  assert.match(html, /<title>Mi título<\/title>/);
});
