# Paso 19 — progreso (archivo de recuperación ante interrupciones)

No commitear checkpoints incompletos con push. Consolidar al final en un único commit atómico.

## Decisión de alcance (confirmada con el usuario antes de empezar)

- Alcance: **adaptadores aislados de Stripe y WhatsApp Business, sin credenciales reales** (`NOT_CONFIGURED` por defecto). Nunca se realiza ninguna llamada de red real a Stripe/Meta sin credenciales explícitas — y aunque existieran, este paso no las tiene ni las pide.
- Base: apilado sobre PR #46 (Paso 18), rama `feature/payments-messaging-adapters-20260723`, worktree `/root/cp04-t-payments-messaging-adapters`.
- Este código queda **desconectado** de cualquier flujo comercial real de la app (no existe tal flujo en esta rama — vive en `parallel/t8-commercial`, worktree `/root/cp04-t8-commercial`, NO TOCADO). Es una capa de integración lista para conectar en el futuro, con su propio runbook.

- [x] Fase 1 — precheck y aislamiento: DONE (rama `feature/payments-messaging-adapters-20260723`, worktree `/root/cp04-t-payments-messaging-adapters`, base `6194ca8` (Paso 18), PR #46 confirmado abierto/mergeable sin tocar, baseline 1101/1101 tests, lint 4 errores + 1 warning preexistentes, build OK, node_modules symlinked desde el worktree hermano tras confirmar package-lock.json idéntico)
- [x] Fase 2 — contrato Stripe adapter (aislado, NOT_CONFIGURED): DONE (stripeAdapter.js, 7 funciones, 15/15 tests)
- [x] Fase 3 — contrato WhatsApp Business adapter (aislado, NOT_CONFIGURED): DONE (whatsappAdapter.js, 8 funciones + gate de consentimiento, 16/16 tests)
- [x] Fase 4 — validación/esquemas + fixtures deterministas: DONE (commercialSchemas.js 8/8 tests, commercialFixtures.js con firmas de webhook reales calculadas con el mismo HMAC del código)
- [x] Fase 5 — idempotencia: DONE (commercialShared.generateIdempotencyKey, determinista, 10/10 tests en commercialShared.test.mjs, verificado también en stripeAdapter.test.mjs)
- [x] Fase 6 — tests: DONE (49 tests nuevos en total: 10+8+15+16, 0 fallos)
- [x] Fase 7 — documentación + runbook: DONE (docs/paso-19-payments-messaging-adapters/00-04 + este PROGRESS.md)
- [x] Fase 8 — validación final: DONE (1150/1150 tests, lint sin regresiones, build OK, sin secretos/symlinks/archivos grandes nuevos, parallel/t8-commercial verificado sin tocar)
- [ ] Fase 9 — git y PR (en curso: consolidación del historial de checkpoints en un commit atómico, push, PR stacked sobre #46)

Estado final antes de consolidar (2026-07-24): 1150/1150 tests en verde (1101 preexistentes + 49 nuevos de Paso 19), lint sin regresiones, build OK.
