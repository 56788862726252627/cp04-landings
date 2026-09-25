# Modelo de datos social — Comunidad Pádel 04
### Prompt A ejecutado — Diseño de datos, sin backend real

**Estado:** documento de diseño técnico. Sin código, sin migraciones, sin conexión a Supabase real.
**Fecha:** 2026-07-14
**Rama:** `docs/comunidad-padel-modelo-datos-social-2026-07-14`
**Depende de:** `ROADMAP_COMUNIDAD_PADEL_04_PLAYTOMIC_VOLA.md`, `PROMPTS_IMPLEMENTACION_COMUNIDAD_PADEL_04.md`, `AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md` (mismo directorio, ya mergeados en `main`).
**Documentos hermanos:** `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md` (detalle campo a campo), `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` (reglas de acceso detalladas).

**Aviso:** este documento es diseño puro. Ninguna tabla, campo, índice o política descrita aquí ha sido creada en Supabase ni en ningún otro sistema real. No se ha ejecutado SQL. No se ha usado ningún dato personal real — todos los ejemplos son ficticios.

---

## 1. Resumen ejecutivo

Este documento diseña el modelo de datos de la capa social de Comunidad Pádel 04: 21 entidades que cubren perfil social, relaciones entre jugadores, partidos abiertos, feed/muro, grupos, retos, eventos, ranking social, notificaciones, moderación, consentimiento y auditoría. El diseño es multi-tenant desde el origen (aislado por club, reutilizando el concepto ya auditado en `tenant-runtime`, sin integrarlo todavía), con privacidad restrictiva por defecto y consentimiento granular por función, siguiendo el patrón validado en la auditoría de capturas (sección 14 de `AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md`). El MVP de datos recomendado cubre 7 módulos y 12 de las 21 entidades; el resto queda documentado para fases posteriores.

## 2. Objetivo del modelo de datos

Definir, antes de escribir una sola línea de backend, qué datos existirán, quién puede leerlos/escribirlos/borrarlos, cuánto tiempo se conservan y qué riesgo legal implica cada uno — para que la futura implementación (Prompt N en adelante, con autorización explícita) parta de un diseño ya auditado en vez de decisiones ad-hoc sobre la marcha.

## 3. Principios de diseño

1. **Aislamiento por club (tenant) en toda entidad social** — ninguna fila es visible entre clubes salvo que se diseñe explícitamente lo contrario (p. ej. un futuro ranking multi-club, no incluido en el MVP).
2. **Privacidad restrictiva por defecto** — todo campo visible a terceros nace en el nivel de visibilidad más bajo razonable; el usuario amplía, nunca al revés.
3. **Consentimiento como entidad de primera clase** (`PrivacyConsent`), no como columna booleana suelta — permite historial, revocación y auditoría.
4. **Separación cuenta vs. perfil social** — suspender la participación social de un jugador no debe tocar su cuenta de reservas ni viceversa.
5. **Nada de IDs opacos of terceros** — este modelo no depende de ningún identificador propietario de Playtomic/Vola ni de ningún sistema externo; usa UUID propios.
6. **Auditoría desde el diseño** (`AuditLog`), no añadida después.
7. **Reutilización, no reinvención** — se apoya conceptualmente en el `tenant-runtime` y en `authService` ya auditados (sin tocarlos ni integrarlos en esta fase); `UserProfile` referencia la identidad real solo mediante un `auth_user_id` opaco, nunca duplica credenciales.
8. **Reversibilidad** — toda entidad tiene una ruta de borrado o anonimización definida (sección 27), no solo de creación.

## 4. Alcance MVP

12 entidades activas: `UserProfile`, `PlayerSocialProfile`, `PlayerStats`, `Friendship`, `CommunityPost`, `Comment`, `Reaction`, `OpenMatch`, `MatchInvite`, `Notification`, `Report`, `PrivacyConsent`. Sin chat, sin geolocalización, sin grupos, sin retos, sin ranking social todavía (ver sección 21 para el detalle exacto de MVP de datos, que puede diferir ligeramente de los 7 módulos funcionales del roadmap por motivos de dependencia técnica — p. ej. `AuditLog` y `ModerationAction` se incluyen aunque no sean "módulo" visible, porque son prerequisito técnico de `Report`).

## 5. Alcance premium/futuro

9 entidades adicionales para fases 2-3: `Follow`, `ClubGroup`, `GroupMember`, `Challenge`, `Event`, `EventRegistration`, `SocialRanking`, `ModerationAction` (cola avanzada), `AuditLog` (retención extendida). Incluye también, como diseño conceptual no detallado en profundidad todavía, el soporte de datos para chat (Prompt K/L) y geolocalización opt-in (Prompt M).

---

## 6. Entidades principales

Convenciones: todo `id` es UUID v4. Todo timestamp es `timestamptz`. Toda entidad social lleva `club_id` (tenant) salvo que se indique lo contrario. `FK` = clave foránea. Roles: `PLAYER`, `STAFF`, `ADMIN`, `SUPPORT` (mismos roles ya existentes en la app real, no se crean roles nuevos).

