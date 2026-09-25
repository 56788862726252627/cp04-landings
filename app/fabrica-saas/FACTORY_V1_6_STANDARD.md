# FACTORY_V1_6_STANDARD — AI Cost & Design Optimization

## Versión

`FACTORY_V1_6_AI_COST_AND_DESIGN_OPTIMIZATION`  
Implementado: 2026-08-29  
Branch: `feature/factory-v1.6-ai-cost-design`

## Objetivo

Evolucionar la Fábrica SaaS V1.5 hacia una arquitectura más barata, más eficiente en contexto/tokens, más autónoma y con un sistema visual premium multisector.

## Cambios respecto a V1.5

### Nuevas herramientas integradas

| Herramienta     | Versión   | Rol en la fábrica                      |
|-----------------|-----------|----------------------------------------|
| OpenCode        | 1.18.25   | Agente local para tareas TIER 1–2      |
| Ollama          | 0.33.2    | Runtime de modelo local                |
| qwen2.5-coder   | 1.5b      | Modelo de código local (986 MB, ARM64) |
| Repomix (npx)   | 1.18.0    | Generación de contexto comprimido      |
| shadcn/ui       | 4.19.0    | API de componentes (sin Tailwind)      |

### Nuevos archivos creados

| Archivo                                            | Descripción                                |
|----------------------------------------------------|--------------------------------------------|
| `core/aiRouter.js`                                 | Router de coste: classifyTask(), TIER 1–4  |
| `core/mediaEngine.js`                              | Placeholders, media resolver, favicon gen  |
| `core/ui/tokens.js`                                | CSS vars shadcn-compatibles                |
| `core/ui/components.jsx`                           | 20+ componentes shadcn API (sin Tailwind)  |
| `core/ui/index.js`                                 | Re-export único                            |
| `.ai/context/repomix.config.json`                  | Config Repomix base                        |
| `.ai/context/presets/factory-core.json`            | Perfil: core                               |
| `.ai/context/presets/generator.json`               | Perfil: generator                          |
| `.ai/context/presets/client-current.json`          | Perfil: client                             |
| `.ai/context/presets/design-system.json`           | Perfil: design-system                      |
| `.ai/context/presets/tests.json`                   | Perfil: tests                              |
| `.ai/context/presets/architecture.json`            | Perfil: architecture                       |
| `.ai/context/scripts/gen-context.mjs`              | Script generador de contextos              |
| `.ai/context/README.md`                            | Guía de uso del context engine             |
| `.ai/opencode/config.json`                         | Config OpenCode para factory scope         |
| `.ai/opencode/POLICY.md`                           | Política de uso de OpenCode en factory     |
| `generator/schema/v1.6Schema.js`                   | Schema manifest V1.6 + validador           |
| `generator/tests/v1.6-cases.test.mjs`              | 139 tests V1.6                             |
| `FACTORY_V1_6_STANDARD.md`                         | Este documento                             |
| `FACTORY_CONTEXT_POLICY.md`                        | Política de contexto Repomix               |
| `FACTORY_AI_ROUTING_POLICY.md`                     | Política de routing AI por tiers           |
| `FACTORY_LOCAL_AI.md`                              | Guía Ollama + OpenCode                     |
| `FACTORY_DESIGN_SYSTEM_V1_6.md`                    | Design system multisector V1.6             |

### Archivos modificados

| Archivo                                            | Cambios                                    |
|----------------------------------------------------|--------------------------------------------|
| `core/branding/designSystem.js`                    | 10 verticals (era 4), `style` tokens, CSS vars shadcn-compat, nuevas exports |
| `clients/clinica-dental-aurora-demo/manifest-gen.yaml` | Campos V1.6: `ai`, `design`, `media`, `components` |
| `package.json`                                     | +11 scripts factory:context:*, factory:ai:* |

## Design System V1.6

**10 verticales** con tokens completos:
`dental`, `legal`, `physio`, `psychology`, `speech-therapy`, `sports`, `veterinary`, `hairdresser`, `beauty`, `fertility`

Backward compat: `fisioterapia` → `physio` | `estetica` → `beauty` | `abogados` → `legal`

Nuevos tokens por vertical: `style.density`, `style.heroStyle`, `style.ctaStyle`, `style.imageTreatment`

Ver: `FACTORY_DESIGN_SYSTEM_V1_6.md`

## AI Router

```
TIER 1 → OpenCode + Ollama   (gratis, local)
TIER 2 → Repomix + Ollama    (gratis, contexto optimizado)
TIER 3 → Repomix + Claude    (coste bajo-medio)
TIER 4 → Claude + revisión   (coste medio-alto)
```

Ver: `FACTORY_AI_ROUTING_POLICY.md`

## Manifest V1.6 (backward compatible)

Nuevas secciones opcionales:
```yaml
ai:
  routing: TIER3_CLAUDE
  localModel: "qwen2.5-coder:1.5b"
  contextProfile: "generator"

design:
  vertical: dental
  density: comfortable
  radius: md
  typography: sans

media:
  hero: null     # URL o null (usa placeholder)
  gallery: []
  team: []

components:
  variantSet: default   # o shadcn-compat
```

## Tests

| Suite               | Tests     |
|---------------------|-----------|
| v1.6-cases          | 139       |
| Total acumulado     | 683 + 139 = **822** |

```
factory:test:all → 683 PASS (sin regresión)
factory:test:v1.6 → 139/139 PASS
```

## Reducción de consumo de tokens

| Escenario                         | Antes (V1.5) | Con V1.6             |
|-----------------------------------|--------------|----------------------|
| Búsqueda en repo                  | Claude        | OpenCode+Ollama (TIER 1) |
| Documentar una función            | Claude        | Ollama local (TIER 1)    |
| Añadir cliente nuevo              | Claude        | Repomix+Ollama (TIER 2)  |
| Nuevo vertical design system      | Claude        | Repomix+Claude reducido (TIER 3) |
| Deploy producción                 | Claude        | Claude+revisión (TIER 4)         |

**Ahorro estimado de tokens por sesión:**
- Tareas TIER 1: ~100% (Claude no interviene)
- Tareas TIER 2: ~100% (Claude no interviene)
- Tareas TIER 3: ~60–80% menos tokens (Repomix comprime contexto)
- Tareas TIER 4: ~40–60% menos tokens (Repomix reduce contexto)

Los porcentajes son estimaciones conservadoras, no mediciones exactas.

## Limitaciones conocidas

1. **Ollama CPU-only**: En aarch64 PRoot sin GPU, la inferencia es ~2–8 tok/s. No apto para tareas urgentes de alta velocidad.
2. **qwen2.5-coder:1.5b contexto limitado**: ~4k tokens max. Para refactors grandes que requieran contexto amplio, usar Claude (TIER 3).
3. **shadcn CLI no inicializado en proyecto principal**: El proyecto usa inline styles para evitar conflictos con el build pipeline CP04. Los componentes shadcn-compat están en `core/ui/` sin Tailwind.
4. **Output generado no usa aún shadcn-compat**: Los archivos en `output/` siguen usando inline styles (V1.5). Migración opcional en V1.7.

## Seguridad

```
CP04_NO_TOUCH:           SI — 0 cambios en src/ de CP04
LOCALHOST_5175_TOUCHED:  NO
SECRETS_ADDED:           NO — 0 credenciales en ningún archivo
REAL_DATA_USED:          NO — datos ficticios únicamente
PRODUCTION_CHANGES:      NO
```
