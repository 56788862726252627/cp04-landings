# Agency CI Security — ADV-02

## Secret Scan

Detecta secretos antes de que entren en el repositorio.

### Patrones detectados

| Tipo | Riesgo | Patrón |
|---|---|---|
| `STRIPE_LIVE_KEY` | CRITICAL | `sk_live_[A-Za-z0-9]{20,}` |
| `STRIPE_WEBHOOK` | CRITICAL | `whsec_[A-Za-z0-9]{20,}` |
| `PRIVATE_KEY` | CRITICAL | `-----BEGIN PRIVATE KEY-----` |
| `STRIPE_TEST_KEY` | HIGH | `sk_test_[A-Za-z0-9]{20,}` |
| `JWT` | HIGH | `eyJ...header.payload.signature` |
| `BEARER_TOKEN` | HIGH | `Bearer [token ≥32 chars]` |
| `API_KEY` | MEDIUM | `api_key: value` |
| `PASSWORD_LITERAL` | MEDIUM | `password: "value"` |

### Reglas de supresión

- Los archivos de test suprimen `MEDIUM` y `LOW` (no `CRITICAL`).
- Las extensiones `.md`, `.json`, `.lock`, `.png` se excluyen del scan.

### Salida (nunca imprime valores reales)

```js
{
  file:            'src/config.js',
  line:            5,
  type:            'STRIPE_LIVE_KEY',
  risk:            'CRITICAL',
  redactedPreview: 'sk_liv...[REDACTED:STRIPE_LIVE_KEY]',
  isTestFile:      false,
}
```

## Dependency Security

Integra con `npm audit`. Sin upgrades automáticos.

| CVE Level | Gate resultado |
|---|---|
| Critical | DEPENDENCY_GATE FAIL |
| High | DEPENDENCY_GATE WARNING |
| Moderate | PASS (logged) |

## GitHub Push Protection

El repositorio tiene GitHub Secret Scanning activo. Las `sk_live_` son bloqueadas en el push. Solución: usar `sk_test_` en tests y env vars en producción.
