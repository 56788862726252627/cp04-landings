# FACTORY_CONTEXT_POLICY — Fábrica SaaS V1.6

## Principio

**Antes de cualquier tarea de IA con más de 2 archivos involucrados:**
1. Identificar el scope exacto de la tarea
2. Generar el perfil de contexto Repomix correspondiente
3. Pasar solo ese contexto al agente
4. Abrir archivos completos únicamente cuando sea estrictamente necesario

## Perfiles de contexto disponibles

| Perfil         | Comando npm                        | Cuándo usarlo                               |
|----------------|-------------------------------------|---------------------------------------------|
| `core`         | `npm run factory:context:core`      | Cambios en AppShell, adapters, config        |
| `generator`    | `npm run factory:context:generator` | Modificar templates o scripts de generación  |
| `client`       | `npm run factory:context:client`    | Editar manifests de clientes                 |
| `design`       | `npm run factory:context:design`    | Design system, tokens, vertical themes       |
| `tests`        | `npm run factory:context:tests`     | Escribir o revisar tests                     |
| `architecture` | `npm run factory:context:architecture` | Planificar cambios estructurales          |
| `all`          | `npm run factory:context`           | Auditorías completas, onboarding             |

## Exclusiones permanentes (nunca incluir en contexto)

- `node_modules/`
- `dist/`, `build/`, `deploy/`
- `output/` (código generado, abrir solo si necesario)
- `.env*`, `.secret`, credenciales, API keys, tokens
- Binarios (`.bin`, `.exe`, `.zip`, `.tar*`)
- Imágenes pesadas (`.png`, `.jpg`, `.svg`, `.ico`, `.woff*`)
- Backups, temporales, logs

## Estrategia de compresión

Repomix V1.18+ soporta compresión (`compress: true` en config). Usarla siempre para reducir tokens manteniendo estructura.

## Política por tier de tarea

Ver `FACTORY_AI_ROUTING_POLICY.md` para decidir qué perfil de contexto usar según el tier de la tarea.

## Guía rápida

```bash
# Antes de trabajar en el generador
npm run factory:context:generator
# → Carga fabrica-saas/.ai/context/generated/generator.xml en tu sesión

# Antes de un cambio en el design system
npm run factory:context:design
# → Carga design-system.xml con tokens + AppShell

# Auditoría completa
npm run factory:context
# → Genera los 6 perfiles en generated/
```

## Por qué esta política ahorra tokens

Un contexto de repo completo sin Repomix puede superar los 200k tokens. Con perfiles focalizados:
- `generator` ≈ 15k–30k tokens
- `core`       ≈ 10k–20k tokens  
- `client`     ≈ 2k–5k tokens
- `design`     ≈ 8k–15k tokens

Ahorro estimado vs contexto completo: 60–85% por sesión de scope reducido.
