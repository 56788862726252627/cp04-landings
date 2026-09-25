# AGENCY_ARCHITECTURE — Paso H

**Mapa de Arquitectura del Sistema Completo (Pasos A-H)**

---

## Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRO CENTRAL                          │
│              factory-registry/index.js v2.8.0               │
│    ┌──────┬──────┬──────┬──────┬────────┬──────┬────────┐  │
│    │  A   │  B   │  C   │  D   │   E    │  F   │   G    │  │
│    │gates │core  │comm  │life  │  sop   │maint │deploy  │  │
│    └──────┴──────┴──────┴──────┴────────┴──────┴────────┘  │
│                        │  H  │                               │
│                        │audit│                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Capa A — Factory Core & Gates

**Directorio:** `core/`, `factory-registry/`

**Responsabilidad:** Gates de calidad, sistema de diseño V2, registros de componentes.

**Módulos clave:**
- `core/gates/` → DEAD_CONTROL_GATE, FUNCTIONAL_EXPERIENCE_GATE, MOBILE_PRODUCT_GATE
- `factory-registry/` → 12 sub-registries (components, recipes, presets, etc.)

---

## Capa B — One Prompt → SaaS Pipeline

**Directorio:** `core/`, `generator/`, `verticals/`

**Responsabilidad:** Transformar un brief de negocio en un SaaS planificado.

**Flujo:**
```
brief → validateBrief → analyzeBusiness → resolveVertical
     → generateBranding → planModules → planRoles
     → planDataModel → planAIAgents → generateMakeManifest
     → generateContent → generateIntegrationManifest
```

**Sectores soportados:** dental, veterinary, physiotherapy, education, legal, ecommerce, restaurant, fitness, real_estate, saas, consulting (11 verticales).

---

## Capa C — Commercial Product & Pricing

**Directorio:** `commercial/`

**Responsabilidad:** Paquetes, precios, propuestas, estimaciones.

**Módulos:**
- `packageRecommender.js` → selección de paquete por sector/budget
- `pricingEngine.js` → cálculo de precio final
- `proposalGenerator.js` → documento de propuesta
- `commercialEstimate.js` → estimación de costes y margen
- `thirdPartyCosts.js` → costes de servicios externos
- `maintenancePlans.js` → planes post-entrega (BASIC/PRO/PRIORITY)
- `productCatalog.js` → catálogo de productos
- `serviceLimits.js` → límites por plan

---

## Capa D — Client Lifecycle Pipeline

**Directorio:** `lifecycle/`

**Responsabilidad:** Gestión del ciclo de vida del cliente desde calificación hasta cierre.

**Módulos:**
- `clientLifecycleModel.js` → estado cliente (PROSPECT→ACTIVE→OFFBOARDED)
- `deliveryManifest.js` → entregables acordados
- `deliveryReadiness.js` → gate pre-build
- `factoryHandoff.js` → traspaso fábrica→agencia
- `handoff.js` → handoff general
- `diagnosticEngine.js` → diagnóstico de salud del cliente
- `approvalModel.js` → flujo de aprobaciones
- `changeRequests.js` → gestión de cambios
- `clientCloseout.js` → cierre y offboarding

---

## Capa E — SOP + BPMN Operating System

**Directorios:** `sop/`, `bpmn/`

**Responsabilidad:** Procedimientos operativos estándar y modelado de procesos.

**Módulos SOP:**
- `agencySOP.js` → SOP maestro de agencia
- `clientSOP.js` → SOP específico por cliente
- `aiAgentSOP.js` → SOP para agentes IA
- `commercialSOP.js` → SOP proceso comercial
- `automationSOP.js` → SOP para automatizaciones
- `maintenanceSOP.js` → SOP mantenimiento
- `factorySOP.js` → SOP de la fábrica
- `decisionGates.js` → gates de decisión
- `operatingRoles.js` → roles y responsabilidades
- `incidentManagement.js` → gestión de incidentes

---

## Capa F — Maintenance, Support & Backup

**Directorio:** `maintenance/`

**Responsabilidad:** Operaciones continuas post-entrega.

