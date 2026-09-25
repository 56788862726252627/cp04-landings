# Estados Premium — ADV-07

**isReal:** false | **Módulos:** emptyStateExperience, errorStateExperience, loadingExperience

## Empty States

`createPremiumEmptyState(type, options)` — tipos: `EMPTY_LIST`, `NO_RESULTS`, `FIRST_TIME`, `PERMISSION_DENIED`, `OFFLINE`.

Cada empty state incluye:
- Icono o ilustración contextual
- Heading principal
- Subtítulo explicativo
- CTA de acción (cuando aplica)

Tono adaptado por vertical: cálido para veterinaria/beauty, formal para legal.

## Error States

`createPremiumErrorState(type, options)` — tipos: `RECOVERABLE`, `CONNECTION_ERROR`, `NOT_FOUND`, `SERVER_ERROR`, `AUTH_ERROR`.

Reglas:
- `RECOVERABLE` → siempre incluye acción de reintento
- `AUTH_ERROR` → redirige a login, no expone detalles técnicos
- `SERVER_ERROR` → copy amigable, nunca stack traces
- Severidad declarada: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

## Loading Experience

`createLoadingExperience({ pattern, estimatedMs })` — patrones:

| Patrón | Cuándo usar |
|--------|------------|
| SKELETON | Listas, cards, dashboards |
| SPINNER | Acciones puntuales, botones |
| PROGRESS_BAR | Uploads, procesos largos |
| PULSE | Avatares, imágenes |

Umbral: si `estimatedMs > 300`, usar skeleton; si `estimatedMs < 100`, no mostrar nada.

## Cobertura Obligatoria

Todo módulo de datos debe implementar los 3 estados:
- [ ] Empty state (sin datos)
- [ ] Error state (fallo de red/API)
- [ ] Loading state (carga inicial + recargas)
