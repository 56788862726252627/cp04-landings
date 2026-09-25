# Club Pádel 04 · Auditoría 36 · Guía Cloudflare Pages sin ejecutar

## Auditoría 36

35%

## Avance real estimado del proyecto completo

89.8%

## Objetivo

Dejar preparada la guía exacta de publicación en Cloudflare Pages sin publicar todavía.

## Configuración recomendada Cloudflare Pages

- Project name: club-padel-04
- Framework preset: Vite
- Build command: npm run build
- Build output directory: dist
- Root directory: app, solo si Cloudflare apunta al repositorio completo cp04-landings
- Node version recomendada: 20 o superior
- Production branch: main, solo cuando se confirme que el repo está limpio
- Preview deploy: recomendado antes de producción
- Deploy automático: mantener controlado al principio

## Variables públicas permitidas

Solo variables VITE_ no sensibles.

Ejemplos permitidos:

- VITE_CP04_PUBLIC_BOOKING_ENDPOINT
- VITE_CP04_PUBLIC_APP_ENV
- VITE_CP04_PUBLIC_SUPPORT_EMAIL

## Variables prohibidas en Pages

No poner en Pages:

- Tokens de OpenAI
- Tokens de Airtable
- Webhooks privados de Make
- Claves privadas de Stripe
- Secrets de calendario
- JWT_SECRET
- Refresh tokens
- Access tokens privados

## Estado

Guía preparada sin publicar.

## Riesgo

Bajo.
