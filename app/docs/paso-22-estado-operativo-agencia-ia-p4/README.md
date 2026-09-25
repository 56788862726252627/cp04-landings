# Prompt Agencia IA 4/7 — Estado operativo por negocio (`business:status`)

Continuación de [Paso 21 (conexión de adaptadores reales, Prompt 3/7)](../paso-21-conexion-adaptadores-reales-agencia-ia-p3/)
y del hallazgo que dejó pendiente: el estado de integraciones
(`computeIntegrationReadiness`, Paso 20) no estaba reconciliado con el
informe de generación de cada negocio (`report.json`, Paso 10). Este prompt
cierra ese hueco con un informe de solo lectura, sin tocar la generación
determinista.

## Qué se construyó

1. **`src/saas-core/factory/operationalState.js`** — modelo puro (sin I/O)
   de 8 estados operativos (`generated`, `validated`, `dryRunReady`,
   `integrationReady`, `productionReady`, `blocked`, `degraded`,
   `manualActionRequired`; no son una escalera lineal, varios coexisten) y
   `classifyReadiness()` → clasificación A/B/C según `scope` (`dryRun` por
   defecto, o `production`, nunca asumido).
2. **`src/saas-core/factory/businessStatusReport.js`** — reutiliza el
   modelo anterior + `computeIntegrationReadiness` (Paso 20) + el
   `report.json`/`tenant.config.json` ya generados (Paso 10) para construir
   la matriz de las 11 integraciones y el informe completo
   (`buildBusinessStatusReport`), con render a Markdown y JSON.
3. **`factory-cli/business-status.mjs`** (`npm run business:status --
   --business=<id>`) — CLI de solo lectura: cero llamadas de red, cero
   escritura salvo `--output` explícito, nunca expone el valor de una
   credencial (solo si está presente/ausente).
4. **`loadGeneratedBusinessStatusInputs`** en `factory-cli/lib/businessCli.mjs`
   — único añadido a ese módulo: lee `report.json` + `tenant.config.json`
   de un negocio ya generado (no ejecuta el pipeline).

## Qué NO se tocó, a propósito

- **`report.json` / `runFactoryPipeline`** — el informe de estado
  (`business:status`) es un artefacto **derivado y dinámico** (incluye
  `queriedAt`, que cambia en cada consulta). No se escribe dentro de
  `report.json` para no romper la reproducibilidad byte a byte que ya
  prueban los tests de idempotencia del orquestador (mismo motivo que
  Paso 21 dejó intacto `orchestrator.js`).
- **`extensionPoints.js`** — sin cambios, sigue siendo el catálogo estático
  de Paso 10.
- **`INTEGRATION_IDS`** (Paso 20) — no se añadió ningún id nuevo. Los
  providers de `tenantConfig.integrations` sin equivalente
  (`calendar`, `fileStorage`, `analytics`) se documentan como
  `TENANT_PROVIDERS_WITHOUT_READINESS_COVERAGE` (gap conocido, expuesto en
  el informe como `integrationCoverageGaps`) en vez de inventar un id que
  rompería el contrato ya congelado y usado por 24 E2E comerciales.
  "webhooks/API" (mencionado en el enunciado) se cubre de forma
  distribuida vía `webhookCovered` en Stripe/WhatsApp, mismo motivo.

## Cómo consultar el estado hoy

```bash
npm run business:status -- --business=clinica-dental-sonrisas-de-malaga
npm run business:status -- --business=<id> --scope=production --format=json
npm run business:status -- --business=<id> --strict   # exit 1 si la clasificación es "C"
```

Ejemplo real (negocio demo existente, sin ninguna credencial configurada en
este entorno): clasificación **C** en `scope=dryRun` — bloqueado por Make
(depende de Airtable), Stripe y WhatsApp sin credenciales. Comportamiento
esperado y correcto en esta fase: el informe no infla el estado real.

## Estado al cierre de este prompt

49 tests focalizados nuevos/afectados en verde
(`operationalState.test.mjs` + `businessStatusReport.test.mjs` +
2 tests nuevos en `businessCli.test.mjs`). Sin commit/push. Sin tocar
`.env`/`.secrets`/credenciales reales.

**Clasificación de este prompt: B) parcialmente operativo.** Funciona de
extremo a extremo para negocios ya generados. Le falta para ser A:
1. No está expuesto en ningún dashboard/UI — solo CLI.
2. `TENANT_PROVIDERS_WITHOUT_READINESS_COVERAGE` (calendar/fileStorage/analytics)
   sigue sin id equivalente en Paso 20 — decisión pospuesta a propósito,
   no un olvido.

**Cómo aplicar en el Prompt 5/7 o sucesivos:** si se pide una vista
agregada multi-negocio (todos los negocios generados, no uno solo), este
módulo (`buildBusinessStatusReport`) es la pieza a reutilizar por negocio
dentro de un bucle — no reimplementar el cálculo de estado/clasificación.
