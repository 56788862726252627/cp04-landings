# Prompt 1 de 9 — Housekeeping técnico seguro y limpieza de código muerto

- **Fecha:** 2026-07-25
- **Worktree:** `/root/cp04-t-vite-watcher-fix` (app en `/root/cp04-t-vite-watcher-fix/app`)
- **Rama de partida:** `mejora-2-2/sidebar-premium-20260725` (PR #57, abierta, sin merge)
- **Continúa de:** [13-mejora-2-2-sidebar-premium-20260725.md](13-mejora-2-2-sidebar-premium-20260725.md)

## Metodología

Auditoría estática (grep exhaustivo de imports/exports/classNames reales, no solo nombres de archivo) + verificación dinámica con Chromium headless (`playwright-core`, instalado de forma aislada en el scratchpad de la sesión, sin tocar dependencias del repo). Cada candidato a "código muerto" se verificó por al menos dos vías independientes antes de tocarlo: referencia estática (`grep -rn`), y cuando aplicaba, comportamiento real en el navegador.

**Corrección de método importante:** un primer barrido automático (grep excluyendo archivos `.test.mjs`) marcó ~27 falsos positivos — en realidad estaban activos vía:
1. **Descubrimiento dinámico de plugins**: `src/saas-core/research/providers/plugins/*.js` se cargan con `readdir()` + `import()` dinámico desde `providerRegistry.js`, no con imports estáticos — invisibles para un grep ingenuo.
2. **Cobertura solo por tests**: 9 módulos de `src/saas-core/` (factory/nl-builder/commercial/research) no los importa `App.jsx` porque no son parte del bundle de la app — son la fábrica SaaS/NL-builder de los Pasos 10-11, con su propia batería de tests (`.test.mjs`), confirmada verde en los 1302 tests del repo.

Ninguno de estos 36 archivos se tocó.

## Inventario clasificado (Fase 1)

| Elemento | Clasificación | Evidencia |
|---|---|---|
| `src/App.css` (584 líneas) | Muerto confirmado (histórico, con contenido real) | 0 imports en 3 auditorías independientes (docs 02, 09, y esta) |
| `src/data/performancePlan.js` | Muerto confirmado | 0 referencias; es un objeto de planificación (Auditoría 30), no código ejecutable |
| `src/data/tutorialSteps.js` | Muerto confirmado, reemplazado | 0 referencias; sustituido por el sistema actual `CP04GuidedTutorial.jsx` (datos internos propios, no importa este archivo) |
| `src/hooks/useTutorialOrchestrator.js` | Muerto confirmado, reemplazado | 0 referencias; mismo reemplazo que el anterior. Su eliminación quitó además 1 warning preexistente de ESLint (`exhaustive-deps`) |
| `src/components/lazy/lazySections.js` + `LazySectionShell.jsx` | Scaffolding inequívoco | Metadata propia `status: "prepared"` (Auditoría 32), 0 consumidores reales, nunca renderizado |
| `.cp04-lazy-section-shell` (+ `__header`, `__content`) en `src/index.css` | Muerto confirmado, atado 1:1 al anterior | Único consumidor era `LazySectionShell.jsx` |
| `src/cp04-legibility-polish.css`: selectores `.cp04-sidebar-profile-btn`, `.cp04-sidebar-perfil-btn`, `.cp04-sidebar-support-btn` (36 apariciones) | Muerto confirmado | Ninguna clase se asigna nunca desde JS/JSX (verificado con grep en todo `src/`); no pueden matchear ningún elemento real |
| `src/cp04-sidebar-fix.js` (contenido restante) | Redundante, no eliminado | Ver sección dedicada abajo |
| `src/cp04-two-buttons-fix.js` | Mismo patrón de bug que el ya corregido en Mejora 2.2, **no tocado** | Ver "Riesgos pendientes" |
| `src/cp04-login-enter-white-final.js` | Duplicado funcional de parte de `cp04-sidebar-fix.js`, **no tocado** | Ver "Riesgos pendientes" |
| `src/components/CP04DemoRealista.jsx` + `src/styles/cp04-demo-realista.css` | Requiere decisión humana | 0 referencias, pero es un componente completo y con contenido real (no scaffolding vacío) — posible reserva para uso comercial futuro |
| `src/components/demo/DemoSafeNotice.jsx` + `src/data/demoSafeDataset.js` + `src/styles/demo-safe.css` | Requiere decisión humana | Mismo caso que el anterior |
| `src/components/lazy/lazyGallery.js` + `src/components/ClubGallery.jsx` + `src/data/visualAssets.js` | Requiere decisión humana (ver Fase 6, activos) | 0 referencias de render; duplica datos que sí están activos directamente en `App.jsx` (constante `GALLERY`) |
| `console.log` en `src/saas-core/factory/orchestrator.js:153` | Activo, conservado | Logging condicionado por flag `verbose`, no residuo de desarrollo |

## CSS muerto y redundante (Fase 2)

Revisados todos los CSS listados en el prompt (`cp04-legibility-polish.css`, `torcal-role-background.css`, `internal-module-backgrounds.css`, `tournament-module.css`, `index.css`) más `App.css`.

- **Eliminado:** las 36 apariciones de `.cp04-sidebar-profile-btn` / `.cp04-sidebar-perfil-btn` / `.cp04-sidebar-support-btn` en `cp04-legibility-polish.css`, quitando solo esas líneas de cada lista de selectores separada por comas y conservando las líneas hermanas que sí son reales (`.cp04-sidebar-soporte-btn`, `.cp04-sidebar-logout-btn`, `[aria-label*="Perfil"]`, `[title*="Perfil"]`). Un bloque completo ("Perfil: estado base premium neutro...") quedó con las 4 líneas muertas y se eliminó entero.
- `torcal-role-background.css`: los selectores `[aria-label*="idioma" i]` / `[aria-label*="language" i]` SÍ coinciden con el trigger real del selector de idioma (`aria-label="Idioma: ..."`) — se conservan, no están muertos.
- `tournament-module.css`: sin relación con sidebar/perfil/soporte/logout/idioma; `nth-child(odd)` es zebra-striping normal de tabla, no un hack. Sin cambios.
- **No se tocaron** las ~8 capas históricas superpuestas ("Auditoría 19", "19.2", "20") que repiten casi la misma regla de Soporte 3 veces — es redundancia real pero consolidarlas de forma segura exige verificar la cascada final regla a regla, lo cual es un refactor, no una eliminación de código muerto. Documentado como pendiente no crítico.

## `src/App.css`: decisión del usuario

Este archivo llevaba dos auditorías previas (docs 02 y 09) documentado como huérfano confirmado (0 imports) pero "conservado, decisión para una mejora de limpieza dedicada". Se preguntó explícitamente antes de tocarlo. **El usuario confirmó eliminarlo.** Eliminado.

## Fase 3 — `cp04-sidebar-fix.js`: ¿sigue siendo necesario?

**Para el sidebar: no.** Su lógica de sidebar (`fixCp04SidebarOnly`, el `MutationObserver`, los listeners) ya se eliminó en Mejora 2.2 (PR #57), sustituida por clases estables en el JSX del `Sidebar()`. Lo que queda en el archivo hoy es únicamente `fixCp04EntrarLoginButtonFinal()` — el fix de texto blanco del botón "Entrar" del login, que **no tiene nada que ver con el sidebar** pese al nombre del archivo.

**No se ha eliminado el archivo** porque esa función restante:
- Es funcionalmente redundante con `src/cp04-login-enter-white-final.js` (un fix casi idéntico, ver más abajo), pero no 100% idéntica: cubre triggers distintos (`popstate` aquí; `click`/`input` en el otro archivo).
- Tocar el flujo de login excede el mandato de esta tarea ("no modificar autenticación", "sin cambios funcionales") y requeriría su propia validación dedicada del formulario de login, no solo del sidebar.

Se documenta como pendiente para una tarea futura de consolidación (no housekeeping puro), sin tocarlo ahora.

## Fase 4 — Limpieza aplicada

Archivos eliminados (6):
- `src/App.css`
- `src/data/performancePlan.js`
- `src/data/tutorialSteps.js`
- `src/hooks/useTutorialOrchestrator.js`
- `src/components/lazy/lazySections.js`
- `src/components/lazy/LazySectionShell.jsx`

CSS editado (sin eliminar archivos):
- `src/cp04-legibility-polish.css`: -48 líneas netas (1377→1329), 0 selectores muertos restantes.
- `src/index.css`: -22 líneas (bloque `.cp04-lazy-section-shell*` atado a `LazySectionShell.jsx`).

Nada de lo eliminado tenía archivo de test propio (confirmado antes de borrar) ni consumidores reales (estáticos o dinámicos).

## Fase 5 — Validación con Chromium (4 roles × 6 idiomas reales)

Se repitió la comparación de computed styles de Mejora 2.2 en PLAYER/STAFF/ADMIN/SUPPORT × es-ES/en-GB/fr-FR/it-IT/pt-PT/de-DE (24 combinaciones) tras aplicar la limpieza.

**Hallazgo importante, confirmado NO causado por esta limpieza:** en 12 de las 24 combinaciones, el sidebar completo (no solo Soporte/Logout) pierde todo su estilo premium y cae a valores por defecto del navegador (p. ej. "Cerrar sesión" a 21px en vez de 41px). Causa raíz: `document.body.className` queda **vacío** — ni `cp04-module-screen-active` ni `cp04-role-screen-active` se activan — porque `src/internal-background-detector.js` y `src/role-background-detector.js` deciden qué clase poner escaneando `document.body.innerText` completo en busca de subcadenas **en español** (`"reservar pista"`, `"modo seguro"`, `"panel"`, `"ranking"`, etc.). Cuando la traducción activa no contiene ninguna de esas subcadenas (p. ej. "Ranking"→"Classement" en francés, "Rangliste" en alemán, "Classifica" en italiano — dejan de coincidir con `"ranking"`), la clase nunca se activa y **toda** la capa de estilo premium del sidebar (no solo lo que se tocó en Mejora 2.2) deja de aplicarse.

**Verificado que es 100% preexistente:** se reprodujo el mismo caso (STAFF + francés) con `git stash` sobre el estado anterior a esta limpieza (PR #57 sin tocar) — resultado idéntico (`bodyClasses: ""`, logout a 21px). Ningún archivo tocado en este prompt participa en ese mecanismo (`internal-background-detector.js` y `role-background-detector.js` no se han modificado). Ver "Riesgos pendientes" — es, con diferencia, el hallazgo más importante de esta sesión, y bastante más grave que el bug de idioma ya corregido en Mejora 2.2 (aquel afectaba a 2 botones; este afecta a todo el sidebar y buena parte del resto de la app).

También se detectó que **neerlandés (`nl-NL`)** es seleccionable en el selector de idioma pero no tiene diccionario propio en `TRANSLATIONS` — cae en silencio a español. Es un vacío de contenido/i18n, no código muerto; no se ha tocado (fuera de alcance de housekeeping).

## Fase 6 — Auditoría de assets

No existe una carpeta `candidatas/` en este worktree (buscada en todo el árbol, no encontrada) — nada que conservar o tocar ahí.

| Asset | Tamaño | Uso real | Recomendación |
|---|---|---|---|
| `public/optimized/` (webp) | 29 MB | **Activo** — fondos por módulo y galería real en `App.jsx` (constante `GALLERY`) | Conservar |
| `public/gallery/` (jpg originales) | 112 MB | Solo referenciado por `visualAssets.js`, que solo consume el componente huérfano `ClubGallery.jsx` (nunca renderizado) | Candidato fuerte a archivar/optimizar en tarea dedicada — no tocado ahora |
| `src/components/ClubGallery.jsx` + `lazyGallery.js` + `visualAssets.js` | — | 0 renders reales; su contenido (5 fotos) está duplicado y sí en uso directamente dentro de `App.jsx` | Requiere decisión humana — candidato a eliminar en una tarea dedicada, con la certeza de que no se pierde nada (ya está duplicado en código activo) |
| `src/assets/hero.png` | 13 KB | 0 referencias encontradas | No tocar ahora; revisar en tarea dedicada (bajo impacto) |
| `public/icons.svg` | 8 KB | 0 referencias (manifest e index.html usan `/icons/icon-*.png`, no este SVG) | No tocar ahora; revisar en tarea dedicada (bajo impacto) |

## Riesgos pendientes (por orden de importancia)

1. **[El más importante]** `internal-background-detector.js` / `role-background-detector.js`: el estilo premium de toda la app (no solo el sidebar) depende de un escaneo de texto en español sobre `document.body.innerText`, y falla en varias combinaciones de idioma/rol reales (confirmado: STAFF+francés, STAFF+italiano, STAFF+alemán, y otras 9 combinaciones). Arreglarlo bien requiere sustituir el escaneo de texto por estado explícito de React (qué pantalla/rol está activo), lo cual es un cambio estructural real, no housekeeping — recomendado como el próximo prompt.
2. `cp04-two-buttons-fix.js`: mismo patrón de bug de "clase por texto en español" que ya se corrigió en `cp04-sidebar-fix.js` (Mejora 2.2), pero aplicado a otros botones (Reservar pista, Ir a reservas, Dar de alta, Pista 1, Reprogramar reserva, Consultar reservas) en pantallas fuera del sidebar. No corregido aquí — mismo motivo que el punto 1: cambiar el mecanismo es un cambio de comportamiento, no una limpieza.
3. `cp04-sidebar-fix.js` y `cp04-login-enter-white-final.js` duplican el mismo fix de botón "Entrar" del login con cobertura de eventos ligeramente distinta. No consolidado (ver Fase 3).
4. `src/App.css` — pendiente de este prompt, ya resuelto (eliminado con confirmación del usuario).
5. Assets de `public/gallery/` (112 MB) atados a código huérfano — pendiente de una tarea dedicada de assets.

## Checklist de validación

- [x] Los 1302 tests siguen en verde tras la limpieza.
- [x] Build sin errores nuevos; bundle CSS reducido (59.08 kB → 55.60 kB minificado).
- [x] Lint: 4 problemas (antes 5) — el warning de `useTutorialOrchestrator` desapareció al eliminar el archivo; 0 problemas nuevos.
- [x] `localhost:5175` → 200 antes y después.
- [x] Los 4 roles y los 6 idiomas con diccionario real probados con Chromium antes y después del cambio — mismo comportamiento exacto (incluida la reproducción del hallazgo #1, idéntica en ambos estados).
- [x] Ningún archivo eliminado tenía test propio ni consumidor real (estático o dinámico).
- [x] `/root/cp04-landings` no se ha tocado.
- [x] Sin merge.
