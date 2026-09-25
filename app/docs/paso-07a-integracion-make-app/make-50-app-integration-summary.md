# Resumen — Integración App ↔ Make 50/50 (Paso 07A)

**Estado: AUDITORÍA TÉCNICA DE SOLO LECTURA.** No se ha ejecutado ningún escenario Make, no se ha llamado a Airtable, no se ha desplegado nada, no se ha tocado ninguna credencial. Ver `make-50-app-integration-map.md` (mismo directorio) para la tabla completa de los 50 escenarios.

**Fecha:** 2026-07-19
**Objetivo de este documento:** separar, con evidencia de código, qué de los 50 flujos Make está realmente conectado a la app/Worker, y qué existe solo como inventario/documentación — no si funcionan de extremo a extremo (eso depende de Airtable, ya auditado y bloqueado por separado).

---

## Distribución de los 50 flujos por grupo de integración

| Grupo | Descripción | Cantidad | % |
|---|---|---|---|
| **A** | Integrado en app y Worker/API | 2 | 4% |
| **B** | Integrado en app pero no confirmado en Worker/API | 0 | 0% |
| **C** | Integrado solo en Centro Técnico/inventario/documentación | 1 | 2% |
| **D** | Flujo Make autónomo sin disparador directo desde app | 35 | 70% |
| **E** | Sin integración visible detectada | 12 | 24% |
| **Total** | | **50** | **100%** |

**Duplicados detectados:** 0 (verificado programáticamente: 50 `id` únicos, 50 `nombre` únicos).

## Hallazgo principal

**Solo 2 de los 50 escenarios Make (4%) tienen una conexión de código verificable, de extremo a extremo, desde un formulario/botón de la app hasta un webhook de Make dedicado:** API Reservas y Alta de Jugador. Son, no por casualidad, los únicos 2 escenarios que el propio inventario ya clasificaba bajo la categoría `APP_TRIGGERED` — la auditoría de código de esta sesión confirma que esa clasificación previa era correcta y completa: no hay ningún tercer escenario "APP_TRIGGERED" oculto que se nos escapara.

Los 35 escenarios del Grupo D no son un fallo — la mayoría (SCHEDULED, TECHNICAL_MONITORING, o disparados por un canal externo como Stripe/WhatsApp/Telegram/Tally) **no deberían** tener un trigger de app por diseño. El Grupo E (12 escenarios) es el que merece atención: son flujos cuyo nombre sugiere claramente una acción de usuario dentro del dominio de la app (torneos, ranking, jugadores, encuestas, lista de espera) pero para los que no se encontró ningún código — ni botón, ni formulario, ni endpoint, ni referencia — que los dispare.

## Grupo E — sin integración visible detectada (12, el grupo de mayor interés para planificación futura)

| Escenario | Módulo app relacionado | Observación |
|---|---|---|
| 🏆 Cruces de Torneo | Torneos (sin wiring confirmado) | Módulo existe en nav, cero wiring a este escenario |
| 🏅 Resultados y Clasificación | Ranking (sin wiring confirmado) | Módulo existe en nav, cero wiring a este escenario |
| 🏆 Reto 04 + Puntos | Torneos/Ranking (sin wiring confirmado) | Gamificación, cero código relacionado |
| 🏟️ Cierre Temporal de Pistas | Gestión/Reservas (sin wiring confirmado) | `estadoVerificacion: confirmado`, pero sin trigger de app — ver nota metodológica |
| ❌ Baja de Jugador + Promoción | ninguno detectado | Solo existe Alta (Grupo A); no hay contraparte de baja |
| 💰 Facturación y Cobro | ninguno detectado | Sin Stripe integrado en esta rama (confirmado en auditoría maestra previa) |
| 💬 Chatbot Web Reservas | ninguno detectado | `estadoVerificacion: confirmado`, cero widget de chat en la UI |
| 🔑 Email Recuperación de Contraseña SaaS | Auth (flujo real distinto) | El flujo real usa Supabase directo, no este escenario Make — ver detalle abajo |
| 🏷️ Confirmación Inscripción Torneo | Torneos (sin wiring confirmado) | Mismo hueco que Cruces de Torneo |
| 📋 Gestión Lista de Espera | Reservas (sin wiring confirmado) | Sin UI de lista de espera detectada — hueco relevante, Reservas es módulo central |
| 🎁 Programa de Referidos | ninguno detectado | Cero código de referidos |
| ⭐ Encuesta Post-Partido | ninguno detectado | Cero código de encuesta/NPS |

## API Reservas — detalle

