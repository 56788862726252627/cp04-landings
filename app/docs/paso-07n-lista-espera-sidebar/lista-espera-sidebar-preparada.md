# Módulo visual "Lista de espera" en sidebar (Paso 07N)

**Fecha:** 2026-07-20
**Continuación de:** Paso 07M (`docs/paso-07m-fix-boton-baja-support/`, botón de Baja de Jugador ya validado en los 3 roles).

---

## Objetivo

Crear un módulo visual seguro de "Lista de espera" en la app/sidebar, preparado para integrarse con Make/Airtable cuando Airtable vuelva a estar disponible, sin llamar a ningún endpoint real ahora — cerrando la brecha entre el escenario Make "📋 Gestión Lista de Espera" (ID 5791113) y la app.

## Entorno

- **Puerto oficial:** `localhost:5175`
- **Worktree correcto:** `/root/cp04-t-frontend-fixes`
- **Rama:** `frontend/audit-fixes-20260709`
- **HEAD antes de este paso:** `baf0c41` (Paso 07M)
- **PR #36:** OPEN / draft / MERGEABLE (verificado antes y después de este paso, sin tocar base/head).

## Auditoría previa (qué ya existía)

Antes de este paso, "lista de espera" solo existía en dos lugares:

1. Un checkbox ya en producción dentro de **Baja de Jugador** (Paso 07C): `promocionar_siguiente_si_aplica` — "Promocionar al siguiente jugador en lista de espera, si aplica." Viaja en el payload real de Baja, sin cambios en este paso.
2. Una entrada de solo inventario en `src/data/makeAppIntegrationMap.js` / `makeInventory.js`: escenario Make 5791113 "📋 Gestión Lista de Espera", categoría `INTERNAL_OPERATION` (corre en Make cada hora, 466 ejecuciones históricas, 0 errores, `usaAirtable: true`), clasificado en **Grupo E** (sin integración de app), `soloInventariado: true`.

No existía ningún componente, permiso RBAC, ni entrada de sidebar para Lista de Espera antes de este paso — confirmado con búsqueda exhaustiva (`grep` de "lista de espera", "waitlist", "lista_espera", "promocionar", "siguiente jugador" en `src/` y `docs/`; las únicas coincidencias en `docs/auditoria53/` son capturas históricas de texto de blueprints de Make, no código de la app).

## Qué se implementó

### Nuevo módulo `ListaEspera()` (`src/App.jsx`)

Componente de nivel superior, con 3 bloques:

1. **Banner de estado de integración** (color de aviso): *"Preparado para integración con Make/Airtable. Validación real pendiente por disponibilidad de Airtable."*
2. **Formulario "Añadir jugador a lista de espera"**: nombre, apellidos, email, teléfono (validados localmente, mismo criterio que Alta/Baja de Jugador), pista preferida y fecha preferida (opcionales), observaciones. Al enviarse (tras pasar la validación local), **no se llama a ningún endpoint** — solo se muestra el mensaje *"Añadir a lista de espera: Acción preparada. Pendiente de conexión real cuando Airtable esté disponible."*
3. **Panel "Acciones sobre la lista"**: 3 botones — *Promocionar siguiente jugador*, *Marcar como contactado*, *Eliminar de lista* — cada uno muestra el mismo tipo de mensaje honesto de "acción preparada, pendiente de conexión real" al pulsarlo. Ninguno llama a un endpoint, ninguno crea, modifica ni elimina ningún dato real (no existe backend detrás).

El botón principal reutiliza la clase `cp04-offboarding-submit-button` (Paso 07M) para heredar directamente su contraste ya validado y blindado, en vez de reinventar el estilo.

### Sidebar

Nuevo item **"Lista de espera"** (`nav.lista_espera`, icono 📋), insertado justo después de "Cierre temporal" y antes de "Torneos" — orden final consolidado del sidebar:

Inicio → Reservar → Alta de jugador → Baja de jugador → Reprogramar reserva → Cancelar reserva → Reservas (gestión) → Cierre temporal → **Lista de espera** → Torneos → Ranking → Comunidad → Admin → Centro técnico → Soporte → Perfil.

### Roles con acceso

`"lista_espera"` añadido a `CP04_ROLE_PERMISSIONS` en `src/utils/rbac.js`, con los mismos 3 roles que ya tenían `"cierre_pistas"`:

- **PLAYER:** no puede acceder. No está en su lista de permisos.
- **STAFF / ADMIN / SUPPORT:** sí, ven el item y pueden usar el módulo.

Se optó por no dar acceso de "solo consulta personal" a PLAYER (opción que planteaba el propio encargo si hubiera dudas): no existía ninguna lógica previa de ese tipo, y el módulo expone datos operativos de otros jugadores (nombre, contacto) — mantenerlo cerrado a PLAYER es la opción más segura por defecto.

### Acceso directo protegido

El guard ya existente `safeCurrentSection = cp04CanAccessSection(selectedRole, current) ? current : cp04GetSafeStartSection(selectedRole)` en `ClubPadel04SaaSApp()` reconoce automáticamente `"lista_espera"` en cuanto se añadió a `CP04_ROLE_PERMISSIONS` — sin necesidad de ningún cambio adicional. Verificado con test nuevo en `rbac.test.mjs`.

