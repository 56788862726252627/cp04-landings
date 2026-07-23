# 03 — Límites de medición y honestidad técnica

## El vocabulario `measurementType`/`status` — por qué existe

Cada hallazgo de `perfAnalyzer.js` declara uno de estos valores:

| `measurementType` | Significado | `severity` típica | `confidence` |
|---|---|---|---|
| `"observed"` | Dato leído directamente de la respuesta ya recibida (status, cabeceras, HTTPS, versión HTTP) | variable | Alta (≥0.9) |
| `"measured"` | Cronometrado con el cliente HTTP de Node durante la petición real (`timeToHeadersMs`/`totalMs`) | variable | Alta (0.9) — nunca 1: nunca equivale al TTFB de un navegador real |
| `"calculated"` | Fórmula determinista sobre datos ya observados/medidos (tamaño de documento, cobertura de optimización de imágenes, cobertura de señales de caché) | variable | Alta si la fórmula es exacta, media si es una aproximación declarada |
| `"estimated"` | Heurística explícita (recuento de nodos por regex, profundidad de anidamiento) — declarada como aproximación, nunca presentada como medición exacta | `opportunity` | Media/baja (0.4-0.7) |
| `"not_measured"` | Deliberadamente no determinable con esta arquitectura (compresión real) | `not_measured` | `0` |
| `"unavailable"` | Requeriría descargar algo que este proveedor nunca descarga (peso real de imágenes/JS/CSS) | `not_measured` | `0` |
| — | Requiere un navegador real (coste de ejecución JS, CSS no utilizado) | `browser_test_required` | `0` |

## Por qué esto importa: evitar una falsa sensación de "auditoría de rendimiento completa"

Una herramienta que presenta datos parciales como si fueran una medición
de rendimiento completa (tipo Lighthouse) induciría a error. Este
proveedor evita ese riesgo de forma estructural:

- `computePerfScoreBreakdown` excluye los hallazgos `not_measured`/
  `unavailable` del cálculo del score (nunca los cuenta como aprobados ni
  como fallidos) y excluye por completo `browser_test_required` del
  scoring (ni siquiera reduce cobertura de forma numérica más allá de lo
  que ya refleja `unmeasuredCount`).
- `buildPerfRecommendations` presenta `browser_test_required` bajo su
  propia severidad dedicada, con el texto explícito *"Prueba con
  navegador real documentada... (esta herramienta no la automatiza)"* —
  nunca mezclado con `"critical"`/`"high"`/etc. `not_measured` nunca
  genera una recomendación accionable por sí solo (solo aparece si el
  usuario pide `--show-unmeasured`).
- `reports/performance.md` incluye SIEMPRE, como primera línea visible,
  el disclaimer: *"Puntuación propia basada en datos observados/medidos/
  calculados de este proveedor — no es una puntuación de Lighthouse ni de
  PageSpeed Insights, no mide Core Web Vitals (LCP/CLS/INP/FCP) y no
  sustituye una prueba real de navegador."*
- `research:performance -- --show-unmeasured` lista explícitamente qué
  queda fuera de alcance, para que sea imposible pasarlo por alto.

## Métricas que quedan SIEMPRE fuera de alcance de este proveedor

1. Core Web Vitals: LCP, CLS, INP, FCP — requieren renderizado real en un
   navegador. Nunca se calculan, nunca se estiman, nunca se mencionan
   salvo en el propio disclaimer explicando que no se miden (verificado
   por test: ningún finding declara un valor numérico bajo esas siglas).
2. Compresión real del servidor (gzip/br) ante un cliente normal:
   `publicWebsiteFetcher` solicita `Accept-Encoding: identity`
   deliberadamente (decisión de seguridad de Paso 13, no tocada por este
   paso) — la respuesta observada nunca refleja cómo respondería el
   servidor a un cliente real que sí acepta compresión.
3. Peso real de recursos individuales (imágenes, scripts, CSS, fuentes):
   nunca se descargan, solo se analiza lo DECLARADO en el HTML.
4. Coste de ejecución de JavaScript (tiempo de parseo/compilación/
   ejecución en el hilo principal): requiere un motor JS real.
5. CSS no utilizado (coverage): requiere un motor de renderizado real
   (Chrome DevTools/Lighthouse coverage).
6. Filmstrip/captura visual, Speed Index, Time to Interactive "real":
   ninguno se calcula — todos requieren un navegador.

## Diferencia con el TTFB de un navegador real

`response.timeToHeadersMs` es real (cronometrado por Node durante la
petición), pero **no equivale al TTFB medido por un navegador real ni
por Web Vitals de campo** — no incluye la cola de red del navegador,
resolución DNS del sistema del usuario final, ni otras conexiones
concurrentes. Cada finding de esta métrica incluye esa limitación
explícita en `limitations`.

## Privacidad

- `performanceProvider` nunca extrae ni procesa datos personales de
  terceros: analiza metadatos técnicos (timing, cabeceras, estructura
  HTML) ya PÚBLICOS del propio negocio auditado.
- Ninguna cabecera de autenticación/cookie llega nunca a
  `performanceProvider` (mismo principio que `seoProvider`/
  `accessibilityProvider`, Pasos 16/17).

## Consentimiento

`performanceProvider` no requiere consentimiento adicional al ya exigido
por `publicWebsiteFetcher` (Paso 13: `allowNetwork:true` explícito) — es
un análisis derivado del MISMO contenido/timing ya autorizado a
recopilarse. No está en la lista de proveedores con `consentRequired` de
Paso 15 (esa lista es para proveedores que usan credenciales de
terceros).

## Límite honesto explícito

Ninguna puntuación de este proveedor, por alta que sea, debe presentarse
a un cliente como "optimizado para rendimiento" o "aprobado por
Lighthouse/PageSpeed" — es una puntuación propia, sobre datos parciales
declarados, que nunca sustituye una medición real de Core Web Vitals ni
una auditoría de rendimiento con navegador real. Esto está verificado por
test (`perfAnalyzer.test.mjs`: "nunca se produce ningún finding con
nombres LCP/CLS/INP/FCP como si fueran valores reales";
`performanceProviderPlugin.test.mjs`: "nunca declara un valor numérico de
Core Web Vitals") y reforzado en cada capa de salida (evidencia,
recomendaciones, informe, CLI).
