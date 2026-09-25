# Runbook de pruebas reales post-Airtable 429 (Paso 07Q)

**Estado: DOCUMENTO DE PLANIFICACIÓN. No se ejecutó ninguna prueba real al crear este runbook.** Ningún comando de este documento se ha ejecutado — todos quedan marcados explícitamente como **"NO EJECUTAR HASTA QUE AIRTABLE RENUEVE CUOTA"**.

**Fecha:** 2026-07-20
**Continuación de:** Paso 07P (`docs/paso-07p-ampliacion-sidebar-31-flujos/`) — 40/50 flujos Make representados visualmente en la app.
**Bloqueante que motiva este runbook:** Airtable HTTP 429 / `PUBLIC_API_BILLING_LIMIT_EXCEEDED` (cuota agotada), documentado desde el Paso 06C en `worker-reservas/src/index.js` y confirmado como bloqueo activo en todas las auditorías 07A-07P.

---

## Entorno

- **Worktree oficial:** `/root/cp04-t-frontend-fixes`
- **Puerto visual oficial:** `localhost:5175`
- **Rama:** `frontend/audit-fixes-20260709`
- **PR #36:** OPEN / draft / MERGEABLE (base `release/staging-club-padel-04-2026-07-15`, head `frontend/audit-fixes-20260709`)

## Qué ya existe en código (revisado para este runbook, sin ejecutar nada)

- **`worker-reservas/src/index.js`** — endpoints reales ya implementados: `POST /api/reservas` (acciones `crear_reserva`, `reprogramar_reserva`, `cancelar_reserva`, `consultar_disponibilidad`), `GET/POST /api/disponibilidad`, `POST /api/jugadores/alta`, `POST /api/jugadores/baja`, `POST /api/pistas/cierre-temporal`.
- **Modo degradado Airtable 429** (Paso 06C): función que detecta `status === 429` o el texto `PUBLIC_API_BILLING_LIMIT_EXCEEDED`/`RateLimitError` en la respuesta de Airtable, y devuelve una respuesta degradada uniforme en vez de fingir éxito.
- **Idempotencia** (Paso 06D): clave de idempotencia derivada de los campos identificativos de `crear_reserva`/`reprogramar_reserva`/`cancelar_reserva`, con huella corta (`idempotencyKeyHash`) que nunca expone la clave completa (evita filtrar email/teléfono en logs).
- **Caché** (Paso 06D/07): `caches.default` de Cloudflare Workers para deduplicar reintentos, sin binding nuevo.
- **Rate limiting defensivo** para `crear_reserva` (in-memory).
- **Lista de Espera, Control QR/Accesos, Pistas libres y recordatorios, Dashboard KPI y NPS, Backups y seguridad, Comunicaciones y ciclo de socio, Calendario y disponibilidad, Facturación y pagos, Automatizaciones y bots** (Pasos 07N-07P) — módulos visuales preparados, **sin ningún endpoint real detrás** (Grupo B del mapa de integración): sus "acciones preparadas" solo muestran el mensaje local *"Acción preparada. Pendiente de conexión real cuando Make/Airtable esté disponible."* y no llaman a `fetch`/`authFetch`. Este runbook **no** incluye pruebas reales contra esos módulos por ese motivo — no hay nada real que probar ahí todavía (ver sección G).
- **Centro Técnico** (`src/components/CentroTecnico.jsx`) — panel de solo lectura sobre el inventario Make (Panel A3: integración App↔Make; salud de automatizaciones), no ejecuta ni dispara nada.

---

## A) Condiciones previas antes de probar (checklist de arranque)

No iniciar ninguna prueba real de este runbook hasta confirmar **todas** las siguientes:

- [ ] Airtable ha confirmado renovación de cuota (respuesta HTTP distinta de 429, sin `PUBLIC_API_BILLING_LIMIT_EXCEEDED` en el cuerpo).
- [ ] Se hizo una llamada de sondeo mínima y de solo lectura a Airtable (por ejemplo, listar 1 registro) para confirmar que responde antes de tocar cualquier flujo de escritura.
- [ ] PR #36 sigue en estado `draft` (verificar con `gh pr view 36 --json isDraft`).
- [ ] `git status -sb` está limpio, sin cambios locales sin commitear.
- [ ] Vite está abierto y responde en `localhost:5175` (`curl -s -o /dev/null -w "%{http_code}" http://localhost:5175/` → `200`).
- [ ] Se ha revisado en Make qué escenarios están activos hoy (pueden haber cambiado desde la última auditoría — ver hallazgo del Paso 07 master: "14/50 activos hoy vs 38/50 el 07-08").
- [ ] El propietario del proyecto ha autorizado explícitamente la ventana de pruebas reales (los datos QA, aunque sintéticos, sí tocarán Airtable/Make reales).
- [ ] Se dispone de acceso de lectura a Airtable/Make para poder verificar manualmente que cada prueba llegó (no basta con la respuesta del Worker).
- [ ] Se ha decidido y comunicado el criterio de limpieza posterior de datos QA (sección "Limpieza de datos QA" del checklist rápido).

