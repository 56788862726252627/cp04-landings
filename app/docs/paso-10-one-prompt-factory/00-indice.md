# Paso 10 — One Prompt Factory — Índice

Rama `feature/one-prompt-factory-20260721` · Worktree `/root/cp04-t-saas-core`.
Construido sobre Paso 09 (`docs/paso-09-saas-core-replicable/`), que se referencia
en vez de duplicarse.

1. [01-auditoria-y-diseno-fabrica.md](01-auditoria-y-diseno-fabrica.md) — Fase 1: qué de Paso 09 se reutiliza, qué faltaba, arquitectura de la fábrica.
2. [02-business-blueprint.md](02-business-blueprint.md) — Fase 2: descriptor versionado, validación, migración, ejemplos.
3. [03-orquestador-pipeline.md](03-orquestador-pipeline.md) — Fase 3: pipeline determinista/idempotente, dry-run, colisiones, manifest.
4. [04-tenant-landing-branding.md](04-tenant-landing-branding.md) — Fases 4-6: puente a tenant, landing, motor de branding white-label.
5. [05-datos-demo-mockups.md](05-datos-demo-mockups.md) — Fases 7-8: datos demo reproducibles, manifest de mockups.
6. [06-documentacion-informe-cli.md](06-documentacion-informe-cli.md) — Fases 9-11: documentación automática, informe, CLI `business:*`.
7. [07-prueba-clinica-dental.md](07-prueba-clinica-dental.md) — Fase 12: generación real de la clínica dental demo, doble ejecución, diff, doctor.
8. [08-puntos-extension-futuro.md](08-puntos-extension-futuro.md) — Fase 13: contratos para integraciones y capacidades futuras.
9. [09-calidad-seguridad-regresion.md](09-calidad-seguridad-regresion.md) — Fase 14: tests/lint/build/escaneo de secretos/equivalencia CP04.
10. [10-guia-rapida-15-min.md](10-guia-rapida-15-min.md) — Fase 15: guía rápida, instrucción natural → Business Blueprint (contrato).

## Dónde está el código

- `app/src/saas-core/factory/` — núcleo de la fábrica (blueprint, orquestador, branding, landing, datos demo, mockups, docs, informe, puntos de extensión, contrato NL→blueprint).
- `app/factory-cli/` — CLI (`business:create/validate/preview/build/report/list/diff/doctor`).
- `app/src/saas-core/businesses/` — salida de negocios generados por la fábrica (nunca en `tenants/demo/`, que sigue siendo el espacio de Paso 09).
- Ningún archivo de Paso 09 fue modificado, salvo `app/package.json` (8 scripts npm `business:*` añadidos + el `test` glob ampliado a `factory-cli`).

## Cómo verificar

```
cd app
npm test                                             # 396 tests (304 preexistentes + 92 nuevos de este paso)
npm run build                                        # vite build, sin errores nuevos
npm run lint                                          # mismos 4 errores/1 warning preexistentes (no tocados por este paso)
npm run business:list -- --catalog
npm run business:create -- --example=full             # genera la clínica dental demo
npm run business:create -- --example=full              # segunda vez: 0 creados/actualizados (idempotencia)
npm run business:diff -- --business=clinica-dental-sonrisas-de-malaga
npm run business:doctor
npm run business:report -- --business=clinica-dental-sonrisas-de-malaga
```
