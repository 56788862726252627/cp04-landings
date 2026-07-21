# Club Pádel 04 · Auditoría 35 · Guía Cloudflare Pages sin deploy

## Estado

Preparación de Cloudflare Pages realizada sin publicar.

## Auditoría 35

35%

## Avance real estimado del proyecto completo

88.0%

## Configuración recomendada para Cloudflare Pages

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: carpeta `app` si el repositorio contiene más carpetas
- Node version: usar versión moderna compatible con Vite

## Variables públicas permitidas

Solo deben exponerse variables con prefijo:

- `VITE_`

## Variables privadas prohibidas en frontend

No deben estar en Pages como variables públicas:

- Tokens Make
- Tokens Airtable
- OpenAI API keys
- Stripe Secret Key
- Supabase Service Role
- JWT secrets
- Webhooks privados
- Passwords
- Refresh tokens
- Private keys

## Worker

Las operaciones sensibles deben pasar por Worker/backend, no por frontend directo.

## Estado de publicación

No publicar todavía.

## Siguiente validación

Revisar Worker + wrangler + secrets reales antes de deploy.

## Riesgo

Bajo.
