# 05 — Dimensiones, scoring y confianza

## Las 45 dimensiones (`dimensionRegistry.js`)

Declaradas como **datos**, no como 45 archivos de lógica separada: todas
comparten un único evaluador genérico y explicable (`evaluateDimension`),
que agrega la evidencia enlazada por `relatedDimension`. Esto evita
duplicar 45 veces la misma lógica de agregación/confianza/contradicción.

Lista completa (ids): `identity, valueProposition, serviceClarity,
targetAudienceClarity, mobileExperience, desktopExperience, navigation,
conversion, forms, bookingCapability, contactInfo, trustSignals,
socialProof, publicReputation, seoTechnical, seoContent, seoLocal,
accessibility, performance, observableSecurity, visiblePrivacy,
analyticsDeclared, branding, visualConsistency, contentQuality,
contentFreshness, socialMediaPresence, directoryPresence,
observableIntegrations, observableAutomation, digitalMaturitySignal,
leadCapture, retention, customerSupport, salesFollowUp, differentiation,
competitivePosition, pwaApp, multilanguage, visibleCompliance,
reputationalRisk, ctaQuality, funnel, friction, publicDataConsistency`.

Cada evaluación devuelve `{score (0-100 o null), confidence, status,
evidenceIds, findings, contradictions, risks, opportunities,
recommendations, missingData, limitations}`.

- **Sin evidencia** → `score: null`, `status: "unknown"`,
  `missingData: [dimensionId]` — nunca se infiere de la nada.
- **Contradicción**: se detecta cuando hay evidencia positiva Y negativa
  con fuerza ≥0.5 para la misma dimensión → `contradictions` no vacío,
  confianza penalizada ×0.6.
- Fórmula de score: media ponderada de `50 + polaridad×fuerza×50` por
  evidencia, ponderada por `confidence` de cada evidencia (nunca una
  media simple).

## Scoring (`scoringEngine.js`) — 13 categorías + global

`SCORE_CATEGORIES` (13, más "global" que se calcula aparte, sumando 14 en
total como pide el enunciado): `digitalMaturity, technicalQuality, ux,
conversion, branding, automation, accessibility, seo, trust, reputation,
localPresence, content, observableSecurity`.

Cada dimensión contribuye a 1+ categorías (grafo, no partición — ver
`DIMENSIONS[id].scoreCategories`). El score de categoría:

- Ignora (no cuenta como 0) las dimensiones sin evidencia, pero las
  registra en `missingDimensions` — más ausencia = más penalización de
  **confianza** (`coveragePenalty`), nunca de score directamente.
- Penaliza contradicciones (`contradictionPenalty`, hasta ×0.7).
- El score global pondera las 13 categorías por su propia confianza y por
  `categoryWeights` del preset sectorial.

`classifyScore(score)` → 6 bandas: `crítico (≤20) | débil (≤40) | básico
(≤60) | correcto (≤75) | avanzado (≤90) | excelente (>90)`.

## Confianza — nunca oculta, siempre explicable

La confianza aparece en 3 niveles: por evidencia (`confidence` de la
fuente), por dimensión (media ponderada + penalización por cobertura de
1 sola evidencia o por contradicción), y por categoría/global (media +
penalización por cobertura de dimensiones evaluadas). `scores.categories[x].explanation`
siempre indica cuántas dimensiones se evaluaron de cuántas totales.

## Determinismo verificado

`evaluateDimension`/`computeAllScores` son funciones puras: mismo input →
`assert.deepEqual` exacto en los tests (no solo "valores similares").
