# Club Pádel 04 · Auditoría 23 · Informe preproducción Cloudflare + Supabase

## Estado

Auditoría 23 preparada para preproducción real.

## Completado

- Check inicial de preproducción.
- Revisión limpia de secrets y dist.
- Checklist deploy Cloudflare + Supabase.
- Comandos de deploy y secrets documentados.
- Matriz de variables producción/preproducción creada.
- Build frontend correcto.
- Worker presente.
- Wrangler presente.
- Supabase Auth preparado desde Auditoría 22.
- Fallback seguro backend_stub validado.
- No se han expuesto credenciales reales.

## Cloudflare Pages

Frontend preparado para despliegue estático desde:

- dist

Comando de build:

- npm run build

Proyecto recomendado:

- club-padel-04

## Cloudflare Worker

Worker preparado:

- cp04-reservas-proxy

Archivos:

- worker-reservas/src/index.js
- worker-reservas/wrangler.toml

## Variables públicas permitidas

Solo variables VITE_ públicas:

- VITE_CP04_PUBLIC_AUTH_MODE
- VITE_CP04_PUBLIC_SITE_URL
- VITE_CP04_PUBLIC_BOOKING_ENDPOINT
- VITE_CP04_PUBLIC_CONTACT_EMAIL
- VITE_CP04_PUBLIC_CONTACT_PHONE
- VITE_CP04_PUBLIC_SEO_AREA
- VITE_CP04_PUBLIC_GALLERY_PISTAS
- VITE_CP04_PUBLIC_GALLERY_RECEPCION
- VITE_CP04_PUBLIC_GALLERY_CAFETERIA
- VITE_CP04_PUBLIC_GALLERY_TORNEOS
- VITE_CP04_PUBLIC_GALLERY_INSTALACIONES

## Secrets privados Worker

Deben ir solo en Cloudflare Worker:

- MAKE_RESERVAS_WEBHOOK
- AIRTABLE_TOKEN
- AIRTABLE_BASE_ID
- AIRTABLE_TABLE_ID
- AIRTABLE_RESERVAS_TABLE
- SUPABASE_URL
- SUPABASE_ANON_KEY
- APP_PUBLIC_URL

## Prohibido en frontend

No incluir en src, dist ni variables VITE_:

- SUPABASE_SERVICE_ROLE_KEY
- SESSION_SECRET
- JWT_VERIFICATION_KEY
- AUTH_CLIENT_SECRET
- EMAIL_PROVIDER_TOKEN
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- MAKE_RESERVAS_WEBHOOK
- AIRTABLE_TOKEN
- WHATSAPP_ACCESS_TOKEN

## Pendiente antes de deploy real

- Confirmar dominio final.
- Crear/configurar Supabase real.
- Configurar Cloudflare Worker secrets reales.
- Configurar Cloudflare Pages variables públicas.
- Desplegar Worker.
- Desplegar frontend.
- Probar Auth real.
- Probar reservas reales.
- Probar disponibilidad real.
- Proteger Admin/Staff/Support con backend real.
- Optimizar dist/galería pesada.
- Configurar Stripe si se activa pago real.
- Configurar WhatsApp si se activa como canal.

## Estado recomendado

Proyecto preparado para preproducción controlada.

No recomendado todavía para producción pública completa hasta completar secrets reales, dominio, auth real y pruebas end-to-end.
