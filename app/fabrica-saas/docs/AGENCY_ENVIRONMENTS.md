# AGENCY_ENVIRONMENTS — Paso G

**Modelo de Entornos para SaaS de Agencia**

Cada proyecto SaaS generado por la fábrica opera en 4 entornos progresivos.

---

## Entornos

| Entorno | Uso | Deploy Policy | Human Approval | Rollback |
|---|---|---|---|---|
| `LOCAL` | Desarrollo del agente | DEVELOPER_ONLY | No | No |
| `PREVIEW` | Review de PR / demo cliente | AUTO_ON_PR | No | No |
| `STAGING` | UAT / validación cliente | MANUAL_TRIGGER | Sí | Sí |
| `PRODUCTION` | App live del cliente | HUMAN_GATE_REQUIRED | **Siempre** | **Siempre** |

---

## Restricciones por Entorno

| Acción | LOCAL | PREVIEW | STAGING | PRODUCTION |
|---|---|---|---|---|
| Datos de producción | ❌ | ❌ | ❌ | ✅ |
| Secretos reales | ❌ | ❌ | ❌ | ✅ |
| Auto-deploy | ✅ | ✅ | ❌ | ❌ |
| Rollback | ❌ | ❌ | ✅ | ✅ |

---

## Datos Permitidos por Entorno

- **LOCAL**: `test`, `demo`, `fixture`, `seed`
- **PREVIEW**: `test`, `demo`, `fixture`, `anonymized`
- **STAGING**: `anonymized`, `representative_sample`
- **PRODUCTION**: `production_only`

---

## Regla de Oro

> PRODUCTION siempre requiere:
> 1. Human approval explícita (`human_approval: true`)
> 2. Rollback plan definido
> 3. Health verification post-deploy

> NO_REAL_DEPLOY en Paso G — Todos los deploys son DRY_RUN o PREVIEW declarativo.
