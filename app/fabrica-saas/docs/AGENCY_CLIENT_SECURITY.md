# AGENCY_CLIENT_SECURITY — Paso G

**Auditoría de Seguridad Client-Side**

`auditClientSecurity(files)` escanea el código frontend por vulnerabilidades comunes.

---

## Checks (10)

| ID | Check | Crítico | Riesgo |
|---|---|---|---|
| CS-01 | No `innerHTML` con input usuario | Sí | XSS |
| CS-02 | Links `_blank` con `rel="noopener noreferrer"` | No | Tabnapping |
| CS-03 | Sin secretos en localStorage | Sí | Exposición de credenciales |
| CS-04 | Sin secretos en query strings | Sí | Leakage en logs/historial |
| CS-05 | Sin `console.log` de datos sensibles | No | Leakage en DevTools |
| CS-06 | Sin flags de debug en producción | No | Información innecesaria |
| CS-07 | Sin referencias a `localhost` | Sí | Config de dev en producción |
| CS-08 | Sin endpoints HTTP (solo HTTPS) | Sí | Man-in-the-middle |
| CS-09 | Sin source maps en producción | No | Exposición de código fuente |
| CS-10 | Sin datos sensibles en sessionStorage | No | Exposición en sesión |

---

## Uso

```js
import { auditClientCode, auditClientSecurity } from '../deploy/clientSecurityAudit.js';

// Archivo individual
const r = auditClientCode(sourceCode, 'src/App.jsx');
// r.findings → número (count)
// r.critical → hallazgos críticos
// r.details  → array con detalles

// Múltiples archivos
const r = auditClientSecurity(files);
// r.critical, r.warnings, r.fileResults
```

---

## Vulnerabilidades Más Frecuentes en SaaS Generadas

1. **Token de sesión en localStorage** — Mover a httpOnly cookie via Worker
2. **Referencia a localhost en fetch** — Punto ciego durante desarrollo, fácil de olvidar
3. **innerHTML sin sanitización** — En componentes de preview de contenido

> Auditoría declarativa de patrones. No reemplaza un pentest profesional.
