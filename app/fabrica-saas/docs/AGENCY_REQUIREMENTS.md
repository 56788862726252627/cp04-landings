# Requirements Engine

## Requirement Types
FUNCTIONAL | NON_FUNCTIONAL | DATA | SECURITY | PRIVACY | INTEGRATION | AI | AUTOMATION | UX | ACCESSIBILITY | PERFORMANCE | OPERATIONS

## Priorities
- **P0** — Must have (blocks delivery if missing)
- **P1** — Should have (in scope, not blocking)
- **P2** — Could have (requires add-on)
- **P3** — Deferred to Fase 2

## Default P0 Requirements (all projects)
Admin panel, booking/calendar system, client management, load performance (<3s LCP), data storage in Supabase, authentication, RBAC, GDPR compliance.

## Conditional P0 (legalConstraints.healthData=true)
RGPD Art.9 compliance, clinical data with RLS, data restricted by role.

## Return Structure
```js
{
  requirements: [],  // all reqs with id, type, priority, description, acceptanceCriteria
  total: 30,
  byType: { FUNCTIONAL: [], SECURITY: [], ... },
  byPriority: { P0: [], P1: [], P2: [], P3: [] },
  criticalMissing: [],
  humanReviewRequired: bool
}
```
