# 12 — Corrección estructural definitiva: "Perfil y ajustes" reutiliza el mismo sistema visual del sidebar

Continuación de la Mejora 2.1 (PR #54, PR #55). La validación visual
humana en tablet/Chrome confirmó que, pese a las dos correcciones CSS
anteriores, el texto de "Perfil y ajustes" seguía viéndose negro/casi
negro en PLAYER, STAFF, ADMIN y SUPPORT. Este documento cierra la
causa raíz **real** (verificada con `getComputedStyle()` en un
Chromium real vía Playwright, no solo por lectura de CSS).

## Por qué las dos correcciones anteriores no fueron suficientes

- PR #54 corrigió un `:last-child` mal dirigido (borde/fondo).
- PR #55 eliminó una declaración `color` en `cp04-legibility-polish.css`
  que empataba en especificidad con la regla `:hover` genérica y
  ganaba por orden de aparición.

Ambas eran causas **reales y correctamente diagnosticadas para lo que
tocaban** — pero existía una **tercera causa, independiente y más
profunda**, que sólo se hizo visible al desaparecer la segunda:

1. **CSS sin scope de body**: `src/torcal-role-background.css` tenía
   varios bloques ("AUDITORIA 29 · REFUERZO FINAL ANTI-ROJO PERFIL +
   IDIOMA" y "AUDITORIA 29 · Refuerzo Torcal: Perfil con texto
   blanco") con selectores `html body .cp04-sidebar
   [data-tour="sidebar-perfil"]` / `... *` — **sin ninguna condición
   de `body.cp04-module-screen-active` / `body.cp04-role-screen-active`**,
   a diferencia de todas las demás reglas del sidebar en el mismo
   archivo. Al no tener scope, `color: #05080d !important` se aplicaba
   **siempre, en cualquier pantalla y en cualquier estado** (normal,
   hover, focus), no solo cuando Perfil está activo sobre el fondo
   degradado lima de la pantalla de login.
2. **JavaScript imperativo exclusivo de Perfil**: en `src/App.jsx`,
   el `<button>` de cada módulo del sidebar tenía 9 manejadores de
   evento (`onPointerDownCapture`, `onMouseDownCapture`,
   `onPointerUpCapture`, `onPointerDown`, `onMouseDown`,
   `onTouchStart`, `onMouseEnter`, `onMouseOver`, `onMouseLeave`) cuyo
   **único contenido** era `if (id === "perfil") { ... }` —
   forzando `element.style.setProperty("color", "#05080d", "important")`
   de forma imperativa. Ningún otro módulo del sidebar (Comunidad,
   Reservas, Torneos, Ranking...) tenía ningún manejador de este tipo:
   su hover/focus/active es 100% CSS (`:hover`, `[aria-current="page"]`).
   Esto no causaba el bug en carga inicial (solo se ejecuta con
   interacción real del puntero), pero era exactamente el tipo de
   "tratamiento especial" que la tarea pedía eliminar, y una fuente
   de inconsistencia adicional frente al resto de módulos.

Mientras la regla de PR #55 competía en especificidad con la genérica
y ganaba por orden de aparición, su eliminación no exponía el bug de
`torcal-role-background.css` porque **antes** de esa eliminación, la
regla de PR #55 (más específica: `(0,3,2)`) también ganaba a la regla
sin scope de `torcal-role-background.css` (`(0,2,1)`). Al quitar la
declaración de PR #55, el campo quedó libre para que la regla sin
scope — que llevaba ahí desde antes de esta serie de correcciones —
ganara la cascada.

## Verificación en navegador real (no solo lectura de CSS)

Se generó un script Playwright (`chromium` headless) que:

1. Inicia sesión demo como PLAYER, STAFF, ADMIN y SUPPORT
   (`src/auth/demoAuthAdapter.js`, contraseñas `jugador04`/`staff04`/
   `admin04`/`soporte04`).
2. Espera a que el sidebar y los detectores de fondo
   (`internal-background-detector.js`, `role-background-detector.js`)
   se hayan estabilizado (1800 ms de margen sobre su último
   `setTimeout(..., 1200)`).
3. Lee `getComputedStyle()` real del `<span>` de texto (no del icono)
   de "Comunidad" y de "Perfil y ajustes", en el mismo `evaluate()`
   síncrono para evitar condiciones de carrera con el
   `MutationObserver` de los detectores.
4. Repite la lectura en hover (con `force:true`, ya que el overlay
   SVG del tour guiado interceptaba el hover real sin bloquear las
   coordenadas reales del puntero).
5. Fuerza el estado activo (`aria-current="page"` + clase `is-active`)
   directamente sobre ambos botones para leer el color realmente
   aplicado por la cascada CSS en ese estado.
6. Verifica el estado de foco de teclado (`.focus()`).

### Resultado ANTES de esta corrección (4 roles, todos idénticos)

| Estado | Comunidad (span) | Perfil (span) |
|---|---|---|
| Normal | `rgb(215, 251, 232)` | `rgb(5, 8, 13)` ❌ |
| Hover | `rgb(215, 251, 232)` | `rgb(5, 8, 13)` ❌ |

### Resultado DESPUÉS de esta corrección (4 roles, todos idénticos)

| Estado | Comunidad (span) | Perfil (span) |
|---|---|---|
| Normal | `rgb(215, 251, 232)` | `rgb(215, 251, 232)` ✅ |
| Hover | `rgb(215, 251, 232)` | `rgb(215, 251, 232)` ✅ |
| Activo (forzado) | `rgb(6, 16, 6)` | `rgb(6, 16, 6)` ✅ |
| Foco de teclado | `rgb(215, 251, 232)` | `rgb(215, 251, 232)` ✅ |

Confirmado en los 4 roles (PLAYER, STAFF, ADMIN, SUPPORT) por igual —
"perfil" es el último elemento de `CP04_ROLE_PERMISSIONS` en los 4
roles (`src/utils/rbac.js`), el bug y su corrección son independientes
del rol.

## Corrección aplicada

### `src/torcal-role-background.css`

Eliminados por completo (no recolored, **eliminados**) todos los
bloques `[data-tour="sidebar-perfil"]`:

- El bloque scoped a `body.cp04-role-screen-active` (líneas ~284-331
  antes de esta corrección) — redundante: el estado activo genérico
  (`body.cp04-role-screen-active .cp04-sidebar button[aria-current="page"]`
  en `cp04-legibility-polish.css:798-813`) ya cubre a Perfil igual que
  a cualquier otro módulo.
- Los dos bloques **sin scope de body** ("REFUERZO FINAL ANTI-ROJO
  PERFIL + IDIOMA" y "Refuerzo Torcal: Perfil con texto blanco") — la
  causa raíz real de este ticket.

El bloque de idioma (`select`, `[data-tour*="idioma" i]`, etc.),
intercalado entre los dos bloques de Perfil eliminados, **no se ha
tocado**: sigue exactamente igual, con sus mismos selectores y
valores.

### `src/App.jsx`

Eliminados los 9 manejadores de evento exclusivos de `id === "perfil"`
(`onPointerDownCapture`, `onMouseDownCapture`, `onPointerUpCapture`,
`onPointerDown`, `onMouseDown`, `onTouchStart`, `onMouseEnter`,
`onMouseOver`, `onMouseLeave`). Se conserva únicamente
`onClick={() => onNavigate(id)}` — idéntico al resto de módulos, que
nunca tuvieron estos manejadores. Ninguno de los 9 manejadores tenía
código fuera de `if (id === "perfil") {...}`, por lo que su
eliminación no cambia ningún comportamiento para el resto de módulos
del sidebar (Inicio, Reservas, Torneos, Ranking, Comunidad,
Automatizaciones, Centro técnico, Soporte, Admin, Dashboard KPI,
Facturación, Backups...).

`data-tour`, `aria-current`, `aria-label`, `className`, el `style`
inline declarativo (`color: current===id ? "#05080d" : T.textDim`,
ya inerte frente al CSS `!important` y no exclusivo de Perfil) y
`onClick` quedan exactamente igual que para cualquier otro módulo:
Perfil pasa a generarse por el mismo `map()`, con el mismo componente
`<button>`, las mismas clases base (`cp04-menu-button` /
`is-active`), sin ninguna clase, atributo o manejador exclusivo más
allá de `data-tour="sidebar-perfil"` (que **todos** los módulos tienen,
con su propio id).

## Por qué es seguro

- Ambos cambios son **eliminaciones puras**: cero líneas de lógica de
  negocio, autenticación, rutas, permisos, Make, Airtable, Stripe o
  WhatsApp tocadas.
- El botón "Cerrar sesión" (`cp04-sidebar-logout-btn`, PR #54) y el
  selector de idioma no aparecen en ninguno de los dos diffs.
- `onClick={() => onNavigate(id)}` (navegación real) permanece
  intacto para todos los módulos, Perfil incluido.
- El único selector que sigue mencionando a Perfil específicamente en
  todo el proyecto es el bloque, ya existente y fuera del alcance de
  esta corrección, de `cp04-legibility-polish.css` que fija
  `background`/`border-color`/`box-shadow` (no `color`) para
  `[aria-label*="Perfil"]` — protegido explícitamente desde PR #55 y
  no tocado aquí.

## Caché / archivos servidos (Fase 6)

- `src/torcal-role-background.css` y `src/cp04-legibility-polish.css`
  se importan una única vez cada uno, directamente desde
  `src/App.jsx` (líneas 7-8) — sin copias duplicadas en el proyecto.
- El Service Worker (`src/main.jsx`) solo se registra cuando
  `import.meta.env.PROD` es verdadero — **no interfiere** con
  `npm run dev` / `localhost:5175`, que es donde se ha validado esta
  corrección.
- La toma de estilos tras el cambio se confirmó de extremo a extremo:
  el mismo script Playwright, ejecutado antes y después de editar los
  archivos (con Vite HMR activo en Terminal 1, sirviendo
  `/root/cp04-t-vite-watcher-fix/app`), mostró el cambio de
  `rgb(5, 8, 13)` a `rgb(215, 251, 232)` sin reiniciar el servidor —
  confirma que el archivo editado es el que realmente sirve Vite.

## Validación

- `npm test`: 1302/1302, 0 fallos.
- `npm run lint`: mismos 4 errores + 1 warning preexistentes (líneas
  desplazadas por el borrado, mismo origen), 0 nuevos.
- `npm run build`: correcto.
- `localhost:5175`: 200.
- `git diff --stat`: 2 archivos — `src/App.jsx` (151 líneas
  eliminadas, 0 añadidas) y `src/torcal-role-background.css` (98
  líneas eliminadas, 12 añadidas — comentario explicativo).
