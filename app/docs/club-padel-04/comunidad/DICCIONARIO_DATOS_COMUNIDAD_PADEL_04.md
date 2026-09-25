# Diccionario de datos — Comunidad Pádel 04
### Detalle campo a campo del modelo de datos social

**Estado:** documento de diseño técnico. Sin código, sin migraciones reales.
**Fecha:** 2026-07-14
**Depende de:** `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` (mismo directorio) — este documento detalla cada campo definido allí.

**Aviso:** todos los ejemplos de esta tabla son **ficticios**, generados solo para ilustrar el tipo de dato. No corresponden a ninguna persona real ni a datos extraídos de Playtomic, Vola o de la base de datos real de Club Pádel 04.

Leyenda de columnas: **Personal** = ¿identifica o puede identificar a una persona? · **Sensible** = ¿categoría especial del art. 9 RGPD o de alto impacto si se filtra? · **Base jurídica** = fundamento legal sugerido (a validar con asesoría legal real antes de implementar) · **Retención** = resumen; el detalle completo de reglas está en la sección 27 de `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`.

---

## UserProfile

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `a1b2c3d4-...` | No | No | — | Vida de la cuenta | PK |
| club_id | uuid | Tenant / club al que pertenece | `club-antequera-01` | No | No | — | Vida de la cuenta | FK lógica a tenant |
| auth_user_id | text | Referencia opaca a la identidad real de autenticación | `auth_9f8e...` | Sí (indirectamente) | No | Ejecución de contrato | Vida de la cuenta | No es el token ni la contraseña |
| display_name | text | Nombre visible en la comunidad | `Jugador_Demo_23` | Sí | No | Consentimiento | Vida de la cuenta | Puede ser alias, no obliga a nombre real |
| role | enum | Rol de la cuenta | `PLAYER` | No | No | — | Vida de la cuenta | Mismos roles que la app real |
| created_at | timestamptz | Alta del perfil | `2026-07-14T10:00:00Z` | No | No | — | Vida de la cuenta | — |
| deactivated_at | timestamptz | Fecha de baja/desactivación | `null` | No | No | — | — | Null mientras activo |

## PlayerSocialProfile

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `b2c3...` | No | No | — | 30 días tras baja | PK |
| user_profile_id | uuid | FK a UserProfile | `a1b2c3d4-...` | No | No | — | Igual que padre | — |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | Igual que padre | — |
| level_declared | enum | Nivel autodeclarado | `intermedio` | No | No | Consentimiento | Igual que padre | No oficial, debe etiquetarse |
| bio | text | Biografía corta | `"Me gusta jugar los fines de semana"` | Sí (potencial) | No | Consentimiento | Igual que padre | Máx. 280 car. |
| avatar_url | text | Foto de perfil | `https://.../avatar_demo.jpg` | Sí | No (salvo imagen sensible) | Consentimiento | Igual que padre | Requiere consentimiento explícito de imagen |
| visibility_level | enum | Visibilidad general del perfil | `friends` | No | No | — | Igual que padre | Default restrictivo |
| visibility_matches_played | enum | Visibilidad de partidos jugados | `private` | No | No | — | Igual que padre | Default restrictivo |
| visibility_availability | enum | Visibilidad de disponibilidad | `private` | No | No | — | Igual que padre | Default restrictivo |
| created_at | timestamptz | Alta | `2026-07-14T10:05:00Z` | No | No | — | — | — |
| updated_at | timestamptz | Última edición | `2026-07-14T11:00:00Z` | No | No | — | — | — |

## PlayerStats

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `c3d4...` | No | No | — | Igual que PlayerSocialProfile | PK |
| user_profile_id | uuid | FK | `a1b2c3d4-...` | No | No | — | — | — |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| matches_played_count | integer | Nº partidos jugados (social) | `12` | Sí (si asociado a nombre) | No | Consentimiento | — | Derivado, recalculado por sistema |
| matches_won_count | integer | Nº partidos ganados | `7` | Sí | No | Consentimiento | — | Derivado |
| current_streak | integer | Racha actual | `3` | Sí | No | Consentimiento | — | Derivado |
| last_activity_at | timestamptz | Última actividad | `2026-07-13T18:00:00Z` | Sí | No | Consentimiento | — | Revela patrón de uso |
| updated_at | timestamptz | Última recalculación | `2026-07-14T09:00:00Z` | No | No | — | — | — |

## Friendship

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `d4e5...` | No | No | — | Ver regla en modelo | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| requester_id | uuid | FK, quien solicita | `a1b2...` | Sí (relación) | No | Consentimiento | — | — |
| addressee_id | uuid | FK, quien recibe | `e5f6...` | Sí (relación) | No | Consentimiento | — | — |
| status | enum | Estado de la relación | `accepted` | No | No | — | — | `blocked` se conserva indefinidamente |
| created_at | timestamptz | Fecha de solicitud | `2026-07-10T12:00:00Z` | No | No | — | — | — |
| responded_at | timestamptz | Fecha de respuesta | `2026-07-10T14:30:00Z` | No | No | — | — | — |

