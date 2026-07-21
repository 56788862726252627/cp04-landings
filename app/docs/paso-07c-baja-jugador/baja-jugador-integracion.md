# Integración App/API — Baja de Jugador + Promoción (Paso 07C)

**Estado: FLUJO PREPARADO Y SEGURO, NO CONFIRMADO END-TO-END.** El código app→Worker existe, está probado con datos sintéticos y nunca ejecuta Make ni Airtable. El webhook real de Make (`MAKE_BAJA_JUGADOR_WEBHOOK`) no está configurado en ningún entorno — mientras no lo esté, el Worker responde siempre 503 de forma segura, nunca falsifica un éxito.

**Fecha:** 2026-07-19
**Make ID del escenario:** 5288809 (`❌ Baja de Jugador + Promoción`)
**Continuación de:** Paso 07A (`docs/paso-07a-integracion-make-app/`) y Paso 07B (`docs/paso-07b-grupo-e-huecos/grupo-e-priorizacion.md`), que identificó este flujo como el más accionable del Grupo E.

---

## Qué se ha integrado

Réplica deliberada, campo a campo, del patrón ya existente y en producción de **Alta de Jugador**:

| | Alta de Jugador (ya existía) | Baja de Jugador (nuevo, Paso 07C) |
|---|---|---|
| Ruta app | `alta_jugador` (misma sección, sin cambio) | Misma sección, pestaña "Baja de jugador" |
| Componente | `AltaJugador()` en `src/App.jsx` | Mismo componente, estado `modo` + formulario `bajaForm` |
| Endpoint Worker | `POST /api/jugadores/alta` | `POST /api/jugadores/baja` (nuevo) |
| Handler Worker | `handleAltaJugador()` | `handleBajaJugador()` (nuevo, réplica exacta del patrón) |
| Webhook Make | `env.MAKE_ALTA_JUGADOR_WEBHOOK` | `env.MAKE_BAJA_JUGADOR_WEBHOOK` (nuevo, **no configurado todavía**) |
| Gate RBAC | `requireRoles(request, env, ["STAFF","ADMIN","SUPPORT"])` | Idéntico, mismo gate |

No se creó ninguna ruta de navegación nueva, no se tocó `rbac.js`, no se tocaron las 8 traducciones de navegación (`nav.*`) — la Baja vive dentro de la misma sección `alta_jugador` ya gateada y probada, como una segunda pestaña. Esta fue una decisión deliberada para minimizar la superficie de cambio y el riesgo de romper Alta de Jugador.

## Desde qué rol

**STAFF, ADMIN y SUPPORT** — exactamente los mismos que ya tienen acceso a Alta de Jugador (`CP04_ROLE_PERMISSIONS` en `src/utils/rbac.js`, sin modificar). **PLAYER no puede acceder**, heredado del mismo guard ya probado por los tests existentes de `rbac.test.mjs` (no se necesitó ningún test nuevo de RBAC: la garantía es estructural, por reutilizar la misma sección ya gateada).

## Qué payload genera

```json
{
  "nombre": "...",
  "apellidos": "...",
  "email": "...",
  "telefono": "...",
  "motivo_baja": "Voluntaria | Impago | Inactividad | Traslado a otro club | Otro",
  "fecha_baja": "YYYY-MM-DD",
  "promocionar_siguiente_si_aplica": true,
  "observaciones": "...",
  "origen": "APP_CLUB_PADEL_04",
  "accion": "baja_jugador"
}
```

Todos los campos se validan tanto en el cliente (`validateBaja()`) como en el Worker (`handleBajaJugador()`), replicando el doble nivel de validación ya existente en Alta.

## Qué endpoint/acción usa

`POST /api/jugadores/baja` (alias `/jugadores/baja`, igual que Alta acepta `/api/jugadores/alta` y `/jugadores/alta`). Gateado por rol cuando `CP04_ENFORCE_ROLE_GATES === "true"`.

## Comportamiento de respuesta (nunca confirma sin respuesta real)

- **Sin `MAKE_BAJA_JUGADOR_WEBHOOK` configurado (estado actual):** el Worker responde `503 { ok:false, error:"Baja webhook not configured" }`. La app traduce esto a un mensaje honesto para STAFF/ADMIN: *"La baja de jugador todavía no está configurada en el sistema. Contacta con soporte técnico."* — nunca se muestra el mensaje de éxito.
- **Si el webhook estuviera configurado y Make respondiera con error:** `502 { ok:false, error:"Make request failed" }` — la app muestra el mensaje de error genérico, nunca marca la baja como completada.
- **Solo si `response.ok` y `data.ok !== false`:** se muestra *"Baja registrada correctamente."* y se limpia el formulario. Mismo criterio defensivo, línea por línea, que el `submit()` ya existente de Alta.

