# App 3 — Prompt 5/6: Empaquetado comercial final y entrega profesional

- **Fecha:** 2026-07-28
- **Rama:** `app3/prompt-5-empaquetado-final-20260728`
- **Continúa de:** [05-motores-binarios-20260728.md](05-motores-binarios-20260728.md)

## Objetivo

Empaquetar en una entrega profesional final todo lo que los Prompts 1-4 ya generan por separado: texto/SVG (Prompt 2/6), capturas reales (Prompt 3/6) y binarios reales PDF/DOCX/PPTX (Prompt 4/6). Sin regenerar nada — el empaquetador solo lee, valida y reorganiza lo que ya existe en disco.

## Arquitectura

`src/saas-core/deliverables/packaging/`:

- **`exportPackageManager.js`** — orquestador (`cp04BuildFinalExportPackage`). Descubre los manifiestos de origen presentes en `sourceBaseDir` (`manifest/manifest.json` de Prompt 2/6 o Prompt 4/6, y/o `mockups/mockups-manifest.json` de Prompt 3/6), agrega sus items, revalida cada uno (checksum, denylist, formato) y los reubica en el árbol estándar.
- **`packageArtifacts.js`** — construye `index.html` (navegable, agrupado por carpeta) y `README.md` (profesional: contenido, validación, cómo abrir el paquete, aviso de que no se subió nada a ningún sitio).
- **`packageZip.js`** — empaqueta con `jszip` (ya presente desde el Prompt 4/6, reutilizada aquí también para *escribir*, no solo leer) en un `.zip` real y **reproducible**.

## 1. ExportPackageManager

`cp04BuildFinalExportPackage({ sourceBaseDir, targetBaseDir, projectId?, projectName, topLevel? })`. Nunca regenera contenido: lee cada archivo referenciado por los manifiestos de origen, y **excluye** (nunca empaqueta) cualquier item que:

- tenga un checksum que no coincida con el manifiesto de origen (corrupción);
- viole la denylist de seguridad ya existente (`demo/denylist.js`, Prompt 2/6);
- falle su propia validación de formato — reutiliza `captureValidator.js` (PNG, Prompt 3/6) y `binary/binaryValidator.js` (PDF/DOCX/PPTX, Prompt 4/6), nunca un validador nuevo duplicado;
- tenga el archivo de origen ausente en disco.

Cada exclusión queda registrada con un motivo explícito (`failed[]`) — el paquete final se sigue generando con lo que sí es válido, nunca se aborta en silencio salvo que **todo** falle (entonces se detiene sin escribir nada, ver Fase 7).

## 2. Estructura estándar de carpetas

Reutiliza `folderStructure.js` (`cp04BuildProjectFolderTree`/`cp04ValidateFolderTree`, Prompt 1/6) — las 11 subcarpetas ya definidas entonces (`Contratos`, `PDFs`, `Presentaciones`, `Mockups`, `Logos`, `Iconos`, `Fondos`, `Marketing`, `Informes`, `Vídeos`, `Documentación`) se crean siempre las 11, incluida `Vídeos` (queda vacía — sin motor de vídeo todavía, honesto, no oculto). Un mapa `deliverableType → carpeta estándar` traduce las carpetas de trabajo intermedias de cada flujo (p. ej. `contratos/` en minúsculas del Prompt 2/6, `documentos/` del Prompt 4/6) a la carpeta oficial de entrega; los tipos no reconocidos caen a `Documentación` por defecto — ningún entregable se queda sin carpeta. Colisiones de nombre de archivo entre carpetas de origen distintas se resuelven con un sufijo numérico, sin perder ningún archivo.

## 3. Índice HTML navegable

`index.html` en la raíz del paquete, agrupado por carpeta, con enlace directo a cada archivo. Deliberadamente sin timestamp de "generado el ..." — ver Fase 6 (reproducibilidad).

## 4. README.md profesional

Resumen del proyecto, contenido por carpeta, resumen de validación (incluidos/excluidos con motivo), cómo abrir el paquete, y aviso explícito de que no se subió nada a Google Drive ni a ningún servicio externo.

## 5. Manifest final con checksum + versionChecksum

