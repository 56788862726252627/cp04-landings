# App 3 — Prompt 3/6: Capturas reales de mockups (recuperación de sesión + cierre)

- **Fecha:** 2026-07-28
- **Rama:** `app3/prompt-3-real-mockups-20260727`
- **Continúa de:** [02-flujo-end-to-end-demo-20260727.md](02-flujo-end-to-end-demo-20260727.md)

## Contexto: recuperación tras signal 9

La sesión anterior terminó con signal 9 mientras corría `mockupsGallery.test.mjs`. Esta sesión no reinició el trabajo: los 10 módulos de `src/saas-core/deliverables/capture/` (implementación + tests) ya estaban escritos y se conservaron íntegros. El trabajo de esta sesión fue diagnóstico, corrección y verificación — no reescritura.

### Inspección inicial

Al arrancar, seguían vivos varios procesos huérfanos (`PPID=1`, reparentados a `init`) de la sesión cortada: un wrapper `timeout 60 node --test ...` con 23+ minutos de ejecución real (el `timeout` no lo había matado) y 6 procesos Chromium zygote de playwright, todos del mismo binario cacheado (`ms-playwright/chromium-1228`) con perfiles en `/tmp/playwright_chromiumdev_profile-*`. Se terminaron uno por uno con `kill -TERM` por PID exacto (nunca `pkill` genérico) — todos respondieron limpio, sin necesitar `SIGKILL`. El servidor de Vite (puerto 5175) no se tocó.

### Causa raíz real del signal 9

`cp04RunMockupCaptureFlow` (`captureOrchestrator.js`) creaba un `BrowserCaptureAdapter` propio cuando el caller no pasaba uno (`options.adapter || cp04CreateBrowserCaptureAdapter()`) pero **nunca lo cerraba** — no había ningún `adapter.close()` en toda la función. Cada test que la llama sin adapter propio (14 llamadas repartidas en 4 archivos de test) lanzaba un Chromium real que quedaba vivo indefinidamente. Con ~2 GB disponibles y cada Chromium consumiendo 150-300 MB, la acumulación agotaba la memoria.

El adaptador de bajo nivel (`browserCaptureAdapter.test.mjs`) sí gestionaba el ciclo de vida correctamente (`try/finally` con `close()`) — el fallo estaba aislado al orquestador.

**Fix:** `captureOrchestrator.js` ahora distingue `ownsAdapter = !options.adapter` y cierra el adapter en un `finally` solo si lo creó él mismo.

## Disciplina de ejecución aplicada

- Un único archivo de test por proceso (`node --test <un-archivo>`), nunca varios archivos Chromium a la vez.
- Para la suite completa: `node --test --test-concurrency=1 $(find ...)` — fuerza a Node a procesar los ~150 archivos de test estrictamente uno detrás de otro, aunque se invoquen en una sola llamada.
- Comprobación de memoria (`free -h`) y de procesos Chromium huérfanos antes y después de cada archivo pesado.
- `timeout` estricto por ejecución.
- `workers=1` (concurrencia 1) en toda la sesión.

## Bugs reales encontrados al poder ejecutar los tests hasta el final (antes tapados por el crash)

Con el navegador liberándose correctamente, los tests dejaron de colgarse — y expusieron 3 fallos reales preexistentes, ninguno relacionado con concurrencia:

### 1. Desbordamiento horizontal en viewport móvil (412px)

`buildIndexHtml` (`demoOrchestrator.js`, Prompt 2/6) generaba una tabla con `table-layout:auto` (por defecto): sin envolver texto, el navegador expande columnas según el contenido natural (tokens como `documentacion_comercial`, rutas largas) hasta superar los 412px del viewport Android, aunque el CSS dijera `width:100%`. `cp04ValidateNoUnexpectedOverflow` lo detectaba correctamente (scrollWidth 616 vs 412).

**Fix:** `table-layout:fixed` + `word-break:break-word` + `overflow-wrap:anywhere` en las celdas + `<meta name="viewport">`. Técnica estándar de tabla responsive, sin tocar ningún dato ni contenido.

### 2. Falso positivo del heurístico "color sólido" en resoluciones de escritorio

El heurístico de `captureValidator.js` (bytes de píxel sin variación tras el filtrado PNG) usaba un umbral de `0.97`. Se midió con capturas reales:

