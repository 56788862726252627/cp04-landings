# P1.3 — Feed paginado · Notificaciones · Multi-club

**Estado:** CERRADO  
**Fecha:** 2026-08-16  
**Base:** P0 (cerrado), P1.1 (cerrado), P1.2 (cerrado)

---

## Paginación del feed

### Diseño

- **Función:** `communityGetFeedPage(viewerId, { cursor, limit, clubId })`
- **Orden:** descendente por `createdAt` + `id` como desempate — determinista, sin duplicados.
- **Cursor:** el `id` del último post devuelto (opaco para la UI; válido mientras el post exista).
- **Limit:** validado entre 1 y 50, default 10.
- **Respuesta:** `{ ok, items, nextCursor, hasMore }` o `{ ok: false, error }`.

### Contrato

| Escenario | Resultado |
|---|---|
| Primera página | `ok: true`, items[0..limit-1], hasMore si quedan más |
| Siguiente página (cursor válido) | items continuación sin duplicados |
| Fin del feed | `hasMore: false`, `nextCursor: null` |
| Cursor inválido | `ok: false, error: "cursor_invalid"`, items[] |
| Cursor de club A en club B | `ok: false` — el id no existe en el store de B |
| Feed vacío | `ok: true`, items[], hasMore: false |

### Reglas de visibilidad preservadas

Toda la lógica de visibilidad se aplica **antes** de paginar vía `getVisibleFeed`:
- Bloqueo en cualquier dirección excluye al usuario.
- Consent `appear_in_feed` retroactivo.
- Visibilidad `friends` requiere amistad aceptada.
- `clubId` del viewer debe coincidir con el del post.
- Contenido oculto por moderación invisible salvo STAFF/ADMIN.

### UI (ComunidadDemo)

- Carga inicial automática al montar `FeedTab` o cambiar de club.
- Botón **"Cargar más publicaciones"** — solo visible si `hasMore`.
- Mensaje **"Has llegado al final del feed"** cuando `!hasMore && items > 0`.
- Estado vacío cuando `items === 0 && !error`.
- Estado de error con mensaje.
- Cambio de club (`activeClubId`) reinicia cursor y recarga desde el principio.

---

## Notificaciones sociales

### Eventos que generan notificación

| Evento | Destinatario | Tipo |
|---|---|---|
| `sendFriendRequest` | addressee | `friendship_request` |
| `acceptFriendRequest` | requester | `friendship_accepted` |
| `followUser` | followedId | `new_follower` |
| `commentOnPost` | post.authorId (≠ commenter) | `new_comment` |
| `reactTo` (post o comment) | authorId del target (≠ reactor) | `new_reaction` |
| `requestToJoin` (partido) | match.creatorId | `match_invite` |
| `acceptJoinRequest` | invite.requesterId | `match_invite` |
| `rejectJoinRequest` | invite.requesterId | `match_invite` |
| `cancelOpenMatch` | cada invite aceptado | `match_invite` |
| `applyModerationAction` (warning/content_removed/suspended/banned) | autor del contenido o targetId user | `moderation_action` |

**No se notifica:** rechazo de amistad, cancelación de solicitud, eliminación de amigo, `unfollowUser`, `no_action` en moderación.  
**Privacidad:** `moderation_action` nunca incluye `moderatorId` ni `reporterId` en el payload.

### API de lectura (bridge)

| Función | Descripción |
|---|---|
| `communityGetNotifications(userId, { clubId, limit })` | Lista más recientes primero |
| `communityGetUnreadCount(userId, clubId)` | Entero ≥ 0 |
| `communityMarkNotificationRead(notifId, userId, clubId)` | Solo el destinatario puede marcarla |
| `communityMarkAllNotificationsRead(userId, clubId)` | Devuelve `{ ok, count }` |

### Lógica pura (community-logic)

- `listNotifications(store, { userId, clubId, limit })` — filtra, ordena desc, limita.
- `getUnreadCount(store, userId, clubId)` — cuenta `readAt === null`.
- `markNotificationRead(store, notifId, userId)` — verifica destinatario.
- `markAllNotificationsRead(store, userId, clubId)` — batch, devuelve count.

### UI (NotificacionesTab)

- Panel con listado ordenado.
- Badge de no leídas sobre el botón de la pestaña (disappears cuando `unread === 0`).
- Botón **"Marcar todas como leídas"** (visible solo si hay no leídas).
- Botón **"Marcar leída"** por notificación individual.
- Icono + label por tipo de notificación.
- Timestamp legible en `es-ES`.

---

## Multi-club / selector de tenant

### Diseño