## Qué queda pendiente en Make

- **Configurar el secret `MAKE_BAJA_JUGADOR_WEBHOOK`** en el entorno del Worker (Cloudflare) — acción manual fuera de este repositorio, no se ha inventado ninguna URL ni valor. Hasta que exista, el flujo completo (app→Worker) funciona y está probado, pero el tramo Worker→Make no puede ejercitarse.
- Verificar en Make que el escenario 5288809 tiene un webhook de recepción configurado para aceptar este payload.

## Qué queda pendiente por Airtable 429

- Aunque el webhook de Make se configure, el escenario en sí (`usaAirtable: true` según `makeInventory.js`) probablemente escriba/lea en Airtable — sujeto al mismo bloqueo de cuota (`PUBLIC_API_BILLING_LIMIT_EXCEEDED`) que afecta a otros 18 escenarios del inventario. No se ha intentado ni se intentará verificar esto mientras el bloqueo siga activo.

## Cómo probarlo cuando Airtable/Make estén disponibles

1. Configurar `MAKE_BAJA_JUGADOR_WEBHOOK` como secret real en el Worker.
2. Repetir el patrón ya usado para Alta/API Reservas en sesiones anteriores: una prueba controlada con datos 100% sintéticos (`QA_CP04_TEST*`), explícitamente autorizada por el propietario del proyecto, contra el endpoint real desplegado (no contra Make directamente).
3. Verificar en el historial de Make que la ejecución llega, se enruta correctamente, y confirmar si escribe en Airtable sin error 429.
4. **Solo entonces**, actualizar `estadoVerificacion` de este escenario en `src/data/makeInventory.js` de `listo_sin_bloqueo` a `confirmado`, con la evidencia real documentada en su `nota` — igual que se hizo con los 7 escenarios ya confirmados. Este documento **no** ha tocado `estadoVerificacion`: ese eje sigue exigiendo evidencia real contra Make, que no existe todavía.

## Qué NO se hizo (deliberado)

- No se llamó a Make, no se llamó a Airtable, no se ejecutó ningún endpoint real.
- No se inventó ninguna URL de webhook ni ningún secreto — el código comprueba `env.MAKE_BAJA_JUGADOR_WEBHOOK` exactamente igual que Alta comprueba `env.MAKE_ALTA_JUGADOR_WEBHOOK`, y responde 503 si falta.
- No se tocó `rbac.js`, la navegación, ni las traducciones — cero riesgo de romper el guard de acceso ya probado.
- No se añadió soporte multi-idioma (i18n `tx()`) para los textos nuevos de la pestaña de Baja — se usó texto en español directo, igual que el copy literal ya pedido para este paso. Es una limitación deliberada frente al resto de la app (que sí es multi-idioma); si se decide alinear, sería un cambio de UI aparte, de bajo riesgo, no incluido aquí para mantener el diff pequeño.
- No se cambió `estadoVerificacion` en `makeInventory.js` — solo se actualizó el eje de integración de código (`makeAppIntegrationMap.js`), que es un eje independiente y siempre lo ha sido desde el Paso 07A.

## Cobertura de tests

**Worker (`worker-reservas/src/baja-jugador.test.mjs`, 9 tests nuevos):** 503 sin webhook configurado (sin llamar a `fetch`), 405 método no permitido, 400 JSON inválido, 400 validación de campos, payload reenviado con `accion:"baja_jugador"` correcto, nunca confirma éxito si Make responde con error (502), gate de rol bloquea sin token (401) antes de llegar al handler, OPTIONS siempre 204, y una regresión explícita confirmando que Alta de Jugador sigue respondiendo igual que antes.

**No se añadió un test de renderizado de React** para la pestaña de Baja: este repositorio no tiene infraestructura de render de componentes (`@testing-library/react`/jsdom no están instalados — verificado en `package.json`). La convención ya establecida en el proyecto es extraer lógica pura a módulos planos testeables con `node --test` (como `rbac.js`, `makeCentroTecnicoLogic.js`); el formulario de Baja, igual que el de Alta (que tampoco tiene tests propios), vive dentro del componente JSX. La garantía de "no visible a PLAYER" se hereda estructuralmente de los tests de RBAC ya existentes, no de un test nuevo.

**Datos (`src/data/makeAppIntegrationMap.test.mjs`, actualizado):** confirma que Baja de Jugador pasa a `grupo: "A"`, `integradoEnApp: true`, `integradoEnWorker: true`, pero `requiereMakeManual: true` con `bloqueadorPrincipal` mencionando explícitamente el webhook pendiente — nunca se marca como confirmado end-to-end.
