# RLS, permisos y privacidad — Comunidad Pádel 04
### Reglas de acceso por rol, sin SQL real, sin Supabase real

**Estado:** documento de diseño técnico. Sin código, sin políticas RLS creadas, sin conexión a Supabase real.
**Fecha:** 2026-07-14
**Depende de:** `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` y `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md` (mismo directorio).

**Aviso:** este documento describe **reglas de acceso a nivel de diseño**, para servir de especificación a una futura implementación de Row Level Security en Supabase (o equivalente). No se ha escrito ni ejecutado ninguna sentencia SQL, no se ha creado ninguna política real, y no se ha tocado el proyecto Supabase de Club Pádel 04.

---

## 1. Roles

Se reutilizan exactamente los 4 roles ya existentes en la aplicación real (no se crean roles nuevos para la capa social):

| Rol | Descripción en el contexto social |
|---|---|
| `PLAYER` | Jugador del club. Gestiona su propio contenido y participa en la capa social según su configuración de privacidad. |
| `STAFF` | Personal del club. Publica contenido oficial (muro del club, eventos oficiales) y modera dentro de su club. |
| `ADMIN` | Administración del club. Alcance total dentro de su `club_id`, incluida gestión de roles y moderación escalada. |
| `SUPPORT` | Soporte técnico de la Agencia IA. Lectura de auditoría/moderación entre clubes para diagnóstico, sin edición directa de contenido social salvo mediante una acción de moderación documentada. |

Regla transversal: **todo acceso está acotado por `club_id`** — ningún rol, ni siquiera `SUPPORT`, lee contenido social de un club fuera de su alcance salvo en tareas explícitas de soporte multi-tenant, que deben quedar registradas en `AuditLog`.

## 2. Reglas de lectura (por entidad, resumen)

| Entidad | PLAYER | STAFF | ADMIN | SUPPORT |
|---|---|---|---|---|
| UserProfile | Propio + `display_name` de otros en su club | Todo su club | Todo su club | Todo (diagnóstico) |
| PlayerSocialProfile | Propio + ajeno según `visibility_*` | Igual que PLAYER + moderación | Todo su club | Todo (diagnóstico) |
| PlayerStats | Propio + ajeno según visibilidad heredada | Igual que PLAYER | Todo su club | Todo (diagnóstico) |
| Friendship | Solo las propias | No (salvo moderación de un reporte) | Solo en contexto de moderación | Solo en contexto de moderación |
| Follow | Solo las propias | No | Solo en contexto de moderación | Solo en contexto de moderación |
| CommunityPost | Según `visibility` y relación | Todo su club | Todo su club | Todo (diagnóstico) |
| Comment | Hereda del post | Todo su club | Todo su club | Todo (diagnóstico) |
| Reaction | Contador público; detalle no | Contador + detalle en moderación | Contador + detalle | Contador + detalle (diagnóstico) |
| OpenMatch | Según `visibility` | Todo su club | Todo su club | Todo (diagnóstico) |
| MatchInvite | Solo las propias (como creador o solicitante) | No (salvo moderación) | Solo en contexto de moderación | Solo en contexto de moderación |
| ClubGroup | Según `visibility`; miembros siempre | Todo su club | Todo su club | Todo (diagnóstico) |
| GroupMember | Miembros del grupo | Todo su club | Todo su club | Todo (diagnóstico) |
| Challenge | Solo las partes implicadas | No (salvo moderación) | Solo en contexto de moderación | Solo en contexto de moderación |
| Event | Según visibilidad configurada | Todo su club | Todo su club | Todo (diagnóstico) |
| EventRegistration | Propia; organizador ve lista de su evento | Todo su club | Todo su club | Todo (diagnóstico) |
| SocialRanking | Según visibilidad del perfil | Todo su club | Todo su club | Todo (diagnóstico) |
| Notification | Solo las propias | No | No | Solo en contexto de soporte a un ticket |
| Report | Reportante ve solo estado; resto no | Todo su club (completo) | Todo su club (completo) | Todo (completo, diagnóstico) |
| ModerationAction | El afectado ve resumen sin `notes` | Todo su club | Todo su club | Todo (diagnóstico) |
| PrivacyConsent | Solo las propias | No | Solo en auditoría de cumplimiento | Solo en auditoría de cumplimiento |
| AuditLog | No | No | Sí, de su club | Sí, de todos los clubes |

