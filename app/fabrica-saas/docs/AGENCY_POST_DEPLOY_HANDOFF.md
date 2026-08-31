# AGENCY_POST_DEPLOY_HANDOFF — Paso G

**Entrega Formal Post-Deploy al Cliente**

`createPostDeployHandoff(params)` genera el paquete de entrega completo, integrando Paso F (mantenimiento) con Paso G (deploy).

---

## Estructura del Handoff (7 secciones)

| Sección | Contenido |
|---|---|
| `RELEASE_INFO` | Versión, commitSha, entorno, URL deployed |
| `QA_SUMMARY` | Resumen de post-deploy QA (22 checks) |
| `HEALTH_SUMMARY` | Resumen de health checks (12 checks) |
| `MAINTENANCE_SETUP` | Tier de mantenimiento, response targets, cadencia |
| `ROLLBACK_INFO` | Plan de rollback, versión previa, tiempo estimado |
| `CLIENT_BRIEFING` | Resumen ejecutivo para el cliente |
| `NEXT_STEPS` | Pasos inmediatos, mantenimiento, opcionales |

---

## Uso

```js
import { createPostDeployHandoff } from '../deploy/postDeployHandoff.js';

const { handoff } = createPostDeployHandoff({
  projectName:     'Clínica Nexo',
  clientId:        'nexo-001',
  maintenanceTier: 'PRO',          // BASIC | PRO | PRIORITY
  deployedUrl:     'https://nexo.pages.dev',
  releaseManifest: manifest,       // de releaseManifest.js
  qaResult:        qaResult,       // de postDeployQA.js
  healthResult:    healthResult,   // de healthChecks.js
  rollbackPlan:    rollbackPlan,   // de rollbackModel.js
});

// handoff.status → 'COMPLETE' | 'PARTIAL' | 'BLOCKED'
// handoff.sections[HANDOFF_SECTIONS.CLIENT_BRIEFING]
// handoff.sections[HANDOFF_SECTIONS.MAINTENANCE_SETUP]
```

---

## Status del Handoff

| Status | Condición |
|---|---|
| `COMPLETE` | QA y health checks OK |
| `PARTIAL` | Sin QA o health results aún |
| `BLOCKED` | QA o health en FAIL — resolver antes de entregar |

---

## Integración Paso F → Paso G

| Paso F | Paso G |
|---|---|
| `maintenanceTier` (BASIC/PRO/PRIORITY) | Response targets en CLIENT_BRIEFING |
| `backupPolicy` | Referenciada en MAINTENANCE_SETUP |
| `supportChannel` | Incluida en CLIENT_BRIEFING |
| `nextMaintenanceReview` | NEXT_STEPS |

---

## Response Targets por Tier

| Tier | P1 Response | Cadencia |
|---|---|---|
| BASIC | 48h | Mensual |
| PRO | 24h | Quincenal |
| PRIORITY | 4h | Semanal |

---

## Flujo Completo

```
createReleaseManifest() →
evaluateReleaseGates()  →
runDeployPipeline()     →
runPostDeployQA()       →
runHealthChecks()       →
createRollbackPlan()    →
createPostDeployHandoff() → 📦 ENTREGA AL CLIENTE
```

> Post-deploy handoff es el documento final de cierre de proyecto. NO_REAL_DEPLOY.
