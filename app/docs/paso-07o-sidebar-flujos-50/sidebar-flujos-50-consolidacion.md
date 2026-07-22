# Auditoría y consolidación de módulos sidebar para flujos Make 50/50 (Paso 07O)

**Fecha:** 2026-07-20
**Continuación de:** Paso 07N (`docs/paso-07n-lista-espera-sidebar/`, primer módulo "visual preparado sin Worker" — Lista de Espera).

---

## Objetivo

Auditar los 50 flujos del inventario Make y añadir al sidebar la mayor cantidad posible de módulos útiles, seguros y coherentes, sin saturar la navegación ni tocar/romper nada de lo ya validado en `localhost:5175`.

## Entorno

- **Puerto oficial:** `localhost:5175`
- **Worktree correcto:** `/root/cp04-t-frontend-fixes`
- **Rama:** `frontend/audit-fixes-20260709`
- **HEAD antes de este paso:** `51a4856` (Paso 07N)
- **PR #36:** OPEN / draft / MERGEABLE (verificado antes y después de este paso).

## Módulos evaluados (auditoría de los 50 flujos)

Se revisó `src/data/makeAppIntegrationMap.js` completo (50 entradas) buscando candidatos por los términos del encargo (QR, acceso, recordatorio, no-show, incidencia, backup, logs, errores, webhooks, KPI, dashboard, NPS, encuesta, promoción, pista libre, facturación, pagos, Stripe, WhatsApp, Gmail, Calendar, contenido, RRSS, alerta crítica). Clasificación resultante:

| Flujo(s) | ¿Ya tiene módulo? | Decisión | Motivo |
|---|---|---|---|
| 🔐 Control Acceso QR, 🔑 Generación QR Acceso | No | **Módulo directo: "Control QR / Accesos"** | Operación diaria real (acceso físico al club), sin solapar con nada existente |
| 🚨 Alerta Pistas Libres, 🔔 Recordatorio 24h, ⚡ Recordatorio 2h, 🚫 Seguimiento No-Show | No | **Módulo agrupado: "Pistas libres y recordatorios"** | 4 flujos temáticamente unidos (comunicación proactiva a jugadores) — un solo item de sidebar en vez de 4 |
| 📋 Dashboard Ejecutivo Diario, 📊 Panel KPI Semanal, 📊 Informe Mensual, 📊 Análisis NPS Semanal | No | **Módulo agrupado: "Dashboard KPI y NPS"** | Métricas de negocio, relevantes solo para ADMIN/SUPPORT |
| ⭐ Encuesta Post-Partido | No | **NO añadido** | Hallazgo del Paso 07B: 89% de tasa de error histórica en Make — integrar su UI ahora propagaría un flujo roto. Sigue en Grupo E sin cambios. |
| 🔄 Backup Semanal, 🗂️ Backup Plantilla Drive, ⚖️ Solicitud GDPR, 🛡️ Alerta Seguridad Acceso Sospechoso | No | **Módulo agrupado: "Backups y seguridad"** | Infraestructura/seguridad, sin solapar con Centro Técnico (que audita Make, no backups/GDPR/seguridad de acceso) |
| 🗺️ Mapa de Flujos, ⚠️ Alerta Crítica Fallos Make, salud/errores por escenario | Sí (Centro Técnico) | **NO añadido como módulo nuevo** | Centro Técnico (Panel A3, "Salud de automatizaciones") ya cubre esto — un módulo nuevo duplicaría, contra la regla "no duplicar módulos ya existentes" |
| Logs de Worker/Make/Airtable/Stripe | Sí (Soporte) | **NO añadido** | `Soporte()` ya muestra `soporte.logs_worker/logs_validaciones/logs_errores/logs_alertas` — duplicaría |
| 💰 Facturación y Cobro, 💳 Pago Confirmado Stripe, 🔄 Dunning Stripe | No | **NO añadido** | Cero código de Stripe en esta rama (confirmado en auditorías previas: adapter Stripe aislado, `env NOT_CONFIGURED`). Añadir un módulo de "Facturación" ahora sería prometer una superficie sin ninguna integración real detrás, incluso visual — se prefiere abordarlo en un paso dedicado propio (mismo patrón que 07E/07N: un módulo nuevo por paso, no de pasada en una auditoría) |
| 🎧 Atención Socio WhatsApp FAQ, 🎯 Campaña Flash WhatsApp, 🤖 Bot IA Reservas WhatsApp | No | **NO añadido** | Sin integración de WhatsApp Business API en esta rama (mismo motivo que Stripe) |
| 📸 Instagram Borrador con IA | No | **NO añadido** | 1 ejecución histórica, sin urgencia operativa; candidato de baja prioridad para un futuro paso de "Contenido RRSS" |
| 🗓️ Sincronización Multi-Calendario, 📧 Monitor Prueba Gratuita, 🎁 Bienvenida/Referidos/Onboarding/Congelación Membresía, 🎂 Felicitación Cumpleaños, 💸 Escalado Impagos, 💳 Recordatorio Cuota | No | **NO añadido** | Ya clasificados como Grupo D "autónomo" en el Paso 07A/07B con decisión explícita de mantenerlos autónomos en Make (no son huecos, son funciones sin necesidad de disparo de app) — se respeta esa decisión previa |
| 💬 Chatbot Web Reservas, 🔑 Email Recuperación SaaS | No | **NO añadido** | Ya documentados como candidatos a archivar/redundantes en el Paso 07B (0 ejecuciones / redundante con Supabase real) |
| 🤖 Bot IA Reservas Telegram, 📝 Tally → API Reservas | No | **NO añadido** | Grupo D, sin urgencia operativa, sin relación con el trabajo de este bloque |

