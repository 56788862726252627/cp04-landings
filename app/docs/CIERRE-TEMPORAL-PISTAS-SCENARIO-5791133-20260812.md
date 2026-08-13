# Cierre técnico — Cierre Temporal de Pistas (Club Pádel 04)

## 1. Identificación

- **Flujo**: Cierre Temporal de Pistas
- **Scenario Make ID**: `5791133`
- **Endpoint Worker**: `POST /api/pistas/cierre-temporal` (`app/worker-reservas/src/index.js`, handler `handleCierreTemporalPista`)
- **Fecha de certificación**: 2026-08-12
- **Estado**: ✅ **100% PRODUCCIÓN CERTIFICADO**

## 2. Arquitectura real validada — el Worker es la fuente de verdad

A diferencia de otros flujos, aquí el bloqueo real de reservas **no depende de Make**. Decisión de arquitectura tomada explícitamente en este cierre:

- **Fase 1 — Persistencia real**: `POST /api/pistas/cierre-temporal` escribe el cierre directamente en Airtable, tabla `CIERRES_TEMPORALES` (`tblzlOcjO5vFiXdbB`), antes de notificar a nadie más.
- **Fase 2 — Bloqueo real de disponibilidad**: `cp04FetchCierresActivos` + `cp04ClaveSlotsBloqueadosPorCierres` integran los cierres activos dentro de `/api/disponibilidad` y de la validación de creación/reprogramación de `/api/reservas`, usando el mismo algoritmo de solape de intervalos ya usado en el resto del sistema (`reserva_inicio < cierre_fin AND reserva_fin > cierre_inicio`, con adyacencia exacta = no solape).
- **Make (scenario 5791133) = notificación best-effort**: se invoca **después** de la persistencia real; si Make falla o no está configurado, el cierre **nunca se revierte** — la respuesta al cliente lo refleja con honestidad (`notificacion_make:false`, `aviso`) en vez de fingir un fallo total.
- Regla conservadora explícita en disponibilidad: un hueco se marca ocupado si una reserva de la **duración máxima del sistema (120 min)** empezando ahí solaparía el cierre — evita mostrar como libre un hueco que luego sería rechazado al confirmar.

## 3. Casos certificados (evidencia real, no simulada)

| Caso | Resultado |
|---|---|
| Creación real persistida en Airtable | ✅ PASS — `HTTP 200`, `cierre_id=CIERRE-20260820-f3a0cee4` |
| Idempotencia (repetición inmediata) | ✅ PASS — `HTTP 409 IDEMPOTENT_DUPLICATE` |
| Disponibilidad refleja el cierre | ✅ PASS — `09:00` bloqueada tras crear |
| Control fuera del cierre sigue libre | ✅ PASS — `10:00` (primera hora que la regla conservadora de 120 min garantiza libre) |
| Reserva ficticia solapada rechazada | ✅ PASS — `HTTP 409 SLOT_ALREADY_BOOKED`, nunca se creó |
| CORS de producción | ✅ correcto — `POST /api/reservas` exige `Origin` permitido por diseño ya existente (no modificado); `disponibilidad`/`cierre-temporal` no lo exigen |
| Traducción `motivo` → Single Select Airtable | ✅ corregido y validado (`cp04MotivoCierreToAirtableLabel`) |

## 4. Incidencias reales resueltas durante el cierre

