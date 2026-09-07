import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04ComposeMockupFrame } from "./mockupCompositor.js";

const TINY_PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64"
);

test("cp04ComposeMockupFrame produce SVG real con la imagen incrustada como data URI", () => {
  const svg = cp04ComposeMockupFrame({
    pngBuffer: TINY_PNG_1x1,
    device: "Android móvil",
    system: "Android",
    orientation: "vertical",
    resolution: { width: 412, height: 915 },
    projectName: "Clínica De Fisioterapia Málaga (demo)",
  });
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /data:image\/png;base64,/);
  assert.ok(svg.includes(TINY_PNG_1x1.toString("base64")));
});

test("el marco incluye device/system/orientation/resolución/proyecto y la etiqueta de simulación visual", () => {
  const svg = cp04ComposeMockupFrame({
    pngBuffer: TINY_PNG_1x1,
    device: "iPhone",
    system: "iOS",
    orientation: "vertical",
    resolution: { width: 390, height: 844 },
    projectName: "Proyecto X",
  });
  assert.match(svg, /iPhone · iOS · vertical · 390×844/);
  assert.match(svg, /Proyecto X/);
  assert.match(svg, /SIMULACIÓN VISUAL/);
});

test("no imita el contorno de ningún dispositivo comercial (sin muescas/botones/logos — solo un rectángulo redondeado genérico)", () => {
  const svg = cp04ComposeMockupFrame({
    pngBuffer: TINY_PNG_1x1,
    device: "iPhone",
    system: "iOS",
    orientation: "vertical",
    resolution: { width: 390, height: 844 },
    projectName: "X",
  });
  // Solo debe haber 2 rects de fondo (marco + badge) y ningún <path> de logotipo.
  const rectCount = (svg.match(/<rect /g) || []).length;
  assert.equal(rectCount, 2);
  assert.equal(svg.includes("<path"), false);
});

test("escapa el nombre del proyecto (evita inyección de XML/HTML)", () => {
  const svg = cp04ComposeMockupFrame({
    pngBuffer: TINY_PNG_1x1,
    device: "Windows",
    system: "Windows",
    orientation: "horizontal",
    resolution: { width: 1920, height: 1080 },
    projectName: '<script>alert(1)</script>',
  });
  assert.equal(svg.includes("<script>"), false);
  assert.match(svg, /&lt;script&gt;/);
});

test("una imagen ancha se reescala a un máximo razonable sin distorsionar la proporción", () => {
  const svg = cp04ComposeMockupFrame({
    pngBuffer: TINY_PNG_1x1,
    device: "Windows",
    system: "Windows",
    orientation: "horizontal",
    resolution: { width: 1920, height: 1080 },
    projectName: "X",
  });
  const widthMatch = svg.match(/<image x="\d+" y="\d+" width="(\d+)" height="(\d+)"/);
  assert.ok(widthMatch);
  const [, w, h] = widthMatch.map(Number);
  assert.ok(w <= 480);
  assert.ok(Math.abs(w / h - 1920 / 1080) < 0.02, "debe conservar la proporción original");
});
