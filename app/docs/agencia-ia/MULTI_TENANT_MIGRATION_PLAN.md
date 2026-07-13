# Plan de Migración: de la Capa Aislada a la App Real

> **STALE — superseded por `docs/agencia-ia/RUNTIME_INTEGRATION_SAFE_PLAN.md`.** Este documento (2026-07-09) se escribió antes de que existiera `src/tenant-runtime/` (Provider, 8 funciones de runtime, 52 tests). Su STEP 2 ("Crear un React Context `src/config/ResolvedConfigProvider.jsx`, archivo nuevo") describe un componente que **no se construyó con ese nombre ni en esa ruta** — el Provider real es `src/tenant-runtime/TenantConfigProvider.jsx` + `useTenantConfig()`, ya implementado y probado. Para la secuencia de integración a `App.jsx` vigente, usar `RUNTIME_INTEGRATION_SAFE_PLAN.md` (10 STEPs, referencia directamente los módulos reales de `src/tenant-runtime/`). Se conserva este archivo sin borrar (no se destruye histórico de decisiones) pero no debe seguirse tal cual — en concreto sus STEPS 2-3 quedaron reemplazados por STEP 1-4 del plan vigente. (Nota añadida en la sesión de cierre Client Config + Tenant Config, 2026-07-10.)

Fecha: 2026-07-09 · Plan exacto de integración futura de toda la arquitectura multi-tenant construida en `config/`, `src/config/`, `docs/agencia-ia/*` y `fixtures/tenant-config/`. **Ninguno de estos pasos se ejecuta en esta tarea.** `App.jsx` no se toca. Cada paso solo puede empezar cuando exista autorización explícita y el paso anterior esté verificado (build + tests) en producción o en un entorno equivalente — mismo criterio de gradualidad ya aplicado en "Estrategia de migración gradual" de `ARCHITECTURE_CORE_VS_VERTICAL.md`.

## STEP 1 — Loader aislado

**Ya completado por esta tarea.** `src/config/{loadCoreConfig,loadVerticalConfig,loadClientConfig,loadTenantRegistry}.js` + `mergeConfigLayers.js` + `resolveFeatureFlags.js` + `resolveRoleCapabilities.js` + `resolveTenantContext.js` + `resolveDomainTenant.js` + `validateResolvedConfig.js`. Viven en `src/config/`, no importados por ningún componente de `src/`. Verificable: `node --test src/config/*.test.mjs tests/tenant-config/*.test.mjs` (86 tests, ver `MULTI_TENANT_RESULT` de esta tarea).

## STEP 2 — `resolvedConfig` provider

Crear un React Context (`src/config/ResolvedConfigProvider.jsx`, archivo nuevo) que llame a `mergeConfigLayers()` una vez al montar la app y exponga `resolvedConfig` vía `useResolvedConfig()`. **No sustituye ningún estado existente** — se añade en paralelo, sin que ningún componente lo consuma todavía. Verificación: build limpio (`npm run build`) con el provider montado pero sin consumidores.

## STEP 3 — Theme/branding binding

Conectar `resolvedConfig.theme` a `src/theme.js` a través del mecanismo `resolveTheme(coreTheme, verticalOverride, clientOverride)` ya referenciado en `clients/README.md` §9 (documentado, no implementado como código hoy — este paso lo implementa). Solo cuando `resolvedConfig.theme` sea `null` (todos los clientes hoy, ver `client-config.schema.json#theme`), debe producir exactamente los valores actuales de `theme.js` — regresión cero verificable por captura visual, mismo criterio que las auditorías de UI previas de este proyecto.

## STEP 4 — Resources/business hours binding