**Módulos:**
- `maintenancePlans.js` → planes (BASIC=48h, PRO=24h, PRIORITY=4h)
- `maintenanceRunner.js` → ejecución de tareas de mantenimiento
- `maintenanceChecklist.js` → checklist mensual/bi-semanal/semanal
- `maintenanceReport.js` → informes de mantenimiento
- `escalationEngine.js` → matriz de escalado
- `clientHealthScore.js` → score de salud del cliente
- `continuousImprovement.js` → motor de mejora continua
- `backupPolicy.js` → política de backup
- `incidentIntegration.js` → integración health→incident
- `aiHealth.js`, `automationHealth.js` → salud componentes IA

---

## Capa G — Deploy, QA & Security

**Directorio:** `deploy/`

**Responsabilidad:** Pipeline completo de entrega: seguridad, QA, deploy, handoff.

**22 módulos:**

| Grupo | Módulos |
|-------|---------|
| Target & Env | deployTarget, environmentModel |
| Pre-deploy | preDeployReadiness, secretSafetyGate, dataSafetyGate |
| Security | securityHeaders, clientSecurityAudit, apiSecurityGate, dependencySecurity |
| Build | reproducibleBuild, deployPlan, deployRunner |
| QA | postDeployQA, visualQA, runtimeRenderGate, healthChecks |
| Release | rollbackModel, releaseManifest, releaseGates, productionChecklist |
| Cloudflare | cloudflareProfile |
| Handoff | postDeployHandoff |

---

## Capa H — Final Audit & Consolidation

**Directorio:** `audit/`

**Responsabilidad:** Auditoría final del sistema completo + estado de completitud.

**16 módulos:**

| Módulo | Función principal |
|--------|-------------------|
| endToEndMap.js | `auditAgencyEndToEnd()` — 30 etapas |
| crossStepContracts.js | `auditCrossStepContracts()` — 9 contratos |
| registryAudit.js | `auditFactoryRegistry()` — versión + exports |
| capabilityMatrix.js | `buildCapabilityMatrix()` — 19 capacidades |
| advancedBoundary.js | `auditAdvancedBoundary()` — 9 items avanzados |
| securityBaseline.js | `auditAgencySecurityBaseline()` — 12 checks |
| qaBaseline.js | `auditAgencyQABaseline()` — 10 gates |
| documentationAudit.js | `auditAgencyDocumentation()` — 26 docs |
| basicDebt.js | `auditBasicDebt()` — 9 items deuda |
| duplicationAudit.js | `auditAgencyDuplication()` — 8 candidatos |
| namingConsistency.js | `auditNamingConsistency()` — 10 checks |
| clientJourney.js | `runNexoClientJourney()` — 10 pasos |
| failureJourney.js | `runFailureJourneys()` — 9 escenarios |
| contextEfficiency.js | `auditContextEfficiency()` — 10 dimensiones |
| completionStatus.js | `AgencyCompletionStatus()` — estado final |
| agencyAuditRunner.js | `runAgencyAudit()` — orquestador |

---

## Patrones de Diseño

### 1. Función pura con return shape estándar
```js
export function auditX(options = {}) {
  return { valid: boolean, ...metrics, items, overallStatus };
}
```

### 2. Enums frozen
```js
export const STATUS = Object.freeze({ PASS: 'PASS', FAIL: 'FAIL' });
```

### 3. Barrel registry
```js
// factory-registry/deploy.js — re-exporta todo el Paso G
export { ... } from '../deploy/deployRunner.js';
```

### 4. No defaults exports
Solo `export function` / `export const` / `export { }`.

### 5. Tests con node:test
```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
```

---

## Flujo de Datos Entre Capas

```
Client Brief (input)
  ↓ Paso B: análisis + generación
  ↓ Paso C: packaging + propuesta
  ↓ Paso D: calificación + manifest
  ↓ Paso E: SOP + BPMN
  ↓ Paso F: mantenimiento + soporte
  ↓ Paso G: deploy + QA + handoff
Client Product (output)
  ↑ Retroalimentación: G→F, D→B (loops de mejora)
```

---

## Verticales Soportadas

11 sectores: `dental`, `veterinary`, `physiotherapy`, `education`, `legal`, `ecommerce`, `restaurant`, `fitness`, `real_estate`, `saas`, `consulting`