### 6.1 UserProfile
**Propósito:** puente conceptual entre la identidad de autenticación real (no tocada por este diseño) y la capa social. No sustituye ni duplica `authService`.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `auth_user_id: text` (req, opaco — no es el token ni la contraseña), `display_name: text` (req), `role: enum[PLAYER,STAFF,ADMIN,SUPPORT]` (req), `created_at: timestamptz` (req), `deactivated_at: timestamptz` (opc).
**Visibilidad:** `display_name` público dentro del club; el resto interno.
**Crear:** sistema, en el momento del alta real (fuera de este diseño).
**Leer:** propio usuario; STAFF/ADMIN del mismo club; SUPPORT.
**Editar:** propio usuario (`display_name`); ADMIN (`role`, `deactivated_at`).
**Borrar:** no se borra — se desactiva (`deactivated_at`) para preservar integridad referencial de contenido histórico.
**Retención:** mientras la cuenta real exista; anonimización si el usuario ejerce derecho de supresión (ver sección 27).
**Riesgos RGPD:** bajo si `auth_user_id` es opaco y no reversible sin el sistema real.
**Notas:** en implementación futura, `auth_user_id` mapearía a la identidad ya gestionada por `authService`/Supabase auth — este diseño no decide esa integración todavía (Prompt N).

### 6.2 PlayerSocialProfile
**Propósito:** extensión social del perfil (nivel, bio, visibilidad) — capa nueva, no toca el perfil premium ya existente en producción.
**Campos:** `id: uuid` (req), `user_profile_id: uuid FK→UserProfile` (req), `club_id: uuid` (req), `level_declared: enum[iniciacion,intermedio,avanzado,profesional]` (req), `bio: text` (opc, máx. 280 car.), `avatar_url: text` (opc), `visibility_level: enum[private,friends,club]` (req, default `friends`), `visibility_matches_played: enum[private,friends,club]` (req, default `private`), `visibility_availability: enum[private,friends,club]` (req, default `private`), `created_at`, `updated_at`.
**Visibilidad:** por campo, según los `visibility_*` — patrón validado en la auditoría (sección 14, toggles independientes).
**Crear:** propio usuario, en el alta a la capa social (requiere `PrivacyConsent` previo).
**Leer:** según nivel de visibilidad de cada campo.
**Editar:** propio usuario; ADMIN en caso de moderación.
**Borrar:** propio usuario (soft delete); anonimización en supresión de cuenta.
**Retención:** ligada a la cuenta; borrado a los 30 días de baja voluntaria (ver sección 27).
**Riesgos RGPD:** medio — `bio` y `avatar_url` pueden contener datos personales o imagen; requiere consentimiento explícito de aparición pública.
**Notas:** `level_declared` es autodeclarado, no oficial — debe etiquetarse así en cualquier UI futura.

### 6.3 PlayerStats
**Propósito:** estadísticas agregadas de actividad social (distintas del ranking oficial de Torneos).
**Campos:** `id: uuid` (req), `user_profile_id: uuid FK` (req), `club_id: uuid` (req), `matches_played_count: integer` (req, default 0), `matches_won_count: integer` (req, default 0), `current_streak: integer` (req, default 0), `last_activity_at: timestamptz` (opc), `updated_at`.
**Visibilidad:** hereda de `visibility_matches_played` en `PlayerSocialProfile`.
**Crear:** sistema (proceso agregador), no el usuario directamente.
**Leer:** según visibilidad heredada.
**Editar:** solo sistema (recalculado, nunca editable a mano por el usuario).
**Borrar:** en cascada con `PlayerSocialProfile`.
**Retención:** igual que `PlayerSocialProfile`.
**Riesgos RGPD:** bajo — datos derivados, sin identificar por sí solos si se agregan sin nombre.
**Notas:** en implementación futura, recalcular vía trigger o job, nunca escritura directa desde cliente.