## Follow (fase 2)

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `f6g7...` | No | No | — | Mientras exista | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| follower_id | uuid | FK, quien sigue | `a1b2...` | Sí (relación) | No | Consentimiento | — | — |
| followed_id | uuid | FK, seguido | `e5f6...` | Sí (relación) | No | Consentimiento | — | — |
| created_at | timestamptz | Fecha de inicio | `2026-08-01T09:00:00Z` | No | No | — | — | Fase 2, no MVP |

## CommunityPost

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `g7h8...` | No | No | — | 12 meses tras borrado | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| author_id | uuid | FK autor | `a1b2...` | Sí | No | Consentimiento | — | — |
| post_type | enum | Tipo de publicación | `player_activity` | No | No | — | — | — |
| body | text | Contenido del post | `"¡Buen partido hoy!"` | Sí (potencial) | No | Consentimiento | — | Máx. 500 car., puede mencionar terceros |
| visibility | enum | Visibilidad | `friends` | No | No | — | — | — |
| related_entity_type | text | Tipo de entidad relacionada | `OpenMatch` | No | No | — | — | Referencia polimórfica |
| related_entity_id | uuid | ID de entidad relacionada | `m1n2...` | No | No | — | — | Sin FK real |
| created_at | timestamptz | Fecha de publicación | `2026-07-14T18:00:00Z` | No | No | — | — | — |
| deleted_at | timestamptz | Fecha de borrado (soft) | `null` | No | No | — | — | Purga a los 12 meses |

## Comment

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `h8i9...` | No | No | — | Igual que post | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| post_id | uuid | FK al post | `g7h8...` | No | No | — | — | — |
| author_id | uuid | FK autor | `e5f6...` | Sí | No | Consentimiento | — | — |
| body | text | Contenido del comentario | `"¡Enhorabuena!"` | Sí (potencial) | No | Consentimiento | — | Máx. 280 car. |
| created_at | timestamptz | Fecha | `2026-07-14T18:05:00Z` | No | No | — | — | — |
| deleted_at | timestamptz | Borrado (soft) | `null` | No | No | — | — | — |

## Reaction

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `i9j0...` | No | No | — | Mientras exista contenido | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| target_type | enum | `post` o `comment` | `post` | No | No | — | — | — |
| target_id | uuid | ID del contenido | `g7h8...` | No | No | — | — | — |
| user_id | uuid | FK quien reacciona | `a1b2...` | Sí | No | Consentimiento | — | — |
| reaction_type | enum | Tipo de reacción | `like` | No | No | — | — | Único tipo en MVP |
| created_at | timestamptz | Fecha | `2026-07-14T18:10:00Z` | No | No | — | — | — |

## OpenMatch

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `j0k1...` | No | No | — | 90 días tras la fecha | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| creator_id | uuid | FK creador | `a1b2...` | Sí | No | Consentimiento | — | — |
| related_booking_id | text | Referencia externa a reserva real | `res_20260720_p3` | No (solo referencia) | No | — | — | No duplica el modelo de reservas |
| level_min | enum | Nivel mínimo | `intermedio` | No | No | — | — | — |
| level_max | enum | Nivel máximo | `avanzado` | No | No | — | — | — |
| scheduled_at | timestamptz | Fecha del partido | `2026-07-20T19:00:00Z` | No | No | — | — | Revela disponibilidad del creador |
| slots_total | integer | Plazas totales | `4` | No | No | — | — | — |
| slots_filled | integer | Plazas ocupadas | `2` | No | No | — | — | — |
| status | enum | Estado | `open` | No | No | — | — | — |
| visibility | enum | Visibilidad | `club` | No | No | — | — | — |
| created_at | timestamptz | Fecha de creación | `2026-07-14T09:00:00Z` | No | No | — | — | — |
| cancelled_at | timestamptz | Fecha de cancelación | `null` | No | No | — | — | — |

## MatchInvite

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `k1l2...` | No | No | — | Igual que OpenMatch | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| open_match_id | uuid | FK al partido | `j0k1...` | No | No | — | — | — |
| requester_id | uuid | FK solicitante | `e5f6...` | Sí | No | Consentimiento | — | — |
| status | enum | Estado de la solicitud | `pending` | No | No | — | — | — |
| created_at | timestamptz | Fecha de solicitud | `2026-07-14T10:00:00Z` | No | No | — | — | — |
| responded_at | timestamptz | Fecha de respuesta | `null` | No | No | — | — | — |

