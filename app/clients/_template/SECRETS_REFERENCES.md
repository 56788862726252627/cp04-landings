# SECRETS REFERENCES — `<slug-cliente>`

Este documento **nunca** contiene un valor de secreto. Solo nombres de referencia. Mismo principio ya aplicado en `worker-reservas/wrangler.toml` (comentario `# Secrets: MAKE_RESERVAS_WEBHOOK / AIRTABLE_TOKEN`) y en `config/client-config.schema.json` (`webhookRef`/`baseIdRef`).

## Referencias de este cliente

| Secret (nombre, no valor) | Dónde se gestiona | Campo de `client-config.json` que lo referencia | Estado |
|---|---|---|---|
| `<NOMBRE_SECRET_WEBHOOK_MAKE>` | Wrangler secret del Worker de este cliente | `integrations.automation.webhookRef` | `<pendiente / dado de alta>` |
| `<NOMBRE_SECRET_AIRTABLE_TOKEN>` | Wrangler secret del Worker de este cliente | (no modelado como `*Ref` directo en el schema v1 — el token de Airtable no tiene campo propio, solo `baseIdRef`; documentar aquí la convención de nombre real usada) | `<pendiente / dado de alta>` |
| `<NOMBRE_SECRET_AIRTABLE_BASE_ID>` | Wrangler secret o `[vars]` del Worker (no es secreto en sí en el patrón actual — ver nota) | `integrations.data.baseIdRef` | `<pendiente / dado de alta>` |

**Nota sobre `AIRTABLE_BASE_ID`**: en el Worker actual (`worker-reservas/wrangler.toml`) el Base ID de Airtable se gestiona como `[vars]` (no secreto), no como Wrangler secret — es un identificador, no una credencial. Mantener esa misma clasificación por cliente salvo que se decida lo contrario explícitamente.

## Procedimiento (manual, nunca por script)

1. La persona responsable ejecuta `wrangler secret put <NOMBRE> --env <slug-cliente>` pegando el valor directamente desde el gestor de contraseñas.
2. Se anota aquí el **nombre** usado (no el valor) y la fecha de alta.
3. Nunca se pega un valor de secreto en este archivo, en `client-config.json`, en un commit, ni en un log.

## Qué NO hacer aquí

- No poner el valor real de ningún token/webhook/clave, ni siquiera "temporalmente".
- No reutilizar el mismo secret de otro cliente — cada cliente tiene su propio juego de secrets (ver `AGENCY_SECURITY_MODEL.md`, control "Secrets por cliente a escala", P1).
- No automatizar la escritura de secrets sin revisión humana (mismo principio ya establecido en `AGENCY_DEPLOYMENT_TEMPLATE.md`).