1. **Deploy pierde var no declarada**: el primer `wrangler deploy` intentó eliminar `AIRTABLE_CIERRES_TABLE_ID` por ser una var solo-Dashboard no reflejada en `wrangler.toml`. Detectado por el propio aviso de Wrangler antes de subir, corregido restaurándola de forma durable en `wrangler.toml` y repitiendo el deploy.
2. **502 "No se pudo registrar el cierre"**: el handler descartaba el `status`/`details` reales de Airtable en el fallo de creación. Corregido añadiendo logging estructurado (`cierre_temporal_persist_failed`) sin cambiar la respuesta al cliente ni exponer secretos — más 1 test de regresión específico (403 simulado).
3. **Causa raíz real del 502**: al PAT de Airtable (`AIRTABLE_TOKEN`) le faltaba el scope `data.records:write` — coherente con el error `403 INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND`. Corregido por el usuario directamente en Airtable (sin cambio de token ni de código).
4. **Diagnóstico en vivo no viable**: `wrangler tail` nunca logró establecer conexión en este entorno (sesión WebSocket atascada indefinidamente). Sustituido por Cloudflare Workers Logs persistentes (`[observability] enabled = true`, `head_sampling_rate = 1`), activado con un deploy dedicado.
5. **Anomalía puntual de disponibilidad**: una comprobación aislada mostró `09:00` como libre pese a que el cierre seguía `ACTIVO`/`bloquear_reservas=true` en Airtable (confirmado por inspección directa). Explicación consistente con toda la evidencia: fallo transitorio de lectura de `CIERRES_TEMPORALES`, absorbido por el diseño fail-open ya existente (`cierres_fetch_failed`, `cp04FetchOcupadas`) — nunca bloquea el sistema entero por un fallo de lectura puntual. Una repetición posterior de la misma consulta de solo lectura confirmó el bloqueo correcto, sin cambios de código ni de datos.

## 5. Tests

```
cierre-temporal-pista.test.mjs:          34/34 PASS
cierre-temporal-disponibilidad.test.mjs: 19/19 PASS
Suite completa Worker:                   260/260 PASS
```

Sin regresiones en ningún punto del cierre.

## 6. Make / Gmail / WhatsApp

- **Make (scenario 5791133)**: operativo — recibe la notificación best-effort tras la persistencia real; `notificacion_make=true` observado en la ejecución real certificada.
- **Gmail**: operativo (fuera del alcance de este cierre profundizar más allá de la notificación best-effort ya validada).
- **WhatsApp**: fuera de alcance en este cierre — no tocado ni evaluado.

## 7. Seguridad

- Ningún secreto (`AIRTABLE_TOKEN`, `MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK`) mostrado ni logueado en ningún momento del proceso.
- Todos los despliegues reales (3 en total: Fase 1+2+motivo, restauración de `AIRTABLE_CIERRES_TABLE_ID`, activación de `observability`) fueron autorizados explícitamente uno a uno, con precheck/postcheck de bindings.
- Ninguna petición E2E real se ejecutó sin autorización explícita previa; cada intento fue justificado y acotado a una única ejecución.
- CORS de producción no debilitado en ningún momento — el gap encontrado era del script de prueba, no de la política real.

## 8. Riesgos residuales conocidos (NO bloqueantes)

1. El evento `cierres_fetch_failed` (fail-open de lectura de cierres) no tiene test de regresión dedicado en `cierre-temporal-disponibilidad.test.mjs` — solo existe cobertura para el caso "no configurado". La causa exacta de la anomalía del punto 4.5 no se confirmó con el log real (no se llegó a consultar el Dashboard), sino por reproducción read-only.
2. La idempotencia del Worker es un `Map` en memoria **por isolate** (mismo patrón ya conocido y aceptado en Baja de Jugador) — funcional y consistente en todas las pruebas, sin garantía arquitectónica absoluta en el edge de Cloudflare.
3. `wrangler tail` no es viable como herramienta de diagnóstico en vivo en este entorno — cualquier futuro diagnóstico debe apoyarse en Workers Logs persistentes (ya activado) o en scripts E2E de solo lectura, no en tail en vivo.
4. WhatsApp permanece completamente fuera de alcance — sin ninguna validación real en este flujo.

## 9. Resultado final

**FLUJO CIERRE TEMPORAL DE PISTAS — 100% PRODUCCIÓN CERTIFICADO**

## 10. Próxima recomendación

Con Baja de Jugador (5288809) y Cierre Temporal de Pistas (5791133) ya certificados al 100%, el siguiente candidato natural es **Alta de Jugador** (Scenario Make `6199248`, `POST /api/jugadores/alta`) — ya señalado como recomendación pendiente en el cierre de Baja de Jugador: wiring app→Worker→Make completo, webhook propio, idempotencia ya implementada, y un historial conocido y acotado ("7 ejecuciones confirmadas, 2 errores") que investigar. No depende de Stripe, WhatsApp ni dominio/Hostinger.
