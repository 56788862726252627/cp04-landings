# Club Padel 04 · Comandos Cloudflare Deploy y Secrets

## Objetivo

Preparar comandos seguros para desplegar:

- Frontend en Cloudflare Pages.
- Worker cp04-reservas-proxy.
- Secrets privados del Worker.

No ejecutar comandos con credenciales reales hasta confirmar proyecto, dominio y entorno.

## 1 · Build frontend

Desde:

~/cp04-landings/app

Comando:

npm run build

Salida esperada:

- dist/index.html
- dist/assets/*.css
- dist/assets/*.js

## 2 · Deploy frontend en Cloudflare Pages

Opción recomendada desde dashboard:

1. Entrar en Cloudflare.
2. Abrir Workers & Pages.
3. Abrir Pages.
4. Proyecto club-padel-04.
5. Subir carpeta dist o conectar repositorio.
6. Build command: npm run build.
7. Build output directory: dist.

Opción por terminal si Wrangler está operativo:

npx wrangler pages deploy dist --project-name=club-padel-04

## 3 · Worker reservas/auth

Ruta del Worker:

cd ~/cp04-landings/app/worker-reservas

Archivo principal:

src/index.js

Config:

wrangler.toml

Deploy conceptual:

npx wrangler deploy

## 4 · Secrets privados Worker

Estos se deben configurar en Cloudflare Worker, no en frontend.

Make / Airtable:

npx wrangler secret put MAKE_RESERVAS_WEBHOOK
npx wrangler secret put AIRTABLE_TOKEN

Supabase Auth:

npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put APP_PUBLIC_URL

Futuros:

npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put SESSION_SECRET
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put EMAIL_PROVIDER_TOKEN
npx wrangler secret put WHATSAPP_ACCESS_TOKEN

## 5 · Variables no secret en wrangler.toml

Permitidas si no son sensibles:

ALLOWED_ORIGIN=https://club-padel-04.pages.dev

Cuando exista dominio final:

ALLOWED_ORIGIN=https://TU-DOMINIO-FINAL.com

## 6 · Variables públicas frontend

En Cloudflare Pages solo variables públicas:

VITE_CP04_PUBLIC_AUTH_MODE=production
VITE_CP04_PUBLIC_SITE_URL=https://club-padel-04.pages.dev
VITE_CP04_PUBLIC_BOOKING_ENDPOINT=/api/reservas

No usar aquí:

- SUPABASE_SERVICE_ROLE_KEY
- SESSION_SECRET
- STRIPE_SECRET_KEY
- MAKE_RESERVAS_WEBHOOK
- AIRTABLE_TOKEN

## 7 · Pruebas post-deploy

Frontend:

- Abrir home.
- Probar sidebar.
- Probar roles.
- Probar reserva visual.
- Probar soporte.
- Probar perfil.

Worker:

curl -i https://URL-WORKER/api/auth/me
curl -i -X OPTIONS https://URL-WORKER/api/auth/login
curl -i https://URL-WORKER/api/disponibilidad

Auth real Supabase:

curl -i -X POST https://URL-WORKER/api/auth/login -H "Content-Type: application/json" -d '{"email":"usuario@ejemplo.com","password":"PASSWORD"}'

## 8 · Regla final

No desplegar producción pública hasta que:

- Supabase esté configurado.
- Worker tenga secrets reales.
- Admin/Staff/Support estén protegidos por backend real.
- CORS apunte al dominio correcto.
- Reservas/disponibilidad funcionen desde frontend desplegado.
