# Integración App/API — Cierre Temporal de Pistas (Paso 07E)

**Estado: FLUJO PREPARADO Y SEGURO, NO CONFIRMADO END-TO-END.** El código app→Worker existe, está probado con datos sintéticos y nunca ejecuta Make ni Airtable. El webhook real de Make (`MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK`) no está configurado en ningún entorno — mientras no lo esté, el Worker responde siempre 503 de forma segura, nunca falsifica un éxito ni un cierre confirmado.

**Fecha:** 2026-07-19
**Make ID del escenario:** 5791133 (`🏟️ Cierre Temporal de Pistas`)
**Continuación de:** Paso 07A (`docs/paso-07a-integracion-make-app/`), Paso 07B (`docs/paso-07b-grupo-e-huecos/grupo-e-priorizacion.md`, que identificó este flujo como segundo candidato accionable del Grupo E) y Paso 07C (`docs/paso-07c-baja-jugador/`, mismo patrón de código, primer flujo integrado).

---

## Qué se ha integrado

Réplica deliberada del patrón ya existente de **Alta/Baja de Jugador**, adaptado a una acción administrativa sobre pistas en lugar de sobre jugadores:

| | Alta/Baja de Jugador (ya existía) | Cierre Temporal de Pistas (nuevo, Paso 07E) |
|---|---|---|
| Ruta app | Sección `alta_jugador` | Sección `gestion` (ya existente, misma sección de "Listado real de reservas") |
| Componente | `AltaJugador()` en `src/App.jsx` | `Gestion()` en `src/App.jsx`, nuevo `Card` "Cierre temporal de pista" al inicio de la sección |
| Endpoint Worker | `POST /api/jugadores/alta` / `/baja` | `POST /api/pistas/cierre-temporal` (nuevo) |
| Handler Worker | `handleAltaJugador()` / `handleBajaJugador()` | `handleCierreTemporalPista()` (nuevo, réplica del patrón) |
| Webhook Make | `env.MAKE_ALTA_JUGADOR_WEBHOOK` / `env.MAKE_BAJA_JUGADOR_WEBHOOK` | `env.MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK` (nuevo, **no configurado todavía**) |
| Gate RBAC | `requireRoles(request, env, ["STAFF","ADMIN","SUPPORT"])` | Idéntico, mismo gate |

No se creó ninguna ruta de navegación nueva ni se tocó `rbac.js`: la sección `gestion` ya está gateada a STAFF/ADMIN/SUPPORT (`CP04_ROLE_PERMISSIONS` en `src/utils/rbac.js`) y no aparece en la lista de permisos de PLAYER. Se eligió `gestion` en lugar de reutilizar `alta_jugador` (como hizo Baja de Jugador en el Paso 07C) porque el cierre de pistas es conceptualmente una acción de gestión de reservas/pistas, no de jugadores — y `gestion` ya es la sección donde STAFF/ADMIN/SUPPORT consultan y administran reservas reales.

## Desde qué rol

**STAFF, ADMIN y SUPPORT** — los mismos que ya tienen acceso a la sección `gestion` (`CP04_ROLE_PERMISSIONS` en `src/utils/rbac.js`, sin modificar). **PLAYER no puede acceder**: `gestion` no está en su lista de permisos (`CP04_ROLE_PERMISSIONS.PLAYER`), garantía estructural heredada de los tests de RBAC ya existentes (`rbac.test.mjs`) — no se necesitó ningún test nuevo de RBAC de sección.

## Dónde aparece en la app

Nuevo `Card` "Cierre temporal de pista" al principio de la sección **Gestión** (`nav.gestion`, icono 📅), antes del panel existente "Consultar mis reservas". Mismo componente `Gestion()`, sin pestañas nuevas de navegación.

## Qué payload genera