### 6.4 Friendship
**Propósito:** relación bidireccional que requiere aceptación, base de "amigos" (Prompt G).
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `requester_id: uuid FK→UserProfile` (req), `addressee_id: uuid FK→UserProfile` (req), `status: enum[pending,accepted,rejected,blocked]` (req, default `pending`), `created_at`, `responded_at: timestamptz` (opc).
**Visibilidad:** privada entre las dos partes; el hecho de "ser amigos" solo visible si ambos lo permiten en su perfil.
**Crear:** cualquier `PLAYER` con `PrivacyConsent` de "ser buscable" activo.
**Leer:** las dos partes; STAFF/ADMIN solo en contexto de moderación/reporte.
**Editar:** el `addressee_id` (aceptar/rechazar); cualquiera de las dos partes (bloquear).
**Borrar:** cualquiera de las dos partes (deshacer amistad).
**Retención:** mientras exista la relación; borrado inmediato si se deshace (no soft delete, salvo `status=blocked` que se conserva para prevenir reintentos de acoso).
**Riesgos RGPD:** medio — revela relación social entre dos personas identificables.
**Notas:** un `blocked` debe impedir cualquier otra interacción (`MatchInvite`, `Comment`, etc.) — regla de negocio a validar en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`.

### 6.5 Follow
**Propósito:** relación unidireccional (fase 2), base de "seguidores".
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `follower_id: uuid FK` (req), `followed_id: uuid FK` (req), `created_at`.
**Visibilidad:** el contador puede ser público; la lista de quién sigue a quién, privada por defecto.
**Crear:** cualquier `PLAYER`, si el perfil objetivo permite ser seguido (`visibility_level` ≥ `club`).
**Leer:** propio usuario (su lista); contador agregado público opcional.
**Editar:** no aplica (solo existe/no existe).
**Borrar:** el `follower_id` (dejar de seguir); ADMIN en moderación.
**Retención:** mientras exista; borrado inmediato al dejar de seguir.
**Riesgos RGPD:** bajo-medio.
**Notas:** fase 2, no MVP — incluida aquí solo para completar el modelo, sin implementar todavía.

### 6.6 CommunityPost
**Propósito:** publicación en el feed o en el muro del club.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `author_id: uuid FK` (req), `post_type: enum[player_activity,club_announcement,system_generated]` (req), `body: text` (opc si `post_type=system_generated`, si no req, máx. 500 car.), `visibility: enum[friends,club]` (req, default `friends`), `related_entity_type: text` (opc, p. ej. `OpenMatch`), `related_entity_id: uuid` (opc), `created_at`, `deleted_at: timestamptz` (opc, soft delete).
**Visibilidad:** según `visibility`; `club_announcement` siempre visible a todo el club.
**Crear:** `PLAYER` (`player_activity`, si tiene consentimiento de "aparecer en feed"); `STAFF`/`ADMIN` (`club_announcement`); sistema (`system_generated`, p. ej. "X se unió a un partido abierto").
**Leer:** según `visibility` y relación (amigo/club).
**Editar:** el autor (solo `body`, ventana de 15 min); ADMIN en moderación.
**Borrar:** el autor; ADMIN/STAFF en moderación (soft delete, nunca hard delete inmediato — ver sección 27).
**Retención:** 12 meses tras `deleted_at`, luego purga definitiva (ver sección 27).
**Riesgos RGPD:** medio-alto — contenido generado por el usuario, puede incluir datos de terceros sin su consentimiento (p. ej. mencionar a otro jugador).
**Notas:** cualquier mención a otro usuario (`@jugador`) requeriría en el futuro su propio consentimiento — no incluido en MVP, se documenta como riesgo abierto.

### 6.7 Comment
**Propósito:** comentario sobre un `CommunityPost`.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `post_id: uuid FK→CommunityPost` (req), `author_id: uuid FK` (req), `body: text` (req, máx. 280 car.), `created_at`, `deleted_at` (opc).
**Visibilidad:** hereda del post.
**Crear:** cualquier `PLAYER` con acceso de lectura al post (y sin bloqueo con el autor).
**Leer:** hereda del post.
**Editar:** no editable tras publicar (solo borrar y volver a crear, para simplificar auditoría).
**Borrar:** el autor; ADMIN/STAFF en moderación.
**Retención:** igual que `CommunityPost`.
**Riesgos RGPD:** medio, igual que `CommunityPost`.
**Notas:** sin respuestas anidadas en MVP (comentarios de comentarios), para simplificar moderación inicial.

### 6.8 Reaction
**Propósito:** reacción tipo "me gusta" sobre post o comentario.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `target_type: enum[post,comment]` (req), `target_id: uuid` (req), `user_id: uuid FK` (req), `reaction_type: enum[like]` (req, único tipo en MVP), `created_at`.
**Visibilidad:** el contador es público según visibilidad del contenido; quién reaccionó, visible solo a nivel agregado en MVP.
**Crear:** cualquier `PLAYER` con acceso de lectura al contenido.
**Leer:** contador; lista detallada solo STAFF/ADMIN en moderación.
**Editar:** no aplica.
**Borrar:** el propio usuario (quitar su reacción).
**Retención:** mientras exista el contenido asociado.
**Riesgos RGPD:** bajo.
**Notas:** único índice único recomendado: `(target_type, target_id, user_id)` para evitar reacciones duplicadas.

### 6.9 OpenMatch
**Propósito:** partido abierto publicado por un jugador, capa social sobre una reserva ya existente (no la sustituye).
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `creator_id: uuid FK` (req), `related_booking_id: text` (opc — referencia externa a la reserva real, sin duplicar su modelo), `level_min: enum` (opc), `level_max: enum` (opc), `scheduled_at: timestamptz` (req), `slots_total: integer` (req, 1-4), `slots_filled: integer` (req, default 1), `status: enum[open,full,cancelled,completed]` (req, default `open`), `visibility: enum[club,friends]` (req, default `club`), `created_at`, `cancelled_at: timestamptz` (opc).
**Visibilidad:** según `visibility`.
**Crear:** `PLAYER` con reserva asociada válida (validación fuera de alcance de este diseño — se hace contra el sistema de reservas real en integración futura).
**Leer:** según `visibility`.
**Editar:** el creador (`status`, `slots_*`); sistema (auto-actualiza `slots_filled` al aceptar `MatchInvite`).
**Borrar:** no se borra — se marca `cancelled`.
**Retención:** 90 días tras `scheduled_at`, luego purga o archivado agregado para `PlayerStats`.
**Riesgos RGPD:** bajo-medio — revela disponibilidad/ubicación (el club) del jugador en una fecha concreta.
**Notas:** **no duplica el modelo de reservas real** — solo referencia un ID externo. La integración real con el sistema de reservas queda para el Prompt N, con autorización explícita.

### 6.10 MatchInvite
**Propósito:** solicitud de un jugador para unirse a un `OpenMatch`.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `open_match_id: uuid FK` (req), `requester_id: uuid FK` (req), `status: enum[pending,accepted,rejected,cancelled]` (req, default `pending`), `created_at`, `responded_at: timestamptz` (opc).
**Visibilidad:** privada entre el creador del partido y el solicitante.
**Crear:** cualquier `PLAYER` (sujeto a `level_min/max` del partido, validación de negocio, no de datos).
**Leer:** el creador del `OpenMatch`; el propio solicitante.
**Editar:** el creador (aceptar/rechazar); el solicitante (cancelar su propia solicitud).
**Borrar:** no se borra — se conserva con `status` final para histórico de `PlayerStats`.
**Retención:** igual que el `OpenMatch` asociado.
**Riesgos RGPD:** bajo.
**Notas:** al aceptar, debe incrementar `slots_filled` en `OpenMatch` (regla de negocio, no de esquema).

### 6.11 ClubGroup
**Propósito:** grupo de jugadores (Prompt I), oficial (creado por staff) o informal (creado por jugadores).
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `name: text` (req), `description: text` (opc), `is_official: boolean` (req, default `false`), `visibility: enum[public,invite_only]` (req, default `invite_only`), `created_by: uuid FK` (req), `created_at`, `archived_at: timestamptz` (opc).
**Visibilidad:** según `visibility`.
**Crear:** `PLAYER` (`is_official=false`); `STAFF`/`ADMIN` (`is_official=true`).
**Leer:** según `visibility`; miembros siempre.
**Editar:** el creador o un miembro con rol `owner` en `GroupMember`; ADMIN.
**Borrar:** no se borra — se archiva (`archived_at`).
**Retención:** indefinida mientras esté activo; archivado tras 12 meses de inactividad (revisable).
**Riesgos RGPD:** medio — la lista de miembros revela asociación entre personas.
**Notas:** fase 2, no MVP.

### 6.12 GroupMember
**Propósito:** pertenencia a un `ClubGroup` con rol interno.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `group_id: uuid FK` (req), `user_id: uuid FK` (req), `group_role: enum[owner,member]` (req, default `member`), `joined_at: timestamptz` (req), `left_at: timestamptz` (opc).
**Visibilidad:** según visibilidad del grupo.
**Crear:** el propio usuario (grupos públicos); invitación de un `owner` (grupos `invite_only`).
**Leer:** miembros del grupo; ADMIN.
**Editar:** un `owner` (cambiar rol de otro miembro); ADMIN.
**Borrar:** el propio usuario (abandonar); un `owner` (expulsar).
**Retención:** igual que `ClubGroup`.
**Riesgos RGPD:** medio, igual que `ClubGroup`.
**Notas:** fase 2, no MVP.

### 6.13 Challenge
**Propósito:** reto entre jugadores o grupos (Prompt H).
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `creator_id: uuid FK` (req), `opponent_id: uuid FK` (opc, si es 1vs1), `opponent_group_id: uuid FK` (opc, si es grupal), `challenge_type: enum[individual,group]` (req), `description: text` (opc), `status: enum[proposed,accepted,rejected,completed,expired]` (req, default `proposed`), `result_summary: text` (opc), `created_at`, `resolved_at: timestamptz` (opc).
**Visibilidad:** privada entre las partes; resultado público opcional si ambas partes lo consienten.
**Crear:** `PLAYER`.
**Leer:** las partes implicadas; público si `result_summary` se marca visible.
**Editar:** la parte retada (aceptar/rechazar); ambas partes (registrar resultado, requiere doble confirmación — regla de negocio).
**Borrar:** no se borra tras `accepted` — se conserva para `SocialRanking`.
**Retención:** ligada a la temporada/ranking vigente.
**Riesgos RGPD:** bajo-medio.
**Notas:** fase 2, no MVP. Requiere doble confirmación de resultado para evitar manipulación.

### 6.14 Event
**Propósito:** evento social/deportivo (quedadas, clases, ligas internas, eventos de club) — Prompt P.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `organizer_id: uuid FK` (req, jugador o staff), `event_type: enum[quedada,partido_social,torneo_express,clinic,liga_interna,club_announcement]` (req), `title: text` (req), `description: text` (opc), `scheduled_at: timestamptz` (req), `capacity: integer` (opc), `status: enum[draft,published,full,cancelled,completed]` (req, default `draft`), `is_official: boolean` (req, default `false`), `created_at`.
**Visibilidad:** según tipo — `club_announcement` siempre público al club; el resto configurable.
**Crear:** `PLAYER` (tipos no oficiales); `STAFF`/`ADMIN` (`is_official=true` o `club_announcement`).
**Leer:** según visibilidad configurada.
**Editar:** el organizador; ADMIN.
**Borrar:** no se borra — se marca `cancelled`.
**Retención:** 90 días tras `scheduled_at`.
**Riesgos RGPD:** bajo-medio.
**Notas:** "circuitos" (detectados en la auditoría de capturas, sección 10/19) se modelan como `liga_interna` con múltiples `Event` encadenados por un `series_id` opcional — no como entidad nueva, para no expandir el alcance.

### 6.15 EventRegistration
**Propósito:** inscripción de un jugador a un `Event`.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `event_id: uuid FK` (req), `user_id: uuid FK` (req), `status: enum[registered,waitlisted,cancelled,attended]` (req, default `registered`), `registered_at: timestamptz` (req), `cancelled_at: timestamptz` (opc).
**Visibilidad:** la lista de inscritos visible según configuración del evento; el propio registro siempre visible al usuario.
**Crear:** `PLAYER`.
**Leer:** el propio usuario; el organizador; ADMIN.
**Editar:** el propio usuario (cancelar); organizador (marcar `attended`, gestionar lista de espera).
**Borrar:** no se borra — se marca `cancelled`.
**Retención:** igual que el `Event` asociado.
**Riesgos RGPD:** bajo-medio.
**Notas:** lista de espera (`waitlisted`) promociona automáticamente a `registered` al liberarse cupo (regla de negocio).

### 6.16 SocialRanking
**Propósito:** ranking social/gamificado, explícitamente distinto del ranking oficial de Torneos.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `user_id: uuid FK` (req), `season_id: text` (req, p. ej. `2026-S2`), `points: integer` (req, default 0), `position: integer` (opc, calculado), `updated_at`.
**Visibilidad:** pública dentro del club si el usuario tiene `visibility_level ≥ club`; si no, excluido del listado público pero visible a sí mismo.
**Crear:** sistema (al primer evento puntuable del jugador en la temporada).
**Leer:** según visibilidad.
**Editar:** solo sistema (recalculado tras `Challenge`/`OpenMatch` resueltos).
**Borrar:** no se borra — se archiva al cerrar temporada.
**Retención:** histórico de temporadas cerradas conservado de forma agregada.
**Riesgos RGPD:** bajo-medio.
**Notas:** fase 2, no MVP. Debe llevar siempre una etiqueta visible "ranking social, no oficial" en cualquier UI futura.

### 6.17 Notification
**Propósito:** notificación in-app (mock en MVP, sin proveedor push/email real).
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `user_id: uuid FK` (req, destinatario), `notification_type: enum[friend_request,match_invite,event_reminder,moderation_action,system]` (req), `payload: jsonb` (req), `read_at: timestamptz` (opc), `created_at`.
**Visibilidad:** privada, solo el destinatario.
**Crear:** sistema, en reacción a eventos de otras entidades.
**Leer:** el propio destinatario.
**Editar:** el propio destinatario (`read_at`).
**Borrar:** el propio destinatario; purga automática tras 90 días.
**Retención:** 90 días.
**Riesgos RGPD:** bajo — pero `payload` no debe incluir datos sensibles de terceros sin necesidad.
**Notas:** en MVP es un registro interno consultado por polling/consulta, no un push real — un proveedor real (email/push) es integración futura fuera de alcance.

### 6.18 Report
**Propósito:** reporte de contenido o usuario, entrada al sistema de moderación.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `reporter_id: uuid FK` (req), `target_type: enum[user,post,comment,group,event]` (req), `target_id: uuid` (req), `reason: enum[harassment,spam,inappropriate_content,fake_profile,other]` (req), `details: text` (opc, máx. 500 car.), `status: enum[open,in_review,resolved,dismissed]` (req, default `open`), `created_at`, `resolved_at: timestamptz` (opc).
**Visibilidad:** privada — solo el reportante, STAFF/ADMIN/SUPPORT.
**Crear:** cualquier `PLAYER`/`STAFF`.
**Leer:** el reportante (solo estado, no notas internas); STAFF/ADMIN/SUPPORT (completo).
**Editar:** STAFF/ADMIN/SUPPORT (`status`).
**Borrar:** no se borra — se conserva como registro de auditoría (retención ampliada, ver sección 27).
**Retención:** 24 meses (más larga que el contenido reportado, para trazabilidad ante reincidencia).
**Riesgos RGPD:** medio-alto — contiene datos personales del reportado y valoraciones subjetivas del reportante.
**Notas:** ver `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` para el flujo completo de moderación.

### 6.19 ModerationAction
**Propósito:** acción tomada por staff/moderador sobre un `Report`.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `report_id: uuid FK` (req), `moderator_id: uuid FK` (req), `action_type: enum[warning,content_removed,user_suspended,user_banned,no_action]` (req), `notes: text` (opc, interno), `created_at`.
**Visibilidad:** interna — STAFF/ADMIN/SUPPORT.
**Crear:** STAFF/ADMIN/SUPPORT.
**Leer:** STAFF/ADMIN/SUPPORT; el usuario afectado ve solo un resumen sin `notes` internas (transparencia mínima, sin exponer deliberaciones internas).
**Editar:** no editable tras creación (inmutable, como todo registro de auditoría).
**Borrar:** nunca.
**Retención:** igual que `Report` (24 meses mínimo), revisable a más largo plazo por requisito de trazabilidad legal.
**Riesgos RGPD:** medio-alto — decisión que afecta a una persona identificable; debe existir vía de reclamación (fuera de alcance de datos, es un proceso).
**Notas:** ninguna acción de moderación en MVP debe ser 100% automática sin revisión humana (regla explícita del prompt, ver sección 19 riesgos técnicos).

### 6.20 PrivacyConsent
**Propósito:** registro granular de consentimiento por función social, con historial y revocación.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `user_id: uuid FK` (req), `consent_type: enum[appear_in_feed,searchable_by_others,receive_non_friend_messages,approximate_location,activity_sharing]` (req), `granted: boolean` (req), `granted_at: timestamptz` (req), `revoked_at: timestamptz` (opc), `consent_version: text` (req, versión del texto de consentimiento aceptado).
**Visibilidad:** privada — el propio usuario; ADMIN/SUPPORT solo en auditoría de cumplimiento.
**Crear:** el propio usuario (en el alta social o al activar una función).
**Leer:** el propio usuario; ADMIN/SUPPORT en auditoría.
**Editar:** no se edita — revocar crea un nuevo registro con `granted=false` (histórico inmutable, patrón visto en la auditoría de capturas sección 14: "hasta la retirada del consentimiento").
**Borrar:** nunca durante la vida de la cuenta; anonimizado (no borrado) tras supresión de cuenta, para prueba de cumplimiento pasado.
**Retención:** vida de la cuenta + 5 años tras baja (plazo estándar de prueba de cumplimiento, a validar con asesoría legal real).
**Riesgos RGPD:** este registro **es** la mitigación de riesgo RGPD del resto del modelo — su ausencia sería el riesgo, no su presencia.
**Notas:** cada función social sensible (sección 9) debe verificar `PrivacyConsent.granted=true` antes de permitir la acción — regla de negocio central de todo el diseño.

### 6.21 AuditLog
**Propósito:** traza inmutable de acciones sensibles sobre cualquier entidad social.
**Campos:** `id: uuid` (req), `club_id: uuid` (req), `actor_id: uuid FK` (opc, null si es acción de sistema), `action: text` (req, p. ej. `friendship.blocked`), `target_type: text` (req), `target_id: uuid` (req), `metadata: jsonb` (opc), `created_at: timestamptz` (req).
**Visibilidad:** interna — SUPPORT/ADMIN.
**Crear:** sistema, en cada acción sensible (moderación, consentimiento, borrado, cambio de rol).
**Leer:** SUPPORT/ADMIN.
**Editar:** nunca (inmutable por diseño).
**Borrar:** nunca durante el plazo de retención.
**Retención:** 24 meses (alineado con `Report`/`ModerationAction`).
**Riesgos RGPD:** medio — debe evitar guardar contenido personal innecesario en `metadata` (minimización).
**Notas:** reutiliza el principio ya validado en `project-observability-runtime-fase1-20260709` (correlation-id, logging estructurado) como referencia de diseño, sin tocar ese sistema real.

---

## 7. Relaciones entre entidades

```
UserProfile 1—1 PlayerSocialProfile
UserProfile 1—1 PlayerStats
UserProfile 1—N Friendship (como requester o addressee)
UserProfile 1—N Follow (como follower o followed)
UserProfile 1—N CommunityPost (autor)
UserProfile 1—N Comment (autor)
UserProfile 1—N Reaction
UserProfile 1—N OpenMatch (creador)
UserProfile 1—N MatchInvite (solicitante)
UserProfile 1—N ClubGroup (creador)
UserProfile N—N ClubGroup (vía GroupMember)
UserProfile 1—N Challenge (creador u oponente)
UserProfile 1—N Event (organizador)
UserProfile N—N Event (vía EventRegistration)
UserProfile 1—1 SocialRanking (por temporada)
UserProfile 1—N Notification (destinatario)
UserProfile 1—N Report (reportante o reportado, vía target_id)
UserProfile 1—N PrivacyConsent
UserProfile 1—N AuditLog (actor)

