import { test } from "node:test";
import assert from "node:assert/strict";

import { analyzeAccessibilityForPage, analyzeAccessibilityForPages, A11Y_CATEGORIES, SEVERITIES, FINDING_STATUSES, CHECK_TYPES } from "./a11yAnalyzer.js";

function page(overrides = {}) {
  return { url: "https://x.example/", body: "<html><head><title>Página</title></head><body></body></html>", ...overrides };
}

function findById(findings, id) {
  return findings.find((f) => f.id === id);
}
function findAllById(findings, id) {
  return findings.filter((f) => f.id === id);
}

test("todo finding declara categoría/severidad/status/checkType dentro de vocabularios cerrados, dimension='accessibility'", () => {
  const findings = analyzeAccessibilityForPage(page());
  for (const f of findings) {
    assert.ok(A11Y_CATEGORIES.includes(f.category), `categoría inválida: ${f.category}`);
    assert.ok(SEVERITIES.includes(f.severity), `severidad inválida: ${f.severity}`);
    assert.ok(FINDING_STATUSES.includes(f.status), `status inválido: ${f.status}`);
    assert.ok(CHECK_TYPES.includes(f.checkType), `checkType inválido: ${f.checkType}`);
    assert.equal(f.dimension, "accessibility");
  }
});

test("es determinista (mismo HTML -> mismos findings, JSON idéntico)", () => {
  const p = page();
  assert.equal(JSON.stringify(analyzeAccessibilityForPage(p)), JSON.stringify(analyzeAccessibilityForPage(p)));
});

test("2. HTML sin lang se detecta como crítico y automático, con criterio WCAG 3.1.1", () => {
  const f = findById(analyzeAccessibilityForPage(page({ body: "<html><head><title>t</title></head></html>" })), "a11y.document.lang");
  assert.equal(f.severity, "critical");
  assert.equal(f.checkType, "automatic");
  assert.equal(f.wcag.criterion, "3.1.1");
});

test("3. imagen sin alt se detecta como crítica, con criterio WCAG 1.1.1", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><img src="a.jpg"></body></html>' });
  const f = findById(analyzeAccessibilityForPage(p), "a11y.media.imagesMissingAlt");
  assert.equal(f.severity, "critical");
  assert.equal(f.wcag.criterion, "1.1.1");
});

test("4. formulario sin label se detecta como crítico, con criterio WCAG 3.3.2", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><input type="email" id="correo"></body></html>' });
  const f = findById(analyzeAccessibilityForPage(p), "a11y.forms.inputsWithoutLabel");
  assert.equal(f.severity, "critical");
  assert.equal(f.wcag.criterion, "3.3.2");
});

test("un input CON label asociado no se marca como sin label", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><label for="correo">Correo</label><input type="email" id="correo"></body></html>' });
  const f = findById(analyzeAccessibilityForPage(p), "a11y.forms.inputsWithoutLabel");
  assert.equal(f.polarity, "positive");
});

test("5. botón sin nombre accesible se detecta como crítico, con criterio WCAG 4.1.2", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><button><svg></svg></button></body></html>' });
  const f = findById(analyzeAccessibilityForPage(p), "a11y.linksButtons.buttonsWithoutName");
  assert.equal(f.severity, "critical");
  assert.equal(f.wcag.criterion, "4.1.2");
});

test("6. aria-labelledby roto (referencia a id inexistente) se detecta", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><div aria-labelledby="no-existe">x</div></body></html>' });
  const f = findById(analyzeAccessibilityForPage(p), "a11y.aria.brokenLabelledby");
  assert.ok(f);
  assert.equal(f.severity, "high");
});

test("aria-labelledby que SÍ referencia un id existente no se marca como roto", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><span id="etiqueta">Nombre</span><input aria-labelledby="etiqueta"></body></html>' });
  const f = findById(analyzeAccessibilityForPage(p), "a11y.aria.brokenLabelledby");
  assert.equal(f, undefined);
});

test("7. encabezados incorrectos: 0 h1 es 'high', salto de nivel se detecta", () => {
  const p = page({ body: "<html><head><title>t</title></head><body><h2>a</h2><h4>b</h4></body></html>" });
  const findings = analyzeAccessibilityForPage(p);
  assert.equal(findById(findings, "a11y.headings.h1Count").severity, "high");
  assert.ok(findById(findings, "a11y.headings.levelJumps"));
});

test("8. tabla sin encabezados (th) se detecta como crítica", () => {
  const p = page({ body: "<html><head><title>t</title></head><body><table><caption>Precios</caption><tr><td>a</td><td>b</td></tr></table></body></html>" });
  const f = findById(analyzeAccessibilityForPage(p), "a11y.tables.headers");
  assert.equal(f.severity, "critical");
  assert.equal(f.observedValue, 0);
});

