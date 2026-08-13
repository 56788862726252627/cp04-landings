# 06 — Presets sectoriales y comparación de competidores

## Presets de auditoría (`sectorAuditPresets.js`)

Reutiliza `SECTOR_PRESET_IDS` de Paso 11 (`padel-sports, dental,
physiotherapy, veterinary, hair-beauty, law, restaurant, education,
automotive, real-estate`) — verificado 1:1 por test, no inventa
sectores. Cada preset SOLO añade configuración de auditoría:

- `priorityDimensions` — dimensiones que importan más para ese sector
  (con `dimensionWeights` ×1.5).
- `categoryWeights` — p.ej. `padel-sports` pondera más `conversion` y
  `digitalMaturity` (reserva de pista); `law` pondera más `trust` y
  `content` (claridad de servicios legales).
- `mustNotAutoInfer` — lo que nunca debe presentarse como conclusión
  automática (p.ej. "idoneidad de un tratamiento dental concreto").
- `prudentNote` — para los 4 sectores regulados (`dental, physiotherapy,
  veterinary, law`): toda recomendación debe presentarse sujeta a
  revisión profesional, nunca como asesoramiento definitivo. Verificado
  por test que los 4 sectores lo tienen y que ninguna recomendación para
  esas dimensiones sensibles se etiqueta como implementación automática
  (`proposedImplementation: "revisión profesional"`).

## Comparación de competidores (`competitorComparison.js`)

Offline y estrictamente basada en fixtures explícitas — **nunca** inventa
ni descubre competidores por scraping:

- Sin competidores proporcionados → tabla vacía + advertencia de
  cobertura explícita (no una comparación fabricada).
- Con 1 competidor → advertencia de "cobertura limitada".
- Con 2+: tabla por categoría (score propio vs media de competidores),
  `advantages`/`weaknesses` cuando la diferencia es ≥10 puntos,
  `differentiators` derivados de las ventajas reales, `gaps` cuando el
  sujeto no tiene datos propios para comparar una categoría que sí tienen
  los competidores (nunca se compara "a ciegas").

Cada competidor se audita con el MISMO motor (`evaluateAllDimensions` +
`computeAllScores`) que el negocio principal — mismo criterio, mismo
preset sectorial, comparación justa.
