# AGENCY_PRE_DEPLOY_CHECKLIST — Paso G

**22 Checks Pre-Deploy Obligatorios**

Ejecutar `evaluatePreDeployReadiness(checks, environment)` antes de cualquier deploy.

---

## Checks

| ID | Check | Crítico |
|---|---|---|
| scope_approved | Scope aprobado por cliente | ✅ |
| requirements_approved | Requisitos documentados y aprobados | ✅ |
| production_ready | Production Readiness Gate passed | ✅ |
| delivery_ready | Delivery Readiness confirmada | ✅ |
| tests_pass | Todos los tests pasan | ✅ |
| lint_pass | Lint 0 errores | ✅ |
| build_pass | Build exitoso | ✅ |
| functional_gate | QA funcional completado | ✅ |
| dead_control_gate | 0 botones/links muertos | ✅ |
| mobile_gate | QA mobile/responsive completado | ✅ |
| accessibility_gate | Checks de accesibilidad | No |
| security_gate | Security gate pasado | ✅ |
| privacy_gate | GDPR review | Revisión humana |
| role_isolation | Aislamiento de roles verificado | ✅ |
| cross_client_isolation | Aislamiento cross-client verificado | ✅ |
| no_real_demo_data | Sin datos de demo en producción | ✅ |
| no_hardcoded_secrets | Sin secretos hardcoded | ✅ |
| environment_configured | Entorno target configurado | ✅ |
| rollback_defined | Plan de rollback definido | ✅ |
| backup_policy_defined | Política de backup definida | No |
| health_verification_defined | Health check definido | ✅ |
| human_approval | Aprobación humana obtenida | ✅ (siempre en PRODUCTION) |

---

## Outcomes

- `READY` — Todos los críticos OK, puede proceder
- `HUMAN_REVIEW` — Checks de revisión humana pendientes
- `BLOCKED` — Al menos un check crítico ha fallado

---

## PRODUCTION

Para entorno PRODUCTION: `human_approval: true` es **obligatorio**. Sin él → `BLOCKED` automático.

> NO_REAL_DEPLOY · Validación operacional, no certificación legal.
