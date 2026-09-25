# Paso 23 — Dashboard Agencia IA (Prompt Agencia IA 5/7)

**Fecha:** 2026-07-31  
**Estado:** COMPLETADO ✅  
**Tests añadidos:** 20 (17 en agencyStatusReport.test.mjs + 3 en businessCli.test.mjs)  
**Tests totales repo:** 1888 (174 archivos, 0 fallos)

## Qué se implementó

Vista agregada del estado operativo de TODOS los negocios generados por la agencia,
reutilizando `buildBusinessStatusReport` (P4/7) por negocio en un bucle.

### Módulo puro: `src/saas-core/factory/agencyStatusReport.js`

Funciones exportadas:
- `buildAgencyStatusReport(businessInputs, integrationsReadiness, { scope })` — agrega N negocios
- `deriveOverallClassification(byClassification, total)` — lógica: C > B > A > no_businesses
- `buildAgencyIntegrationSummary(businessReports)` — resume estado por integración cruzando todos los negocios
- `renderAgencyStatusMarkdown(report)` — salida human-readable
- `renderAgencyStatusJson(report)` — salida machine-readable parseable

### CLI: `factory-cli/agency-status.mjs`

```bash
npm run agency:status [-- opciones]
  --scope=dryRun|production   (por defecto: dryRun)
  --format=json|markdown      (por defecto: markdown)
  --output=<ruta>             Guarda el resultado en un archivo
  --mock-integrations         Simula credenciales de TEST (nunca red real)
  --strict                    Sale con código 1 si clasificación global es "C"
```

### Helper: `loadAllGeneratedBusinessStatusInputs` en businessCli.mjs

Carga todos los negocios disponibles. Los que fallan al leer van a `errors`, nunca lanzan.

## Invariantes del diseño

- **Coste cero**: no llama a ningún servicio externo, no genera tráfico real
- **Determinismo**: mismas entradas → mismo resultado salvo `queriedAt`
- **Idempotencia**: ejecutar N veces no muta ningún archivo generado
- **Fault-tolerant**: negocios corruptos se documentan en `errors`, no rompen el reporte global
- **Clasificación `overallClassification`**: C si hay algún C, B si hay algún B y no hay C, A si todos A, `no_businesses` si lista vacía

## Archivos modificados/creados

| Archivo | Tipo | Motivo |
|---|---|---|
| `src/saas-core/factory/agencyStatusReport.js` | NUEVO | Módulo puro de agregación |
| `src/saas-core/factory/agencyStatusReport.test.mjs` | NUEVO | 17 tests (sintéticos + E2E ligero) |
| `factory-cli/agency-status.mjs` | NUEVO | CLI `npm run agency:status` |
| `factory-cli/lib/businessCli.mjs` | MODIFICADO | +`loadAllGeneratedBusinessStatusInputs` |
| `factory-cli/lib/businessCli.test.mjs` | MODIFICADO | +3 tests del helper |
| `package.json` | MODIFICADO | +script `agency:status` |

## Relación con los otros prompts de la serie

```
P2/7 — One Prompt Factory (orchestrator, pipeline)
P3/7 — Adaptadores reales (Airtable, Stripe, WhatsApp, Drive)
P4/7 — buildBusinessStatusReport (estado por negocio)
P5/7 — buildAgencyStatusReport (este paso: vista agregada multi-negocio)  ← aquí
P6/7 — [pendiente]
P7/7 — [pendiente]
```

## Próximo paso

Comenzar Prompt Agencia IA 6/7, que según el contexto de la serie debería
abordar la exposición/entrega del reporte de agencia hacia el exterior
(API, webhook, o integración Make/Airtable) o la gestión de clientes/sectores
a nivel de agencia.
