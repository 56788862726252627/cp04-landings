# App 3 — Prompt 1/6: Fábrica de entregables visuales + arquitectura Google Drive (coste 0 €)

- **Fecha:** 2026-07-27
- **Worktree:** `/root/cp04-t-vite-watcher-fix` (app en `/root/cp04-t-vite-watcher-fix/app`)
- **Rama:** `app3/prompt-1-arquitectura-base-20260727`
- **Ubicación del código:** `src/saas-core/deliverables/` — junto al resto de la infraestructura reutilizable multisector (`src/saas-core/commercial/`, `src/saas-core/tenant/`, etc.), porque el objetivo explícito es que "cualquier SaaS generado por la Agencia de IA" pueda usarla, no solo Club Pádel 04.

## Objetivo de este prompt

Construir la arquitectura desacoplada de 10 componentes pedida, con interfaces limpias, sin conectar ninguna API real de Google Drive ni de renderizado de documentos/imágenes/vídeo. Cada componente que SÍ se puede implementar de verdad con Node/JS puro (cero dependencias nuevas, cero red) está implementado de verdad; cada uno que requeriría una librería no instalada declara honestamente `not_implemented`, nunca simula el resultado.

## Los 10 componentes (mapeo 1:1 con el enunciado)

| Componente pedido | Archivo | Estado |
|---|---|---|
| ExportManager | `exportManager.js` | **Real** — orquestador que valida catálogo+formato y enruta al pipeline correcto |
| DriveSyncManager | `driveSyncManager.js` | **Real** (cola + backoff exponencial), sincronización real **desactivada** por diseño |
| ManifestGenerator | `manifestGenerator.js` | **Real** — checksum SHA-256 (`node:crypto`), diff entre versiones |
| AssetRegistry | `assetRegistry.js` | **Real** — registro en memoria, aislado por instancia |
| DocumentPipeline | `documentPipeline.js` | **Real** para Markdown/HTML; PDF/DOCX declarados `not_implemented` |
| PreviewGenerator | `previewGenerator.js` | **Real** — SVG paramétrico (texto XML, sin dependencias) |
| MockupPipeline | `mockupPipeline.js` | **Real** para SVG/HTML de los 8 dispositivos pedidos; PNG `not_implemented` |
| ContractPipeline | `contractPipeline.js` | **Real** — validación de campos + generación Markdown/HTML sobre DocumentPipeline |
| PdfPipeline | `pdfPipeline.js` | Interfaz lista, siempre `not_implemented` en este entorno (sin librería de PDF instalada) |
| PresentationPipeline | `presentationPipeline.js` | **Real** para Markdown/HTML (diapositivas estructuradas); PPTX `not_implemented` |

Más 3 piezas de soporte no listadas explícitamente en el enunciado pero necesarias para que la arquitectura sea coherente:
- `exportFormats.js` — registro único de los 11 formatos, con su estado honesto.
- `deliverablesCatalog.js` — catálogo de los ~19 tipos de entregable, cada uno mapeado a su pipeline/carpeta/formatos válidos.
- `folderStructure.js` — árbol de carpetas de Google Drive (datos puros, sin tocar la API).
- `driveAdapter.js` — interfaz de adaptador de Drive, mismo patrón que `stripeAdapter.js`/`whatsappAdapter.js` ya existentes en `src/saas-core/commercial/`.
- `index.js` — punto de entrada único (`cp04CreateDeliverablesFactory()`).

## Los 11 formatos de exportación — estado honesto

| Formato | Implementado hoy | Motor |
|---|---|---|
| Markdown | ✅ Sí | plantilla de texto local |
| HTML | ✅ Sí | plantilla de texto local |
| SVG | ✅ Sí | plantilla XML local |
| PDF | ❌ No | requiere `pdfkit` o equivalente (no instalado) |
| DOCX | ❌ No | requiere `docx` o equivalente (no instalado) |
| PPTX | ❌ No | requiere `pptxgenjs` o equivalente (no instalado) |
| PNG | ❌ No | requiere `sharp`/`canvas` o equivalente (no instalado) |
| JPG | ❌ No | requiere `sharp`/`canvas` o equivalente (no instalado) |
| WebP | ❌ No | requiere `sharp` o equivalente (no instalado) |
| MP4 | ❌ No | requiere `ffmpeg` o equivalente (no instalado) |
| GIF | ❌ No | requiere `ffmpeg`/`gifenc` o equivalente (no instalado) |

**Por qué 3 de 11 sí y 8 de 11 no:** Markdown/HTML/SVG son formatos de texto plano estructurado — se pueden generar con JavaScript puro, sin ninguna librería ni llamada de red, exactamente como ya hace `devicePreview.js`/`proposalGenerator.js` (Paso 20, ya existente en este mismo `src/saas-core/commercial/`). PDF/DOCX/PPTX son binarios de formato Office/Adobe; PNG/JPG/WebP son rasterizado de imagen; MP4/GIF son códecs de vídeo — los tres grupos requieren una librería real que **no está instalada** en este entorno. Instalarla implicaría una dependencia nueva no autorizada por este prompt (que solo pide arquitectura, no dependencias) — así que en vez de simular esos formatos, cada pipeline devuelve `{status:"not_implemented", reason:"..."}` de forma determinista. Esto seguía el mismo principio ya aplicado en toda esta sesión: *"no declarar exportaciones reales si solo se genera una simulación"*.

## Los ~19 tipos de entregable

