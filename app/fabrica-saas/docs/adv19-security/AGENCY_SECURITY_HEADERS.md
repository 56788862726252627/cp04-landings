# Agency Security Headers — ADV-19

## Evaluated Headers (8)

| Header | Critical | Purpose |
|--------|----------|---------|
| Content-Security-Policy | YES | XSS mitigation |
| Strict-Transport-Security | YES | Force HTTPS |
| X-Content-Type-Options | YES | MIME sniffing prevention |
| Referrer-Policy | no | Referrer control |
| Permissions-Policy | no | Feature policy |
| X-Frame-Options | no | Clickjacking |
| Cross-Origin-Opener-Policy | no | Cross-origin isolation |
| Cross-Origin-Resource-Policy | no | Resource isolation |

## CSP Builder

`ContentSecurityPolicyBuilder` generates safe-default CSP:
- `default-src 'self'`
- `script-src 'self'` (no `unsafe-eval` without justification)
- `object-src 'none'`
- `frame-src 'none'`

Directives can be extended per-vertical via `overrides`.

`unsafe-eval` only allowed with explicit `justification` string.

## Score

```
headers present / 8 headers total × 100
compliant = criticalMissing.length === 0
```