CommunityPost 1—N Comment
CommunityPost 1—N Reaction (target_type=post)
Comment 1—N Reaction (target_type=comment)
OpenMatch 1—N MatchInvite
ClubGroup 1—N GroupMember
Event 1—N EventRegistration
Report 1—N ModerationAction

Todas las entidades (excepto AuditLog.actor_id nulo) → club_id (tenant), sin excepción.
```

## 8. Modelo de privacidad por defecto

Toda entidad con campo `visibility` nace en el valor más restrictivo (`private` o `friends`, nunca `club` ni público por defecto), salvo contenido inherentemente oficial (`club_announcement`, que nace público al club por definición de su propósito). Ningún dato de un `UserProfile` es visible fuera de su club salvo diseño explícito futuro (no incluido en MVP). Este principio ya está confirmado como patrón de mercado en la auditoría de capturas (sección 14: localización desactivada por defecto, actividad como opt-in explícito).

## 9. Modelo de consentimiento granular

Cinco tipos de consentimiento (`PrivacyConsent.consent_type`), cada uno gateando una función concreta:
- `appear_in_feed` → requerido para que `CommunityPost.post_type=player_activity` se genere.
- `searchable_by_others` → requerido para aparecer en cualquier búsqueda de jugadores (fase 2).
- `receive_non_friend_messages` → requerido antes de habilitar mensajería (fase 2/3, Prompt K/L).
- `approximate_location` → requerido para búsqueda por zona (fase 3, Prompt M).
- `activity_sharing` → requerido para que `Friendship`/`MatchInvite` generen `Notification` a terceros.
Cada consentimiento es revocable con efecto inmediato: revocar `appear_in_feed` debe ocultar retroactivamente los `CommunityPost` de tipo `player_activity` ya creados (regla de negocio, no solo de UI).

## 10. Modelo de permisos por rol

Resumen (detalle completo en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`): `PLAYER` opera sobre sus propios datos y contenido según visibilidad; `STAFF` gestiona contenido oficial del club (`club_announcement`, eventos oficiales) y modera dentro de su club; `ADMIN` tiene alcance total dentro de su club, incluida gestión de roles y moderación escalada; `SUPPORT` tiene lectura de auditoría/moderación multi-club para soporte técnico, sin capacidad de editar contenido social directamente salvo acción de moderación documentada.

