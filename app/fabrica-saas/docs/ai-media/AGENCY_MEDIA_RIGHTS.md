# Política de Derechos de Media (ADV-13)

## Estados de derechos
| Estado | Significado |
|--------|-------------|
| CLEARED | Licencia verificada |
| NOT_CLEARED | Sin licencia — BLOQUEADO |
| SYNTHETIC_FREE | Generado por IA, sin royalties |
| UNKNOWN | No verificado — BLOQUEADO |
| REQUIRES_CHECK | Pendiente verificación |

## Verificaciones automáticas
- `avatarRights === UNKNOWN` → violation: AVATAR_RIGHTS_UNKNOWN
- `musicRights === NOT_CLEARED` → violation: MUSIC_NOT_CLEARED
- `commercialUse && avatarRights !== CLEARED|SYNTHETIC_FREE` → COMMERCIAL_USE_NOT_CLEARED

## Regla de activos desconocidos
`RIGHTS_STATUS.UNKNOWN` → siempre BLOCKED, incluso con aprobación humana.

## Música
Usar solo música con licencia Creative Commons o generada por IA sin royalties.
Música externa → verificar CLEARED antes de aprobar output.