test("9. tabindex positivo se detecta como alto, con criterio WCAG 2.4.3", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><div tabindex="3">x</div></body></html>' });
  const f = findById(analyzeAccessibilityForPage(p), "a11y.keyboard.positiveTabindex");
  assert.equal(f.severity, "high");
  assert.equal(f.wcag.criterion, "2.4.3");
});

test("10. contraste insuficiente (calculable) se detecta con el ratio real", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><p style="color:#aaaaaa;background-color:#ffffff">texto</p></body></html>' });
  const findings = findAllById(analyzeAccessibilityForPage(p), "a11y.contrast.pair");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].polarity, "negative");
  assert.ok(findings[0].observedValue < 4.5);
});

test("11. comprobación no evaluable: sin pares de color, status='unavailable', nunca se inventa un contraste", () => {
  const findings = analyzeAccessibilityForPage(page());
  const f = findById(findings, "a11y.contrast.noCalculablePairs");
  assert.equal(f.status, "unavailable");
  assert.equal(f.confidence, 0);
});

test("checkType='manual' nunca declara un resultado concluyente (confidence=0, status='manual_required')", () => {
  const findings = analyzeAccessibilityForPage(page());
  const manualFindings = findings.filter((f) => f.checkType === "manual");
  assert.ok(manualFindings.length >= 5, `se esperaban varias comprobaciones manuales, hubo ${manualFindings.length}`);
  for (const f of manualFindings) {
    assert.equal(f.status, "manual_required");
    assert.equal(f.confidence, 0);
    assert.equal(f.severity, "manual_review");
  }
});

test("las comprobaciones automáticas con hallazgo positivo declaran checkType='automatic' y confidence>0", () => {
  const p = page({ body: '<html lang="es"><head><meta charset="utf-8"><title>t</title></head><body><h1>ok</h1></body></html>' });
  const f = findById(analyzeAccessibilityForPage(p), "a11y.document.lang");
  assert.equal(f.checkType, "automatic");
  assert.ok(f.confidence > 0);
});

test("nunca se declara conformidad WCAG total: ningún finding usa las palabras 'conformidad total'/'cumple WCAG completo'", () => {
  const findings = analyzeAccessibilityForPage(page());
  for (const f of findings) {
    assert.doesNotMatch(`${f.title} ${f.rule}`, /conformidad total|cumple wcag completo|100% accesible|certificaci[oó]n/i);
  }
});

test("cada finding con criterio WCAG declara {criterion, level}", () => {
  const findings = analyzeAccessibilityForPage(page({ body: '<html><head><title>t</title></head><body><img src="a.jpg"></body></html>' }));
  const withWcag = findings.filter((f) => f.wcag !== null);
  assert.ok(withWcag.length > 0);
  for (const f of withWcag) {
    assert.ok(typeof f.wcag.criterion === "string");
    assert.ok(["A", "AA", "AAA"].includes(f.wcag.level));
  }
});

test("un enlace vacío y un botón sin nombre se detectan por separado (categoría linksButtons)", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><a href="#"></a><button></button></body></html>' });
  const findings = analyzeAccessibilityForPage(p);
  assert.ok(findById(findings, "a11y.linksButtons.emptyLinks"));
  assert.ok(findById(findings, "a11y.linksButtons.buttonsWithoutName"));
});

test("ids duplicados se detectan con severidad alta", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><div id="x"></div><div id="x"></div></body></html>' });
  const f = findById(analyzeAccessibilityForPage(p), "a11y.document.duplicateIds");
  assert.equal(f.severity, "high");
});

test("rol ARIA inválido se detecta", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><div role="boton-raro">x</div></body></html>' });
  const f = findById(analyzeAccessibilityForPage(p), "a11y.aria.invalidRoles");
  assert.equal(f.severity, "high");
});

test("perfil sectorial se refleja en el finding informativo de contenido (sin lógica de sector en el análisis de código)", () => {
  const findingsClub = analyzeAccessibilityForPage(page(), { profileId: "club-deportivo" });
  const f = findById(findingsClub, "a11y.content.formClarityProfile");
  assert.equal(f.observedValue.length > 0, true);
});

test("analyzeAccessibilityForPages combina hallazgos de varias páginas conservando la URL de cada una", () => {
  const pageA = page({ url: "https://x.example/a" });
  const pageB = page({ url: "https://x.example/b", body: '<html><head><title>t</title></head><body><img src="a.jpg"></body></html>' });
  const findings = analyzeAccessibilityForPages([pageA, pageB]);
  assert.ok(findings.some((f) => f.url === "https://x.example/a"));
  assert.ok(findings.some((f) => f.url === "https://x.example/b"));
});
