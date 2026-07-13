# HERMES_BLOCKERS.md

## P0 — antes de producción
- **TOCTOU/doble reserva:** `POST /api/reservas` delega en Make y el Worker no posee lock/transacción atómica. El precheck UI y `GET /api/disponibilidad` son informativos; dos requests concurrentes pueden observar libre el mismo intervalo.
- **Contrato externo requerido para cerrar TOCTOU:** una única autoridad server-side debe ejecutar `resolve canonical tenant+club → acquire lock/unique constraint por tenant|club|fecha|pista|intervalo → revalidar solapamiento → crear/reprogramar → release/commit`, con `idempotency_key` persistente. Airtable Search→Create o Make sin lock no prueban atomicidad.
- **Activación multi-tenant de disponibilidad:** código local cerrado fail-closed, pero Airtable debe tener y poblar campos tenant/club en todos los registros activos. Config requerida: `AVAILABILITY_TENANT_ID`, `AVAILABILITY_CLUB_ID`, `AIRTABLE_TENANT_FIELD`, `AIRTABLE_CLUB_FIELD`; `CLUB_TIMEZONE` opcional (`Europe/Madrid` por defecto). Sin ello la ruta responde 503, no mezcla datos.
- Crear/reprogramar vía Make también deben escribir tenant/club desde fuente server-side canónica; el Worker no puede garantizarlo sin cambiar el backend externo.

## P1
- `CP04_ENFORCE_ROLE_GATES` condiciona RBAC de cancelar/reprogramar; no puede declararse enforcement efectivo sin configuración real.
- `forwardToMake` sigue sin timeout/retry/idempotencia propios; fuera del bloque de disponibilidad y excluido de efectos externos.
- 13 IDs de campos Airtable están hardcodeados en `cp04ListReservations` (`index.js:993-1089`), además de base/tabla en `wrangler.toml`; riesgo de drift de schema. Inventario completo en `HERMES_FIX_LOG.md`.
- Falta registry server-side versionado campo lógico→field ID con validación fail-closed; no sustituir por IDs enviados por cliente.

## Dependencias externas / no ejecutadas
- Airtable/Make reales y webhooks: BLOCKED por credenciales y acción externa manual; no se invocaron.
- No se modificaron ni activaron Torneos, CI gate multi-tenant, Make P0/P1, Gmail, duplicados/preflight Make, Stripe, email, WhatsApp o pagos.
- QR, notificaciones, ranking y favoritos conservan sus bloqueadores previos; quedan fuera de este bloque.

## P0 TOCTOU — estado tras hardening local 2026-07-11
- **PASS_LOCAL:** Worker exige `idempotency_key` en crear/reprogramar, genera/propaga `correlation_id`, deriva tenant/club server-side, emite contrato canónico, aplica timeout y traduce 201/200 replay/409/422/401/403/503/504. Frontend conserva la misma key en retries del mismo payload.
- **BLOCKED_EXTERNAL_ATOMICITY:** nada local demuestra exclusión real. El blueprint 5697630 mantiene Search (`200`) → Calendar Create (`202`) → Airtable Create (`203`) y su Search usa `clave_slot` por hora inicial.
- Cierre mínimo: Make `Sequential processing` ON + escenario 5697630 como único escritor + recheck de intervalo completo + idempotencia persistida antes de efectos + 409 explícito + compensación Calendar. Si existe cualquier escritor alternativo, usar Durable Object/DB transaccional.
- Config local fail-closed pendiente por entorno: `RESERVATIONS_TENANT_ID`, `RESERVATIONS_CLUB_ID`, `MAKE_RESERVAS_TIMEOUT_MS` (scope puede reutilizar temporalmente `AVAILABILITY_*`).
- Evidencia exigida: 2 requests simultáneos → 1x201 + 1x409 y un único commit; replay → 200 sin efectos; aislamiento tenant/club y rollback verificados. Runbook: `MAKE_RESERVAS_ATOMICIDAD_RUNBOOK.md`.
