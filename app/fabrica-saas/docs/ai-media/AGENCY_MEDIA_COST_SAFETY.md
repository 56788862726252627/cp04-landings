# Seguridad de Coste en Media (ADV-13)

## Gates de coste
| Gate | Acción |
|------|--------|
| FREE_SAFE | ALLOW |
| ESTIMATED | ALLOW (sin coste real aún) |
| REQUIRES_APPROVAL | REQUIRE_APPROVAL antes de generar |
| BLOCKED | BLOCK siempre |
| UNKNOWN | BLOCK — nunca aprobar coste desconocido |

## Umbral de aprobación
`totalEstimatedCents > 500` → `REQUIRES_APPROVAL`
`totalEstimatedCents === 0` → `FREE_SAFE` o `ESTIMATED` según proveedor

## Componentes de coste
avatar / voice / video / storage / render / api / music / distribution

## Restricción NO_REAL_EXTERNAL_COST=SI
Ningún proveedor real debe ser invocado sin aprobación humana explícita y coste conocido.
