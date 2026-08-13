import { test } from "node:test";
import assert from "node:assert/strict";

import {
  extractScripts,
  extractStylesheets,
  extractResourceHints,
  countIframes,
  extractFontReferences,
  countComments,
  countInlineStyleAttributes,
  estimateNodeCount,
  estimateNestingDepth,
  isDocumentWellFormed,
  extractImagesForPerformance,
  extractThirdPartyDomains,
} from "./perfHtmlExtractors.js";

test("extractScripts detecta src/inline/async/defer/module/inHead", () => {
  const html = '<html><head><script src="a.js" async></script><script>inline()</script></head><body><script src="b.js" defer type="module"></script></body></html>';
  const scripts = extractScripts(html);
  assert.equal(scripts[0].src, "a.js");
  assert.equal(scripts[0].async, true);
  assert.equal(scripts[0].inHead, true);
  assert.equal(scripts[1].inline, true);
  assert.equal(scripts[2].defer, true);
  assert.equal(scripts[2].isModule, true);
  assert.equal(scripts[2].inHead, false);
});

test("extractStylesheets detecta link[rel=stylesheet] y <style> inline con media", () => {
  const html = '<head><link rel="stylesheet" href="a.css" media="print"><style>body{color:red}</style></head>';
  const sheets = extractStylesheets(html);
  assert.equal(sheets[0].inline, false);
  assert.equal(sheets[0].href, "a.css");
  assert.equal(sheets[0].media, "print");
  assert.equal(sheets[1].inline, true);
  assert.equal(sheets[1].media, "all");
});

test("extractResourceHints detecta preload/prefetch/preconnect/dns-prefetch", () => {
  const html = '<link rel="preload" href="a.js" as="script"><link rel="preconnect" href="https://fonts.example.com">';
  const hints = extractResourceHints(html);
  assert.equal(hints[0].rel, "preload");
  assert.equal(hints[0].as, "script");
  assert.equal(hints[1].rel, "preconnect");
});

test("countIframes cuenta iframes", () => {
  assert.equal(countIframes("<iframe src='a'></iframe><iframe src='b'></iframe>"), 2);
});

test("extractFontReferences detecta archivos de fuente enlazados, preload y font-display", () => {
  const html = '<link rel="preload" href="a.woff2" as="font"><style>@font-face{font-family:X;src:url(b.woff2);font-display:swap;}</style>';
  const fonts = extractFontReferences(html);
  assert.equal(fonts.preloadedFonts.length, 1);
  assert.equal(fonts.fontFaceCount, 1);
  assert.deepEqual(fonts.fontDisplayValues, ["swap"]);
});

test("countComments / countInlineStyleAttributes", () => {
  assert.equal(countComments("<!-- a --><p>x</p><!-- b -->"), 2);
  assert.equal(countInlineStyleAttributes('<p style="color:red">x</p><span style="color:blue">y</span>'), 2);
});

test("estimateNodeCount cuenta etiquetas de apertura", () => {
  assert.equal(estimateNodeCount("<div><p>x</p></div>"), 2);
  assert.equal(estimateNodeCount("<div><p>x</p><span>y</span></div>"), 3);
});

test("estimateNestingDepth mide anidamiento de contenedores comunes", () => {
  assert.equal(estimateNestingDepth("<div><section><article>x</article></section></div>"), 3);
  assert.equal(estimateNestingDepth("<div>x</div>"), 1);
});

test("isDocumentWellFormed detecta descuadre de etiquetas de apertura/cierre", () => {
  assert.equal(isDocumentWellFormed("<div><p>x</p></div>").wellFormed, true);
  const bad = isDocumentWellFormed("<div><p>x</div>");
  assert.equal(bad.wellFormed, false);
  assert.ok(bad.mismatchedTags.includes("p"));
});

test("extractImagesForPerformance detecta dimensiones/srcset/sizes/loading/fetchpriority", () => {
  const html = '<img src="a.jpg" width="100" height="100" loading="lazy"><img src="b.jpg" srcset="b-2x.jpg 2x" sizes="100vw" fetchpriority="high">';
  const imgs = extractImagesForPerformance(html);
  assert.equal(imgs[0].hasDimensions, true);
  assert.equal(imgs[0].loadingLazy, true);
  assert.equal(imgs[1].hasSrcset, true);
  assert.equal(imgs[1].hasSizes, true);
  assert.equal(imgs[1].fetchPriorityHigh, true);
});

test("extractThirdPartyDomains detecta dominios distintos al de la página, ignora el propio", () => {
  const html = '<script src="https://cdn.terceros.example/x.js"></script><img src="/local.jpg"><link href="https://fonts.example.com/f.css">';
  const domains = extractThirdPartyDomains(html, "https://mi-sitio.com/");
  assert.deepEqual(domains.sort(), ["cdn.terceros.example", "fonts.example.com"]);
});