- **La app llama correctamente al Worker:** sí, verificado. `CONFIG.bookingEndpoint` (por defecto `/api/reservas`) se usa en los componentes `Reservas`, `ReprogramarReserva` y `CancelarReserva` (`src/App.jsx`), vía `authFetch`/`fetch`.
- **El Worker forwardea a Make:** sí, verificado. `worker-reservas/src/index.js` línea ~1023 llama `forwardToMake(normalizedPayload, env)`, que usa `env.MAKE_RESERVAS_WEBHOOK` (línea ~488-493).
- **El fallo conocido no es de integración app↔Worker↔Make:** confirmado — es Airtable. Esto ya estaba documentado por evidencia real de una sesión anterior (Paso 05D): el Worker respondió 200, Make recibió el payload y lo enrutó correctamente (3 operaciones consumidas, no 1), y el error ocurrió específicamente en el módulo de búsqueda de Airtable (`RuntimeError RateLimitError [429]`). Esta auditoría **no repitió esa prueba** — solo confirmó, leyendo el código, que el camino de integración que aquella prueba recorrió sigue existiendo intacto hoy.

## Control Acceso QR — detalle

- **Integración visible desde app/QR/panel:** **no encontrada.** Búsqueda exhaustiva (`grep -rniE "\bqr\b"`) sobre todo `src/` y `worker-reservas/src/index.js`: cero resultados fuera del propio nombre del escenario en `makeInventory.js`. No existe ningún componente, botón, formulario, endpoint ni variable de entorno relacionada con QR en el código de esta rama.
- **¿Qué significa `qrGenerados: 24` que aparece en `App.jsx`?** Es un campo de datos de demostración fijo dentro de un objeto de métricas del panel Admin (junto a `makeErrores`, `makePausados`, `tasaExitoMake`, `ultimoBackup`) — no proviene de ninguna llamada real, es un valor estático de UI.
- **Validación funcional pendiente:** confirmado que sigue pendiente — no solo a nivel de prueba end-to-end (que ya se sabía, por el bloqueo de Airtable), sino que **no hay ningún camino de código app→Worker→Make para este escenario todavía**, a diferencia de API Reservas. Clasificado Grupo D (se infiere un disparador externo — probablemente un lector físico de control de acceso — no la app), pero esto es una inferencia por nombre/categoría, no una confirmación de código.
- No se ejecutó ninguna prueba real, no se llamó a Airtable ni a Make.

## Alta de Jugador — detalle

- **Formularios/botones/endpoints relacionados:** sí, existen y están conectados. Componente `AltaJugador()` en `src/App.jsx` (línea ~4781) con formulario real, que llama `authFetch("/api/jugadores/alta", ...)` (línea ~4862).
- **Confirmación en Worker:** el Worker expone la ruta `/api/jugadores/alta` y forwardea usando `env.MAKE_ALTA_JUGADOR_WEBHOOK` — un webhook de Make **dedicado y distinto** del de reservas, confirmado por lectura directa del código.
- **Clasificación:** Grupo A — integrado en app y Worker/API, igual que API Reservas. Es el único otro escenario, junto con API Reservas, con esta doble confirmación.

## Baja de Jugador — detalle

- **Diferencia con Alta:** clara y confirmada. No existe ningún equivalente de "baja" en el código: búsqueda de `baja_jugador`, `BajaJugador`, `bajaJugador` sobre `src/App.jsx` y `worker-reservas/src/index.js` — cero resultados en ambos. Solo el Alta tiene contraparte de código; la Baja (escenario `❌ Baja de Jugador + Promoción` en el inventario) existe únicamente como fila de Make, sin ningún camino de app.
- **Clasificación:** Grupo E — sin integración visible detectada.

---

## Verificaciones de seguridad de esta auditoría

- **Airtable llamado:** no.
- **Make llamado/ejecutado:** no.
- **Endpoints reales invocados:** no — toda la evidencia de "integración confirmada" proviene de lectura estática de código (nombres de función, rutas, variables de entorno), nunca de una llamada de red real durante esta auditoría.
- **Credenciales tocadas:** no — solo se referenciaron nombres de variables de entorno (`MAKE_RESERVAS_WEBHOOK`, `MAKE_ALTA_JUGADOR_WEBHOOK`, `AIRTABLE_TOKEN`), nunca sus valores.
- **PR #36:** sin tocar, sigue en draft.

## Conclusión

De los 50 flujos Make, **2 (4%) están genuinamente integrados app↔Worker↔Make** (API Reservas, Alta de Jugador), **1 (2%) tiene infraestructura relacionada real aunque sin wiring específico confirmado** (Notificación Push PWA), **35 (70%) son autónomos por diseño o dependen de un canal externo distinto de la app** (cron, Stripe, WhatsApp, Telegram, dispositivos QR, formularios externos), y **12 (24%) son huecos reales de integración** — flujos que el dominio de la app sugiere que deberían dispararse desde ella, pero para los que no se encontró ningún código. Ningún flujo se marca como "funcional" solo por estar `confirmado` en Make: esta auditoría demuestra que `confirmado` (auditoría de Make) y "conectado a la app" son cosas distintas — 3 escenarios `confirmado` (Cierre Temporal de Pistas, Chatbot Web Reservas, Email Recuperación de Contraseña SaaS) no tienen ningún trigger de app detectado.
