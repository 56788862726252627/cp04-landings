# Checkpoint global — Pasos 07A a 07Q (Paso 07R)

**Estado: DOCUMENTO DE CHECKPOINT. No se tocó código, Worker, Make, Airtable, Stripe, WhatsApp, Gmail ni Calendar al redactar este documento.**

**Fecha:** 2026-07-20
**Rango cubierto:** Paso 07A (mapa de integración inicial) → Paso 07Q (runbook de pruebas post-Airtable).

---

## A) Estado ejecutivo

- **PR #36:** OPEN / draft / MERGEABLE.
- **Base:** `release/staging-club-padel-04-2026-07-15`.
- **Head:** `frontend/audit-fixes-20260709`.
- **Puerto visual oficial:** `localhost:5175`.
- **Worktree oficial:** `/root/cp04-t-frontend-fixes`.
- **HEAD verificado en este checkpoint:** `731df78` (Paso 07Q).
- **Flujos Make representados en app (verificado en código, no estimado):** **40/50** (Grupo A=4, B=35, C=1).
- **Flujos Make sin representación (D+E):** **10/50**, cada uno con motivo documentado (ver sección D).
- **Bloqueo principal activo:** Airtable HTTP 429 / `PUBLIC_API_BILLING_LIMIT_EXCEEDED` — impide toda validación real end-to-end desde hace varios pasos (documentado desde el Paso 06C).
- **No hay merge, deploy, ni PR marcada como ready** en ningún momento de este rango. Este checkpoint tampoco los realiza.

## B) Resumen por bloques

### Worker/API

- **Caché de disponibilidad:** `caches.default` de Cloudflare Workers (Paso 06D), sin binding nuevo, deduplica reintentos.
- **Modo degradado Airtable 429** (Paso 06C): detecta `status === 429` o `PUBLIC_API_BILLING_LIMIT_EXCEEDED`/`RateLimitError` en el cuerpo, y responde de forma degradada uniforme en vez de fingir éxito.
- **Idempotencia** (Paso 06D): clave derivada de campos identificativos para `crear_reserva`/`reprogramar_reserva`/`cancelar_reserva`, con huella corta (`idempotencyKeyHash`) que nunca expone la clave completa en logs.
- **Observabilidad:** logging/request-id/correlation-id/redacción documentados en pasos anteriores a este rango (Observability Runtime Fase 1-4, ver memoria de sesiones previas) — no se tocó en 07A-07Q.
- **Endpoints reales con handler propio en el Worker:** `POST /api/reservas` (crear/reprogramar/cancelar/consultar), `GET/POST /api/disponibilidad`, `POST /api/jugadores/alta`, `POST /api/jugadores/baja`, `POST /api/pistas/cierre-temporal`. Ninguno de los módulos añadidos en 07N-07P tiene endpoint real — son deliberadamente Grupo B (app sin Worker).

### Make 50/50

- **Inventario:** 50 escenarios en `src/data/makeInventory.js`, sin cambios de contenido en este rango (solo se leyó, nunca se ejecutó ni se llamó a Make/Airtable).
- **Mapa de integración de código** (`src/data/makeAppIntegrationMap.js`): eje independiente de `estadoVerificacion` — mide si el código de la app dispara el escenario, no si Make lo verificó.
  - Grupo A (app + Worker real): 4 — API Reservas, Alta de Jugador, Baja de Jugador + Promoción, Cierre Temporal de Pistas.
  - Grupo B (app sin Worker, visual preparado): 35 — Lista de Espera (07N) + 14 (07O) + 20 (07P).
  - Grupo C (solo Centro Técnico): 1 — Notificación Push PWA.
  - Grupo D (autónomo Make, sin app): 3 — Alerta Crítica Fallos Make, Mapa de Flujos, Instagram Borrador con IA.
  - Grupo E (sin integración): 7 — ver sección D.
- **Ninguno confirmado end-to-end sin prueba real** — el runbook del Paso 07Q es precisamente el mecanismo para hacerlo cuando Airtable lo permita.

### Sidebar/app

