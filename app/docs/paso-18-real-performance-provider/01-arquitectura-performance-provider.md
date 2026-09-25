# 01 — Arquitectura del Performance Provider

## Contrato (`plugins/performanceProviderPlugin.js`)

| Campo | Valor |
|---|---|
| id | `performanceProvider` |
| versión | 2 (1 fue el stub de Paso 14) |
| status | `"real"` |
| prioridad | 25 (tras `publicWebsiteFetcher` 10, `seoProvider` 15, `accessibilityProvider` 20) |
| capacidades | dimensión `performance`, categoría `"technicalQuality"` |
| entrada aceptada | `{ pages: [{url, body, headers?, httpVersion?, timing?, byteSize?, redirectChain?}], profileId? }` — **nunca** `{urls}` |
| tipos de evidencia | `sourceType: "performance_analysis_derived"` (nuevo, `evidenceSchema.js`) |
| salud | siempre saludable — analizador puro, sin red, sin navegador, sin credenciales |
| timeout | ninguna E/S propia; ejecutado vía `runProviderPipeline`, hereda `individualTimeoutMs`/`globalTimeoutMs` como cualquier proveedor (verificado por test) |
| dependencia de publicWebsiteFetcher | análisis puro sobre timing/cabeceras/HTML YA obtenidos en la MISMA petición (nunca importa `node:http`/`node:https`/`node:dns`, nunca importa/usa `playwright` — verificado por test); no depende de seoProvider/accessibilityProvider, se ejecuta sobre el mismo `pages` |
| necesita red | no — `credentialsNeeded: []` |
| alcance de medición | timing y cabeceras **reales** de la petición del documento (publicWebsiteFetcher, Paso 13/18) + análisis **estático** de lo declarado en el HTML — nunca ejecuta la página, nunca mide Core Web Vitals |

## Relación con publicWebsiteFetcher — de dónde sale el timing real

Paso 18 extiende `publicWebsiteFetcher.js` (sin tocar su política de
seguridad de Paso 13: sigue pidiendo `Accept-Encoding: identity`, sigue
con SSRF pinning) para medir y reexponer, de la MISMA petición que ya
hacía:

```
performPinnedRequest():
  requestStartedAt = Date.now()
  ...
  res => { headersReceivedAt = Date.now() }   // al recibir las cabeceras
  ...
  'end' => resolve({
    ...,
    httpVersion: res.httpVersion,
    timing: { timeToHeadersMs: headersReceivedAt - requestStartedAt, totalMs: Date.now() - requestStartedAt },
  })
```

`fetchPublicWebsite()` reexpone `headers` (whitelist ampliada:
`content-length`, `content-encoding`, `cache-control`, `expires`, `etag`,
`last-modified`, `vary`, `cf-ray`/`x-cache`/`x-served-by`/`via` para CDN),
`httpVersion` y `timing` en su resultado — **sin realizar ninguna
petición adicional**. `publicWebsiteFetcherPlugin.js` los añade a
`metadata.pages`, que llega intacto a `performanceProvider` a través del
puente.

## Orden de ejecución (cuarto paso explícito)

```
publicWebsiteFetcher.collect({urls, limits})
  → fetchPublicWebsite() por página (Paso 13, timing real añadido en Paso 18)
  → publicWebsiteFetcherPlugin.js expone metadata.pages con byteSize/httpVersion/timing (Paso 18)
  → orchestratorProviderBridge.js (Paso 16/17/18):
      runDerivedPageAnalysisProvider("seoProvider", {pages, profileId, ...})
      runDerivedPageAnalysisProvider("accessibilityProvider", {pages, profileId, ...})
      runDerivedPageAnalysisProvider("performanceProvider", {pages, profileId, ...})
    (mismo helper genérico introducido en Paso 16, generalizado en Paso 17, reutilizado sin cambios en Paso 18)
  → perfAnalyzer.analyzePerformanceForPages(pages, {profileId})
  → perfEvidence.buildEvidenceFromPerfFindings(findings, {...})
  → Evidence válida, mezclada con la de los otros 3 proveedores reales
```

`performanceProvider` NO depende de `seoProvider`/`accessibilityProvider`
— los 3 proveedores derivados analizan las MISMAS `pages` de forma
independiente, en el orden pedido por el enunciado.

## Las 10 categorías de análisis (`performance/perfAnalyzer.js`)

Reutiliza extractores de Paso 16/17 donde aplica (viewport de
`htmlSignals.js`) y añade extractores propios en
`performance/perfHtmlExtractors.js` (scripts, hojas de estilo, resource
hints, iframes, fuentes, comentarios, estilos inline, estimación de
nodos/anidamiento por regex, imágenes con foco en rendimiento, dominios
de terceros).

