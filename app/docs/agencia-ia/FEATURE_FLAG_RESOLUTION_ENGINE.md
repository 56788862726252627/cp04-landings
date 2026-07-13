# Motor de Resolución de Feature Flags

Fecha: 2026-07-09 · Formaliza como algoritmo ejecutable la jerarquía de flags ya diseñada conceptualmente en `audit/agency-platform-architecture/AGENCY_TENANT_CONFIG_MODEL.md` §2 (carpeta `audit/` ignorada por git, no descubrible desde `docs/` — mismo motivo por el que existe `ARCHITECTURE_CORE_VS_VERTICAL.md`). No repite el catálogo de 23 módulos ni la tabla de dependencias — ya están formalizados como JSON Schema en `config/core-config.schema.json#featureDefaults`/`#featureDependencies`. Este documento describe únicamente el **algoritmo de resolución**, implementado en `src/config/resolveFeatureFlags.js`.

## Los tres niveles

| Nivel de la misión | Fuente real | Capa |
|---|---|---|
| `GLOBAL_DEFAULT` | `core-config.json#featureDefaults` | CORE |
| `VERTICAL_DEFAULT` | `vertical-config.<id>.json#featureOverrides` (parcial, solo las keys que ese vertical cambia) | VERTICAL |
| `CLIENT_OVERRIDE` | `client-config.json#features` (parcial, solo las keys que ese cliente cambia) | CLIENT |

## Algoritmo (`resolveFeatureFlags(core, vertical, client)`)

```
para cada feature en core.featureDefaults:
    valor = core.featureDefaults[feature]                         # GLOBAL_DEFAULT
    si vertical.featureOverrides define feature: valor = ese valor # VERTICAL_DEFAULT
    si client.features define feature: valor = ese valor           # CLIENT_OVERRIDE

repetir hasta punto fijo (sin cambios en una pasada completa):
    para cada (feature, dependencias) en core.featureDependencies:
        si feature está ON y alguna dependencia está OFF:
            feature = OFF
            registrar en `degraded`
```

El punto fijo es necesario porque hay dependencias encadenables (p. ej. si `reservas` se degradara por una futura dependencia propia, `cancelaciones`/`reprogramaciones`/`noShow`/`listaEspera`, que dependen de `reservas`, deben degradarse en la misma resolución, no en la siguiente). Con el catálogo actual de `core-config.schema.json` no hay cadenas de más de un nivel, pero el algoritmo no asume esa limitación.

## Salida

`{ features: Record<string, boolean>, degraded: Array<{feature, missingDependencies}> }` — `degraded` es evidencia para QA/onboarding de qué se apagó automáticamente y por qué, nunca un error silencioso.

## Fail-closed

- Una `feature` ausente de los tres niveles no puede ocurrir: `core.featureDefaults` es `required` con las 23 keys cerradas en el schema, así que siempre hay un `GLOBAL_DEFAULT`.
- `pagos`, `ia`, `whatsapp` llegan aquí ya en `false` por el `const: false` de los tres schemas (core/vertical/client) — el motor no necesita lógica especial para ellos, pero `mergeConfigLayers.js` los revalida como defensa en profundidad (ver "campos protegidos").

## Relación con `mergeConfigLayers`

`resolveFeatureFlags` es una función pura e independiente (testable sin el resto del resolved config); `src/config/mergeConfigLayers.js` la invoca internamente para construir el campo `features` del resolved config, y aplica la validación de campos protegidos sobre su resultado.
