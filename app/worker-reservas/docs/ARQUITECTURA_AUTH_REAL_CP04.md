# Club Pádel 04 · Arquitectura objetivo de autenticación y autorización real

Este documento extiende `PLAN_BACKEND_AUTH_WORKER_CP04.md` (Auditoría 21) y `AUTH_CONTRACT_CP04.md`
con el diseño concreto de la fase actual: autenticación real verificable en servidor,
RBAC server-side y preparación multi-tenant, sin activar todavía secretos reales ni
los gates de rutas mutables (`CP04_ENFORCE_ROLE_GATES`).

No sustituye esos documentos: los completa con el nivel de detalle que exige pasar
de "endpoints preparados" a "arquitectura verificable lista para conectar".

## 1. Arquitectura objetivo

```
Frontend React/Vite
  → AuthContext/AuthProvider (a crear; hoy el estado de auth vive disperso en
    App.jsx como useState + localStorage)
  → Supabase Auth (login/registro/refresh/recuperación)
  → access_token (JWT) guardado solo en memoria/Context, nunca como única
    fuente de autoridad
  → Worker (worker-reservas)
      → parseAuthorizationHeader(request)
      → verifySupabaseIdentity(token, env)   [round-trip real a Supabase]
      → resolveRole(app_metadata.role)        [nunca user_metadata.role]
      → clubId / organizationId (app_metadata, cuando exista multi-tenant)
      → authorizeRole / authorizeScope
      → handler de negocio (Airtable hoy, Supabase/D1 mañana)
```

La pieza que falta para que este diagrama sea real hoy es el `AuthContext` en
frontend (todavía no existe: el estado de sesión vive como `useState` sueltos
en `ClubPadel04SaaSApp`). Se diseña en §8 como parte de la migración, no se
crea en esta fase para no arriesgar el componente monolítico sin necesidad.

## 2. Modelo de identidad

Modelo mínimo de usuario (autoritativo en Supabase Auth + `app_metadata`,
nunca en el frontend):

| Campo | Fuente | Editable por el usuario |
|---|---|---|
| `user_id` | Supabase Auth (`id`) | No |
| `email` | Supabase Auth | Solo con reverificación de email |
| `role` | `app_metadata.role` | **No** (solo backend/service_role) |
| `club_id` | `app_metadata.club_id` | **No** |
| `organization_id` | `app_metadata.organization_id` | **No** |
| `status` | `app_metadata.status` (`active`/`suspended`/`pending`) | **No** |
| `created_at` / `updated_at` | Supabase Auth | No |

Todo lo que hoy vive en `user_metadata` (nombre, teléfono, bio, avatar...) es
correcto que el usuario lo edite: es información de perfil, no de
autorización. La línea que no se cruza nunca es: **nada que determine
permisos puede vivir en algo que el usuario puede escribir.**

## 3. Modelo RBAC

Fuente única ya implementada en `worker-reservas/auth/authorization.js`:

| Rol | Permisos |
|---|---|
| PLAYER | inicio, reservas, torneos, ranking, perfil |
| STAFF | + alta_jugador, reprogramar, cancelar, gestion |
| ADMIN | + ranking, admin |
| SUPPORT | + flujos_make, soporte (acceso técnico transversal) |

Regla de asignación seguirá el mismo principio ya aplicado en
`cp04MapSupabaseUserToCp04`: **solo `app_metadata.role` es de confianza.**

### Opción A vs. Opción B para asignar el rol

**A. `role` en `app_metadata`, administrado solo por service_role.**
- Ventajas: cero tablas nuevas, ya está implementado (`cp04MapSupabaseUserToCp04`,
  `verifySupabaseIdentity`), el JWT ya lo lleva, no necesita una consulta extra
  por request.
- Desventajas: cambiar el rol de un usuario requiere una llamada admin API
  (`service_role`) y el usuario debe volver a loguearse (o refrescar token)
  para que el nuevo rol se refleje en el JWT.

**B. Tabla `profiles`/`user_roles` con RLS, leída server-side.**
- Ventajas: cambios de rol inmediatos sin esperar a un nuevo token; más fácil
  de auditar (historial de cambios de rol en una tabla); natural para guardar
  `club_id`/`organization_id` cuando haya más de un club real.