## 3. Reglas de escritura (creación)

- **UserProfile**: solo el sistema, en el momento del alta real (fuera de esta capa).
- **PlayerSocialProfile / PrivacyConsent**: el propio `PLAYER`, únicamente sobre su propio `user_id` — nunca en nombre de otro usuario, sin excepción para ningún rol.
- **CommunityPost**: `PLAYER` (tipo `player_activity`, requiere `PrivacyConsent.appear_in_feed=true` vigente); `STAFF`/`ADMIN` (tipo `club_announcement`); sistema (`system_generated`).
- **Comment / Reaction**: `PLAYER` con acceso de lectura al contenido padre, y sin relación `Friendship.status=blocked` con el autor del contenido.
- **OpenMatch**: `PLAYER` con una reserva real asociada válida (la validación de la reserva ocurre contra el sistema real en integración futura, fuera de este diseño).
- **MatchInvite**: `PLAYER`, uno por combinación `(open_match_id, requester_id)` — no duplicados.
- **ClubGroup**: `PLAYER` (`is_official=false`); `STAFF`/`ADMIN` (`is_official=true`).
- **GroupMember**: el propio usuario (grupos públicos) o un `owner` del grupo en nombre de otro (invitación, grupos `invite_only`).
- **Challenge**: `PLAYER`, dirigido a otro `PLAYER` o `ClubGroup` sin relación `blocked`.
- **Event**: `PLAYER` (tipos no oficiales); `STAFF`/`ADMIN` (oficiales/`club_announcement`).
- **EventRegistration**: el propio `PLAYER`.
- **Report**: cualquier `PLAYER`/`STAFF` autenticado.
- **ModerationAction**: `STAFF`/`ADMIN`/`SUPPORT` únicamente.
- **Notification / SocialRanking / PlayerStats / AuditLog**: solo el sistema (procesos internos), nunca escritura directa de cliente.

## 4. Reglas de edición

- Un usuario solo edita **sus propios** registros de perfil, consentimiento y contenido, dentro de las ventanas definidas (p. ej. `CommunityPost.body` editable 15 min tras publicar).
- `Friendship.status`: solo el `addressee_id` puede pasar `pending → accepted/rejected`; cualquiera de las dos partes puede pasar a `blocked` en cualquier momento.
- `MatchInvite.status`: solo el creador del `OpenMatch` acepta/rechaza; el propio `requester_id` puede cancelar su solicitud.
- `Report.status`: solo `STAFF`/`ADMIN`/`SUPPORT`.
- `ModerationAction`: **inmutable tras creación**, ningún rol la edita.
- `PrivacyConsent`: **no se edita** — revocar crea un nuevo registro (ver modelo de datos, 6.20). Ningún rol distinto del propio usuario puede alterar su consentimiento, ni siquiera `ADMIN`.
- `AuditLog`: inmutable para todos los roles, sin excepción.
- Cambios de `UserProfile.role`: solo `ADMIN` de su propio club, siempre generando un `AuditLog`.

## 5. Reglas de borrado

- La mayoría de entidades usan **soft delete** (`deleted_at`, `cancelled_at`, `archived_at`) — ver sección 27 de `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` para el detalle de retención por entidad.
- `Report`, `ModerationAction`, `AuditLog`, `PrivacyConsent`: **nunca se borran** dentro del plazo de retención — ni por el usuario, ni por `ADMIN`. Solo un proceso de purga automática tras el plazo, o un proceso de anonimización ante ejercicio de derecho de supresión (RGPD), documentado y auditado.
- Borrado propio: un `PLAYER` puede borrar su propio `CommunityPost`/`Comment`/`Reaction`/`Friendship`/`GroupMember` (abandonar), siempre soft delete donde aplique.
- Borrado por moderación: `STAFF`/`ADMIN` pueden soft-delete contenido ajeno **solo** como resultado de una `ModerationAction` documentada — nunca de forma discrecional sin `Report` asociado (excepción: `STAFF`/`ADMIN` pueden retirar directamente su propio `club_announcement`).

