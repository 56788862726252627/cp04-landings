# Paso 15 — Integración del pipeline multiproveedor con Audit Orchestrator, scoring y perfiles multisector

Conecta la arquitectura de fábrica multiproveedor de Paso 14
(`ProviderRegistry` + `ProviderPipeline`, 12 proveedores stub + 1 real)
con el motor de auditoría de Paso 12/13 (`auditOrchestrator.js`,
`scoringEngine.js`, `dimensionRegistry.js`, `auditReportGenerator.js`),
de forma **opt-in** (`pipeline: "multiprovider"`) sin tocar el
comportamiento por defecto (`pipeline: "legacy"`, idéntico byte a byte a
Paso 12/13/14).

## Documentos

1. [01 — Arquitectura de integración: OrchestratorProviderBridge, política de ejecución, fallback, errores, operación segura](./01-arquitectura-integracion.md)
2. [02 — Evidencia, agregación de conflictos y scoring multiproveedor](./02-evidencia-scoring-conflictos.md)
3. [03 — Perfiles sectoriales: privacidad, consentimiento, límites](./03-perfiles-sectoriales-privacidad-consentimiento.md)
4. [04 — CLI: research:audit, research:collect, research:providers, research:profiles](./04-cli.md)
5. [05 — Informe técnico del Paso 15 (verificación, tests, honestidad de alcance)](./05-informe-tecnico-paso-15.md)
6. [06 — Actualización del roadmap maestro vivo (21 pasos)](./06-actualizacion-roadmap-maestro-21-pasos.md)

## Regla de oro de este paso

Con `pipeline: "legacy"` (por defecto, sin flags nuevos), **nada cambia**:
mismo camino de código en `collectEvidence`/`runResearchAudit`, mismo
conjunto de archivos generados, mismos 887 tests preexistentes en verde.
Todo lo nuevo vive detrás de `pipeline: "multiprovider"` — un opt-in
explícito, igual que `allowNetwork` en Paso 13.

## Código nuevo

```
src/saas-core/research/
├── auditOrchestrator.js        (modificado: pipeline="legacy"|"multiprovider", export evidenceForUnavailableUrl/NETWORK_CAPABLE_MODES, analyzeEvidence(presetOverrides))
├── auditReportGenerator.js     (modificado: buildReportData + renderProviderRunSummaryMarkdown nuevo)
├── sectorAuditPresets.js       (modificado: + mergeAuditPreset, aditivo)
└── providers/
    ├── orchestratorProviderBridge.js   (+ .test.mjs)  — puente auditOrchestrator <-> registry/pipeline
    ├── providerExecutionPolicy.js      (+ .test.mjs)  — ProviderExecutionPolicy + aplicación al registro
    ├── providerCircuitBreaker.js       (+ .test.mjs)  — circuit breaker/estado de salud básico
    ├── providerSectorProfiles.js       (+ .test.mjs)  — 10 perfiles + genérico
    ├── evidenceAggregator.js           (+ .test.mjs)  — EvidenceAggregator, conflictos, desglose por proveedor
    └── core/providerPipeline.js        (modificado: + maxConcurrency opcional, aditivo)

research-cli/
├── lib/researchCli.mjs         (modificado: + resolveProviderExecutionOptionsFromArgs)
├── research-audit.mjs          (modificado: + flags Paso 15)
├── research-collect.mjs        (modificado: + flags Paso 15)
├── research-providers.mjs      (nuevo)
└── research-profiles.mjs       (nuevo)
```
