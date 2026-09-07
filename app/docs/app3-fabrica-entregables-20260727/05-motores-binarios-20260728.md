# App 3 — Prompt 4/6: Motores reales de PDF, DOCX y PPTX

- **Fecha:** 2026-07-28
- **Rama:** `app3/prompt-4-real-pdf-docx-pptx-20260728`
- **Continúa de:** [04-gate-endurecimiento-3.5-20260728.md](04-gate-endurecimiento-3.5-20260728.md)

## Objetivo y alcance

Conectar motores reales, locales y verificables para los 3 formatos que hasta ahora quedaban honestamente `not_implemented` (Prompt 1/6): PDF, DOCX, PPTX. Los archivos generados son binarios reales — abribles en visores estándar, con estructura interna válida — nunca texto renombrado ni placeholders sin sustituir.

## Decisión de dependencias

Hasta ahora esta sesión seguía la regla "cero dependencias nuevas". Este prompt pide explícitamente motores *reales*: generar un PDF/DOCX/PPTX válido a mano, byte a byte, sin ninguna librería, es técnicamente posible pero extremadamente frágil y desproporcionado frente al riesgo de producir "documentos corruptos" — justo lo que el enunciado prohíbe. Se instalaron 4 dependencias, todas puras JS, MIT, **sin llamada de red en tiempo de ejecución** (confirmado con red disponible en este entorno — instalación normal de `npm`, no un servicio remoto de conversión):

| Paquete | Versión | Uso |
|---|---|---|
| `pdfkit` | 0.19.1 | Motor PDF — la misma librería que `exportFormats.js` ya nombraba como candidata desde el Prompt 1/6 |
| `docx` | 9.7.1 | Motor DOCX (OOXML) |
| `pptxgenjs` | 4.0.1 | Motor PPTX (OOXML) |
| `jszip` | 3.10.1 | Lectura del contenedor ZIP para *validar* DOCX/PPTX — ya era dependencia transitiva de `docx`/`pptxgenjs` (deduplicada) |

`npm audit` reporta 2 vulnerabilidades "high" — ambas preexistentes de `eslint`/`vite` (transitivas de `brace-expansion`/`postcss`), confirmado con `npm ls`, no relacionadas con estas 4 dependencias nuevas.

## Auditoría previa (Fase 2)

- `pdfPipeline.js` (Prompt 1/6) era un stub "siempre `not_implemented`" gobernado por `CP04_PDF_ENGINE_MODULE`, **nunca conectado** a `exportManager.js` (0 imports fuera de su propio test) — retirado en favor del motor real.
- `documentPipeline.js`/`contractPipeline.js`/`presentationPipeline.js` seguían intactos para markdown/html — no se tocó su lógica de texto, solo se extrajo `cp04BuildContractSpec` (refactor puro, sin cambio de comportamiento) para que el camino binario reutilice la misma plantilla de contrato.
- `manifestGenerator.js`/`assetRegistry.js` ya aceptaban `content` de cualquier tipo — sin cambio estructural, solo se corrigió el cálculo del checksum para Buffers (ver más abajo).
- No existía ningún generador de DOCX/PPTX previo ni parcial que reutilizar.

## Arquitectura de la integración

Un solo motor por formato, reutilizado por todos los pipelines que lo necesitan — nunca duplicado por tipo de entregable:

```
documentPipeline / contractPipeline (spec {title,sections})  ─┐
presentationPipeline (deck {title,slides})                    ├─► pdfPipeline.js  ──► binary/pdfEngine.js  (pdfkit)
                                                                │
documentPipeline / contractPipeline (spec {title,sections})  ──┴─► docxPipeline.js ──► binary/docxEngine.js (docx)
presentationPipeline (deck {title,slides})                    ───► pptxPipeline.js ──► binary/pptxEngine.js (pptxgenjs)
```