## B) Orden recomendado de pruebas reales

1. Health/check básico sin crear datos — `GET /api/disponibilidad` (fecha futura, sin crear nada).
2. Disponibilidad de pistas — `GET /api/disponibilidad?fecha=...` para una fecha con huecos conocidos.
3. Crear reserva QA controlada — `POST /api/reservas` (`crear_reserva`).
4. Consultar reserva — `GET /api/reservas?email=...` (la creada en el paso 3).
5. Reprogramar reserva QA — `POST /api/reservas` (`reprogramar_reserva`) sobre la reserva del paso 3.
6. Cancelar reserva QA — `POST /api/reservas` (`cancelar_reserva`) sobre la misma reserva.
7. Alta de jugador QA — `POST /api/jugadores/alta`.
8. Baja de jugador QA — `POST /api/jugadores/baja` (requiere `MAKE_BAJA_JUGADOR_WEBHOOK` configurado; si no lo está, el Worker responderá 503 seguro — ese 503 en sí mismo ya es un resultado válido de prueba, ver sección D).
9. Cierre temporal de pista QA — `POST /api/pistas/cierre-temporal` (requiere `MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK`; mismo criterio que el punto 8 si no está configurado).
10. Lista de espera QA — **solo verificación visual del módulo** (`ListaEspera()`), sin llamada real: no existe endpoint. Confirmar que sigue mostrando el mensaje "preparado, pendiente de conexión real" y no un falso éxito.
11. Control QR / Accesos QA — igual que el punto 10, solo visual (Grupo B, sin Worker).
12. Pistas libres y recordatorios QA — igual, solo visual.
13. Dashboard KPI/NPS — solo lectura visual, sin acción de escritura.
14. Backups y seguridad — solo validación visual/documental, sin ejecutar ningún backup real.
15. Comunicaciones/ciclo de socio — solo pulsar "acción preparada" y confirmar el mensaje honesto, sin enviar ninguna comunicación real.
16. Calendario/disponibilidad — solo visual, sin sincronizar ningún calendario real.
17. Facturación/pagos — solo simulación/documentación; **no llamar a Stripe real bajo ningún concepto** en esta fase (fuera de alcance de este runbook, que es específicamente sobre el bloqueo de Airtable, no sobre activar Stripe).
18. Automatizaciones/bots — solo simulación/documentación; **no llamar a WhatsApp/Telegram real** (mismo motivo que el punto 17).

Los puntos 10-18 no requieren "esperar a que Airtable renueve cuota" porque no tienen ningún endpoint real detrás todavía — se incluyen en el orden solo para que la sesión de pruebas repase visualmente todo el sidebar, no porque dependan del mismo bloqueador que los puntos 1-9.

## C) Payloads QA seguros

Todos los payloads de escritura deben cumplir, sin excepción:

- **Nombre/identificador** con prefijo `QA_CP04_TEST_NO_BORRAR` (si se quiere conservar como fixture de referencia) o `QA_CP04_ELIMINAR` (si se debe borrar tras la prueba) — nunca el nombre de una persona real.
- **Email de prueba** claramente falso o controlado por el equipo (p. ej. `qa-cp04-test+<caso>@example.test` — el dominio `example.test` está reservado por IANA para pruebas y nunca resuelve a un buzón real).
- **Teléfono de prueba**: un número claramente ficticio (p. ej. `600000000`), nunca un número real.
- **Fecha futura**: nunca hoy ni pasado, para no interferir con reservas reales del día.
- **`clave_reserva` única** por ejecución (p. ej. con timestamp incluido) para poder identificarla y limpiarla después sin ambigüedad.
- **Observaciones**: incluir siempre literalmente `"PRUEBA QA — Paso 07Q, no es un jugador/reserva real"`.

### Crear reserva

