# 02 — Scoring: desglose, cobertura, confianza

## No se toca scoringEngine.js/dimensionRegistry.js

Las 45 dimensiones y 13 categorías de Paso 12 siguen exactamente igual.
La categoría `"accessibility"` (existente desde Paso 12) se sigue
calculando con la MISMA fórmula genérica de siempre, ahora también
alimentada por la evidencia de `accessibilityProvider` — mezclada sin
distinción especial con cualquier otra fuente vinculada a la dimensión
`accessibility` (p. ej. el adaptador offline `mock_accessibility`, Paso
12, que sigue funcionando exactamente igual en modo legacy).

## `a11yScoring.js` — desglose complementario, no un scoring paralelo

Reutiliza la MISMA fórmula que `dimensionRegistry.evaluateDimension` y
`seoScoring.js` (Paso 16): `score = 50 + polaridad×fuerza×50`, ponderado
por `max(confianza, 0.05)`, aplicada a 9 grupos (Fase 5 del enunciado):

`structure` (Estructura — documento+encabezados) · `images` (Imágenes) ·
`forms` (Formularios) · `navigation` (Navegación: enlaces/botones) ·
`aria` (ARIA) · `tables` (Tablas) · `keyboard` (Teclado y foco) ·
`contrast` (Contraste) · `content` (Contenido y legibilidad).

Las 10 categorías de análisis de `a11yAnalyzer.js` se agrupan en estos 9
grupos de scoring: `document`+`headings` comparten `structure`; el resto
tiene correspondencia 1:1.

```json
{
  "groups": {
    "structure": { "score": 62, "confidence": 0.9, "coverage": 0.75, "findingsCount": 8, "manualReviewCount": 2, "explanation": "..." },
    "...": "..."
  },
  "overall": { "score": 51, "confidence": 0.7, "coverage": 0.67, "groupsEvaluated": 6, "groupsTotal": 9, "manualReviewCount": 7 },
  "disclaimer": "Puntuación automática orientativa — no constituye una certificación de accesibilidad ni sustituye una auditoría manual completa con tecnología de asistencia real."
}
```

`disclaimer` viaja SIEMPRE en el desglose — se renderiza en
`reports/accessibility.md` como cita destacada al inicio del informe, en
todas las ejecuciones.

## Nunca se inventa un score sin evidencia, y las comprobaciones manuales NUNCA se penalizan

- Grupo sin ningún hallazgo → `score: null`.
- Grupo con hallazgos pero ninguno automatizable (todos `manual_required`/
  `unavailable`/`unverified`/`blocked`) → también `score: null`, con
  `findingsCount`/`manualReviewCount` reflejando cuántos hubo.
- Un hallazgo `checkType: "manual"` (p. ej. "navegación completa por
  teclado") reduce la `coverage` del grupo pero **nunca** se trata como
  fallo confirmado en el cálculo del score — verificado por test
  explícito (`a11yScoring.test.mjs`).

## Confianza y cobertura

- **Confianza** por grupo: media de `evidence.confidence` de los
  hallazgos automatizados evaluados (0-1). Un hallazgo manual siempre
  tiene `confidence: 0` — no contamina la media porque se excluye del
  cálculo, no porque se cuente como 0.
- **Cobertura** por grupo: `evaluados / total` — cuántos de los
  hallazgos de ese grupo fueron realmente automatizables en esta
  ejecución.
- **`manualReviewCount`** (global y por grupo): cuántos hallazgos quedan
  pendientes de revisión manual — un número explícito, nunca oculto.

## Persistencia e idempotencia

`providerRunSummary.accessibility.scoreBreakdown`/`.recommendations` se
calculan UNA VEZ dentro de `accessibilityProviderPlugin.collect()`
(nunca en el render) y viajan tal cual hasta `audit.json`/
`reports/accessibility.md`. Sin ningún timestamp real involucrado
(mismo principio que Paso 13/16), una segunda ejecución sobre el mismo
HTML produce el mismo desglose byte a byte — verificado con un test de
idempotencia de extremo a extremo que escribe a disco dos veces y
comprueba `filesUpdated.length === 0`, incluyendo
`reports/accessibility.md` en el manifiesto.