## 6. Visibilidad pública/privada

Tres niveles transversales, ya usados en varias entidades (`private` / `friends` / `club`), más el caso especial `invite_only` en grupos:
- `private`: solo el propio usuario (y roles de moderación/auditoría cuando aplica).
- `friends`: el propio usuario + relaciones `Friendship.status=accepted` sin bloqueo.
- `club`: todo `UserProfile` activo del mismo `club_id`.
- `invite_only` (grupos): solo `GroupMember` activos del grupo.

Ningún dato social es visible entre `club_id` distintos en el diseño actual (MVP ni fase 2/3) — cualquier función multi-club futura (p. ej. ranking entre clubes) requeriría un rediseño explícito de este punto, no incluido aquí.

## 7. Bloqueo de usuarios

- Se modela como `Friendship.status=blocked` (reutiliza la entidad existente en vez de crear una nueva tabla `Block` — decisión de diseño para mantener el modelo compacto en MVP).
- Efecto de un bloqueo, aplicado transversalmente:
  - Impide nuevas `MatchInvite` entre las dos partes.
  - Impide nuevos `Comment`/`Reaction` de la parte bloqueada sobre contenido de quien bloquea.
  - Impide nuevas `Challenge` y `GroupMember` (invitación) entre las partes.
  - Oculta mutuamente el contenido en el feed (`CommunityPost` de tipo `player_activity`), incluso si la visibilidad era `club`.
- El bloqueo es visible solo para quien lo ejecuta (la otra parte no recibe notificación de haber sido bloqueada) — mitigación de posible escalada de conflicto.
- Un bloqueo no deshace automáticamente la pertenencia a un `ClubGroup` compartido — requiere acción explícita adicional (abandonar o ser expulsado), documentado como decisión de diseño a revisar en implementación.

## 8. Reportes

- Cualquier `PLAYER`/`STAFF` puede crear un `Report` sobre `user`, `post`, `comment`, `group` o `event`.
- El reportante **no ve** el detalle de la resolución (`ModerationAction.notes`), solo el estado final (`resolved`/`dismissed`) — transparencia mínima sin exponer deliberaciones internas de moderación.
- El usuario reportado, si recibe una `ModerationAction` que le afecta (`warning`, `content_removed`, `user_suspended`, `user_banned`), recibe una `Notification` con un resumen genérico, sin exponer quién lo reportó (protección del reportante frente a represalias).
- Un `Report` no resuelto en un plazo razonable (a definir operativamente, no en este documento) debería escalar de `STAFF` a `ADMIN` — regla de proceso, no de esquema, pendiente de definir en implementación.

## 9. Moderación

- Flujo (igual que en el modelo de datos, sección 12, repetido aquí en clave de permisos): `STAFF` gestiona reportes dentro de su club; `ADMIN` puede escalar o revertir decisiones de `STAFF`; `SUPPORT` interviene solo si se le escala explícitamente un caso (p. ej. sospecha de abuso a nivel de plataforma, no de un club concreto).
- **Ninguna moderación se ejecuta de forma 100% automática sin revisión humana** en este diseño — regla explícita del prompt, aplicada como restricción de permisos: no existe ningún rol "sistema" con permiso de escritura en `ModerationAction`.
- Toda `ModerationAction` genera un `AuditLog` — sin excepción, sin opción de desactivarlo.

## 10. Logs

- `AuditLog` es de solo lectura para `ADMIN` (su club) y `SUPPORT` (todos los clubes) — ningún rol tiene permiso de escritura directa, solo el sistema.
- Ningún `PLAYER` ni `STAFF` tiene acceso de lectura a `AuditLog`, ni siquiera el suyo propio — se considera un registro de control interno, no una función de cara al usuario (a diferencia de `Notification`, que sí es user-facing).
- Recomendación de diseño futuro: exponer al usuario un resumen simplificado de "mi actividad" (basado en sus propias entidades, no en `AuditLog` directamente) si se requiere transparencia adicional — no incluido en MVP.

