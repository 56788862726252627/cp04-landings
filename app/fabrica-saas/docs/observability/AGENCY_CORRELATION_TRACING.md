# Agency Correlation & Tracing — ADV-01

Cómo propagar contexto de correlación entre componentes.

## Identificadores

| Campo | Descripción |
|---|---|
| `correlationId` | Identifica una operación de negocio end-to-end (ej. "crear reserva"). Generado una vez, propagado a todos los eventos. |
| `traceId` | Identifica la traza distribuida completa (puede abarcar varios correlationIds). |
| `operationId` | Identifica la operación específica dentro del correlationId. |

## Ciclo de vida de un contexto

```js
import { createCorrelationContext } from '../factory-registry/index.js';

// 1. Crear contexto al inicio de la operación
const { context } = createCorrelationContext({
  operation: 'booking:create',
  clientId: 'NEXO-VET-001',
  projectId: 'nexo-saas',
  source: 'api',
});

// 2. Registrar span de componente
const span = context.startSpan('airtable-write', 'airtable');

// 3. Operar...
try {
  await airtable.createRecord(...);
  span.end(); // mide durationMs
  context.complete();
} catch (err) {
  span.fail(err.message);
  context.fail();
}

// 4. Extraer metadata para events
const meta = context.toMeta();
// { correlationId, traceId, operationId, operation, spans, durationMs, status }
```

## Contextos hijo

```js
const childCtx = context.child('airtable:batch-write');
// Hereda correlationId y traceId; genera nuevo operationId
```

## Propagación a eventos

```js
createObservabilityEvent({
  ...context.toMeta(), // correlationId, traceId propagados
  clientId: context.clientId,
  projectId: context.projectId,
  eventType: EVENT_TYPE.REQUEST,
  severity: SEVERITY.INFO,
  message: 'Airtable record created',
});
```
