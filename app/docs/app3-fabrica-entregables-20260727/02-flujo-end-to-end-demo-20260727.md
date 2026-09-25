# App 3 — Prompt 2/6: Flujo end-to-end real de generación, clasificación y empaquetado

- **Fecha:** 2026-07-27
- **Rama:** `app3/prompt-2-end-to-end-demo-20260727`
- **Continúa de:** [01-arquitectura-base-20260727.md](01-arquitectura-base-20260727.md)

## Qué hace este prompt

Conecta los 10 componentes del Prompt 1/6 en un flujo real, ejecutable con `npm run app3:demo`, que genera un paquete completo de entregables para un proyecto de demostración — sin conectar Google Drive, sin llamadas externas, usando solo los 3 formatos con motor real (Markdown/HTML/SVG).

## Proyecto demo

`src/saas-core/deliverables/demo/demoProject.js` — **Clínica De Fisioterapia Málaga (demo)**, cliente ficticio, sector fisioterapia, alineado deliberadamente con el negocio de ejemplo ya existente en `src/saas-core/businesses/clinica-de-fisioterapia-malaga/` (generado por la fábrica SaaS en una sesión anterior) para no inventar una entidad nueva sin motivo. `projectId` estable (`demo_clinica-de-fisioterapia-malaga-demo`), branding ficticio con los colores reales de ese negocio, 8 dispositivos objetivo, 6 sistemas operativos objetivo, 10 tipos de entregable solicitados.

## El flujo (`cp04RunDemoFlow`, en `demoOrchestrator.js`)

1. **`cp04BuildDemoPackage`** (puro, sin tocar disco): pide a `ExportManager` (Prompt 1/6) cada entregable en un formato real. Cualquier formato del catálogo que no tenga motor real (PDF/DOCX/PPTX/PNG/JPG/WebP/MP4/GIF) se registra en `notImplemented`, nunca se simula.
2. **Denylist** (`denylist.js`): valida cada entrada antes de escribir nada — ninguna ruta puede coincidir con `.env`, `.git`, `node_modules`, claves, credenciales; ningún contenido puede parecer un secreto real (mismo patrón `SECRET_LOOKALIKE` que el resto del repo).
3. **Hash + versionado**: se lee el `manifest.json` anterior (si existe), se generan los checksums SHA-256 nuevos (`ManifestGenerator`, Prompt 1/6) y se comparan con `cp04DiffManifests`. La versión del paquete **solo sube si algo cambió de verdad** — repetir el flujo sin tocar nada mantiene la misma versión (idempotente, verificado con tests).
4. **Escritura a disco**: las 13 carpetas de `output/clientes/<cliente-demo>/` (Fase 5), cada entregable en su carpeta.
5. **Manifiesto**: `manifest/manifest.json` (completo), `manifest/manifest.jsonl` (una línea por entregable), `manifest/history.jsonl` (un registro por ejecución, nunca se sobrescribe — así "no se destruye la ejecución anterior").
6. **Cola Drive en dry-run**: cada archivo se encola en `DriveSyncManager` (Prompt 1/6); como `CP04_DRIVE_SYNC_ENABLED` no está activo, `processQueue()` devuelve `skipped_disabled` para los 21 elementos, que este flujo traduce a la etiqueta `dry_run` — **0 subidas reales**.
7. **Empaquetado**: se intenta un `.tar` con la herramienta `tar` ya presente en el sistema (`child_process.execFile`, argumentos en array, sin `shell:true` — sin riesgo de inyección), degradando a "no disponible" sin lanzar si `tar` no existiera en el entorno. No se instala ninguna dependencia de compresión.
8. **Índice + resumen**: `index.html` (tabla navegable con enlaces a cada entregable) y `RESUMEN.md` (versión, recuento, formatos pendientes).

## Resultado real de ejecutar `npm run app3:demo` en este entorno