```json
{
  "accion": "cierre_temporal_pista",
  "pista": "Pista 1 | Pista 2 | Pista 3 | Pista 4 | todas",
  "fecha_inicio": "YYYY-MM-DD",
  "hora_inicio": "HH:MM",
  "fecha_fin": "YYYY-MM-DD",
  "hora_fin": "HH:MM",
  "motivo": "mantenimiento | lluvia | evento | torneo | limpieza | obra | incidencia | administrativo | otro",
  "observaciones": "...",
  "creado_por": "email de la sesión STAFF/ADMIN/SUPPORT autenticada",
  "rol_origen": "ADMIN | STAFF | SUPPORT",
  "origen": "APP_CLUB_PADEL_04",
  "estado": "pendiente_confirmacion",
  "notify_players": true,
  "bloquear_reservas": true
}
```

`creado_por` y `rol_origen` se toman de la sesión real (`useAuth()` → `auth.user?.email` / `auth.role`), no de un campo editable del formulario. `origen`, `estado` y `bloquear_reservas` son fijos y no configurables desde la UI — igual que `accion` viaja fijo en Alta/Baja de Jugador.

Todos los campos se validan tanto en el cliente (`validateCierre()` en `Gestion()`) como en el Worker (`handleCierreTemporalPista()`), replicando el doble nivel de validación ya existente en Alta/Baja. La validación de fechas/horas exige `fecha_fin >= fecha_inicio` y, si ambas fechas coinciden, `hora_fin > hora_inicio`.

## Qué endpoint/acción usa

`POST /api/pistas/cierre-temporal` (alias `/pistas/cierre-temporal`, igual que Alta/Baja aceptan ambas formas). Gateado por rol cuando `CP04_ENFORCE_ROLE_GATES === "true"`.

## Comportamiento de respuesta (nunca confirma un cierre real sin respuesta real)

- **Sin `MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK` configurado (estado actual):** el Worker responde `503 { ok:false, error:"Cierre temporal webhook not configured" }`. La app traduce esto a un mensaje honesto para STAFF/ADMIN: *"El cierre temporal de pistas todavía no está configurado en el sistema. Contacta con soporte técnico."*
- **Si el webhook estuviera configurado y Make respondiera con error:** `502 { ok:false, error:"Make request failed" }` — la app muestra el mensaje de error genérico, nunca marca el cierre como confirmado.
- **Solo si `response.ok` y `data.ok !== false`:** el Worker responde `200 { ok:true, estado:"pendiente_confirmacion", message: "Solicitud de cierre temporal enviada correctamente. Pendiente de confirmación real del sistema." }` y la app muestra ese mismo mensaje, limpiando el formulario. **En ningún caso —ni siquiera en el 200— la app ni el Worker afirman "pista cerrada"**: el campo `estado` viaja y se muestra siempre como `"pendiente_confirmacion"`, porque la confirmación real de que la pista queda bloqueada depende de que el escenario Make 5791133 procese el cierre en Airtable, fuera del alcance de este Worker.

## Qué queda pendiente en Make

- **Configurar el secret `MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK`** en el entorno del Worker (Cloudflare) — acción manual fuera de este repositorio, no se ha inventado ninguna URL ni valor. Hasta que exista, el flujo completo (app→Worker) funciona y está probado, pero el tramo Worker→Make no puede ejercitarse.
- Verificar en Make que el escenario 5791133 tiene un webhook de recepción configurado para aceptar este payload (nota: `makeInventory.js` ya registra este escenario como `estadoVerificacion: "confirmado"` con webhook real asignado y 4 ejecuciones históricas — pero esa verificación es de que **Make** funciona, no de que la **app** lo dispare; son ejes independientes, ver más abajo).

## Qué queda pendiente por Airtable 429

- Aunque el webhook de Make se configure, el escenario en sí (`usaAirtable: true` según `makeInventory.js`) probablemente escriba/lea en Airtable para persistir el cierre — sujeto al mismo bloqueo de cuota (`PUBLIC_API_BILLING_LIMIT_EXCEEDED`) que afecta a otros escenarios del inventario. No se ha intentado ni se intentará verificar esto mientras el bloqueo siga activo.

