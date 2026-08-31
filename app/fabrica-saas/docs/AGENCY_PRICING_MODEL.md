# Modelo de Precios

> Fuente de verdad: `fabrica-saas/commercial/pricingEngine.js`

## Principios

1. **Rangos, no precios fijos.** Todo precio es `[min, max]`. El scope real determina el valor final.
2. **Determinista.** Sin LLM. Sin aleatoriedad. Mismo input → mismo output.
3. **Siempre marcado como ESTIMATE.** Nunca como contrato ni compromiso.
4. **Separación de costes.** Coste de agencia ≠ coste de terceros.

## Factores que afectan el precio

- Paquete base (ESSENTIAL / PRO / PREMIUM)
- Sector vertical (multiplicador entre ×0.8 y ×1.3)
- Módulos en exceso del límite del paquete
- Roles, automatizaciones, agentes IA en exceso
- Integración de pasarela de pago (+€500–900)
- Canal WhatsApp (+€400–700)
- Multiidioma (+€500–800 setup)
- Diseño avanzado, analítica avanzada, multi-sede
- Add-ons adicionales del catálogo

## Output de `calculatePricing()`

```js
{
  valid, disclaimerType: 'ESTIMATE',
  estimatedSetupRange: [min, max],
  estimatedMonthlyRange: [min, max],
  complexityScore: 1-10,
  priceDrivers: [],
  excludedCosts: [],
  thirdPartyCosts: [],
  humanReviewRequired: boolean,
  currency: 'EUR',
  validity: '30 días'
}
```
