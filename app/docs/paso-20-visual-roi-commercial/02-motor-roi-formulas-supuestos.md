# 02 — Motor ROI: fórmulas, supuestos, escenarios, confianza

## Nunca un resultado garantizado

Cada cifra de salida de `roiEngine.js` es un objeto `{value, source,
formula, assumption, confidence, unit}` — nunca un número suelto.
`source` es uno de `"provided"` (dato real del negocio), `"calculated"`
(fórmula sobre datos ya resueltos), o `"assumed"`/`"unavailable"` (sin
dato real ni supuesto aplicable). El objeto de resultado completo
incluye siempre `disclaimer`: *"Estimaciones basadas en supuestos
declarados y fórmulas deterministas — NUNCA son un resultado
garantizado."*

## Inputs aceptados

`averageTicket`, `monthlyBookings`, `noShowRate`, `adminHoursPerWeek`,
`hourlyCost`, `conversionRate`, `currentMonthlyRevenue`,
`implementationCost`, `monthlyMaintenanceCost`. Todos opcionales — los
que falten se resuelven con el supuesto sectorial de
`commercialSectorProfiles.js` cuando existe (`averageTicket`,
`monthlyBookings`, `noShowRate`, `adminHoursPerWeek`, `hourlyCost`,
`implementationCost`, `monthlyMaintenanceCost`) o quedan
`"unavailable"` cuando no hay supuesto razonable
(`conversionRate`, `currentMonthlyRevenue`) — nunca se inventa un valor
para estos dos.

## Fórmulas (idénticas para los 3 escenarios, con factores de mejora distintos)

| Salida | Fórmula |
|---|---|
| `hoursSavedPerMonth` | `adminHoursPerWeek × (52/12) × hoursSavedFactor(escenario)` |
| `economicSavingsPerMonth` | `hoursSavedPerMonth × hourlyCost` |
| `noShowSavingsPerMonth` | `averageTicket × monthlyBookings × noShowRate × noShowReduction(escenario)` — `unavailable` si falta cualquiera de los 3 inputs |
| `potentialRevenueIncrease` | `currentMonthlyRevenue × conversionUplift(escenario)` — `unavailable` sin `currentMonthlyRevenue` |
| `totalMonthlyBenefit` | `economicSavingsPerMonth + noShowSavingsPerMonth + potentialRevenueIncrease` |
| `paybackMonths` | `implementationCost / (totalMonthlyBenefit − monthlyMaintenanceCost)` — `null` con explicación si el beneficio neto no es positivo |
| `roi{3,6,12}Months` | `((totalMonthlyBenefit − monthlyMaintenanceCost) × meses − implementationCost) / implementationCost × 100` |

## Los 3 escenarios — supuestos de MEJORA, no de negocio

| Escenario | Reducción de no-shows | Mejora de conversión | Horas ahorradas | Confianza |
|---|---|---|---|---|
| Conservador | 30% | 2% | 50% | 0.55 |
| Central | 50% | 5% | 70% | 0.65 |
| Optimista | 70% | 8% | 90% | 0.45 (mayor incertidumbre al asumir más mejora) |

Estos porcentajes son supuestos DECLARADOS sobre cuánto de la mejora
potencial detectada realmente se materializa — nunca varían el ticket
medio ni el volumen de reservas del propio negocio (esos son datos de
entrada, no supuestos de mejora).

## Confianza y cobertura

- La confianza de cada cifra calculada depende del escenario Y de la
  confianza de sus inputs (p. ej. `economicSavingsPerMonth` hereda el
  mínimo entre la confianza de `hoursSavedPerMonth` y `hourlyCost`).
- `assumptionsUsed`: lista completa de qué campos se resolvieron con un
  supuesto sectorial (nunca oculta).
- `unavailableVariables`: lista de qué no se pudo calcular por falta de
  datos, sin inventar un valor de relleno.

## Determinismo

`computeRoiScenarios` nunca usa `Math.random()` ni el reloj del sistema
— mismos inputs producen el mismo resultado byte a byte, verificado por
test explícito.