## 11. Modelo de auditoría y logs

`AuditLog` registra: creación/revocación de `PrivacyConsent`, toda `ModerationAction`, bloqueo/desbloqueo en `Friendship`, cambios de `role` en `UserProfile`, borrado de `CommunityPost`/`Comment` por moderación. No registra lectura (solo escritura/acción), para no generar un volumen desproporcionado ni un riesgo de vigilancia excesiva sobre los propios usuarios.

## 12. Modelo de moderación

Flujo: `Report` (creado por cualquier usuario) → cola de revisión (`status=open`→`in_review`) → `ModerationAction` (decisión humana, nunca automática sin revisión — regla explícita) → `Report.status=resolved/dismissed`. Contenido con `content_removed` pasa a soft delete (`deleted_at`) en la entidad original, nunca hard delete inmediato, para permitir auditoría posterior o apelación.

## 13. Modelo de notificaciones

MVP: `Notification` es un registro interno, consultado activamente por el cliente (no hay push real todavía). `notification_type` cubre solicitudes de amistad, invitaciones a partido, recordatorios de evento, acciones de moderación que afectan al usuario, y notificaciones de sistema. Purga automática a los 90 días, leídas o no.

## 14. Modelo de eventos

Ver entidades `Event`/`EventRegistration` (6.14-6.15). Estados de evento: `draft → published → (full) → completed`, o `→ cancelled` desde cualquier estado previo a `completed`. Un evento `cancelled` debe notificar a todos los `EventRegistration.status=registered/waitlisted`.

