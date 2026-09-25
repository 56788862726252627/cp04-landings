# Agency Maintenance & Support — Master Document

**Paso F — Post-Delivery Operational Layer**
**Version**: 1.0.0 | **Status**: ACTIVE

---

## Overview

Paso F defines the complete operational layer for maintaining client products delivered by the Agency IA Factory. It covers maintenance service contracts, support ticket management, backup policies, health monitoring, and service offboarding.

**Scope**: Applies after product delivery. Not a replacement for SLA agreements — this is an operational framework.

---

## Maintenance Tiers

| Tier | Response P1 | Included Hours | Cadence | Backup |
|------|------------|----------------|---------|--------|
| BASIC | 48h | 2h/month | Monthly | Weekly DB |
| PRO | 24h | 5h/month | Biweekly | Daily DB |
| PRIORITY | 4h | 10h/month | Weekly | Daily DB+File |

---

## Core Modules

| Module | File | Purpose |
|--------|------|---------|
| MaintenanceService | `maintenance/maintenanceService.js` | Service model + tier config |
| SupportTicket | `maintenance/supportTicket.js` | 12 types, 9 states |
| TriageEngine | `maintenance/triageEngine.js` | Auto-assign priority + assignee |
| ServiceTargets | `maintenance/serviceTargets.js` | P1-P4 response targets per tier |
| IncidentIntegration | `maintenance/incidentIntegration.js` | Ticket → Incident bridge |
| BackupPolicy | `maintenance/backupPolicy.js` | Backup model + health audit |
| MaintenanceChecklist | `maintenance/maintenanceChecklist.js` | 15 checks, 5 outcomes |
| MaintenanceRunner | `maintenance/maintenanceRunner.js` | Full cycle orchestration |
| SupportQueue | `maintenance/supportQueue.js` | 8 queue functions |
| EscalationEngine | `maintenance/escalationEngine.js` | NONE → CRITICAL levels |
| ThirdPartyIncidents | `maintenance/thirdPartyIncidents.js` | Ownership classification |
| AutomationHealth | `maintenance/automationHealth.js` | Make/Zapier scenario audit |
| AIHealth | `maintenance/aiHealth.js` | AI agent health audit |
| SecurityMaintenance | `maintenance/securityMaintenance.js` | 10-point security review |
| ClientHealthScore | `maintenance/clientHealthScore.js` | Composite 0-100 score |
| MaintenanceReport | `maintenance/maintenanceReport.js` | Structured cycle reports |
| ScopeBoundary | `maintenance/scopeBoundary.js` | INCLUDED/BILLABLE classification |
| ContinuousImprovement | `maintenance/continuousImprovement.js` | Improvement opportunities |
| ServiceOffboarding | `maintenance/serviceOffboarding.js` | Structured service closure |

---

## Operational Guarantees

- **NO_REAL_BACKUPS**: All backup policies are planning models. No data is stored.
- **NO_REAL_INCIDENT_ACTIONS**: Incident records are operational tracking, not auto-triggers.
- **NO_REAL_EMAILS**: No notifications sent to real recipients.

---

## Integration Points

- `sop/incidentManagement.js` — Incident escalation from support tickets
- `sop/decisionGates.js` — Gate checks within maintenance SOP
- `commercial/maintenancePlans.js` — Tier config source of truth
- `lifecycle/supportWindow.js` — Support window definitions
