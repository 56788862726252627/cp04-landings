# 02 — Scoring SEO: desglose, cobertura, confianza

## No se toca scoringEngine.js/dimensionRegistry.js

Las 45 dimensiones y las 13 categorías de Paso 12 siguen exactamente
igual (verificado por test: `SCORE_CATEGORIES.length === 13`,
`DIMENSION_IDS.length === 45`, ninguno de los dos archivos modificado).
La categoría `"seo"` ya existente se sigue calculando con la MISMA
fórmula genérica de siempre, alimentada ahora también por la evidencia
de `seoProvider` (mezclada sin distinción especial con la de cualquier
otra fuente vinculada a `seoTechnical`/`seoContent`/`seoLocal`).

## `seoScoring.js` — desglose complementario, no un scoring paralelo

Reutiliza la MISMA fórmula que `dimensionRegistry.evaluateDimension`
(`score = 50 + polaridad×fuerza×50`, ponderado por `max(confianza,
0.05)`), aplicada a 9 grupos en vez de a una dimensión:

`indexation` (Indexabilidad) · `metadata` (Metadatos) · `structure`
(Estructura) · `links` (Enlaces) · `images` (Imágenes) ·
`structuredData` (Datos estructurados) · `content` (Contenido) · `local`
(SEO local — evidencia con `relatedDimension === "seoLocal"` de
cualquier categoría) · `technical` (Cobertura técnica).

```json
{
  "groups": {
    "metadata": { "score": 62, "confidence": 0.95, "coverage": 1, "findingsCount": 7, "explanation": "7/7 hallazgo(s) evaluados (0 no comprobable(s), no penalizados como fallo)." },
    "...": "..."
  },
  "overall": { "score": 51, "confidence": 0.82, "coverage": 1, "groupsEvaluated": 9, "groupsTotal": 9 }
}
```

## Nunca se inventa un score sin evidencia

- Grupo sin ningún hallazgo → `score: null` (nunca `0`; `0` significaría
  "muy malo", no "sin datos").
- Grupo con hallazgos pero ninguno comprobable (todos
  `unavailable`/`unverified`/`blocked`) → también `score: null`, con
  `findingsCount` reflejando cuántos hubo aunque no contaran.
- Un hallazgo "no comprobable" (p. ej. `seo.images.heavyImages`, siempre
  `unavailable` porque no se descargan imágenes) reduce la `coverage`
  del grupo pero **nunca se trata como fallo confirmado** — verificado
  por test explícito.

## Confianza y cobertura

- **Confianza** por grupo: media de `evidence.confidence` de los
  hallazgos evaluados (0-1).
- **Cobertura** por grupo: `evaluados / total` (0-1) — cuántos de los
  hallazgos de ese grupo fueron realmente comprobables en esta ejecución.
- **Confianza/cobertura global**: media/ratio sobre los grupos con score
  no nulo.

## Persistencia e idempotencia

`providerRunSummary.seo.scoreBreakdown`/`.recommendations` se calculan
UNA VEZ dentro de `seoProviderPlugin.collect()` (nunca en el render) y
viajan tal cual hasta `audit.json`/`reports/seo.md`. Al no depender de
ningún timestamp (los findings son puramente función del HTML), una
segunda ejecución sobre el mismo HTML produce el mismo desglose byte a
byte — verificado con un test de idempotencia de extremo a extremo que
escribe a disco dos veces y comprueba `filesUpdated.length === 0`.
