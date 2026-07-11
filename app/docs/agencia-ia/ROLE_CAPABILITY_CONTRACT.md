# Contrato de Role Capabilities (para integración futura)

Fecha: 2026-07-09 · Define un catálogo cerrado de capabilities en notación `dominio.accion`, pensado para una futura capa de autorización más fina que "ver/gestionar por feature" (`core-config.schema.json#roleCapabilities`, ya existente). **No sustituye ni modifica el RBAC real** (`src/utils/rbac.js`, `cp04NormalizeRole`, `CP04_ROLE_PERMISSIONS`) — es un contrato de diseño para cuando (si) se decida construir autorización a nivel de acción, no de sección completa. Hoy no está cableado a ningún sitio.

## Por qué un segundo contrato y no solo `core-config.schema.json#roleCapabilities`

`core-config.schema.json#roleCapabilities` ya resuelve un problema real: qué mostrar/ocultar en la UI por rol, a nivel de **feature completo** (`{feature: "reservas", actions: ["view","manage"]}`). No resuelve una pregunta más fina que puede hacer falta más adelante: *dentro* de `reservas`, ¿puede este rol reprogramar o solo cancelar? Ese nivel de detalle no tiene representación hoy porque no hace falta todavía (el RBAC actual no lo necesita) — este documento deja preparado el vocabulario para el día que sí haga falta, sin construir la autorización en sí.

## Catálogo de capabilities

| Capability | Feature requerido (`resolvedConfig.features`) | Roles elegibles (subconjunto de `resolvedConfig.roles`) |
|---|---|---|
| `reservation.create` | `reservas` | PLAYER, STAFF, ADMIN |
| `reservation.cancel` | `cancelaciones` | PLAYER, STAFF, ADMIN |
| `reservation.reschedule` | `reprogramaciones` | PLAYER, STAFF, ADMIN |
| `player.create` | — (capability CORE, no depende de ningún feature del catálogo) | STAFF, ADMIN |
| `player.manage` | — (capability CORE) | STAFF, ADMIN |
| `tournament.manage` | `torneos` | STAFF, ADMIN |
| `ranking.manage` | `ranking` | STAFF, ADMIN |
| `support.view_health` | `soporte` | SUPPORT |
| `admin.manage_config` | — (capability CORE) | ADMIN |

`player.*` y `admin.manage_config` no requieren feature porque son capacidades de plataforma (gestión de usuarios, gestión de configuración) que existen independientemente de qué módulos de negocio estén activos — mismo criterio que `soporte`/Centro Técnico ya aplicado en el código real (siempre visible para SUPPORT, sin depender de un flag de negocio).

## Algoritmo de resolución (`resolveRoleCapabilities(resolvedConfig)`)

```
para cada rol en resolvedConfig.roles:
    capabilities(rol) = [
        capability.id
        para cada capability en CATALOGO
        si rol está en capability.roles
        y (capability.feature es null O resolvedConfig.features[capability.feature] === true)
    ]
```

Fail-closed: un rol no incluido en `resolvedConfig.roles` (porque el cliente no lo activó) nunca aparece en el resultado, aunque el catálogo lo contemple — mismo principio que el resto de esta arquitectura (ausencia de dato nunca se traduce en privilegio).

## Qué NO hace este contrato

- No autoriza nada en runtime — no hay ningún middleware, hook ni componente que lo consulte todavía.
- No reemplaza `cp04NormalizeRole`/`CP04_ROLE_PERMISSIONS` — si algún día se conecta, sería como una capa adicional de granularidad *sobre* el RBAC existente, nunca en su lugar.
- No inventa capabilities para features que no están en el catálogo cerrado de `core-config.schema.json#featureDefaults` — cada capability con `feature` no nulo referencia una key real de ese catálogo.

## Relación con otros documentos

- `config/core-config.schema.json#roleCapabilities` — contrato existente de "ver/gestionar por feature", nivel UI. No se toca.
- `docs/agencia-ia/FEATURE_FLAG_RESOLUTION_ENGINE.md` — el campo `features` que este contrato consulta viene de ahí.
- `src/config/resolveRoleCapabilities.js` — implementación.
