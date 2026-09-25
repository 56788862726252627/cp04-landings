# Paso 11 — Natural Language Business Builder — Índice

Rama `feature/natural-language-business-builder-20260721` · Worktree `/root/cp04-t-nl-business-builder`.
Construido sobre Paso 10 (`docs/paso-10-one-prompt-factory/`, PR #38, base de esta
rama), que se referencia en vez de duplicarse. Paso 10 no fue modificado salvo por
las 3 extensiones aditivas descritas en `01-auditoria-y-diseno.md`.

1. [01-auditoria-y-diseno.md](01-auditoria-y-diseno.md) — Qué se reutilizó de Paso 10/09, qué faltaba, arquitectura del intérprete.
2. [02-business-intent-schema.md](02-business-intent-schema.md) — Descriptor Business Intent: campos, validación, migración, diferencia con el Blueprint.
3. [03-motor-interpretacion.md](03-motor-interpretacion.md) — Capa determinista local + contrato de proveedor de IA (mock, timeout/retry, fallback).
4. [04-catalogo-sectorial-y-motores.md](04-catalogo-sectorial-y-motores.md) — 10 presets sectoriales, motor de módulos/dependencias, roles/permisos, automatizaciones.
5. [05-branding-landing-pwa.md](05-branding-landing-pwa.md) — Propuesta inicial de branding/landing/PWA, contraste WCAG AA.
6. [06-cli.md](06-cli.md) — CLI `business:interpret/ask/compose/explain/recommend/from-prompt`, ejemplos, códigos de salida.
7. [07-prueba-clinica-fisioterapia.md](07-prueba-clinica-fisioterapia.md) — Prueba real: clínica de fisioterapia generada por CLI, doble ejecución, idempotencia, diff, doctor.
8. [08-casos-demostracion.md](08-casos-demostracion.md) — Las 8 demos (A-H) del enunciado: prompt, intent, blueprint, confianza, ambigüedades.
9. [09-calidad-seguridad-regresion.md](09-calidad-seguridad-regresion.md) — Tests/lint/build/escaneo de secretos/equivalencia CP04/idempotencia.
10. [10-guia-rapida-15-min.md](10-guia-rapida-15-min.md) — Guía rápida, instrucción natural → SaaS generado, limitaciones, próximos pasos.

## Dónde está el código

- `app/src/saas-core/nl-builder/` — motor de interpretación: normalizador, léxico sectorial,
  motor de módulos/dependencias, catálogo de automatizaciones, roles/permisos, motor de
  confianza, motor de ambigüedades, propuesta de branding/landing/PWA, contrato de
  proveedor de IA, Business Intent schema + ejemplos, compositor de Blueprint,
  serializador de salida, y los 8 casos de demostración.
- `app/factory-cli/business-{interpret,ask,compose,explain,recommend,from-prompt}.mjs`
  + `app/factory-cli/lib/nlBuilderCli.mjs` — CLI, comparte `parseCliArgs` con Paso 09/10.
- `app/src/saas-core/nl-builder/requests/<businessId>/` — artefactos de análisis
  (intent.json, business.blueprint.json, informe) generados por `business:from-prompt`,
  **distinto** de `app/src/saas-core/businesses/`, que sigue siendo territorio exclusivo
  del orquestador de Paso 10 (solo se escribe ahí con `--execute`).

## Cambios aditivos en código de Paso 09/10 (los únicos, y por qué)

1. `app/src/saas-core/tenant/tenantSchema.js` — se añadieron 4 sectores a `KNOWN_SECTORS`
   (`restaurant`, `education`, `automotive`, `real-estate`), requeridos por el catálogo
   de 10 sectores del enunciado. `blueprintToTenantConfig` ya hace fallback seguro a la
   plantilla `local-service` para cualquier sector sin preset/plantilla dedicados, así
   que no hizo falta ningún otro cambio en el núcleo para que estos 4 sectores generen
   negocios válidos.
2. `app/src/saas-core/factory/extensionPoints.js` — se añadió el punto de extensión
   `aiLanguageProvider` (Fase 5, Capa B: interfaz + mock + política de fallback, sin
   ningún proveedor real conectado).
3. `app/src/saas-core/factory/blueprintToTenant.js` — se exportó `ENV_VAR_NAMES_BY_PROVIDER`
   (antes constante privada) para que el intérprete de Paso 11 reutilice el mismo mapa de
   nombres de variables de entorno por proveedor, en vez de duplicarlo. Cero cambio de
   comportamiento.
4. `app/package.json` — 6 scripts npm nuevos (`business:interpret/ask/compose/explain/recommend/from-prompt`).

Ningún otro archivo de Paso 09/10 fue modificado. `App.jsx`, `theme.js`, el Worker y
`tenants/demo/` no fueron tocados.

## Cómo verificar

```
cd app
npm test                                                  # 542 tests (396 preexistentes + 146 nuevos de este paso)
npm run build                                             # vite build, sin errores nuevos
npm run lint                                              # mismos 4 errores/1 warning preexistentes (no tocados por este paso)

npm run business:interpret -- --demo=fisioterapia --seed=demo-001 --format=summary
npm run business:from-prompt -- --demo=fisioterapia --seed=demo-001 --execute
npm run business:from-prompt -- --demo=fisioterapia --seed=demo-001 --execute   # 2ª vez: 0 creados/actualizados (idempotencia)
npm run business:doctor
npm run business:diff -- --blueprint=src/saas-core/nl-builder/requests/clinica-de-fisioterapia-malaga/business.blueprint.json
```