## 15. Modelo de rankings y gamificación

`SocialRanking` (fase 2) se recalcula a partir de `Challenge` y `OpenMatch` resueltos, por temporada (`season_id`). No usa el mismo espacio de puntuación que el ranking oficial de Torneos — son sistemas independientes, y cualquier UI futura debe etiquetarlo así explícitamente (ya establecido en el roadmap).

## 16. Modelo de partidos abiertos

Ver `OpenMatch`/`MatchInvite` (6.9-6.10). Punto de diseño clave: `OpenMatch.related_booking_id` es una referencia externa de solo lectura al sistema de reservas real — este modelo social **no** crea, modifica ni cancela reservas reales; solo referencia su identificador para mostrar contexto (fecha/pista) en la capa social.

## 17. Modelo de perfiles sociales

Ver `PlayerSocialProfile`/`PlayerStats` (6.2-6.3). Diseñado para no duplicar el perfil deportivo premium ya existente en producción (`project-perfil-social-20260626`) — es una tabla nueva y separada que en integración futura se relacionaría por `auth_user_id`, sin fusionar esquemas todavía.

## 18. Modelo de grupos/comunidad

Ver `ClubGroup`/`GroupMember` (6.11-6.12), fase 2. Un grupo oficial (`is_official=true`) solo lo crea STAFF/ADMIN; un grupo informal lo crea cualquier `PLAYER` y por defecto es `invite_only`.