| Captura | zero-ratio medido |
|---|---|
| `about:blank` a 1920×1080 (en blanco de verdad) | 99.98% |
| `index.html` real a 1920×1080 (contenido real, mucho fondo uniforme) | 97.2% |

Con `0.97`, una página con contenido real pero generosa en fondo oscuro (normal a resolución de escritorio) se marcaba como "posible pantalla en blanco". Verificado visualmente (ver captura adjunta al PR) que el contenido era correcto, no un fallo de renderizado.

**Fix:** umbral recalibrado a `0.99` — separa con margen ambos casos reales medidos, sin perder la detección de pantallas realmente en blanco.

### 3. `capturedAt` rompía la idempotencia del versionado

`buildMetadata` incluye `capturedAt: new Date().toISOString()` en cada `*-metadata.json` — honesto (es la hora real de la captura), pero volátil: cambia en cada ejecución aunque el PNG sea pixel-idéntico. Como el checksum de cada item se calculaba sobre el contenido literal del archivo, dos capturas idénticas nunca podían coincidir de checksum → el manifiesto subía de versión en cada ejecución, aunque nada hubiera cambiado de verdad.

**Fix — separación de responsabilidades, no una sola sustitución:**
- `checksum`: sigue siendo el hash real del contenido en disco (lo que valida `mockupsValidator.js` para detectar corrupción — comportamiento intacto, test de corrupción sigue en verde).
- `versionChecksum` (nuevo, opcional): hash sobre el contenido sin `capturedAt`, usado solo para decidir si hay que subir de versión.
- `cp04DiffManifests` (`manifestGenerator.js`, Prompt 1/6, compartido) ahora compara `versionChecksum ?? checksum` — con fallback automático a `checksum` cuando el item no declara `versionChecksum`, así el manifiesto del Prompt 1/2 (`manifest.json`) se comporta exactamente igual que antes (34/34 tests de ese módulo siguen en verde).

## Otro hallazgo: el servidor de Vite murió durante la sesión

En algún punto de las ejecuciones intensivas de Chromium, el proceso de Vite (puerto 5175) dejó de responder — probablemente presión de memoria puntual del entorno (~100-300 MB libres en varios momentos). No hay `dmesg`/`journalctl` accesibles en este entorno para confirmar un OOM-kill del kernel, pero la desaparición fue silenciosa y coincide en tiempo. Se reinició (`vite --host 0.0.0.0 --port 5175`) y se reconfirmó HTTP 200 antes de cerrar la sesión. Ningún archivo de Club Pádel 04 fuera de esta captura se tocó.

## Lint

El módulo `capture/` no se había lintado nunca (la sesión anterior murió antes de llegar a ese paso). Se corrigieron 9 errores propios del módulo: `Buffer` no importado explícitamente (`import { Buffer } from "node:buffer"`, mismo patrón ya usado en otros archivos de `src/saas-core`), un import no usado, y variables de destructuring descartadas sin usar (sustituidas por `delete` sobre una copia superficial, sin cambiar el comportamiento). Los 4 errores restantes de `npm run lint` (`App.jsx` ×2, `AuthContext.jsx`, `DemoSafeNotice.jsx`) son preexistentes, no tocados en esta sesión, fuera del alcance de App 3.

## Resultado final verificado

- **Tests del módulo `capture/`:** 10 archivos, 53 tests, todos en verde, ejecutados serializados uno por uno.
- **Suite completa del repo:** `1583/1583` tests, 0 fallos (dos pasadas completas de verificación).
- **Lint:** módulo `capture/` limpio; 0 errores nuevos introducidos en el resto del repo.
- **Build:** `npm run build` — éxito en 1.5s.
- **HTTP 200 en `localhost:5175`:** confirmado tras reiniciar el servidor.
- **0 llamadas externas:** todas las URLs de captura son `file://` locales o `http://localhost:5175`; único `http://` restante en el código es el namespace XML de un SVG (`http://www.w3.org/2000/svg`), no una petición de red.
- **0 subidas a Drive:** cola en `dry-run`, `CP04_DRIVE_SYNC_ENABLED` no activa.
- **Coste 0 €:** Chromium local ya cacheado, sin APIs de pago, sin servicios cloud.
- **Memoria:** estable en todas las ejecuciones (ninguna caída por debajo de ~100 MB disponibles de forma sostenida; ningún proceso Chromium huérfano al finalizar ninguna ejecución).

No se inició el Prompt 4/6. No se hizo merge. No se usó `git reset --hard` ni `git clean` ni force push.