`exportManager.js` decide: si el formato pedido es `pdf`/`docx`/`pptx` y el pipeline del entregable es `contract`/`document`/`presentation`, enruta al motor binario (`generateBinaryDeliverable`) en vez del pipeline de texto síncrono — mismo contenido de entrada, renderer distinto. Los pipelines de texto (`cp04GenerateDocument`, `cp04GenerateContract`, `cp04GeneratePresentation`) **no cambiaron su comportamiento para markdown/html**; al pedírseles PDF/DOCX/PPTX directamente devuelven `failed` con un mensaje explícito (antes devolvían `not_implemented` — cambio de comportamiento intencional y documentado, ya no es cierto que "nadie lo implementa").

## Matriz de formatos

| Formato | Motor | MIME | Validación | Preview | Compatibilidad declarada | Estado |
|---|---|---|---|---|---|---|
| PDF | `pdfkit` | `application/pdf` | Firma `%PDF-`, `%%EOF`, `/Type /Catalog`, recuento de páginas, streams de contenido | HTML (secciones + estado + nº páginas) | Cualquier visor PDF estándar | ✅ implementado |
| DOCX | `docx` | `application/vnd...wordprocessingml.document` | ZIP real + `[Content_Types].xml`/`_rels/.rels`/`word/document.xml` presentes y no vacíos | Texto estructurado (título/secciones/bullets) | Word, LibreOffice Writer, Google Docs (import), visores móviles | ✅ implementado |
| PPTX | `pptxgenjs` | `application/vnd...presentationml.presentation` | ZIP real + `presentation.xml`/rels + ≥1 `slideN.xml` real | HTML (galería de diapositivas: título + bullets) | PowerPoint, LibreOffice Impress, Google Slides (import), visores móviles | ✅ implementado |
| PNG/JPG/WebP/MP4/GIF | — | — | — | — | — | `not_implemented` honesto (sin motor de rasterizado/vídeo instalado) |

## Contrato binario (Fase 2/7)

Cada motor: valida `title` + contenido mínimo obligatorio antes de generar nada (`failed` explícito si falta), nunca produce `completed` con un buffer vacío, nunca confía en la extensión del archivo — `binary/binaryValidator.js` inspecciona la firma/estructura real:

- **PDF**: firma `%PDF-`, trailer `%%EOF`, `/Type /Catalog`, recuento de páginas vía `/Count`, presencia de `stream`/`endstream`. Estados: `validated` / `corrupt` (firma o estructura inválida) / `incomplete` (truncado) / `failed` (buffer vacío).
- **DOCX/PPTX**: firma ZIP (`PK`), apertura real del contenedor con `jszip` (nunca asumida), partes OOXML obligatorias presentes y no vacías, XML bien formado (`<?xml` presente), PPTX además exige ≥1 diapositiva real. Estados: `validated` / `corrupt` (ZIP inválido/truncado) / `incomplete` (partes faltantes) / `unsupported` (formato no soportado por este validador).

Ningún archivo inválido puede figurar como `validated` — verificado con texto plano renombrado, archivos truncados y un PPTX con las diapositivas eliminadas manualmente (ver `binary/binaryValidator.test.mjs`).

## Idempotencia — el hallazgo no trivial de este prompt

Al generar el mismo contenido dos veces, `docx` y `pptxgenjs` **incrustan un timestamp de creación real (`docProps/core.xml`) que no se puede desactivar** desde su API pública (se intentó pasar `created`/`modified` explícitos — la librería `docx` los ignora y sigue usando `new Date()` internamente; confirmado comparando los dos ZIPs byte a byte). Esto rompía la idempotencia del manifiesto exactamente igual que `capturedAt` la rompía en el Prompt 3/6.

- **PDF**: sí es controlable — `pdfkit` acepta `info.CreationDate`/`ModDate` explícitos. Se fija una fecha constante → el mismo spec produce **siempre el mismo buffer, byte a byte** (verificado).
- **DOCX/PPTX**: no es controlable. Se generaliza el patrón ya usado en `captureOrchestrator.js` (Prompt 3/6) al módulo compartido: `cp04GenerateManifest` (`manifestGenerator.js`) ahora acepta `entry.versionContent` opcional — `checksum` sigue siendo el hash real del archivo en disco (integridad), `versionChecksum` se calcula sobre `versionContent` (aquí, el spec/deck de entrada, determinista) cuando se aporta. Sin `versionContent`, el comportamiento es idéntico al de antes (fallback a `checksum`) — no afecta a Prompt 1/6 ni a Prompt 3/6.

