# Registro de herramientas e integraciones · cp04-landings/app

Qué herramientas/integraciones existen alrededor de este proyecto y qué
estado real tienen. **Nunca incluir aquí URLs completas de webhook, tokens,
claves ni cabeceras de autorización** — solo el nombre de la integración, su
propósito y su estado.

Certeza de cada fila: ver columna "Certeza".

## Agentes / herramientas de trabajo

| Herramienta | Rol en el proyecto | Acceso desde esta sesión | Certeza |
|---|---|---|---|
| Claude Code (Terminal) | Desarrollo, refactor, documentación, gestión de este Context Hub | Sí (esta sesión) | VERIFICADO DIRECTAMENTE |
| Claude Desktop / Web | Uso del usuario fuera de esta terminal | No | NO VERIFICABLE DESDE ESTA HERRAMIENTA |
| ChatGPT | Uso del usuario fuera de esta terminal | No | NO VERIFICABLE DESDE ESTA HERRAMIENTA |
| Miro | Destino previsto de la vista "Miro-ready" del BPMN Maestro | No hay conector activo en esta sesión | NO VERIFICABLE DESDE ESTA HERRAMIENTA |
| GitHub (`gh` CLI) | PRs, issues, checks del repo `cp04-landings` | Disponible como herramienta de shell en esta sesión, no usado en esta tarea | VERIFICADO DIRECTAMENTE (disponibilidad de la herramienta, no de una consulta concreta) |

## Integraciones de producto (referenciadas en código/documentación local)

| Integración | Propósito | Estado según código/docs local | Certeza |
|---|---|---|---|
| Airtable | Fuente de datos de reservas/socios de Club Pádel 04 | Adaptador real implementado (`airtableAdapter.js`); recientes fixes de reintento ante 429 | EVIDENCIA PREVIA + `git log` (VERIFICADO DIRECTAMENTE que el commit existe, no que el adaptador funciona en producción hoy) |
| Make | Automatizaciones (reservas, QR, calendario) | En uso; regla vigente de "conservar Make hasta que una migración tenga plan, pruebas y reversión" | EVIDENCIA PREVIA |
| Cloudflare Workers | Backend de auth/reservas (`worker-reservas/`), despliegue de la app | En uso; commits recientes de CSP y CORS sobre el Worker | EVIDENCIA PREVIA + VERIFICADO DIRECTAMENTE (commits existen) |
| Supabase | Persistencia (comunidad, multi-tenant, sesiones) | Adaptador y capa runtime documentados en memoria del asistente; bloqueado en el pasado por falta de proyecto Supabase DEV/TEST | EVIDENCIA PREVIA |
| Google Drive (OAuth) | Entregables/backups de la fábrica | OAuth real completado según memoria del asistente; credenciales viven en `app/.secrets/` (ignorado por git) | EVIDENCIA PREVIA — **no se ha leído ni se leerá el contenido de `.secrets/`** |
| Stripe | Cobros | Adaptador aislado, sandbox; no confirmado como producción real | EVIDENCIA PREVIA |
| WhatsApp Business | Mensajería | Adaptador aislado; entorno marcado `NOT_CONFIGURED` en auditorías previas | EVIDENCIA PREVIA |

## Directorios relevantes fuera de `.ai-context/` (mapa, no contenido)

| Ruta | Qué es | Certeza |
|---|---|---|
| `factory-cli/` | CLI de la fábrica (`business:*`, `agency:*`) | VERIFICADO DIRECTAMENTE (listado de archivos) |
| `src/saas-core/` | Núcleo SaaS: `adapters`, `commercial`, `deliverables`, `factory`, `security`, `templates`, `tenant(s)`, etc. | VERIFICADO DIRECTAMENTE (listado de directorios) |
| `worker-reservas/` | Worker de Cloudflare para reservas/auth de Club Pádel 04 | VERIFICADO DIRECTAMENTE (aparece en `git log` reciente) |
| `docs/` | Documentación histórica por hito (`paso-NN-...`, auditorías, cierres) | VERIFICADO DIRECTAMENTE (listado de directorios) |

## Fuera del directorio autorizado (detectado, no gestionado desde este hub)

| Ruta | Nota |
|---|---|
| `../herramientas-agencia-ia/` | Clones de terceros (`n8n`, `langgraph`, `openai-agents-python`, `anthropic-skills`) junto al proyecto, un nivel por encima de `app/`. Fuera del directorio base autorizado (`/root/cp04-landings/app`); no se ha tocado ni auditado su contenido. |
| `../.claude/` | Configuración local (`settings.local.json`) a nivel de `cp04-landings/`, distinta del `.ai-context/` de este proyecto. |

## Integraciones que faltan para completar el Context Hub multi-agente

- **Miro**: no hay conector/API configurado desde esta sesión para escribir
  directamente en un board. Por qué se necesita: para que la "Vista
  Miro-ready" del BPMN Maestro se sincronice automáticamente en vez de
  copiarse a mano. Permiso necesario: token de API de Miro con acceso al
  board de destino. Cómo habilitarlo: crear una app en
  miro.com/app/settings/user-profile y compartir el token de forma segura
  (nunca pegarlo en este hub). Qué se podrá hacer después: exportar/actualizar
  el board desde la tabla Miro-ready sin copiar/pegar manual.
- **ChatGPT ↔ este repositorio**: no hay forma automática de que ChatGPT lea
  este Context Hub salvo que el usuario le pegue o suba estos archivos. Por
  qué: ChatGPT no tiene acceso de archivos a esta máquina desde aquí. Cómo
  habilitarlo: subir manualmente los `.md` de `.ai-context/` a esa
  conversación, o exponerlos vía un conector que el usuario configure. Qué
  se podrá hacer después: que ChatGPT parta del mismo estado que Claude Code.
