# Agency Client Isolation Security — ADV-19

## Isolation Domains (10)

DATA, MEMORY, CRM, LEADS, BACKUP, MEDIA, SOCIAL, AGENT_CONTEXT, MCP, CONFIGURATION

All 10 domains: cross-client access → always BLOCKED.

## Tenant Security Context

Every operation must declare:
- `clientId`
- `businessId`
- `actor`
- `role`
- `scope`
- `environment`

Missing any → context invalid → operation denied.

## Privilege Escalation Detection

`PrivilegeEscalationDetector` — 5 escalation types:
1. ROLE_CHANGE — to admin/superadmin/root
2. SELF_GRANT — actor grants permissions to themselves
3. SCOPE_BROADENING — requesting scopes not currently held
4. TENANT_CHANGE — switching to different client
5. ADMIN_IMPERSONATION — requesting admin role without admin base

All escalation detections → blocked immediately.

## Authorization

`AuthorizationPolicyEvaluator`:
- Deny by default
- RBAC with explicit allow lists
- Client isolation enforced at every evaluation
- Missing permissions → DENY with specific reasons

## IDOR Protection

`ObjectAccessControlPolicy`:
- Cross-client resource access → BLOCKED
- Cross-owner resource access → DENIED
- `detectIDOR(requests)` for batch analysis
