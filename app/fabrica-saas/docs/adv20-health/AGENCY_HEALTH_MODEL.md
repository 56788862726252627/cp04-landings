# ADV-20 — Health Model Reference

## 27 Health Dimensions

| Dimension | Connected ADV | Critical? |
|-----------|--------------|-----------|
| SYSTEM | — | No |
| APPLICATION | — | No |
| BUILD | — | No |
| TESTS | — | No |
| CI_CD | ADV-02 | No |
| DEPLOYMENT | ADV-04 | No |
| OBSERVABILITY | ADV-01 | No |
| SECURITY | ADV-19 | **Yes** |
| PRIVACY | ADV-19 | **Yes** |
| GDPR | ADV-19 | No |
| CMP | ADV-19 | No |
| BACKUPS | ADV-18 | **Yes** |
| RESTORE | ADV-18 | **Yes** |
| BUSINESS_TRUTH | ADV-10b | **Yes** |
| AI_ROUTER | ADV-16 | No |
| AGENTS | ADV-03, ADV-10 | No |
| MULTIAGENT | ADV-17 | No |
| MCP | ADV-12 | No |
| VOICE | ADV-11 | No |
| CRM | ADV-09 | No |
| LEADS | ADV-08 | No |
| SOCIAL | ADV-14 | No |
| MEDIA | ADV-13 | No |
| BROWSER_QA | ADV-06 | No |
| RUNTIME | ADV-15 | No |
| CLIENT_ISOLATION | ADV-19 | **Yes** |
| PRODUCTION_READINESS | ADV-04 | **Yes** |

## 7 Health Statuses

`HEALTHY` → `DEGRADED` → `WARNING` → `CRITICAL` → `BLOCKED` → `UNKNOWN` → `NOT_APPLICABLE`

## Signal Model

Each signal carries: dimension, status, score (0-100), severity, source, timestamp, clientId, businessId, environment, message, evidence[], recommendedAction, `isReal: false`.

## UNKNOWN vs NOT_APPLICABLE

- `UNKNOWN` = state cannot be determined (stale signal, missing data)
- `NOT_APPLICABLE` = dimension genuinely does not apply to this context
- UNKNOWN on SECURITY, CLIENT_ISOLATION, PRODUCTION_READINESS, BACKUPS, RESTORE, or BUSINESS_TRUTH blocks production readiness
