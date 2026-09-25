# Prompt 2 de 9 — Eliminar detección por texto y migrar a estado explícito de React

- **Fecha:** 2026-07-25
- **Worktree:** `/root/cp04-t-vite-watcher-fix` (app en `/root/cp04-t-vite-watcher-fix/app`)
- **Rama de partida:** `mejora-2-3/housekeeping-tecnico-20260725` (PR #58, abierta, sin merge)
- **Continúa de:** [14-housekeeping-tecnico-20260725.md](14-housekeeping-tecnico-20260725.md), que ya había identificado este mecanismo como el riesgo más importante pendiente.

## Arquitectura anterior

Dos scripts se auto-ejecutaban al cargar la app y decidían clases/fondos escaneando `document.body.innerText`:

### `role-background-detector.js`
- Buscaba (normalizando acentos/mayúsculas): `"iniciar como rol"`, `"acceso por rol"`, `"selecciona como quieres entrar"`, o las 4 tarjetas de rol juntas (`"jugador / cliente"` + `"staff / recepcion"` + `"administrador / jefe"` + `"soporte tecnico"`).
- Si coincidía: aplicaba el fondo Torcal (`url('/images/torcal-padel-bg.png')` + degradado) directamente por `style.backgroundImage` a `documentElement`, `body`, `#root` y `#root > div`, y añadía `cp04-role-screen-active` al `body`.
- Si no coincidía: limpiaba esos estilos inline y quitaba la clase.
- Se reevaluaba con `setTimeout` (100/500/1200 ms), en `load`/`popstate`/`hashchange`, y con un `MutationObserver` sobre `document.body` (`childList`, `subtree`, `characterData` — se dispara en casi cualquier cambio del DOM).

### `internal-background-detector.js`
- Si detectaba la pantalla de login (por texto) o que `cp04-role-screen-active` ya estaba puesto, limpiaba todas las clases de módulo y salía.
- Si no, comprobaba un OR amplio de palabras (`"cerrar sesion"`, `"modo seguro"`, `"reservar pista"`, `"centro tecnico"`, `"panel"`, `"ranking"`, `"alta de jugador"`) para decidir si aplicar `cp04-module-screen-active`.
- Dentro de eso, clasificaba en `cp04-module-admin` / `cp04-module-user` / `cp04-module-general` según otro OR de palabras (`"automatizaciones"`, `"seguridad"`, `"backups"`, `"soporte tecnico"` → admin; `"reservas"`, `"torneos"`, `"perfil"`, `"ranking"` → user; si ninguna, general).
- Mismo patrón de `setTimeout` + `MutationObserver` + listeners de navegación.

### Por qué era frágil (y ya fallaba de verdad)

El sidebar completo del rol se renderiza siempre junto al contenido de cualquier pantalla. Eso significaba que, en la práctica, la categoría admin/user **no dependía del módulo abierto sino del rol** (ya documentado antes de esta tarea en un comentario de `cp04-legibility-polish.css`, Paso 07M: *"SUPPORT tiene 'Centro técnico' siempre presente en su sidebar... `internal-background-detector.js` clasifica CUALQUIER página que SUPPORT esté viendo como cp04-module-admin"*). Y como esas palabras están todas en español, **en cuanto la traducción activa no contenía la palabra exacta** (p. ej. `"Ranking"` → `"Classement"` en francés, `"Rangliste"` en alemán, `"Classifica"` en italiano), el detector fallaba y **todo el sidebar** (no solo un botón) caía a estilos por defecto del navegador. Confirmado en el Prompt 1 (doc 14) para STAFF+francés/italiano/alemán y reproducido de nuevo aquí antes de tocar nada.

## Mapa completo (Fase 1)

| Pregunta | Respuesta |
|---|---|
| ¿Qué texto busca cada detector? | Ver arriba — ~20 subcadenas distintas en español entre los dos archivos |
| ¿En qué idiomas funciona? | Solo cuando la traducción activa conserva casualmente esas palabras (español siempre; inglés/portugués a veces por préstamos léxicos; francés/italiano/alemán fallan en varias combinaciones rol×módulo reales) |
| ¿Qué clases añade/quita? | `cp04-role-screen-active`, `cp04-module-screen-active`, `cp04-module-admin`, `cp04-module-user`, `cp04-module-general` |
| ¿Qué fondos activa? | El fondo Torcal (pantalla de rol) vía estilos inline; los 3 fondos internos (`user-reservas-bg`, `admin-technical-bg`, `general-modules-bg`) vía variables CSS gateadas por las clases anteriores |
| ¿Qué módulos dependen de él? | Todos — es el gate de fondo de toda la app interna, no solo del sidebar |
| ¿Qué roles dependen de él? | Los 4 |
| ¿Qué efectos visuales produce? | Fondo de página + más de 260 reglas CSS repartidas en `cp04-legibility-polish.css`, `torcal-role-background.css` e `internal-module-backgrounds.css` que solo se activan con estas clases |
| ¿Qué ocurre si falla? | El body se queda sin ninguna de estas clases → toda esa capa de estilo premium desaparece (confirmado, no solo teórico) |
| ¿Duplicidades entre ambos? | Los dos normalizan texto de forma casi idéntica (`normalizeText`/`normalizeCp04Text`, misma implementación) y los dos usan el mismo patrón `setTimeout`×3 + `MutationObserver` + 3 listeners de navegación |
| ¿Qué lógica de React ya podía reemplazarlo? | `selectedRole` y `current`/`safeCurrentSection`, ya existentes en `ClubPadel04SaaSApp` — el rol y el módulo activo siempre fueron un estado de React conocido; nunca hacía falta leer el DOM para saberlo |

## Arquitectura nueva

**Fuente de verdad única:** `src/utils/screenState.js` (módulo puro, sin DOM, 100% testeable con `node --test`):
- `cp04GetModuleBackgroundCategory(role)` → `'admin' | 'user' | 'general'`, mapeo estático `{ PLAYER: 'user', STAFF: 'user', ADMIN: 'admin', SUPPORT: 'admin' }`, fiel a paridad ya documentada (Paso 07M).
- `cp04ComputeScreenState({ selectedRole, moduleId })` → `{ roleScreenActive, moduleScreenActive, roleId, moduleId, moduleCategory }`. Ningún argumento es texto traducible; `moduleId` es el id interno (`"inicio"`, `"soporte"`, etc.), nunca la etiqueta visible.

**Aplicador al DOM:** `src/cp04-apply-screen-state.js` (`cp04ApplyScreenState(state)`), que traduce ese estado a exactamente las mismas clases/estilos que ya existían (mismo degradado, misma imagen, mismas 5 clases), más dos `data-*` nuevos (`data-cp04-role`, `data-cp04-module`) que documentan el estado sin que ningún CSS dependa de ellos todavía.

**Enganche en React:** un único `useEffect` en `ClubPadel04SaaSApp` (`src/App.jsx`), justo después de calcular `safeCurrentSection`:

```js
useEffect(() => {
  const screenState = cp04ComputeScreenState({ selectedRole, moduleId: safeCurrentSection });
  cp04ApplyScreenState(screenState);
}, [selectedRole, safeCurrentSection]);
```

Se ejecuta una vez por render cuando cambia `selectedRole` o `safeCurrentSection` — determinista, sin `MutationObserver`, sin `innerText`, sin escuchar `popstate`/`hashchange` (React ya re-renderiza solo con el cambio de estado real).

### Por qué sigue habiendo algo "imperativo"

El CSS existente (cientos de reglas ya validadas visualmente) apunta deliberadamente a `body.*`, `#root` y `html`, fuera del árbol que React controla de forma declarativa. Reescribir esos selectores para que apunten a un wrapper interno habría sido un cambio de identidad visual y de arquitectura mucho más amplio de lo que pide esta tarea ("no cambiar identidad visual validada"). La diferencia real y la que importa: el disparador ya no es un escaneo de texto con `MutationObserver`, es un `useEffect` de React con dependencias explícitas y deterministas.

## Mapa de roles y módulos

| Rol interno | Categoría de fondo |
|---|---|
| PLAYER | user |
| STAFF | user |
| ADMIN | admin |
| SUPPORT | admin |

Los 23 módulos (`inicio`, `reservas`, `alta_jugador`, `baja_jugador`, `reprogramar`, `cancelar`, `gestion`, `cierre_pistas`, `lista_espera`, `control_qr`, `pistas_recordatorios`, `comunicaciones_socio`, `calendario_disponibilidad`, `torneos`, `ranking`, `comunidad`, `admin`, `dashboard_kpi`, `backups_seguridad`, `facturacion_pagos`, `automatizaciones_bots`, `flujos_make`, `soporte`, `perfil`) no cambian la categoría de fondo entre sí — exactamente igual que el sistema anterior (ver Paso 07M) — solo se guardan en `data-cp04-module` para depuración/futuro enganche declarativo.

## Archivos

**Nuevos:**
- `src/utils/screenState.js` — lógica pura.
- `src/utils/screenState.test.mjs` — 9 tests nuevos.
- `src/cp04-apply-screen-state.js` — aplicador al DOM.

**Modificados:**
- `src/App.jsx` — quita los 2 imports de los detectores, añade el `useEffect` + imports de los 2 módulos nuevos.
- `src/cp04-legibility-polish.css` — actualizado el comentario del Paso 07M (mencionaba `internal-background-detector.js`, ya eliminado) para reflejar la nueva fuente de verdad.

**Eliminados** (0 referencias tras el cambio, confirmado con grep, sin tests propios):
- `src/internal-background-detector.js`
- `src/role-background-detector.js`

## Validación multiidioma (Fase 6)

Verificado con Chromium headless (mismo `playwright-core` aislado en scratchpad usado en Mejora 2.2/Prompt 1) en los 4 roles × es-ES/en-GB/fr-FR/it-IT/pt-PT/de-DE (24 combinaciones) **antes y después** del cambio:

- **Antes:** 12/24 combinaciones con el sidebar completo caído a estilos por defecto (`document.body.className` vacío).
- **Después:** 24/24 combinaciones correctas, `cp04-module-screen-active` + categoría correcta siempre presentes, altura de "Cerrar sesión" consistentemente 41px.

**Neerlandés (`nl-NL`)**, aunque no tiene diccionario de traducción propio (cae en español, ver doc 14) y por tanto no se puede validar "en neerlandés" en sentido estricto de contenido, se probó igualmente en los 4 roles: las clases de fondo son correctas en los 4 casos, precisamente porque ya no dependen de ninguna palabra traducida.

## Validación por rol (Fase 7)

| Rol | Módulos probados | Clase de rol | Clase de módulo | Fondo |
|---|---|---|---|---|
| PLAYER | Inicio, Torneos, Ranking, Comunidad, Perfil | `data-cp04-role="player"` | `cp04-module-user` | user-reservas-bg |
| STAFF | Reservas, Alta/Baja, Calendario, Torneos, Comunidad, Perfil | `data-cp04-role="staff"` | `cp04-module-user` | user-reservas-bg |
| ADMIN | Admin, KPI, Backups, Facturación, Automatizaciones, Perfil | `data-cp04-role="admin"` | `cp04-module-admin` | admin-technical-bg |
| SUPPORT | Soporte, Centro técnico, Automatizaciones, Perfil | `data-cp04-role="support"` | `cp04-module-admin` | admin-technical-bg |

Capturas de pantalla (pantalla de rol y ADMIN/Inicio) comparadas visualmente contra el estado de PR #58 — sin diferencias apreciables (mismo fondo, mismos gradientes, mismo sidebar).

## Tests (Fase 8)

9 tests nuevos en `src/utils/screenState.test.mjs`, incluyendo explícitamente:
- Que el resultado es el mismo para los 4 roles sin importar el idioma "simulado" (la función ni siquiera recibe el idioma como argumento — por construcción no puede depender de él).
- Que cambiar de módulo dentro del mismo rol no cambia la categoría de fondo (paridad exacta con el comportamiento anterior).
- Que un rol vacío/desconocido falla cerrado igual que `cp04NormalizeRole` (nunca a `admin`).

No se han escrito tests de `cp04-apply-screen-state.js` con `node --test` porque tocar `document`/`document.body` requeriría añadir un mock de DOM (jsdom u otro) que no existe en ningún test de este repo hoy — su cobertura real es la validación con Chromium de las Fases 6-7, documentada arriba con evidencia concreta antes/después.

## Riesgos residuales

1. `cp04-two-buttons-fix.js` sigue con el mismo patrón de bug (clase por texto en español) para otros botones fuera del sidebar (Reservar pista, Ir a reservas, Dar de alta, Pista 1, Reprogramar reserva, Consultar reservas) — no tocado, mismo motivo que en el Prompt 1: fuera del alcance de esta migración concreta (esta se limitaba a los dos detectores de fondo nombrados explícitamente).
2. `cp04-sidebar-fix.js` (solo le queda el fix del botón "Entrar" del login) y `cp04-login-enter-white-final.js` siguen duplicando el mismo fix — pendiente de una tarea de consolidación futura.
3. `nl-NL` sigue sin diccionario de traducción propio (cae en español) — vacío de contenido, no de arquitectura; fuera de alcance.

## Checklist de validación

- [x] 1311/1311 tests (1302 + 9 nuevos).
- [x] Build correcto.
- [x] Lint: 4 problemas, todos preexistentes, 0 nuevos.
- [x] `localhost:5175` → 200.
- [x] 4 roles × 6 idiomas reales + neerlandés probados con Chromium antes y después.
- [x] Capturas de pantalla comparadas (pantalla de rol, ADMIN/Inicio) sin diferencias visuales.
- [x] 0 referencias a `textContent`/`innerText`/`includes` sobre palabras visibles en el nuevo código.
- [x] 0 `MutationObserver` nuevos ni conservados sobre texto.
- [x] Sin cambios de lógica de negocio, RBAC, rutas, Make/Airtable/Stripe/WhatsApp.
- [x] `/root/cp04-landings` no tocado.
- [x] Sin merge.
