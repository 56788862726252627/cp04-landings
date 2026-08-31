# AGENCY_DEPLOY_PLAN — Paso G

**Plan de Despliegue Paso a Paso**

`generateDeployPlan(target, options)` genera un plan estructurado y auditable.

---

## Estructura del Plan

```
deployPlan {
  planId
  target           → deployTarget configurado
  buildSteps[]     → pasos de preparación del build
  deploymentSteps[]→ pasos de deploy al proveedor
  verificationSteps[] → pasos de verificación post-deploy
  rollbackSteps[]  → pasos de rollback si algo falla
  postDeploySteps[]→ QA, health check, notificación al cliente
  requiredCredentials[] → { name, note: 'Set via env var — never hardcoded' }
}
```

---

## Principio de Seguridad

**Los valores de secretos NUNCA aparecen en el plan.** Solo los nombres:

```js
// ✅ Correcto
requiredCredentials: [
  { name: 'SUPABASE_SERVICE_KEY', note: 'Set via Cloudflare Pages env var' },
]

// ❌ NUNCA
requiredCredentials: [
  { name: 'SUPABASE_SERVICE_KEY', value: 'eyJhbGciOi...' }
]
```

---

## Pasos Build (ejemplo Vite React)

1. `npm ci` — instalar dependencias desde lockfile
2. `npm run build` — compilar con Vite
3. Verificar `dist/` existe y no está vacío
4. Verificar `dist/index.html` presente

## Pasos Deploy (Cloudflare Pages)

1. Verificar autenticación con Cloudflare (API token en env var)
2. `npx wrangler pages deploy dist --project-name <nombre>`
3. Esperar confirmación de deployment ID
4. Registrar URL de preview/production

## Pasos Verificación

1. Verificar URL retorna HTTP 200
2. Verificar `Content-Type: text/html`
3. Ejecutar health checks
4. Ejecutar post-deploy QA

---

## Uso

```js
import { generateDeployPlan } from '../deploy/deployPlan.js';

const plan = generateDeployPlan(deployTarget, {
  secrets: ['SUPABASE_SERVICE_KEY', 'AIRTABLE_TOKEN'],
  notes: 'Primera entrega al cliente',
});
```

> NO_REAL_DEPLOY · Plan documentación operacional, no ejecución automática.
