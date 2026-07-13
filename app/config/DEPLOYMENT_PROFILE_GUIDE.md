# Guía de `deployment-profile.schema.json`

Fecha: 2026-07-08 · Complementa `config/CLIENT_CONFIG_SCHEMA_GUIDE.md`. Mismo criterio de validación (sin `ajv`, sin dependencias nuevas).

## Relación con `client-config.schema.json`

Son dos documentos distintos con propósitos distintos, que **no deben divergir en la fuente de verdad de cada dato**:

| Dato | Fuente de verdad | Documento |
|---|---|---|
| Qué es el cliente (branding, recursos, features, integraciones habilitadas) | `client-config.json` | `config/client-config.schema.json` |
| En qué estado está el despliegue de ese cliente en un entorno concreto | `deployment-profile.json` | `config/deployment-profile.schema.json` (este) |

`deployment-profile.json` **referencia** a `client-config.json` (`configRef`, `brandingRef`, `integrationsRef`, `featureFlagsRef`) — nunca copia su contenido. Si algo parece contradictorio entre ambos, `client-config.json` gana para "qué es el cliente" y `deployment-profile.json` gana para "en qué estado está".

## Cómo se validó (mismo método que Quick Win 2, sin instalar nada)

1. Sintaxis JSON: `node -e "JSON.parse(...)"` sobre schema + 2 ejemplos + el ejemplo embebido — los 4, válidos.
2. Validación estructural: se extendió el validador mínimo de Quick Win 2 (vive en el scratchpad de la sesión, no en el repo) para soportar `$ref` (a `$defs`), `allOf` e `if/then` — necesarios porque este schema, a diferencia del anterior, incluye una regla condicional real.
   - `deployment-profile.example.valid.json` (entorno `staging`) → **VÁLIDO**.
   - `deployment-profile.example.invalid.json` (entorno `production` con QA pendiente) → **INVÁLIDO**, 14 violaciones.
   - Ejemplo `DRAFT` embebido en el propio schema (`examples[0]`) → **VÁLIDO**.

**Misma limitación honesta que antes**: no se implementó `format` (fechas/URIs) como aserción real, solo como anotación — las fechas se validan aquí por `pattern` (regex), que sí es una restricción real y verificada.

## La regla dura: sin salto directo `development` → `production`

Implementada como restricción **validable**, no solo como texto:

```json
"if": { "properties": { "environment": { "const": "production" } } },
"then": {
  "properties": {
    "qaStatus": { "const": "PASS" },
    "deploymentStatus": { "enum": ["PRODUCTION_READY","DEPLOYED","VERIFIED","ACTIVE","SUSPENDED"] }
  },
  "required": ["qaStatus","deploymentStatus"]
}
```

Cualquier `deployment-profile.json` con `environment: "production"` y `qaStatus` distinto de `"PASS"` **falla la validación** — no es una convención que alguien pueda saltarse por error humano sin que el schema lo rechace. Demostrado con `deployment-profile.example.invalid.json`.

## Por qué `gates` tiene 8 claves fijas y todas requeridas

Un `deployment-profile.json` que "olvida" declarar un gate (p.ej. no menciona `SECURITY_VALID` en absoluto) es indistinguible de uno que lo declaró y lo dejó en `PENDING` si no se fuerza su presencia. Al ser `required` los 8, todo perfil de despliegue debe declarar explícitamente el estado de los 8 gates desde el primer día (aunque sea `PENDING`) — fail-closed: ausencia de dato nunca se interpreta como "gate superado".

## Qué NO hace este Quick Win

No crea ningún segundo cliente real, no despliega nada, no toca Cloudflare/Worker/Make/Airtable reales, no inventa dominios/versiones/cuentas/tokens. `workerProfile` y `domainRef` son deliberadamente `null` o nombres de referencia en los ejemplos — nunca un valor real inventado.
