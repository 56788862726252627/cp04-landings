# Baja de Jugador en sidebar + consolidación de módulos operativos (Paso 07I)

**Fecha:** 2026-07-19
**Continuación de:** Paso 07C (`docs/paso-07c-baja-jugador/`, integración app/API de Baja de Jugador) y Paso 07G (`docs/paso-07g-consolidacion-localhost-5175/`, mismo patrón aplicado a Cierre Temporal de Pistas).

---

## Entorno

- **Puerto oficial:** `localhost:5175`
- **Worktree correcto:** `/root/cp04-t-frontend-fixes`
- **Rama:** `frontend/audit-fixes-20260709`
- **HEAD antes de este paso:** `dded285` (Paso 07H)

## Qué se añadió al sidebar

Nuevo acceso directo **"Baja de jugador"** (`nav.baja_jugador`, icono 🧾) en `Sidebar()` (`src/App.jsx`), justo después de "Alta de jugador".

## Ubicación exacta

Entre "Alta de jugador" (`alta_jugador`) y "Reprogramar reserva" (`reprogramar`). Orden final consolidado del sidebar:

Inicio → Reservar → **Alta de jugador → Baja de jugador** → Reprogramar reserva → Cancelar reserva → Reservas (gestión) → Cierre temporal → Torneos → Ranking → Comunidad → Admin → Centro técnico → Soporte → Perfil.

No se reordenó nada más: los únicos cambios de orden son la inserción de "Baja de jugador" justo después de "Alta de jugador".

## Qué lógica se reutilizó del Paso 07C (sin duplicar nada)

Antes de este paso, Baja de Jugador solo era accesible entrando a "Alta de jugador" y pulsando la pestaña interna "Baja de jugador" dentro del mismo componente `AltaJugador()`. Esa lógica (formulario, validación, `submitBaja`, payload, mensaje seguro) **no se tocó ni se duplicó**:

1. `AltaJugador()` ahora acepta un prop opcional `initialModo` (por defecto `"alta"`). Su estado interno `modo` se inicializa con ese valor: `useState(initialModo === "baja" ? "baja" : "alta")`.
2. En el router de secciones (`modules` en `ClubPadel04SaaSApp()`), se añadió `baja_jugador: <AltaJugador initialModo="baja" />`, junto al ya existente `alta_jugador: <AltaJugador />`.
3. Ambas entradas del sidebar renderizan el **mismo** componente `AltaJugador()` — solo cambia qué pestaña se abre primero. El usuario sigue pudiendo cambiar de pestaña libremente una vez dentro (los botones "Alta de jugador" / "Baja de jugador" en la parte superior del formulario no se tocaron).

No se creó ningún componente, formulario, endpoint o payload nuevo. El endpoint (`POST /api/jugadores/baja`), el payload (`accion: "baja_jugador"`, etc.) y el Worker (`handleBajaJugador`) son exactamente los del Paso 07C, sin cambios.

## Mensaje seguro (sin cambios)

El formulario de Baja ya mostraba, desde el Paso 07C: *"Solicitar baja de jugador. Esta acción no se confirmará hasta que el sistema responda correctamente."* — equivalente en significado al texto de referencia de este paso ("Esta acción prepara la baja, pero no se considerará confirmada hasta recibir respuesta real del sistema."). Se mantiene el texto ya verificado en vez de reescribirlo, para no introducir riesgo en una copia ya probada. El criterio de "nunca confirmar sin respuesta real" (`response.ok && data.ok !== false`) tampoco se tocó.

## Roles con acceso

Se añadió `"baja_jugador"` a `CP04_ROLE_PERMISSIONS` en `src/utils/rbac.js`, con exactamente los mismos 3 roles que ya tenían `"alta_jugador"`:

- **PLAYER:** no puede acceder. No está en su lista de permisos.
- **STAFF / ADMIN / SUPPORT:** sí, ven el item y pueden usarlo.

## Navegación directa protegida

El guard de última línea ya existente en `ClubPadel04SaaSApp()` (`safeCurrentSection = cp04CanAccessSection(selectedRole, current) ? current : cp04GetSafeStartSection(selectedRole)`) reconoce automáticamente `"baja_jugador"` en cuanto se añadió a `CP04_ROLE_PERMISSIONS` — sin necesidad de ningún cambio adicional. Si algo forzara `current = "baja_jugador"` para un PLAYER, se redirige a su sección segura (`"inicio"`). Verificado con test nuevo en `rbac.test.mjs`.

## Verificación de que nada se rompió

- **Alta de Jugador:** intacto — mismo componente, mismo formulario, mismo endpoint (`/api/jugadores/alta`); solo se le añadió un prop opcional con valor por defecto que preserva el comportamiento anterior byte a byte cuando no se pasa (`initialModo="alta"` implícito).
- **Baja de Jugador:** intacto — mismo payload/endpoint/criterio defensivo del Paso 07C; ahora además accesible directamente.
- **Cierre Temporal de Pistas (Paso 07G):** intacto — sigue en el sidebar, sin cambios en su componente `CierreTemporalPista()`.
- **Botón de Cierre Temporal (Paso 07H):** intacto — el ajuste de contraste no se tocó en este paso.
- **Centro Técnico:** intacto — sigue SUPPORT-only, sin cambios en `CP04_SUPPORT_ONLY_SECTIONS` ni en el componente.
- **API Reservas:** intacta — no se tocó el Worker en este paso.
- **Mapa/contadores App ↔ Make (4/50):** sin cambios — este paso es solo de navegación/UI, no toca `makeAppIntegrationMap.js` ni `makeInventory.js`.

Confirmado ejecutando la suite completa: 330 tests frontend (incluye 3 tests nuevos de RBAC para `baja_jugador`) y 124 tests Worker, todos verdes.

## Qué no se tocó

Make, Airtable, endpoints reales, credenciales, deploy, merge. PR #36 sigue en draft.

## Pendiente

Validación end-to-end real de Baja de Jugador cuando `MAKE_BAJA_JUGADOR_WEBHOOK` esté configurado y Airtable esté disponible — sin cambios respecto al Paso 07C, sigue pendiente y no es parte de este paso (que es solo de navegación/UI).
