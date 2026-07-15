# Decisión de producto: ¿adopta `main` la línea avanzada de Club Pádel 04?

**Estado: PENDIENTE DE AUTORIZACIÓN EXPLÍCITA.** Este documento registra la recomendación de producto y las condiciones de gobernanza para decidir si `main` sustituye su versión actual (stub/básica) por la línea avanzada representada por el PR #26. No autoriza ni ejecuta ningún merge por sí mismo.

## Contexto

- `origin/main` contiene actualmente una versión básica/stub del frontend (`App.jsx` de 393 líneas).
- `release/staging-club-padel-04-2026-07-15` (= tip de `frontend/audit-fixes-20260709`) contiene la app avanzada real: login/roles/RBAC, Reservas, Torneos, Ranking, Admin, Soporte, **Comunidad** (demo/mock), **PWA** y mejoras de **accesibilidad**.
- **PR #26** (`release/staging-club-padel-04-2026-07-15` → `main`) está abierto en **draft**, es técnicamente `MERGEABLE`/`CLEAN`, y fue auditado con una simulación real de merge de 3 vías (`git merge-tree`, sin tocar ninguna rama): el resultado **no pierde contenido de ningún lado** — conserva la documentación y lógica de Comunidad que ya vive en `main` (33 docs + 19 módulos de `community-logic` del PR #23) junto con `ComunidadDemo.jsx`, PWA y accesibilidad de la línea avanzada.
- Escaneo de secretos del historial completo (309 commits, todas las ramas): **0 secretos reales encontrados**. El único hallazgo (`.env` histórico) resultó ser un PDF mal nombrado, no una fuga.
- **PR #24** (revisión legal externa + decisión sobre menores para Comunidad) sigue **abierto en draft**, sin resolver.
- **PR #1** y **PR #13** siguen abiertos como deuda histórica de reconciliación, sin relación de bloqueo técnico con esta decisión.
- Terminal 6 (`localhost:5174`) sirve la app avanzada en vivo desde `frontend/audit-fixes-20260709` y no se ve afectado por este documento.

## Recomendación

**Adoptar `main` como la línea avanzada (mergear PR #26) SOLO tras resolver el PR #24 (legal/menores).** No antes. La limpieza técnica del merge (verificada, sin pérdida de contenido) elimina el riesgo de ingeniería, pero **no sustituye ni acelera** la revisión legal pendiente, que es un proceso humano independiente.

**PR #26 debe permanecer en modo `draft` hasta que exista autorización explícita y documentada** de negocio/producto para pasar a "ready for review" y, posteriormente, a merge. Ningún hallazgo técnico de esta auditoría constituye esa autorización.

## Condiciones obligatorias antes de mergear PR #26

1. **PR #24 resuelto**: revisión legal externa completada y decisión explícita sobre menores documentada.
2. **Decisión de negocio explícita y documentada** de que `main` adopta esta línea avanzada como base oficial del producto (no una aprobación técnica de PR — una decisión de producto firmada por quien tenga esa autoridad).
3. **Disposición sobre PR #1 y PR #13**: decidir si se cierran, se rebasan contra el nuevo `main`, o se documentan como superados, para que no queden como deuda fantasma tras el merge.

## Condiciones recomendadas (no bloqueantes)

- Confirmar que la URL del Worker de proxy (`cp04-reservas-proxy...workers.dev`, referenciada en `vite.config.js`) sigue vigente para el entorno resultante.
- Decidir la estrategia de sincronización de los worktrees/checkouts locales existentes (incluido el de Terminal 6) tras el merge.
- Aprovechar el merge para eliminar de forma natural el `.env` histórico (PDF mal nombrado, ya sin efecto de seguridad real, pero con valor de higiene).

## Riesgos de mergear antes de que PR #24 se resuelva

- **Legal**: `main` pasaría a exponer Comunidad (Feed, Perfil, Amigos, Partidos abiertos, Moderación) desde la rama que cualquier persona asumiría como "la oficial", sin que la revisión de menores haya cerrado — el riesgo más serio de todos los identificados en este proceso.
- **Percepción de producto**: podría interpretarse como que el producto está "listo para producción" cuando persiste deuda de decisión sobre PR #1/#13 y el bloqueo legal.

## Riesgos de mantener `main` como stub demasiado tiempo

- La deuda de reconciliación sigue creciendo con cada nuevo commit en `frontend/audit-fixes-20260709` (más divergencia futura).
- Confusión operativa persistente: cualquiera que audite el repositorio por primera vez ve un `main` que no representa el producto real.
- Fricción comercial recurrente al tener que explicar, en cada demo o revisión externa, que la app real vive en otra rama.

## Trazabilidad

- PR #24 — revisión legal/menores (bloqueo obligatorio): draft, sin resolver.
- PR #25 — integración de Comunidad demo/mock (mergeado en `frontend/audit-fixes-20260709`).
- PR #26 — staging avanzado → `main` (este documento): draft, en espera de autorización.
- PR #1, PR #13 — deuda histórica de reconciliación: abiertos, pendientes de disposición.

Ver también: `DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md` (PR #24), `CHECKLIST_REVISION_LEGAL_EXTERNA_COMUNIDAD_PADEL_04.md`, `MATRIZ_BLOQUEOS_NO_TECNICOS_COMUNIDAD_PADEL_04.md`.