Cada club tiene su propio `MemoryCommunityRepository` en memoria:
- `COMMUNITY_BRIDGE_CLUB_ID = "club-demo-04"` — repo principal (siempre existente).
- `COMMUNITY_BRIDGE_CLUB_B_ID = "club-demo-05"` — repo secundario (creado bajo demanda).
- `_extraRepos: Map<clubId, repo>` — repos adicionales creados por `getRepoForClub(clubId)`.

### Tenant boundaries

- Ningún post del club A aparece en el feed del club B.
- Ninguna notificación del club A aparece en el panel del club B.
- Un cursor válido en el club A es inválido en el club B (el id no existe en ese store).
- `markAllNotificationsRead` en un club no afecta al otro.
- `getUnreadCount` es independiente por club.

### UI

- Selector de club discreto — visible solo si `DEMO_CLUBS.length > 1`.
- Cambiar de club: reinicia el cursor del feed, recarga feed y notificaciones.
- El actor mantiene su identidad (`ACTOR_ID`) — su UserProfile se crea en el nuevo store si no existe.
- Texto informativo cuando el club activo ≠ club-demo-04.

---

## Tests

### community-logic (87 tests PASS)

- 59 existentes (P0): todos verdes sin modificación.
- 28 nuevos (notifications.test.mjs):
  - Notificaciones por amistad, follow, comentario, reacción, partido.
  - `listNotifications`: filtro tenant, orden, limit.
  - `getUnreadCount`: baseline, incremento, tenant isolation.
  - `markNotificationRead`: flujo feliz, error de usuario incorrecto, id inexistente.
  - `markAllNotificationsRead`: batch, count, tenant isolation.
  - `getPaginatedFeed`: página 1, página 2, sin duplicados, cursor inválido, vacío, bloqueo, friends, consentimiento.

### communityBridge (118 tests PASS)

- 96 existentes (P0/P1.1/P1.2): todos verdes.
- 22 nuevos (P1.3):
  - Feed: página 1, página 2, cursor inválido, vacío, bloqueo, tenant isolation, cursor cross-club.
  - Notificaciones: friendship_request/accepted, new_follower, new_comment, new_reaction.
  - unreadCount, markRead, markRead error, markAll.
  - Orden cronológico.
  - Multi-club: notificaciones separadas, unreadCount separado, repos distintos, markAll sin cruce.
  - Regresión P0 + P1.x completa.

### communityRepository (66 tests PASS)

- Todos verdes, sin cambios.

---

## Riesgos documentados

1. **Cursor expuesto:** el cursor es el `id` del último post (UUID). No es un secreto, pero es visible en la red — no se puede usar como token de autorización.
2. **Orden no garantizado entre escrituras simultáneas:** en memoria con el mismo `createdAt`, el desempate por `id` es lexicográfico. En backend real se usará un offset numérico de BD.
3. **Notificaciones duplicadas posibles:** follow → unfollow → follow genera dos notificaciones `new_follower`. Se considera correcto (el autor recibe dos follows reales). Deduplicación opcional en un futuro en `listNotifications`.
4. **Moderación sin notificar:** `no_action` y `dismissed` no generan notificación para no exponer que alguien fue reportado y el reporte no procedió.

---

## Qué queda en memoria (sin backend real)

- Todas las notificaciones se pierden al recargar.
- El cursor solo es válido mientras el proceso está vivo.
- El segundo club (club-demo-05) no tiene datos semilla.

---

## Qué falta para backend real

1. Persistir notificaciones en tabla Supabase `notifications` con RLS por `user_id`.
2. Reemplazar cursor por `offset` de BD o cursor keyset sobre `(created_at, id)`.
3. Endpoint `GET /notifications?clubId=&cursor=&limit=` + auth JWT.
4. WebSocket o polling para badge de no leídas en tiempo real.
5. Índice `(user_id, club_id, read_at)` para `getUnreadCount` eficiente.
6. Rate limit en generación de notificaciones (anti-spam de follow/unfollow).

---

## DoD P1.3

- [x] Feed paginado con cursor estable y sin duplicados.
- [x] Notificaciones generadas para 10 tipos de evento.
- [x] `unreadCount` coherente con estado real.
- [x] `markRead` / `markAll` funcionando.
- [x] Tenant isolation probado: ningún dato de club A en club B.
- [x] Selector multi-club en UI.
- [x] Badge de no leídas en nav.
- [x] 87/87 community-logic PASS.
- [x] 118/118 communityBridge PASS.
- [x] 66/66 communityRepository PASS.
- [x] Build PASS.
- [x] Cero servicios externos.
- [x] P0/P1.1/P1.2 intactos.