## ClubGroup (fase 2)

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `l2m3...` | No | No | — | Archivado tras 12 meses inactivo | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| name | text | Nombre del grupo | `"Nivel intermedio - Lunes"` | No | No | — | — | — |
| description | text | Descripción | `"Grupo para jugar los lunes"` | No | No | — | — | — |
| is_official | boolean | Creado por el club | `false` | No | No | — | — | — |
| visibility | enum | Visibilidad | `invite_only` | No | No | — | — | — |
| created_by | uuid | FK creador | `a1b2...` | Sí | No | Consentimiento | — | — |
| created_at | timestamptz | Fecha de creación | `2026-08-01T10:00:00Z` | No | No | — | — | Fase 2, no MVP |
| archived_at | timestamptz | Fecha de archivado | `null` | No | No | — | — | — |

## GroupMember (fase 2)

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `m3n4...` | No | No | — | Igual que ClubGroup | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| group_id | uuid | FK grupo | `l2m3...` | No | No | — | — | — |
| user_id | uuid | FK usuario | `e5f6...` | Sí (relación) | No | Consentimiento | — | Revela asociación con el grupo |
| group_role | enum | Rol dentro del grupo | `member` | No | No | — | — | — |
| joined_at | timestamptz | Fecha de ingreso | `2026-08-01T10:05:00Z` | No | No | — | — | — |
| left_at | timestamptz | Fecha de salida | `null` | No | No | — | — | — |

## Challenge (fase 2)

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `n4o5...` | No | No | — | Ligada a temporada | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| creator_id | uuid | FK creador | `a1b2...` | Sí | No | Consentimiento | — | — |
| opponent_id | uuid | FK oponente individual | `e5f6...` | Sí | No | Consentimiento | — | Opcional |
| opponent_group_id | uuid | FK grupo oponente | `null` | No | No | — | — | Opcional |
| challenge_type | enum | Tipo | `individual` | No | No | — | — | — |
| description | text | Descripción del reto | `"Al mejor de 3 sets"` | No | No | — | — | — |
| status | enum | Estado | `proposed` | No | No | — | — | — |
| result_summary | text | Resultado | `"6-4, 6-3"` | Sí (asociado a personas) | No | Consentimiento | — | Requiere doble confirmación |
| created_at | timestamptz | Fecha de creación | `2026-08-05T10:00:00Z` | No | No | — | — | Fase 2, no MVP |
| resolved_at | timestamptz | Fecha de resolución | `null` | No | No | — | — | — |

## Event

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `o5p6...` | No | No | — | 90 días tras la fecha | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| organizer_id | uuid | FK organizador | `a1b2...` | Sí | No | Consentimiento | — | — |
| event_type | enum | Tipo de evento | `clinic` | No | No | — | — | — |
| title | text | Título | `"Clase iniciación sábados"` | No | No | — | — | — |
| description | text | Descripción | `"Clase para nivel iniciación"` | No | No | — | — | — |
| scheduled_at | timestamptz | Fecha del evento | `2026-08-02T10:00:00Z` | No | No | — | — | — |
| capacity | integer | Aforo máximo | `8` | No | No | — | — | — |
| status | enum | Estado | `published` | No | No | — | — | — |
| is_official | boolean | Organizado por el club | `true` | No | No | — | — | — |
| created_at | timestamptz | Fecha de creación | `2026-07-14T09:00:00Z` | No | No | — | — | — |

## EventRegistration

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `p6q7...` | No | No | — | Igual que Event | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| event_id | uuid | FK evento | `o5p6...` | No | No | — | — | — |
| user_id | uuid | FK usuario inscrito | `e5f6...` | Sí | No | Consentimiento | — | — |
| status | enum | Estado de la inscripción | `registered` | No | No | — | — | — |
| registered_at | timestamptz | Fecha de inscripción | `2026-07-15T09:00:00Z` | No | No | — | — | — |
| cancelled_at | timestamptz | Fecha de cancelación | `null` | No | No | — | — | — |

## SocialRanking (fase 2)

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `q7r8...` | No | No | — | Archivado al cerrar temporada | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| user_id | uuid | FK jugador | `a1b2...` | Sí | No | Consentimiento | — | — |
| season_id | text | Temporada | `2026-S2` | No | No | — | — | — |
| points | integer | Puntos acumulados | `340` | Sí (asociado a persona) | No | Consentimiento | — | — |
| position | integer | Posición calculada | `5` | Sí | No | Consentimiento | — | Debe etiquetarse "no oficial" |
| updated_at | timestamptz | Última actualización | `2026-08-10T12:00:00Z` | No | No | — | — | Fase 2, no MVP |

