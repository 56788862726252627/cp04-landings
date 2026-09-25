# 08 — Enriquecimiento de Business Intent y Business Blueprint

Principio único: **nunca sobrescribir en silencio**. `propose*Enrichment`
es puro (solo calcula additions/conflicts/preserved/diff + una propuesta
validada); escribir a disco (siempre en un archivo NUEVO) es
responsabilidad exclusiva del CLI, nunca de estas funciones.

## `intentEnrichment.js` (Business Intent, Paso 11)

`proposeIntentEnrichment(intent, auditResult)`:

- Añade **módulos sugeridos** (`status: "suggested"`, nunca "enabled")
  cuando una recomendación de la auditoría mapea a un módulo
  (`rec.moduleMapping`) que el intent todavía no tiene — si ya existe, se
  registra en `preserved` y no se toca.
- Añade **automatizaciones** candidatas de la auditoría que el intent aún
  no lista (dedupe por id).
- Añade **preguntas recomendadas** para cada dimensión que quedó
  `"unknown"` (sin evidencia) — nunca inventa una respuesta.
- El intent propuesto se valida con `validateBusinessIntent` (Paso 11)
  antes de devolverse; `applyIntentEnrichment` lanza si no es válido
  (defensa en profundidad, aunque no debería ocurrir).
- Verificado por test que el intent original **nunca se muta**
  (`deepEqual` contra una copia tomada antes de llamar a la función).

## `blueprintEnrichment.js` (Business Blueprint, Paso 10)

Mismo principio, adaptado a la forma del Blueprint (`modules` es un
array de ids, no de objetos con metadata como en el Intent). Valida con
`validateBusinessBlueprint` antes de devolver.

## CLI: `research:enrich-intent` / `research:enrich-blueprint`

Sin `--apply`: imprime la propuesta (módulos/automatizaciones/preguntas a
añadir, preservados, validez) — **no escribe nada**.

Con `--apply`: escribe `<--output o <original>.enriched.json>` — el
original queda intacto (verificado en la sesión: mismo hash md5 antes y
después de `--apply`).
