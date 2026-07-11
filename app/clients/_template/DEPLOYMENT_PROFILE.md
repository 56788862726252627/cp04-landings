# DEPLOYMENT PROFILE — `<slug-cliente>`

Plantilla operativa, coherente con `config/deployment-profile.schema.json`. El archivo de estado real de este cliente es `deployment-profile.json` (copiar desde `deployment-profile.json.example` en esta misma carpeta) — este `.md` es la guía para rellenarlo y el resumen legible, no un duplicado de sus datos.

Ver también: `docs/agencia-ia/CLIENT_DEPLOYMENT_LIFECYCLE.md` (máquina de estados completa), `DEPLOYMENT_PROMOTION_GATES.md` (detalle de los 8 gates), `CLIENT_ROLLBACK_CONTRACT.md` (procedimiento de rollback) y `audit/agency-platform-architecture/AGENCY_DEPLOYMENT_TEMPLATE.md` (checklist técnico de 18 pasos, más amplio que el de este documento).

## Resumen del estado actual (debe coincidir siempre con `deployment-profile.json`)

| Campo | Valor |
|---|---|
| `environment` | `development` |
| `deploymentStatus` | `DRAFT` |
| `qaStatus` | `PENDING` |
| `goLiveStatus` | `NOT_REQUESTED` |
| `releaseVersion` | `null` (todavía no hay nada desplegado) |
| Dominio | `null` (pendiente — no inventar uno aquí) |
| Worker profile | `null` (pendiente) |

## Máquina de estados aplicable a este cliente

```
DRAFT → CONFIG_READY → STAGING_READY → QA_PASS → PRODUCTION_READY → DEPLOYED → VERIFIED → ACTIVE
```
Detalle completo, condiciones de cada flecha y estados laterales (`SUSPENDED`/`ARCHIVED`) en `docs/agencia-ia/CLIENT_DEPLOYMENT_LIFECYCLE.md`.

**Regla dura, no solo convención**: `environment: "production"` sin `qaStatus: "PASS"` hace que `deployment-profile.json` **no valide** contra el schema (regla `if/then`, ver `config/DEPLOYMENT_PROFILE_GUIDE.md`). No hay salto directo `development` → `production`.

## Gates pendientes de este cliente

Copiar del bloque `gates` de `deployment-profile.json` cada vez que cambie algo — esta tabla es solo para lectura rápida, la fuente de verdad es el JSON.

| Gate | Estado | Owner | Bloqueante |
|---|---|---|---|
| `CONFIG_VALID` | `PENDING` | | |
| `BRANDING_VALID` | `PENDING` | | |
| `INTEGRATIONS_VALID` | `PENDING` | | |
| `SECURITY_VALID` | `PENDING` | | |
| `QA_VALID` | `PENDING` | | |
| `BACKUP_READY` | `PENDING` | | |
| `OBSERVABILITY_READY` | `PENDING` | | |
| `GO_LIVE_APPROVED` | `PENDING` | | |

## Antes de pasar a `staging`

- [ ] `client-config.json` validado contra `config/client-config.schema.json` (§8 de `clients/README.md`) → gate `CONFIG_VALID`.
- [ ] Branding cerrado (`BRANDING.md`) → gate `BRANDING_VALID`.
- [ ] Integraciones documentadas, aunque estén `enabled: false` (`INTEGRATIONS.md`) → gate `INTEGRATIONS_VALID`.
- [ ] `deployment-profile.json`: `environment` pasa a `"staging"`, `deploymentStatus` a `"STAGING_READY"`.

## Antes de pasar a `production`

- [ ] `QA_CHECKLIST.md` completo → gate `QA_VALID`, `qaStatus: "PASS"`.
- [ ] Gates `SECURITY_VALID`, `BACKUP_READY`, `OBSERVABILITY_READY` en `PASS` (coordinados con los equipos responsables de esas áreas — fuera del alcance de esta plantilla).
- [ ] Dominio real configurado (si aplica) — se documenta en `client-config.json.domains`, `domainRef` aquí solo apunta a esa referencia.
- [ ] Secrets reales dados de alta en Cloudflare/Make **por una persona**, nunca por script automático (ver `SECRETS_REFERENCES.md`).
- [ ] `deployment-profile.json`: `deploymentStatus` avanza `PRODUCTION_READY` → `DEPLOYED` → `VERIFIED`.
- [ ] Gate `GO_LIVE_APPROVED` en `PASS`, `goLiveStatus: "APPROVED"`, `deploymentStatus: "ACTIVE"`.
- [ ] `STATUS.md` actualizado a `activo` con la misma fecha que `deployment-profile.json.lastValidatedAt`.

## Qué NO hacer aquí

- No cambiar `deploymentStatus`/`environment` a valores de producción "solo para probar" — son la fuente de verdad de si el cliente está realmente desplegado.
- No desplegar Worker/Pages reales desde esta plantilla sin pasar por el checklist completo y los 8 gates.
- No inventar un dominio, versión, cuenta o token real en `deployment-profile.json` — `null` o una referencia de nombre hasta que exista de verdad.
- No dejar `deployment-profile.md` y `deployment-profile.json` diciendo cosas distintas — si difieren, el `.json` manda y este `.md` está desactualizado.
