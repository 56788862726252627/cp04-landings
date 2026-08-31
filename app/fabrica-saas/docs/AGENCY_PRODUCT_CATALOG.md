# Catálogo de Productos de la Agencia

> Fuente de verdad: `fabrica-saas/commercial/productCatalog.js`

## 8 Productos

| ID | Nombre | Tipo |
|----|--------|------|
| `saas-local-pro` | SaaS Local Pro | setup |
| `landing-comercial` | Landing Comercial | setup |
| `automatizacion-negocio` | Automatización de Negocio | setup + monthly |
| `agente-ia` | Agente IA | setup + monthly |
| `integracion-custom` | Integración Custom | setup |
| `mantenimiento` | Plan de Mantenimiento | monthly |
| `expansion` | Expansión y Escalado | setup |
| `servicios-opcionales` | Servicios Opcionales | variable |

## Campos por Producto

Cada producto define: `id`, `name`, `description`, `targetCustomer`, `problemSolved`, `included[]`, `excluded[]`, `dependencies[]`, `deliveryType`, `estimatedComplexity`, `recurringCostImpact`, `thirdPartyCostImpact`, `commercialNotes`.

## Regla de uso

Nunca presentar el coste de terceros como margen de agencia. El campo `thirdPartyCostImpact` siempre indica quién paga cada servicio externo.