Ver `deliverablesCatalog.js` — cada uno declara: `pipeline` (qué componente lo genera), `folder` (en qué subcarpeta de Drive vive) y `formats` (subconjunto válido de los 11 formatos). Los 8 mockups de dispositivo (móvil/tablet/escritorio/Android/iPhone/iPad/Windows/macOS) usan todos el pipeline `mockup`; contratos/propuestas/manuales/informes/documentación usan `contract`/`document`; logotipos/iconos/fondos/banners usan `preview`; presentaciones usan `presentation`.

## Los 8 dispositivos de MockupPipeline

| Dispositivo | Medida representativa (ancho×alto) |
|---|---|
| Móvil (genérico) | 390×844 |
| Tablet (genérico) | 834×1194 |
| Escritorio (genérico) | 1440×900 |
| Android (referencia Pixel) | 412×915 |
| iPhone (referencia) | 390×844 |
| iPad (referencia) | 834×1194 |
| Windows (referencia 1080p) | 1920×1080 |
| macOS (referencia) | 1440×900 |

Se documentan explícitamente como **medidas representativas de cada familia de dispositivo**, no la ficha técnica exacta de un modelo concreto — para no afirmar una precisión que esta sesión no ha verificado.

## Estructura de Google Drive (sin conectar)

```
Agencia IA/
 ├── Clientes/<nombre del cliente>/
 ├── Plantillas SaaS/<nombre de la plantilla>/
 └── Club Pádel 04/<nombre>/
```

Y dentro de cada proyecto, exactamente las 11 subcarpetas pedidas, en este orden: Contratos, PDFs, Presentaciones, Mockups, Logos, Iconos, Fondos, Marketing, Informes, Vídeos, Documentación. `folderStructure.js` construye esta ruta como datos puros (`cp04BuildProjectFolderTree`) — no crea nada en ningún disco ni servicio real.

## Google Drive — arquitectura sin conectar

`driveAdapter.js` sigue exactamente el mismo patrón que `stripeAdapter.js`/`whatsappAdapter.js` (ya existentes, Pasos 18-19): ningún método hace una petición real sin las 3 credenciales (`GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN`) presentes en `env`, y aunque lo estuvieran, el feature flag `CP04_DRIVE_SYNC_ENABLED` debe ser exactamente `"true"` para que `DriveSyncManager` llegue siquiera a invocar el adaptador. Con cualquiera de las dos condiciones ausente (el estado por defecto), todo método (`createFolder`/`uploadFile`/`listFolder`) devuelve `{status:"not_configured", reason:"..."}` — nunca lanza, nunca finge éxito.

`DriveSyncManager` añade la cola con reintentos (backoff exponencial puro, verificado con tests: 500ms → 1000ms → 2000ms) y el historial de qué se procesó. Con la sincronización desactivada (el estado por defecto de esta sesión), `processQueue()` marca cada elemento como `skipped_disabled` **sin llamar al adaptador ni una sola vez** — verificado explícitamente en los tests con un adaptador espía que registra si fue invocado.

Variables añadidas a `.env.example` (comentadas, sin valores reales): `CP04_DRIVE_SYNC_ENABLED`, `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`, y `CP04_PDF_ENGINE_MODULE` (punto de extensión de PdfPipeline). El `.env` real no se ha tocado — no existe en este worktree.

## Tests

**106 tests nuevos**, uno por archivo de arquitectura, cubriendo: validación de entradas inválidas (sin lanzar nunca), resultados `completed`/`not_implemented`/`failed` para cada combinación relevante de formato/entregable, aislamiento entre instancias (dos registros o dos ExportManager nunca comparten estado), determinismo del checksum del manifiesto, matemática exacta del backoff exponencial, y la garantía explícita de que la sincronización desactivada nunca invoca al adaptador de Drive.

## Validación técnica

- Tests del módulo nuevo: 106/106.
- Suite completa del repositorio, lint y build: ver informe final.
- `localhost:5175`: sin tocar — este prompt no modifica ningún archivo de la app Club Pádel 04, solo añade una carpeta nueva en `src/saas-core/`.

## Limitaciones honestas

1. 8 de los 11 formatos de exportación son solo interfaz (`not_implemented`) — requieren instalar una librería real, fuera del alcance de "solo arquitectura" de este prompt.
2. Los tamaños de mockup son representativos, no especificaciones exactas de ningún dispositivo concreto.
3. `PdfPipeline` no tiene ningún motor real conectado ni previsto en este prompt — el punto de extensión (`CP04_PDF_ENGINE_MODULE`) existe, pero implementarlo es trabajo de un prompt futuro.
4. `AssetRegistry` es en memoria (sin persistencia a disco/DB) — adecuado para esta fase de arquitectura; un backend de persistencia real es una extensión futura documentada, no construida aquí.
5. Ninguna de estas piezas está todavía conectada a la UI de Club Pádel 04 ni a ningún flujo de la Agencia de IA — es infraestructura reutilizable, aislada, lista para conectarse cuando corresponda.

## Siguiente prompt recomendado (2/6)

Conectar `ExportManager`/`AssetRegistry`/`ManifestGenerator` a un flujo de uso real dentro de un proyecto concreto (p. ej. generar el paquete completo de entregables de un cliente demo de principio a fin: contrato + propuesta + mockups de los 8 dispositivos + presentación, todo en Markdown/HTML/SVG, empaquetado con su manifiesto) — sin tocar Google Drive todavía, para validar que la arquitectura de Prompt 1 funciona en conjunto antes de considerar cualquier librería de renderizado real.
