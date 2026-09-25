# AGENCY_DEPENDENCY_SECURITY — Paso G

**Auditoría de Seguridad de Dependencias**

`auditDependencies(deps, options)` evalúa el estado de seguridad de las dependencias del proyecto.

---

## Estados por Dependencia

| Estado | Descripción | Acción |
|---|---|---|
| `OK` | Sin vulnerabilidades conocidas | Continuar |
| `UPGRADE_NEEDED` | Versión desactualizada pero segura | Actualizar en próximo ciclo |
| `CRITICAL_CVE` | CVE crítico conocido | **Actualizar antes de deploy** |
| `HIGH_CVE` | CVE alto conocido | Actualizar pronto |
| `EOL` | Dependencia sin soporte activo | Planificar migración |
| `UNKNOWN` | Sin información disponible | Investigar manualmente |
| `SCAN_NEEDED` | No se ha ejecutado el scan | Ejecutar `npm audit` |

---

## Procedimiento de Auditoría

```bash
# 1. Ejecutar npm audit
npm audit --json > audit-output.json

# 2. Parsear resultados y mapear a estados del sistema
# 3. Invocar auditDependencies() con los resultados
```

```js
import { auditDependencies } from '../deploy/dependencySecurity.js';

const deps = [
  { name: 'express', version: '4.19.2', status: 'OK' },
  { name: 'lodash',  version: '4.17.4', status: 'CRITICAL_CVE', cve: 'CVE-2019-1' },
];

const r = auditDependencies(deps);
// r.status   → estado general
// r.critical → número de dependencias críticas
// r.results  → detalle por dependencia
```

---

## Política de la Agencia

- **CRITICAL_CVE**: bloquea deploy. Actualizar **antes** del PR.
- **HIGH_CVE**: debe resolverse en el sprint activo.
- **EOL**: plan de migración en máximo 2 ciclos de mantenimiento.
- **npm audit 0 critical**: condición para production checklist.

---

## Herramientas Recomendadas

- `npm audit` — audit básico incluido en npm
- `snyk` — análisis más completo con remediation advice
- Cloudflare Pages build log — detecta vulnerabilidades en tiempo de build

> Auditoría declarativa. Ejecutar `npm audit` real antes de producción.
