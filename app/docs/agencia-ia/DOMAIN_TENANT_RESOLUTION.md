# Resolución de Dominio → Tenant → Vertical → Config

Fecha: 2026-07-09 · Diseño de la resolución `hostname → tenant → vertical → resolvedConfig`, implementado en `src/config/resolveDomainTenant.js`, consumiendo `config/tenant-registry.schema.json`. Documento de diseño + función pura testeada con fixtures — **no se conecta a Cloudflare Pages/Workers real, no hay ningún DNS ni enrutamiento real tocado**. Hoy Club Pádel 04 sirve desde un único dominio conocido (`club-padel-04.pages.dev`, Modelo A) — este mecanismo es el que haría falta el día que exista un segundo dominio real, no antes.

## Entradas

- `hostname`: string, el host de la request (p. ej. `club-padel-04.pages.dev`, o un dominio propio futuro).
- `registry`: documento `tenant-registry.json` ya cargado y validado (`loadTenantRegistry`).

## Algoritmo

```
buscar en registry.tenants el primer tenant cuyo domains.primary === hostname
                                    o cuyo domains.subdomain === hostname

si no se encuentra:
    → { status: "unknown_domain", tenantId: null }

si se encuentra:
    → { status: tenant.status, tenantId, verticalId, slug }
```

`tenant.status` (`active | disabled | staging | maintenance`) se propaga tal cual como el `status` de la resolución — la decisión de qué hacer con cada uno (servir la app, mostrar página de mantenimiento, rechazar) es responsabilidad de quien consuma este resultado (hoy nadie; es el mismo criterio de "documentar el contrato, no ejecutar la acción" de `docs/agencia-ia/CLIENT_ROLLBACK_CONTRACT.md`).

## Los 5 estados de resolución

| Estado | Cuándo | Significado |
|---|---|---|
| `active` | `hostname` coincide con un tenant `status: "active"` | Resolución normal — el llamador puede proceder a `loadClientConfig` + `mergeConfigLayers` para ese tenant. |
| `staging` | `hostname` coincide con un tenant `status: "staging"` | Config validada pero no promovida a producción (`deploymentStatus` anterior a `PRODUCTION_READY`, ver `CLIENT_DEPLOYMENT_LIFECYCLE.md`). Debe servirse solo desde el dominio de staging, nunca confundirse con producción. |
| `maintenance` | `hostname` coincide con un tenant `status: "maintenance"` | Tenant activo pero temporalmente en mantenimiento — el llamador debería mostrar una página de mantenimiento, no la config resuelta. |
| `disabled` | `hostname` coincide con un tenant `status: "disabled"` | Tenant offboarded/suspendido (ver `CLIENT_ROLLBACK_CONTRACT.md` triggers). No debe servirse nada — bloqueo duro. |
| `unknown_domain` | `hostname` no está en el registro | Dominio no reconocido — ni error de tenant ni de config, simplemente no hay tenant asociado todavía. |

## Dominio principal vs. subdominio vs. custom domain futuro

`tenant.domains.subdomain` es el dominio "de la agencia" (hoy `*.pages.dev`, el único patrón con evidencia real). `tenant.domains.primary` está reservado para un dominio propio del cliente (`clubpadel04.example` en el ejemplo de `client-config.schema.json`) — hoy siempre `null` para Club Pádel 04 (no tiene dominio propio en producción); el mecanismo de resolución ya lo contempla sin necesitar cambios el día que exista.

## Aislamiento

Regla dura (ver `TENANT_ISOLATION_CONTRACT.md` §2): un `hostname` resuelve a **como mucho un** tenant. Si el registro tuviera dos tenants con el mismo `domains.primary` o `domains.subdomain` (fixture `fixtures/tenant-config/invalid-duplicate-domain.registry.json`), eso es un error de validación (`validateResolvedConfig`/duplicados de registro), no un caso que `resolveDomainTenant` deba desambiguar en runtime.

## Casos borde de `hostname` (match exacto, sin normalizar)

`resolveDomainTenant` compara `hostname` contra `domains.primary`/`domains.subdomain` con **igualdad de string exacta** — no normaliza, no hace lowercase, no separa puerto ni protocolo. Consecuencias explícitas (cubiertas por test en `src/config/resolveDomainTenant.test.mjs`):

- **Hostname malformado** (espacios, mayúsculas, con `http://`, con `/` final): nunca lanza — resuelve `unknown_domain` como cualquier hostname no reconocido. Fail-closed por construcción, no por un check dedicado.
- **Hostname con puerto** (`club-padel-04.pages.dev:8788`): no matchea el tenant sin puerto. Quien llame en runtime real del navegador (STEP 2 de `RUNTIME_INTEGRATION_SAFE_PLAN.md`) es responsable de pasar `window.location.hostname` (que ya excluye el puerto) y no `window.location.host`.
- **`localhost` / `127.0.0.1`**: no está en ningún `tenant-registry` real ni de ejemplo — resuelve `unknown_domain`. No existe ni existirá un tenant implícito para desarrollo local. El único mecanismo de fallback es explícito y vive en `src/tenant-runtime/resolveRuntimeTenant.js` (`{ fallbackTenantId }`), probado en `resolveRuntimeTenant.test.mjs` con `localhost:5173` → fallback a `cp04`. Sin ese parámetro, `localhost` en local se comporta igual que cualquier dominio desconocido.

## Relación con otros documentos

- `config/tenant-registry.schema.json` — forma del registro que esta función consume.
- `docs/agencia-ia/TENANT_ISOLATION_CONTRACT.md` §2 — regla de aislamiento dominio→tenant.
- `docs/agencia-ia/CLIENT_DEPLOYMENT_LIFECYCLE.md` — de dónde sale el estado `staging` (paralelo a `environment: "staging"` en `deployment-profile.json`).