## 19. Riesgos técnicos

- Recalcular `PlayerStats`/`SocialRanking` de forma síncrona en cada partido podría generar contención — se recomienda diseño de job asíncrono en implementación futura (no resuelto aquí, solo señalado).
- `CommunityPost.related_entity_id` sin FK real (referencia polimórfica) — riesgo de integridad referencial débil, mitigado con validación a nivel de aplicación, no de base de datos, en la implementación futura.
- Ninguna moderación debe automatizarse por IA sin revisión humana en esta fase — riesgo de falsos positivos/negativos sin supervisión (regla explícita del prompt, ya reflejada en `ModerationAction`).
- Multi-tenant: todo `club_id` debe validarse en cada consulta — mismo riesgo ya identificado y mitigado en `tenant-storage-isolation` (P0 de tokens en claro, no relacionado directamente pero mismo principio de aislamiento a respetar).

## 20. Riesgos RGPD

- `CommunityPost`/`Comment` pueden contener datos personales de terceros mencionados sin su consentimiento — riesgo abierto, no resuelto en MVP (ver 6.6, nota).
- `Report`/`ModerationAction` contienen valoraciones sobre personas identificables — requieren plazo de retención más largo que el resto, ya reflejado (24 meses).
- `PrivacyConsent` es la pieza que mitiga el resto del modelo — su diseño (revocación con efecto inmediato y retroactivo) es el punto más crítico a implementar correctamente, más que cualquier otra entidad.
- Menores de edad: este modelo no incluye todavía un campo `is_minor` ni flujo de consentimiento parental — marcado como **riesgo abierto**, ya señalado en el roadmap (sección 10), pendiente de decisión de negocio antes de implementar.

## 21. MVP recomendado de datos

7 módulos funcionales, 12 entidades de datos (algunas entidades son prerequisito técnico compartido entre módulos):

| Módulo funcional | Entidades de datos implicadas |
|---|---|
| Perfil social de jugador | `UserProfile`, `PlayerSocialProfile`, `PlayerStats` |
| Partidos abiertos | `OpenMatch`, `MatchInvite`, `Notification` |
| Muro/feed básico | `CommunityPost`, `Comment`, `Reaction` |
| Amigos/conexiones | `Friendship` |
| Consentimiento/privacidad | `PrivacyConsent` |
| Reportes/moderación básica | `Report`, `ModerationAction`, `AuditLog` |
| Notificaciones mock | `Notification` (compartida con partidos abiertos) |

No entran en el MVP de datos: `Follow`, `ClubGroup`, `GroupMember`, `Challenge`, `Event`, `EventRegistration`, `SocialRanking` (9 entidades, fase 2-3).

## 22. Tablas/colecciones candidatas

Una tabla por entidad (21 tablas candidatas), sin tablas de unión adicionales salvo `GroupMember` (ya es la tabla de unión N-N entre `UserProfile` y `ClubGroup`) y `EventRegistration` (ídem para `Event`). No se recomienda una tabla `Friendship` separada de `Follow` fusionadas — se mantienen distintas por tener reglas de negocio y visibilidad diferentes.

