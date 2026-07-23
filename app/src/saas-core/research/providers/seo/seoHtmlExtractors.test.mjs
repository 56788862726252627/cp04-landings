import { test } from "node:test";
import assert from "node:assert/strict";

import {
  extractTitleText,
  extractMetaContent,
  extractMetaProperty,
  extractCanonicalUrl,
  extractHtmlLang,
  extractCharset,
  extractOpenGraphTags,
  extractTwitterCard,
  extractH1Texts,
  extractHeadingSequence,
  findHeadingLevelJumps,
  extractLinks,
  extractImages,
  extractJsonLdBlocks,
  extractMicrodataTypes,
  hasFaviconLink,
  extractHreflangs,
  extractPaginationLinks,
  extractMetaRobots,
} from "./seoHtmlExtractors.js";

test("extractTitleText devuelve el texto exacto, sin tags anidados", () => {
  assert.equal(extractTitleText("<title>  Club Pádel 04  </title>"), "Club Pádel 04");
  assert.equal(extractTitleText("<html></html>"), null);
});

test("extractMetaContent/extractMetaProperty leen name/content y property/content en cualquier orden", () => {
  assert.equal(extractMetaContent('<meta name="description" content="hola mundo">', "description"), "hola mundo");
  assert.equal(extractMetaContent('<meta content="hola mundo" name="description">', "description"), "hola mundo");
  assert.equal(extractMetaProperty('<meta property="og:title" content="Título OG">', "og:title"), "Título OG");
});

test("extractCanonicalUrl / extractHtmlLang / extractCharset", () => {
  assert.equal(extractCanonicalUrl('<link rel="canonical" href="https://x.com/pagina">'), "https://x.com/pagina");
  assert.equal(extractCanonicalUrl("<html></html>"), null);
  assert.equal(extractHtmlLang('<html lang="es">'), "es");
  assert.equal(extractCharset('<meta charset="utf-8">'), "utf-8");
});

test("extractOpenGraphTags / extractTwitterCard", () => {
  const html = '<meta property="og:title" content="T"><meta property="og:image" content="i.jpg"><meta name="twitter:card" content="summary">';
  const og = extractOpenGraphTags(html);
  assert.equal(og.title, "T");
  assert.equal(og.image, "i.jpg");
  assert.equal(extractTwitterCard(html), "summary");
});

test("extractH1Texts devuelve el texto de cada h1 en orden", () => {
  assert.deepEqual(extractH1Texts("<h1>Uno</h1><p>x</p><h1>Dos</h1>"), ["Uno", "Dos"]);
});

test("extractHeadingSequence marca encabezados vacíos", () => {
  const seq = extractHeadingSequence("<h1>Título</h1><h2></h2><h3>Sub</h3>");
  assert.deepEqual(seq, [
    { level: 1, text: "Título", empty: false },
    { level: 2, text: "", empty: true },
    { level: 3, text: "Sub", empty: false },
  ]);
});

test("findHeadingLevelJumps detecta saltos h2->h4 sin h3 intermedio", () => {
  const seq = extractHeadingSequence("<h1>a</h1><h2>b</h2><h4>c</h4>");
  const jumps = findHeadingLevelJumps(seq);
  assert.equal(jumps.length, 1);
  assert.deepEqual(jumps[0], { from: 2, to: 4, atIndex: 2 });
});

test("extractLinks clasifica interno/externo, href vacío, esquema inseguro y anchor genérico", () => {
  const html = `
    <a href="/servicios">Servicios ofrecidos</a>
    <a href="https://otro-dominio.com/">visita</a>
    <a href="#">click aquí</a>
    <a href="javascript:alert(1)">malo</a>
    <a href="mailto:hola@x.com">contacto</a>
  `;
  const links = extractLinks(html, "https://mi-sitio.com/");
  assert.equal(links[0].isInternal, true);
  assert.equal(links[1].isInternal, false);
  assert.equal(links[2].isEmpty, true);
  assert.equal(links[2].isGenericText, true);
  assert.equal(links[3].isInsecureScheme, true);
  assert.equal(links[4].scheme, "mailto");
});

test("extractImages distingue alt ausente / vacío / presente, y detecta loading lazy", () => {
  const html = `<img src="a.jpg"><img src="b.png" alt=""><img src="c.webp" alt="descripción" loading="lazy">`;
  const imgs = extractImages(html);
  assert.equal(imgs[0].hasAlt, false);
  assert.equal(imgs[1].hasAlt, true);
  assert.equal(imgs[1].altEmpty, true);
  assert.equal(imgs[2].altEmpty, false);
  assert.equal(imgs[2].loadingLazy, true);
  assert.equal(imgs[2].format, "webp");
});

test("extractJsonLdBlocks parsea JSON-LD válido y reporta error en inválido, sin lanzar", () => {
  const validHtml = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"X"}</script>`;
  const blocks = extractJsonLdBlocks(validHtml);
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].parseError, null);
  assert.deepEqual(blocks[0].types, ["LocalBusiness"]);

  const invalidHtml = `<script type="application/ld+json">{ esto no es json }</script>`;
  const badBlocks = extractJsonLdBlocks(invalidHtml);
  assert.equal(badBlocks[0].parsed, null);
  assert.ok(badBlocks[0].parseError);
});

test("extractMicrodataTypes lee itemtype", () => {
  assert.deepEqual(extractMicrodataTypes('<div itemscope itemtype="https://schema.org/Restaurant">'), ["Restaurant"]);
});

test("hasFaviconLink / extractHreflangs / extractPaginationLinks", () => {
  assert.equal(hasFaviconLink('<link rel="icon" href="/favicon.ico">'), true);
  assert.equal(hasFaviconLink("<html></html>"), false);
  const hreflangs = extractHreflangs('<link rel="alternate" hreflang="en" href="https://x.com/en"><link rel="alternate" hreflang="es" href="https://x.com/es">');
  assert.equal(hreflangs.length, 2);
  assert.equal(hreflangs[0].hreflang, "en");
  const pag = extractPaginationLinks('<link rel="next" href="/p2">');
  assert.equal(pag.hasNext, true);
  assert.equal(pag.hasPrev, false);
});

test("extractMetaRobots lee el contenido de <meta name=robots>", () => {
  assert.equal(extractMetaRobots('<meta name="robots" content="noindex, nofollow">'), "noindex, nofollow");
  assert.equal(extractMetaRobots("<html></html>"), null);
});