- Desventajas: una tabla y una query más por request (o cachear con TTL);
  quien la lea debe ser exclusivamente el Worker con una clave de servicio,
  nunca RLS abierto al `anon key` para escritura de rol.

### Recomendación

**Opción A para lanzar** (ya construida, cero infraestructura nueva) **+
migrar a Opción B en cuanto exista más de un club real**, porque en ese
momento el argumento de "tabla auditable con `club_id`" pesa más que la
simplicidad de A. No son excluyentes: se puede seguir firmando `role` en el
JWT vía `app_metadata` pero sincronizado desde una tabla `user_roles` que sea
la fuente administrativa (un trigger/función de Supabase copia el cambio a
`app_metadata` cuando un admin lo edita). Eso da lo mejor de ambas sin tener
que reescribir `verifySupabaseIdentity`.

## 4. Modelo multi-tenant

Club Pádel 04 es hoy **mono-club**: no existe todavía ningún dato con
`club_id` en Airtable. El diseño se deja listo para no tener que romper el
contrato del Worker cuando se añada el segundo club, pero **no se fuerza**
antes de tiempo.

Reglas ya codificadas en `authorizeScope(auth, resource)`
(`worker-reservas/auth/authorization.js`):

- PLAYER: solo sus propios datos (comparación por `userId`/email propio, no
  por rol — ver §7 GET /api/reservas, ya implementado).
- STAFF/ADMIN: solo el `club_id` de su `app_metadata`. Un STAFF **sin**
  `club_id` asignado no tiene acceso "a todos los clubes por defecto": eso
  sería fail-open. `authorizeScope` deniega explícitamente ese caso (probado
  en `authorization.test.mjs`).
- SUPPORT: acceso técnico transversal (igual que hoy en `CP04_AUTH_PERMISSIONS`),
  pero cada acceso debe quedar en el log de seguridad (§13) por ser la
  excepción más sensible.
- Ninguna ruta puede recibir `club_id` del frontend y confiar en él: el único
  `club_id` válido es el que sale de `authenticateRequest` (del token
  verificado), nunca de un parámetro de query o campo del body.

`authorizeScope` está implementado y probado, pero **no está todavía
conectado a ninguna ruta de negocio**, porque hoy ningún registro de Airtable
tiene `club_id`. Conectarlo antes de que exista el dato sería seguridad de
attrezzo (comprobar un campo que siempre es `null`). Se activa en cuanto el
modelo de datos real lo incluya.

## 5. Flujo login / logout / refresh

Ya implementado en `handleAuthRoute` (fail-closed si Supabase no está
configurado, vía `cp04AuthNotConfiguredResponse`):

- **Login**: `POST /api/auth/login` → Supabase `grant_type=password` →
  devuelve `access_token`/`refresh_token`, rol desde `app_metadata` (nunca
  `user_metadata`).
- **Logout**: `POST /api/auth/logout` → Supabase `/auth/v1/logout`. **Nuevo en
  esta fase**: acepta `{ "scope": "global" }` en el body para cerrar *todas*
  las sesiones del usuario (todos los dispositivos), no solo la actual.
  Por defecto `scope=local` (solo esta sesión), igual que antes.
- **Refresh**: **nuevo en esta fase**, `POST /api/auth/refresh` → Supabase
  `grant_type=refresh_token`. No existía ningún endpoint de refresh hasta
  ahora; sin él, un access_token expirado obligaba a re-login completo.
- **Expiración**: el JWT de Supabase lleva `exp`; `verifySupabaseIdentity` ya
  lo expone como `tokenExpiresAt` en el contrato de `authenticateRequest`. El
  frontend (cuando exista `AuthContext`) debe programar el refresh antes de
  `tokenExpiresAt`, no esperar a un 401.
- **Email verification**: la gestiona Supabase de forma nativa en el signup
  (`/auth/v1/signup`, ya usado por `/api/auth/register`); pendiente solo de
  configurar la plantilla de email y `APP_PUBLIC_URL` cuando Supabase esté
  activo — no requiere código nuevo en el Worker.

## 6. Flujo de recuperación/cambio de contraseña

