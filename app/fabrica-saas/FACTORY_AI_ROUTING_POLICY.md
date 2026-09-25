# FACTORY_AI_ROUTING_POLICY — Fábrica SaaS V1.6

## Principio

Claude no desaparece, pero deja de ser el motor por defecto para tareas simples o repetitivas.

```
TAREAS SIMPLES / REPETITIVAS → OpenCode + Ollama (gratis, local)
LECTURA / COMPRESIÓN         → Repomix (antes de cualquier sesión grande)
DISEÑO / UI MULTISECTOR      → shadcn-compat components + design tokens propios
TAREAS COMPLEJAS / CRÍTICAS  → Claude
```

## Tiers

### TIER 1 — LOCAL GRATIS
**Motor:** OpenCode + Ollama (qwen2.5-coder:1.5b)  
**Coste:** 0 €

Casos de uso:
- Búsqueda en repo (`grep`, `find`, lookup de funciones)
- Documentación JSDoc de funciones existentes
- Tests unitarios sencillos (un módulo, sin dependencias complejas)
- Lint y build checks
- Boilerplate y scaffold repetitivo
- Rename / reformat / small fixes
- Inspección de estructura de archivos
- Generación repetitiva de variantes

**Cómo arrancar:**
```bash
ollama serve &
npm run factory:ai:local
# → Abre OpenCode con qwen2.5-coder:1.5b
```

---

### TIER 2 — LOCAL + CONTEXTO OPTIMIZADO
**Motor:** Repomix → OpenCode/Ollama  
**Coste:** 0 €+ tiempo de generación de contexto

Casos de uso:
- Refactors medianos (varios archivos del mismo scope)
- Creación de módulos nuevos con dependencias conocidas
- Análisis de varios archivos relacionados
- Edición de manifests con validación
- Añadir cliente nuevo (scaffold completo)

**Flujo:**
```bash
npm run factory:context:generator    # genera contexto del scope
npm run factory:ai:local             # carga contexto + trabaja con Ollama
```

---

### TIER 3 — CLAUDE
**Motor:** Claude Sonnet (+ Repomix para reducir tokens)  
**Coste:** bajo–medio

Casos de uso:
- Arquitectura de nuevas funcionalidades
- Cambios en el design system que afectan múltiples verticales
- Migración de schema (backward compat)
- Debugging complejo o cross-layer
- Decisiones de API / contratos de interfaz
- Integración de herramientas externas
- Security review

**Flujo:**
```bash
npm run factory:context:<scope>    # reduce tokens antes de abrir Claude
# Luego: abrir Claude Code con el contexto generado
```

---

### TIER 4 — CLAUDE + REVISIÓN HUMANA
**Motor:** Claude Sonnet/Opus + revisión manual  
**Coste:** medio-alto

Casos de uso:
- Cambios de producción (deploy, Cloudflare, Worker)
- Pagos (Stripe)
- Autenticación y credenciales
- Cambios que afectan datos reales
- Infraestructura crítica
- Migraciones con riesgo de pérdida de datos

**Regla:** **ningún commit sin revisión manual** en TIER 4.

---

## Tabla de clasificación rápida

| Tarea                          | Tier | Motor             |
|-------------------------------|------|-------------------|
| `grep` función en repo         | 1    | OpenCode+Ollama   |
| Documentar módulo existente    | 1    | OpenCode+Ollama   |
| Test unitario simple           | 1    | OpenCode+Ollama   |
| Añadir cliente nuevo           | 2    | Repomix+Ollama    |
| Refactor de generador          | 2    | Repomix+Ollama    |
| Nuevo vertical design system   | 3    | Repomix+Claude    |
| Arquitectura de V1.7           | 3    | Repomix+Claude    |
| Deploy a Cloudflare            | 4    | Claude+revisión   |
| Cambio en auth/Worker          | 4    | Claude+revisión   |

## Comando de clasificación

```bash
# Verificar disponibilidad del modelo local
npm run factory:ai:check
# → "Local AI: AVAILABLE" o "Local AI: UNAVAILABLE"
```

Si UNAVAILABLE: usar TIER 3 (Claude) para todo hasta que Ollama esté corriendo.

## Instrucción permanente para IA

> Al inicio de cualquier sesión en `fabrica-saas/`:
> 1. Verificar si el modelo local está disponible: `npm run factory:ai:check`
> 2. Clasificar la tarea en un tier (usar `classifyTask()` de `core/aiRouter.js`)
> 3. Generar contexto Repomix del scope correspondiente
> 4. Elegir el motor según el tier
> 5. Solo escalar a Claude si el tier lo requiere
