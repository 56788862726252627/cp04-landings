# 02 — Scoring: desglose de 11 grupos, cobertura, confianza

## No se toca scoringEngine.js/dimensionRegistry.js

Las 45 dimensiones y 13 categorías de Paso 12 siguen exactamente igual.
La dimensión `"performance"` (categoría `"technicalQuality"`, existente
desde Paso 12) se sigue calculando con la MISMA fórmula genérica de
siempre, ahora también alimentada por la evidencia de
`performanceProvider` — mezclada sin distinción especial con cualquier
otra fuente vinculada a esa dimensión.

## `perfScoring.js` — desglose complementario, no un scoring paralelo

Reutiliza la MISMA fórmula que `dimensionRegistry.evaluateDimension` y
`seoScoring.js`/`a11yScoring.js` (Pasos 16/17): `score = 50 +
polaridad×fuerza×50`, ponderado por `max(confianza, 0.05)`, aplicada a
los **11 grupos** pedidos por el enunciado (Fase 5):

`response` (Respuesta HTTP) · `html` (Documento HTML) · `resources`
(Recursos declarados) · `images` (Imágenes) · `javascript` (JavaScript) ·
`css` (CSS) · `fonts` (Fuentes) · `caching` (Caché) · `compression`
(Compresión) · `thirdParty` (Terceros) · `mobile` (Señales móviles).

Las 10 categorías de análisis de `perfAnalyzer.js` (Fase 3, A-J) no
coinciden 1:1 con estos 11 grupos de scoring (Fase 5): `compression` y
`thirdParty` son grupos de scoring propios aunque `perfAnalyzer.js` los
detecte dentro de las categorías `response`/`resources`/`javascript`. La
correspondencia exacta vive en `RULE_ID_TO_SCORE_GROUP_OVERRIDE`
(`perfScoring.js`), documentada regla por regla.

```json
{
  "groups": {
    "response": { "score": 53, "confidence": 0.97, "coverage": 1, "findingsCount": 7, "unmeasuredCount": 0, "explanation": "..." },
    "compression": { "score": null, "confidence": 0, "coverage": 0, "findingsCount": 1, "unmeasuredCount": 1, "explanation": "1 hallazgo(s) de \"Compresión\", ninguno medible en esta ejecución." },
    "...": "..."
  },
  "overall": { "score": 51, "confidence": 0.85, "coverage": 0.64, "groupsEvaluated": 7, "groupsTotal": 11, "unmeasuredCount": 2 },
  "disclaimer": "Puntuación propia basada en datos observados/medidos/calculados de este proveedor — no es una puntuación de Lighthouse ni de PageSpeed Insights, no mide Core Web Vitals (LCP/CLS/INP/FCP) y no sustituye una prueba real de navegador."
}
```

`disclaimer` viaja SIEMPRE en el desglose — se renderiza en
`reports/performance.md` como cita destacada al inicio del informe, en
todas las ejecuciones, y se imprime también con `--explain-performance-score`.

## Nunca se inventa un score sin evidencia, y los datos no medibles NUNCA se penalizan

- Grupo sin ningún hallazgo → `score: null`.
- Grupo con hallazgos pero ninguno evaluable (todos `not_measured`/
  `unavailable`) → también `score: null`, con `findingsCount`/
  `unmeasuredCount` reflejando cuántos hubo (p. ej. `compression` y, si
  no se pasan `pages`, `images` en la muestra por defecto — el peso real
  de imágenes es siempre `unavailable`).
- Un hallazgo `evidenceKind: "not_measured"`/`"unavailable"` reduce la
  `coverage` del grupo pero **nunca** se trata como fallo confirmado en
  el cálculo del score — verificado por test explícito
  (`perfScoring.test.mjs`).
- `browser_test_required` (coste de ejecución JS, CSS no utilizado)
  **nunca** entra en el cálculo de score como positivo ni negativo: se
  excluye del scoring y se presenta únicamente como recomendación
  pendiente de prueba (ver `perfRecommendations.js`).

## Confianza y cobertura

- **Confianza** por grupo: media de `evidence.confidence` de los
  hallazgos evaluados (0-1). Un hallazgo `not_measured`/`unavailable`
  siempre tiene `confidence: 0` — no contamina la media porque se
  excluye del cálculo, no porque se cuente como 0.
- **Cobertura** por grupo: `evaluados / total` — cuántos de los
  hallazgos de ese grupo fueron realmente medibles/calculables en esta
  ejecución.
- **`unmeasuredCount`** (global y por grupo): cuántas métricas quedan
  explícitamente fuera de alcance de esta herramienta — un número
  explícito, nunca oculto, expuesto también por `--show-unmeasured`.

## Persistencia e idempotencia

`providerRunSummary.performance.scoreBreakdown`/`.recommendations` se
calculan UNA VEZ dentro de `performanceProviderPlugin.collect()` (nunca
en el render) y viajan tal cual hasta `audit.json`/
`reports/performance.md`. El `timing` real (`timeToHeadersMs`/`totalMs`)
SÍ varía entre ejecuciones reales contra una URL — pero el hash
determinista de cada Evidence (`evidenceSchema.js`) nunca incluye un
timestamp real, y los tests de idempotencia inyectan el MISMO `timing`
fijo en `pages` (igual que Paso 13 fija los datos de entrada, no el
reloj) para verificar que, con la misma entrada, la salida es
byte-idéntica — verificado con un test de idempotencia de extremo a
extremo que escribe a disco dos veces y comprueba
`filesUpdated.length === 0`, incluyendo `reports/performance.md` en el
manifiesto.
