# Ampliación segura de módulos sidebar para los flujos Make restantes (Paso 07P)

**Fecha:** 2026-07-20
**Continuación de:** Paso 07O (`docs/paso-07o-sidebar-flujos-50/`, primeros 4 módulos agrupados: Control QR/Accesos, Pistas libres y recordatorios, Dashboard KPI y NPS, Backups y seguridad).

---

## Objetivo

Auditar los flujos Make que aún no tenían módulo/pantalla/agrupación clara en la app y añadir la máxima representación útil posible en el sidebar, sin saturar la navegación, sin tocar integraciones reales y sin romper `localhost:5175`.

## Entorno

- **Puerto oficial:** `localhost:5175`
- **Worktree correcto:** `/root/cp04-t-frontend-fixes`
- **Rama:** `frontend/audit-fixes-20260709`
- **HEAD antes de este paso:** `c053eef` (Paso 07O)
- **PR #36:** OPEN / draft / MERGEABLE (verificado antes y después de este paso).

## Punto de partida (verificado en código, no en el encargo)

El encargo partía de la premisa "19/50 representados, 31 restantes". Se verificó contra `src/data/makeAppIntegrationMap.js` con una consulta programática: el estado real antes de este paso era **20/50 representados** (Grupo A=4, B=15, C=1) y **30/50 restantes** (Grupo D=21, E=9) — un desajuste de 1 respecto a la premisa, probablemente por un pequeño error de recuento manual en el encargo. Se documenta aquí la cifra real verificada en lugar de arrastrar la cifra del encargo sin comprobar.

## Flujos restantes auditados (30)

Se revisaron los 30 escenarios en Grupo D/E, clasificándolos contra las 7 categorías candidatas del encargo (Comunicaciones, Marketing/RRSS, Facturación, Calendario, Automatizaciones internas, Auditoría/errores, Clientes/socios).

## Módulos añadidos (4 nuevos, agrupando 20 escenarios)

| Módulo | Icono | Roles | Escenarios agrupados (9+4+2+5=20) |
|---|---|---|---|
| **Comunicaciones y ciclo de socio** | 💌 | STAFF, ADMIN, SUPPORT | 5736470 Reactivación Inactivos 30d, 5811864 Felicitación Cumpleaños, 5791032 Recordatorio Cuota Mensual, 5750308 Monitor Prueba Gratuita, 5812456 Congelación+Reactivación Membresía, 5791022 Bienvenida Nuevo Socio, 5811918 Onboarding Secuencial, 5812297 Programa de Referidos, 5791128 Emparejamiento Sin Pareja |
| **Calendario y disponibilidad** | 🗓️ | STAFF, ADMIN, SUPPORT | 5735907 Sincronización Multi-Calendario, 5799041 Predicción Ocupación |
| **Facturación y pagos** | 💳 | ADMIN, SUPPORT (no STAFF) | 5733370 Facturación y Cobro, 6323441 Pago Confirmado Stripe, 6335117 Dunning Cobro Recurrente Stripe, 5811888 Escalado Impagos |
| **Automatizaciones y bots** | 🤖 | ADMIN, SUPPORT (no STAFF) | 5799031 Atención Socio WhatsApp FAQ, 5791124 Campaña Flash WhatsApp, 5798996 Bot IA Reservas WhatsApp, 4832095 Bot IA Reservas Telegram, 5747703 Tally → API Reservas |

**Ubicación en sidebar:** Comunicaciones y ciclo de socio + Calendario y disponibilidad tras "Pistas libres y recordatorios"; Facturación y pagos + Automatizaciones y bots tras "Backups y seguridad".

## Módulos existentes ampliados

Ninguno — los 4 módulos del Paso 07O (Control QR/Accesos, Pistas libres y recordatorios, Dashboard KPI y NPS, Backups y seguridad) no recibieron escenarios adicionales en este paso; se prefirió crear 4 módulos nuevos y bien delimitados en vez de sobrecargar los ya existentes con temas distintos.

## Módulos NO añadidos (10 escenarios) y motivo

| Flujo | Categoría | Motivo de no añadir |
|---|---|---|
| ⚠️ Alerta Crítica Fallos Make (6299114) | D — solo Centro Técnico/Soporte | Ya cubierto por Centro Técnico (Panel A3, "Salud de automatizaciones"); añadir un módulo nuevo duplicaría |
| 🗺️ Mapa de Flujos (6233755) | D — solo Centro Técnico/Soporte | Mismo motivo — es meta-información de Make, terreno de Centro Técnico |
| 🏷️ Confirmación Inscripción Torneo (5791116) | E — riesgo/decisión pendiente | Requiere el rediseño completo del módulo Torneos (sin backend real hoy), ya señalado como pendiente en el Paso 07B |
| 🏆 Cruces de Torneo (4919937) | E | Mismo motivo — rediseño de Torneos |
| 🏅 Resultados y Clasificación (5330078) | E | Mismo motivo — rediseño de Torneos |
| 🏆 Reto 04 + Puntos (5791374) | E | Sin diseño de producto de gamificación detrás (decisión ya tomada en el Paso 07B: "no por ahora") |
| ⭐ Encuesta Post-Partido (5736466) | E | 89% de tasa de error histórica en Make (hallazgo del Paso 07B, ya respetado también en el Paso 07O) — integrar su UI ahora propagaría un flujo roto |
| 💬 Chatbot Web Reservas (5799061) | E | Ya documentado como candidato a archivar (0 ejecuciones históricas, sin relación con código de app) |
| 🔑 Email Recuperación de Contraseña SaaS (6323445) | E | Redundante con el flujo real de recuperación de contraseña (Supabase directo) — ya documentado como candidato a archivar |
| 📸 Instagram Borrador con IA (6335114) | D — Marketing/RRSS | 1 sola ejecución histórica, sin urgencia operativa; ya evaluado y diferido en el Paso 07O; se mantiene diferido en vez de forzar un módulo de "Marketing y RRSS" para un único flujo de baja prioridad |

