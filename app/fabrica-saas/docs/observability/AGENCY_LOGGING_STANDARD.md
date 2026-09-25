# Agency Logging Standard — ADV-01

Estándar de logging estructurado para todos los componentes de la agencia.

## Principios

1. **Todo evento es un ObservabilityEvent** — no `console.log` sueltos en producción.
2. **Redacción automática** — el `structuredLogger` aplica `redactSensitiveData()` antes de almacenar.
3. **Correlación obligatoria** — cada operación crea un `correlationId` y lo propaga.
4. **Severidad declarativa** — no se asigna `CRITICAL` manualmente; se usa `evaluateSeverity()`.

## Niveles de severidad

| Nivel | Uso |
|---|---|
| `DEBUG` | Flujo interno de desarrollo. Desactivado en producción. |
| `INFO` | Operaciones exitosas normales. |
| `WARNING` | Degradación recuperable (retry, fallback). |
| `ERROR` | Fallo en una operación concreta. Acción requerida si no recoverable. |
| `CRITICAL` | Pérdida de datos, brecha de seguridad, fallo de producción total. `humanActionRequired=true`. |

## Uso básico

```js
import { createLogger, LOG_ADAPTER_TYPE } from '../factory-registry/index.js';

const logger = createLogger({
  service: 'airtable-adapter',
  clientId: 'NEXO-VET-001',
  projectId: 'nexo-saas',
  adapter: LOG_ADAPTER_TYPE.CONSOLE, // o MEMORY en tests
});

logger.info('Record created', { recordId: 'rec123', table: 'Reservas' });
logger.error('Airtable write failed', { table: 'Reservas', errorCode: 422 });
```

## Campos obligatorios en createObservabilityEvent

```js
{
  clientId,     // identificador del cliente (tenant)
  projectId,    // identificador del proyecto SaaS
  environment,  // ENV.TEST | ENV.STAGING | ENV.PRODUCTION | ENV.LOCAL
  eventType,    // EVENT_TYPE.*
  severity,     // SEVERITY.*
  message,      // descripción legible por humanos
}
```

## Reglas de redacción

- Los valores de claves secretas (`authorization`, `token`, `apikey`, `password`, `secret`, etc.) se reemplazan por `[REDACTED]`.
- Los patrones de valor (JWT, `sk_live_*`, `sk_test_*`, tokens ≥32 chars) se redactan siempre.
- Los datos PII (`email`, `phone`, `address`, etc.) solo se redactan cuando `redactPII: true`.
- Los nombres de clave permanecen para auditoría; solo el valor se redacta.