Ya implementado:
- `POST /api/auth/forgot-password` → Supabase `/auth/v1/recover`, respuesta
  siempre neutra (no revela si el email existe), tal y como exige el
  principio anti-enumeration ya documentado en la Fase 6 del prompt maestro
  original.
- `POST /api/auth/change-password` → Supabase `/auth/v1/user` (PUT),
  requiere Bearer token válido.

Pendiente de diseño (no de código): tras un cambio de contraseña o un
`forgot-password` completado, Supabase invalida por defecto las demás
sesiones activas del usuario si se usa `scope=global` en el logout asociado;
recomendado documentar esto en el flujo de UI cuando exista `AuthContext`,
pero no requiere cambios en el Worker.

## 7. Matriz de rutas

| Método | Ruta | Auth requerida | Roles permitidos | Scope de datos | Riesgo | Rate limiting | Auditoría/logging |
|---|---|---|---|---|---|---|---|
| GET | `/api/disponibilidad` | Ninguna (pública) | — | Ninguno (sin PII, solo slots ocupados) | Bajo | Sí, pendiente (IP-based, Cloudflare) | Log estándar (sin PII) |
| POST | `/api/reservas` (`crear_reserva`) | Ver §11 (decisión) | Ver §11 | El propio solicitante | Medio (abuso de reservas fantasma) | Sí, crítico (por IP + por email) | Log + `security_event` si supera umbral |
| POST | `/api/reservas` (`cancelar_reserva`) | **Sí**, gate ya escrito (flag apagado) | STAFF, ADMIN, SUPPORT | El club del STAFF (futuro); hoy global | Alto (cancelar reservas ajenas) | Sí | Log con `security_event=RESERVA_CANCELADA` |
| POST | `/api/reservas` (`reprogramar_reserva`) | **Sí**, gate ya escrito (flag apagado) | STAFF, ADMIN, SUPPORT | Igual que cancelar | Alto | Sí | Igual que cancelar |
| GET | `/api/reservas` (listado por email) | **Sí, ya activo** | Cualquiera autenticado (self) / STAFF+ADMIN+SUPPORT (cualquier email) | Propio email o, si STAFF+, cualquiera | Alto si no se protege (PII + `clave_reserva`) — **ya mitigado** | Sí, recomendado | Log con `security_event=LISTADO_RESERVAS_TERCERO` cuando lo use STAFF+ sobre un email ajeno |
| POST | `/api/jugadores/alta` | **Sí**, gate ya escrito (flag apagado) | STAFF, ADMIN, SUPPORT | Crea un jugador nuevo (no hay "propio" que comparar) | Medio-alto (alta masiva de spam) | Sí | Log estándar |
| `/api/auth/*` | login/register/refresh/logout/forgot/change | Según endpoint (login/register/forgot son públicos por naturaleza; me/logout/change-password/refresh requieren token o refresh_token) | N/A (son quienes emiten la identidad) | El propio usuario | Alto si falla (es la puerta de entrada) | **Sí, crítico** (login y forgot-password son los objetivos típicos de fuerza bruta / enumeration) | Log de intentos fallidos con `security_event=AUTH_FAILED`, nunca con la contraseña |

## 8. Estrategia de migración: demo → auth real

**Etapa 1 — hoy.** El login demo (contraseña de rol) sigue funcionando, pero
debe quedar **explícitamente marcado como solo-desarrollo** (no se toca en
esta fase para no romper el tutorial; se marca en la etapa 3 abajo).

**Etapa 2.** Supabase Auth disponible en paralelo, sin reemplazar nada:
- Configurar `SUPABASE_URL`/`SUPABASE_ANON_KEY` como secrets del Worker
  (fuera de esta fase, requiere credenciales reales).
- El "login universal" (`handleUniversalLogin` en `App.jsx`) ya apunta a
  `/api/auth/login`: en cuanto Supabase esté configurado, empieza a funcionar
  sin cambios de código adicionales en el frontend.
- Extraer el estado de auth disperso en `App.jsx` a un `AuthContext` real
  (`src/auth/AuthContext.jsx`, `src/auth/authService.js`) que centralice
  login/logout/refresh/rol — hoy son `useState` sueltos + `localStorage`
  directo, lo que dificulta razonar sobre el ciclo de vida del token.

