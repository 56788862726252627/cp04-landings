# 01 — Arquitectura del Accessibility Provider

## Contrato (`plugins/accessibilityProviderPlugin.js`)

| Campo | Valor |
|---|---|
| id | `accessibilityProvider` |
| versión | 2 (1 fue el stub de Paso 14) |
| status | `"real"` |
| prioridad | 20 (tras `publicWebsiteFetcher` 10 y `seoProvider` 15) |
| capacidades | dimensión `accessibility`, categoría `"accessibility"` |
| entrada aceptada | `{ pages: [{url, body, headers?, robotsTxt?, redirectChain?}], profileId? }` — **nunca** `{urls}` |
| tipos de evidencia | `sourceType: "accessibility_analysis_derived"` (nuevo, `evidenceSchema.js`) |
| salud | siempre saludable — analizador puro, sin red, sin navegador, sin credenciales |
| timeout | ninguna E/S propia; ejecutado vía `runProviderPipeline`, hereda `individualTimeoutMs`/`globalTimeoutMs` como cualquier proveedor (verificado por test) |
| dependencia de publicWebsiteFetcher/seoProvider | análisis puro sobre la salida de `publicWebsiteFetcher` (nunca importa `node:http`/`node:https`/`node:dns`, nunca importa/usa `playwright` — verificado por test); no depende de `seoProvider`, se ejecuta en paralelo conceptual sobre el mismo `pages` |
| necesita red | no — `credentialsNeeded: []` |
| nivel de cobertura automática | **parcial y explícito**: cada hallazgo declara `checkType: "automatic"\|"partial"\|"manual"` — ver documento 03 |

## Relación con publicWebsiteFetcher y seoProvider — orden de ejecución

```
publicWebsiteFetcher.collect({urls, limits})
  → fetchPublicWebsite() por página (Paso 13, sin cambios)
  → publicWebsiteFetcherPlugin.js expone metadata.pages (Paso 16)
  → orchestratorProviderBridge.js (Paso 16/17):
      runDerivedPageAnalysisProvider("seoProvider", {pages, profileId, ...})
      runDerivedPageAnalysisProvider("accessibilityProvider", {pages, profileId, ...})
    (mismo helper genérico, reutilizado por los dos — ver más abajo)
  → a11yAnalyzer.analyzeAccessibilityForPages(pages, {profileId})
  → a11yEvidence.buildEvidenceFromA11yFindings(findings, {...})
  → Evidence válida, mezclada con la de publicWebsiteFetcher y seoProvider
```

`accessibilityProvider` NO depende del resultado de `seoProvider` — ambos
analizan las MISMAS `pages` de forma independiente, en el orden pedido
por el enunciado (`publicWebsiteFetcher → seoProvider →
accessibilityProvider`), pero sin que uno necesite la salida del otro.

### `runDerivedPageAnalysisProvider` — generalización del patrón de Paso 16

Paso 16 introdujo un paso explícito, fuera de la cadena genérica del
pipeline, específico para `seoProvider`. Paso 17 lo **generaliza** en una
única función reutilizable (`orchestratorProviderBridge.js`) que
cualquier "proveedor derivado" (analiza páginas ya recopiladas, nunca
descarga) puede usar:

```js
async function runDerivedPageAnalysisProvider(providerId, { registry, fetchedPages, profileId, policy, circuitBreaker, providerRunEntries }) { ... }
```

Se llama dos veces, en orden: una para `"seoProvider"`, otra para
`"accessibilityProvider"`. Cada llamada reutiliza `runProviderPipeline`
(Paso 14) como mini-pipeline de un proveedor, heredando timeout/
cancelación sin duplicar esa lógica — el mismo mecanismo que corrigió el
bug de timeout de Paso 16, ahora aplicado uniformemente a ambos.

## Las 10 categorías de análisis (`accessibility/a11yAnalyzer.js`)

Reutiliza extractores de Paso 16 (`seo/seoHtmlExtractors.js`:
encabezados, imágenes, enlaces, lang, charset, título) y de Paso 12
(`htmlSignals.js`: viewport, wordCount) — nunca los reimplementa. Añade
extractores específicos de accesibilidad en
`accessibility/a11yHtmlExtractors.js` (ids, formularios/labels, ARIA,
tablas, tabindex, SVG, audio/vídeo) y un cálculo REAL de contraste WCAG
en `accessibility/a11yContrast.js`.