- 21 entregables generados de verdad (Markdown/HTML/SVG).
- 27 combinaciones entregable×formato registradas como `not_implemented`, cada una con su motivo.
- 8 previsualizaciones SVG de mockup + galería HTML navegable.
- Manifiesto válido, historial de 2 ejecuciones (confirmando idempotencia: la segunda no subió de versión).
- `.tar` generado correctamente (`tar` disponible en este entorno).
- `npm run app3:demo:validate` → OK, 21 archivos comprobados, checksums correctos, 0 archivos denegados.

El árbol completo generado (`output/clientes/clinica-de-fisioterapia-malaga-demo/`) se versiona en este PR como evidencia legible; el `.tar` se ignora en git (regenerable, no aporta nada versionado — ver `.gitignore`).

## Las 8 especificaciones de mockup (Fase 4)

`mockupSpecs.js` — más ricas que el catálogo genérico del Prompt 1/6 (que solo tenía dispositivo+resolución): aquí cada una separa **dos estados honestos**: `placeholderStatus: "completed"` (el marco SVG que sí se genera hoy) y `captureStatus: "not_implemented"` (la captura de pantalla real de un navegador headless, reservada para un prompt futuro, con su `futureCapturePath` ya definido).

| Especificación | Sistema | Orientación | Resolución |
|---|---|---|---|
| Móvil Android vertical | Android | vertical | 412×915 |
| Móvil iOS vertical | iOS | vertical | 390×844 |
| Tablet Android horizontal | Android | horizontal | 1194×834 |
| iPad horizontal | iPadOS | horizontal | 1194×834 |
| Escritorio Windows | Windows | horizontal | 1920×1080 |
| Escritorio macOS | macOS | horizontal | 1440×900 |
| Escritorio Linux | Linux | horizontal | 1920×1080 |
| Web/PWA responsive | Web/PWA | adaptable | 1024×768 (referencia) |

## CLI

- `npm run app3:demo` — ejecuta el flujo completo.
- `npm run app3:demo:validate` — vuelve a leer el paquete en disco (nunca confía en la ejecución en memoria) y comprueba manifiesto + checksums + denylist.
- `npm run app3:demo:report` — informe de solo lectura (versión, recuento por estado, historial).

Los 3 aceptan `--base-dir=<ruta>` para apuntar a un directorio distinto del por defecto (`output/clientes/clinica-de-fisioterapia-malaga-demo/`).

## Tests

**47 tests nuevos**, cubriendo los 20 escenarios de la Fase 8 del prompt: creación del proyecto, flujo completo, repetición sin duplicar, cambio de contenido → nueva versión, manifiesto, índice HTML, SVG real, formatos no implementados sin extensiones falsas, clasificación por carpeta, las 8 especificaciones de mockup, ausencia de mezcla de carpetas, ausencia de secretos, DriveSync disabled sin invocar al adaptador, dry-run sin subir nada, hash coincidente, cola consistente, resumen correcto — más los tests de `demoValidator.js` (corrupción, archivo faltante, archivo denylisted colado) y `demoReport.js`.

## Validación técnica

- 1530/1530 tests (1483 + 47 nuevos).
- Lint idéntico a la rama base (4 errores preexistentes, 0 nuevos).
- Build correcto.
- `localhost:5175` → 200 (este prompt no toca ningún archivo de Club Pádel 04).
- 0 llamadas externas, 0 subidas a Drive, coste 0 €.

## Limitaciones honestas

1. Los 27 formatos pendientes son un límite de motor, no un error del flujo — igual que en el Prompt 1/6.
2. La captura de pantalla REAL de cada mockup (más allá del marco SVG) requeriría un navegador headless — no se conecta en este prompt.
3. El `.tar` depende de que la herramienta `tar` esté presente en el sistema; el flujo degrada honestamente (`created:false` + motivo) si no lo está, en vez de fingir un paquete.

## Siguiente prompt recomendado (3/6)

Conectar un motor real de captura de pantalla para las 8 especificaciones de mockup (usando una herramienta ya evaluada y gratuita, p. ej. un navegador headless ya cacheado en el entorno como en auditorías anteriores de esta sesión) — sin tocar todavía PDF/DOCX/PPTX ni Google Drive, para cerrar primero la brecha de "captura real" antes de abordar formatos de documento binarios.
