# Agency CI Quality Gates — ADV-02

## 8 Gates (6 P0 + 2 P1)

| Gate | Prioridad | Condición de fallo | Bloquea merge |
|---|---|---|---|
| `SECRET_GATE` | **P0** | secretsFound > 0 o critical=true | SI |
| `TEST_GATE` | **P0** | newFails > 0 (excluyendo pre-existing) | SI |
| `LINT_GATE` | **P0** | errorCount > 0 | SI |
| `BUILD_GATE` | **P0** | success=false | SI |
| `SECURITY_GATE` | **P0** | hasCritical=true | SI |
| `ARTIFACT_GATE` | **P0** | valid=false | SI |
| `DEPENDENCY_GATE` | P1 | criticalCVEs > 0 → FAIL, highCVEs > 0 → WARNING | NO (solo warning) |
| `REGRESSION_GATE` | P1 | riskLevel HIGH/MEDIUM → WARNING | NO (solo warning) |

## Regla fundamental

**Cualquier gate P0 en FAIL o BLOCKED → pipeline BLOCKED → merge no permitido.**

## Estados

| Estado | Descripción |
|---|---|
| `PASS` | Gate superado sin incidencias |
| `WARNING` | Condición detectada pero no bloqueante |
| `FAIL` | Condición bloqueante (P0 → pipeline BLOCKED) |
| `BLOCKED` | Equivalente a FAIL con acción inmediata requerida |
| `NOT_APPLICABLE` | El check no fue ejecutado |

## Uso

```js
import { evaluateQualityGates, GATE_STATUS } from '../factory-registry/index.js';

const result = evaluateQualityGates({
  testResult:      { passed: 238, failed: 1, total: 239, preExistingFails: 1 },
  lintResult:      { errorCount: 0 },
  buildResult:     { success: true, durationMs: 535 },
  secretResult:    { secretsFound: 0, critical: false },
  securityResult:  { hasCritical: false, hasHigh: false },
  dependencyResult: { criticalCVEs: 0, highCVEs: 0 },
  artifactResult:  { valid: true, missingFiles: [] },
});

if (result.blocked) {
  console.error('Merge blocked:', result.p0Failures);
}
```
