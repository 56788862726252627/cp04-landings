# Cierre técnico — Baja de Jugador + Promoción (Club Pádel 04)

## 1. Identificación

- **Flujo**: Baja de Jugador + Promoción
- **Scenario Make ID**: `5288809`
- **Endpoint Worker**: `POST /api/jugadores/baja` (`app/worker-reservas/src/index.js`, handler `handleBajaJugador`)
- **Fecha de certificación**: 2026-08-11
- **Estado**: ✅ **100% PRODUCCIÓN CERTIFICADO**

## 2. Arquitectura real validada (11 módulos Make)

```
1   Webhook baja de jugador          (gateway:CustomWebHook)
95  NORMALIZAR (SetVariables)        → email_baja, nombre_baja
144 Buscar jugador por email         (airtable:ActionSearchRecords, tabla JUGADORES)
145 Guardar ID de registro           (SetVariables → airtable_record_id)
149 Marcar jugador como INACTIVO     (airtable:ActionUpdateRecords, tabla JUGADORES)
152 Primer jugador en LISTA_ESPERA   (airtable:ActionSearchRecords, tabla LISTA_ESPERA)
99  Router
 ├─ 136 Gmail · Confirmar baja (sin promoción)      — cuando NO hay candidato o flag=false
 └─ 124 Promover jugador de espera a ACTIVO         — cuando SÍ hay candidato Y flag=true
    ├─ 201 Gmail · Bienvenida al promovido
    └─ 143 Gmail · Confirmación de baja (con promoción)
```

Dos tablas Airtable implicadas: `JUGADORES` (`tblCKuA2RZaj2BsHt`) y `LISTA_ESPERA` (`tblgzmkphAYdmuVyn`). El Worker no llama a Airtable directamente en este flujo — solo reenvía el payload validado al webhook de Make (`env.MAKE_BAJA_JUGADOR_WEBHOOK`).

## 3. Casos certificados

| Caso | Resultado |
|---|---|
| Baja sin promoción | ✅ PASS |
| Baja con promoción | ✅ PASS |
| flag=false + candidato ESPERA | ✅ PASS |
| flag=true + candidato ESPERA | ✅ PASS |
| flag=true + sin candidato | ✅ PASS |
| Idempotencia rama sin promoción | ✅ PASS |
| Idempotencia rama con promoción | ✅ PASS |

## 4. Evidencia de idempotencia

Mecanismo: clave `baja_jugador|email|telefono` (normalizados), `Map` en memoria del Worker por isolate, TTL 3 minutos (`CP04_IDEMPOTENCY_TTL_MS`, `index.js`). Se marca solo si la primera petición terminó en éxito real (`cp04MarkIdempotentSuccess`), y el chequeo ocurre **antes** de reenviar a Make (`index.js:2007-2020`) — un 409 prueba estructuralmente que Make nunca se invocó.

Evidencia real (rama con promoción, ejecución del 11/08/2026 04:25:31):

```
HTTP_1=200
HTTP_1_ok=true
HTTP_1_message=Baja de jugador registrada correctamente

HTTP_2=409
HTTP_2_ok=false
HTTP_2_code=IDEMPOTENT_DUPLICATE
HTTP_2_duplicated=true
```

Make History: **una sola** ejecución nueva (Status=Success, 6s, 9 operaciones) — ninguna segunda ejecución asociada a la 2ª petición.

## 5. Airtable

- `estado_jugador` (campo real `Estado`) → `INACTIVO`
- `Estado_Membresia` → `BAJA` (corrección aplicada al módulo 149; antes quedaba incorrectamente en `ACTIVO` tras una baja)
- `fecha_cancelacion` → actualizada a la fecha real de la ejecución
- Candidato en `LISTA_ESPERA`: pasa de `ESPERA` → `ACTIVO` cuando corresponde (flag=true + candidato disponible); sin cambios en caso contrario

## 6. Gmail

- Rama sin promoción: **exactamente 1** correo (`✅ Confirmación de baja · Club Pádel 04`) — contenido corregido para no afirmar reasignación ni promoción cuando no las hubo.
- Rama con promoción: **exactamente 2** correos (confirmación de baja + bienvenida al promovido).
- Ninguna petición duplicada generó un correo adicional en ningún caso probado.
- Plantillas HTML validadas visualmente (identidad CP04, Raw HTML, Gmail-safe).

## 7. Routing (módulo 99)

Corregido y validado empíricamente para respetar `promocionar_siguiente_si_aplica`:

- `flag=false` → **NO** promociona, aunque exista candidato en `ESPERA`.
- `flag=true` + candidato disponible → promociona.
- `flag=true` + sin candidato → no promociona (nada que promocionar).

Antes de la corrección, el enrutamiento dependía únicamente de si existía candidato en `ESPERA`, ignorando el flag — un jugador podía ser promocionado aunque quien procesaba la baja hubiera indicado explícitamente que no quería promoción automática.

## 8. Riesgos residuales conocidos (NO bloqueantes)

1. La evidencia del caso `flag=false + candidato ESPERA` se registró a nivel resumen, con menos detalle granular (códigos HTTP, timestamp exacto de Make, snapshot Airtable antes/después) que el resto de casos de este cierre.
2. El módulo 124 solo actualiza `Estado=ACTIVO` dentro de la tabla `LISTA_ESPERA` — no crea ni actualiza ningún registro en `JUGADORES`. Podría ser diseño intencional (el promovido se gestiona dentro de `LISTA_ESPERA`) o un hueco no documentado.
3. La idempotencia del Worker es un `Map` en memoria **por isolate** (no Durable Object/KV) — funcional y consistente en todas las pruebas realizadas, pero sin garantía arquitectónica absoluta en el edge de Cloudflare.
4. No existe test automatizado (CI) específico para la lógica de enrutamiento del módulo 99 en Make — la validación de hoy fue manual/E2E; un cambio futuro del escenario podría reintroducir el bug del flag sin detección automática.

## 9. Resultado final

**FLUJO BAJA DE JUGADOR + PROMOCIÓN — 100% PRODUCCIÓN CERTIFICADO**

## 10. Próxima recomendación

**🎾 Alta de Jugador** (Scenario Make `6199248`, endpoint `POST /api/jugadores/alta`) es el siguiente flujo recomendado para llevar a 100% producción:

- Ya tiene wiring real completo app→Worker→Make (`integradoEnApp=true`, `integradoEnWorker=true` en `app/docs/paso-07a-integracion-make-app/make-50-app-integration-map.md:24`), igual que Baja antes de este cierre.
- Webhook propio (`MAKE_ALTA_JUGADOR_WEBHOOK`), independiente del de Baja.
- Ya usa el mismo mecanismo de idempotencia (`cp04BuildAltaJugadorIdempotencyKey`) reutilizado del patrón validado en Reservas — mismo enfoque de pruebas, directamente reutilizable.
- Historial conocido de "7 ejecuciones confirmadas, 2 errores" — un punto concreto y acotado que investigar, en la línea del bug de routing que se encontró y corrigió aquí.
- **No depende de Stripe, WhatsApp Business ni dominio/Hostinger.**

Alternativas descartadas por depender de bloqueadores externos activos (cuota Airtable 429: Recordatorios, Congelación/Reactivación Membresía, Onboarding Secuencial, etc.) o por carecer aún de cualquier wiring de app (Cierre Temporal de Pistas, Gestión Lista de Espera) — exigirían más trabajo previo que Alta de Jugador para llegar al mismo punto de partida que tenía Baja al iniciar este cierre.