## 11. Consentimiento granular

- Cada acción de escritura sensible debe verificar el `PrivacyConsent` correspondiente **antes** de ejecutarse (regla de permiso, no solo de UI):
  - Crear `CommunityPost.post_type=player_activity` → requiere `appear_in_feed=true` vigente.
  - Aparecer en resultados de búsqueda de jugadores (fase 2) → requiere `searchable_by_others=true`.
  - Recibir `MatchInvite`/`Challenge` de un no-amigo (fase 2/3) → requiere `receive_non_friend_messages=true`.
  - Aparecer en búsqueda por zona (fase 3) → requiere `approximate_location=true`.
  - Generar `Notification` a terceros sobre la propia actividad → requiere `activity_sharing=true`.
- Revocar un consentimiento tiene efecto **inmediato y retroactivo**: el contenido ya creado bajo ese consentimiento deja de mostrarse (no se borra, se oculta — coherente con soft delete general del modelo).
- Ningún rol (`STAFF`/`ADMIN`/`SUPPORT`) puede otorgar ni revocar el consentimiento de un `PLAYER` en su nombre.

## 12. Recomendaciones futuras para Supabase RLS (sin ejecutar SQL real)

Cuando se autorice la implementación real (Prompt N en adelante), se recomienda el siguiente patrón de políticas por tabla — descrito en prosa, no como SQL ejecutable:

- **Política base en toda tabla social**: `club_id = current_setting('app.current_club_id')` (o equivalente vía JWT claim), replicando el mecanismo ya usado conceptualmente en el `tenant-runtime` auditado, sin reinventar el patrón de resolución de tenant.
- **Política de propiedad**: `user_id = auth.uid()` (o el mapeo equivalente a `auth_user_id`) para lectura/escritura de registros propios.
- **Política de visibilidad social**: función auxiliar (a diseñar en implementación) que resuelva `friends`/`club`/`private` contra `Friendship` y `UserProfile.club_id`, evaluada en la política de `SELECT`.
- **Política de rol**: `STAFF`/`ADMIN`/`SUPPORT` mediante un claim de rol en el JWT (ya existente en el sistema de auth real, no se crea uno nuevo), combinada con `club_id` para `STAFF`/`ADMIN` y sin restricción de `club_id` solo para `SUPPORT` en tablas de auditoría.
- **Tablas inmutables** (`AuditLog`, `ModerationAction`, `PrivacyConsent` tras creación): política de `UPDATE`/`DELETE` denegada por completo a nivel de RLS para todos los roles excepto procesos de sistema con service role, y solo para purga programada tras el plazo de retención.
- Antes de implementar cualquier política real, validar cada una contra los casos de prueba de `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` (este documento) como especificación, más revisión de seguridad dedicada (fuera de alcance de esta fase documental).

## 13. Qué NO entra todavía (recordatorio, alineado con el resto del catálogo)

- Chat libre real (Prompt L) — solo mensajería por plantillas en fase 2 (Prompt K), sin modelo de datos de chat detallado en este documento.
- Geolocalización real/en tiempo real (Prompt M) — solo aproximación por zona, opt-in, fase 3.
- Pagos reales — fuera de alcance total de la capa social.
- Datos reales de usuarios — todo este diseño y sus ejemplos son ficticios.
- Moderación por IA sin revisión humana — explícitamente excluida (sección 9).
- Integración con `App.jsx` — requiere autorización explícita (Prompt N).
- Migraciones Supabase reales — ninguna ejecutada ni planificada hasta autorización explícita posterior a este diseño.

## 14. Siguiente paso

Este documento, junto con `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` y `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md`, cierra el Prompt A. El siguiente paso recomendado por el catálogo es el **Prompt F — Consentimiento y privacidad** (flujos de UI y textos revisables), que puede apoyarse directamente en las secciones 9 y 11 de este documento sin necesidad de rediseñar el modelo de consentimiento desde cero.