- **Módulos preexistentes (antes de 07G):** Inicio, Reservar, Alta de jugador, Reprogramar reserva, Cancelar reserva, Reservas, Torneos, Ranking, Comunidad, Admin, Centro técnico, Soporte, Perfil.
- **Módulos añadidos en este rango:** Cierre temporal (07G), Baja de jugador con acceso directo (07I), Lista de espera (07N), Control QR/Accesos + Pistas libres y recordatorios + Dashboard KPI y NPS + Backups y seguridad (07O), Comunicaciones y ciclo de socio + Calendario y disponibilidad + Facturación y pagos + Automatizaciones y bots (07P).
- **Total de módulos de sidebar hoy:** 23 (ver sección C).

### Roles

- **PLAYER:** Inicio, Reservar, Torneos, Ranking, Comunidad, Perfil — sin ningún módulo de gestión, sin cambios en todo el rango 07A-07Q.
- **STAFF:** operación diaria completa (Alta/Baja de jugador, Reprogramar, Cancelar, Reservas, Cierre temporal, Lista de espera, Control QR/Accesos, Pistas libres y recordatorios, Comunicaciones y ciclo de socio, Calendario y disponibilidad) + Torneos/Comunidad/Perfil.
- **ADMIN:** todo lo de STAFF + Ranking, Admin, Dashboard KPI y NPS, Backups y seguridad, Facturación y pagos, Automatizaciones y bots.
- **SUPPORT:** todo lo de ADMIN + Centro Técnico + Soporte (únicas secciones SUPPORT-only, sin cambios desde antes de este rango).

### Login

- **Botón "Iniciar sesión":** corregido en el Paso 07K (regla CSS genérica anulaba su fondo lima en la pantalla de login/rol) — validado visualmente, intacto desde entonces.
- **Ver contraseña / Recuperar contraseña:** no tocados en ningún paso de este rango, verificados sin regresión en cada checkpoint posterior a 07K.

### Alta/Baja de jugador

- **Sidebar:** ambos con acceso directo propio desde el Paso 07I (mismo componente `AltaJugador()`, prop `initialModo`).
- **Título dinámico:** corregido en el Paso 07J (antes quedaba fijo en "Alta de jugador" al entrar en modo Baja).
- **Botón "Solicitar baja de jugador":** pasó por 3 iteraciones de fix (07J, 07K, 07L, 07M) hasta encontrar la causa raíz real específica de SUPPORT (regla CSS `cp04-module-admin` disparada porque el sidebar de SUPPORT siempre muestra "Centro técnico") — validado visualmente en los 3 roles autorizados (STAFF/ADMIN/SUPPORT) tras el Paso 07M.
- **Permisos:** STAFF/ADMIN/SUPPORT, PLAYER sin acceso — sin cambios desde 07C/07I.

### Cierre temporal

- UI validada visualmente (Paso 07E/07G/07H), sin Worker real para Make (`MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK` sin configurar) — responde 503 seguro, nunca confirma un cierre real.

### Lista de espera

- Módulo visual preparado (Paso 07N) — sin Worker/endpoint real, ninguna acción confirma una promoción real.

### Nuevos módulos hasta 40/50

- **Control QR / Accesos** (07O): 2 escenarios agrupados, solo visual.
- **Pistas libres y recordatorios** (07O): 4 escenarios agrupados, solo visual.
- **Dashboard KPI y NPS** (07O): 4 escenarios agrupados (excluye deliberadamente Encuesta Post-Partido por su 89% de error histórico), solo visual, ADMIN+SUPPORT.
- **Backups y seguridad** (07O): 4 escenarios agrupados, solo visual, ADMIN+SUPPORT.
- **Comunicaciones y ciclo de socio** (07P): 9 escenarios agrupados, solo visual.
- **Calendario y disponibilidad** (07P): 2 escenarios agrupados, solo visual.
- **Facturación y pagos** (07P): 4 escenarios agrupados, solo visual, ADMIN+SUPPORT, documentado "pendiente Stripe real".
- **Automatizaciones y bots** (07P): 5 escenarios agrupados, solo visual, ADMIN+SUPPORT, documentado "pendiente WhatsApp/Telegram real".

### Runbook post-Airtable

- Paso 07Q: `runbook-pruebas-reales-post-airtable.md` + `checklist-ejecucion-rapida.md` — 18 pruebas ordenadas, 6 payloads QA seguros, criterios de éxito/parada, matriz módulo/rol/flujo/riesgo. **Ningún comando se ha ejecutado.**

## C) Módulos actuales del sidebar por rol (23 módulos)

