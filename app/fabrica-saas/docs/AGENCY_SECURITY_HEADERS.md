# AGENCY_SECURITY_HEADERS — Paso G

**Headers de Seguridad por Entorno**

`buildSecurityHeaders(environment, options)` genera el conjunto de headers recomendado.

---

## Headers por Entorno

| Header | PREVIEW | STAGING | PRODUCTION |
|---|---|---|---|
| Content-Security-Policy | Relajada (unsafe-inline/eval) | Estricta | Estricta |
| X-Content-Type-Options | nosniff | nosniff | nosniff |
| Referrer-Policy | no-referrer-when-downgrade | strict-origin | strict-origin-when-cross-origin |
| Permissions-Policy | camera, mic, geo off | camera, mic, geo off | camera, mic, geo off |
| X-Frame-Options | DENY | DENY | DENY |
| Cache-Control | no-cache, no-store | public, immutable | public, immutable |
| Strict-Transport-Security | ❌ | ✅ | ✅ (max-age=31536000) |
| X-Robots-Tag | index, follow | noindex | noindex (si no indexable) |

---

## Headers Mínimos Requeridos

`validateSecurityHeaders(headers)` verifica estos 4:
1. `Content-Security-Policy`
2. `X-Content-Type-Options`
3. `Referrer-Policy`
4. `X-Frame-Options`

---

## Uso

```js
import { buildSecurityHeaders, validateSecurityHeaders } from '../deploy/securityHeaders.js';

const result = buildSecurityHeaders('PRODUCTION', { httpsOnly: true });
// result.headers → objeto con los headers

const validation = validateSecurityHeaders(result.headers);
// validation.valid   → true si todos los requeridos presentes
// validation.missing → array de headers faltantes
```

---

## Integración con Cloudflare Pages

Los headers se configuran en `_headers` file o en Cloudflare Pages dashboard. Nunca hardcodeados en el worker excepto a través de `Response` headers.

> Headers son policy operacional. Validar contra tu CSP antes de aplicar en producción.
