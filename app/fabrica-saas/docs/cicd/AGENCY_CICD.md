# Agency CI/CD — ADV-02

Pipeline CI/CD reusable para Agencia IA, Fábrica SaaS y futuros clientes generados.

## Módulos (23)

| Módulo | Archivo | Responsabilidad |
|---|---|---|
| pipelineModel | `cicd/pipelineModel.js` | CIPipelineDefinition (frozen), evaluatePipelineStatus |
| jobModel | `cicd/jobModel.js` | CIJob types, buildStandardJobSequence |
| qualityGateEngine | `cicd/qualityGateEngine.js` | 8 gates P0/P1, evaluateQualityGates |
| secretScan | `cicd/secretScan.js` | Escaneo de secretos sin imprimir valores |
| dependencyScan | `cicd/dependencyScan.js` | evaluateDependencyRisk (npm audit) |
| regressionGate | `cicd/regressionGate.js` | evaluateRegressionRisk (baseline vs actual) |
| artifactValidation | `cicd/artifactValidation.js` | validateBuildArtifact, validateArtifactFromList |
| bundleGate | `cicd/bundleGate.js` | evaluateBundleBudget por preset |
| branchPolicy | `cicd/branchPolicy.js` | getBranchPolicy, checkPolicyCompliance |
| releaseReadiness | `cicd/releaseReadiness.js` | evaluateReleaseReadiness (14 checks) |
| observabilityIntegration | `cicd/observabilityIntegration.js` | Eventos CI → ADV-01 |
| prPipeline | `cicd/prPipeline.js` | createPRPipeline, runPRPipelineSimulation |
| mainPipeline | `cicd/mainPipeline.js` | createMainPipeline, validateMainCommit |
| failFast | `cicd/failFast.js` | evaluateFailFast, shouldSkipJob |
| retryPolicy | `cicd/retryPolicy.js` | isRetryable, createRetryPolicy |
| cacheStrategy | `cicd/cacheStrategy.js` | generateCacheKey, validateCachePath |
| failureReport | `cicd/failureReport.js` | generateCIFailureReport |
| ciSummary | `cicd/ciSummary.js` | generateCISummary |
| ciConfigGenerator | `cicd/ciConfigGenerator.js` | generateCIConfig (GitHub Actions YAML) |
| matrixSupport | `cicd/matrixSupport.js` | buildCIMatrix (node × verticals) |
| localCIRunner | `cicd/localCIRunner.js` | runLocalCI() SAFE_LOCAL |
| ciTestFixture | `cicd/ciTestFixture.js` | Proyecto ficticio para tests |
| ciFailureScenarios | `cicd/ciFailureScenarios.js` | 12 escenarios de fallo |

## Flujo estándar

```
secret-scan → install → test+lint+security → build → artifact → quality-gate → release-readiness
```

## GitHub Actions

`.github/workflows/factory-ci.yml` — activo, triggers en PR y push a main.

## Versión

- `CICD_VERSION = '1.0.0'`
- `REGISTRY_VERSION = '3.0.0'`