| Módulo | PLAYER | STAFF | ADMIN | SUPPORT |
|---|---|---|---|---|
| Inicio | ✅ | ✅ | ✅ | ✅ |
| Reservar | ✅ | ✅ | ✅ | ✅ |
| Alta de jugador | ❌ | ✅ | ✅ | ✅ |
| Baja de jugador | ❌ | ✅ | ✅ | ✅ |
| Reprogramar reserva | ❌ | ✅ | ✅ | ✅ |
| Cancelar reserva | ❌ | ✅ | ✅ | ✅ |
| Reservas (Gestión) | ❌ | ✅ | ✅ | ✅ |
| Cierre temporal | ❌ | ✅ | ✅ | ✅ |
| Lista de espera | ❌ | ✅ | ✅ | ✅ |
| Control QR / Accesos | ❌ | ✅ | ✅ | ✅ |
| Pistas libres y recordatorios | ❌ | ✅ | ✅ | ✅ |
| Comunicaciones y ciclo de socio | ❌ | ✅ | ✅ | ✅ |
| Calendario y disponibilidad | ❌ | ✅ | ✅ | ✅ |
| Torneos | ✅ | ✅ | ✅ | ✅ |
| Ranking | ✅ | ❌ | ✅ | ✅ |
| Comunidad | ✅ | ✅ | ✅ | ✅ |
| Admin | ❌ | ❌ | ✅ | ✅ |
| Dashboard KPI y NPS | ❌ | ❌ | ✅ | ✅ |
| Backups y seguridad | ❌ | ❌ | ✅ | ✅ |
| Facturación y pagos | ❌ | ❌ | ✅ | ✅ |
| Automatizaciones y bots | ❌ | ❌ | ✅ | ✅ |
| Centro Técnico | ❌ | ❌ | ❌ | ✅ |
| Soporte | ❌ | ❌ | ❌ | ✅ |
| Perfil y ajustes | ✅ | ✅ | ✅ | ✅ |

PLAYER nunca ve ningún módulo de gestión — verificado por tests en `rbac.test.mjs` para cada módulo añadido en este rango. Centro Técnico y Soporte siguen exclusivos de SUPPORT (ni siquiera ADMIN los recibe).

## D) Tabla Make/App

- **Total Make:** 50.
- **Representados en app:** 40 (Grupo A+B+C).
- **Pendientes:** 10 (Grupo D+E).

| Motivo de no representar | Escenarios |
|---|---|
| Duplicidad con Centro Técnico/Soporte | ⚠️ Alerta Crítica Fallos Make, 🗺️ Mapa de Flujos |
| Rediseño de Torneos pendiente | 🏷️ Confirmación Inscripción Torneo, 🏆 Cruces de Torneo, 🏅 Resultados y Clasificación |
| Riesgo de propagar un flujo roto | ⭐ Encuesta Post-Partido (89% de error histórico en Make) |
| Candidatos a archivar/redundantes | 💬 Chatbot Web Reservas, 🔑 Email Recuperación de Contraseña SaaS |
| Sin diseño de producto (gamificación) | 🏆 Reto 04 + Puntos |
| Baja prioridad (1 ejecución histórica) | 📸 Instagram Borrador con IA |

Ninguna integración externa (Stripe, WhatsApp, Telegram, Google Calendar) está activada — los módulos que las mencionan (Facturación y pagos, Automatizaciones y bots, Calendario y disponibilidad) son deliberadamente solo visuales y lo documentan explícitamente.

## E) Bloqueadores

- **Airtable 429 / `PUBLIC_API_BILLING_LIMIT_EXCEEDED`:** bloqueo activo para validación real end-to-end de cualquier flujo de escritura (Reservas, Alta/Baja de jugador, Cierre temporal), y para el resto de módulos preparados en 07N-07P.
- **Validación real E2E pendiente:** ningún escenario de los 40/50 representados se ha probado contra Make/Airtable real durante este rango — el runbook del 07Q existe precisamente para cuando esto se pueda hacer.
- **PR chain/gobernanza:** PR #36 sigue como único punto de entrada de este bloque, en draft desde su apertura; no se ha necesitado ninguna cadena adicional de PRs para 07A-07Q.
- **Credenciales externas pendientes:** `MAKE_BAJA_JUGADOR_WEBHOOK`, `MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK` (Worker), Stripe (Facturación y pagos), WhatsApp Business API + Telegram Bot API (Automatizaciones y bots), Google Calendar (Calendario y disponibilidad) — ninguna configurada en este rango.
- **Lint preexistente:** 5 errores + 1 warning, sin cambios desde antes del Paso 07G, no relacionados con ningún cambio de este rango (confirmado en cada paso).

