import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { TenantConfigProvider } from './tenant-runtime/TenantConfigProvider.jsx'
import { TenantStatusGate } from './tenant-runtime/TenantStatusGate.jsx'
import { resolveRuntimeTenant } from './tenant-runtime/resolveRuntimeTenant.js'
import { loadBrowserRuntimeConfig } from './tenant-runtime/loadBrowserRuntimeConfig.js'

// Resolución de tenant + carga de config: síncrona y en build time (JSON
// estático importado por loadBrowserRuntimeConfig.js, cero red/disco en
// runtime) — por eso no hace falta un estado de carga ("loading"): el
// resolvedConfig ya está listo antes del primer render. fallbackTenantId
// "cp04" es una configuración EXPLÍCITA de este punto de entrada (no un
// valor inventado por el resolver): esta build sirve Club Pádel 04, así que
// cualquier hostname que no matchee el tenant-registry (localhost, previews
// de Cloudflare Pages) cae en el único tenant real y activo hoy, en vez de
// mostrar "dominio desconocido" a un usuario legítimo. Un hostname que SÍ
// matchee un tenant disabled/maintenance en el registry conserva su estado
// real vía resolvedVia:"domain" — el fallback nunca lo encubre.
const { resolvedConfig, validation, registry } = loadBrowserRuntimeConfig()
if (!validation.valid) {
  console.error('resolvedConfig inválido, ver validateResolvedConfig:', validation.errors)
}

// registry trae cp04 (active, tenant real y único desplegado hoy) más 3
// tenants fixture (staging/disabled/maintenance) reservados para QA de esos
// 3 estados — ver config/tenant-registry.example.valid.json. Si el hostname
// real algún día apunta a uno de ellos, resolveRuntimeTenant respeta su
// estado real vía resolvedVia:"domain"; el fallback de abajo solo entra en
// juego cuando el hostname no matchea NINGÚN tenant del registry.
const tenantStatus = resolveRuntimeTenant(
  window.location.hostname,
  registry,
  { fallbackTenantId: resolvedConfig.tenantId }
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TenantConfigProvider resolvedConfig={resolvedConfig} tenantStatus={tenantStatus}>
      <TenantStatusGate tenantStatus={tenantStatus}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TenantStatusGate>
    </TenantConfigProvider>
  </StrictMode>,
)

// Solo en build de producción: en `vite dev` un service worker puede
// cachear módulos y romper el hot-reload de todo el equipo.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          window.dispatchEvent(new CustomEvent('cp04:sw-update-available', { detail: { registration } }))
        }
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              window.dispatchEvent(new CustomEvent('cp04:sw-update-available', { detail: { registration } }))
            }
          })
        })
      })
      .catch(() => {})
  })

  let refreshingAfterUpdate = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshingAfterUpdate) return
    refreshingAfterUpdate = true
    window.location.reload()
  })
}
