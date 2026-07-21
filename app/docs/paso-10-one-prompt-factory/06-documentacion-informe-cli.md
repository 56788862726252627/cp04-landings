# Paso 10 · Fases 9-11 — Documentación, informe y CLI

## Fase 9 — Documentación automática (`docsGenerator.js`)

Cinco funciones puras, cada una etiqueta explícitamente su contenido con
uno de: `[GENERADO AUTOMÁTICAMENTE]`, `[PENDIENTE DE REVISIÓN HUMANA]`,
`[PENDIENTE DE PROVEEDOR EXTERNO]`, `[PENDIENTE LEGAL/REGULATORIO]`,
`[VALIDADO]`, `[NO VALIDADO]`:

- `buildReadme` — datos del negocio, módulos, navegación por rol (marcada
  `[VALIDADO]` porque reutiliza el mismo motor que verifica Club Pádel 04).
- `buildQuickGuide` — los 4 comandos CLI esenciales.
- `buildOnboarding` — primeros pasos para quien abre el panel demo.
- `buildTechnicalChecklist` — separa lo ya validado por esta ejecución
  (blueprint válido, tenant válido, dataset consistente) de lo pendiente de
  proveedor/humano/legal (incluye el aviso normativo de
  `privacyChecklist.js` cuando el sector lo requiere).
- `buildCommercialChecklist` — marca explícitamente el negocio como
  `[NO VALIDADO]` con un cliente real.

Ningún generador afirma "listo para producción" — verificado en test
(`doesNotMatch(readme, /listo para producción/i)`).

## Fase 10 — Informe automático (`reportGenerator.js`)

`buildReportData(runResult)` aplana el resultado del orquestador a una
estructura estable (Business Blueprint usado, archivos creados/actualizados
/preservados, módulos activados/descartados, automatizaciones,
integraciones, resumen de datos demo, reutilización, pasos manuales,
riesgos, limitaciones, duración, compatibilidad, siguiente paso). Esa misma
estructura se renderiza dos veces: `renderReportMarkdown` (lectura humana)
y `renderReportJson` (estable, pensado para que un paso futuro lo convierta
a PDF sin tocar esta función — mismo principio que el resto del núcleo:
JSON como fuente de verdad, Markdown como vista).

## Fase 11 — CLI (`factory-cli/`)

Comparte `parseCliArgs` con `tenant-cli` (no lo duplica). Ocho comandos:

| Comando | Qué hace | Escribe a disco |
|---|---|---|
| `business:create` | valida → dry-run → genera → resumen | Sí |
| `business:validate` | valida esquema + resolución de plantilla + branding | No |
| `business:preview` | JSON con tenant/navegación/branding/landing derivados | No |
| `business:build` | genera/regenera (para blueprints ya editados) | Sí |
| `business:report` | regenera `report.md`/`report.json` | Sí (solo el informe si nada más cambió) |
| `business:list` | lista negocios generados, o `--catalog` de plantillas/presets | No |
| `business:diff` | dry-run contra lo que hay en disco: qué cambiaría | No |
| `business:doctor` | salud de la fábrica: extensiones, negocios válidos, herramienta de mockups | No |

Cada comando resuelve el blueprint con `resolveBlueprintFromArgs`:
`--blueprint=<archivo.json>` | `--example=minimal|full` |
`--business=<businessId>` (carga el `business.blueprint.json` ya generado).
Errores esperados (`BusinessCliError`, `BusinessFactoryError`) se imprimen
sin stack trace y fijan `process.exitCode = 1`; cualquier otro error se
relanza (no se oculta).

Tests: `factory-cli/lib/businessCli.test.mjs` (12 tests, todos contra
directorios temporales fuera del repositorio).
