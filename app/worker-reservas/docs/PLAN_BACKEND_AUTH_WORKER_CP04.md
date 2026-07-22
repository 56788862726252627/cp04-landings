# Club Pádel 04 · Auditoría 21 · Backend real de autenticación en Cloudflare Worker

## Objetivo

Preparar un backend real de autenticación para Club Pádel 04 sin romper el modo demo/local ni el flujo actual de reservas.

La autenticación real debe vivir en backend/Worker, no en el frontend.

## Estado actual

Actualmente la app usa un modo demo/local:

- cp04_role
- cp04_auth_mode
- cp04_user_email
- selectedRole en frontend
- permisos frontend preparados en Auditoría 20

Esto sirve para demo, pero no para producción real.

## Decisión recomendada

Usar el Worker existente `worker-reservas` como backend principal en esta fase inicial.

Motivos:

- Ya existe Worker.
- Ya hay estructura de rutas.
- Ya se está usando para reservas/disponibilidad.
- Permite centralizar `/api/reservas`, `/api/disponibilidad` y `/api/auth`.
- Evita duplicar configuración Cloudflare en una fase temprana.

Más adelante, si el proyecto crece, se puede separar en:

- worker-reservas
- worker-auth
- worker-notificaciones
- worker-pagos

## Endpoints Auth necesarios

### POST /api/auth/login

Entrada esperada:

- email
- password

Salida esperada:

- ok
- user
- role
- sessionToken
- expiresAt

### GET /api/auth/me

Entrada esperada:

- Authorization Bearer token o cookie segura

Salida esperada:

- ok
- user
- role
- permissions

### POST /api/auth/logout

Entrada esperada:

- token/session actual

Salida esperada:

- ok

### POST /api/auth/register

Entrada esperada:

- nombre
- apellidos
- email
- telefono
- password

Salida esperada:

- ok
- user creado con rol PLAYER por defecto

### POST /api/auth/forgot-password

Entrada esperada:

- email

Salida esperada:

- ok
- mensaje genérico

Regla:
Nunca revelar si el email existe o no.

### POST /api/auth/change-password

Entrada esperada:

- currentPassword
- newPassword
- confirmPassword

Salida esperada:

- ok

## Roles backend

Roles oficiales:

- PLAYER
- STAFF
- ADMIN
- SUPPORT

## Permisos backend recomendados

PLAYER:

- inicio
- reservas
- torneos
- ranking
- perfil

STAFF:

- inicio
- reservas
- alta_jugador
- reprogramar
- cancelar
- gestion
- torneos
- perfil

ADMIN:

- inicio
- reservas
- alta_jugador
- reprogramar
- cancelar
- gestion
- torneos
- ranking
- admin
- perfil

SUPPORT:

- inicio
- reservas
- alta_jugador
- reprogramar
- cancelar
- gestion
- torneos
- ranking
- admin
- flujos_make
- soporte
- perfil

## Almacenamiento de usuarios

Opciones posibles:

### Opción A · Airtable como base inicial de usuarios

Ventajas:

- Rápida.
- Compatible con el ecosistema actual.
- Buena para preproducción/demo avanzada.

Desventajas:

- No es ideal para contraseñas si no se diseña bien.
- Hay que evitar almacenar contraseñas en claro.
- Hay que guardar hashes, no passwords reales.

### Opción B · Cloudflare D1

Ventajas:

- Más cercano a producción.
- Mejor para usuarios/sesiones.
- Integración Cloudflare.

Desventajas:

- Requiere migraciones.
- Añade configuración nueva.

### Opción C · Supabase Auth / Clerk / Auth0

Ventajas:

- Auth real profesional.
- Recuperación de contraseña incluida.
- Sesiones seguras.

Desventajas:

- Otro proveedor.
- Integración adicional.
- Puede tener coste según uso.

## Recomendación para esta fase

Para Auditoría 21:

- No implementar todavía autenticación definitiva de pago.
- Preparar rutas reales de auth en Worker.
- Preparar respuestas seguras.
- Mantener demo local.
- No guardar passwords reales todavía si no hay proveedor elegido.
- Dejar lista la estructura para conectar proveedor después.

## Secrets requeridos en Cloudflare Worker

Posibles secrets futuros:

- AUTH_PROVIDER
- AUTH_ISSUER_URL
- AUTH_AUDIENCE
- AUTH_CLIENT_ID
- AUTH_CLIENT_SECRET
- SESSION_SECRET
- JWT_VERIFICATION_KEY
- PASSWORD_RESET_SECRET
- EMAIL_PROVIDER_TOKEN
- APP_PUBLIC_URL

Regla:
Ninguno debe estar en frontend ni en variables VITE_ privadas.

## Variables públicas permitidas

Solo valores no sensibles:

- VITE_CP04_PUBLIC_AUTH_MODE
- VITE_CP04_PUBLIC_SITE_URL
- VITE_CP04_PUBLIC_BOOKING_ENDPOINT

## Seguridad mínima

- CORS limitado al dominio final.
- No exponer secrets.
- No devolver passwords.
- No revelar si un email existe en forgot-password.
- Tokens con expiración.
- Roles decididos por backend.
- Logs sin datos sensibles.
- Admin/Staff/Support protegidos desde backend.

## Implementación recomendada por pasos

### 21A

Crear documentación backend auth.

### 21B

Revisar Worker activo y rutas existentes.

### 21C

Añadir helpers de respuesta segura:

- jsonResponse
- corsHeaders
- readJson
- safeUser
- rolePermissions

### 21D

Añadir rutas stub seguras:

- /api/auth/login
- /api/auth/me
- /api/auth/logout
- /api/auth/register
- /api/auth/forgot-password
- /api/auth/change-password

### 21E

Validar que las rutas responden sin romper reservas.

### 21F

Conectar frontend de forma controlada solo cuando las rutas existan.

### 21G

Checkpoint final.

## Estado objetivo de Auditoría 21

Al cerrar Auditoría 21, el proyecto debe quedar con:

- Worker preparado para auth.
- Endpoints auth presentes.
- Respuestas seguras.
- Sin secrets en frontend.
- Reservas sin romper.
- Modo demo local intacto.
- Documentación actualizada.
