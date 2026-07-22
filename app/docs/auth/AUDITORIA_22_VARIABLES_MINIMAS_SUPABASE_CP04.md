# Auditoría 22 · Variables mínimas Supabase Auth · Club Pádel 04

## Hallazgo confirmado

El Worker ya contiene lógica preparada para activar Supabase Auth real.

La función de activación es:

```js
function cp04SupabaseConfigured(env) {
  return Boolean(env && env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
}
## Variables mínimas obligatorias

Para que el Worker deje de responder en modo `backend_stub`, necesita como mínimo:

- SUPABASE_URL
- SUPABASE_ANON_KEY

## Variables no exigidas todavía por la activación actual

En la lógica revisada no son necesarias para pasar de `backend_stub` a Supabase real:

- SUPABASE_SERVICE_ROLE
- AUTH_PROVIDER
- SESSION_SECRET
- JWT_VERIFICATION_KEY
- EMAIL_PROVIDER_TOKEN

Estas variables pueden añadirse en una fase posterior si se implementan sesiones avanzadas, verificación JWT propia, roles avanzados o email provider externo.

## Rutas afectadas

- GET /api/auth/me
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/forgot-password
- POST /api/auth/change-password
- POST /api/auth/logout

## Regla de seguridad

No escribir `SUPABASE_URL` ni `SUPABASE_ANON_KEY` en archivos del proyecto.

Deben añadirse solo con:

npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY

## Estado

Auditoría 22 al 45%.

La siguiente fase será decidir si se conecta Supabase real o si se deja preparada sin credenciales.
