# Club Pádel 04 · Auditoría 24 · Plan de ejecución deploy real

## Objetivo

Definir el orden exacto para ejecutar el despliegue real controlado de Club Pádel 04.

## Estado actual

- Frontend estable.
- Build correcto.
- Worker preparado.
- Supabase Auth preparado.
- Checklist E2E creado.
- Plan de pruebas reales creado.
- Credenciales reales pendientes.
- Deploy real pendiente.

---

## Fase 1 · Confirmar dominio y URLs

Confirmar:

- URL Cloudflare Pages actual.
- URL Worker real.
- Dominio final si existe.
- URL Supabase.
- URL pública de la app.

Valores esperados inicialmente:

- Frontend: https://club-padel-04.pages.dev
- Worker: URL real de Cloudflare Worker
- Local: http://localhost:5173

---

## Fase 2 · Configurar Cloudflare Pages

Configurar:

- Proyecto: club-padel-04.
- Build command: npm run build.
- Output directory: dist.

Variables públicas permitidas:

- VITE_CP04_PUBLIC_AUTH_MODE=production
- VITE_CP04_PUBLIC_SITE_URL=https://club-padel-04.pages.dev
- VITE_CP04_PUBLIC_BOOKING_ENDPOINT=/api/reservas

No añadir tokens privados en Pages.

---

## Fase 3 · Configurar Cloudflare Worker

Worker:

- cp04-reservas-proxy.

Configurar variables/secrets privados:

- MAKE_RESERVAS_WEBHOOK
- AIRTABLE_TOKEN
- AIRTABLE_BASE_ID
- AIRTABLE_TABLE_ID
- AIRTABLE_RESERVAS_TABLE
- SUPABASE_URL
- SUPABASE_ANON_KEY
- APP_PUBLIC_URL

Configurar CORS:

- ALLOWED_ORIGIN=https://club-padel-04.pages.dev

Cuando haya dominio final:

- ALLOWED_ORIGIN=https://TU-DOMINIO-FINAL.com

---

## Fase 4 · Configurar Supabase

Configurar:

- Proyecto Supabase real.
- Auth email/password.
- Site URL.
- Redirect URLs.
- Usuario real de prueba.
- Recuperación de contraseña.

Redirect URLs iniciales:

- https://club-padel-04.pages.dev
- https://club-padel-04.pages.dev/
- https://club-padel-04.pages.dev/auth/callback
- http://localhost:5173
- http://localhost:5173/

---

## Fase 5 · Deploy Worker

Ejecutar desde:

cd ~/cp04-landings/app/worker-reservas

Comando conceptual:

npx wrangler deploy

Validar:

- Worker responde.
- CORS correcto.
- OPTIONS correcto.
- Auth fallback o real correcto.
- Reservas/disponibilidad correcto.

---

## Fase 6 · Deploy frontend

Ejecutar desde:

cd ~/cp04-landings/app

Build:

npm run build

Deploy manual recomendado:

- Subir dist a Cloudflare Pages.

Deploy terminal si procede:

npx wrangler pages deploy dist --project-name=club-padel-04

---

## Fase 7 · Pruebas E2E reales

Ejecutar pruebas:

- Home.
- Sidebar.
- Roles.
- Auth.
- Reservas.
- Disponibilidad.
- Alta jugador.
- Admin.
- Soporte.
- Perfil.
- CORS.
- Seguridad.
- Logs.

---

## Fase 8 · Cierre preproducción

Cerrar solo si:

- Frontend funciona desplegado.
- Worker responde.
- Supabase Auth funciona o queda fallback documentado.
- Reservas/disponibilidad responden.
- No hay secretos expuestos.
- Checkpoint final creado.

## Estado

Plan de ejecución deploy real preparado.