## 23. Campos obligatorios por entidad (resumen)

Todas las entidades: `id`, `club_id`, `created_at` son obligatorios sin excepción. Adicionalmente obligatorios por entidad: ver el listado "Campos" de cada entidad en la sección 6 (marcados `req`); el detalle exhaustivo campo a campo está en `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md`.

## 24. Campos opcionales por entidad (resumen)

Patrón general: campos de texto libre generados por el usuario (`bio`, `description`, `details`, `notes`) son opcionales; campos de cierre de ciclo de vida (`resolved_at`, `cancelled_at`, `deleted_at`, `archived_at`, `left_at`) son opcionales por definición (nulos hasta que ocurren). Detalle exhaustivo en `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md`.

## 25. Índices recomendados

- `UserProfile(club_id, auth_user_id)` único.
- `PlayerSocialProfile(user_profile_id)` único.
- `Friendship(club_id, requester_id, addressee_id)` único; índice adicional en `(addressee_id, status)` para listar solicitudes pendientes.
- `CommunityPost(club_id, created_at desc)` para el feed.
- `Comment(post_id, created_at)`.
- `Reaction(target_type, target_id, user_id)` único (evita duplicados).
- `OpenMatch(club_id, scheduled_at)` y `(club_id, status)`.
- `MatchInvite(open_match_id, status)`.
- `Notification(user_id, read_at, created_at desc)` para bandeja de notificaciones no leídas.
- `Report(club_id, status)` para la cola de moderación.
- `PrivacyConsent(user_id, consent_type)` — sin unicidad estricta (histórico), pero con índice para leer el estado vigente más reciente.
- `AuditLog(club_id, created_at desc)` y `(target_type, target_id)`.

## 26. Validaciones recomendadas

- Todo `club_id` de una entidad relacionada debe coincidir con el `club_id` de la entidad padre (p. ej. `Comment.club_id = CommunityPost.club_id`) — validación de integridad multi-tenant, crítica.
- `OpenMatch.slots_filled ≤ slots_total`, aplicado a nivel de aplicación al aceptar un `MatchInvite`.
- `Friendship.requester_id ≠ addressee_id` (no se puede uno mismo).
- Longitudes máximas de texto libre aplicadas en capa de aplicación además de en base de datos (defensa en profundidad).
- `PrivacyConsent`: no permitir ninguna acción dependiente sin un registro `granted=true` vigente (sin `revoked_at` posterior) — validación central de todo el modelo.
- `Report.target_id` debe existir en la tabla correspondiente a `target_type` — validación a nivel de aplicación (referencia polimórfica, sin FK de base de datos posible de forma nativa).

## 27. Reglas de borrado/retención

| Entidad | Regla |
|---|---|
| `UserProfile` | No se borra; se desactiva. Anonimización completa a petición de supresión (RGPD), tras verificación. |
| `PlayerSocialProfile` / `PlayerStats` | Soft delete a los 30 días de baja voluntaria de la capa social. |
| `Friendship` | Borrado inmediato al deshacer; `blocked` se conserva indefinidamente (prevención de acoso). |
| `CommunityPost` / `Comment` | Soft delete inmediato al borrar; purga definitiva a los 12 meses. |
| `Reaction` | Borrado inmediato (no requiere histórico). |
| `OpenMatch` / `MatchInvite` | Se marcan `cancelled`/conservan `status`; purga a los 90 días tras la fecha del partido, salvo agregación anónima para `PlayerStats`. |
| `ClubGroup` / `GroupMember` | Archivado, no borrado, tras 12 meses de inactividad. |
| `Event` / `EventRegistration` | Purga a los 90 días tras `scheduled_at`. |
| `Report` / `ModerationAction` / `AuditLog` | Retención mínima 24 meses, sin borrado anticipado (requisito de trazabilidad). |
| `PrivacyConsent` | Nunca se borra durante la vida de la cuenta; anonimizado (no eliminado) tras supresión, conservado 5 años como prueba de cumplimiento pasado (a validar con asesoría legal real antes de implementar). |
| `Notification` | Purga automática a los 90 días. |

## 28. Checklist antes de implementar

- [ ] Validación legal externa de los plazos de retención propuestos (especialmente `PrivacyConsent` y `Report`/`AuditLog`), antes de escribir cualquier migración real.
- [ ] Confirmar con negocio el criterio de menores de edad antes de habilitar el alta social (riesgo abierto, sección 20).
- [ ] Diseño de RLS de Supabase revisado en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` antes de crear una sola tabla real.
- [ ] Confirmar que `club_id` (tenant) se resuelve igual que en el `tenant-runtime` ya auditado, sin reinventar el mecanismo.
- [ ] Ninguna entidad de este modelo se crea en Supabase real sin autorización explícita (Prompt N).
- [ ] Revisar que ningún campo de este modelo duplica datos ya existentes en el perfil deportivo premium real, para evitar doble fuente de verdad.

## 29. Siguiente prompt recomendado

Con el modelo de datos diseñado (Prompt A), el siguiente paso lógico del catálogo es el **Prompt F — Consentimiento y privacidad** (flujos + textos revisables), que ya tiene aquí su base de datos (`PrivacyConsent`, sección 6.20 y 9) — permite avanzar directamente a diseñar los flujos de UI de consentimiento sobre un modelo ya validado, antes de construir cualquier prototipo visual (Prompts B/C).
