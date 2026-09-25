# Propuesta Comercial

> Fuente de verdad: `fabrica-saas/commercial/proposalGenerator.js`

## Qué es una CommercialProposal

Un documento estructurado (datos, no PDF) que contiene todas las secciones de una propuesta comercial para el cliente. No tiene validez legal autónoma.

## Secciones

| Sección | Contenido |
|---------|-----------|
| `executiveSummary` | Resumen ejecutivo con paquete y rango de precio |
| `businessProblem` | Diagnóstico del negocio y riesgos detectados |
| `recommendedSolution` | Tier recomendado y razonamiento |
| `includedScope` | Lista de lo que incluye el paquete |
| `deliverables` | Entregables concretos |
| `timelineEstimate` | Plazos estimados (por fases) |
| `setupEstimate` | Inversión inicial con drivers de precio |
| `monthlyEstimate` | Coste mensual con plan de mantenimiento |
| `addons` | Add-ons recomendados con precios |
| `thirdPartyCosts` | Costes de terceros (gestión cliente) |
| `assumptions` | Supuestos de la estimación |
| `exclusions` | Qué no está incluido |
| `nextSteps` | Próximos pasos concretos |

## Plazos estimados por tier

| Tier | Semanas |
|------|---------|
| ESSENTIAL | 3–5 |
| PRO | 6–10 |
| PREMIUM | 10–16 |

## Uso

```js
const proposal = generateProposal(estimate, { agencyName: 'Agencia IA', contactEmail: 'hola@agencia-ia.es' });
```