```json
{
  "accion": "crear_reserva",
  "nombre": "QA_CP04_TEST_NO_BORRAR",
  "apellidos": "Runbook07Q",
  "email": "qa-cp04-test+crear-reserva@example.test",
  "telefono": "600000000",
  "fecha_reserva": "<fecha futura YYYY-MM-DD>",
  "hora_inicio": "<hora del catálogo permitido>",
  "duracion_minutos": 60,
  "pista": "Pista 1",
  "modalidad": "individual",
  "nivel": "Iniciación",
  "clave_reserva": "QA07Q-<timestamp>",
  "observaciones": "PRUEBA QA — Paso 07Q, no es un jugador/reserva real"
}
```

### Reprogramar reserva

```json
{
  "accion": "reprogramar_reserva",
  "clave_reserva": "QA07Q-<timestamp de la reserva creada>",
  "nueva_fecha": "<otra fecha futura>",
  "nueva_hora_inicio": "<hora del catálogo permitido>",
  "nueva_pista": "Pista 2",
  "observaciones": "PRUEBA QA — Paso 07Q, reprogramación de fixture QA"
}
```

### Cancelar reserva

```json
{
  "accion": "cancelar_reserva",
  "clave_reserva": "QA07Q-<timestamp de la reserva creada>",
  "confirmado": true,
  "observaciones": "PRUEBA QA — Paso 07Q, cancelación de fixture QA"
}
```

### Alta de jugador

```json
{
  "nombre": "QA_CP04_TEST_NO_BORRAR",
  "apellidos": "AltaRunbook07Q",
  "email": "qa-cp04-test+alta@example.test",
  "telefono": "600000001",
  "fecha_nacimiento": "2000-01-01",
  "nivel": "Iniciación",
  "genero": "Otro",
  "comentarios": "PRUEBA QA — Paso 07Q, no es un jugador real",
  "acepta_condiciones": true,
  "origen": "app"
}
```

### Baja de jugador

```json
{
  "nombre": "QA_CP04_TEST_NO_BORRAR",
  "apellidos": "AltaRunbook07Q",
  "email": "qa-cp04-test+alta@example.test",
  "telefono": "600000001",
  "motivo_baja": "Voluntaria",
  "fecha_baja": "<fecha futura YYYY-MM-DD>",
  "promocionar_siguiente_si_aplica": false,
  "observaciones": "PRUEBA QA — Paso 07Q, baja del jugador QA creado en el alta anterior",
  "origen": "APP_CLUB_PADEL_04",
  "accion": "baja_jugador"
}
```

### Cierre temporal de pista

```json
{
  "pista": "Pista 4",
  "fecha_inicio": "<fecha futura YYYY-MM-DD>",
  "hora_inicio": "08:00",
  "fecha_fin": "<misma fecha o siguiente>",
  "hora_fin": "09:00",
  "motivo": "mantenimiento",
  "observaciones": "PRUEBA QA — Paso 07Q, cierre de prueba, no bloquea pista real",
  "creado_por": "qa-cp04-test@example.test",
  "rol_origen": "SUPPORT",
  "notify_players": false,
  "accion": "cierre_temporal_pista"
}
```

### Lista de espera / QR-acceso

No existe payload real que enviar (Grupo B, sin Worker) — la "prueba" en estos dos casos es exclusivamente visual: confirmar que el módulo muestra el formulario/acciones y el mensaje honesto de "preparado, pendiente de conexión real", sin enviar ningún payload a ningún endpoint.

## D) Criterios de éxito

- El Worker responde con el código HTTP y la forma de respuesta ya documentados en cada handler (200 en éxito real, 503 si el webhook de Make no está configurado, 502 si Make rechaza, 400 en validación).
- Se puede confirmar en el historial de ejecuciones de Make que la ejecución llegó (contrastar `executions_list`/`executions_get` del escenario correspondiente).
- Se puede confirmar en Airtable que el registro se creó/actualizó/buscó correctamente, sin usar datos reales de socios.
- No aparecen registros duplicados en Airtable tras repetir la misma petición con la misma `clave_reserva`/idempotencia.
- La idempotencia funciona: reenviar el mismo payload con el mismo `clave_reserva` no crea un segundo registro.
- Los mensajes de error del Worker son seguros (no filtran tokens, URLs de webhook completas, ni datos de otros socios).
- **Ningún flujo confirma éxito si Airtable o Make responden con error** — el criterio ya vigente en el código (`response.ok && data.ok !== false`) se mantiene sin excepción durante las pruebas.
- La UI muestra mensajes coherentes con la respuesta real del Worker (no un mensaje de éxito genérico si el Worker devolvió error).
- Los logs del Worker no exponen secretos (webhooks completos, tokens) ni datos personales completos de los fixtures QA más allá de lo estrictamente necesario para depurar.

