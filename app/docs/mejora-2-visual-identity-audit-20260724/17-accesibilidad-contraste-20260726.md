# Prompt 4 de 9 — Auditoría y corrección de accesibilidad, contraste y legibilidad

- **Fecha:** 2026-07-26
- **Worktree:** `/root/cp04-t-vite-watcher-fix` (app en `/root/cp04-t-vite-watcher-fix/app`)
- **Rama de partida:** `mejora-2-5/two-buttons-explicit-state-20260725` (PR #60, abierta, sin merge)
- **Continúa de:** [16-migracion-two-buttons-fix-20260725.md](16-migracion-two-buttons-fix-20260725.md), que ya anticipaba que podía haber más botones con el mismo defecto de contraste que el de "Entrar".

## Alcance y método

Auditoría con Chromium headless (`playwright-core`, aislado en el scratchpad de la sesión) midiendo **contraste real WCAG 2.x** (no estimado a ojo): fórmula de luminancia relativa aplicada a `getComputedStyle` real, con **composición alfa correcta** — cuando un fondo es semitransparente se mezcla con lo que hay detrás (más ancestros) en vez de tratarlo como opaco, y los fondos con `background-image` en gradiente se excluyen de la medición de texto (no hay forma fiable de leer un gradiente por CSSOM sin renderizarlo a canvas; se verificaron visualmente por captura en su lugar). Dos correcciones al propio método fueron necesarias durante la sesión y se documentan más abajo porque cada una cambió los resultados de forma sustancial.

Cobertura: pantalla de login completa (acceso real, acceso por roles, contraseña por rol, recuperar contraseña, crear cuenta) en los 7 idiomas del selector; y, para los 4 roles, las pantallas listadas en la Fase 9 del prompt (Inicio + 5-11 módulos por rol según permisos).

## Hallazgo principal: contraste ~1:1 en varios botones reales del login

### Causa raíz

`torcal-role-background.css` tiene dos reglas "catch-all" que dan aspecto de cristal a cualquier tarjeta/botón de la pantalla de rol:

```css
body.cp04-role-screen-active [style*="background"] { background-color: rgba(8,13,25,.24) !important; }
body.cp04-role-screen-active .cp04-card .cp04-card,
body.cp04-role-screen-active button,
body.cp04-role-screen-active [role="button"] { background-color: rgba(5,10,18,.22) !important; ... }
```

Ninguna de las dos distinguía el **propósito** de cada elemento. Capturaban también:

1. El aviso "Sin conexión a internet" y "Hay una nueva versión disponible" (`PwaStatusBanners`, `role="status"`), pensados con fondo naranja/lima sólido y texto oscuro elegido a propósito para ESE fondo (contraste real >6:1, verificado). Con el fondo forzado a oscuro, ese mismo texto oscuro quedaba en **1.07:1**.
2. Los botones "Enviar instrucciones" (recuperar contraseña) y "Crear cuenta" (registro), con `background:T.accent, color:"#071000"` — mismo patrón que el bug de "Entrar" ya corregido en el Prompt 3, pero nunca migrado a estos dos botones. Contraste real antes del fix: **~1:1** (texto invisible, confirmado con captura).

### Corrección

- Excluidos los descendientes de `[role="status"]` de ambas reglas catch-all, usando `:not(:where(...))` — **no** `:not(...)` a secas: un `:not()` normal habría subido la especificidad de la regla por encima de los fixes ya existentes (`cp04-login-submit-btn`, `cp04-login-entrar-white-btn`), rompiéndolos de nuevo. Esto ocurrió de verdad durante la sesión (ver "Regresión detectada" abajo) y se corrigió antes de continuar. `:where()` tiene especificidad cero siempre, así que la regla conserva exactamente la especificidad que ya tenía.
- "Enviar instrucciones": mismo fix que "Entrar" (Prompt 3) — `color:"#ffffff"` fijo en el JSX + clase `cp04-login-entrar-white-btn`.
- "Crear cuenta": reutiliza el fix ya validado y documentado de "Iniciar sesión" (`cp04-login-submit-btn`, con su propio bloque CSS de máxima especificidad, ya existente desde el Paso 07K).
- El botón "Reintentar" del aviso de conexión seguía en 4.02:1 tras excluir el `role="status"` (justo por debajo de 4.5:1) por un overlay decorativo propio (`background:"rgba(0,0,0,.12)"`). Se quitó ese overlay (prioridad "ajustar opacidad" antes que tocar colores, como pide el prompt) — contraste final >6:1.

### Regresión detectada y corregida dentro de la propia sesión

Al añadir `:not([role="status"])` (sin `:where()`) a la primera regla, su especificidad subió lo suficiente para **ganarle** a `.cp04-login-submit-btn`, rompiendo de nuevo el botón "Iniciar sesión" (que ya estaba correctamente arreglado desde antes de este prompt). Detectado por el propio re-test automatizado (el ratio de "Iniciar sesión" pasó de correcto a 1.02:1 en la siguiente pasada), diagnosticado por especificidad CSS y corregido usando `:where()` para que la exclusión no sume especificidad. Vuelto a verificar: 0 regresiones tras el cambio.

## Segundo hallazgo real: campos de formulario sin `<label>` asociado

`accessibleName()` (la función de la auditoría que replica cómo un lector de pantalla calcula el nombre accesible de un control) encontró 12 inputs/selects/textareas sin nombre accesible en **Alta de jugador**, **Baja de jugador**, **Cierre temporal de pista** y **Lista de espera**. Inspección del JSX: en los 4 formularios había un `<label>` visible justo encima de cada campo, pero **sin `htmlFor`/`id`** — los usuarios videntes lo ven bien (por eso no se había notado), pero un lector de pantalla no puede asociarlo al campo.

**Corrección:** añadido `id` único a cada input/select/textarea y `htmlFor` correspondiente a su `<label>` en los 4 formularios (29 pares en total). No se ha tocado ningún otro formulario porque el resto (Reservar, Reprogramar, Cancelar, Comunicaciones, Perfil) ya usaba `aria-label` directamente y no aparece en el inventario de fallos.

## Falsos positivos del propio método (corregidos antes de fiarse de los resultados)

1. **Gradientes:** `getComputedStyle().backgroundColor` no representa un fondo `background-image: linear-gradient(...)` — la primera pasada marcó ~50 "fallos" que eran en realidad botones activos del sidebar y CTAs con degradado lima/menta y texto oscuro **correctamente elegido para ese degradado** (mismo patrón ya validado en el Prompt 1). Corregido excluyendo de la medición cualquier elemento cuyo fondo (propio o de un ancestro cercano) sea un gradiente.
2. **Alfa sin componer:** la primera pasada trataba el primer `background-color` no-100%-transparente como si fuera opaco, en vez de mezclarlo con lo que hay detrás. Esto por sí solo ya daba un falso "1.04:1" en el aviso de conexión antes de saber que la causa real era la regla catch-all — corregido componiendo alfa correctamente capa por capa.
3. **Controles sin texto:** los interruptores (toggle) de privacidad del Perfil (`aria-label="Mostrar nivel de juego"`, etc., ya con nombre accesible correcto) daban "fallo de contraste" porque el `color` heredado no pinta nada cuando no hay texto visible — corregido midiendo contraste de texto solo cuando el control tiene contenido de texto propio.

## Verificación por idioma (login)

7 idiomas × 3 pantallas (selección de rol, contraseña por rol, recuperar contraseña) = 21 combinaciones, **0 fallos de contraste** tras el fix (antes: 21/21 con "Reintentar" fallando en las 3 pantallas × 7 idiomas = 21 fallos reales de ese único botón, más "Enviar instrucciones" e "Iniciar sesión" en un estado intermedio de la sesión). Neerlandés incluido — sin diccionario propio (cae en español, gap ya documentado), pero el contraste no depende del idioma.

## Verificación por rol (post-login)

4 roles × 5-12 pantallas cada uno (Inicio + módulos según Fase 9 del prompt) = 34 pantallas, **0 fallos de contraste, 0 campos sin nombre accesible** tras las correcciones.

| Rol | Pantallas verificadas |
|---|---|
| PLAYER | Inicio, Reservar, Torneos, Ranking, Comunidad, Perfil |
| STAFF | Inicio, Reservar, Alta/Baja de jugador, Reprogramar, Cancelar, Control QR, Calendario, Comunicaciones, Lista de espera, Cierre temporal, Perfil |
| ADMIN | Inicio, Admin, Dashboard KPI, Facturación, Backups, Automatizaciones, Torneos, Ranking, Perfil |
| SUPPORT | Inicio, Soporte, Centro técnico, Automatizaciones, Perfil |

## Foco de teclado (Fase 4/9)

Verificado con `Tab` real (no simulado): los botones muestran contorno lima 3px sólido; los campos de texto **no** usan `outline` sino `box-shadow` (anillo lima 3px) + cambio de `border-color` — ambos son indicadores de foco visibles y válidos, solo implementados con propiedades CSS distintas. No es un defecto.

## Responsive (390 / 768 / 1440 px)

Sin overflow horizontal en ninguno de los tres anchos, en la pantalla de login ni en la app ya autenticada (PLAYER/Inicio).

## Accesibilidad semántica (Fase 7, spot-check)

- Landmarks: `<nav>` (sidebar) y `<main>` (login y contenido principal, con `data-tour="main-content"`) presentes.
- Imágenes revisadas (galería, avatar, vista previa de avatar): las tres tienen `alt` descriptivo.
- No se ha encontrado ningún `<img>` sin `alt` en el código revisado.
- No se ha añadido ARIA nueva más allá de lo estrictamente necesario para los 12 campos sin nombre accesible (que se resolvió con `<label htmlFor>` nativo, no con `aria-label`, siguiendo la prioridad HTML-semántico-antes-que-ARIA del propio prompt).

## Problemas aplazados (documentados, no corregidos)

1. **Objetivo táctil <24px en enlaces de texto** ("Ver contraseña", "¿Has olvidado tu contraseña?", etc.): WCAG 2.5.8 tiene una excepción explícita para objetivos que son texto en línea dentro de una frase/párrafo, que es el caso de estos enlaces. No se han tocado — agrandarlos sería un cambio de layout no solicitado y de beneficio dudoso.
2. `cp04-two-buttons-fix.js` (Prompt 3) ya identificó y dejó pendiente: `cp04-login-entrar-white-final.js`... — no aplica, ya resuelto. Pendiente real heredado: ningún otro detector de texto activo conocido tras los Prompts 1-3.
3. No se ha instalado axe-core (no estaba ya disponible en el proyecto; añadirlo habría sido una dependencia nueva no solicitada). La medición de contraste se ha hecho con una implementación propia de la fórmula WCAG, verificada con casos conocidos (blanco/negro = 21:1, mismo color = 1:1) en `src/utils/contrastCheck.test.mjs`.

## Tests (Fase 12)

14 tests nuevos:
- `src/utils/contrastCheck.js` + `.test.mjs` (6 tests): fórmula WCAG pura y reutilizable, con los pares de color reales de la app (incluido el par exacto del bug ya corregido, para documentar que fallaba).
- `src/accessibilityAudit.test.mjs` (8 tests): inspección de fuente — confirma que las exclusiones `:where()` siguen en el CSS, que el overlay que rompía "Reintentar" no ha vuelto, que los 3 botones de login usan color fijo, y que los 29 pares label/campo de los 4 formularios corregidos siguen teniendo `htmlFor`/`id`.

## Checklist de validación

- [x] 1333/1333 tests (1319 + 14 nuevos).
- [x] Build correcto.
- [x] Lint: mismos problemas preexistentes, 0 nuevos.
- [x] `localhost:5175` → 200.
- [x] 0 fallos de contraste en 21 combinaciones de login (7 idiomas × 3 pantallas) tras el fix.
- [x] 0 fallos de contraste ni de nombre accesible en 34 pantallas de los 4 roles.
- [x] Regresión propia detectada y corregida en la misma sesión (especificidad CSS).
- [x] Responsive 390/768/1440 sin overflow horizontal.
- [x] Foco de teclado visible en login (botones por outline, campos por box-shadow).
- [x] Sin cambios de lógica de negocio, RBAC, rutas, textos visibles (salvo los ya cubiertos) ni traducciones.
- [x] `/root/cp04-landings` no tocado.
- [x] Sin merge.

## Checklist de validación humana en tablet

- [ ] Cargar la pantalla de login sin conexión real (modo avión) y confirmar que el aviso naranja "Sin conexión..." se lee con claridad, incluido el botón "Reintentar".
- [ ] Abrir "Crear cuenta" y "¿Has olvidado tu contraseña?" y confirmar que los botones de envío (lima) tienen texto legible.
- [ ] Rellenar Alta de jugador / Baja de jugador con un lector de pantalla (VoiceOver/TalkBack) y confirmar que cada campo anuncia su etiqueta correctamente.
- [ ] Navegar el login solo con teclado (Tab/Shift+Tab) y confirmar que el foco nunca se "pierde" visualmente.
- [ ] Confirmar en un móvil real que ningún botón de login queda cortado o inaccesible por el teclado en pantalla.

## Riesgos residuales

1. El patrón de "catch-all CSS + botón con color inline pensado para otro fondo" ya ha aparecido 4 veces entre los Prompts 3 y 4 (Entrar, Enviar instrucciones, Crear cuenta, Reintentar/Actualizar ahora). No se ha hecho una auditoría exhaustiva de **todo** el árbol de componentes buscando más casos — solo de las pantallas listadas en la Fase 9 del prompt — por lo que podrían existir más instancias en pantallas no cubiertas (p. ej. flujos menos frecuentes de Torneos o Comunidad).
2. Los toggles de privacidad de Perfil no se han medido por WCAG 1.4.11 (contraste de componentes no textuales) de forma rigurosa — visualmente el conjunto blanco/lima da un contraste alto, pero no se ha calculado el ratio exacto del "thumb" contra la pista.
