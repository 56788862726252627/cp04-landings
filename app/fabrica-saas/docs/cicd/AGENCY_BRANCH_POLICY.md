# Agency Branch Policy — ADV-02

## Política por rama

| Rama | Push directo | Review | Checks obligatorios | Deploy | Release |
|---|---|---|---|---|---|
| `main` | NO | SI (1 aprobación) | test, lint, build, secret-scan, quality-gate | SI* | SI* |
| `feature/*` | SI | NO | — | NO | NO |
| `release/*` | NO | SI | test, lint, build, secret-scan, quality-gate, release-readiness | SI* | SI* |
| `docs/*` | SI | NO | lint | NO | NO |
| `hotfix/*` | NO | SI | test, lint, build, secret-scan | SI* | SI* |

*Con aprobación humana explícita. `NO_AUTO_DEPLOY`.

## Uso

```js
import { getBranchPolicy, checkPolicyCompliance } from '../factory-registry/index.js';

// Obtener política
const { policy } = getBranchPolicy('main');
console.log(policy.directPushAllowed); // false

// Verificar acción
const result = checkPolicyCompliance('main', 'direct_push', {});
// result.status === 'VIOLATION'
// result.violations[0].rule === 'direct_push_not_allowed'

// Generar recomendación GitHub
const rec = generateProtectionRecommendation('main');
// rec.recommendation.required_status_checks.contexts = ['test', 'lint', ...]
```

## Aplicar protección en GitHub

```bash
# Requiere admin permissions — no ejecutado automáticamente por ADV-02
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["Test · Lint · Build","Secret Quick Scan","Quality Gate"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field allow_force_pushes=false
```

## FUTURE_CP04 / FUTURE_TRADING

Cuando se active CI en CP04 o Trading Bot, aplicar la misma política `main` con sus propias ramas `feature/cp04-*` y `feature/trading-*`.