## E) Criterios de parada inmediata

Detener la sesión de pruebas de inmediato si ocurre cualquiera de estos:

- Vuelve a aparecer `429`/`PUBLIC_API_BILLING_LIMIT_EXCEEDED` en cualquier llamada a Airtable.
- Aparece un `401`/`403` de credenciales (token de Make/Airtable inválido o rotado).
- Se detecta un registro duplicado en Airtable para la misma prueba.
- Se detecta que un mensaje/notificación real ha salido hacia un socio real (WhatsApp, email, etc.) — no debería ocurrir porque los módulos de comunicación siguen sin Worker, pero es un criterio de parada si sucediera.
- Se detecta creación masiva accidental de registros (más de los esperados por el número de pruebas ejecutadas).
- Cualquier error que parezca afectar a datos de un socio real (nombre, email o teléfono que no sea uno de los fixtures QA de este runbook).

Ante cualquiera de estos: parar, no reintentar, documentar el error exacto, y avisar al propietario del proyecto antes de continuar.

## F) Checklist por rol

- **PLAYER:** no ejecuta ninguna de las pruebas de este runbook (no tiene acceso a ningún módulo de escritura QA). Solo debe confirmarse que su sidebar sigue limpio (Inicio, Reservar, Torneos, Ranking, Comunidad, Perfil) y que no puede alcanzar ningún módulo de gestión ni por navegación directa.
- **STAFF:** ejecuta las pruebas 3-9 (crear/reprogramar/cancelar reserva, alta/baja de jugador, cierre temporal) y revisa visualmente Lista de espera, Control QR/Accesos, Pistas libres y recordatorios, Comunicaciones y ciclo de socio, Calendario y disponibilidad. No debe ver ni necesitar Dashboard KPI/NPS, Backups/Seguridad, Facturación/Pagos ni Automatizaciones/Bots.
- **ADMIN:** repite lo de STAFF y además revisa visualmente Dashboard KPI y NPS, Backups y seguridad, Facturación y pagos, Automatizaciones y bots (sin ejecutar ninguna acción real de pago ni mensaje).
- **SUPPORT:** repite lo de ADMIN y además usa Centro Técnico para confirmar en el Panel A3 que los escenarios probados aparecen con la evidencia real actualizada (una vez decidido, ver sección "Actualizar makeInventory.js" del checklist rápido), y revisa Soporte para confirmar que los logs no exponen secretos.

## G) Checklist por módulo sidebar (23 módulos)

| Módulo | ¿Requiere prueba real de este runbook? |
|---|---|
| Inicio | No — solo confirmar que carga sin error para los 4 roles. |
| Reservar | Sí — cubierto por las pruebas 1-3. |
| Alta de jugador | Sí — prueba 7. |
| Baja de jugador | Sí — prueba 8 (503 seguro si el webhook no está configurado es un resultado válido). |
| Reprogramar reserva | Sí — prueba 5. |
| Cancelar reserva | Sí — prueba 6. |
| Reservas (Gestión) | Sí — prueba 4 (consultar). |
| Cierre temporal | Sí — prueba 9 (503 seguro si el webhook no está configurado es un resultado válido). |
| Lista de espera | No — solo visual (Grupo B, sin Worker). |
| Control QR / Accesos | No — solo visual (Grupo B, sin Worker). |
| Pistas libres y recordatorios | No — solo visual (Grupo B, sin Worker). |
| Comunicaciones y ciclo de socio | No — solo visual (Grupo B, sin Worker). |
| Calendario y disponibilidad | No — solo visual (Grupo B, sin Worker). |
| Torneos | No — sin backend real, fuera de alcance de este runbook. |
| Ranking | No — sin backend real, fuera de alcance de este runbook. |
| Comunidad | No — módulo demo/mock, fuera de alcance de Airtable. |
| Admin | No — panel de solo lectura sobre datos ya disponibles. |
| Dashboard KPI y NPS | No — solo visual (Grupo B, sin Worker). |
| Backups y seguridad | No — solo visual (Grupo B, sin Worker). |
| Facturación y pagos | No — solo visual, sin Stripe real (fuera de alcance). |
| Automatizaciones y bots | No — solo visual, sin WhatsApp/Telegram real (fuera de alcance). |
| Centro Técnico | No ejecuta pruebas, pero se revisa para confirmar que refleja la evidencia real tras las pruebas 1-9 (rol SUPPORT). |
| Soporte | No ejecuta pruebas, se revisa para confirmar logs seguros. |
| Perfil y ajustes | No — solo confirmar que carga sin error para los 4 roles. |

