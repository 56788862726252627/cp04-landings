# Club Pádel 04 · Auditoría 25 · Comandos Cloudflare reales modo seguro

## Objetivo

Preparar comandos reales para Cloudflare Pages y Cloudflare Worker sin ejecutar acciones irreversibles ni exponer credenciales.

---

## 1 · Comprobar login de Cloudflare

Desde terminal:

npx wrangler whoami

Resultado esperado:

- Cuenta Cloudflare correcta.
- Usuario autenticado.

Si no está autenticado:

npx wrangler login

---

## 2 · Build frontend

Desde:

~/cp04-landings/app

Comando:

npm run build

Resultado esperado:

- dist/index.html
- dist/assets/*.css
- dist/assets/*.js

---

## 3 · Deploy frontend Cloudflare Pages

Solo ejecutar cuando se confirme el proyecto real.

Comando conceptual:

npx wrangler pages deploy dist --project-name=club-padel-04

Antes de ejecutar:

- Confirmar cuenta Cloudflare.
- Confirmar proyecto Pages.
- Confirmar variables públicas VITE_.
- Confirmar que dist no contiene secrets.

---

## 4 · Worker Cloudflare

Desde:

~/cp04-landings/app/worker-reservas

Comprobaciones:

npx wrangler whoami
npx wrangler deploy --dry-run

Deploy real solo cuando esté confirmado:

npx wrangler deploy

---

## 5 · Secrets Worker

Introducir manualmente, uno a uno.

Reservas / Airtable:

npx wrangler secret put MAKE_RESERVAS_WEBHOOK
npx wrangler secret put AIRTABLE_TOKEN
npx wrangler secret put AIRTABLE_BASE_ID
npx wrangler secret put AIRTABLE_TABLE_ID
npx wrangler secret put AIRTABLE_RESERVAS_TABLE

Supabase Auth:

npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put APP_PUBLIC_URL

Futuros:

npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put EMAIL_PROVIDER_TOKEN
npx wrangler secret put WHATSAPP_ACCESS_TOKEN
npx wrangler secret put SESSION_SECRET
npx wrangler secret put JWT_VERIFICATION_KEY

---

## 6 · Variables públicas Cloudflare Pages

Configurar en dashboard de Cloudflare Pages:

VITE_CP04_PUBLIC_AUTH_MODE=production
VITE_CP04_PUBLIC_SITE_URL=https://club-padel-04.pages.dev
VITE_CP04_PUBLIC_BOOKING_ENDPOINT=/api/reservas

No meter secretos privados.

---

## 7 · CORS Worker

En wrangler.toml:

ALLOWED_ORIGIN=https://club-padel-04.pages.dev

Cuando exista dominio final:

ALLOWED_ORIGIN=https://TU-DOMINIO-FINAL.com

---

## 8 · Pruebas Worker después de deploy

Sustituir URL-WORKER por la URL real:

curl -i https://URL-WORKER/api/disponibilidad
curl -i https://URL-WORKER/api/reservas
curl -i https://URL-WORKER/api/auth/me
curl -i -X OPTIONS https://URL-WORKER/api/auth/login

Login real:

curl -i -X POST https://URL-WORKER/api/auth/login -H "Content-Type: application/json" -d '{"email":"usuario@ejemplo.com","password":"PASSWORD"}'

---

## 9 · Pruebas Pages después de deploy

Abrir:

https://club-padel-04.pages.dev

Validar:

- Home.
- Sidebar.
- Roles.
- Reservas.
- Soporte.
- Perfil.
- Admin/Staff/Support protegidos.
- Consola del navegador sin errores críticos.
- Sin secretos visibles.

---

## 10 · Regla final

No ejecutar deploy real hasta confirmar:

- Cuenta Cloudflare correcta.
- Proyecto Pages correcto.
- Worker correcto.
- Supabase real configurado.
- Secrets reales listos.
- Dominio o URL pública confirmada.
- CORS correcto.
