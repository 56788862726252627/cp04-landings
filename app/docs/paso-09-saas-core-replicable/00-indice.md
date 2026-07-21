# Paso 09 — Núcleo SaaS Replicable Multisector — Índice

Rama `frontend/saas-core-replicable-20260720` · Worktree `/root/cp04-t-saas-core`.
Checkpoint: tag `saas-core-checkpoint-20260721`.

1. [01-auditoria-acoplamiento.md](01-auditoria-acoplamiento.md) — Fase 1: inventario clasificado de acoplamientos CP04.
2. [02-arquitectura.md](02-arquitectura.md) — Fase 2: arquitectura por capas, sin mover archivos existentes.
3. [03-nucleo-modulos-terminologia-dominio-adaptadores.md](03-nucleo-modulos-terminologia-dominio-adaptadores.md) — Fases 3, 5-8, 11: esquema, terminología, módulos, dominio, adaptadores, automatizaciones. Incluye tabla de plantillas/presets (Fase 4).
4. [04-tenants-demo.md](04-tenants-demo.md) — Fase 10: los 7 tenants demostrativos generados y verificados.
5. [05-medicion-replicabilidad.md](05-medicion-replicabilidad.md) — Fase 15: métricas reales por tenant y por sector, con criterios explícitos.
6. [06-aprovisionamiento-y-guia-rapida.md](06-aprovisionamiento-y-guia-rapida.md) — Fase 9: CLI, cómo crear un sector/cliente nuevo, guía rápida ≤15 min.
7. [07-seguridad-privacidad-limites-migracion.md](07-seguridad-privacidad-limites-migracion.md) — Fase 12: seguridad/privacidad, límites actuales, checklist de producción, migración futura.

## Dónde está el código

- `app/src/saas-core/` — núcleo (schema, terminología, módulos, dominio, adaptadores, automatizaciones, seguridad, tenants demo).
- `app/tenant-cli/` — CLI de aprovisionamiento (`tenant:create/validate/list/preview`).
- Ningún archivo fuera de estas rutas fue modificado, salvo `app/package.json` (4 scripts npm `tenant:*` + `test`/`test:worker` añadidos).

## Cómo verificar

```
cd app
npm test          # 304 tests (201 preexistentes de src/ intactos + 103 nuevos de este paso)
npm run test:worker  # 173 tests preexistentes del Worker, sin tocar
npm run build      # vite build, sin errores nuevos
npm run lint       # 4 errores/1 warning preexistentes en archivos NO tocados por este paso
npm run tenant:list -- --catalog
```