## H) Matriz final

| Módulo | Rol autorizado | Flujo Make relacionado | Tipo de prueba | ¿Requiere Airtable? | ¿Requiere credencial externa? | Riesgo | Estado esperado |
|---|---|---|---|---|---|---|---|
| Reservar / Reservas | STAFF, ADMIN, SUPPORT (consulta: PLAYER) | 📡 API Reservas (5697630) | Real (crear/consultar/reprogramar/cancelar) | Sí | No | Medio (escritura real) | 200 con registro verificable en Airtable, sin duplicados |
| Alta de jugador | STAFF, ADMIN, SUPPORT | 🎾 Alta de Jugador (6199248) | Real | Sí | No | Medio | 200, jugador QA visible en Airtable |
| Baja de jugador | STAFF, ADMIN, SUPPORT | ❌ Baja de Jugador + Promoción (5288809) | Real (o 503 seguro si falta webhook) | Sí | Sí (`MAKE_BAJA_JUGADOR_WEBHOOK`) | Medio | 200 o 503 seguro, nunca falso éxito |
| Cierre temporal | STAFF, ADMIN, SUPPORT | 🏟️ Cierre Temporal de Pistas (5791133) | Real (o 503 seguro si falta webhook) | Sí | Sí (`MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK`) | Medio | 200 o 503 seguro, nunca falso éxito |
| Lista de espera | STAFF, ADMIN, SUPPORT | 📋 Gestión Lista de Espera (5791113) | Solo visual | No (sin Worker) | No | Ninguno | Mensaje "preparado, pendiente" visible |
| Control QR / Accesos | STAFF, ADMIN, SUPPORT | 🔐/🔑 Control y Generación QR (5291559, 6244975) | Solo visual | No (sin Worker) | No | Ninguno | Mensaje "preparado, pendiente" visible |
| Pistas libres y recordatorios | STAFF, ADMIN, SUPPORT | 4 escenarios (ver Paso 07O) | Solo visual | No (sin Worker) | No | Ninguno | Mensaje "preparado, pendiente" visible |
| Comunicaciones y ciclo de socio | STAFF, ADMIN, SUPPORT | 9 escenarios (ver Paso 07P) | Solo visual | No (sin Worker) | No | Ninguno | Mensaje "preparado, pendiente" visible |
| Calendario y disponibilidad | STAFF, ADMIN, SUPPORT | 2 escenarios (ver Paso 07P) | Solo visual | No (sin Worker) | No | Ninguno | Mensaje "preparado, pendiente" visible |
| Dashboard KPI y NPS | ADMIN, SUPPORT | 4 escenarios (ver Paso 07O) | Solo visual | No (sin Worker) | No | Ninguno | Mensaje "preparado, pendiente" visible |
| Backups y seguridad | ADMIN, SUPPORT | 4 escenarios (ver Paso 07O) | Solo visual | No (sin Worker) | No | Ninguno | Mensaje "preparado, pendiente" visible |
| Facturación y pagos | ADMIN, SUPPORT | 4 escenarios (ver Paso 07P) | Solo visual, sin Stripe real | No (sin Worker) | Sí (Stripe, fuera de alcance) | Ninguno si no se activa Stripe | Mensaje "pendiente de Stripe" visible |
| Automatizaciones y bots | ADMIN, SUPPORT | 5 escenarios (ver Paso 07P) | Solo visual, sin WhatsApp/Telegram real | No (sin Worker) | Sí (WhatsApp/Telegram, fuera de alcance) | Ninguno si no se activan | Mensaje "pendiente" visible |
| Centro Técnico | SUPPORT | Todos (auditoría) | Solo lectura | No (lee snapshot/MCP) | No | Ninguno | Panel A3 y salud reflejan la evidencia real tras las pruebas |
| Soporte | SUPPORT | N/A | Solo lectura | No | No | Ninguno | Logs sin secretos visibles |

## I) Secuencia de comandos futura

**⚠️ NO EJECUTAR HASTA QUE AIRTABLE RENUEVE CUOTA. Ninguno de estos comandos se ha ejecutado al redactar este runbook.**

