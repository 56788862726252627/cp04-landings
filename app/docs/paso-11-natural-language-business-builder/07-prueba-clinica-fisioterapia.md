# 07 — Prueba real: clínica de fisioterapia generada por CLI

Negocio demo elegido para la prueba de generación real (Fase 12 del enunciado): una
**clínica de fisioterapia ficticia**, usando literalmente la frase de ejemplo del
enunciado del Paso 11 ("Crea un SaaS para una clínica de fisioterapia de Málaga con
reservas, expedientes de pacientes, recordatorios, bonos, facturación, panel de
administración, landing premium, PWA y automatizaciones de captación y seguimiento.").
Ningún dato real: nombre, dirección y pacientes son ficticios.

## Primera ejecución (`--execute`)

```
$ node factory-cli/business-from-prompt.mjs --demo fisioterapia --seed demo-001 --execute
Paso 1/4 — Interpretando la petición en lenguaje natural...
Clínica De Fisioterapia Málaga (borrador) — sector: physiotherapy
Ubicación: Málaga (ES)
Confianza global: 0.75 (alta)
Módulos habilitados: 17 · Ambigüedades: 0 (0 bloqueante(s)) · Preguntas recomendadas: 1

Paso 2/4 — Componiendo el Business Blueprint...
  OK. businessId="clinica-de-fisioterapia-malaga", plan="pro", módulos: 17.

Paso 3/4 — Preview (dry-run del orquestador de Paso 10)...
  Se crearían 16 archivo(s), se actualizarían 0, colisiones: 0.

Paso 4/4 — Guardando artefactos de análisis...
  Guardado en src/saas-core/nl-builder/requests/clinica-de-fisioterapia-malaga

--execute: ejecutando la fábrica real de Paso 10 (idempotente)...
  Negocio generado en src/saas-core/businesses/clinica-de-fisioterapia-malaga. Creados: 16 · actualizados: 0 · preservados: 0.
  Informe guardado en src/saas-core/nl-builder/requests/clinica-de-fisioterapia-malaga/report.md

Duración total: 376 ms
```

## Segunda ejecución — prueba de idempotencia

```
$ node factory-cli/business-from-prompt.mjs --demo fisioterapia --seed demo-001 --execute
...
Paso 3/4 — Preview (dry-run del orquestador de Paso 10)...
  Se crearían 0 archivo(s), se actualizarían 0, colisiones: 0.
...
--execute: ejecutando la fábrica real de Paso 10 (idempotente)...
  Negocio generado en src/saas-core/businesses/clinica-de-fisioterapia-malaga. Creados: 0 · actualizados: 0 · preservados: 16.
...
Duración total: 428 ms
```

**0 archivos creados/actualizados, 16 preservados** en la segunda ejecución: idempotencia
confirmada en vivo (no solo en tests).

## `business:doctor`

```
$ node factory-cli/business-doctor.mjs
OK   extension_points_loaded: 20 puntos de extensión registrados
OK   all_extension_points_not_implemented: ninguna integración real activa (esperado en este paso)
OK   businesses_dir_readable: existe: src/saas-core/businesses
OK   generated_businesses_count: 2 negocio(s) generado(s)
OK   generated_businesses_still_valid: todos los blueprints generados siguen siendo válidos
OK   mockup_capture_tool_available: playwright NO instalado: solo manifest de mockups (esperado en este paso)

Fábrica saludable.
```

(2 negocios: la clínica dental de Paso 10 + la clínica de fisioterapia de este paso;
ninguno de los dos se rompió por la generación del otro.)

## `business:diff`

```
$ node factory-cli/business-diff.mjs --blueprint=src/saas-core/nl-builder/requests/clinica-de-fisioterapia-malaga/business.blueprint.json
{
  "businessId": "clinica-de-fisioterapia-malaga",
  "wouldCreate": [],
  "wouldUpdate": [],
  "unchanged": [ "business.blueprint.json", "tenant.config.json", "env.example", "branding/tokens.json", ... ],
  "collisions": [],
  "idempotentIfApplied": true
}
```

## Reutilización

Los 17 módulos habilitados, los 5 roles y los 7 tests de automatización recomendados
provienen enteramente del catálogo genérico de `nl-builder/` (sector `physiotherapy` de
`sectorLexicon.js`, ya existente antes de esta prueba) — 0 líneas de código
específicas de esta clínica en particular. El único archivo "propio" del negocio es su
`business.blueprint.json` y los artefactos derivados de él, todos generados.

## Pasos manuales identificados (reales, no genéricos)

El propio blueprint generado declara, en `manualSteps`:

- "datos de salud sujetos a normativa reforzada (expedientes clínicos)" (nota de
  cumplimiento del preset `physiotherapy`).
- "Confirmar antes de producción: ¿Cuántos profesionales o miembros del equipo
  trabajarán en el negocio?" (pregunta recomendada, ya que el prompt no especifica
  número de fisioterapeutas).
