# Límites de Servicio por Paquete

> Fuente de verdad: `fabrica-saas/commercial/serviceLimits.js`

## Límites por tier

| Capacidad | ESSENTIAL | PRO | PREMIUM |
|-----------|-----------|-----|---------|
| Módulos | 3 | 8 | 15 |
| Automatizaciones | 2 | 5 | 10 |
| Integraciones | 2 | 5 | 10 |
| Roles | 2 | 4 | 8 |
| Agentes IA | 0 | 1 | 3 |
| Rondas revisión | 1 | 3 | 5 |
| Soporte incluido | 1 mes | 3 meses | 6 meses |
| Horas desarrollo | 0h | 4h | 16h |
| Migración registros | 0 | 500 | 5.000 |

## Qué pasa cuando se supera un límite

1. **Add-on**: por cada unidad extra se añade el add-on correspondiente (`extra-module`, `extra-role`, etc.)
2. **Upgrade recomendado**: si se supera el umbral del tier superior, se recomienda cambiar de paquete
3. **Revisión humana**: si hay >3 violaciones o se necesita upgrade a PREMIUM, se requiere revisión manual

## Función `checkLimits(tierId, scope)`

```js
checkLimits('PRO', { modules: 10, aiAgents: 3 })
// → { exceeded: true, violations: [...], requiredAddons: [...], upgradeRequired: true }
```