```bash
# ⚠️ NO EJECUTAR — 1. Sondeo de solo lectura, confirmar que Airtable ya no da 429
curl -s -o /dev/null -w "%{http_code}\n" "https://<worker-desplegado>/api/disponibilidad?fecha=<fecha-futura>"

# ⚠️ NO EJECUTAR — 2. Crear reserva QA
curl -s -X POST "https://<worker-desplegado>/api/reservas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-de-sesion-staff-o-admin>" \
  -d '{
    "accion": "crear_reserva",
    "nombre": "QA_CP04_TEST_NO_BORRAR",
    "apellidos": "Runbook07Q",
    "email": "qa-cp04-test+crear-reserva@example.test",
    "telefono": "600000000",
    "fecha_reserva": "<fecha futura>",
    "hora_inicio": "<hora permitida>",
    "duracion_minutos": 60,
    "pista": "Pista 1",
    "modalidad": "individual",
    "nivel": "Iniciación",
    "clave_reserva": "QA07Q-<timestamp>",
    "observaciones": "PRUEBA QA — Paso 07Q, no es una reserva real"
  }'

# ⚠️ NO EJECUTAR — 3. Consultar la reserva creada
curl -s "https://<worker-desplegado>/api/reservas?email=qa-cp04-test+crear-reserva@example.test" \
  -H "Authorization: Bearer <token-de-sesion-staff-o-admin>"

# ⚠️ NO EJECUTAR — 4. Reprogramar
curl -s -X POST "https://<worker-desplegado>/api/reservas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-de-sesion-staff-o-admin>" \
  -d '{ "accion": "reprogramar_reserva", "clave_reserva": "QA07Q-<timestamp>", "nueva_fecha": "<otra fecha futura>", "nueva_hora_inicio": "<hora permitida>", "nueva_pista": "Pista 2", "observaciones": "PRUEBA QA — Paso 07Q" }'

# ⚠️ NO EJECUTAR — 5. Cancelar
curl -s -X POST "https://<worker-desplegado>/api/reservas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-de-sesion-staff-o-admin>" \
  -d '{ "accion": "cancelar_reserva", "clave_reserva": "QA07Q-<timestamp>", "confirmado": true, "observaciones": "PRUEBA QA — Paso 07Q" }'

# ⚠️ NO EJECUTAR — 6. Alta de jugador
curl -s -X POST "https://<worker-desplegado>/api/jugadores/alta" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-de-sesion-staff-o-admin>" \
  -d '{ "nombre": "QA_CP04_TEST_NO_BORRAR", "apellidos": "AltaRunbook07Q", "email": "qa-cp04-test+alta@example.test", "telefono": "600000001", "fecha_nacimiento": "2000-01-01", "nivel": "Iniciación", "genero": "Otro", "acepta_condiciones": true, "origen": "app" }'

# ⚠️ NO EJECUTAR — 7. Baja de jugador
curl -s -X POST "https://<worker-desplegado>/api/jugadores/baja" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-de-sesion-staff-o-admin>" \
  -d '{ "nombre": "QA_CP04_TEST_NO_BORRAR", "apellidos": "AltaRunbook07Q", "email": "qa-cp04-test+alta@example.test", "telefono": "600000001", "motivo_baja": "Voluntaria", "fecha_baja": "<fecha futura>", "promocionar_siguiente_si_aplica": false, "observaciones": "PRUEBA QA — Paso 07Q", "origen": "APP_CLUB_PADEL_04", "accion": "baja_jugador" }'

# ⚠️ NO EJECUTAR — 8. Cierre temporal de pista
curl -s -X POST "https://<worker-desplegado>/api/pistas/cierre-temporal" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-de-sesion-staff-o-admin>" \
  -d '{ "pista": "Pista 4", "fecha_inicio": "<fecha futura>", "hora_inicio": "08:00", "fecha_fin": "<fecha futura>", "hora_fin": "09:00", "motivo": "mantenimiento", "observaciones": "PRUEBA QA — Paso 07Q", "creado_por": "qa-cp04-test@example.test", "rol_origen": "SUPPORT", "notify_players": false, "accion": "cierre_temporal_pista" }'
```

Ningún comando de esta sección se ejecutó al redactar este runbook. Todos requieren, además de la renovación de cuota de Airtable, una URL real de Worker desplegado y un token de sesión real — ninguno de los dos se ha inventado ni se ha usado aquí.
