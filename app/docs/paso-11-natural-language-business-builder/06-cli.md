# 06 — CLI del Natural Language Business Builder

Código: `factory-cli/business-{interpret,ask,compose,explain,recommend,from-prompt}.mjs`
+ `factory-cli/lib/nlBuilderCli.mjs` (lógica compartida, reutiliza `parseCliArgs` de
Paso 09). Todos los comandos soportan `--help`.

## `business:interpret`

```
npm run business:interpret -- --prompt="Crea un SaaS para una clínica de fisioterapia de Málaga..."
npm run business:interpret -- --prompt-file=./request.txt --output=./intent.json
npm run business:interpret -- --demo=fisioterapia --seed=demo-001 --format=summary
npm run business:interpret -- --prompt-file=./request.txt --compare=./previous-intent.json
```

Interpreta y produce un Business Intent. `--format` ∈ `json|markdown|summary`.
`--answers=<ruta.json>` resuelve ambigüedades de forma no interactiva. `--seed`
determinista. `--strict`: si hay ambigüedades bloqueantes, código de salida `2` (pero
sigue imprimiendo el análisis completo — nunca oculta información). Nunca escribe en
el repositorio salvo `--output` explícito.

## `business:ask`

```
npm run business:ask -- --intent=./intent.json
```

Muestra las preguntas recomendadas y las ambigüedades bloqueantes de un intent ya
generado. Puramente informativo (no falla, exit 0).

## `business:compose`

```
npm run business:compose -- --intent=./intent.json --output=./blueprint.json
npm run business:compose -- --intent=./intent.json --plan=business --business-id=mi-negocio
```

Compone un Business Blueprint (compatible con `business:create` de Paso 10) a partir
de un intent. `--business-id` fuerza el `businessId`/`tenantId` (evita colisiones
cuando dos peticiones distintas derivarían el mismo nombre por defecto — ver 08).

## `business:explain`

```
npm run business:explain -- --intent=./intent.json
```

Explica, módulo por módulo y supuesto por supuesto, *por qué* se tomó cada decisión —
reexpone las justificaciones que los motores ya calcularon, nunca inventa nada nuevo.

## `business:recommend`

```
npm run business:recommend -- --intent=./intent.json
```

Vista enfocada solo en automatizaciones recomendadas y módulos `suggested`
(mejoras futuras no activadas por defecto).

## `business:from-prompt` — pipeline completo

```
npm run business:from-prompt -- --demo=fisioterapia --seed=demo-001 --dry-run
npm run business:from-prompt -- --demo=fisioterapia --seed=demo-001
npm run business:from-prompt -- --demo=fisioterapia --seed=demo-001 --execute
```

Pipeline: interpretar → componer Blueprint → preview (dry-run del orquestador de
Paso 10) → (según flags) guardar/ejecutar → informe. Tres niveles de escritura:

| Modo | Escribe en `nl-builder/requests/<id>/` | Escribe en `saas-core/businesses/<id>/` |
|---|---|---|
| `--dry-run` | No | No |
| (por defecto) | Sí (intent.json, business.blueprint.json, report.md/json) | No |
| `--execute` | Sí | Sí (vía `runFactoryPipeline` real de Paso 10, idempotente) |

`--strict` con una ambigüedad bloqueante: código de salida `2`, **no escribe nada en
ningún nivel** (ni siquiera el modo por defecto), imprime el análisis completo para que
nada se pierda silenciosamente.

## Convenciones comunes

- `--prompt="texto"` | `--prompt-file=<ruta>` | `--demo=<id>` (uno de los 8 casos de
  `demoRequests.js`, ver 08) para el texto de entrada.
- `--seed=<id>` para determinismo reproducible (por defecto `"default-seed"`).
- `--answers=<ruta.json>` con `{"campo": valor}` para respuestas no interactivas.
- Ningún comando escribe fuera de una ruta explícita del usuario (`--output`) o del
  directorio controlado `nl-builder/requests/`.
- Errores esperados (blueprint/intent inválido, archivo inexistente, JSON corrupto)
  producen un mensaje legible + código de salida `1`, nunca un stack trace crudo.

## Tests

`factory-cli/lib/nlBuilderCli.test.mjs` (17 tests) cubre cada función compartida con
archivos temporales reales (`mkdtemp`/`rm`), incluida la garantía de que
`writeOutputIfRequested` nunca escribe sin `--output` explícito.
