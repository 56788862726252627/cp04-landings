# MAKE_RESERVAS_ATOMICIDAD_RUNBOOK

Fecha: 2026-07-11. Alcance: `POST /api/reservas` crear/reprogramar. No activa Make, Airtable, email, WhatsApp ni deploy.

## 1. Diagnóstico TOCTOU confirmado

Secuencia vulnerable: A consulta disponibilidad → B consulta → ambos ven libre → ambos envían crear → el blueprint 5697630 ejecuta Airtable Search (`module 200`) → Calendar Create (`202`) → Airtable Create (`203`). Dos ejecuciones paralelas pueden completar Search antes de que ninguna escriba. Además, `clave_slot=fecha|pista|hora_inicio` no detecta solapamientos 60/90/120 con distinto inicio. Reprogramar busca la reserva original, elimina/crea Calendar y actualiza Airtable, pero no aporta una exclusión global del intervalo destino.

| Capa | Riesgo | Evidencia | Control actual | Control faltante | Solución propuesta | Test | Bloqueador |
|---|---|---|---|---|---|---|---|
| UI | Estado libre obsoleto y doble clic/retry | `App.jsx` precheck antes de POST | Intervalos reales + guard local | Idempotencia estable entre retries | Clave estable por payload; 409 visible | doble clic/retry | 409 UX aún genérico |
| App handler | Requests concurrentes atraviesan | `handleReservas` delega | Validación + scope/correlation local | Autoridad atómica | fail-closed + contrato canónico | 422/503/504 | config externa |
| Worker | Sin lock global | No DO/KV lock de reservas | idempotency obligatoria, timeout, status mapping | Store linealizable/lock | Hybrid ahora; Durable Object futuro | 2 POST paralelos | binding/deploy no autorizado |
| Make | Search→Create concurrente | módulos 200→202→203 | Search exacto por `clave_slot` | single-writer + recheck intervalo | Sequential processing ON; una sola ruta escritora | barrera 2 payloads | cambio manual Make |
| Airtable | Sin unique index/transacción | campo `clave_slot`; API no impone unicidad | búsqueda lógica | constraint real | tabla índice/claims solo si escritura serial; DB futuro | dos records mismo scope/intervalo | schema externo |
| Logs | Conflicto/replay no distinguibles | log HTTP genérico | request/correlation IDs | códigos y execution_id central | log `created/replay/conflict/rollback` | correlación end-to-end | sink/retención externa |
| Email/notificaciones | Podrían enviarse antes del commit o duplicarse | Calendar/Create preceden email; blueprint tiene Gmail | filtros de rama | post-commit + idempotencia por efecto | emitir solo tras reserva persistida; dedup por idempotency | replay no envía | cambio Make |
| Rollback | Calendar creado si Airtable falla | orden 202 antes de 203 | ninguno atómico | compensación determinista | registrar event_id, borrar evento si Create Airtable falla; log rollback | fallo Airtable tras Calendar | Make manual |

## 2. Contrato canónico Worker→autoridad

Campos raíz: `tenant_id`, `club_id`, `court_id`, `pista`, `start_time`, `end_time`, `date`, `timezone`, `user_id`, `reservation_id`, `idempotency_key`, `correlation_id`, `operation_type`, `source`, `status`, `created_at`, `updated_at`. El Worker deriva tenant/club de `RESERVATIONS_*` (fallback temporal a `AVAILABILITY_*`), nunca del body. `user_id=null` documenta reserva pública no autenticada; no debe sustituirse por email/PII. `reservation_id=null` al crear y clave existente al reprogramar.

Respuestas de autoridad:
- `201 {ok:true,status:"created",reservation_id,...}`: commit nuevo confirmado.
- `200 {ok:true,status:"idempotent_replay",idempotent_replay:true,reservation_id,...}`: misma key y mismo payload; cero efectos repetidos.
- `409 {ok:false,error:"slot_conflict",conflict_id?}`: solapamiento activo.
- `422 {ok:false,error:"invalid_payload",fields?}`.
- `401/403`: identidad/autorización.
- `503 {ok:false,error:"backend_unavailable"}`: Make/Airtable/config no disponible.
- `504 {ok:false,error:"timeout"}`: presupuesto agotado; el cliente reintenta con la MISMA key.

