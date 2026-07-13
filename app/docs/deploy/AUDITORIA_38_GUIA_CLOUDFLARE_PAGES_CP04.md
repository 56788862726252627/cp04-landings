# Club Pádel 04 · Auditoría 38 · Guía Cloudflare Pages sin publicar producción

## Auditoría 38

50%

## Avance real estimado del proyecto completo

92.6%

## Configuración recomendada en Cloudflare Pages

- Framework preset: Vite
- Build command: npm run build
- Build output directory: dist
- Node version recomendada: 20
- SPA fallback: _redirects incluido en dist
- Carpeta validada localmente: dist

## Reglas de seguridad

- No introducir tokens privados en VITE_.
- No poner API keys secretas en el frontend.
- No activar pagos reales.
- No activar cancelaciones reales.
- No conectar dominio final todavía.
- No borrar checkpoints.
- No publicar como producción comercial hasta validación visual y funcional.

## Variables permitidas en frontend

Solo variables públicas tipo:

- VITE_CP04_PUBLIC_BOOKING_ENDPOINT
- VITE_CP04_APP_ENV
- VITE_CP04_PUBLIC_MODE

## Variables NO permitidas en frontend

- OPENAI_API_KEY
- STRIPE_SECRET
- AIRTABLE_API_KEY
- MAKE_WEBHOOK
- SUPABASE_SERVICE
- JWT_SECRET
- CLIENT_SECRET
- private_key
- refresh_token
- access_token

## Próximo paso

Auditoría 38 al 75%: crear paquete final de subida y checklist de Cloudflare Pages paso a paso.
