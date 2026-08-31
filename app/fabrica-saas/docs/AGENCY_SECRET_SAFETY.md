# AGENCY_SECRET_SAFETY — Paso G

**Gate de Seguridad: Detección de Secretos en Código**

`auditCodeForSecrets(code, filePath)` escanea cualquier archivo de código antes del deploy.

---

## Patrones Detectados (10)

| ID | Patrón | Risk | Acción |
|---|---|---|---|
| SP-01 | Bearer token | CRITICAL | Rotar token inmediatamente |
| SP-02 | API key genérica | HIGH | Identificar y rotar |
| SP-03 | OpenAI sk- key | CRITICAL | Revocar clave OpenAI |
| SP-04 | Stripe sk_live / sk_test | CRITICAL | Revocar clave Stripe |
| SP-05 | JWT Supabase | CRITICAL | Revocar service key |
| SP-06 | Make webhook URL | HIGH | Rotar webhook |
| SP-07 | Password assignment | HIGH | Eliminar y usar env var |
| SP-08 | Authorization header | HIGH | Mover a env var |
| SP-09 | PRIVATE KEY block | CRITICAL | Revocar clave privada |
| SP-10 | generic_secret= | MEDIUM | Revisar manualmente |

---

## Uso

```js
import { auditCodeForSecrets, auditSecretSafety } from '../deploy/secretSafetyGate.js';

// Un archivo
const r = auditCodeForSecrets(sourceCode, 'src/config.js');
// r.findings  → número de hallazgos
// r.critical  → hallazgos críticos
// r.details   → array con detalles (valores redactados)

// Múltiples archivos
const r = auditSecretSafety([
  { path: 'src/config.js', content: '...' },
  { path: 'src/api.js',    content: '...' },
]);
// r.totalFindings, r.critical, r.fileResults
```

---

## Redacción

Los valores detectados **nunca se almacenan en claro**. Solo se muestra:
- Primeros 4 caracteres + `[REDACTED]`
- Nombre del archivo y línea aproximada

---

## Reglas

1. Ningún secreto en código fuente — siempre variables de entorno del proveedor
2. `.env` nunca en git — usar `.env.example` con valores placeholder
3. CI/CD: secrets via GitHub Actions secrets o Cloudflare Pages env vars

> NO_REAL_SECRETS · Auditoría declarativa, no escáner de seguridad completo.
