# AGENCY_API_SECURITY — Paso G

**Gate de Seguridad para APIs y Cloudflare Workers**

`auditApiSecurity(checks)` valida 12 controles conceptuales de seguridad para cualquier API.

---

## Checks (12)

| ID | Control | Crítico |
|---|---|---|
| API-01 | Autenticación requerida en todos los endpoints | ✅ |
| API-02 | Autorización por rol/permiso en recursos protegidos | ✅ |
| API-03 | Rate limiting activo en endpoints públicos | No |
| API-04 | Validación de inputs antes de procesamiento | ✅ |
| API-05 | Filtrado de outputs (sin campos sensibles) | No |
| API-06 | CORS policy correcta (solo orígenes esperados) | ✅ |
| API-07 | Restricción de métodos HTTP por endpoint | No |
| API-08 | Mensajes de error sanitizados (sin detalles internos) | ✅ |
| API-09 | Idempotencia en operaciones de escritura | No |
| API-10 | Verificación de firma en webhooks entrantes | ✅ |
| API-11 | API keys/tokens nunca en el cuerpo de respuesta | ✅ |
| API-12 | Principio de mínimo privilegio en API keys | No |

---

## Uso

```js
import { auditApiSecurity } from '../deploy/apiSecurityGate.js';

const checks = {
  'API-01': true,   // autenticación ✅
  'API-02': true,   // autorización ✅
  'API-03': 'N/A',  // rate limiting no aplica en este endpoint
  'API-06': true,
  // ...
};

const r = auditApiSecurity(checks);
// r.status        → 'PASS' | 'WARNING' | 'FAIL'
// r.criticalFailed → número de controles críticos fallados
// r.score         → 0-100
```

---

## Valores Aceptados por Check

- `true` — Control implementado y verificado
- `false` — Control fallido (bloqueante si es crítico)
- `'N/A'` / `'NOT_APPLICABLE'` — No aplica a este endpoint (no penaliza)

---

## Aplicación en Cloudflare Workers

En el Worker de CP04-estilo, verificar especialmente:
- API-01: `Authorization: Bearer <supabase-jwt>` validado
- API-06: CORS con `allowedOrigins` explícito
- API-10: Webhook con `X-Make-Signature` verificada

> Auditoría conceptual. Requiere validación manual en endpoints reales.