## Módulos añadidos al sidebar (4 nuevos)

| Módulo | Icono | Ubicación en sidebar | Roles | Escenarios Make agrupados |
|---|---|---|---|---|
| **Control QR / Accesos** | 🔐 | Tras "Lista de espera" | STAFF, ADMIN, SUPPORT | 5291559, 6244975 |
| **Pistas libres y recordatorios** | 🔔 | Tras "Control QR / Accesos" | STAFF, ADMIN, SUPPORT | 5736472, 4942506, 5736463, 5736797 |
| **Dashboard KPI y NPS** | 📈 | Tras "Admin" | ADMIN, SUPPORT (no STAFF) | 5736800, 5736468, 5791119, 5811901 |
| **Backups y seguridad** | 🗂️ | Tras "Dashboard KPI y NPS" | ADMIN, SUPPORT (no STAFF) | 6217724, 6216523, 6323457, 6323450 |

**Orden final del sidebar:** Inicio → Reservar → Alta de jugador → Baja de jugador → Reprogramar reserva → Cancelar reserva → Reservas → Cierre temporal → Lista de espera → **Control QR/Accesos** → **Pistas libres y recordatorios** → Torneos → Ranking → Comunidad → Admin → **Dashboard KPI y NPS** → **Backups y seguridad** → Centro técnico → Soporte → Perfil.

Se evitó saturar la navegación agrupando 12 de los 14 escenarios integrados en solo 3 módulos (Pistas libres y recordatorios agrupa 4; Dashboard KPI y NPS agrupa 4; Backups y seguridad agrupa 4) — solo Control QR/Accesos y los 3 módulos ya existentes de pasos anteriores (Cierre Temporal, Lista de Espera) son de 1-2 escenarios. Total: 4 nuevos items de sidebar (no 14), consistente con "no añadir 50 módulos uno por uno".

## Roles resultantes por sidebar

- **PLAYER:** Inicio, Reservar, Torneos, Ranking, Comunidad, Perfil — sin cambios, cero módulos de gestión.
- **STAFF:** todo lo anterior de PLAYER en su ámbito + Alta/Baja de jugador, Reprogramar, Cancelar, Reservas, Cierre temporal, Lista de espera, **Control QR/Accesos**, **Pistas libres y recordatorios** — sin Dashboard KPI/NPS ni Backups/Seguridad (no los necesita para su operación diaria).
- **ADMIN:** todo lo de STAFF + Ranking + Admin + **Dashboard KPI y NPS** + **Backups y seguridad**.
- **SUPPORT:** todo lo de ADMIN + Centro Técnico + Soporte.

## Pantallas nuevas creadas

Los 4 módulos comparten dos componentes reutilizables nuevos (evitando duplicar lógica 4 veces):

- `IntegrationStatusBanner`: banner de estado honesto (mismo patrón visual ya usado en Cierre Temporal/Lista de Espera).
- `PreparedActionButtons`: gestiona el estado de "acción preparada" — cada botón, al pulsarse, solo actualiza un mensaje local: *"[Acción]: Acción preparada. Pendiente de conexión real cuando Make/Airtable esté disponible."* **Nunca llama a `fetch`/`authFetch`, nunca crea/modifica/elimina nada real.**

Cada pantalla incluye: título, subtítulo, banner de estado, lista de los escenarios Make relacionados (con nota de que siguen corriendo de forma autónoma en Make, sin ser disparados por este panel) y sus acciones preparadas.

## Estados de integración honestos usados

