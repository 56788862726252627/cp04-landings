# Agency Observability Privacy — ADV-01

Cómo la capa de observabilidad protege datos sensibles y cumple con privacidad.

## Secretos — redacción automática

El `redactionEngine` intercepta los metadatos **antes** de que sean almacenados o logueados.

### Claves redactadas por nombre (valor reemplazado por `[REDACTED]`)

`authorization`, `bearer`, `token`, `apikey`, `api_key`, `secret`, `password`,
`cookie`, `session`, `webhook_secret`, `stripe_key`, `airtable_key`,
`supabase_key`, `openai_key`, `anthropic_key`, `whatsapp_token`

### Patrones de valor siempre redactados

- JWT: `eyJ...` (header.payload.signature)
- Stripe live key: `sk_live_*`
- Stripe test key: `sk_test_*`
- Webhook secret: `whsec_*`
- Token genérico: cualquier string ≥32 caracteres alfanuméricos

### Comportamiento

```js
import { redactSensitiveData } from '../factory-registry/index.js';

const safe = redactSensitiveData({
  userId: 'user-123',
  Authorization: 'Bearer sk_test_abc123xyz456verylongtoken',
  normal: 'visible',
});
// => { userId: 'user-123', Authorization: '[REDACTED]', normal: 'visible' }
```

## PII — redacción opcional

Los datos de identificación personal (`email`, `phone`, `address`, `birthdate`, `ssn`, `nif`, `creditcard`, `iban`) **no se redactan por defecto**. Solo cuando `redactPII: true`:

```js
redactSensitiveData(data, { redactPII: true });
```

Razón: los logs internos pueden necesitar email para diagnóstico; el dato PII se protege a nivel de acceso al store, no de logging.

## Aislamiento multi-tenant

Cada evento pertenece a un `clientId`. El `observabilityStore` bloquea el acceso cruzado:

```js
store.queryEvents({ clientId: 'CLIENT-B', callerClientId: 'CLIENT-A' });
// => throws { code: 'CLIENT_ISOLATION_VIOLATION' }
```

Solo `callerClientId: '*'` (superusuario) puede consultar eventos de cualquier cliente.

## Retención

| Severidad | Días |
|---|---|
| DEBUG | 3 |
| INFO | 30 |
| WARNING | 90 |
| ERROR | 180 |
| CRITICAL | 365 |
| SECURITY | 730 |
| AUDIT | 730 |

DEBUG desactivado en producción. La policy de retención se crea con `createRetentionPolicy({ env: ENV.PRODUCTION })`.

## IP anonymization

Los eventos de seguridad nunca almacenan IPs completas. El caller debe pasar la IP ya anonimizada (ej. `'10.0.0.xxx'`). El `securityObservability` no anonimiza — es responsabilidad del adaptador de red.