| Categoría | Checks implementados (resumen) | `measurementType` predominante |
|---|---|---|
| A. Respuesta HTTP | tiempo hasta cabeceras y total (medidos), status, redirecciones, HTTPS, versión HTTP, tamaño transferido, compresión | `measured`/`observed`; compresión siempre `not_measured` (ver doc 03) |
| B. Documento HTML | tamaño del documento, nº de nodos estimado (regex), profundidad de anidamiento estimada (heurística), buena formación básica, comentarios, estilos inline | `calculated`/`estimated`, declarado como tal |
| C. Recursos declarados | inventario de scripts/hojas de estilo/iframes, resource hints (preload/prefetch/preconnect/dns-prefetch), recuento total | `observed` |
| D. Imágenes | dimensiones declaradas, `loading="lazy"`, `srcset`/`sizes`, conteo; peso real siempre `unavailable` (nunca se descargan) | `observed`/`unavailable` |
| E. JavaScript | scripts bloqueantes (sin async/defer), duplicados, dominios de terceros; coste de ejecución siempre `browser_test_required` | `observed`; ejecución = `browser_test_required` |
| F. CSS | hojas bloqueantes, `media` declarado, duplicados, preload de CSS crítico; CSS no utilizado siempre `browser_test_required` | `observed`; no-utilizado = `browser_test_required` |
| G. Fuentes | `@font-face`/`<link rel=preload as=font>` declarados, `font-display` si aparece en CSS inline | `observed` |
| H. Caché y entrega | Cache-Control, ETag, Expires, evidencia de CDN (solo si una cabecera pública whitelisted lo confirma) | `observed` |
| I. Señales móviles | meta viewport, uso de unidades no responsivas en estilos inline detectables | `observed` |
| J. Métricas derivadas | agregados deterministas (cobertura de optimización de imágenes, cobertura de señales de caché) — **nunca** LCP/CLS/INP/FCP | `calculated` |

## Diferencia frente a Lighthouse, PageSpeed Insights y WebPageTest

| | performanceProvider (Paso 18) | Lighthouse / PageSpeed Insights | WebPageTest |
|---|---|---|---|
| Fuente de datos | Timing real de UNA petición HTTP (Node) + HTML ya recopilado, sin ejecutar nada | Ejecuta la página completa en Chrome (local o remoto) | Ejecuta la página en navegadores reales, red real, ubicaciones reales |
| Necesita navegador | No, nunca | Sí (Chrome) | Sí |
| Core Web Vitals (LCP/CLS/INP/FCP) | Nunca — requieren renderizado real | Sí, de campo o laboratorio | Sí |
| Coste de ejecución de JS | Nunca medido — declarado `browser_test_required` | Sí (profiling real) | Sí |
| CSS no utilizado | Nunca medido — declarado `browser_test_required` | Sí (coverage real) | Parcial |
| Compresión real (gzip/br) | Nunca determinado con certeza — la petición pide `identity` deliberadamente (Paso 13) | Sí | Sí |
| Peso real de recursos (imágenes/JS/CSS) | Nunca — no se descargan | Sí | Sí |
| Filmstrip / captura visual | Nunca | Sí | Sí |
| Cuándo usar cada uno | Auditoría rápida, determinista, offline-friendly, integrada en este sistema multiproveedor, sin dependencias externas | Medición de campo/laboratorio real, recomendado como complemento (fuera de alcance de este proveedor) | Medición de red real multi-ubicación (fuera de alcance) |

## Cómo añadir una regla de rendimiento nueva

1. Si necesitas un dato nuevo del HTML, añade una función pura en
   `performance/perfHtmlExtractors.js`.
2. Añade el `finding({...})` en la función `analyze<Categoría>` que
   corresponda en `perfAnalyzer.js` — decide con cuidado `status`/
   `measurementType` (`"observed"` solo si el dato ya está en la
   respuesta sin cálculo, `"measured"` si viene de `timing`,
   `"calculated"` si es una fórmula determinista sobre datos ya medidos/
   observados, `"estimated"` si es una heurística declarada como tal,
   `"not_measured"`/`"unavailable"`/`"browser_test_required"` si de
   verdad no es determinable con esta arquitectura — nunca inventes un
   valor para rellenar el hueco).
3. Si el grupo de SCORING (Fase 5, 11 grupos) difiere del grupo de
   ANÁLISIS (Fase 3, 10 categorías) de la nueva regla, añade su `ruleId`
   a `RULE_ID_TO_SCORE_GROUP_OVERRIDE` en `perfScoring.js` (p. ej.
   compresión y terceros son grupos de scoring propios aunque se detecten
   dentro de `response`/`resources`/`javascript`).
4. Si la regla depende del sector, añade el dato a
   `performance/perfSectorRules.js` (nunca un `if (profileId === ...)`
   dentro del análisis de código).
5. Añade un test en `perfAnalyzer.test.mjs` con el caso positivo y
   negativo. Si es `browser_test_required`/`not_measured`, añade un test
   que confirme que nunca se presenta como un hallazgo confirmado.
6. Cualquier finding con `polarity: "negative"` o `severity:
   "opportunity"` genera recomendación automáticamente — no hace falta
   tocar `perfRecommendations.js` salvo que necesites un esfuerzo
   estimado distinto (`EFFORT_BY_RULE_PREFIX`) o una métrica de
   re-medición específica (`REMEASURE_METRIC_BY_RULE_PREFIX`).
