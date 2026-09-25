# AGENCY_CLOUDFLARE_DEPLOY — Paso G

**Perfil Declarativo de Deploy en Cloudflare Pages / Workers**

`createCloudflareProfile(params)` genera un perfil reutilizable sin autenticación real.

---

## Presets de Build (CF_BUILD_PRESETS)

| Preset | Build Command | Output Dir |
|---|---|---|
| `VITE_REACT` | `npm run build` | `dist` |
| `VITE_VANILLA` | `npm run build` | `dist` |
| `NEXT_JS` | `npm run build` | `.next` |
| `ASTRO` | `npm run build` | `dist` |
| `STATIC` | _(sin comando)_ | `public` |
| `CUSTOM` | _(definido por proyecto)_ | _(definido)_ |

---

## Crear Perfil

```js
import { createCloudflareProfile, CF_BUILD_PRESETS } from '../deploy/cloudflareProfile.js';

const { profile } = createCloudflareProfile({
  projectName:      'clinica-nexo',
  accountId:        'ACC-PLACEHOLDER',   // nunca el account ID real en código
  buildPreset:      CF_BUILD_PRESETS.VITE_REACT,
  productionBranch: 'main',
  customDomain:     'app.clinicanexo.es',  // opcional
});
```

---

## Generar wrangler.toml (Workers)

```js
import { generateWranglerConfig } from '../deploy/cloudflareProfile.js';

const { config } = generateWranglerConfig(profile);
// config → string con wrangler.toml listo para guardar
// ⚠️ Reemplazar valores placeholder con los reales
// ⚠️ NUNCA incluir secretos reales en wrangler.toml
```

---

## Seguridad

El perfil siempre incluye:
```
securityNotes: [
  'Never commit API tokens — use Cloudflare dashboard environment variables',
  'Use Pages secrets for sensitive runtime values',
  'API_TOKEN and ACCOUNT_ID must be set as CI/CD secrets, not in source',
]
```

---

## Variables de Entorno en Cloudflare Pages

| Variable | Configurar en |
|---|---|
| `VITE_SUPABASE_URL` | Pages → Settings → Environment variables |
| `VITE_SUPABASE_ANON_KEY` | Pages → Settings → Environment variables |
| `AIRTABLE_TOKEN` | Pages → Settings → Secrets (si Worker) |
| `MAKE_WEBHOOK_URL` | Pages → Settings → Secrets (si Worker) |

**NUNCA en `.env` committeado. NUNCA en wrangler.toml. NUNCA en código.**

---

## Deploy Manual (hasta automatizar CI)

```bash
# 1. Build local
npm run build

# 2. Deploy a Cloudflare Pages (requiere wrangler autenticado)
npx wrangler pages deploy dist --project-name clinica-nexo

# 3. Verificar URL de preview en output
# 4. Ejecutar health checks
```

> NO_REAL_DEPLOY · Perfil es documentación declarativa. Credenciales NUNCA en código.
