# AGENCY_RELEASE_MANAGEMENT — Paso G

**Gestión de Releases: Manifiesto + Gates**

Cada deploy genera un Release Manifest que documenta el estado completo de la entrega.

---

## Release Manifest

```js
import { createReleaseManifest, advanceReleaseStatus, RELEASE_STATUS } from '../deploy/releaseManifest.js';

// Crear
const { manifest } = createReleaseManifest({
  releaseId:    'REL-nexo-v1.0',
  version:      '1.0.0',
  commitSha:    'abc123def456',
  branch:       'main',
  environment:  'PRODUCTION',
  provider:     'CLOUDFLARE_PAGES',
  testsTotal:   2487,
  testsPassed:  2487,
  testsFailed:  0,
  changes:      ['Flujo de reserva', 'Panel admin', 'QR control acceso'],
});

// Avanzar estado
const { manifest: ready } = advanceReleaseStatus(manifest, RELEASE_STATUS.READY, 'agency-owner');
const { manifest: deployed } = advanceReleaseStatus(ready, RELEASE_STATUS.DEPLOYED, 'devops');
```

---

## Estados del Manifest (RELEASE_STATUS)

| Estado | Descripción |
|---|---|
| `DRAFT` | En preparación |
| `READY` | Listo para deploy, aprobado |
| `BLOCKED` | Gate fallido, no puede proceder |
| `DEPLOYED` | Deploy ejecutado correctamente |
| `ROLLED_BACK` | Revertido a versión anterior |
| `FAILED` | Deploy fallido sin rollback exitoso |

---

## Release Gates (10)

`evaluateReleaseGates(checks)` valida los 10 gates antes de DEPLOYED:

| Gate | P0 |
|---|---|
| BUILD_GATE | ✅ |
| TEST_GATE | ✅ |
| SECURITY_GATE | ✅ |
| PRIVACY_GATE | No (Human Review) |
| ACCESSIBILITY_GATE | No |
| MOBILE_GATE | ✅ |
| RUNTIME_GATE | ✅ |
| DEPLOY_GATE | ✅ |
| POST_DEPLOY_GATE | ✅ |
| ROLLBACK_GATE | No |

- `deploymentAllowed: true` solo si `overallResult === 'PASS'`
- Cualquier P0 en BLOCKED → `overallResult: 'BLOCKED'`

---

## Uso Integrado

El Release Manifest se incluye en el Post-Deploy Handoff (ver AGENCY_POST_DEPLOY_HANDOFF).

> DEPLOYED status no implica deploy real en Paso G. Documentación operacional.
