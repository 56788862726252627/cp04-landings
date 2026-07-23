# 01 — Arquitectura del SEO Provider

## Contrato (`plugins/seoProviderPlugin.js`)

| Campo | Valor |
|---|---|
| id | `seoProvider` |
| versión | 2 (1 fue el stub de Paso 14) |
| status | `"real"` |
| prioridad | 15 (justo detrás de `publicWebsiteFetcher`, 10) |
| capacidades | dimensiones `seoTechnical`/`seoContent`/`seoLocal`, categoría `"seo"` |
| entrada aceptada | `{ pages: [{url, httpStatus, body, headers?, robotsTxt?, redirectChain?}], profileId? }` — **nunca** `{urls}` |
| tipos de evidencia | `sourceType: "seo_analysis_derived"` (nuevo, `evidenceSchema.js`) |
| salud | siempre saludable — analizador puro, sin red ni credenciales |
| timeout | ninguna E/S propia (CPU-bound sobre HTML en memoria); el puente lo ejecuta a través de `runProviderPipeline`, por lo que `individualTimeoutMs`/`globalTimeoutMs` se aplican igual que a cualquier otro proveedor |
| dependencia de publicWebsiteFetcher | análisis puro sobre su salida; nunca importa `node:http`/`node:https`/`node:dns` (verificado por test) |
| necesita red | no — `credentialsNeeded: []` |
| estado | real, pero sin `pages` responde `status:"skipped"` — nunca inventa |

## Relación con `publicWebsiteFetcher` — "recopila → analiza"

```
publicWebsiteFetcher.collect({urls, limits})
  → fetchPublicWebsite() por página (Paso 13, sin cambios)
    → { status, url, httpStatus, body, headers, robotsTxt, redirectChain, ... }
  → publicWebsiteFetcherPlugin.js expone metadata.pages (Paso 16, NUEVO)
    → orchestratorProviderBridge.js (Paso 16): paso EXPLÍCITO tras la
      cadena principal — SOLO si seoProvider está habilitado Y
      publicWebsiteFetcher produjo `metadata.pages` en ESTA MISMA
      ejecución — invoca seoProvider.collect({pages, profileId}) a
      través de runProviderPipeline([seoProvider], {pages,...}, {...})
    → seoAnalyzer.analyzeSeoForPages(pages, {profileId})
    → seoEvidence.buildEvidenceFromSeoFindings(findings, {...})
    → Evidence válida, mezclada con la de publicWebsiteFetcher
```

**Por qué un paso explícito y no la cadena genérica**: el pipeline
genérico de Paso 14/15 llama a TODOS los proveedores con el MISMO input
(`{urls, limits}`) — seoProvider necesita `{pages}`, con contenido ya
descargado. Meterlo en la cadena genérica habría significado o (a)
cambiar el contrato de todos los demás proveedores, o (b) que
seoProvider reciba `{urls}` y tenga que descargar él mismo (prohibido
explícitamente por el enunciado: "no dupliques la descarga web"). La
solución: seoProvider SÍ participa en la cadena genérica (para que
`--exclude-providers`/perfiles/salud/circuit breaker lo traten como a
cualquier otro — con `{urls,limits}` simplemente no tiene `pages` y
responde `"skipped"`), y ADEMÁS se re-invoca explícitamente, ya con
`{pages}` reales, justo después, reemplazando esa entrada `"skipped"`
por el resultado real en el resumen.

## Extensión mínima de `publicWebsiteFetcher.js` (sin segunda descarga)

Dos datos que `seoAnalyzer.js` necesita NO estaban expuestos por Paso 13:

1. **Cabeceras HTTP relevantes** (`x-robots-tag`, `content-language`):
   ya estaban en `response.headers` (recibidas en la MISMA petición),
   simplemente no se pasaban hacia arriba. Ahora `fetchPublicWebsite()`
   reexpone un subconjunto whitelisted (`SEO_RELEVANT_RESPONSE_HEADERS`)
   — nunca cookies ni cabeceras de autenticación.
2. **robots.txt**: ya se descargaba dentro de `fetchPublicWebsite()` para
   decidir `ROBOTS_DISALLOWED` (Paso 13) — se descartaba tras usarlo.
   Ahora se recuerda (`lastRobotsResult`) y se reexpone en el resultado
   `"available"`. **Cero peticiones nuevas** — mismo test que antes
   (`robotsRequests === 1`) sigue pasando.

Ninguno de los 32 tests preexistentes de `publicWebsiteFetcher.test.mjs`
cambió — solo se añadieron 2 nuevos para las cabeceras/robots.txt
reexpuestos.

## Las 8 categorías de análisis (`seo/seoAnalyzer.js`)

Cada categoría es una función pura `analyze<Categoría>(page, opts) ->
finding[]`. Un `finding` declara: `id` (regla), `category`, `dimension`
(seoTechnical/seoContent/seoLocal), `status` (observed/calculated/
inferred/unavailable/unverified/blocked/fixture), `severity` (critical/
high/medium/low/opportunity/not_evaluable), `polarity`/`strength`/
`confidence`, `title`, `observedValue`, `rule`, `url`, `limitations`.

