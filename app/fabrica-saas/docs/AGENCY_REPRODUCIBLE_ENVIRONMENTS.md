# AGENCY_REPRODUCIBLE_ENVIRONMENTS — ADV-15

## Goal
Same behavior in LOCAL / TEST / CI / STAGING / PRODUCTION.

## Environment Profiles
| Environment | Port | Install | Readiness |
|---|---|---|---|
| LOCAL | 5173 | npm install | WAIT_FOR_PROCESS |
| TEST | 5180 | npm ci | IMMEDIATE |
| CI | 5180 | npm ci | IMMEDIATE |
| STAGING | 5180 | npm ci | WAIT_FOR_HEALTH |
| PRODUCTION | 5180 | npm ci | WAIT_FOR_HEALTH |

## Runtime Modes
- `NATIVE` — Node local, npm ci
- `CONTAINER` — Docker multi-stage
- `SERVERLESS` — Cloudflare Pages/Workers (Docker not applicable)

## One-Command Start
`startReproducibleEnvironment()` → detects Docker → container path or safe native fallback.
