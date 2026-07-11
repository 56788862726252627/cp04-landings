# Runtime Integration Safe Plan — Multi-tenant runtime (Fase 10)

Continúa la arquitectura multi-tenant técnica ya cerrada (86/86 tests, ver `ARCHITECTURE_CORE_VS_VERTICAL.md`, `TENANT_ISOLATION_CONTRACT.md`, `DOMAIN_TENANT_RESOLUTION.md`, `FEATURE_FLAG_RESOLUTION_ENGINE.md`, `ROLE_CAPABILITY_CONTRACT.md`, `DEPLOYMENT_PROMOTION_GATES.md`, `CLIENT_ROLLBACK_CONTRACT.md`, `CLIENT_DEPLOYMENT_LIFECYCLE.md`, `MULTI_TENANT_MIGRATION_PLAN.md`). Esta fase añadió la capa de **runtime** en `src/tenant-runtime/` (8 funciones + `TenantConfigProvider`), aislada y **no integrada en `App.jsx`**. Este documento es el plan exacto para integrarla después, cuando T4 termine su trabajo actual en el frontend.

## Qué se entregó en esta fase (referencia rápida)

| Módulo | Rol |
|---|---|
| `src/tenant-runtime/resolveRuntimeTenant.js` | Envuelve `resolveDomainTenant()` + fallback tenant explícito opcional |
| `src/tenant-runtime/loadResolvedRuntimeConfig.js` | Encadena `loadCoreConfig→loadVerticalConfig→loadClientConfig→mergeConfigLayers→validateResolvedConfig` |
| `src/tenant-runtime/createTenantRuntimeContext.js` | Extiende `resolveTenantContext()` con `maintenanceMode`/`disabled`/`deploymentState` |
| `src/tenant-runtime/getRuntimeFeatureFlags.js` | Accessor sobre la cascada ya resuelta + reexporta `resolveFeatureFlags` para cascadas hipotéticas |
| `src/tenant-runtime/getRuntimeRoleCapabilities.js` | Accessor sobre `resolveRoleCapabilities()` — **no sustituye RBAC ni el Role Gate** |
| `src/tenant-runtime/getRuntimeBranding.js` | Contrato de binding de marca (logo/acentos/contacto/locale/tz) |
| `src/tenant-runtime/getRuntimeResources.js` | Contrato de recursos (courts/rooms/services/durations/reglas/límites) |
| `src/tenant-runtime/getRuntimeBusinessHours.js` | Accessor dedicado de horario |
| `src/tenant-runtime/buildTenantRuntimeContextValue.js` | Función pura que compone todo lo anterior en el valor del Provider (100% testeable sin React) |
| `src/tenant-runtime/TenantConfigProvider.jsx` | Wrapper delgado de React sobre la función pura — **no importado desde ningún punto de la app real** |

52 tests nuevos (`src/tenant-runtime/*.test.mjs`), suite completa del repo en 1121/1121 tras añadirlos — cero regresiones.

## Por qué no se integró ya (bloqueo intencional, no técnico)

`App.jsx` está siendo trabajado activamente por T4 Frontend. Importar `TenantConfigProvider` ahí hoy crearía conflictos de merge innecesarios sobre un archivo que otra terminal está editando. La arquitectura de runtime está completa y probada de forma aislada; la integración es un cambio de una sola línea (envolver el árbol con el Provider) que se puede aplicar en minutos una vez T4 confirme que terminó.

## Los 10 pasos exactos, en orden

