# Agency Alerting — ADV-01

Sistema de alertas declarativo. Evalúa condiciones, no envía alertas reales.

## Niveles de alerta

| Nivel | Significado |
|---|---|
| `NO_ALERT` | Sin condición activa |
| `WARNING` | Degradación detectable, monitorear |
| `ALERT` | Fallo operativo, investigar |
| `CRITICAL_ALERT` | Impacto severo, acción inmediata |

## 10 Reglas por defecto

| ID | Condición | Nivel |
|---|---|---|
| `CRITICAL_EVENT` | Cualquier evento CRITICAL | CRITICAL_ALERT |
| `ERROR_BURST` | 5+ errores en la ventana | ALERT |
| `HIGH_ERROR_RATE` | Error rate >20% | ALERT |
| `REPEATED_TIMEOUT` | 3+ timeouts | WARNING |
| `RATE_LIMIT_BURST` | 3+ rate limits | WARNING |
| `EXTERNAL_SERVICE_OUTAGE` | 5+ errores EXTERNAL_API | CRITICAL_ALERT |
| `SECURITY_EVENT` | Cualquier evento tipo SECURITY | CRITICAL_ALERT |
| `DEPLOYMENT_FAILURE` | Deploy con status FAILURE | ALERT |
| `RUNTIME_BLANK_SCREEN` | errorType=RUNTIME_BLANK_SCREEN en metadata | CRITICAL_ALERT |
| `AUTOMATION_REPEATED_FAIL` | 3+ fallos de automatización | ALERT |

## Uso

```js
import { evaluateAlerts, DEFAULT_ALERT_RULES, calculateObservabilityMetrics } from '../factory-registry/index.js';

const metrics = calculateObservabilityMetrics(events);
const alertResult = evaluateAlerts(events, metrics, DEFAULT_ALERT_RULES);

if (alertResult.hasCritical) {
  // Escalar a humano — no enviar automáticamente
  console.warn('CRITICAL alert triggered:', alertResult.triggered);
}
```

## Canales (futuros)

```js
import { createAlertChannelAdapter, ALERT_CHANNEL } from '../factory-registry/index.js';

const adapter = createAlertChannelAdapter(ALERT_CHANNEL.TELEGRAM, { enabled: false });
// enabled=false por defecto — no envía nada real
// Para activar: { enabled: true } + implementar endpoint en dispatch()
```

## Guardrails activos

- `NO_REAL_EXTERNAL_ALERTS_REAL=SI` — Ningún adapter envía alertas reales en esta versión.
- `adapterNote: 'NO_REAL_ALERTS_SENT'` incluido en toda respuesta de `evaluateAlerts()`.
- El gate humano es obligatorio antes de escalar a incidente (ver `incidentBridge.js`).
