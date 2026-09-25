# ADV-20 — Client View Reference

## Purpose

The Client View translates technical health data into human-readable status messages appropriate for SaaS clients. It hides stack traces, secrets, internal error codes, and sensitive infrastructure details.

## Enforced Exclusions

- `sensitiveInfoExcluded: true`
- `stackTracesExcluded: true`
- `secretsExcluded: true`

## Status Messages (by overall status)

| Status | Client Message |
|--------|---------------|
| HEALTHY | All systems operating normally |
| DEGRADED | Some services are experiencing reduced performance |
| WARNING | Our team is monitoring a potential issue |
| CRITICAL | We are actively resolving an issue |
| BLOCKED | Service is temporarily unavailable |
| UNKNOWN | System status is being verified |
| NOT_APPLICABLE | Not applicable for your plan |

## Client Isolation Guarantee

Health data from client A is never visible in client B's view. The `clientIsolationHealthAdapter` enforces this, and the quality gate blocks if `crossClientLeakage: true` is detected.

## What Clients See

- Overall status (human text)
- Top concern (if any) — described in plain language
- Recommended action (if any) — what the client should do or expect

## What Clients Never See

- Internal error codes, stack traces, secret names, infrastructure details, other clients' data, internal scoring, raw signal evidence