| Categoría | Checks implementados (resumen) |
|---|---|
| A. Indexación | status HTTP, meta robots (noindex/nofollow), X-Robots-Tag (o "unavailable" si la fuente no expone cabeceras), canonical (presente/autorreferenciado), robots.txt disponible, sitemap declarado (solo lectura de la directiva `Sitemap:` en robots.txt — **nunca se descarga el sitemap en sí**) |
| B. Metadatos | title (presente/longitud/texto), meta description (presente/longitud), duplicación de title ENTRE páginas del lote, idioma (`html lang`), charset, viewport, Open Graph, Twitter Card |
| C. Estructura | nº de H1, jerarquía de encabezados (saltos de nivel), encabezados vacíos, recuento de texto visible, navegación identificable |
| D. Enlaces | internos/externos, href vacío, esquema inseguro (`javascript:`/`data:`), anchor text genérico, atributos `rel` (nofollow/sponsored/ugc), enlaces rotos **solo si apuntan a otra página YA recopilada en el mismo lote** con `httpStatus>=400` (nunca se afirma sin comprobación) |
| E. Imágenes | total, alt ausente/vacío/presente, dimensiones declaradas, `loading="lazy"`, formato por extensión; **peso de imagen SIEMPRE `"unavailable"`** (no se descargan recursos de imagen) |
| F. Datos estructurados | JSON-LD (parseo real, errores de sintaxis reportados sin lanzar), microdata (`itemtype`), adecuación heurística preliminar al perfil sectorial — **nunca una validación oficial** (se declara explícitamente en `limitations`) |
| G. Contenido | contenido escaso (umbral configurable por perfil), duplicación **solo entre páginas del mismo lote**, contacto, dirección/horario (heurística NAP), FAQ, palabras clave relevantes del perfil |
| H. SEO técnico | HTTPS, redirección HTTP→HTTPS (solo si la propia cadena de redirecciones de esta petición lo demuestra), parámetros de URL, favicon, manifest, hreflang, paginación, profundidad **relativa solo al lote recopilado** |

**Nunca se calculan/inventan Core Web Vitals ni puntuaciones tipo
Lighthouse** — verificado por test explícito
(`seoAnalyzer.test.mjs`: "nunca se produce ningún finding relacionado
con Core Web Vitals o Lighthouse").

## Diferencia frente a Lighthouse / Search Console

| | seoProvider (Paso 16) | Lighthouse | Search Console |
|---|---|---|---|
| Fuente de datos | HTML ya recopilado por `publicWebsiteFetcher` (una petición, sin JS) | Ejecuta la página en un navegador real (Chrome headless), mide runtime | Datos históricos de rastreo/indexación reales de Google, requiere verificación de propiedad |
| Core Web Vitals | Nunca — explícitamente fuera de alcance | Sí, los mide de verdad | Sí, con datos de campo reales (CrUX) |
| JavaScript | No se ejecuta — análisis solo del HTML servido | Se ejecuta completo (SPA incluidas) | N/A |
| Validación de rich results | No — heurística preliminar de tipos Schema.org, declarada como tal | No es su función | Sí, real (`Search Console > Mejoras`) |
| Estado de indexación real en Google | No — no tiene acceso a los índices de Google | No | Sí, es su función principal |
| Cuándo usar cada uno | Auditoría rápida, determinista, offline-friendly, del propio proveedor de este sistema | Métricas de rendimiento/UX reales (proveedor `lighthouseProvider`, aún stub) | Verdad de campo sobre indexación/cobertura real (fuera del alcance de este sistema) |

## Cómo añadir una regla SEO nueva

1. Si necesitas un dato nuevo del HTML, añade una función pura en
   `seo/seoHtmlExtractors.js` (o reutiliza `htmlSignals.js` si ya existe
   algo parecido) — nunca mezcles extracción con la lógica de severidad.
2. Añade el `finding({...})` correspondiente dentro de la función
   `analyze<Categoría>` que corresponda en `seoAnalyzer.js` (o crea una
   nueva categoría si de verdad no encaja en las 8 existentes — actualiza
   `SEO_CATEGORIES`).
3. Si la regla depende del sector, NO metas el `if (profileId === ...)`
   en `seoAnalyzer.js` — añade el dato a `seoSectorRules.js`
   (`expectedSchemaTypes`/`relevantContentKeywords`/
   `thinContentWordThreshold`) y consúltalo vía `getSeoSectorRule(profileId)`.
4. Añade un test en `seoAnalyzer.test.mjs` que cubra el caso positivo y
   negativo de la regla nueva.
5. Si la regla debe generar una recomendación, no hace falta tocar
   `seoRecommendations.js`: cualquier finding con `polarity:"negative"` o
   `severity:"opportunity"` genera recomendación automáticamente.
