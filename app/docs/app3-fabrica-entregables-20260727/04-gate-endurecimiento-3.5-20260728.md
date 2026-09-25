# App 3 — Prompt 3.5: Gate de endurecimiento técnico previo al Prompt 4/6

- **Fecha:** 2026-07-28
- **Rama:** `app3/prompt-3.5-hardening-gate-20260728`
- **Continúa de:** [03-capturas-reales-mockups-20260727.md](03-capturas-reales-mockups-20260727.md)
- **No añade funcionalidad comercial. No inicia el Prompt 4/6.**
- **Estado de integración:** PR [#71](https://github.com/56788862726252627/cp04-landings/pull/71) — commit `dcfc00f`, fusionado por merge commit `416a6e4` sobre `docs/resultado-merge-pr52-66-20260727`. **Gate 3.5: APROBADO.** Condición para iniciar el Prompt 4/6: cumplida (sin deuda crítica pendiente en las 14 áreas auditadas).

## Objetivo

Sprint técnico limitado de auditoría y endurecimiento sobre los 3 prompts ya integrados de App 3 (arquitectura, flujo end-to-end, capturas reales), antes de ampliar el alcance. Cierra únicamente deuda técnica **real y comprobada** en 14 áreas: contrato binario, renderer wiring, idempotencia, ciclo de vida de capturas, timeouts, egress fail-closed, serialización, memoria, escritura atómica, sanitización, rutas confinadas, manifiestos seguros, recuperación de fallos, prevención de Chromium huérfano.

## Alcance

Todo `src/saas-core/deliverables/` (Prompt 1/6, 2/6 y 3/6) y `app3-cli/`. No se tocó ningún archivo de Club Pádel 04 fuera de App 3, no se activó Drive, no se introdujeron credenciales ni dependencias nuevas.

## Metodología

Auditoría área por área contra el código real (no contra suposiciones). Regla aplicada estrictamente: **si el código ya cumplía el criterio, se documenta la evidencia y no se toca** — no se inventan correcciones sobre código correcto.

## Hallazgo real #1 (el único cambio de código de este gate): escritura de manifiestos no atómica

**Área:** #9 escritura atómica, #12 manifiestos seguros, #13 recuperación de fallos.

`manifest.json` (Prompt 1/2) y `mockups-manifest.json` (Prompt 3) se escribían con `writeFile(path, content)` directo. `writeFile` trunca el archivo destino antes de escribir el contenido nuevo — si el proceso se corta a mitad de esa escritura (exactamente lo que le pasó a esta misma sesión con signal 9, aunque en aquel caso no llegó a tocar el manifiesto), el archivo queda vacío o con JSON incompleto.

El código que lee el manifiesto anterior (`loadPreviousManifest`/`loadPreviousMockupsManifest`) ya capturaba el `JSON.parse` fallido con un `try/catch` — así que un manifiesto corrupto **no rompía la siguiente ejecución** (se trataba como "no existe manifiesto anterior", cayendo a versión 1). Pero sí se **perdía silenciosamente el historial de versiones** y el archivo corrupto quedaba en disco hasta la siguiente escritura exitosa — un estado observable y confuso para cualquiera que inspeccionara el paquete a mano.

**Cambio aplicado:** `cp04WriteManifestAtomic(filePath, content)`, nueva función en `manifestGenerator.js` (módulo ya compartido por ambos flujos). Escribe a un archivo temporal en el mismo directorio (`.{nombre}.tmp-{pid}-{random}`) y hace `rename()` sobre el destino final — atómico en POSIX dentro del mismo sistema de archivos: el archivo final queda con el contenido completo nuevo, o sigue con el contenido anterior intacto, nunca a medias. Si la escritura al temporal falla, se limpia el temporal y se relanza el error sin tocar el archivo final.

Conectado en los 2 puntos de escritura de manifiesto: `demoOrchestrator.js` (`manifest/manifest.json`) y `captureOrchestrator.js` (`mockups/mockups-manifest.json`).

**Tests nuevos (5, en `manifestGenerator.test.mjs`):** contenido exacto en destino, sin temporal residual tras éxito, sobrescritura completa (nunca mezcla contenido viejo/nuevo), fallo limpio si el directorio no existe (sin huérfanos), y transición de un manifiesto previo válido a uno nuevo sin estado intermedio observable.

## Riesgos descartados (auditados, sin cambios — código ya correcto)

| # | Área | Evidencia |
|---|---|---|
| 1 | Contrato binario | `exportFormats.js` declara explícitamente `implemented`, `mimeType`, `extension`, `engine`, `requiresDependency` por formato; `exportManager.js` nunca marca `completed` sin pasar por un pipeline real; los 8 formatos sin motor (PDF/DOCX/PPTX/PNG/JPG/WebP/MP4/GIF) devuelven `not_implemented` en todas las combinaciones de entorno (test ya existente: "nunca devuelve status 'completed' bajo ninguna combinación de entorno"). |
| 2 | Renderer wiring | Cada entrada de `captureOrchestrator.js` escribe con la extensión que corresponde a su contenido real (`-raw.png` = PNG real, `-framed.svg` = SVG real, `-metadata.json` = JSON real) — no hay ninguna ruta donde el nombre de archivo prometa un formato distinto al contenido escrito. |
| 3 | Renderer PNG genérico vs capturas reales | El catálogo general (`exportFormats.js`, PNG para iconos/logos) y el capturador real (`captureValidator.js`, PNG de pantallazo) son dos pipelines completamente separados con sus propios validadores — no hay cruce ni confusión posible entre ambos. |
| 4 | Rutas confinadas / traversal | Todos los segmentos de ruta usados por `capturePlan.js`/`captureOrchestrator.js` (`job.folder`, `job.name`) provienen de registros estáticos hardcodeados (`viewportRegistry.js`, `CP04_APP_SCREENS`) — ningún dato de usuario o de proyecto se concatena directamente en una ruta de archivo hoy. `folderStructure.js` (Prompt 1/6) ya sanea segmentos de nombre de proyecto para cuando eso deje de ser cierto (test ya existente: "evita inyectar '/' en un nombre de proyecto"). |
| 5 | Inyección de shell | Único uso de subproceso: `execFile("tar", [...])` con argumentos en array, sin `shell:true` — sin superficie de inyección. |
| 6 | Egress fail-closed | Barrido completo de `src/saas-core/deliverables/` y `app3-cli/`: cero `fetch()`/`http(s)://` salvo `http://localhost:5175` (servidor local, esperado) y el namespace XML `http://www.w3.org/2000/svg` (declaración estática dentro de un string SVG, no una petición de red). Drive: `CP04_DRIVE_SYNC_ENABLED` debe ser `"true"` explícito o `driveAdapter.js` devuelve `not_configured` — nunca se activa por defecto. |
| 7 | Idempotencia | `versionChecksum` (Prompt 3/6) ya separa la identidad de contenido del timestamp volátil; `checksum` real de archivo se mantiene intacto para integridad. Reejecutar sin cambios reales no sube de versión (verificado con tests, incluyendo tras este gate). |
| 8 | Ciclo de vida de Chromium | `browserCaptureAdapter.js`: `page.close()` en `finally` de cada `capture()`. `captureOrchestrator.js`: `adapter.close()` en `finally`, solo si `ownsAdapter` (fix del Prompt 3/6). Reconfirmado en esta sesión: 0 procesos Chromium huérfanos tras cada una de las ~10 ejecuciones de test con navegador realizadas en este gate. |
| 9 | Timeout de `adapter.close()` | Se consideró añadir un timeout explícito alrededor de `browser.close()` por si colgara. **Descartado**: sin evidencia empírica de que haya colgado nunca (se cerró con éxito en más de 25 ejecuciones reales de Chromium a lo largo de esta sesión y la anterior). Añadir código especulativo sin un fallo real observado violaría la regla de este gate ("no inventes correcciones"). Queda como candidato si алgún día se observa un cuelgue real. |
| 10 | Memoria: acumulación de buffers | `captureOrchestrator.js` mantiene todos los buffers de una tanda de captura en memoria hasta escribir el manifiesto (necesario para el diff de versionado contra el manifiesto anterior). Es el mismo patrón ya usado por `demoOrchestrator.js` (Prompt 1/2). Para el volumen real (~12 capturas por tanda, PNGs de cientos de KB a pocos MB) esto no es la causa de ningún problema observado — la causa real del OOM de la sesión anterior fueron procesos Chromium completos sin cerrar (ya corregido en Prompt 3/6), no buffers de imagen. Refactorizar a streaming sería un cambio arquitectónico mayor, fuera del alcance de un sprint de endurecimiento limitado. |
| 11 | Serialización de tests con navegador | Ya establecida como disciplina operativa desde el Prompt 3/6 (`--test-concurrency=1`, un archivo por proceso) — reconfirmada en este gate sin incidentes. |

## Política de memoria

Sin cambios de código. Disciplina operativa mantenida: memoria comprobada antes/después de cada ejecución pesada, timeout estricto, `workers=1`, un solo proceso Chromium a la vez.

## Política de egress

0 llamadas externas por defecto en todo App 3. Toda integración externa (Drive) requiere activación explícita vía variable de entorno y sigue sin activarse. Coste 0 €.

## Sanitización y escritura atómica

Sanitización de rutas ya cubierta por `folderStructure.js` (Prompt 1/6, sin cambios). Escritura atómica añadida específicamente para los 2 manifiestos críticos (`manifest.json`, `mockups-manifest.json`) — ver hallazgo #1. El resto de escrituras (contenido de entregables individuales, capturas PNG/SVG, `index.html`, `RESUMEN.md`) no recibieron el mismo tratamiento: su corrupción parcial no tiene el mismo efecto en cascada que la del manifiesto (no alimentan la lógica de versionado/idempotencia) y extenderlo a todos los `writeFile` del árbol habría sido un cambio mucho más amplio que la deuda real identificada.

## Manifiestos

`checksum` (integridad de archivo en disco) y `versionChecksum` (identidad de contenido para versionado, excluye campos volátiles) siguen separados desde el Prompt 3/6, sin cambios adicionales en este gate más allá de la escritura atómica.

## Rollback

Cambio aislado a una función nueva (`cp04WriteManifestAtomic`) y sus 2 puntos de uso. Revertir es un `git revert` limpio del commit de este gate sin efectos secundarios — no toca ninguna otra lógica.

## Limitaciones conocidas

- La atomicidad de `rename()` es una garantía POSIX del sistema de archivos local; no cubre almacenamiento de red (irrelevante aquí, todo es local).
- No se auditaron áreas fuera de la lista de 14 (p. ej. rendimiento del compositor SVG, cobertura de tests más allá de lo ya existente) — deliberado, para mantener el sprint limitado.

## Condiciones para iniciar el Prompt 4/6

Este gate no bloquea el Prompt 4/6: no se encontró ninguna deuda crítica sin cerrar. La única deuda técnica real (escritura de manifiestos no atómica) queda cerrada y probada. Las áreas descartadas están descartadas con evidencia, no por omisión.
