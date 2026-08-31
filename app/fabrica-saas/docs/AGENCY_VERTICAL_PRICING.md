# Ajustes de Precio por Sector (Vertical Overrides)

> Fuente de verdad: `fabrica-saas/commercial/verticalOverrides.js`

## Multiplicadores por sector

| Sector | Multiplicador | Razón |
|--------|--------------|-------|
| `psicologia` | ×1.30 | Datos altamente sensibles, confidencialidad reforzada |
| `legal` | ×1.30 | Expedientes sensibles, secreto profesional |
| `dental` | ×1.20 | Compliance sanitario, historial clínico |
| `salud` | ×1.20 | Datos de salud, consentimientos |
| `fisio` | ×1.20 | Historial de sesiones, datos clínicos |
| `tech` | ×1.15 | Integraciones técnicas complejas |
| `analytics` | ×1.15 | Dashboards de datos complejos |
| `educacion` | ×1.10 | Menores de edad, protección de datos adicional |
| `consultoria` | ×1.10 | Datos empresariales confidenciales |
| `veterinary` | ×1.00 | Sector estándar |
| `estetica` | ×0.95 | Bajo riesgo, flujos sencillos |
| `spa` | ×0.95 | Sin datos sensibles |
| `padel` | ×0.90 | Flujos simples |
| `fitness` | ×0.90 | Estándar |
| `restaurante` | ×0.85 | Mínima complejidad |
| `comercio` | ×0.85 | Sin compliance especial |
| `portfolio` | ×0.80 | Sin gestión de datos de clientes |

## Uso

El multiplicador se aplica **solo al coste de setup**, no al mensual.

```js
applyVerticalMultiplier(3000, 'legal')  // → 3900
applyVerticalMultiplier(3000, 'padel')  // → 2700
```

Sector desconocido → multiplicador ×1.0 (base).
