# Gates de Promoción de Despliegue

Fecha: 2026-07-08 · Detalle de los 8 gates definidos en `config/deployment-profile.schema.json` (`gates.*`). Cada gate tiene la misma estructura fija: `status` (`PENDING`/`PASS`/`FAIL`/`BLOCKED`), `owner`, `evidence`, `blocker`, `approver`, `date`.

## Los 8 gates

### CONFIG_VALID
- **Qué verifica**: `clients/<slug>/client-config.json` valida contra `config/client-config.schema.json`.
- **Owner**: equipo de onboarding.
- **Evidence esperada**: referencia al resultado de la validación (ver `config/CLIENT_CONFIG_SCHEMA_GUIDE.md` para el método usado en este proyecto).
- **Bloquea**: paso de `DRAFT` a `CONFIG_READY`.

### BRANDING_VALID
- **Qué verifica**: `clients/<slug>/BRANDING.md` completo, checklist de contraste/assets superado.
- **Owner**: diseño/onboarding.
- **Evidence esperada**: checklist de `BRANDING.md` firmado.
- **Bloquea**: paso a `STAGING_READY`.

### INTEGRATIONS_VALID
- **Qué verifica**: `clients/<slug>/INTEGRATIONS.md` coincide con el estado real de Airtable/Make de ese cliente.
- **Owner**: equipo responsable de esas integraciones (coordinado, fuera del alcance de esta plantilla — ver regla "NO TOCAR Make/Airtable").
- **Evidence esperada**: confirmación externa de alta de base/escenarios.
- **Bloquea**: paso a `STAGING_READY`.

### SECURITY_VALID
- **Qué verifica**: controles P0/P1 de `AGENCY_SECURITY_MODEL.md` aplicables a este cliente (p.ej. secrets namespaced, sin valores expuestos en `clients/<slug>/`).
- **Owner**: equipo de seguridad (fuera del alcance de esta tarea — solo se documenta el gate, no se implementan controles de seguridad nuevos aquí).
- **Evidence esperada**: checklist de seguridad específico del cliente (no creado en esta tarea).
- **Bloquea**: paso a `PRODUCTION_READY`.

### QA_VALID
- **Qué verifica**: `clients/<slug>/QA_CHECKLIST.md` completo, sin ítems "pendiente de prueba manual" sin resolver.
- **Owner**: QA/onboarding.
- **Evidence esperada**: `QA_CHECKLIST.md` con las 4 categorías (probado automáticamente/verificado por build/inspeccionado estáticamente/pendiente) resueltas.
- **Bloquea**: paso de `STAGING_READY` a `QA_PASS`. Además, `qaStatus: "PASS"` es condición dura para `environment: "production"` (ver regla `if/then` del schema).

### BACKUP_READY
- **Qué verifica**: existe un mecanismo de respaldo aplicable a este cliente.
- **Owner**: equipo de Backups (área explícitamente fuera del alcance de esta tarea — el gate documenta el requisito, no lo resuelve).
- **Evidence esperada**: confirmación del equipo de Backups.
- **Bloquea**: paso a `PRODUCTION_READY`.

### OBSERVABILITY_READY
- **Qué verifica**: este cliente queda visible en el Centro de Operaciones (hoy NO_EXISTE de forma multi-cliente, ver `AGENCY_OBSERVABILITY_MODEL.md`).
- **Owner**: equipo de Observabilidad (área explícitamente fuera del alcance de esta tarea).
- **Evidence esperada**: confirmación de alta en el panel de observabilidad, cuando exista.
- **Bloquea**: paso a `PRODUCTION_READY`.

### GO_LIVE_APPROVED
- **Qué verifica**: aprobación explícita y humana de pasar el cliente a `ACTIVE`. Es el único gate que no depende de una comprobación técnica automatizable — es una decisión de negocio.
- **Owner**: dirección de proyecto/agencia.
- **Evidence esperada**: nombre del aprobador + fecha.
- **Bloquea**: paso de `VERIFIED` a `ACTIVE`.

## Regla general de todos los gates

Un gate en `BLOCKED` o `FAIL` **detiene la promoción** al siguiente `deploymentStatus`, sin excepción manual silenciosa — si hay que saltárselo por una razón de negocio, esa decisión debe quedar registrada en `blocker` y `approver` del propio gate, no simplemente ignorada.

## Validación de tenant antes de promoción (añadido 2026-07-09)

Antes de que `CONFIG_VALID` pueda pasar a `PASS` para `environment: "production"`, además de validar `client-config.json` contra su schema (ver arriba), debe ejecutarse `checkTenantActiveForPromotion(deploymentProfile, registry)` (`src/config/validateResolvedConfig.js`) contra el `tenant-registry.json` vigente (`config/tenant-registry.schema.json`): un tenant `disabled`/`staging`/`maintenance` no puede promocionarse a `production` aunque el resto de gates estén en `PASS` — ver `fixtures/tenant-config/invalid-disabled-tenant-deployment.deployment-profile.json` para el caso de prueba. También debe ejecutarse `checkTenantRegistryDuplicates(registry)` para descartar `tenantId`/dominio duplicados antes de dar de alta un tenant nuevo en el registro. Ninguna de las dos funciones conecta a Cloudflare/DNS real — son validaciones locales sobre el propio registro.

## Por qué SECURITY_VALID, BACKUP_READY y OBSERVABILITY_READY no se implementan en esta tarea

La misión de este Quick Win excluye explícitamente Seguridad, Observabilidad y Backups como áreas a tocar. Estos 3 gates existen en el **contrato** (`deployment-profile.schema.json`) precisamente para que, cuando esas áreas se trabajen en otras tareas/terminales, tengan un lugar ya preparado donde reportar su estado por cliente — sin necesidad de rediseñar el schema entonces.
