# Agency Error Model — ADV-01

Modelo unificado de errores para todos los adaptadores y servicios.

## Categorías de error (15)

| Categoría | Recuperable | Ejemplos |
|---|---|---|
| `VALIDATION` | No | Campo requerido vacío, formato incorrecto |
| `AUTHENTICATION` | No | Token expirado, credenciales inválidas |
| `AUTHORIZATION` | No | Rol insuficiente, RBAC denegado |
| `NETWORK` | **Sí** | ECONNREFUSED, ENOTFOUND |
| `TIMEOUT` | **Sí** | ETIMEDOUT, deadline superado |
| `RATE_LIMIT` | **Sí** | 429, quota excedida |
| `DATABASE` | No | Relación inexistente, query fallida |
| `AUTOMATION` | No | Escenario Make fallido |
| `AI_PROVIDER` | **Sí** | 529 overloaded, context window |
| `EXTERNAL_API` | **Sí** | Airtable/Stripe/WhatsApp no disponibles |
| `BUILD` | No | Error de compilación Vite |
| `DEPLOY` | No | Health check fallido en deploy |
| `RUNTIME` | No | TypeError, ReferenceError |
| `SECURITY` | No | CSRF, XSS, injection detectado |
| `UNKNOWN` | No | No clasificado |

## Uso básico

```js
import { normalizeError, toUserMessage } from '../factory-registry/index.js';

try {
  await externalCall();
} catch (rawError) {
  const normalized = normalizeError(rawError, {
    clientId: 'NEXO-VET-001',
    projectId: 'nexo-saas',
    correlationId: ctx.correlationId,
    service: 'airtable',
    component: 'records-write',
  });

  // Para logs internos:
  logger.error(normalized.message, { errorCategory: normalized.errorCategory });

  // Para el usuario final (en español, sin internals):
  return { error: toUserMessage(normalized) };
}
```

## Campos de salida

```js
{
  valid: true,
  errorCode,        // código HTTP o código de error nativo
  errorCategory,    // ERROR_CATEGORY.*
  message,          // mensaje original (sin stack)
  name,             // nombre de la clase de error
  httpStatus,       // 4xx/5xx si detectado
  recoverable,      // boolean
  retryable,        // boolean (igual a recoverable)
  humanActionRequired, // true para SECURITY y DEPLOY no recuperables
  context: { clientId, projectId, correlationId, operationId, service, component }
}
```

## Regla: nunca exponer stack trace al usuario

`normalizeError()` no incluye `stack` en el resultado. El stack se descarta (o se loguea internamente en `dev` si el logger está configurado para ello).
