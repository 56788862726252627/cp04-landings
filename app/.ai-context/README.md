# Context Hub · cp04-landings/app

Capa persistente de contexto operativo compartido entre herramientas
(ChatGPT, Claude Code/Terminal, Claude Desktop/Web, y cualquier otro agente
que trabaje sobre este directorio).

**Directorio base autorizado:** `/root/cp04-landings/app`

Este Context Hub NO sustituye a la memoria informal de ningún chat, y NO
almacena transcripciones completas. Almacena únicamente el **estado
operativo estructurado** de los proyectos que viven en este repositorio:
qué se hizo, quién/qué herramienta lo hizo, qué evidencia hay, qué falta y
cuál es el siguiente paso.

## Qué NO se guarda aquí (nunca)

- passwords
- API keys
- Authorization headers
- cookies
- access tokens / refresh tokens
- webhook URLs completas
- secretos de Cloudflare
- secretos de Supabase
- secretos de Make
- secretos de Airtable

Si una nota necesita referenciar una integración, se referencia por **nombre**
("Worker de Reservas", "tabla Airtable de socios"), nunca por URL completa,
token o cabecera. Un enlace se incluye solo si es público y no revela
infraestructura sensible.

## Estructura

```
.ai-context/
  README.md              — este archivo: qué es y cómo se usa
  CURRENT_STATE.md        — foto del estado actual, global, por proyecto
  DECISIONS.md            — decisiones relevantes con fecha y motivo
  TOOL_REGISTRY.md        — qué herramientas/integraciones existen y su estado real
  PROJECTS/
    club-padel-04.md      — estado del producto Club Pádel 04
    agencia-ia.md         — estado de la Fábrica Agencia IA (factory-cli, saas-core)
    bot-trading.md        — estado del Bot de Trading (vertical futura)
  SESSIONS/
    YYYYMMDD-herramienta-resumen.md — un resumen por sesión de trabajo material
  templates/
    session-summary.md    — plantilla para nuevas entradas de SESSIONS/
```

## Cómo debe usarse (todas las herramientas)

1. **Antes de pedir al usuario que repita información**, leer
   `CURRENT_STATE.md` y el archivo correspondiente en `PROJECTS/`.
2. **Al terminar una tarea material** (código, documentación, decisión,
   bloqueo), añadir una entrada en `SESSIONS/` con la plantilla de
   `templates/session-summary.md`, y actualizar `CURRENT_STATE.md` y, si
   aplica, `DECISIONS.md`.
3. **No duplicar trabajo** que ya conste como terminado en este hub sin
   verificar primero si sigue vigente.
4. **Distinguir siempre** el nivel de certeza de cada afirmación:
   - `VERIFICADO DIRECTAMENTE` — se comprobó en esta misma sesión (comando,
     lectura de archivo, test ejecutado).
   - `EVIDENCIA PREVIA` — consta en este hub o en el repo de una sesión
     anterior, pero no se ha vuelto a comprobar ahora.
   - `NO VERIFICABLE DESDE ESTA HERRAMIENTA` — depende de un sistema externo
     (Supabase, Airtable, Make, Cloudflare, Miro, GitHub Actions...) al que
     esta sesión no tiene acceso directo.
5. **Si falta una integración, plugin, cuenta o permiso**, no simular que
   existe: detener solo esa parte y explicar (1) qué falta, (2) por qué se
   necesita, (3) qué permiso concreto requiere, (4) cómo habilitarla, (5) qué
   se podrá hacer después de habilitarla.
6. **Nunca afirmar que se consultó una fuente externa** si no hubo acceso
   real a ella en esta sesión.
7. **Nunca guardar secretos** aquí, bajo ninguna circunstancia.

## Premisa fundamental · contexto compartido multi-agente

> Antes de pedir al usuario que repita información, cada agente debe
> consultar las fuentes compartidas disponibles del proyecto.
>
> Todo trabajo relevante realizado mediante:
> - terminal
> - Claude Code
> - Claude Desktop
> - Claude Web
> - ChatGPT
> - Miro
> - GitHub
> - Airtable
> - Supabase
> - Cloudflare
> - Make
> - u otras herramientas
>
> debe poder quedar resumido en el Context Hub.
>
> Registrar únicamente:
> - fecha
> - proyecto
> - herramienta/agente
> - objetivo
> - acciones relevantes
> - archivos modificados
> - tests
> - resultados
> - commits
> - deployments
> - decisiones
> - bloqueadores
> - enlaces no sensibles
> - estado antes/después
> - siguiente paso
>
> **NUNCA almacenar secretos.**
>
> Si una tarea necesita un plugin, conector, cuenta o permiso que no esté
> disponible, el agente debe detener únicamente esa parte e informar
> explícitamente al usuario:
> 1. qué integración falta;
> 2. por qué es necesaria;
> 3. qué permiso necesita;
> 4. cómo habilitarla;
> 5. qué podrá hacerse después.
>
> No afirmar nunca que una fuente externa ha sido consultada si no existe
> acceso real a ella.

## Relación con la skill "Fábrica Agencia IA"

La skill de usuario `fabrica-agencia-ia`
(`/root/.claude/skills/fabrica-agencia-ia/SKILL.md`) referencia este Context
Hub como comportamiento permanente: leerlo al continuar un proyecto
existente, actualizarlo al cerrar una tarea material, y seguir la misma
premisa fundamental de arriba. Ver esa skill para el detalle del proceso de
construcción de la fábrica (CORE/VERTICAL/CLIENTE, gates verificables, etc.).

## Origen de este hub

Creado el 2026-08-26 a partir de evidencia local disponible en esta sesión
(git log, estructura de directorios, memoria persistente del asistente en
`/root/.claude/projects/-root-cp04-landings/memory/`). No incorpora
transcripciones de chats externos ni información que solo conste en la
memoria del usuario: lo que no pudo verificarse localmente se marca como
`PENDIENTE DE SINCRONIZAR`.
