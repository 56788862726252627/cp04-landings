# MAKE_RESERVAS_PREFLIGHT_PAYLOADS

Payloads sintéticos Worker→Make. No contienen secretos/PII. No ejecutar sin autorización, escenario aislado y side effects email/WhatsApp/pagos deshabilitados. Para tenant/club cruzado, cambiar la configuración server-side o usar una copia QA del escenario; nunca permitir que el cliente elija scope.

## 1. Reserva válida
```json
{"tenant_id":"tenant-qa-a","club_id":"club-qa-a","court_id":"Pista 4","pista":"Pista 4","start_time":"10:00","end_time":"11:30","date":"2026-12-30","timezone":"Europe/Madrid","user_id":null,"reservation_id":null,"idempotency_key":"idem_preflight_valid-000001","correlation_id":"corr_preflight-valid-000001","operation_type":"create","source":"qa_preflight","status":"requested","created_at":"2026-07-11T12:00:00.000Z","updated_at":"2026-07-11T12:00:00.000Z"}
```
Esperado: 201, una reserva. Ejecutar solo en scope/tabla QA.

## 2. Duplicada exacta de slot con key distinta
```json
{"tenant_id":"tenant-qa-a","club_id":"club-qa-a","court_id":"Pista 4","pista":"Pista 4","start_time":"10:00","end_time":"11:30","date":"2026-12-30","timezone":"Europe/Madrid","user_id":null,"reservation_id":null,"idempotency_key":"idem_preflight_duplicate-0002","correlation_id":"corr_preflight-duplicate-002","operation_type":"create","source":"qa_preflight","status":"requested","created_at":"2026-07-11T12:00:01.000Z","updated_at":"2026-07-11T12:00:01.000Z"}
```
Esperado: 409 `slot_conflict`, cero efectos.

## 3. Solapamiento parcial
```json
{"tenant_id":"tenant-qa-a","club_id":"club-qa-a","court_id":"Pista 4","pista":"Pista 4","start_time":"10:30","end_time":"12:00","date":"2026-12-30","timezone":"Europe/Madrid","user_id":null,"reservation_id":null,"idempotency_key":"idem_preflight_overlap-00003","correlation_id":"corr_preflight-overlap-00003","operation_type":"create","source":"qa_preflight","status":"requested","created_at":"2026-07-11T12:00:02.000Z","updated_at":"2026-07-11T12:00:02.000Z"}
```
Esperado: 409, prueba que `clave_slot` por inicio no basta.

## 4. Reserva contigua válida
```json
{"tenant_id":"tenant-qa-a","club_id":"club-qa-a","court_id":"Pista 4","pista":"Pista 4","start_time":"11:30","end_time":"12:30","date":"2026-12-30","timezone":"Europe/Madrid","user_id":null,"reservation_id":null,"idempotency_key":"idem_preflight_adjacent-0004","correlation_id":"corr_preflight-adjacent-0004","operation_type":"create","source":"qa_preflight","status":"requested","created_at":"2026-07-11T12:00:03.000Z","updated_at":"2026-07-11T12:00:03.000Z"}
```
Esperado: 201; `end_existente == start_nuevo` no solapa.

## 5. Replay idempotente
Reenviar exactamente el payload 1, incluida `idempotency_key`.
Esperado: 200 `idempotent_replay`, mismo reservation_id; cero Calendar/Airtable/email adicionales.

## 6. Tenant distinto
```json
{"tenant_id":"tenant-qa-b","club_id":"club-qa-a","court_id":"Pista 4","pista":"Pista 4","start_time":"10:00","end_time":"11:30","date":"2026-12-30","timezone":"Europe/Madrid","user_id":null,"reservation_id":null,"idempotency_key":"idem_preflight-tenant-b-0005","correlation_id":"corr_preflight-tenant-b-0005","operation_type":"create","source":"qa_preflight","status":"requested","created_at":"2026-07-11T12:00:04.000Z","updated_at":"2026-07-11T12:00:04.000Z"}
```
Esperado: en ejecución QA con scope B, no colisiona con A; enviado al endpoint scope A debe rechazarse 403/422, nunca aceptar scope del body.

## 7. Club distinto
```json
{"tenant_id":"tenant-qa-a","club_id":"club-qa-b","court_id":"Pista 4","pista":"Pista 4","start_time":"10:00","end_time":"11:30","date":"2026-12-30","timezone":"Europe/Madrid","user_id":null,"reservation_id":null,"idempotency_key":"idem_preflight-club-b-00006","correlation_id":"corr_preflight-club-b-00006","operation_type":"create","source":"qa_preflight","status":"requested","created_at":"2026-07-11T12:00:05.000Z","updated_at":"2026-07-11T12:00:05.000Z"}
```
Esperado: mismo criterio que tenant cruzado.

## 8. Payload inválido
```json
{"tenant_id":"tenant-qa-a","club_id":"club-qa-a","court_id":"Pista 4","start_time":"11:30","end_time":"10:00","date":"2026-02-30","timezone":"Europe/Madrid","idempotency_key":"","correlation_id":"bad","operation_type":"create"}
```
Esperado: 422 `invalid_payload`; cero Search/Create/Calendar/email.

## Carrera simultánea
Usar dos clientes coordinados con los payloads 1 y 2, liberados por barrera al mismo tiempo. Esperado: exactamente un 201 y un 409; una fila activa, un evento Calendar y como máximo un email post-commit. Después repetir payload 1: 200 replay.