| Categoría | Checks implementados (resumen) |
|---|---|
| A. Documento | lang, charset, viewport, title, landmarks, ids duplicados/vacíos, elementos obsoletos (`font`/`center`/`marquee`...); orden lógico de lectura = **manual** |
| B. Encabezados | nº de H1, encabezados vacíos, saltos de nivel (reutiliza Paso 16); "encabezado usado solo por estilo" = **manual** |
| C. Imágenes y multimedia | alt ausente/vacío (decorativas = indicio parcial), SVG sin título/aria-label, `<video>`/`<audio>` con/sin `<track>` (nunca se declara ausencia de subtítulos sin comprobar el archivo en sí — solo se reporta la ausencia de marcado `<track>`), autoplay, controles |
| D. Enlaces y botones | enlaces sin texto accesible, texto genérico repetido, `target="_blank"` sin aviso, botones sin nombre accesible, `role="button"` no semántico (indicio parcial: no confirma comportamiento de teclado en JS) |
| E. Formularios | inputs sin label (ni aria-label/aria-labelledby), placeholder como única etiqueta, required sin aria-required, fieldset/legend en grupos de radio/checkbox, autocomplete; mensajes de error dinámicos = **manual** |
| F. ARIA | roles inválidos (lista curada WAI-ARIA 1.2, no un parser normativo exhaustivo), aria-label vacío, aria-labelledby/aria-describedby rotos (referencian ids inexistentes), aria-hidden="true" con contenido interactivo dentro; validación ARIA normativa completa = **manual** |
| G. Tablas | caption, th, scope, distinción heurística tabla de datos/maquetación, celdas vacías (indicio parcial) |
| H. Teclado y foco | tabindex positivo, tabindex negativo en control nativo, autofocus, `outline:none` en CSS estático, skip link; navegación completa por teclado = **manual** |
| I. Contraste y color | ratio WCAG real (fórmula de luminancia relativa) sobre pares color/fondo **inline** extraíbles como hex/rgb — nunca inventa un contraste sin datos; dependencia exclusiva del color = **manual** |
| J. Contenido y legibilidad | recuento de palabras, `<abbr>`, cambios de idioma marcados (`lang` en sub-elementos), notas priorizadas por perfil sectorial |

Cada hallazgo con criterio WCAG aplicable incluye `finding.wcag =
{criterion, level, technique}` — ver documento 03 para el mapeo completo
y sus límites declarados.

## Diferencia frente a Lighthouse, axe-core y una auditoría humana

| | accessibilityProvider (Paso 17) | Lighthouse (accesibilidad) | axe-core | Auditoría humana |
|---|---|---|---|---|
| Fuente de datos | HTML ya recopilado, sin ejecutar nada | Ejecuta la página en Chrome headless | Ejecuta en un DOM real (navegador o jsdom) | Persona con tecnología de asistencia real |
| Necesita navegador | No, nunca | Sí (Chrome) | Sí (o jsdom) | N/A |
| Árbol de accesibilidad real (AOM) | No — regex sobre HTML, no un DOM computado | Sí | Sí | Sí (percibido) |
| Interacción real (teclado, foco dinámico) | No — solo evidencia estática, declarado explícitamente | Parcial | Parcial | Sí, completa |
| Validación ARIA normativa completa | No — lista curada de roles, sin combinaciones normativas | Parcial | Sí (motor de reglas dedicado) | Sí (criterio experto) |
| Contraste | Sí, real, solo estilos inline | Sí, real, todo el CSS computado | Sí, real, todo el CSS computado | Sí, percibido/medido |
| Certificación WCAG | Nunca | Nunca (es una herramienta, no una certificación) | Nunca | Puede formar parte de un proceso de certificación con criterio experto |
| Cuándo usar cada uno | Auditoría rápida, determinista, offline-friendly, integrada en este sistema multiproveedor | Métricas combinadas con rendimiento/SEO en un entorno real de navegador | Cobertura de reglas más amplia y precisa sobre el DOM real (candidato natural para un futuro proveedor con navegador, fuera de alcance aquí) | Única vía para una conclusión de conformidad real |

## Cómo añadir una regla de accesibilidad nueva

1. Si necesitas un dato nuevo del HTML, añade una función pura en
   `accessibility/a11yHtmlExtractors.js` (o reutiliza
   `seo/seoHtmlExtractors.js`/`htmlSignals.js` si ya existe algo
   parecido).
2. Añade el `finding({...})` en la función `analyze<Categoría>` que
   corresponda en `a11yAnalyzer.js` — decide con cuidado `checkType`
   (`"automatic"` solo si el HTML estático lo confirma con certeza,
   `"partial"` si es un indicio razonable, `"manual"` si de verdad
   requiere interacción/criterio humano).
3. Si tiene un criterio WCAG 2.2 aplicable, añade `wcag(criterion,
   level)` — usa la lista de criterios ya mapeados en este archivo como
   referencia, no inventes un nivel (A/AA/AAA) sin confirmarlo en la
   especificación oficial.
4. Si la regla depende del sector, añade el dato a
   `accessibility/a11ySectorRules.js` (nunca un `if (profileId === ...)`
   dentro del análisis de código).
5. Añade un test en `a11yAnalyzer.test.mjs` con el caso positivo y
   negativo. Si es `checkType: "manual"`, añade un test que confirme
   `status: "manual_required"` y `confidence: 0`.
6. Cualquier finding con `polarity: "negative"` o `severity:
   "opportunity"` genera recomendación automáticamente — no hace falta
   tocar `a11yRecommendations.js` salvo que necesites un esfuerzo
   estimado distinto (`EFFORT_BY_RULE_PREFIX`).
