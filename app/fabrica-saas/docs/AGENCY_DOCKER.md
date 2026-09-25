# AGENCY_DOCKER — ADV-15

## Overview
Docker support layer for Factory SaaS — reproducible environments for Local / CI / Staging / Production.

## Key Constraints
- `FACTORY_AGENCY_SCOPE_ONLY=SI`
- `NO_REAL_PRODUCTION_DEPLOY=SI`
- `NO_REAL_SECRETS=SI`
- Docker is **optional** — not required in Termux/proot
- Port 5175 is **reserved** — use 5180

## When Docker is unavailable
`DOCKER_RUNTIME_AVAILABLE=NO` → `VALIDATION_MODE=STATIC_VALIDATION`

ADV-15 completes fully without Docker daemon. All policies run as static validation.

## Modules
- `Dockerfile` — multi-stage, non-root, health check, no secrets
- `.dockerignore` — excludes `.env`, `.secrets`, `node_modules`, `.git`
- `ContainerSecurityPolicy` — blocks privileged, docker socket, host root mount
- `ContainerPortPolicy` — default 5180, blocks 5175
- `DockerCapabilityDetector` — AVAILABLE / CLI_ONLY / DAEMON_UNAVAILABLE / UNSUPPORTED
