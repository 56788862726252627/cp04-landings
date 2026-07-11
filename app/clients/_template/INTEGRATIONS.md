# INTEGRATIONS — `<slug-cliente>`

Plantilla. Documenta solo integraciones que existan de verdad en el código de la plataforma. No inventar proveedores.

## Estado por integración

| Integración | Proveedor (único válido hoy) | `enabled` | Referencia de secret | Notas |
|---|---|---|---|---|
| Automatización | `make` | `false` hasta alta real | `<NOMBRE_SECRET_WEBHOOK>` (nunca el valor) | Coordinar con el equipo que gestiona Make (fuera del alcance de esta plantilla) |
| Datos | `airtable` | `false` hasta alta real | `<NOMBRE_SECRET_BASE_ID>` (nunca el valor) | Una base Airtable por cliente (Modelo A/C) |
| Pagos | `none` | `false` (bloqueado por schema, `const: false`) | — | Stripe no está activo en la plataforma por regla de proyecto vigente |
| Mensajería | `none` | `false` (bloqueado por schema, `const: false`) | — | WhatsApp no está activo en la plataforma |
| IA | `none` | `false` (bloqueado por schema, `const: false`) | — | Sin proveedor de IA integrado en el código actual |

## Regla de esta tabla

Cada fila debe coincidir exactamente con el bloque `integrations.*` correspondiente de `client-config.json` de este cliente. Si no coinciden, el `client-config.json` es la fuente de verdad y esta tabla está desactualizada — corregir la tabla, nunca al revés.

## Qué NO hacer aquí

- No marcar `enabled: true` en pagos/mensajería/IA "porque el cliente lo va a necesitar pronto" — el schema lo bloquea intencionadamente (`const: false`) hasta que exista una decisión de arquitectura, no de configuración de cliente.
- No escribir el valor real de ningún webhook/token/base ID en este documento ni en `client-config.json` — solo el nombre de la referencia.
- No dar de alta Airtable/Make reales desde este documento — es responsabilidad del equipo que gestiona esas integraciones, coordinada aparte.
