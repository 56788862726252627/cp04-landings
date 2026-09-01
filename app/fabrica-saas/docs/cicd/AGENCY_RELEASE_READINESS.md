# Agency Release Readiness — ADV-02

## 14 Checks (6 P0 + 8 P1)

| Check | Prioridad | Descripción |
|---|---|---|
| `TESTS` | **P0** | Tests pasados |
| `LINT` | **P0** | Sin errores de lint |
| `BUILD` | **P0** | Build exitoso |
| `SECURITY` | **P0** | Sin issues críticos de seguridad |
| `SECRETS` | **P0** | Sin secretos en el código |
| `ARTIFACTS` | **P0** | Artifact válido (index.html + assets) |
| `DEPENDENCIES` | P1 | Sin CVEs críticos |
| `VERSION` | P1 | Versión definida en package.json |
| `COMMIT_SHA` | P1 | SHA de commit conocido |
| `BRANCH` | P1 | Rama identificada |
| `ROLLBACK_AVAILABLE` | P1 | Plan de rollback documentado |
| `OBSERVABILITY` | P1 | ADV-01 activo |
| `HEALTH_CHECKS` | P1 | Health checks disponibles |
| `HUMAN_APPROVAL` | P1 | Aprobación humana explícita |

## Estados de salida

| Estado | Acción |
|---|---|
| `READY` | Apto para release (todos P0 pass + aprobación) |
| `BLOCKED` | P0 fallo — no proceder |
| `HUMAN_REVIEW` | P0 pass pero aprobación pendiente |

## Uso

```js
import { evaluateReleaseReadiness, RELEASE_STATUS } from '../factory-registry/index.js';

const result = evaluateReleaseReadiness({
  testsPassed:             true,
  lintPassed:              true,
  buildPassed:             true,
  securityPassed:          true,
  secretsClean:            true,
  artifactValid:           true,
  version:                 '1.0.0',
  commitSha:               'abc1234',
  branch:                  'main',
  observabilityAvailable:  true,
  humanApprovalRequired:   true,  // siempre true por defecto
});

// result.status === RELEASE_STATUS.HUMAN_REVIEW
// Gate humano siempre activo
```
