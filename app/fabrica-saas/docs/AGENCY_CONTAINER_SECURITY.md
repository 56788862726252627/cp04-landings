# AGENCY_CONTAINER_SECURITY — ADV-15

## Security Rules (all BLOCKED if violated)
- `PRIVILEGED_MODE` → CRITICAL
- `ROOT_USER` → HIGH
- `DOCKER_SOCKET_MOUNT` → CRITICAL
- `HOST_ROOT_MOUNT` → CRITICAL
- `HOST_NETWORK` → HIGH
- `SECRET_IN_IMAGE` → CRITICAL
- `MISSING_HEALTH` → MEDIUM

## Enforcement
`evaluateContainerSecurity(spec)` → `{ blocked: true }` if any CRITICAL violation.

## Non-root pattern
```dockerfile
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup
USER appuser
```
