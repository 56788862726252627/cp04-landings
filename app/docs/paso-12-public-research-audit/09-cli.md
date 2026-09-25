# 09 — CLI

Todos los comandos viven en `research-cli/` (mismo patrón que
`tenant-cli/`/`factory-cli/`), comparten `research-cli/lib/researchCli.mjs`
(reutiliza `parseCliArgs` de Paso 09), y ninguno hace conexiones reales.

| Comando | Uso |
|---|---|
| `research:plan` | `npm run research:plan -- --demo=<id> \| --request=<ruta.json> [--format=json\|markdown\|summary]` — construye y muestra el Research Plan, sin recolectar evidencia |
| `research:collect` | `npm run research:collect -- --demo=<id> [--local-files-base-dir=<ruta>] [--output=<ruta>]` — solo recolección + deduplicación |
| `research:analyze` | `npm run research:analyze -- --evidence=<evidence.json> --sector=<id>` — solo análisis a partir de evidencia ya recolectada |
| `research:audit` | `npm run research:audit -- --demo=<id> \| --fixture=<id> --business-name=... --sector=<id> [--dry-run] [--force] [--strict]` — pipeline completo, persiste en `research/audits/<auditId>/` |
| `research:report` | `npm run research:report -- --audit=<audit.json> --format=executive\|technical\|commercial\|opportunities\|backlog\|matrix\|automations\|risks\|evidence` — regenera un informe sin recalcular nada |
| `research:compare` | `npm run research:compare -- --before=<audit-v1.json> --after=<audit-v2.json>` — diff entre auditorías |
| `research:doctor` | `npm run research:doctor` — salud del motor (adaptadores/dimensiones/presets/fixtures/puntos de extensión/auditorías generadas/modo offline) |
| `research:enrich-intent` | `npm run research:enrich-intent -- --intent=<intent.json> --audit=<audit.json> [--apply]` |
| `research:enrich-blueprint` | `npm run research:enrich-blueprint -- --blueprint=<blueprint.json> --audit=<audit.json> [--apply]` |
| `business:research` | `npm run business:research -- --business-intent=<intent.json> --fixture=<id> [--online] [--dry-run]` — puente Business Intent (Paso 11) → auditoría |

## Opciones comunes

`--offline` (por defecto en todos), `--dry-run`, `--strict` (bloquea sin
escribir nada si hay contradicciones sin resolver, código de salida `2`),
`--seed`, `--format`, `--output`, `--max-sources`, `--max-depth`,
`--timeout`, `--allow-domain`, `--deny-domain`, `--fixture(s)`,
`--competitor(s)`, `--url(s)`, `--local-file(s)`, `--force`, `--help`
(todos los comandos lo soportan).

## Códigos de salida

`0` éxito · `1` error de validación/política/colisión/argumentos · `2`
bloqueado por `--strict`.

## No interactividad

Ningún comando espera input por stdin; `--answers`-equivalente no aplica
aquí (eso es de Paso 11) — toda la configuración llega por flags o por
`--request=<ruta.json>`.
