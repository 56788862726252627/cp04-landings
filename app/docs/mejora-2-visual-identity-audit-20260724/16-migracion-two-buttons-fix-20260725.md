# Prompt 3 de 9 — Eliminar lógica basada en texto de cp04-two-buttons-fix.js

- **Fecha:** 2026-07-25/26
- **Worktree:** `/root/cp04-t-vite-watcher-fix` (app en `/root/cp04-t-vite-watcher-fix/app`)
- **Rama de partida:** `mejora-2-4/react-state-background-detection-20260725` (PR #59, abierta, sin merge)
- **Continúa de:** [15-migracion-detectores-estado-react-20260725.md](15-migracion-detectores-estado-react-20260725.md)

## Problema original

`cp04-two-buttons-fix.js` forzaba texto blanco en botones concretos de la pantalla Inicio y otros formularios, localizándolos por su **texto visible en español** (`button.innerText`), con el mismo patrón ya corregido en los Prompts 1-2: normalizar texto, comparar con subcadenas fijas, `MutationObserver` sobre todo `document.body`, `setTimeout` ×4, listeners de navegación.

## Auditoría completa (Fase 1)

Comprobaciones que hacía sobre cada `<button>` de la página (excluyendo los del `.cp04-sidebar`, ya excluidos explícitamente por un comentario del Paso 07K):

| Condición de texto | ¿Existe ese botón de verdad? |
|---|---|
| `includes('reservar pista')` | **No** — ningún botón real produce ese texto exacto (solo aparece en un encabezado y en un párrafo, no en un `<button>`) |
| `includes('ir a reservas')` | **No** — la clave de traducción `home.ir_reservas` existe en los 8 idiomas pero nunca se invoca con `tx()` en ningún JSX; código muerto desde antes de esta migración |
| `includes('dar de alta')` | **Sí** — botón de envío de `AltaJugador` (`tx("alta.btn")`) |
| `=== 'pista 1'` (exacto) | **Sí** — dos apariciones: el selector de pista dentro de `Reservas` (`<Btn>{c.name}</Btn>`, vía `COURTS.map`) y el selector de pista dentro de `ReprogramarReserva` (`<button>{item.name}</button>`, su propio `COURTS.map`) |
| `includes('reprogramar reserva')` | **Sí** — botón de envío de `ReprogramarReserva` (`tx("reprog.btn")`) |
| `includes('consultar reservas')` | **Sí** — botón de `Gestion()` (texto literal hardcodeado, ni siquiera pasa por `tx()`) |

Selectores/mecanismos usados: `document.querySelectorAll('button')` (global, sin scope), `button.innerText`/`textContent`, `.includes()`, comparación `===`, `button.classList.add/remove`, `button.style.setProperty(..., 'important')` (en el propio botón y en **todos sus hijos**, `querySelectorAll('*')`), `MutationObserver` sobre `document.body` (`childList`, `subtree`, `characterData`), `setTimeout` ×4, `load`/`popstate`/`hashchange`.

Clases que añadía/quitaba: `cp04-fix-white-action-btn` (común a los 4 botones reales) + una clase específica por botón (`cp04-fix-dar-alta-btn`, `cp04-fix-pista-1-btn`, `cp04-fix-reprogramar-reserva-btn`, `cp04-fix-consultar-reservas-btn`), más dos clases (`cp04-fix-reservar-pista-btn`, `cp04-fix-ir-reservas-btn`) que **nunca llegaban a asignarse a nada**.

CSS dependiente: `cp04-legibility-polish.css` ya tenía reglas declarativas (`color:#fff !important` + `text-shadow`/`font-weight`/`opacity`) para las 6 clases — el `style.setProperty` inline del script era, en la práctica, **redundante** con el CSS existente para los 4 botones reales (el CSS ya bastaba una vez la clase estuviera puesta).

## Botones reales identificados (Fase 2)

| Botón | Componente | Cómo se identifica ahora |
|---|---|---|
| "Dar de alta" | `AltaJugador` (línea ~5823) | `className` estático `cp04-fix-white-action-btn cp04-fix-dar-alta-btn` |
| "Pista 1" (en Reservas) | `Reservas`, dentro de `COURTS.map` | `className={c.id===1 ? "cp04-fix-white-action-btn cp04-fix-pista-1-btn" : undefined}` |
| "Pista 1" (en Reprogramar) | `ReprogramarReserva`, su propio `COURTS.map` | `className={item.id === 1 ? "cp04-fix-white-action-btn cp04-fix-pista-1-btn" : undefined}` |
| "Reprogramar reserva" | `ReprogramarReserva` (botón de envío) | `className` estático |
| "Consultar reservas" | `Gestion()` | `className` estático |

El identificador de "Pista 1" es `id === 1` (dato interno de la constante `COURTS`), **no** el texto "Pista 1" — así Pista 2/3/4 nunca reciben la clase, igual que antes, pero sin comparar strings.

## Arquitectura anterior vs. nueva

**Antes:** script global, sin scope, escaneaba todos los botones de la página en cada mutación del DOM, comparando texto en español.

**Ahora:** cada botón lleva su `className` fijado en el propio JSX en el momento de crearse — cero JavaScript post-render, cero `MutationObserver`, cero texto. El CSS que ya existía (declarativo, por clase) no ha cambiado de mecanismo, solo ha dejado de depender de que un script se lo asigne dinámicamente.

## Fase 5 — Duplicación del botón "Entrar" del login (hallazgo adicional)

Auditando la duplicación ya señalada en el Prompt 1 apareció un **bug real, no solo una duplicación**: el botón "Entrar" del formulario de contraseña por rol (`ltx("login.entrar")`, `App.jsx`) tenía en el JSX `color:"#071000"` (texto oscuro) en su `style` inline — pensado para el fondo `T.accent` (lima) que también lleva en el mismo `style`. Pero `body.cp04-role-screen-active button { background-color: rgba(5,10,18,0.22) !important; background-image: none !important; ... }` (`torcal-role-background.css`, regla genérica para *todos* los botones de la pantalla de rol, ya determinista desde el Prompt 2) **siempre** gana sobre ese fondo lima inline. El resultado: fondo oscuro real + texto oscuro del JSX = **texto invisible**, salvo que uno de los dos scripts de "Entrar en blanco" lo corrigiera forzando `color:#fff` con estilo inline `!important`.

Ambos scripts (`cp04-sidebar-fix.js` → clase `cp04-login-entrar-white-btn`; `cp04-login-enter-white-final.js` → clase `cp04-login-enter-white-final`) solo actuaban cuando el texto del botón era **exactamente** `"entrar"` — cierto en español (`"Entrar"`) y portugués (`"Entrar"`, coincidencia), pero no en inglés (`"Enter"`/`"Sign in"`), francés (`"Entrer"`), italiano (`"Entra"`) ni alemán (`"Eintreten"`). **Confirmado visualmente con Chromium antes de tocar nada:** en inglés el botón "Enter" no mostraba ningún texto legible (capturas en `docs/mejora-2-visual-identity-audit-20260724/16-*` — ver también evidencia en esta sesión).

**Corrección:** se cambió el propio `color:"#071000"` del JSX a `color:"#ffffff"` (arreglo directo, sin depender de ningún script) y se le añadió además la clase estática `cp04-login-entrar-white-btn` (refuerzo declarativo, mismo patrón que los otros 4 botones). Se eliminaron los dos scripts duplicados — ambos quedaban reducidos, tras retirarles esta función, a código muerto (`cp04-sidebar-fix.js` ya no tenía nada más desde el Prompt 2; `cp04-login-enter-white-final.js` era una IIFE dedicada por completo a esto). En CSS se retiraron las dos reglas ahora redundantes (`cp04-login-entrar-definitivo`, nunca asignada por nadie desde ningún script — código muerto ya antes de esta migración; y `cp04-login-enter-white-final`, asignada solo por el script eliminado), dejando una única regla activa para `cp04-login-entrar-white-btn`.

## Regresión detectada y corregida durante la propia migración

Al mover el color de "texto forzado con `!important` inline" (que en CSS gana siempre, sin importar especificidad) a "clase CSS con `!important`" (que sí compite por especificidad), el botón **"Consultar reservas"** —deshabilitado por defecto hasta que se escribe un email— perdía el blanco: una regla genérica ya existente (`body.cp04-module-screen-active button:disabled { color: #8FA7A0 !important; }`, más específica) ganaba la pulseada. Detectado con Chromium (computed `color: rgb(143, 167, 160)` en vez de blanco) antes de dar la migración por cerrada. Corregido añadiendo una regla `:disabled` específica para los 4 botones reales con especificidad suficiente (`body.cp04-module-screen-active button.cp04-fix-X-btn:disabled`). Verificado tras el fix: los 4 botones dan `rgb(255, 255, 255)` en su estado deshabilitado.

## Archivos

**Eliminados** (0 referencias tras el cambio, sin tests propios):
- `src/cp04-two-buttons-fix.js`
- `src/cp04-sidebar-fix.js` (ya sin función tras el Prompt 2; ahora tampoco tenía la del botón Entrar)
- `src/cp04-login-enter-white-final.js`

**Modificados:**
- `src/App.jsx` — quita los 3 imports; añade `className` estático a los 5 botones reales (incluido Entrar); corrige `color` inline del botón Entrar.
- `src/cp04-legibility-polish.css` — retira las reglas de las 4 clases muertas; añade el bloque `:disabled` para los 4 botones reales; comentarios actualizados.

**Nuevos:**
- `src/twoButtonsMigration.test.mjs` — 8 tests (inspección estática de fuente).

## Tests (Fase 8)

8 tests nuevos, todos por inspección estática de `App.jsx`/`cp04-legibility-polish.css` (no hay lógica pura nueva que extraer a un módulo, a diferencia del Prompt 2): confirman que los 3 scripts no existen, que no se importan, que las clases están puestas de forma estática, que "Pista 1" se identifica por `id` y no por texto, que no queda ningún patrón `.includes('texto')`/`=== 'texto'` de los que se han migrado, y que el CSS de las clases muertas ha desaparecido mientras el de las clases reales (con su variante `:disabled`) sigue presente.

## Validación multiidioma y por rol (Fases 6-7)

Chromium headless, 35 comprobaciones (7 idiomas × 5 elementos: Entrar + 4 botones), rol STAFF para las pantallas con los 4 botones + comprobación aparte del selector de rol para "Entrar":

- **es-ES, en-GB, fr-FR, it-IT, pt-PT, de-DE, nl-NL: 35/35 en blanco (`rgb(255,255,255)`).**
- Antes del fix del botón Entrar: roto en inglés/francés/italiano/alemán (texto invisible, confirmado con captura).
- Spot-check adicional por rol: PLAYER (Pista 1 en Reservas), ADMIN (Reprogramar y Dar de alta), SUPPORT (Consultar reservas) — los 4 correctos.

## Riesgos residuales

1. `internal-background-detector.js`/`role-background-detector.js` y `cp04-two-buttons-fix.js` eran los tres focos de detección por texto conocidos; con este Prompt 3 los tres están migrados. No se ha encontrado ningún cuarto detector de texto en esta auditoría.
2. "Consultar reservas" sigue con su texto hardcodeado en español (no usa `tx()`) — vacío de contenido preexistente, no de arquitectura; fuera de alcance (no cambiar textos visibles).
3. `home.ir_reservas` sigue siendo una clave de traducción huérfana (8 idiomas, nunca invocada) — no se ha tocado (no cambiar traducciones).

## Checklist de validación

- [x] 1319/1319 tests (1311 + 8 nuevos).
- [x] Build correcto, CSS reducido (55.60 kB → 52.56 kB minificado tras los tres prompts).
- [x] Lint: mismos problemas preexistentes, 0 nuevos.
- [x] `localhost:5175` → 200.
- [x] 7 idiomas × 5 elementos (35 combinaciones) verificados con Chromium — 0 problemas.
- [x] 4 roles verificados (spot-check PLAYER/ADMIN/SUPPORT + suite completa STAFF).
- [x] Bug real de contraste en el botón "Entrar" (4 de 7 idiomas) encontrado y corregido, con evidencia antes/después.
- [x] Regresión de estado `:disabled` detectada y corregida durante la propia migración, con evidencia antes/después.
- [x] Sin cambios de lógica de negocio, RBAC, rutas, Make/Airtable/Stripe/WhatsApp, textos ni traducciones.
- [x] `/root/cp04-landings` no tocado.
- [x] Sin merge.
