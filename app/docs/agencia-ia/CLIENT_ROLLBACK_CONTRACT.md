# Contrato de Rollback de Cliente

Fecha: 2026-07-08 · Define el procedimiento, no lo ejecuta. Ningún rollback se dispara desde este documento ni desde esta tarea.

## Estructura del contrato (`rollbackRef` en `deployment-profile.json`)

| Campo | Significado |
|---|---|
| `previousReleaseVersion` | Versión conocida-buena anterior a la que volver. `null` si nunca hubo un despliegue previo. |
| `previousConfigRef` | Referencia al `client-config.json` (o su versión en control de cambios) que estaba activo antes del cambio que se revierte. |
| `previousDeploymentRef` | Referencia al `deployment-profile.json` (o snapshot) del estado anterior. |
| `trigger` | Motivo: `none` (sin rollback nunca ejecutado) / `manual` / `qa_failure` / `incident` / `go_live_rejected` / `other`. |
| `owner` | Quién decide y ejecuta el rollback. |
| `validationAfterRollback` | Referencia a cómo se comprueba que el rollback dejó el sistema en un estado conocido-bueno (normalmente: repetir `QA_CHECKLIST.md`). |

## Rollback triggers

| Trigger | Cuándo se usa | Quién lo decide |
|---|---|---|
| `manual` | Decisión preventiva sin incidente activo (p.ej. el cliente pide revertir un cambio de branding) | Owner del cliente |
| `qa_failure` | El gate `QA_VALID` pasa a `FAIL` **después** de haber promocionado (regresión detectada tarde) | QA |
| `incident` | Fallo detectado en `production` tras `ACTIVE` | Soporte/SUPPORT, coordinado con el owner del cliente |
| `go_live_rejected` | El gate `GO_LIVE_APPROVED` se marca `FAIL` tras haber llegado a `VERIFIED` | Dirección de proyecto |
| `other` | Cualquier motivo no cubierto arriba — debe documentarse en `blocker`/notas del gate correspondiente | Según corresponda |

## Procedimiento (manual, sin automatización)

1. Se identifica el trigger y el `owner` responsable (tabla anterior).
2. Se rellena `rollbackRef` en `deployment-profile.json` con la versión/config/deployment previos conocidos-buenos.
3. `deploymentStatus` retrocede al estado correspondiente al punto conocido-bueno (p.ej. de `ACTIVE` a `PRODUCTION_READY` si se revierte un despliegue fallido, no hace falta volver hasta `DRAFT`).
4. Se ejecuta la reversión real (fuera del alcance de este contrato — es una acción de infraestructura, coordinada con quien gestione Cloudflare/Worker en ese momento).
5. Se completa `validationAfterRollback`: se repite el `QA_CHECKLIST.md` del cliente contra el estado revertido.
6. Solo si la validación posterior pasa, se vuelve a promocionar siguiendo la máquina de estados normal (`CLIENT_DEPLOYMENT_LIFECYCLE.md`) — un rollback nunca "salta" directamente de vuelta a `ACTIVE` sin repetir los gates relevantes.

## Qué NO cubre este contrato

- No define cómo se ejecuta técnicamente un rollback de Cloudflare Worker/Pages, de una base de Airtable ni de escenarios de Make — eso pertenece a las áreas explícitamente excluidas de esta tarea (Cloudflare real, Worker, Airtable, Make).
- No automatiza ninguna reversión. `trigger`/`owner`/`validationAfterRollback` son campos de **registro**, no de ejecución.
- No inventa un historial de versiones real — mientras no exista un primer despliegue real, `previousReleaseVersion`/`previousConfigRef`/`previousDeploymentRef` deben permanecer `null` y `trigger: "none"` (así están en la plantilla, `clients/_template/deployment-profile.json.example`).
