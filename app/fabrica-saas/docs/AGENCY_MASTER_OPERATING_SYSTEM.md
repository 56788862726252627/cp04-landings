# AGENCY_MASTER_OPERATING_SYSTEM — Paso H

**Índice central del Sistema Operativo de la Agencia IA Básica**

Versión: 1.0.0 | Completado: 2026-08-31 | Status: BASIC 100%

---

## 1. Visión General

La Agencia IA Básica es un sistema de software para generar, entregar y mantener productos SaaS verticales a clientes. Está compuesta por 8 Pasos (A-H) que cubren el ciclo completo de una agencia digital moderna.

---

## 2. Mapa de Pasos A-H

| Paso | Nombre | Módulos | Tests | Status |
|------|--------|---------|-------|--------|
| A | Factory Core & Gates | 12 | ~150 | ✅ 100% |
| B | One Prompt → SaaS Pipeline | 13 | ~400 | ✅ 100% |
| C | Commercial Product & Pricing | 8 | ~200 | ✅ 100% |
| D | Client Lifecycle Pipeline | 9 | ~200 | ✅ 100% |
| E | SOP + BPMN Operating System | 8 | ~150 | ✅ 100% |
| F | Maintenance, Support & Backup | 10 | ~125 | ✅ 100% |
| G | Deploy, QA & Security | 22 | 111 | ✅ 100% |
| H | Final Audit & Consolidation | 16 | 158 | ✅ 100% |

**Total módulos: 100+ | Total tests: 2645 PASS**

---

## 3. Arquitectura de Módulos

```
fabrica-saas/
├── core/          → Paso B (analizadores, planners, engines)
├── commercial/    → Paso C (pricing, packaging, proposals)
├── lifecycle/     → Paso D (client model, handoff, closeout)
├── sop/           → Paso E (SOPs, BPMN, decision gates)
├── bpmn/          → Paso E (BPMN engine)
├── maintenance/   → Paso F (plans, support, backup, incidents)
├── deploy/        → Paso G (22 módulos: security, QA, deploy)
├── audit/         → Paso H (16 módulos: auditoría completa)
├── factory-registry/ → Barrels: A-H exports + metadata
├── generator/tests/  → 9 suites (v2-paso-b ... v2-paso-h)
└── docs/          → 26 documentos operativos
```

---

## 4. Pipeline A→G: Flujo de Entrega Completo

```
BUSINESS_INPUT → BRIEF_VALIDATION → BUSINESS_ANALYSIS → VERTICAL_RESOLUTION
→ BRANDING → MODULE_PLANNING → ROLE_PLANNING → DATA_MODEL → AI_AGENT_PLANNING
→ MAKE_MANIFEST → CONTENT_GENERATION → INTEGRATION_MANIFEST
→ COMMERCIAL_PACKAGING → PRICING → PROPOSAL → COMMERCIAL_ESTIMATE
→ CLIENT_QUALIFICATION → DELIVERY_MANIFEST → DELIVERY_READINESS → FACTORY_HANDOFF
→ SOP_SETUP → BPMN_PROCESS
→ MAINTENANCE_PLAN → SUPPORT_SETUP → BACKUP_POLICY → INCIDENT_MANAGEMENT
→ PRE_DEPLOY_READINESS → DEPLOY_PIPELINE → POST_DEPLOY_QA → CLOSEOUT
```

**30 etapas | 15 gates | 6 Pasos cubiertos (B-G)**

---

## 5. Contratos Cross-Step

| Contrato | De | A | Status |
|----------|-----|---|--------|
| B→C | analyzeBusiness | commercial packaging | ✅ VERIFIED |
| B→D | analyzeBusiness | client lifecycle | ✅ VERIFIED |
| C→D | proposal | delivery manifest | ✅ VERIFIED |
| D→B | diagnosticEngine | re-análisis | ✅ COMPATIBLE |
| D→E | factoryHandoff | SOP setup | ✅ VERIFIED |
| E→F | agencySOP | maintenanceSOP | ✅ VERIFIED |
| E→G | clientSOP | deploy gate | ✅ COMPATIBLE |
| F→G | maintenanceRunner | healthChecks | ✅ COMPATIBLE |
| G→F | healthChecks | continuousImprovement | ✅ VERIFIED |

---

## 6. Registro de Versiones

- Registry v2.8.0 (actualizado en Paso H)
- PASO_A..H_STATUS: `100_PERCENT`

---

## 7. Documentos Operativos