## F) Qué NO hacer todavía

- No ejecutar pruebas reales contra Make/Airtable.
- No llamar a ningún endpoint real desde fuera de una sesión de pruebas autorizada.
- No tocar Make ni Airtable hasta que se confirme la renovación de cuota.
- No activar ni llamar a Stripe, WhatsApp o Telegram.
- No marcar ningún flujo como "funcionando en producción" sin la evidencia real que exige el runbook 07Q.
- No hacer merge, deploy, ni marcar PR #36 como ready — en ningún paso de este bloque se ha hecho, y este checkpoint tampoco lo hace.

## G) Siguiente paso cuando Airtable vuelva

1. Abrir `app/docs/paso-07q-pruebas-post-airtable-429/runbook-pruebas-reales-post-airtable.md` y su checklist rápida.
2. Verificar la cuota de Airtable con un sondeo de solo lectura (no 429).
3. Ejecutar las 18 pruebas en el orden documentado, usando exclusivamente los payloads QA con prefijo `QA_CP04_TEST_NO_BORRAR`/`QA_CP04_ELIMINAR`.
4. Parar de inmediato ante 429, 401/403, duplicados, o cualquier envío/dato real no deseado.
5. Registrar los resultados reales (IDs de ejecución de Make, capturas de Airtable) en un nuevo paso documental (p. ej. 07S).
6. Solo después de esa evidencia real, valorar si corresponde continuar hacia una eventual revisión de PR #36 fuera de draft — decisión que corresponde al propietario del proyecto, no a este checkpoint.

## H) Porcentajes actuales

- **Paso 07Q:** 100% (runbook completo y documentado, sin ejecutar).
- **Paso 07R:** 100% si este checkpoint se cierra sin incidencias (ver informe de cierre).
- **Fase Make 50/50 (código de integración de app):** ~97% — 40/50 representados + 10/50 con decisión explícita y documentada de no representar (ninguno queda "sin decisión").
- **Sidebar Make/App:** 40/50 = **80%** (cifra directa, verificada en código en este mismo checkpoint).
- **Club Pádel 04 producción real:** 99,4% — cifra de seguimiento del propietario del proyecto a nivel de programa, no derivada de este checkpoint; la brecha del 0,6% restante corresponde exactamente a la **falta de validación real end-to-end** de los 40/50 flujos representados, bloqueada por Airtable 429 (no a código pendiente de escribir).
- **Agencia IA global:** 91% — cifra de seguimiento del propietario del proyecto a nivel de programa más amplio (múltiples verticales/clientes), fuera del alcance verificable desde este worktree/rama; se reporta tal cual la mantiene el propietario, sin verificación independiente en esta sesión.

**Por qué Club Pádel 04 no está al 100%:** todo el código, UI, RBAC, documentación y runbook están completos y consistentes — lo único que falta es la prueba real contra Make/Airtable, imposible de completar mientras Airtable devuelva 429. En cuanto se renueve la cuota y se ejecute el runbook del Paso 07Q con resultado positivo, esta cifra puede cerrarse.

## I) Estimación recalibrada

- **Tiempo restante técnico real tras 07R:** bajo — el trabajo de construcción (UI, RBAC, mapa de integración, documentación) para este bloque está cerrado. Quedaría trabajo técnico solo si las pruebas reales (07Q) revelan un fallo a corregir.
- **Tiempo bloqueado por Airtable externo:** indeterminado — depende de cuándo el propietario del proyecto renueve o resuelva la cuota de Airtable; no es un tiempo que este equipo controle.
- **Horas estimadas para pruebas reales (ejecución del runbook 07Q completo):** 1-2 horas de trabajo enfocado (18 pruebas + verificación cruzada en Make/Airtable + limpieza de datos QA), asumiendo que no aparece ningún criterio de parada.
- **Horas estimadas para correcciones** (si el runbook revela algún fallo real): variable, entre 1 y 4 horas según la naturaleza del fallo — no estimable con precisión sin ejecutar primero las pruebas.
- **Horas estimadas para merge/deploy final:** 1 hora aproximadamente una vez que las pruebas reales confirmen éxito y el propietario del proyecto autorice explícitamente sacar PR #36 de draft — decisión de negocio, no técnica.
