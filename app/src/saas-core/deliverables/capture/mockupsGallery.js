// App 3 · Prompt 3/6 — Galería HTML de capturas reales.
//
// Deliberadamente en un archivo DISTINTO al de la galería de
// previsualización del Prompt 2 (mockups/galeria.html, marcos SVG sin
// captura real) — para no mezclar "marco simulado sin captura" con
// "captura real ya tomada", tal como exige explícitamente el
// enunciado de seguridad de este prompt.

import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

function escapeHtml(text) {
  return String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function cp04BuildMockupsGalleryHtml({ baseDir }) {
  const manifest = JSON.parse(await readFile(path.join(baseDir, "mockups", "mockups-manifest.json"), "utf8"));
  const framedItems = manifest.items.filter((item) => item.deliverableType === "mockup_framed");

  const cards = framedItems
    .map((item) => {
      const relFromGallery = path.relative(path.join(baseDir, "mockups"), path.join(baseDir, item.path)).replace(/\\/g, "/");
      return `<figure><img src="${relFromGallery}" alt="${escapeHtml(item.id)}" style="max-width:280px" /><figcaption>${escapeHtml(item.id)}</figcaption></figure>`;
    })
    .join("\n");

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Capturas reales — ${escapeHtml(manifest.projectName)}</title>
<style>body{font-family:sans-serif;background:#05080d;color:#e2e8f0;padding:24px} figure{display:inline-block;margin:14px;text-align:center;font-size:.78rem}</style>
</head><body>
<h1>Capturas reales — ${escapeHtml(manifest.projectName)}</h1>
<p>Versión del manifiesto de capturas: ${manifest.version} · ${framedItems.length} mockup(s) con marco.</p>
<p><em>Cada imagen es una captura real de Chromium headless, con un marco SVG informativo (etiquetado "SIMULACIÓN VISUAL") — no certifica renderizado físico del sistema operativo.</em></p>
${cards}
</body></html>`;
}

export async function cp04WriteMockupsGallery({ baseDir }) {
  const html = await cp04BuildMockupsGalleryHtml({ baseDir });
  const outPath = path.join(baseDir, "mockups", "galeria-capturas-reales.html");
  await writeFile(outPath, html, "utf8");
  return outPath;
}