## Notification

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `r8s9...` | No | No | — | 90 días | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| user_id | uuid | FK destinatario | `a1b2...` | Sí | No | Ejecución de contrato | — | — |
| notification_type | enum | Tipo | `match_invite` | No | No | — | — | — |
| payload | jsonb | Datos de la notificación | `{"open_match_id":"j0k1..."}` | Sí (potencial) | No | Ejecución de contrato | — | Minimizar datos de terceros |
| read_at | timestamptz | Fecha de lectura | `null` | No | No | — | — | — |
| created_at | timestamptz | Fecha de creación | `2026-07-14T10:01:00Z` | No | No | — | — | — |

## Report

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `s9t0...` | No | No | — | 24 meses | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| reporter_id | uuid | FK reportante | `a1b2...` | Sí | No | Interés legítimo | — | — |
| target_type | enum | Tipo de objetivo | `user` | No | No | — | — | — |
| target_id | uuid | ID del objetivo | `e5f6...` | Sí (si target=user) | Potencialmente sí | Interés legítimo | — | Referencia polimórfica |
| reason | enum | Motivo | `harassment` | No | No | — | — | — |
| details | text | Detalle del reporte | `"Mensajes insistentes tras rechazar partido"` | Sí (sobre el reportado) | Sí (valoración subjetiva) | Interés legítimo | — | Máx. 500 car. |
| status | enum | Estado | `open` | No | No | — | — | — |
| created_at | timestamptz | Fecha | `2026-07-14T20:00:00Z` | No | No | — | — | — |
| resolved_at | timestamptz | Fecha de resolución | `null` | No | No | — | — | — |

## ModerationAction

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `t0u1...` | No | No | — | 24 meses mínimo | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| report_id | uuid | FK al reporte | `s9t0...` | No | No | — | — | — |
| moderator_id | uuid | FK moderador | `staff_01` | Sí (del moderador) | No | Interés legítimo | — | — |
| action_type | enum | Tipo de acción | `warning` | No | No | — | — | — |
| notes | text | Notas internas | `"Primer aviso, sin reincidencia previa"` | Sí (sobre el afectado) | Sí | Interés legítimo | — | No expuesto al usuario afectado |
| created_at | timestamptz | Fecha | `2026-07-14T21:00:00Z` | No | No | — | — | Inmutable |

## PrivacyConsent

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `u1v2...` | No | No | — | Vida de cuenta + 5 años | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| user_id | uuid | FK usuario | `a1b2...` | Sí | No | — (es la base del resto) | — | — |
| consent_type | enum | Tipo de consentimiento | `appear_in_feed` | No | No | — | — | — |
| granted | boolean | Otorgado o no | `true` | No | No | — | — | — |
| granted_at | timestamptz | Fecha de otorgamiento | `2026-07-14T10:00:00Z` | No | No | — | — | — |
| revoked_at | timestamptz | Fecha de revocación | `null` | No | No | — | — | — |
| consent_version | text | Versión del texto aceptado | `v1.0-2026-07-14` | No | No | — | — | Trazabilidad del texto exacto aceptado |

## AuditLog

| Campo | Tipo | Descripción | Ejemplo ficticio | Personal | Sensible | Base jurídica | Retención | Observaciones |
|---|---|---|---|---|---|---|---|---|
| id | uuid | Identificador interno | `v2w3...` | No | No | — | 24 meses | PK |
| club_id | uuid | Tenant | `club-antequera-01` | No | No | — | — | — |
| actor_id | uuid | FK quien ejecuta la acción | `staff_01` | Sí | No | Interés legítimo | — | Null si es acción de sistema |
| action | text | Acción registrada | `friendship.blocked` | No | No | — | — | — |
| target_type | text | Tipo de entidad afectada | `Friendship` | No | No | — | — | — |
| target_id | uuid | ID de la entidad afectada | `d4e5...` | No | No | — | — | — |
| metadata | jsonb | Contexto adicional | `{"reason":"user_request"}` | Potencialmente | Potencialmente | Interés legítimo | — | Minimizar datos personales en este campo |
| created_at | timestamptz | Fecha del evento | `2026-07-14T21:05:00Z` | No | No | — | — | Inmutable |

---

## Resumen de exposición de datos personales/sensibles

- **21 entidades**, de las cuales **17 contienen al menos un campo personal** (directo o por relación) y **4 contienen al menos un campo potencialmente sensible** en sentido amplio de "alto impacto si se filtra" (`Report`, `ModerationAction`, `AuditLog.metadata`, `CommunityPost.body`/`Comment.body` por posible mención de terceros) — ninguna corresponde a categorías especiales del art. 9 RGPD (salud, orientación, religión, etc.) en el diseño actual, salvo que un usuario las introduzca voluntariamente en texto libre (`bio`, `body`, `description`), lo cual es un riesgo residual inherente a cualquier campo de texto libre, no mitigable solo con esquema de datos.
- Base jurídica dominante: **consentimiento** (mayoría de campos sociales) e **interés legítimo** (moderación, auditoría) — ambas requieren validación legal externa antes de implementación real (ya señalado en el checklist del modelo de datos).
