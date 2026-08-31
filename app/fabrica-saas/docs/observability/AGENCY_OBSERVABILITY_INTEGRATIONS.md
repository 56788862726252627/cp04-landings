# Agency Observability Integrations — ADV-01

Estado de integraciones con sistemas externos e internos.

## CURRENT — Integraciones activas (v1.0.0)

| Sistema | Estado | Descripción |
|---|---|---|
| `sop/incidentManagement.js` | REUSE | `incidentBridge.js` reutiliza `INCIDENT_SEVERITY` y define el gate humano |
| `health/aiHealth.js` | REUSE | `healthAggregator.buildFactorsFromExistingModules()` consume resultado de `checkAIHealth()` |
| `health/automationHealth.js` | REUSE | Ídem para `checkAutomationHealth()` |
| `factory-registry/index.js` | EXTENDED | Barrel ADV-01 añadido como `export * from './observability.js'` |

## FUTURE_LANGFUSE — Trazabilidad IA real

Archivo: `observability/aiObservability.js` → `createLangfuseTraceStub()`

Estado actual: stub devuelve `{ sent: false, reason: 'LANGFUSE_NOT_CONFIGURED' }`.

Para activar:
1. Configurar `LANGFUSE_PUBLIC_KEY` y `LANGFUSE_SECRET_KEY` en `.env`
2. Reemplazar el cuerpo de `createLangfuseTraceStub()` con la llamada real a `langfuse.trace()`
3. `langfuseTraceId` en `aiEvent` pasará a tener valor real

## FUTURE_DASHBOARD — UI de observabilidad

Archivo: `observability/dashboardModel.js` → `buildDashboardModel()`

El modelo de datos está definido y testeado. Pendiente:
- Crear componente React `<ObservabilityDashboard model={dashboardModel} />`
- Conectar al store para polling en tiempo real
- Añadir a la ruta `/agency/observability` del panel de agencia

## FUTURE_SUPABASE — Store persistente

Archivo: `observability/observabilityStore.js`

Estado actual: adaptador `MEMORY` (in-memory, sin persistencia entre reinicios).

Para activar:
1. Crear `observability/adapters/supabaseObservabilityAdapter.js`
2. Implementar la misma interfaz: `writeEvent()`, `queryEvents()`, `queryByCorrelationId()`
3. Pasar `adapter: 'SUPABASE'` en la config del store
4. El aislamiento de cliente (`assertClientScope`) ya está en la capa de store — el adapter solo maneja persistencia

## FUTURE_CP04 — Integración con Club Pádel 04

Cuando se active la observabilidad en CP04 (proyecto separado):
- CP04 puede llamar a `createObservabilityEvent()` con `environment: ENV.PRODUCTION`
- Los eventos se enrutan por `clientId: 'CP04'`
- El aislamiento multi-tenant impide que la agencia acceda a eventos CP04 sin permiso explícito
- No requiere cambios en ADV-01 — es un cliente más del store

## FUTURE_TRADING — Integración con Trading Bot

Similar a CP04. El bot puede emitir eventos de tipo `EVENT_TYPE.SYSTEM` o crear un `EVENT_TYPE` custom.
Guardrail activo: `BOT_TRADING_NO_TOUCH=SI` — ninguna modificación en el bot hasta autorización explícita.

## Cómo añadir un nuevo adaptador de alerta

```js
// observability/alertEngine.js → createAlertChannelAdapter()
const telegramAdapter = createAlertChannelAdapter(ALERT_CHANNEL.TELEGRAM, {
  enabled: true,
});

// Implementar dispatch() en el objeto retornado:
telegramAdapter.dispatch = async (alert) => {
  await sendTelegramMessage(TELEGRAM_BOT_TOKEN, CHAT_ID, formatAlert(alert));
  return { sent: true, channel: 'TELEGRAM' };
};
```
