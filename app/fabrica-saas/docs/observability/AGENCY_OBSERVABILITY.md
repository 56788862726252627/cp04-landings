# Agency Observability — ADV-01

Sistema de observabilidad transversal para la Agencia IA, la Fábrica SaaS y los clientes generados.

## Módulos (21)

| Módulo | Archivo | Responsabilidad |
|---|---|---|
| eventModel | `observability/eventModel.js` | Modelo canónico de evento (21 campos, frozen) |
| severityModel | `observability/severityModel.js` | Elevación determinista de severidad (8 reglas) |
| redactionEngine | `observability/redactionEngine.js` | Redacción de secretos y PII antes de loguear |
| structuredLogger | `observability/structuredLogger.js` | Logger tipado con adaptadores CONSOLE/MEMORY/SILENT |
| correlationContext | `observability/correlationContext.js` | Contexto de correlación y trazabilidad cross-componente |
| errorNormalizer | `observability/errorNormalizer.js` | Normalización de errores en 15 categorías estándar |
| observabilityStore | `observability/observabilityStore.js` | Almacén en memoria con aislamiento por cliente |
| metricsEngine | `observability/metricsEngine.js` | Métricas operativas (errorRate, p50/p95, retryRate) |
| healthAggregator | `observability/healthAggregator.js` | Agregación de salud del sistema por 8 factores ponderados |
| alertEngine | `observability/alertEngine.js` | 10 reglas declarativas de alerta (sin envío real) |
| incidentBridge | `observability/incidentBridge.js` | Puente a incidentManagement.js (gate humano obligatorio) |
| automationObservability | `observability/automationObservability.js` | Eventos específicos de Make/webhook/automatización |
| aiObservability | `observability/aiObservability.js` | Trazabilidad de llamadas IA (latencia, fallback, coste estimado) |
| deployObservability | `observability/deployObservability.js` | Eventos de deploy con resultado y rollback |
| securityObservability | `observability/securityObservability.js` | 10 tipos de evento de seguridad (CRITICAL auto) |
| clientIsolation | `observability/clientIsolation.js` | Aislamiento multi-tenant en todas las consultas |
| dashboardModel | `observability/dashboardModel.js` | Modelo de datos para dashboard (sin UI) |
| debugHelpers | `observability/debugHelpers.js` | Helpers de diagnóstico (timeline, health por cliente/proyecto) |
| retentionPolicy | `observability/retentionPolicy.js` | Política de retención por severidad (3-730 días) |
| nexoFixture | `observability/nexoFixture.js` | Cliente ficticio Nexo Vet para tests de integración |
| failureScenarios | `observability/failureScenarios.js` | 12 escenarios de fallo pre-definidos |

## Barrel de acceso

```js
import { createObservabilityEvent, createLogger, createCorrelationContext, ... } from '../factory-registry/index.js';
```

## Versión

- `OBSERVABILITY_VERSION = '1.0.0'`
- `REGISTRY_VERSION = '2.9.0'` (bump desde 2.8.0 al añadir ADV-01)
- Branch: `feature/factory-advanced-01-observability`