## Cómo probarlo cuando Airtable/Make estén disponibles

1. Configurar `MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK` como secret real en el Worker.
2. Repetir el patrón ya usado para Alta/Baja de Jugador y API Reservas en sesiones anteriores: una prueba controlada con datos 100% sintéticos (`QA_CP04_TEST*`), explícitamente autorizada por el propietario del proyecto, contra el endpoint real desplegado (no contra Make directamente).
3. Verificar en el historial de Make que la ejecución llega, se enruta correctamente, y confirmar si escribe en Airtable sin error 429.
4. **Solo entonces**, actualizar `estadoVerificacion` del eje de integración de app en `src/data/makeAppIntegrationMap.js` (`requiereMakeManual` a `false`), con la evidencia real documentada. Este documento **no** ha tocado `estadoVerificacion` en `makeInventory.js` (que ya era `"confirmado"` desde antes de este paso, por verificación directa de Make, no de la app): ese eje sigue siendo independiente del eje de integración de código que sí se actualizó aquí.

## Qué mensajes seguros ve el usuario

- Formulario: *"Esta acción prepara el cierre, pero no se considerará confirmada hasta recibir respuesta real del sistema."* (visible siempre, encima del formulario).
- Error por webhook no configurado (estado actual): *"El cierre temporal de pistas todavía no está configurado en el sistema. Contacta con soporte técnico."*
- Error genérico (Make responde con fallo): mensaje de error devuelto por el servidor o *"No se pudo enviar la solicitud de cierre temporal."*
- Éxito (solo si el Worker confirma con `ok:true`): *"Solicitud de cierre temporal enviada correctamente. No se considera confirmada hasta que el sistema lo confirme."*

## Qué NO debe prometer la app

- Nunca dice **"pista cerrada"** ni **"cierre confirmado"** en ningún estado de respuesta — ni siquiera en el 200 del Worker, cuyo propio payload de éxito lleva `estado: "pendiente_confirmacion"`.
- No bloquea reservas reales todavía: el motor de disponibilidad (`src/utils/availability.js`) ya reconoce cierres (`closures`, ver más abajo) pero **ningún llamador real de la app le pasa cierres hoy** — no existe fuente de datos real (Make/Airtable) de la que leerlos. Preparar la estructura no equivale a activarla sin datos confirmados.
- No inventa ninguna URL de webhook ni ningún secreto — el código comprueba `env.MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK` exactamente igual que Alta/Baja comprueban sus respectivas variables, y responde 503 si falta.
- No se tocó `rbac.js`, la navegación, ni las traducciones — cero riesgo de romper el guard de acceso ya probado de `gestion`.
- No se añadió soporte multi-idioma (i18n `tx()`) para los textos nuevos — se usó texto en español directo, igual que la limitación deliberada ya documentada para Baja de Jugador (Paso 07C).
- No se cambió `estadoVerificacion` en `makeInventory.js` — solo se actualizó el eje de integración de código (`makeAppIntegrationMap.js`), eje independiente desde el Paso 07A.

## Integración con reservas (motor local de disponibilidad)

`src/utils/availability.js` (`evaluateSlotAvailability()`) ya es el motor puro de disponibilidad usado por Reservas/Cancelar/Reprogramar. Se le añadió un parámetro opcional `closures = []` (por defecto vacío, sin cambiar el comportamiento existente — ver regresión en tests):

- Estructura de un cierre: `{ pista, fecha_inicio, hora_inicio, fecha_fin, hora_fin }` — mismos nombres de campo que genera este formulario y `handleCierreTemporalPista`.
- `pista: "todas"` bloquea cualquier `courtId`.
- Días estrictamente entre `fecha_inicio` y `fecha_fin` quedan cerrados el día completo; en los días de borde solo se bloquea el tramo horario indicado.
- Nuevo motivo de indisponibilidad: `AVAILABILITY_REASON.COURT_CLOSED`, distinto de `BOOKING_OVERLAP` (un cierre bloquea el hueco exista o no una reserva ahí).
- **Límite explícito:** ningún punto de la app pasa closures reales todavía a `evaluateSlotAvailability()` — no existe ninguna fuente de datos (Make/Airtable) de la que leer los cierres activos. La función está preparada y probada (8 tests nuevos, incluida una regresión que confirma que sin `closures` el comportamiento no cambia), pero conectarla a datos reales de cierres queda pendiente de que exista esa fuente. No se ha bloqueado ninguna funcionalidad real de reservas sin datos confirmados.