### Relación con Baja de Jugador

Se añadió una nota informativa (sin tocar el payload ni la lógica del checkbox) justo debajo de "Promocionar al siguiente jugador en lista de espera, si aplica.": *"La promoción se gestionará desde 'Lista de espera' cuando la integración real esté disponible."* Orienta a STAFF/ADMIN/SUPPORT sobre dónde se gestionará la promoción real en el futuro, sin prometer que ya ocurre automáticamente hoy.

### Relación con Make 50/50

`src/data/makeAppIntegrationMap.js`, escenario 5791113:

| Campo | Antes (Grupo E) | Ahora (Grupo B) |
|---|---|---|
| `grupo` | `"E"` (sin integración) | `"B"` (app sin Worker) |
| `integradoEnApp` | `false` | `true` |
| `integradoEnWorker` | `false` | `false` (sin cambios — no hay endpoint real) |
| `soloInventariado` | `true` | `false` |
| `requiereMakeManual` | `true` | `true` (sin cambios) |
| `bloqueadorPrincipal` | "accion manual pendiente dentro de Make" | "UI preparada (...) sin Worker/endpoint real; Make sigue ejecutando este escenario solo cada hora; validación real pendiente por Airtable 429" |

**No se declaró confirmado end-to-end** y **no se movió a Grupo A** (que exige `integradoEnWorker: true`, reservado a flujos con handler real en el Worker como Alta/Baja de Jugador o Cierre Temporal de Pistas). Grupo B ("APP_SIN_WORKER") es honesto: hay un punto de entrada real en la app, pero cero código de servidor detrás.

`estadoVerificacion` en `src/data/makeInventory.js` (`"pendiente_make_real"`) **no se tocó** — sigue siendo un eje independiente de verificación de Make, sin relación con este cambio de integración de código de app.

**Panel A3 (Centro Técnico):** no requirió ningún cambio manual — sus contadores (`computeIntegracionResumen()`) se recalculan automáticamente a partir de `MAKE_APP_INTEGRATION_MAP`, mismo diseño ya confirmado en el Paso 07A/07E/07I.

## Qué queda preparado visualmente vs. qué NO se validó

**Preparado:**
- Acceso en sidebar para STAFF/ADMIN/SUPPORT.
- Formulario de alta a lista de espera con validación local.
- 3 acciones visuales (promocionar, marcar contactado, eliminar).
- Mensajes honestos de "preparado, pendiente de conexión real" en las 4 acciones.
- Nota de enlace desde Baja de Jugador.
- Eje de integración de código (`makeAppIntegrationMap.js`) actualizado a Grupo B.

**NO validado (bloqueado por Airtable 429):**
- Ninguna llamada real a Make ni a Airtable.
- Ninguna promoción real de jugador.
- Ningún dato de lista de espera creado, leído, actualizado o eliminado de verdad.
- `estadoVerificacion` del escenario 5791113 sigue en `"pendiente_make_real"` — sin cambios, sigue exigiendo evidencia real contra Make que no existe todavía.

## Qué no se tocó

Make, Airtable, endpoints reales, credenciales, deploy, merge. PR #36 sigue en draft. No se tocó `worker-reservas/src/index.js` (no se creó ningún endpoint nuevo — este módulo es deliberadamente sin Worker). No se tocó el login, `Sidebar()` más allá de añadir el nuevo item, `cp04-two-buttons-fix.js`, `torcal-role-background.css`, ni la lógica de Alta/Baja/Reprogramar/Cancelar/Cierre Temporal.

## Verificación de que nada se rompió

- **Login:** intacto.
- **Alta de Jugador / Baja de Jugador:** intactos — el checkbox de promoción solo ganó una línea de texto informativo, sin cambiar su `onChange` ni el payload.
- **Reprogramar Reserva / Cancelar Reserva:** intactos.
- **Cierre Temporal de Pistas:** intacto.
- **Centro Técnico:** intacto y sigue protegido (SUPPORT-only, sin cambios en `CP04_SUPPORT_ONLY_SECTIONS`).
- **Roles:** `PLAYER` sigue sin ver ninguna de las secciones nuevas de este bloque (Baja, Cierre Temporal, Lista de Espera).

Confirmado ejecutando la suite completa: 334 tests frontend (330 + 3 tests nuevos de RBAC para `lista_espera` + 1 test nuevo de `makeAppIntegrationMap`) y 124 tests Worker (sin cambios, Worker no tocado), todos verdes. Build y lint sin errores nuevos.

## Pendiente

Validación real end-to-end de Gestión Lista de Espera cuando Airtable esté disponible (fuera de alcance de este paso, terminal-only): conectar el formulario/acciones a un endpoint real del Worker cuando exista un diseño de backend para esta funcionalidad, y solo entonces mover el escenario a Grupo A con evidencia real documentada — igual que se hizo con Baja de Jugador y Cierre Temporal de Pistas.
