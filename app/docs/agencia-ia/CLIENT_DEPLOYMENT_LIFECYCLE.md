# Ciclo de Vida de Despliegue de Cliente

Fecha: 2026-07-08 · Complementa `clients/README.md` (flujo operativo de 10 etapas, Quick Win 8) dándole una máquina de estados formal y validable (`config/deployment-profile.schema.json`). No sustituye `audit/agency-platform-architecture/AGENCY_CLIENT_ONBOARDING_PIPELINE.md` (pipeline comercial completo) ni `AGENCY_DEPLOYMENT_TEMPLATE.md` (checklist técnico de 18 pasos) — los conecta con el contrato de estado.

## Environments (Fase 2)

| Entorno | Propósito | Quién lo usa |
|---|---|---|
| `development` | Config en construcción, sin validar todavía o recién validada | Equipo de onboarding |
| `staging` | Config validada, branding e integraciones documentadas, pendiente de QA | Equipo de onboarding + QA |
| `production` | Cliente real, visible para sus usuarios finales | Cliente + soporte |

## Regla de promoción (sin salto directo)

**`development` → `production` sin pasar por `staging` y sin `qaStatus: "PASS"` no es solo una mala práctica: el propio `config/deployment-profile.schema.json` lo rechaza** (regla `if/then` sobre `environment`/`qaStatus`/`deploymentStatus`, ver `DEPLOYMENT_PROFILE_GUIDE.md`). No hay forma de que un `deployment-profile.json` describa un cliente en producción sin QA superado y sin haber alcanzado como mínimo `PRODUCTION_READY`.

## Máquina de estados (`deploymentStatus`)

```
DRAFT
  │  gate CONFIG_VALID = PASS
  ▼
CONFIG_READY
  │  gates BRANDING_VALID + INTEGRATIONS_VALID = PASS · environment → staging
  ▼
STAGING_READY
  │  gate QA_VALID = PASS (qaStatus = PASS)
  ▼
QA_PASS
  │  gates SECURITY_VALID + BACKUP_READY + OBSERVABILITY_READY = PASS
  ▼
PRODUCTION_READY
  │  environment → production · despliegue real ejecutado (fuera de esta documentación)
  ▼
DEPLOYED
  │  smoke test + comprobaciones post-deploy = PASS
  ▼
VERIFIED
  │  gate GO_LIVE_APPROVED = PASS (goLiveStatus = APPROVED)
  ▼
ACTIVE ──────────────┐
  │                   │ incidente / decisión de negocio
  │ offboarding        ▼
  ▼                 SUSPENDED ──► (resuelto) ──► ACTIVE
ARCHIVED  ◄───────────┘ (offboarding definitivo)
```

Cualquier salto hacia atrás (p.ej. `VERIFIED` → `PRODUCTION_READY`) se documenta como **rollback** (`docs/agencia-ia/CLIENT_ROLLBACK_CONTRACT.md`), nunca editando el estado sin dejar rastro.

## Mapeo con el flujo operativo de `clients/README.md`

| Etapa (`clients/README.md`) | `deploymentStatus` resultante |
|---|---|
| CLIENT PROFILE | `DRAFT` |
| CONFIG VALIDATION | `CONFIG_READY` |
| BRANDING + INTEGRATIONS | `STAGING_READY` |
| QA | `QA_PASS` → (tras gates de seguridad/backup/observabilidad) `PRODUCTION_READY` |
| DEPLOYMENT | `DEPLOYED` |
| — (verificación post-deploy) | `VERIFIED` |
| GO-LIVE | `ACTIVE` |
| CUSTOMER SUCCESS | se mantiene en `ACTIVE`, fuera del alcance de este documento |

## Checklist de despliegue (Fase 5)

Cada bloque se corresponde con un tramo de la máquina de estados. Ninguno de estos pasos se ejecuta desde esta documentación — es la lista que un humano (o una futura automatización) debe completar.

### PRE-DEPLOY
- [ ] `deploymentStatus` en `PRODUCTION_READY`.
- [ ] Todos los gates salvo `GO_LIVE_APPROVED` en `PASS`.
- [ ] `rollbackRef.previousReleaseVersion`/`previousConfigRef` registrados si existe un despliegue previo.

### DEPLOY
- [ ] `environment` pasa a `production` en `deployment-profile.json`.
- [ ] `releaseVersion` actualizado.
- [ ] `deploymentStatus` pasa a `DEPLOYED`.

### POST-DEPLOY
- [ ] `lastValidatedAt` actualizado con la fecha real del despliegue.
- [ ] `workerProfile`/`domainRef` confirmados (referencia, no valor inventado).

### SMOKE TEST
- [ ] Arranque sin errores (mismo criterio ya usado en las auditorías previas de este repo: HTTP 200 + sin error de import).
- [ ] `deploymentStatus` pasa a `VERIFIED` solo si el smoke test pasa.

### ROLE QA
- [ ] Cada rol de `client-config.json.roles` navega solo a sus secciones permitidas (pendiente de prueba manual, sin tests de render React en este proyecto — mismo criterio ya documentado en `clients/_template/QA_CHECKLIST.md`).

### INTEGRATION QA
- [ ] Gate `INTEGRATIONS_VALID` en `PASS`, coordinado con el equipo responsable de Make/Airtable (fuera del alcance de esta documentación).

### OBSERVABILITY CHECK
- [ ] Gate `OBSERVABILITY_READY` en `PASS` — ver `AGENCY_OBSERVABILITY_MODEL.md` para qué debería cubrir (hoy NO_EXISTE observabilidad multi-cliente real, este gate documenta el requisito, no lo implementa).

### BACKUP CHECK
- [ ] Gate `BACKUP_READY` en `PASS` — fuera del alcance técnico de esta tarea (Backups es un área explícitamente no tocada).

### GO-LIVE CONFIRMATION
- [ ] `goLiveStatus` pasa a `APPROVED` con `approver` registrado en el gate `GO_LIVE_APPROVED`.
- [ ] `deploymentStatus` pasa a `ACTIVE`.
- [ ] `clients/<slug>/STATUS.md` actualizado en paralelo (ambos documentos deben decir lo mismo).
