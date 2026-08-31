# Estimación Comercial

> Fuente de verdad: `fabrica-saas/commercial/commercialEstimate.js`

## Qué es una CommercialEstimate

Una estructura de datos que recoge:

- Paquete recomendado y razonamiento
- Rangos de precio (setup y mensual)
- Costes de terceros identificados
- Plan de mantenimiento recomendado
- Supuestos, exclusiones y dependencias
- Indicadores de revisión humana

## Disclaimers obligatorios

Toda estimación incluye explícitamente:

```
ESTIMACIÓN ORIENTATIVA.
NO ES UN CONTRATO.
NO ES UN COMPROMISO AUTOMÁTICO.
Sujeto a revisión técnica y validación de scope definitivo.
```

## Función `generateEstimate(brief, businessProfile, modulePlan)`

Pipeline interno:
1. `recommendCommercialPackage()` → tier recomendado
2. `calculatePricing()` → rangos de precio
3. `checkLimits()` → violaciones y add-ons necesarios
4. Costes de terceros identificados por scope
5. Plan de mantenimiento recomendado

## Validez

30 días desde emisión. Después de ese plazo, el scope debe ser re-validado.