`manifest/paquete-final.json`, generado con `cp04GenerateManifest` (Prompt 1/6, ya extendido en el Prompt 4/6 con `versionChecksum`) — mismo patrón ya validado en el resto de App 3, sin lógica nueva de checksum.

## 6. ZIP final reproducible e idempotente

Este fue el requisito que exigió más cuidado. Dos fuentes de no-determinismo identificadas y cerradas:

1. **`jszip` pone la fecha/hora actual en cada entrada del ZIP por defecto** — se fija una fecha constante (`new Date(0)`) por entrada, igual que `CreationDate` fijo en `pdfEngine.js` (Prompt 4/6). Además se ordena la lista de archivos por ruta antes de insertarlos — el orden de inserción también afecta a los bytes finales.
2. **El propio `manifest/paquete-final.json` que se mete DENTRO del zip llevaba `generatedAt`** (timestamp de pared, cambia en cada ejecución aunque nada cambie de verdad) — se empaqueta una copia del manifiesto SIN ese campo; el manifiesto real en disco (fuera del zip) sí lo conserva, como registro de auditoría honesto. `index.html`/`README.md` tampoco incluyen ningún timestamp por el mismo motivo (verificado con test dedicado).

Resultado verificado con test: **el mismo origen produce un `.zip` con el mismo checksum SHA-256, byte a byte, incluso repitiendo la generación con más de un segundo de diferencia** — no solo "misma versión en el manifiesto", sino reproducibilidad real del binario final.

## 7. Validación completa antes de exportar

Ningún archivo se copia al paquete sin pasar checksum + denylist + validación de formato (ver §1). Si **ningún** entregable pasa la validación, `cp04BuildFinalExportPackage` lanza un error explícito y no escribe manifiesto ni zip — nunca produce un paquete "final" vacío que parezca válido.

## 8. CLI

`npm run app3:package -- --source=<ruta> --project-name=<nombre> [--target=<ruta>] [--project-id=<id>] [--top-level=Clientes]` — un único comando, probado de verdad contra el output real de `app3:demo4`.

## Compatibilidad con lo anterior

No se modificó ningún archivo de generación (Prompt 2/6, 3/6, 4/6) — el empaquetador es puramente aditivo, solo lee lo que ya está en disco. `captureValidator.js` y `binary/binaryValidator.js` se reutilizan tal cual, sin cambios. `folderStructure.js` y `manifestGenerator.js` se reutilizan tal cual (ya extendido en Prompt 4/6).

## Tests

28 tests nuevos: `packageZip.test.mjs` (5, incluida reproducibilidad byte a byte y orden de inserción), `packageArtifacts.test.mjs` (8, incluida ausencia de timestamp), `exportPackageManager.test.mjs` (15: agregación de 2 manifiestos, estructura de 11 carpetas, exclusión por checksum/archivo ausente/formato corrupto, idempotencia con zip idéntico, subida de versión real, colisión de nombres, e integración real contra el output verdadero de `demoOrchestrator.js` y `demo4Orchestrator.js`).

## Seguridad

Reutiliza la denylist ya existente (`demo/denylist.js`) sobre cada ruta de origen antes de copiar — ningún archivo técnico/sensible puede colarse en el paquete final aunque estuviera (por error) en un manifiesto de origen.

## Coste

0 €. Sin Google Drive, sin APIs externas, sin credenciales, sin dependencias nuevas (`jszip` ya estaba instalada desde el Prompt 4/6).

## Limitaciones conocidas

- El empaquetador asume que `sourceBaseDir` sigue las convenciones de ruta ya establecidas (`manifest/manifest.json`, `mockups/mockups-manifest.json`) — un origen con una estructura distinta no se reconoce (falla con mensaje claro, no falla en silencio).
- La reproducibilidad del `.zip` es "mismo origen → mismo zip", no "cualquier ejecución en cualquier máquina → mismo zip" (no se probó reproducibilidad cross-platform, aunque no hay ninguna razón técnica para que difiera).

## Condiciones para iniciar el Prompt 6/6

No evaluadas en este documento — corresponde al informe final de la sesión.