## Cobertura de tests

**Worker (`worker-reservas/src/cierre-temporal-pista.test.mjs`, 16 tests nuevos):** 503 sin webhook configurado (sin llamar a `fetch`), 405 método no permitido, 400 JSON inválido, 400 validación de campos obligatorios, 400 motivo fuera de lista, 400 fecha_fin anterior a fecha_inicio, 400 hora_fin ≤ hora_inicio mismo día, 400 rol_origen inválido, 200 con `pista: "todas"`, payload reenviado con `accion:"cierre_temporal_pista"` y campos correctos, nunca confirma éxito si Make responde con error (502), gate de rol bloquea sin token (401) antes de llegar al handler, OPTIONS siempre 204, y 3 regresiones explícitas confirmando que Alta de Jugador, Baja de Jugador y `/api/disponibilidad` siguen respondiendo igual que antes.

**Datos (`src/data/makeAppIntegrationMap.test.mjs`, actualizado):** confirma que Cierre Temporal de Pistas pasa a `grupo: "A"`, `integradoEnApp: true`, `integradoEnWorker: true`, pero `requiereMakeManual: true` con `bloqueadorPrincipal` mencionando explícitamente el webhook pendiente — nunca se marca como confirmado end-to-end. Se actualizó también el conteo esperado en `computeIntegracionResumen` (`src/utils/makeCentroTecnicoLogic.test.mjs`): 4/50 integrados app+Worker, 10/50 sin integración visible.

**Disponibilidad (`src/utils/availability.test.mjs`, 8 tests nuevos):** sin `closures` el comportamiento no cambia (regresión explícita), cierre cubre el slot exacto, cierre de otra pista no afecta, `pista: "todas"` bloquea cualquier pista, cierre en otra fecha no afecta, cierre multi-día bloquea el día intermedio completo, cierre multi-día en el día de borde final solo bloquea antes de `hora_fin`, y un cierre bloquea el slot incluso sin ninguna reserva solapada (motivo distinto de `booking_overlap`).

**No se añadió un test de renderizado de React** para el nuevo `Card` de Gestión, por la misma razón ya documentada en el Paso 07C: este repositorio no tiene infraestructura de render de componentes (`@testing-library/react`/jsdom no instalados). La garantía de "no visible a PLAYER" se hereda estructuralmente de los tests de RBAC ya existentes sobre la sección `gestion`.

## Qué se revisó antes de implementar (sin ejecutar Make/Airtable)

- `docs/paso-07a-integracion-make-app/` (mapa e inventario original).
- `docs/paso-07b-grupo-e-huecos/` (priorización que identificó este flujo como segundo candidato).
- `docs/paso-07c-baja-jugador/baja-jugador-integracion.md` (patrón de código replicado).
- `worker-reservas/src/index.js` (`handleAltaJugador`, `handleBajaJugador`, dispatcher de rutas).
- `src/App.jsx` (`AltaJugador()`, `Gestion()`, `rbac.js` vía `CP04_ROLE_PERMISSIONS`).
- `src/data/makeInventory.js` y `src/data/makeAppIntegrationMap.js`.
- `src/components/CentroTecnico.jsx` y `src/utils/makeCentroTecnicoLogic.js` (Panel A3, contadores calculados dinámicamente desde `MAKE_APP_INTEGRATION_MAP` — no requirió ningún cambio manual de UI, solo el cambio de datos).
- `src/utils/availability.js` (motor de disponibilidad ya existente, extendido de forma aditiva).