- **Control QR / Accesos:** "Preparado visualmente. Pendiente de activación Make."
- **Pistas libres y recordatorios / Dashboard KPI y NPS:** "Preparado visualmente. Validación real pendiente por disponibilidad de Airtable (429)."
- **Backups y seguridad:** "Preparado visualmente. Pendiente de validación real / credenciales externas."

Ninguno afirma "confirmado end-to-end", ninguno simula éxito real.

## Actualización de `makeAppIntegrationMap.js`

Los 14 escenarios de los 4 módulos nuevos pasan de **Grupo D** (autónomo Make, sin trigger de app) a **Grupo B** (`APP_SIN_WORKER`): `integradoEnApp: true`, `integradoEnWorker: false` (sigue sin existir ningún endpoint real en el Worker), `soloInventariado: false`, `requiereMakeManual: true`, con `bloqueadorPrincipal` documentando honestamente "UI preparada (Paso 07O) sin Worker/endpoint real" + el bloqueador original (Airtable 429 o "ninguno detectado", según cada caso). **Ninguno se marcó como confirmado end-to-end ni se movió a Grupo A** (reservado a flujos con handler real en el Worker).

**⭐ Encuesta Post-Partido (5736466) se mantiene explícitamente en Grupo E**, sin tocar, con test dedicado que confirma que sigue así — respetando la decisión ya documentada en el Paso 07B de no reactivar este flujo hasta diagnosticar su 89% de error en Make.

Distribución final de los 50 escenarios: Grupo A = 4 (sin cambios), **Grupo B = 15** (1 de Lista de Espera + 14 nuevos), Grupo C = 1 (sin cambios), **Grupo D = 21** (era 35, -14), Grupo E = 9 (sin cambios).

## Qué queda visual/preparado vs. qué queda bloqueado

**Preparado:**
- 4 módulos nuevos en sidebar, con acceso por rol correcto.
- Acciones visuales (7 botones en total entre los 4 módulos) — ninguna real.
- Mapa de integración actualizado de forma honesta.

**Bloqueado por Airtable 429:** Pistas libres y recordatorios, Dashboard KPI y NPS (documentado explícitamente en su banner y en `bloqueadorPrincipal`).

**Pendiente de credenciales externas:** Backups y seguridad (backups a Google Drive, verificación de solicitudes GDPR) — no requiere Airtable específicamente, pero tampoco tiene ningún endpoint ni credencial configurada.

**Pendiente de validación real:** los 14 escenarios en conjunto — ninguno se ha probado contra Make/Airtable real; `estadoVerificacion` en `makeInventory.js` (eje independiente) no se tocó para ninguno.

## Confirmaciones

- **Make:** no tocado, no ejecutado ningún escenario.
- **Airtable:** no tocado, no llamado.
- **Stripe / WhatsApp / Gmail / Calendar:** no tocados — no existe integración de ninguno en esta rama, y este paso no la introduce.
- **Endpoints reales:** ninguno llamado. No se creó ningún endpoint nuevo en el Worker (los 4 módulos son deliberadamente Grupo B, sin Worker).
- **Datos reales:** ninguno creado, modificado ni eliminado.

## Verificación de que nada se rompió

Se confirmó por código/tests que siguen intactos: Login con correo personal y botón "Iniciar sesión", Alta de Jugador, Baja de Jugador y su botón "Solicitar baja de jugador" (clase `cp04-offboarding-submit-button` sin tocar), Reprogramar Reserva (sidebar y pantalla), Cancelar Reserva, Cierre Temporal de Pistas, Lista de Espera, Reservas, Torneos, Ranking, Comunidad, Admin, Centro Técnico (sigue exclusivo de SUPPORT, `CP04_SUPPORT_ONLY_SECTIONS` sin tocar), Soporte, Perfil y ajustes.

Confirmado ejecutando la suite completa: **343 tests frontend** (334 previos + 9 nuevos: 4 de RBAC para los 4 módulos + 5 netos de `makeAppIntegrationMap.test.mjs`, incluyendo la actualización de un test obsoleto sobre "Control Acceso QR") y **124 tests Worker** (sin cambios, Worker no tocado), todos verdes. Build y lint sin errores nuevos (mismos 5 preexistentes).

## Pendiente

Validación visual manual final en `localhost:5175` con los 4 roles: confirmar que PLAYER sigue con su sidebar limpio, que STAFF ve los módulos operativos (incluidos los 2 nuevos), que ADMIN ve además Dashboard KPI/NPS y Backups/Seguridad, y que SUPPORT ve todo lo anterior más Centro Técnico/Soporte — sin regresión visual en ninguno de los módulos ya validados en pasos previos.
