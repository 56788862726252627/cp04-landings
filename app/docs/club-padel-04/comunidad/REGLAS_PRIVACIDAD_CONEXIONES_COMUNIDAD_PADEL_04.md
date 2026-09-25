# Reglas de privacidad de conexiones — Amigos y seguidores (Comunidad Pádel 04)

**Estado:** documento de reglas de negocio y privacidad. Sin código, sin Supabase real.
**Fecha:** 2026-07-14
**Depende de:** `AMIGOS_SEGUIDORES_CONEXIONES_COMUNIDAD_PADEL_04.md`, `FLUJOS_UI_AMIGOS_SEGUIDORES_COMUNIDAD_PADEL_04.md`, `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md`.

---

## Reglas de visibilidad

La lista de amigos de un jugador nunca es pública por defecto — visible solo a él mismo y, si lo permite explícitamente, a sus propios amigos (nunca a todo el club sin acción explícita, dado que revela relaciones de terceros, no solo datos propios). El hecho de "ser amigos" entre dos personas concretas solo es visible si ambas lo permiten en su configuración — ni siquiera se infiere indirectamente mostrando "amigos en común" sin que ambos amigos en común tengan visibilidad suficiente.

## Reglas de solicitud de amistad

Una solicitud solo puede enviarse a un jugador del mismo `club_id`, con `social_layer_opt_in` activo, sin bloqueo mutuo. Una solicitud pendiente es visible únicamente a las dos partes implicadas. Tras un rechazo, se permite un nuevo intento (no es un bloqueo permanente), sujeto al límite operativo de solicitudes pendientes simultáneas (ver reglas antiabuso).

## Reglas de seguidores

**Fase 2.** Seguir a alguien solo es posible si su `visibility_level ≥ club` — un perfil `private` o `friends` no puede ser seguido por alguien que no sea ya su amigo (evita que "seguir" se use como vía para eludir la privacidad configurada). El contador de seguidores puede ser público; la lista detallada de quién sigue a quién, solo visible al propio usuario.

## Reglas de conexiones sugeridas

**Fase 2.** Solo incluye jugadores del mismo club, con `social_layer_opt_in` activo, excluyendo: ya-amigos, solicitudes pendientes en cualquier dirección, y usuarios bloqueados (en cualquier dirección). No usa geolocalización, no usa datos de fuera del club, no usa ningún dato que el propio jugador sugerido no haya hecho ya visible al club (nivel, pertenencia al club, amigos en común con visibilidad suficiente).

## Reglas de bloqueo

Bloquear deshace de forma inmediata cualquier `Friendship(status=accepted/pending)` y `Follow` existente entre las partes, en ambas direcciones (regla de negocio nueva propuesta en este documento, ver checklist para confirmación con producto). Tras un bloqueo, ninguna nueva solicitud, seguimiento o invitación puede crearse entre las partes mientras el bloqueo esté activo, con doble barrera (no aparecer en listados + validación al crear).

## Reglas de reportes

Mismo flujo ya diseñado en el Prompt E: sin gate de consentimiento, reportante siempre anónimo frente al reportado, revisión humana obligatoria antes de cualquier acción. Reportar a un jugador desde "Amigos" no es distinto de reportarlo desde su perfil — mismo `Report(target_type=user)`, sin duplicar lógica.

## Reglas antiabuso

- Límite operativo (no numérico fijo en este documento) de solicitudes de amistad pendientes enviadas simultáneamente por un mismo usuario, para prevenir spam de solicitudes.
- Ningún límite técnico al número de veces que se puede reintentar tras un rechazo — se confía en el reporte y el bloqueo como mecanismo de defensa, no en fricción técnica que podría penalizar reintentos legítimos (p. ej. la persona rechazó por error).
- "Ocultar sugerencia" (flujo 12) no cuenta como señal negativa hacia el sugerido — es una preferencia unilateral del que oculta, no debe usarse para penalizar la visibilidad del sugerido en futuras sugerencias a otros usuarios.

## Reglas de notificación

`Notification(notification_type=friend_request)` solo para: nueva solicitud recibida, solicitud aceptada. Un rechazo **no** genera notificación intrusiva al remitente — se refleja solo si consulta activamente el estado de sus solicitudes enviadas (ya establecido en la sección 22 del documento funcional, decisión deliberada para reducir fricción social).

## Reglas de retención

`Friendship` se borra de forma inmediata (no soft delete) al eliminar la amistad — ya establecido en el modelo de datos (6.4). `Friendship.status=blocked` se conserva indefinidamente por prevención de acoso (mismo criterio ya establecido). `Follow` se borra de forma inmediata al dejar de seguir (6.5). Ninguna retención adicional se introduce en este documento.

## Reglas para STAFF/ADMIN

`STAFF`/`ADMIN` no tienen ningún permiso especial sobre relaciones de amistad/seguimiento ajenas más allá de la moderación ante un `Report` — no pueden ver la lista de amigos de un jugador salvo en el contexto directo de investigar un reporte, y no pueden crear ni deshacer relaciones en nombre de un usuario.

## Reglas para SUPPORT

Mismo criterio ya establecido en Prompts D y E: `SUPPORT` solo interviene si se le escala explícitamente (patrón de abuso cross-club vía solicitudes/seguimiento, o ausencia de STAFF/ADMIN activo) — nunca como vía operativa habitual para gestión de relaciones sociales.

## Reglas que NO deben automatizarse todavía

- **Sugerencias por IA/matching algorítmico avanzado** — las conexiones sugeridas (fase 2) usan solo un cálculo simple por club/nivel/amigos en común, sin aprendizaje automático ni scoring complejo.
- **Aceptación automática de solicitudes** — igual que en partidos abiertos, la decisión de aceptar una amistad es siempre humana.
- **Detección automática de patrones de acoso vía solicitudes repetidas** — se apoya en reporte humano, no en un sistema de detección automática en esta fase.
- **Cálculo automático de "amigos en común" sin respetar visibilidad individual** — cada amigo en común debe cumplir su propia configuración de visibilidad antes de mostrarse, nunca se fuerza la exposición por el simple hecho de ser un dato derivado.