Sustituir el import directo de `COURTS_DEFAULT`/`BOOKING_HOURS_DEFAULT` (`src/data/clientConfig.default.js`) en `App.jsx` por `resolvedConfig.courts`/`resolvedConfig.bookingHours`. Requiere que `resolvedConfig` para Club Pádel 04 produzca **exactamente** los mismos valores que `clientConfig.default.js` ya produce (verificable con un test de igualdad estructural antes de tocar `App.jsx`). Es el primer cambio funcional real sobre `App.jsx` de todo este plan — requiere autorización explícita, no se ejecuta por continuidad automática de los pasos anteriores.

## STEP 5 — Feature flags

Envolver secciones de `App.jsx` (Torneos, Ranking, CRM, etc.) con un guard `if (resolvedConfig.features.<x>)`. Antes de este paso, todas las features usadas hoy por Club Pádel 04 deben resolver a `true` (verificable con el mismo test de igualdad de STEP 4, extendido a `features`). Riesgo: alto si se aplica a una sección ya acoplada — seguir el orden ya documentado en `AGENCY_QUICK_WINS_PRIORITY.md` (una sección a la vez, empezando por la de menor acoplamiento).

## STEP 6 — Role capabilities

Conectar `resolveRoleCapabilities(resolvedConfig)` como una capa **adicional** de UI (mostrar/ocultar botones de acción concretos) por encima del RBAC real (`cp04NormalizeRole`), nunca en su lugar. Ver `docs/agencia-ia/ROLE_CAPABILITY_CONTRACT.md` §"Qué NO hace este contrato". Requiere decisión explícita de que el nivel de granularidad actual (feature completo) no es suficiente — no se activa especulativamente.

## STEP 7 — Domain tenant resolution

Cablear `resolveDomainTenant(hostname, registry)` en el punto de entrada de la app (o en el Worker, si el modelo pasa a compartido) solo cuando exista un **segundo dominio real** — hoy con un único dominio (`club-padel-04.pages.dev`) este paso no aporta nada ejecutable, sería resolución de un registro de un solo elemento. Bloqueado hasta STEP 10.

## STEP 8 — Observability tenant context

Conectar `resolveTenantContext(resolvedConfig).observability` como el prefijo de `correlationId` en los emisores de `schemas/observability/log-event.schema.json` (trabajo ya existente en otra terminal, ver memoria del proyecto — coordinar antes de tocar, no duplicar). Bloqueado hasta que exista un segundo tenant real (con un único tenant, el prefijo no aporta valor).

## STEP 9 — Backup tenant context

Conectar `resolveTenantContext(resolvedConfig).backup` al mecanismo de resiliencia/backup ya diseñado en otra terminal (ver memoria del proyecto, fase de resiliencia). Coordinación explícita requerida — este documento no define el mecanismo de backup en sí, solo el campo de identificación que necesitaría.

## STEP 10 — Second-club staging validation

Antes de cualquier cliente real nuevo: tomar el fixture técnico (`fixtures/tenant-config/valid-second-club-fixture.client-config.json`), copiarlo a `clients/<slug-real>/client-config.json` con datos reales (nunca placeholders, ver `clients/README.md` §16), y validar todo el pipeline (`mergeConfigLayers` → `validateResolvedConfig` → `resolveTenantContext` → `resolveRoleCapabilities` → `resolveDomainTenant`) contra un `deployment-profile.json` en `environment: "staging"`. Solo tras `QA_VALID = PASS` en staging (ver `DEPLOYMENT_PROMOTION_GATES.md`) se autoriza avanzar hacia STEP 4-9 para ese segundo cliente.

## Orden de dependencia (resumen)

```
STEP 1 (hecho) → STEP 2 → STEP 3 → STEP 4 → STEP 5 → STEP 6
                                                          │
STEP 10 (requiere STEP 1-2, y un candidato real) ─────────┤
                                                          ▼
                                            STEP 7 (requiere 2º dominio real)
                                            STEP 8 (requiere 2º tenant real, coordinar observabilidad)
                                            STEP 9 (requiere coordinar con resiliencia/backup)
```

Ningún paso de este plan se ejecuta como parte de la tarea que produjo este documento.
