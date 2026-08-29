# OpenCode — Factory Scope Policy

## Reglas de uso

OpenCode corre con modelo local (Ollama/qwen2.5-coder:1.5b) cuando esté disponible.

### PERMITIDO

- Búsqueda y exploración dentro de `fabrica-saas/`
- Documentación de funciones y módulos existentes
- Generación de tests unitarios sencillos
- Pequeños refactors mecánicos
- Análisis de archivos individuales
- Inspección de estructura
- Lint y build checks
- Generación repetitiva de código boilerplate

### NO PERMITIDO

- Acceso a `src/` principal (Club Pádel 04)
- Acceso a `factory-cli/` sin supervisión explícita
- Lectura de archivos `.env`, `.secret`, credenciales
- Escritura fuera de `fabrica-saas/`
- Commits, pushes, pull requests automáticos
- Cambios de configuración del sistema
- Acceso a otros repositorios

### Scope

Cuando se ejecuta en modo Factory:
- Working directory: `fabrica-saas/`
- Contexto: cargar el perfil Repomix apropiado antes de empezar

## Cómo arrancar

```bash
# Asegurar que Ollama esté corriendo
ollama serve &

# Lanzar OpenCode con config Factory
npm run factory:ai:local
```

## Cuándo usar Claude en su lugar

Ver `FACTORY_AI_ROUTING_POLICY.md` — TIER 3 y TIER 4 van siempre a Claude.
