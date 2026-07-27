# Mejora 2.2 — Auditoría y unificación premium completa del sidebar (4 roles)

- **Fecha:** 2026-07-25
- **Worktree:** `/root/cp04-t-vite-watcher-fix` (app en `/root/cp04-t-vite-watcher-fix/app`)
- **Rama de partida:** `mejora-2-1/perfil-estructural-20260725` (PR #56, abierta, sin merge)
- **Continúa de:** [12-mejora-2-1-perfil-fix-estructural-20260725.md](12-mejora-2-1-perfil-fix-estructural-20260725.md)

## 0. Contexto de partida

Al empezar esta sesión ya existían dos cambios sin commitear en el worktree (de una sesión anterior interrumpida, con comentarios fechados "Mejora 2.2 (2026-07-25)"):

1. `alignItems:"center"` añadido al `style` inline de los botones del sidebar en `App.jsx` (centrado vertical del icono en filas de 2 líneas).
2. Una regla CSS en `cp04-legibility-polish.css` con caja de icono estable (`.cp04-sidebar .cp04-menu-button > span:first-child { width:20px; ... }`) y el box-model de "Cerrar sesión" (`display:flex; padding:12px 14px; border-radius:14px; ...`).

Esta sesión ha continuado sobre esa base (no se ha revertido nada) y ha añadido la auditoría real + las correcciones adicionales que se describen abajo.

## 1. Método de comparación real (Fase 1-2)

La extensión Claude in Chrome no estaba disponible en esta sesión. Para obtener **computed styles reales** (no solo lectura de código) se instaló `playwright-core` de forma aislada en el directorio scratchpad de la sesión (`/tmp/.../scratchpad/pw`, con su propio `package.json`), sin tocar `package.json`/`package-lock.json` de la app ni añadir dependencias al repositorio. Se reutilizó el binario de Chromium ya cacheado en `/root/.cache/ms-playwright/chromium-1228` (ya descargado en el entorno para otras sesiones).

Con eso se automatizó:
- Entrar directamente a cada rol (`localStorage.setItem('cp04_role', <ROL>)` + reload), evitando el login manual.
- Marcar el tutorial guiado como visto (`cp04_tutorial_seen_<ROL>`) para que no tapase el sidebar con el overlay del tour.
- Leer `getComputedStyle` + `getBoundingClientRect` de cada botón del sidebar en los 4 roles.
- Simular hover real (`locator.hover()`) y foco por teclado (`Tab`) para leer estados, no solo el CSS estático.
- Cambiar el idioma activo (`localStorage cp04_language`) para comprobar si el idioma afecta al resultado visual.
- Capturar pantallas del sidebar completo (desktop, tablet, móvil con menú abierto).

## 2. Inventario por rol (Fase 1)

Fuente de verdad: `CP04_ROLE_PERMISSIONS` en `src/utils/rbac.js` + `navKeys` en `Sidebar()` (`src/App.jsx`).

| Rol | Nº módulos de navegación | + Cerrar sesión |
|---|---|---|
| PLAYER | 6 (inicio, reservas, torneos, ranking, comunidad, perfil) | 7 botones totales |
| STAFF | 16 | 17 |
| ADMIN | 22 | 23 |
| SUPPORT | 24 (incluye `flujos_make`→Centro técnico y `soporte`→Soporte, exclusivos de SUPPORT) | 25 |

Todos los módulos comparten un único punto de render (`Sidebar()`), un único array de estilo inline y una única regla de permisos — por diseño, cualquier diferencia visual entre roles solo puede venir de (a) qué módulos son visibles, o (b) reglas CSS que apunten a clases/atributos específicos. La auditoría se centró en (b).

Propiedades registradas por botón (todas obtenidas por computed style real, no inspección de código): `display`, `alignItems`, `height` real (`getBoundingClientRect`), `padding` (4 lados), `margin`, `gap`, `borderRadius`, `borderWidth/Color`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `color`, `backgroundColor`/`background`, `boxShadow`, `transform`, `opacity`, tamaño real de la caja de icono. Incluye Cerrar sesión, selector de idioma y Modo seguro.

## 3. Hallazgos reales (Fase 2-6)

### 3.1 — Confirmado ya cerrado: "Perfil y ajustes"
Verificado en los 4 roles vía computed style real: mismo `color`, `background`, `borderColor`, `fontWeight` que "Inicio" en estado normal. El cierre de PR #56 se mantiene correcto.

### 3.2 — NUEVO hallazgo (P1): clases de Soporte/Cerrar sesión dependían del idioma activo
`src/cp04-sidebar-fix.js` asignaba `cp04-sidebar-soporte-btn` y `cp04-sidebar-logout-btn` mediante un `MutationObserver` que hacía *matching* de texto en **español** (`"soporte"`, `"cerrar sesion"`) sobre el DOM ya renderizado, y **primero quitaba la clase con `classList.remove()` en cada mutación**, para solo volver a ponerla si el texto normalizado coincidía.

Comprobado en vivo cambiando `cp04_language` a inglés (`en-GB`): el botón "Support" y el botón "Sign out" se quedaban con className `cp04-menu-button` a secas — la clase JSX correcta de "Cerrar sesión" (que sí estaba bien puesta en el JSX) era **eliminada por el propio script** y nunca repuesta, porque `"sign out"` no contiene `"cerrar sesion"`. Mismo problema en francés, italiano, portugués y alemán (solo español y, por coincidencia parcial en "Perfil"/"Support", algún caso puntual funcionaban).

Efecto real: en 6 de los 7 idiomas del selector, "Cerrar sesión" perdía todo su box-model (`display:flex`, padding, border-radius, altura ~41px) y cualquier usuario que cambiase de idioma veía el `<button>` por defecto del navegador (~19px, sin padding, `font-weight:400`) en el módulo más visible de logout — el mismo patrón de "tratamiento CSS/JS exclusivo" ya identificado como causa raíz real para "Perfil y ajustes" en el cierre anterior (PR #56), sin extender esa corrección a Soporte/Logout.

**Corrección aplicada** (mismo patrón que la causa raíz ya validada):
- `src/App.jsx`: el `className` de cada botón de navegación ahora incluye `cp04-sidebar-soporte-btn` cuando `id === "soporte"` — el `id` interno es estable y no depende del idioma (a diferencia del texto traducido).
- `src/cp04-sidebar-fix.js`: se ha retirado `fixCp04SidebarOnly()` (la función, sus `setTimeout`, el `MutationObserver` y sus listeners de `load`/`popstate`/`hashchange`). Se mantiene intacto el resto del fichero (`fixCp04EntrarLoginButtonFinal`, el fix del botón "Entrar" del login, que es un problema distinto y no forma parte de esta mejora).

Verificado tras el fix: en inglés, `Support` y `Sign out` mantienen sus clases y su altura de 41px de forma idéntica a español.

### 3.3 — NUEVO hallazgo (P2, menor): dirección de hover inconsistente
La regla "hover común premium" (bloque *Auditoría 19*) fijaba `transform: translateY(-1px)` para Soporte/Perfil/Logout con una especificidad de selector mayor que la regla genérica del sidebar (`transform: translateX(2px)`), así que estos 3 elementos se desplazaban **hacia arriba** en hover mientras el resto de módulos se desplaza **hacia la derecha**. Verificado con hover real vía Playwright (`transform: matrix(...)` distinto en Soporte/Logout vs. Inicio/Perfil antes del fix).

**Corrección aplicada:** se ha retirado la declaración `transform` de ese bloque; al no haber una declaración más específica para esa propiedad, todos los módulos heredan el mismo `translateX(2px)` de la regla genérica. Verificado tras el fix: los 4 elementos muestreados (Inicio, Soporte, Perfil, Cerrar sesión) dan el mismo `matrix(1,0,0,1,2,0)` en hover.

### 3.4 — Revisado, sin cambios necesarios
- **Caja de icono** (20px, `↻`/`✕` incluidos): ya unificada por el fix previo a esta sesión; confirmada en los 4 roles vía `getBoundingClientRect` del `span` de icono.
- **Textos de 2 líneas:** "Comunicaciones y ciclo de socio" es el único módulo que envuelve a 2 líneas a 1440px (292px de sidebar) → 56px de alto vs. 41px base; icono centrado verticalmente gracias al `alignItems:"center"` ya aplicado. Crecimiento controlado, sin recorte ni desborde.
- **Focus visible:** `outline: 3px solid rgba(182,255,0,.55)` con `outline-offset:3px`, confirmado con navegación real por teclado (`Tab`), visible pero no agresivo.
- **Ancho del selector de idioma y de "Modo seguro":** 243px ambos, igual al ancho útil del sidebar (292px − 24px + 24px de padding lateral) — ya coherente, sin cambios.
- **Reglas CSS muertas o redundantes** (`cp04-sidebar-profile-btn`, `cp04-sidebar-perfil-btn`, `cp04-sidebar-support-btn`, y los selectores por atributo `[aria-label*="Perfil"]`/`[title*="Perfil"]`): no se aplican a ningún elemento real del DOM actual, o cuando sí matchean (algunos idiomas de "Perfil"), declaran exactamente los mismos valores que la regla genérica del sidebar — es decir, son inofensivas pero redundantes. **No se han tocado** en esta mejora para no ampliar el alcance más allá de lo pedido (ver pendientes no críticos).

## 4. Estados interactivos (Fase 6) — resumen verificado

| Estado | Resultado |
|---|---|
| Normal | Idéntico entre roles para módulos compartidos (Inicio, Perfil, Torneos, Comunidad) |
| Hover | Unificado a `translateX(2px)` en todo el sidebar (antes: 2 direcciones distintas) |
| Active (`aria-current`/`data-active`) | Verde corporativo (`#b6ff00`→`#2df5a3`), solo el módulo activo, confirmado en los 4 roles |
| Focus-visible | Outline verde 3px, offset 3px, sin agresividad |
| Pressed | Sin regla `:active` propia del sidebar; sin estado persistente detectado |
| Idioma activo | Ya no afecta a las clases de Soporte/Cerrar sesión (corregido en 3.2) |

## 5. Responsive (Fase 8) y capturas (Fase 9)

Capturas guardadas en [`capturas-mejora-2-2/`](capturas-mejora-2-2/):

- `sidebar-PLAYER.png`, `sidebar-STAFF.png`, `sidebar-ADMIN.png`, `sidebar-SUPPORT.png` — sidebar completo, desktop (1440px), los 4 roles.
- `sidebar-SUPPORT-tablet.png` — 768px, sidebar en modo off-canvas (comportamiento esperado, sin overflow).
- `sidebar-SUPPORT-mobile-open.png` / `sidebar-SUPPORT-mobile-open-bottom.png` — 390px, menú móvil abierto, scroll hasta el final (Soporte, Perfil, Cerrar sesión, idioma, Modo seguro todos alcanzables y bien alineados).

Verificado: `document.documentElement.scrollWidth > clientWidth` → `false` en 390px (sin overflow horizontal) y en el sidebar abierto. No se declara validación física en iOS (pendiente de validación humana, ver checklist).

## 6. Tokens reutilizados (sin nuevos tokens)

- Altura base: 41px · dos líneas: 56px (controlado)
- Padding: `12px 14px`
- Gap icono↔texto: `10px`
- Caja de icono: `20px` de ancho, `inline-flex` centrado
- `border-radius`: `14px`
- Verde activo: `linear-gradient(135deg, #b6ff00, #2df5a3)`
- Focus: `rgba(182,255,0,.55)` 3px

## 7. Pendientes no críticos

1. Selectores CSS muertos/redundantes (`cp04-sidebar-profile-btn`, `cp04-sidebar-perfil-btn`, `cp04-sidebar-support-btn`, `[aria-label*="Perfil"]`, `[title*="Perfil"]`) siguen en `cp04-legibility-polish.css`. No afectan al render actual; limpiarlos sería trabajo de "housekeeping" fuera del alcance pedido (no es una inconsistencia visual real).
2. Existen ~8 bloques históricos superpuestos ("Auditoría 19", "Auditoría 19.2", "Auditoría 20"...) que repiten la misma regla de estado activo 3 veces con valores idénticos. Consolidarlos reduciría el archivo pero no cambia ningún resultado visual — no se ha tocado para minimizar el diff de esta mejora.
3. Validación física en tablet/iOS real: pendiente (ver checklist humano).

## 8. Checklist de validación humana (tablet)

- [ ] Abrir la app en tablet real y comprobar que el sidebar (o su versión off-canvas) no se ve cortado ni con scroll horizontal.
- [ ] Comprobar "Cerrar sesión" en español e inglés (cambiar idioma desde el selector) — debe verse igual de alto y con el mismo padding en ambos.
- [ ] Pasar el dedo/cursor sobre 3-4 módulos distintos (uno normal, Soporte, Perfil, Cerrar sesión) y confirmar que el hover se mueve en la misma dirección en todos.
- [ ] Confirmar que "Comunicaciones y ciclo de socio" (el único de 2 líneas) no se ve descentrado ni con el icono desalineado.
- [ ] Confirmar que el selector de idioma y "Modo seguro" ocupan el mismo ancho que el resto del sidebar.
- [ ] Navegar con teclado (Tab) y confirmar que el foco es visible pero no agresivo.
- [ ] Confirmar visualmente en los 4 roles (PLAYER, STAFF, ADMIN, SUPPORT) que no aparece rojo/burdeos permanente en ningún módulo salvo el tono apagado de "Cerrar sesión".