**Paso G (20 docs):** AGENCY_DEPLOY_STANDARD, AGENCY_ENVIRONMENTS, AGENCY_PRE_DEPLOY_CHECKLIST, AGENCY_SECRET_SAFETY, AGENCY_DATA_SAFETY, AGENCY_SECURITY_HEADERS, AGENCY_CLIENT_SECURITY, AGENCY_API_SECURITY, AGENCY_DEPENDENCY_SECURITY, AGENCY_REPRODUCIBLE_BUILD, AGENCY_DEPLOY_PLAN, AGENCY_POST_DEPLOY_QA, AGENCY_VISUAL_QA, AGENCY_RUNTIME_RENDER_GATE, AGENCY_HEALTH_CHECKS, AGENCY_ROLLBACK, AGENCY_RELEASE_MANAGEMENT, AGENCY_PRODUCTION_CHECKLIST, AGENCY_CLOUDFLARE_DEPLOY, AGENCY_POST_DEPLOY_HANDOFF

**Paso H (6 docs):** AGENCY_MASTER_OPERATING_SYSTEM *(este)*, AGENCY_ARCHITECTURE, AGENCY_BASIC_COMPLETION_CHECKLIST, AGENCY_BASIC_AUDIT_REPORT, AGENCY_ADVANCED_ROADMAP, AGENCY_KNOWN_LIMITATIONS

---

## 8. Gestión de Seguridad

- **Secretos:** `auditCodeForSecrets` + strings dinámicos en tests (no `sk_live_` literal)
- **Datos:** Solo fixtures ficticias — nunca PII real en código
- **Deploy:** PRODUCTION bloqueado por defecto (DRY_RUN)
- **Headers:** `buildSecurityHeaders` + `validateSecurityHeaders`

---

## 9. Sistema de QA

- **Unit:** 2645 tests con `node:test` nativo (sin vitest)
- **E2E:** Visual QA plan (browser requerido) — ADV-01 para headless
- **Gates:** 10 release gates + 28-item production checklist
- **Health:** 6 áreas monitorizadas post-deploy

---

## 10. Clientes Demo (Ficticios)

| Cliente | Sector | Uso |
|---------|--------|-----|
| Clínica Veterinaria Nexo | veterinary | Journey principal Paso H |
| Clínica Dental Aurora | dental | Demo V1.5/V1.6 |
| FisioNova | physiotherapy | Demo V2 Pilot |
| EducaArchidona | education | Demo V1.8 |

**GUARDRAIL:** `isReal: false` | `dataType: 'FIXTURE'` en todos los fixtures.

---

## 11. Deuda Técnica Conocida

| ID | Categoría | Resolución |
|----|-----------|------------|
| DEBT-01 | ACCEPTABLE_DEMO | DRY_RUN es diseño de seguridad |
| DEBT-02 | ADVANCED_FUTURE | ADV-02: Stripe real |
| DEBT-03 | ADVANCED_FUTURE | ADV-03: WhatsApp real |
| DEBT-04 | ADVANCED_FUTURE | ADV-01: Playwright E2E |
| DEBT-05 | ADVANCED_FUTURE | ADV-09: Motor BPMN ejecutable |

**Blockers básicos: 0**

---

## 12. Límites de la Versión Básica

9 items ADVANCED — ver `AGENCY_KNOWN_LIMITATIONS.md` y `AGENCY_ADVANCED_ROADMAP.md`.

---

## 13. Instrucciones de Uso

```js
// 1. Importar desde el registro central
import { analyzeBusiness, runAgencyAudit } from './factory-registry/index.js';

// 2. Ejecutar pipeline básico
const analysis = analyzeBusiness({ sector: 'veterinary', ... });

// 3. Ejecutar auditoría completa
const audit = runAgencyAudit();
// audit.valid === true → sistema listo
// audit.summary.basicStatus === '100_PERCENT'
```

---

## 14. Guardrails Permanentes

```
FACTORY_SCOPE_ONLY=SI
CP04_NO_TOUCH=SI | AURORA_NO_TOUCH=SI | FISIONOVA_NO_TOUCH=SI
NO_REAL_CLIENTS=SI | NO_REAL_SECRETS=SI | NO_REAL_CREDENTIALS=SI
NO_REAL_PAYMENTS=SI | NO_REAL_EMAILS=SI | NO_REAL_DEPLOY=SI
NO_PRODUCTION_CHANGES=SI
```

---

## 15. Roadmap Avanzado

Ver `AGENCY_ADVANCED_ROADMAP.md` — 9 items, estimación individual.

---

## 16. Estado Final

```
AGENCY_BASIC_STATUS = '100_PERCENT'
AGENCY_BASIC_HOURS_REMAINING = 0
PASOS_COMPLETADOS = A, B, C, D, E, F, G, H
TESTS = 2645 PASS
LINT = 0 errores
BUILD = PASS (1.34s)
```
