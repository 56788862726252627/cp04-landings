# Club Pádel 04 · Plan de autenticación real y protección de roles

## Objetivo

Convertir el sistema actual de acceso demo/local en una arquitectura preparada para producción real, manteniendo el modo demo sin romper la app.

## Estado actual detectado

La app tiene actualmente:

- Login visual preparado.
- Selector de roles demo.
- Recuperación de contraseña visual preparada.
- Endpoints preparados a nivel frontend:
  - /api/auth/login
  - /api/auth/register
  - /api/auth/forgot-password
  - /api/auth/change-password
- Roles internos:
  - PLAYER
  - STAFF
  - ADMIN
  - SUPPORT
- Modo demo/local guardado en navegador:
  - cp04_auth_mode = universal_demo

## Riesgo actual si se publicara tal cual

- Admin, Staff y Support pueden estar protegidos visualmente, pero no necesariamente por backend real.
- Las contraseñas demo no deben usarse como seguridad real.
- Los permisos reales deben venir desde servidor/Worker, no desde el frontend.
- El frontend no debe decidir por sí solo si un usuario puede entrar a paneles sensibles.

## Arquitectura recomendada

### 1. Modo demo/local

Debe mantenerse para pruebas, venta y demostración.

Uso recomendado:

- localhost
- entorno privado
- demo comercial controlada
- sin datos reales
- sin pagos reales
- sin acciones irreversibles

### 2. Modo producción real

Debe usar backend/Worker.

Flujo recomendado:

1. Usuario introduce email y contraseña.
2. Frontend envía POST a /api/auth/login.
3. Backend valida credenciales.
4. Backend devuelve sesión/token y rol.
5. Frontend guarda sesión segura.
6. App renderiza módulos según rol recibido.
7. Admin/Staff/Support quedan bloqueados si el backend no autoriza.

## Roles

### PLAYER

Puede acceder a:

- Inicio
- Reservas
- Torneos
- Ranking
- Perfil

### STAFF

Puede acceder a:

- Inicio
- Reservas
- Alta jugador
- Reprogramar
- Cancelar
- Gestión
- Torneos
- Perfil

### ADMIN

Puede acceder a:

- Inicio
- Reservas
- Alta jugador
- Reprogramar
- Cancelar
- Gestión
- Torneos
- Ranking
- Admin
- Perfil

### SUPPORT

Puede acceder a:

- Inicio
- Reservas
- Alta jugador
- Reprogramar
- Cancelar
- Gestión
- Torneos
- Ranking
- Admin
- Flujos Make
- Soporte
- Perfil

## Secciones sensibles

Deben requerir autenticación real en producción:

- gestion
- admin
- flujos_make
- soporte
- datos internos
- integraciones
- logs
- configuración
- métricas privadas

## Endpoints recomendados

### POST /api/auth/login

Entrada:

- email
- password

Salida:

- ok
- user
- role
- token/session
- expiresAt

### POST /api/auth/register

Entrada:

- nombre
- apellidos
- email
- telefono
- password

Salida:

- ok
- user
- role inicial PLAYER

### POST /api/auth/forgot-password

Entrada:

- email

Salida:

- ok
- mensaje genérico sin revelar si el email existe

### POST /api/auth/change-password

Entrada:

- currentPassword
- newPassword
- confirmPassword

Salida:

- ok

### GET /api/auth/me

Entrada:

- sesión/token

Salida:

- ok
- user
- role
- permissions

### POST /api/auth/logout

Salida:

- ok

## Reglas de seguridad

- Nunca guardar secretos en frontend.
- Nunca guardar API keys reales en VITE_.
- Nunca confiar en el rol elegido visualmente por el usuario.
- Admin/Staff/Support deben validarse en backend.
- Recuperar contraseña no debe revelar si el email existe.
- Tokens deben expirar.
- Logs técnicos no deben mostrar secretos.
- CORS debe limitarse al dominio final.

## Estrategia de implementación segura

### Fase 20A

Documentar arquitectura y estado actual.

### Fase 20B

Añadir constantes seguras de modo auth:

- demo
- production
- backend_ready
- protected_sections

### Fase 20C

Crear helper de permisos frontend sin sustituir backend:

- canAccessSection(role, section)
- isProtectedSection(section)
- getSafeStartSection(role)

### Fase 20D

Preparar AuthStatusPanel visible para soporte/admin.

### Fase 20E

Preparar integración futura con /api/auth/me y /api/auth/login.

### Fase 20F

Checkpoint final.

## Pendiente para producción pública

- Elegir proveedor de auth real.
- Configurar base de usuarios.
- Configurar emails de recuperación.
- Configurar sesiones.
- Configurar secrets en Cloudflare Worker.
- Probar login real.
- Probar roles reales.
- Bloquear rutas sensibles desde backend.