**Etapa 3.** Usuarios reales usan login real; el login demo por contraseña
se restringe a `import.meta.env.DEV` (solo `npm run dev`, nunca en el build
de producción) — esto es lo mínimo para que "demo" dejar de significar
"agujero de autenticación en producción" sin retirar el tutorial.

**Etapa 4.** Rutas mutables (`alta_jugador`, `cancelar_reserva`,
`reprogramar_reserva`) empiezan a exigir el token real emitido en la Etapa 2,
verificado por `requireRoles` (ya implementado, solo falta que existan
usuarios STAFF/ADMIN/SUPPORT reales con `app_metadata.role` asignado por
service_role).

**Etapa 5.** `CP04_ENFORCE_ROLE_GATES=true`. En este punto el tutorial
guiado para STAFF/ADMIN/SUPPORT debe re-grabarse usando cuentas reales, no
las contraseñas de rol.

**Etapa 6.** Se elimina definitivamente `roleConfig`/`confirmRoleAccess` del
frontend (login demo por contraseña) y todo lo asociado en
`CP04_AUTH_MODES.DEMO`.

Esta fase actual deja preparadas las Etapas 2 (refresh, logout global) y 4
(gates ya escritos), sin activar 3, 5 ni 6.

## 9-13. Rate limiting, logging de seguridad, y multi-tenant

Cubiertos como parte de la matriz de rutas (§7) y el modelo multi-tenant
(§4). Diseño de rate limiting recomendado (requiere Cloudflare, no se
implementa aquí):

| Endpoint | Límite sugerido | Clave |
|---|---|---|
| `POST /api/auth/login` | 5 intentos / 15 min | IP + email normalizado |
| `POST /api/auth/forgot-password` | 3 / hora | IP + email |
| `POST /api/reservas` (crear) | 10 / hora | IP; 3 / hora por email |
| `GET /api/disponibilidad` | 60 / min | IP |
| `POST /api/jugadores/alta` | 5 / hora | IP |
| `POST /api/reservas` (cancelar/reprogramar) | 20 / hora | IP + `userId` cuando exista sesión |

Esquema de log de seguridad recomendado (sin PII sensible — nunca email en
claro en logs persistentes, nunca contraseñas ni tokens):

```json
{
  "timestamp": "2026-07-05T10:00:00Z",
  "request_id": "uuid-v4",
  "user_id_hash": "sha256(userId)",
  "role": "STAFF",
  "club_id": null,
  "route": "/api/reservas",
  "action": "cancelar_reserva",
  "result": "denied",
  "status_code": 403,
  "latency_ms": 42,
  "security_event": "INSUFFICIENT_ROLE"
}
```

No se implementa el logger en esta fase (requiere decidir destino: Cloudflare
Logpush, Analytics Engine u otro — configuración externa).

## 11. Decisión: `crear_reserva`

**Opciones analizadas:**
- A. Guest checkout público con anti-abuso (rate limiting + validación
  estricta de payload, que ya existe).
- B. Autenticado obligatorio.
- C. Ambos modos (autenticado da beneficios extra: historial, cancelación
  propia sin depender de guardar la `clave_reserva`).

**Recomendación: A ahora, camino claro hacia C.**

Justificación comercial: Club Pádel 04 compite con Playtomic y similares,
donde reducir fricción en la reserva es una ventaja competitiva medible —
exigir cuenta para reservar una pista es la razón número uno de abandono en
este tipo de producto. Justificación técnica: hoy la validación de payload
(`validatePayload`) ya es estricta, y la reserva se confirma vía Make (no
escribe Airtable directamente desde el Worker), lo que limita el radio de
daño de un guest-checkout abusado. La mitigación real que falta no es
"exigir login", es **rate limiting** (pendiente, Cloudflare) — eso es lo que
hay que priorizar, no cerrar la puerta de entrada del negocio.

Camino a C: cuando exista `AuthContext` (Etapa 2 de la migración), un usuario
logueado que reserva puede asociar automáticamente la reserva a su `user_id`
(ganando "mis reservas" sin depender de la `clave_reserva` como único
capability token), mientras que un visitante no logueado sigue pudiendo
reservar como invitado. No es una decisión binaria: es aditiva.