Un ACK genérico `200` sin `status:"idempotent_replay"` no prueba commit: crear/reprogramar fallan cerrados con 503 hasta que Make instale una Webhook Response autoritativa. Cancelar conserva compatibilidad legacy, fuera del lock de intervalos.

Regla: misma `idempotency_key` + payload distinto = `409 idempotency_key_reused`; nunca ejecutar. La key se conserva en retries y cambia cuando cambia el payload o comienza una operación nueva.

## 3. Opciones de autoridad

| Opción | Seguridad | Coste/Complejidad | Ahora | Riesgo residual | Compatibilidad | Tiempo estimado | Recomendación |
|---|---|---|---|---|---|---|---|
| A Make Search+Create | Baja si paralelo | Bajo | Sí | P0 abierto | Alta | 2–4h | Rechazar sin serialización |
| B Airtable índice lógico | Baja-media | Bajo | Sí | No unique real/transacción | Alta | 4–8h | Solo defensa/detección |
| C Worker lock temporal | Media con memoria/KV; alta con DO | Medio | Preparar, no activar | KV/memoria no linealizable | Media | 1–2d | DO como evolución |
| D Backend SQL dedicado | Alta | Alto | No inmediato | Bajo con exclusion constraint | Baja-media | 3–7d | Objetivo futuro |
| E Worker+Make+Airtable | Media-alta con single-writer verificable | Medio | Sí, manual | bypass de escritores | Máxima | 0.5–1d | **MVP actual** |

Elección MVP: E. Worker valida y normaliza; Make 5697630 es único escritor con `Sequential processing` activado; dentro de esa sección crítica revalida intervalos y dedup, persiste antes de notificar y compensa Calendar. Airtable guarda `idempotency_key`, correlation y scope. Condición obligatoria: ningún bot/escenario/usuario escribe reservas activas fuera de 5697630. Si no puede garantizarse, E no cierra P0 y debe migrarse a C/DO o D/SQL.

## 4. Preflight manual Make/Airtable

1. Clonar/pausar edición; no ejecutar producción durante cambios.
2. Abrir escenario canónico 5697630 y confirmar blueprint `workflows/01-api-reservas/...FINAL_V2...json`.
3. En Scenario settings activar `Sequential processing`; capturar evidencia.
4. Inventariar todos los escritores de la tabla; exigir single-writer 5697630.
5. Añadir/verificar campos tenant, club, inicio, fin, `idempotency_key`, `correlation_id`, reservation_id, status.
6. Tras webhook, validar schema y scope; body sin key/correlation/scope canónico → 422/503.
7. Buscar primero por `tenant+club+idempotency_key`; mismo hash → replay 200, hash distinto → 409.
8. Buscar conflicto activo por tenant+club+fecha+pista y condición `nuevo_inicio < fin_existente AND inicio_existente < nuevo_fin`.
9. Si conflicto, Webhook Response 409 antes de Calendar/email/WhatsApp.
10. Crear claim/reserva Airtable dentro de la ejecución serial antes de Calendar/notificaciones.
11. Crear Calendar; persistir `event_id`. Si falla, marcar `failed` y liberar claim según política.
12. Email solo post-commit; dedup por idempotency/effect key. WhatsApp permanece desconectado.
13. En fallo Airtable tras Calendar, borrar Calendar y registrar `rollback_succeeded/failed`.
14. Webhook Response explícita 201/200/409/422/503/504 con correlation_id.
15. Log central: tenant, club, court, intervalo, key, correlation, execution_id, resultado; sin PII/secrets.
16. Ejecutar payloads sintéticos de `MAKE_RESERVAS_PREFLIGHT_PAYLOADS.md`: simultáneo, replay, overlap, contiguo, tenant y club cruzados.
17. Confirmar exactamente 1 reserva/Calendar/email para carrera; 0 en conflicto; 0 side effects en replay.
18. Rollback de configuración: desactivar entrada al Worker o responder 503; nunca volver a aceptación silenciosa.

## 5. Gate de cierre P0

PASS solo con evidencia real autorizada de: sequential processing ON, single-writer inventariado, campos completos, respuesta 409, replay 200 sin efectos, dos requests simultáneos con 1 único commit, aislamiento tenant/club, rollback probado y logs correlacionados. Tests locales no demuestran atomicidad externa.
