# HERMES_NEXT_ACTIONS.md

1. **P0 externo — schema Airtable:** crear/verificar campos tenant y club, poblar todos los registros activos y confirmar sus nombres/IDs. No activar la ruta con valores inventados.
2. **P0 config Worker:** después de validar schema, configurar por entorno `AVAILABILITY_TENANT_ID`, `AVAILABILITY_CLUB_ID`, `AIRTABLE_TENANT_FIELD`, `AIRTABLE_CLUB_FIELD` y `CLUB_TIMEZONE`; ejecutar preflight autorizado con dos tenants/clubes reales.
3. **P0 autoridad de reserva:** Make/backend debe implementar exclusión atómica por intervalo y `idempotency_key`; Search→Create no basta. Contrato exacto en `HERMES_BLOCKERS.md`.
4. **P0 escritura:** crear/reprogramar deben persistir tenant/club derivados server-side, nunca desde payload cliente; alinear con la misma fuente que usa disponibilidad.
5. **P1 Airtable:** sustituir IDs hardcodeados por registry server-side versionado y validado, con fail-closed ante drift. Inventario en `HERMES_FIX_LOG.md`.
6. **QA tras integración externa:** repetir 13 tests de contrato, 19 de intervalos, regresión Worker/Auth, build y `git diff --check`; añadir prueba concurrente real de dos reservas sobre el mismo intervalo.
7. **Fuera de alcance:** mantener sin cambios Torneos, CI gate multi-tenant, Make P0/P1, Gmail, duplicados/preflight Make, Stripe, WhatsApp, pagos y secretos.

## Siguiente paso exacto — TOCTOU Reservas
1. Abrir manualmente el escenario Make **5697630 📡 API Reservas** sin ejecutarlo.
2. Activar y evidenciar `Sequential processing`; inventariar que sea el único escritor de reservas activas.
3. Sustituir Search exacto por recheck de intervalo con tenant+club+fecha+pista+estado; persistir `idempotency_key` y hash del payload antes de Calendar/email.
4. Añadir Webhook Response 201/200 replay/409/422/503/504 y rollback Calendar si Airtable falla.
5. Con autorización externa, ejecutar únicamente los payloads sintéticos de `MAKE_RESERVAS_PREFLIGHT_PAYLOADS.md`, incluida carrera simultánea y replay.
6. No promover Reservas mientras el resultado siga `PASS_LOCAL / BLOCKED_EXTERNAL_ATOMICITY`.
