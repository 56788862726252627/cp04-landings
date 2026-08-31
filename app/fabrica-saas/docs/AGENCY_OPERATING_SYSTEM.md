# Agency IA — Operating System Master

## What happens, who does it, when, what gate validates it

### 1. LEAD
**What**: New client inquiry captured
**Who**: COMMERCIAL
**When**: Inbound contact (web form, referral, direct)
**Gate**: required_fields_complete
**Artifact**: Lead record, CRM entry
**If fails**: Request more info, do not proceed

---

### 2. QUALIFICATION
**What**: Assess budget, timeline, decision maker, sector fit
**Who**: COMMERCIAL
**When**: Lead intake complete
**Gate**: COMMERCIAL_GATE (budget + decision maker)
**Artifact**: Qualification score + outcome
**If fails**: NOT_A_FIT → archive | NEEDS_MORE_INFO → request | HUMAN_REVIEW → agency owner review

---

### 3. DISCOVERY + DIAGNOSIS
**What**: Understand pain points, map to solutions
**Who**: PROJECT_MANAGER + AI_SPECIALIST
**When**: Lead qualified
**Gate**: client_validates_diagnosis
**Artifact**: Discovery summary, Diagnosis report
**If fails**: Clarify with client, re-run diagnosis

---

### 4. REQUIREMENTS
**What**: P0/P1/P2 classification from diagnosis
**Who**: PROJECT_MANAGER
**When**: Diagnosis approved
**Gate**: has_p0_requirements + requirements_approved
**Artifact**: Requirements document
**If fails**: Cannot proceed to scope without P0

---

### 5. COMMERCIAL + PROPOSAL
**What**: Package recommendation, pricing, estimate, proposal
**Who**: COMMERCIAL
**When**: Requirements locked
**Gate**: COMMERCIAL_GATE + proposal_generated
**Artifact**: Commercial proposal, estimate
**If fails**: Revise (max 2 rounds), then escalate to AGENCY_OWNER

---

### 6. APPROVAL
**What**: Formal project authorization
**Who**: AGENCY_OWNER
**When**: Proposal accepted by client
**Gate**: agency_owner_approves + budget_confirmed
**Artifact**: Approval record (declarative, not a legal contract)
**If fails**: Project does not start — revisit scope or pricing

---

### 7. PRODUCTION (Factory)
**What**: Generate product (vertical, branding, modules, AI, Make, QA, build)
**Who**: DEVELOPER + AI_SPECIALIST + AUTOMATION_SPECIALIST + QA
**When**: Approval complete
**Gate**: QA_GATE (all P0: functional, dead controls, mobile, build, security, tests)
**Artifact**: Generated product, QA report, delivery manifest
**If fails**: Fix issues, re-run QA gate. Block if P0 fails.

---

### 8. DELIVERY + HANDOFF
**What**: Present to client, training, acceptance
**Who**: PROJECT_MANAGER + SUPPORT
**When**: QA gate PASS
**Gate**: client_accepts + training_complete + acceptance_complete
**Artifact**: Delivery acceptance record, Handoff record
**If fails**: Open Change Request, address and re-present

---

### 9. SUPPORT
**What**: Post-delivery ticket handling
**Who**: SUPPORT
**When**: Handoff complete, support window open
**Gate**: ticket_covered (BUG/CONFIG/TRAINING only)
**Artifact**: Ticket log
**Who receives**: CLIENT_OWNER/CLIENT_USER submit, SUPPORT resolves
**If incident SEV1/SEV2**: escalate PROJECT_MANAGER → AGENCY_OWNER

---

### 10. MAINTENANCE (ongoing)
**What**: Scheduled health reviews
**Who**: SUPPORT + DEVELOPER
**When**: Per maintenance plan schedule
**Gate**: securityPatchesChecked (critical), others warnings
**Artifact**: Maintenance report
**If CRITICAL**: Escalate immediately to PROJECT_MANAGER

---

### 11. CLOSEOUT
**What**: Formal project closure
**Who**: AGENCY_OWNER
**When**: Support window expired, all deliverables confirmed
**Gate**: manifest_exists + handoff_complete + no_critical_open_crs
**Artifact**: Client closeout record (declarative: "REGISTRO DECLARATIVO DE CIERRE. NO ES UN CONTRATO LEGAL.")
**If fails**: BLOCKED status, resolve blockers before closing

---

## Role Summary
| Role | Primary Responsibility |
|------|----------------------|
| AGENCY_OWNER | Final approvals, pricing, incidents SEV1, closeout |
| COMMERCIAL | Lead, qualification, proposals |
| PROJECT_MANAGER | Scope, tracking, delivery, coordination |
| AI_SPECIALIST | AI agent design, diagnosis, experience |
| AUTOMATION_SPECIALIST | Make scenarios, integrations |
| DEVELOPER | Code, build, tech architecture |
| QA | QA gates, security review, delivery gate |
| SUPPORT | Tickets, maintenance, first response |
| CLIENT_OWNER | Approval, acceptance, change requests |
| CLIENT_USER | Product use, support tickets |

## BPMN References
- Full Agency Flow: BPMN_AGENCY_MAIN
- Client Interaction: BPMN_CLIENT
- Factory Generation: BPMN_FACTORY
- Automation: BPMN_AUTOMATION
- Incidents: BPMN_INCIDENT

## Security Non-Negotiables
1. No real credentials stored by agency
2. No secrets in codebase
3. Demo data is always fictitious
4. Production deploy requires agency owner authorization
5. AI agents cannot store credentials
6. Health/RESTRICTED data always triggers HUMAN_REVIEW
