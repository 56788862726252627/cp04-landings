# AGENCY_DEPLOY_STANDARD — Paso G

**Standard de Deploy Reutilizable para Proyectos SaaS de Agencia**

Toda SaaS generada por la fábrica sigue este estándar antes de llegar a manos del cliente.

---

## Pipeline Estándar

```
VALIDACIÓN PRE-DEPLOY
       ↓
SECURITY GATE
       ↓
DEPLOY PLAN
       ↓
RELEASE GATES (10 gates)
       ↓
PRODUCTION CHECKLIST
       ↓
DEPLOY EXECUTION (DRY_RUN / PREVIEW / PRODUCTION)
       ↓
POST-DEPLOY QA
       ↓
HEALTH VERIFICATION
       ↓
ROLLBACK (si procede)
       ↓
POST-DEPLOY HANDOFF
```

---

## Módulos de Paso G

| Módulo | Función |
|---|---|
| `deployTarget.js` | Define proveedor, entorno y estrategia de rollback |
| `environmentModel.js` | Reglas por entorno: LOCAL / PREVIEW / STAGING / PRODUCTION |
| `preDeployReadiness.js` | 22 checks antes de cualquier deploy |
| `secretSafetyGate.js` | 10 patrones de detección de secretos en código |
| `dataSafetyGate.js` | Auditoría de datos demo/test en código de producción |
| `securityHeaders.js` | Headers CSP/HSTS/CORS por entorno |
| `clientSecurityAudit.js` | Auditoría client-side: innerHTML, localStorage, localhost |
| `apiSecurityGate.js` | 12 checks de seguridad para APIs y Workers |
| `dependencySecurity.js` | CVE audit de dependencias |
| `reproducibleBuild.js` | Verificación de build determinista |
| `deployPlan.js` | Plan de despliegue paso a paso |
| `deployRunner.js` | Orquestador DRY_RUN / PREVIEW / PRODUCTION |
| `postDeployQA.js` | 22 checks QA post-deploy |
| `visualQA.js` | Plan QA visual por breakpoint |
| `runtimeRenderGate.js` | Gate obligatorio: no blank screen |
| `healthChecks.js` | 12 checks de salud post-deploy |
| `rollbackModel.js` | Plan de rollback + evaluación automática |
| `releaseManifest.js` | Manifiesto de release versionado |
| `releaseGates.js` | 10 gates de release (P0 bloquean deploy) |
| `productionChecklist.js` | 28 items pre-producción |
| `cloudflareProfile.js` | Perfil declarativo Cloudflare Pages/Workers |
| `postDeployHandoff.js` | Entrega formal integrando Paso F (mantenimiento) |

---

## Principios

1. **DRY_RUN by default** — Ningún deploy real sin intención explícita
2. **Human gate mandatory** — PRODUCTION siempre requiere aprobación humana
3. **No secrets in code** — Todos los secretos via variables de entorno del proveedor
4. **Rollback plan required** — Siempre definido antes de deploy a PRODUCTION
5. **Factory scope only** — Este sistema es reutilizable, no específico de CP04/Aurora/FisioNova

> NO_REAL_DEPLOY · NO_REAL_CREDENTIALS · FACTORY_SCOPE_ONLY