Verificado con tests dedicados: repetir la demo completa sin cambios no sube de versión; cambiar un dato real sí.

## Sistema de plantillas (Fase 6)

`demo/sectorTemplates.js` — 6 sectores mínimos pedidos (club deportivo, clínica dental, fisioterapia, abogados, peluquería, veterinaria), cada uno con módulos/riesgos/CTA por defecto. `cp04BuildProjectBrief(input)` separa contenido de presentación: valida campos obligatorios (`projectId`, `displayName`, `sector`, `client`), aplica defaults seguros del sector cuando faltan opcionales, falla con mensaje claro si falta algo obligatorio (nunca produce un brief a medias), nunca incluye datos sensibles reales.

## Demos end-to-end (Fase 9)

- **Clínica Dental Nova** (ficticia, nueva): 6 entregables — PDF propuesta comercial, PDF informe de auditoría, DOCX contrato (reutiliza `cp04BuildContractSpec`, mismo camino que Prompt 1/6), DOCX onboarding, PPTX comercial, PPTX antes/después.
- **Club Pádel 04** (caso ligero): 3 entregables — PDF memoria técnica, DOCX manual de usuario, PPTX comercial. **Branding/roles/módulos reutilizados literalmente de `src/saas-core/tenant/defaultTenant.js`** (el tenant de producción ya existente) — nunca inventados.

`npm run app3:demo4 [-- --base-dir=<ruta>]` ejecuta ambos casos. Cada proyecto queda en su propia carpeta (`documentos/`, `presentaciones/`, `previews/`, `manifest/`), con manifiesto atómico, informe de validación (`manifest/validacion.md`) y cola Drive en dry-run.

## Previews (Fase 8)

Sin Chromium — no era necesario ni deseable abrir un navegador para esto. Previews derivadas directamente del mismo spec/deck usado para generar el binario: HTML con secciones para PDF, texto estructurado para DOCX, galería HTML de diapositivas para PPTX.

## Seguridad (Fase 10)

- Todas las rutas de archivo de este prompt (`documentos/*`, `presentaciones/*`, `previews/*`) son nombres **fijos, definidos en código** — ningún segmento de ruta se deriva de datos de usuario, sin superficie de path traversal hoy.
- Sin `exec`/`eval`/shell en ningún archivo nuevo.
- Sin credenciales, sin llamadas de red en tiempo de ejecución (confirmado con barrido `fetch|https?://` sobre `binary/` y `demo/`).
- Imágenes no decodificables se omiten sin romper el documento completo (probado en los 3 motores).
- Limitación conocida y aceptada: los validadores no imponen un límite de tamaño de descompresión (protección "zip bomb") — no es necesario hoy porque solo se valida contenido generado por esta misma sesión, nunca un archivo subido por un tercero; documentado como condición a revisar si esto cambia.

## Limitaciones conocidas (honestas)

- Las celdas de tabla muy largas en PDF se truncan visualmente con "…" (el documento sigue siendo válido, no es un defecto de estructura).
- No se implementaron gráficos (charts) en PPTX — el enunciado los pedía solo "si ya existe soporte local", y no existía.
- No se implementaron campos dinámicos de Word (mail-merge) ni hipervínculos activos — el contenido se interpola en texto plano al construir el spec, no vía campos OOXML nativos.
- Las plantillas de sector cubren el mínimo de 6 sectores pedido, no el catálogo completo de sectores ya usado en otras partes del repo (`src/saas-core/factory/`) — no se intentó unificar ambos catálogos en este prompt, fuera de alcance.

## Rollback

Cambios aislados y reversibles con `git revert` del commit de este prompt: los 3 motores/pipelines/validador son archivos nuevos; los cambios en archivos existentes (`exportFormats.js`, `exportManager.js`, `contractPipeline.js`, `manifestGenerator.js`, `demoOrchestrator.js`) son adiciones o cambios acotados, no reescrituras.

## Coste

0 €. Sin Google Drive, sin APIs externas, sin credenciales.

## Condiciones para iniciar el Prompt 5/6

No evaluadas en este documento — corresponde al informe final de la sesión.