## Total de flujos representados tras 07P

- **Grupo A (app+Worker):** 4 — sin cambios.
- **Grupo B (app sin Worker):** 35 — 1 de Lista de Espera (07N) + 14 de 07O + 20 de este paso.
- **Grupo C (solo Centro Técnico):** 1 — sin cambios.
- **Grupo D (autónomo Make):** 3 — Alerta Crítica Fallos Make, Mapa de Flujos, Instagram Borrador con IA.
- **Grupo E (sin integración):** 7 — los 7 restantes de la tabla de arriba.

**Total representados (A+B+C): 40/50.** **Total pendientes (D+E): 10/50.** Se alcanzó el rango superior del objetivo cuantitativo (35-40/50) sin forzar módulos falsos, duplicados ni peligrosos — los 10 restantes tienen, cada uno, un motivo explícito documentado para no integrarse todavía.

## Roles por módulo (sidebar completo tras 07P)

- **PLAYER:** Inicio, Reservar, Torneos, Ranking, Comunidad, Perfil — sin cambios, sigue sin ningún módulo interno.
- **STAFF:** todo lo de PLAYER en su ámbito + Alta/Baja de jugador, Reprogramar, Cancelar, Reservas, Cierre temporal, Lista de espera, Control QR/Accesos, Pistas libres y recordatorios, **Comunicaciones y ciclo de socio**, **Calendario y disponibilidad** — sigue sin Dashboard KPI/NPS, Backups/Seguridad, Facturación/Pagos ni Automatizaciones/Bots (no son operación diaria de recepción).
- **ADMIN:** todo lo de STAFF + Ranking + Admin + Dashboard KPI y NPS + Backups y seguridad + **Facturación y pagos** + **Automatizaciones y bots**.
- **SUPPORT:** todo lo de ADMIN + Centro Técnico + Soporte.

## Estados de integración honestos

- **Comunicaciones y ciclo de socio / Calendario y disponibilidad:** "Preparado visualmente. Validación real pendiente por disponibilidad de Airtable (429)."
- **Facturación y pagos:** "Preparado visualmente. Pendiente de integración real con Stripe — no ejecuta pagos ni cobros reales todavía."
- **Automatizaciones y bots:** "Preparado visualmente. Pendiente de integración real con WhatsApp Business API, Telegram Bot API y Tally — no envía mensajes reales todavía."

Ninguno afirma "confirmado end-to-end", ninguno simula éxito real, ninguno ejecuta pagos/mensajes/eventos reales.

## Actualización de `makeAppIntegrationMap.js`

Los 20 escenarios pasan de Grupo D/E a **Grupo B** (`APP_SIN_WORKER`): `integradoEnApp: true`, `integradoEnWorker: false` (sin Worker real), `soloInventariado: false`, `requiereMakeManual: true`, con `bloqueadorPrincipal` documentando el bloqueador original + "UI preparada (Paso 07P)" + la dependencia externa específica (Stripe / WhatsApp / Telegram / Airtable 429 / decisión humana según cada caso). **Ninguno se marcó como confirmado end-to-end ni se movió a Grupo A.**

## Confirmaciones

- **Make:** no tocado, no ejecutado ningún escenario.
- **Airtable:** no tocado, no llamado.
- **Stripe:** no tocado, no llamado — documentado explícitamente como "pendiente de integración real" en el módulo Facturación y pagos.
- **WhatsApp:** no tocado, no llamado — documentado como "pendiente de integración real" en Automatizaciones y bots.
- **Gmail / Calendar:** no tocados, no llamados — no existe integración real de ninguno en esta rama.
- **Endpoints reales:** ninguno llamado. No se creó ningún endpoint nuevo en el Worker.
- **Datos reales / pagos reales / mensajes reales / eventos reales:** ninguno creado o ejecutado.

## Verificación de que nada se rompió

Se confirmó por código/tests que siguen intactos: Login con correo personal y botón "Iniciar sesión", Alta de Jugador, Baja de Jugador y su botón "Solicitar baja de jugador", Reprogramar Reserva, Cancelar Reserva, Reservas, Cierre Temporal de Pistas, Lista de Espera, Control QR/Accesos, Pistas libres y recordatorios, Dashboard KPI y NPS, Backups y seguridad, Torneos, Ranking, Comunidad, Admin, Centro Técnico (sigue exclusivo de SUPPORT), Soporte, Perfil y ajustes.

Confirmado ejecutando la suite completa: **353 tests frontend** (343 previos + 10 nuevos: 4 de RBAC para los 4 módulos + 6 de `makeAppIntegrationMap.test.mjs`) y **124 tests Worker** (sin cambios, Worker no tocado), todos verdes. Build y lint sin errores nuevos (mismos 5 preexistentes).

## Pendiente

Validación visual manual final en `localhost:5175` con los 4 roles: confirmar que PLAYER sigue con su sidebar limpio, que STAFF ve los 2 módulos operativos nuevos (Comunicaciones/Calendario) sin ver los 2 de gestión (Facturación/Bots), y que ADMIN/SUPPORT ven los 4 módulos nuevos completos — sin regresión visual en ninguno de los módulos ya validados en pasos previos (07A-07O).
