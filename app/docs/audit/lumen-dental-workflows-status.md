# Lumen Dental — Estado de Flujos Make
Auditoria: 2026-09-07 | Branch: demo/lumen-dental-factory-e2e | Scope: T6

## Infraestructura creada (2026-09-07)

### Make
- Carpeta: 🦷 Lumen Dental (id: 386999)
- Webhook: LUMEN · Webhook Solicitud Cita (id: 3674108)
  URL: https://hook.eu1.make.com/mv4x2i4noerfx88tgfmtgrwu3bq6nw9o

### Airtable
- Base: Automatizaciones Clubes de Padel (appyWvzZJLzy0E6aX)
- Tabla: LD · Citas Solicitadas (tblVm72nMGmdNWlDp) — 13 campos

## Flujo 1 — PRODUCTION_ACTIVE

- Nombre Make: LUMEN · Solicitud Cita Landing
- ID escenario: 7273670
- Trigger: gateway:CustomWebHook id:3674108
- Modulo 2: airtable:ActionCreateRecord → LD · Citas Solicitadas
- Modulo 3: gateway:WebhookRespond 200 JSON {ok, cita_id}
- Filtro: email!=empty AND nombre!=empty AND privacidad=true
- Entrypoint: AppointmentModal.submitCita() → WEBHOOK_CITA

## Flujos pendientes (2-17): MISSING
2. Alta Lead CRM
3. Confirmacion Interna Recepcion
4. Agenda Recepcion Google Calendar
5. Alta Paciente CRM
6. Actualizacion Paciente
7. Recordatorio Email 24h
8. Seguimiento Presupuesto
9. Solicitud Resena Google
10. Pipeline Comercial KPIs
11. Campana Email Marketing
12. Informe Diario
13. Informe Semanal
14. Backup Drive
15. Social Media Post
16. SEO Local Reporting
17. Integraciones secundarias

## Guardrails
isReal:false · NO_REAL_EXTERNAL_ACTION=SI · FACTORY_AGENCY_SCOPE_ONLY=SI
