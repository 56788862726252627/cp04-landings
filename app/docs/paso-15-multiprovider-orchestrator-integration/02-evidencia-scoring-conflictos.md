# 02 — Evidencia, agregación de conflictos y scoring multiproveedor

## Regla central: un stub nunca aporta evidencia real

`defineStubProvider` (Paso 14) siempre devuelve `status: "not_implemented"`
con evidencia **placeholder** (`defineProviderEvidencePlaceholder`, forma
ligera SIN `evidenceId`/`contentHash`, no válida contra
`evidenceSchema.js`). `aggregateProviderResults` (`evidenceAggregator.js`)
solo copia `result.evidence` a la lista agregada cuando
`result.status` es `success` o `partial` — un stub, aunque se ejecute,
**nunca** entra en el array `evidence` que alimenta `dimensionRegistry`/
`scoringEngine`. Verificado por test explícito
("un proveedor stub nunca aporta evidencia real, aunque se ejecute").

## EvidenceAggregator — qué añade sobre lo que ya existía

Reutiliza `deduplicateEvidence` (Paso 12) tal cual — no reimplementa el
hash (`contentHash`, sha256 sobre contenido normalizado) ni el orden
estable. Lo nuevo:

| Campo pedido (Fase 4) | Cómo se cubre |
|---|---|
| hash determinista | `evidenceSchema.hashEvidenceContent` (Paso 12), sin cambios |
| normalización | `normalizedContent` (Paso 12), sin cambios |
| deduplicación | `deduplicateEvidence` (Paso 12), reutilizado |
| procedencia | `provenanceIndex[evidenceId] = {providerId, priority, sourceType}` (**nuevo**) |
| proveedor | idem — `providerId` en el índice de procedencia |
| URL / fuente | `evidence.sourceId` (Paso 12), sin cambios |
| timestamp | **No existe por evidencia**, a propósito (ver Paso 12: `capturedAt` se excluye deliberadamente del hash para idempotencia). Solo hay `generatedAt` a nivel de auditoría y `durationMs` por proveedor (excluido del hash persistido, ver más abajo) |
| confianza | `evidence.confidence` (Paso 12), sin cambios |
| categoría | `dimensionRegistry.DIMENSIONS[relatedDimension].scoreCategories` (Paso 12), sin cambios |
| disponibilidad | `orchestratorStatus` (**nuevo**, ver documento 01) |
| error sanitizado | `sanitizeErrorMessage()` (**nuevo**) — redacta patrones con pinta de secreto (`sk_live_`, `AIza`, `Bearer ...`, tokens largos) y trunca a 300 caracteres, nunca expone stack traces (solo la primera línea) |
| relación con perfil sectorial | `providerRunSummary.profileId` + `provenanceIndex` cruzado con `profile.relevantDimensions` |
| prioridad | `provenanceIndex[evidenceId].priority` |

## Conflictos: NO se reimplementa la detección, se le añade atribución

`dimensionRegistry.evaluateDimension` (Paso 12) **ya** detecta
contradicciones agnósticas de fuente: si una dimensión tiene evidencia
positiva Y negativa con fuerza ≥0.5, marca `contradictions` y aplica una
penalización de confianza (`contradictionPenalty = 0.6`) — esto llevaba
funcionando desde Paso 12 para cualquier combinación de fuentes (13
adaptadores offline incluidos). Reimplementar la detección en Paso 15
habría sido duplicar lógica ya probada.

Lo que `buildEvidenceConflictReport` (`evidenceAggregator.js`) añade es
**solo la atribución**: cruza `dimensionResults[x].contradictions` (ya
calculado) con `provenanceIndex` para poder decir QUÉ proveedores
aportaron cada lado del conflicto:

```js
{
  dimensionId: "trustSignals",
  label: "Confianza",
  reason: "evidencia positiva y negativa simultánea con fuerza ≥0.5",
  evidenceIds: [...],
  providersInvolved: ["publicWebsiteFetcher", "socialProvider"],
  confidenceAfterPenalty: 0.42,
}
```

**Nunca se descarta evidencia por conflicto** — ambos lados quedan en
`evidence.json`, `evidence-appendix.md` y el propio `evidenceConflicts`
solo añade una vista derivada; la reducción de confianza es la MISMA
penalización de Paso 12, no una nueva. El conflicto se explica en
`reports/providers.md` ("Conflictos de evidencia entre proveedores") y
sigue apareciendo en `reports/risk-report.md` (contradicciones por
dimensión, sin cambios de Paso 12).

## Scoring multiproveedor

`scoringEngine.computeAllScores(dimensionResults, sectorPreset)` (Paso
12) **no se modificó** — sigue siendo agnóstico de proveedor, opera sobre
`dimensionResults` igual que siempre. Lo que Paso 15 añade:

- **Pesos por categoría/dimensión vía perfil**: `mergeAuditPreset(base,
  overrides)` (nuevo, `sectorAuditPresets.js`) combina el preset de
  sector de Paso 12 con los pesos propios del `ProviderSectorProfile`
  elegido (`getEffectiveAuditPresetForProfile`). `analyzeEvidence` acepta
  ahora `presetOverrides` (opcional, `null` por defecto = comportamiento
  IDÉNTICO a Paso 12/13/14).
- **Pesos por proveedor** — implementados como **prioridad de intento**
  (`providerSectorProfiles.js` → `providerPriorities`), no como
  multiplicador de confianza en el scoring. Nota de alcance honesta: con
  un único proveedor real hoy (`publicWebsiteFetcher`), un multiplicador
  de confianza por proveedor en el scoring sería una pieza sin efecto
  observable (nunca hay dos proveedores reales compitiendo por la misma
  evidencia todavía). `providerScoreBreakdown` ya aísla qué evidencia
  aportó cada proveedor, dejando la pieza lista para añadir ese
  multiplicador el día que un segundo proveedor stub pase a real, sin
  tocar `scoringEngine.js`.
- **Penalización por evidencia ausente / cobertura**: sin cambios (Paso
  12, `computeCategoryScore` ya penaliza por `missingDimensions` y
  cobertura).
- **Desglose por proveedor** (nuevo): `buildProviderScoreBreakdown` — por
  cada proveedor que SÍ aportó evidencia, cuántas evidencias y qué
  dimensiones cubrió. Se persiste en `audit.json` y se renderiza en
  `reports/providers.md`.
- **Desglose por dimensión**: ya existía (`dimensionResults`), sin
  cambios.
- **Explicación del cálculo**: ya existía (`explanation` en cada
  categoría/dimensión), sin cambios.

Compatibilidad confirmada por test: 45 dimensiones y 13 categorías
siguen exactamente igual (`SCORE_CATEGORIES.length === 13`,
`DIMENSION_IDS.length === 45`, sin tocar ninguno de los dos archivos).

## Idempotencia y `durationMs`

`providerRunSummary.providers[].durationMs` es timing real (no
determinista). Igual que `generatedAt`/`durationMs` de nivel superior
(Paso 12), se excluye del contenido usado para el hash de `audit.json`
antes de persistir (`deterministicReportData`), para que una segunda
ejecución idéntica en modo multiproveedor siga produciendo 0 archivos
actualizados. Verificado por test end-to-end con escritura real a disco.
