# Paso 12 — Public Research & Digital Audit Engine

Índice de la documentación de este paso. Construido sobre el [Business
Intent de Paso 11](../paso-11-natural-language-business-builder/00-indice.md)
y el [Business Blueprint / One Prompt Factory de Paso 10](../paso-10-one-prompt-factory/00-indice.md) —
no los duplica, los enlaza y amplía.

1. [Auditoría y diseño](./01-auditoria-y-diseno.md)
2. [Research Request schema](./02-research-request-schema.md)
3. [Política de seguridad y protección SSRF/rutas](./03-politica-seguridad-ssrf.md)
4. [Evidence model y adaptadores de fuente](./04-evidence-model-adaptadores.md)
5. [Dimensiones, scoring y confianza](./05-dimensiones-scoring-confianza.md)
6. [Presets sectoriales y comparación de competidores](./06-presets-sectoriales-competidores.md)
7. [Recomendaciones y automatizaciones](./07-recomendaciones-automatizaciones.md)
8. [Enriquecimiento de Intent/Blueprint](./08-enriquecimiento-intent-blueprint.md)
9. [CLI](./09-cli.md)
10. [Casos de demostración](./10-casos-demostracion.md)
11. [Calidad, seguridad y regresión](./11-calidad-seguridad-regresion.md)
12. [Guía rápida (< 15 minutos)](./12-guia-rapida-15-min.md)

## Resumen ejecutivo

El Public Research & Digital Audit Engine investiga un negocio a partir de
**información pública o evidencias locales/fixtures** (nunca APIs reales en
este paso) y produce una auditoría digital estructurada: puntuaciones
explicables en 13 categorías + score global, hallazgos con trazabilidad a
evidencia concreta, contradicciones detectadas, recomendaciones priorizadas
(impacto × confianza × urgencia ÷ esfuerzo), automatizaciones candidatas, y
una propuesta de enriquecimiento — nunca destructiva — del Business Intent
(Paso 11) y del Business Blueprint (Paso 10).

Cifras reales de este paso (verificadas, no estimadas): 45 dimensiones de
auditoría, 13 adaptadores de fuente offline funcionales + 14 puntos de
extensión de investigación como contrato (sin conexión real), 10 presets
sectoriales de auditoría (reutilizando los 10 sectores de Paso 11), 10
demos ficticias ejecutadas de extremo a extremo con idempotencia
confirmada, 178 tests nuevos (167 del motor + 11 del CLI) sobre 720 totales
del repositorio.