1. **STEP 1 — Provider mount.** Confirmar con T4 que `App.jsx` está libre. Envolver el árbol raíz (`main.jsx` o el nivel más alto de `App.jsx`, el que tenga menos probabilidad de conflicto de merge) con `<TenantConfigProvider resolvedConfig={...} tenantStatus={...}>`. En este paso `resolvedConfig`/`tenantStatus` pueden ser el resultado ya hardcodeado de `loadResolvedRuntimeConfig({ clientSource: "config/client-config.example.valid.json" })` — no depende todavía de resolución de dominio en runtime real del navegador.
2. **STEP 2 — Tenant resolution.** Sustituir el `resolvedConfig`/`tenantStatus` hardcodeados del STEP 1 por la salida real de `resolveRuntimeTenant(window.location.hostname, registry)` + `loadResolvedRuntimeConfig(...)`. Aquí es donde se decide cómo se sirve `config/tenant-registry.example.valid.json` (u otro registry) al bundle de cliente — probablemente como JSON estático importado en build time, dado que los loaders actuales usan `node:fs` y no corren en el navegador tal cual.
3. **STEP 3 — Branding binding.** Sustituir las constantes de marca ya hardcodeadas en el frontend actual (nombre, colores de `src/theme.js`, contacto) por `useTenantConfig().branding`, campo a campo, verificando visualmente que Club Pádel 04 se ve idéntico a hoy (mismo `accent`/`accent2` ya usados).
4. **STEP 4 — Resources binding.** Sustituir `COURTS_DEFAULT`/`BOOKING_HOURS_DEFAULT`/`BOOKING_MODALITIES_DEFAULT`/`BOOKING_LEVELS_DEFAULT` (`src/data/clientConfig.default.js`) por `useTenantConfig().resources`/`useTenantConfig().businessHours`, confirmando que `evaluateSlotAvailability` sigue recibiendo exactamente la misma forma de datos que hoy.
5. **STEP 5 — Feature flags.** Sustituir cualquier flag de feature hardcodeado en la UI (p. ej. mostrar/ocultar Torneos/Ranking) por `useTenantConfig().featureFlags`.
6. **STEP 6 — Capabilities.** Sustituir cualquier `if (role === "ADMIN")` disperso en la UI por `runtimeHasCapability(resolvedConfig, role, "admin.manage_config")` (o el `roleCapabilities` ya resuelto del Provider) **solo para decisiones de UI** (mostrar/ocultar). No tocar ninguna comprobación de autorización real — esas siguen en el Worker.
7. **STEP 7 — Observability context.** Sustituir el `tenant_id` que hoy pueda estar hardcodeado (o ausente) en las llamadas a `scripts/observability/tenant-context.mjs`/`buildRequestLogEvent` por `useTenantConfig().observability`/`.tenantId`, sin tocar ningún otro campo del log-event ya cerrado.
8. **STEP 8 — Backup context.** Igual que STEP 7 pero para el namespace de backup (`useTenantConfig().backup`), en el punto donde el sistema de resiliencia/backup ya preparado (fase T8) necesite un namespace por tenant en vez de uno fijo.
9. **STEP 9 — Second-tenant staging fixture.** Repetir STEPS 2-8 apuntando a `fixtures/tenant-config/valid-second-club-fixture.client-config.json` (tenant `fixture-club-02`, status `staging` en el registry) en un entorno de staging real — **nunca en producción, nunca con datos de un cliente real** — para confirmar que el mismo código sirve a un segundo tenant sin cambios, cerrando el ciclo de replicabilidad.
10. **STEP 10 — QA.** Checklist mínimo antes de dar por cerrada la integración:
    - Club Pádel 04 (tenant real, status `active`) se ve y funciona idéntico a antes de la integración (branding, recursos, horario, features, capabilities).
    - El tenant `staging` (STEP 9) resuelve datos propios, sin ninguna fuga del tenant `active` (ver `src/tenant-runtime/tenantIsolation.test.mjs` como referencia de qué comprobar manualmente).
    - Un dominio no registrado (`unknown_domain`) no rompe la app — decidir explícitamente en este QA si debe mostrar una pantalla de "tenant no encontrado" o usar un fallback explícito (`resolveRuntimeTenant(..., { fallbackTenantId })`) — nunca un fallback implícito.
    - Un tenant `maintenance`/`disabled` (usar los fixtures ya existentes en `config/tenant-registry.example.valid.json`) muestra el estado correspondiente en la UI, sin exponer el resto de la app.
    - RBAC/Role Gate del Worker siguen comportándose exactamente igual que antes de esta integración — el Provider no debe haber tocado `worker-reservas/` en ningún STEP.
    - Suite completa del repo en verde tras la integración.

## Explícitamente fuera de alcance de esta fase y del plan

Auth, Worker, Make, Airtable, Stripe, WhatsApp, y cualquier módulo de Observabilidad ya cerrado (solo se referencian sus contratos existentes, no se modifican). No se hizo push, ni merge, ni deploy. `App.jsx` no fue tocado.
