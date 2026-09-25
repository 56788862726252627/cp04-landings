# Club Pádel 04 · Auditoría 22 · Supabase Auth real

## Objetivo

Preparar la integración real de autenticación usando Supabase Auth como proveedor externo, manteniendo el modo demo/stub si todavía no existen credenciales reales.

## Decisión técnica

Proveedor recomendado: Supabase Auth.

Motivos:

- Login real con email/contraseña.
- Registro real de usuarios.
- Recuperación de contraseña.
- Tokens/JWT de sesión.
- Base de usuarios gestionada.
- Buen encaje futuro con base de datos y roles.

## Principio de seguridad

El frontend no debe recibir credenciales privadas.

Variables públicas permitidas en frontend:

- VITE_CP04_PUBLIC_AUTH_MODE
- VITE_CP04_PUBLIC_SITE_URL
- VITE_CP04_PUBLIC_BOOKING_ENDPOINT

Variables privadas del Worker:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY, solo si fuese estrictamente necesario en fase posterior
- APP_PUBLIC_URL
- AUTH_PROVIDER
- SESSION_SECRET

## Endpoints objetivo

### POST /api/auth/login

Recibe:

- email
- password

Devuelve:

- ok
- user
- role
- access_token
- refresh_token
- expires_in

### GET /api/auth/me

Recibe:

- Authorization: Bearer access_token

Devuelve:

- ok
- user
- role
- permissions

### POST /api/auth/register

Recibe:

- nombre
- email
- password
- telefono opcional

Devuelve:

- ok
- user

Rol inicial recomendado:

- PLAYER

### POST /api/auth/forgot-password

Recibe:

- email

Devuelve siempre mensaje genérico:

- Si el correo existe, se enviarán instrucciones.

### POST /api/auth/logout

Recibe:

- Authorization Bearer token opcional

Devuelve:

- ok

## Modo fallback

Si faltan SUPABASE_URL o SUPABASE_ANON_KEY:

- El Worker debe mantener backend_stub.
- No debe fallar.
- No debe romper reservas.
- Debe responder AUTH_BACKEND_NOT_CONFIGURED.

## Fases Auditoría 22

### 22A

Crear plan Supabase Auth real.

### 22B

Añadir helpers Supabase al Worker.

### 22C

Adaptar /api/auth/login para usar Supabase si hay variables.

### 22D

Adaptar /api/auth/me para validar token real si hay variables.

### 22E

Adaptar /api/auth/register.

### 22F

Adaptar /api/auth/forgot-password.

### 22G

Test sin credenciales: debe seguir respondiendo stub seguro.

### 22H

Checkpoint final sin credenciales reales.

## Pendiente fuera de esta fase

- Crear proyecto Supabase real.
- Configurar URL pública del sitio.
- Configurar redirect URLs.
- Configurar plantillas de email.
- Definir tabla de perfiles/roles si se quiere separar rol de auth.users.
- Guardar credenciales reales como secrets de Cloudflare Worker.
