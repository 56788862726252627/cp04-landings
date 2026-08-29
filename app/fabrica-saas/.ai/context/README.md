# Fábrica SaaS — Context Engine (Repomix)

## Propósito

Reducir el consumo de contexto/tokens en sesiones de IA generando snapshots comprimidos del repositorio por scope.

**Regla permanente:** antes de tareas grandes de IA, identificar el scope necesario, generar solo ese perfil de contexto y pasarlo al agente. No abrir el repo completo sin necesidad.

## Uso

```bash
# Generar todos los perfiles
npm run factory:context

# Perfil específico
npm run factory:context:core
npm run factory:context:client
npm run factory:context:design
npm run factory:context:generator
npm run factory:context:tests
npm run factory:context:architecture
```

## Perfiles disponibles

| Perfil       | Contenido                                  | Cuándo usarlo                         |
|--------------|---------------------------------------------|---------------------------------------|
| `core`       | AppShell, design system, adapters, config   | Cambios en componentes base           |
| `generator`  | Templates, schema, scripts                  | Modificar el generador                |
| `client`     | Manifests de clientes                       | Añadir/editar cliente                 |
| `design`     | Tokens visuales, temas por vertical         | Cambios de branding/UI                |
| `tests`      | Todos los archivos de test                  | Revisar o añadir tests                |
| `architecture` | Schemas, docs, policies                   | Planificar nueva funcionalidad        |
| `all`        | Combinación completa                        | Auditorías / onboarding               |

## Output

Los contextos generados se guardan en `generated/` (excluidos de git).

## Exclusiones estrictas

- `node_modules/`
- `dist/` / `build/`
- `deploy/` (artefactos de despliegue)
- `output/` (código generado — solo incluir si necesario)
- Archivos `.env`, `.secret`, credenciales, claves
- Binarios, imágenes pesadas, backups

## Política de uso

Ver: `FACTORY_CONTEXT_POLICY.md` en la raíz de `fabrica-saas/`
