# Matriz de acciones de moderación — Comunidad Pádel 04

**Estado:** documento de diseño/especificación operativa. No sustituye una política de comunidad formal, que debe redactar el club/Legal antes de publicarse.
**Fecha:** 2026-07-14
**Depende de:** `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md`, `FLUJOS_UI_MODERACION_REPORTES_COMUNIDAD_PADEL_04.md`.

Escala de severidad: Baja / Media / Alta / Crítica (coherente con la escala ya usada en `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`).

---

| # | Acción | Quién puede iniciarla | Quién puede verla | Quién puede resolverla | Entidad afectada | Dato afectado | Severidad | Estado inicial | Estados posibles | Log requerido | Notificación requerida | Retención recomendada | Revisión legal |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Reportar publicación | PLAYER/STAFF/ADMIN | Reportante (propio), STAFF/ADMIN del club, SUPPORT | STAFF/ADMIN | `CommunityPost` | `Report` | Media | `open` | `open→in_review→resolved/dismissed` | Sí | No al crear; sí al resolver | 24 meses | Sí |
| 2 | Reportar perfil | PLAYER/STAFF/ADMIN | Igual que #1 | STAFF/ADMIN | `UserProfile`/`PlayerSocialProfile` | `Report` | Media-Alta | `open` | Igual que #1 | Sí | Igual que #1 | 24 meses | Sí |
| 3 | Reportar comentario | PLAYER/STAFF/ADMIN | Igual que #1 | STAFF/ADMIN | `Comment` | `Report` | Baja-Media | `open` | Igual que #1 | Sí | Igual que #1 | 24 meses | Sí |
| 4 | Reportar grupo (fase 2) | PLAYER/STAFF/ADMIN | Igual que #1 | STAFF/ADMIN | `ClubGroup` | `Report` | Media | `open` | Igual que #1 | Sí | Igual que #1 | 24 meses | Sí |
| 5 | Reportar evento | PLAYER/STAFF/ADMIN | Igual que #1 | STAFF/ADMIN | `Event` | `Report` | Baja-Media | `open` | Igual que #1 | Sí | Igual que #1 | 24 meses | No |
| 6 | Bloquear usuario | PLAYER (cualquier rol en su faceta de jugador) | Solo quien bloquea | No requiere resolución (autoservicio) | `Friendship` | `Friendship.status` | Baja (protectora) | `blocked` | `blocked→(activo si se desbloquea)` | Sí | No (la otra parte no se entera) | Indefinida mientras exista | No |
| 7 | Desbloquear usuario | Quien bloqueó | Solo quien desbloquea | No requiere resolución | `Friendship` | `Friendship.status` | Baja | `blocked` | `blocked→activo` | Sí | No | Igual que #6 | No |
| 8 | Ocultar publicación (local) | PLAYER | Solo quien oculta | No aplica (no es moderación) | Preferencia local | Ninguno persistente en `Report` | Baja | No aplica | No aplica | No | No | No aplica | No |
| 9 | Marcar reporte "en revisión" | STAFF/ADMIN/SUPPORT | STAFF/ADMIN del club, SUPPORT | STAFF/ADMIN | `Report` | `Report.status` | Baja | `open` | `open→in_review` | Sí | No | 24 meses | No |
| 10 | Desestimar reporte (`dismissed`) | STAFF/ADMIN/SUPPORT | Igual que #9 | STAFF/ADMIN | `Report` | `Report.status` | Baja | `in_review` | `in_review→dismissed` | Sí | Sí, al reportante (estado, sin detalle) | 24 meses | No |
| 11 | Advertencia (`warning`) | STAFF/ADMIN | Igual que #9 + usuario sancionado (resumen) | STAFF/ADMIN | `ModerationAction` | Cuenta del usuario reportado | Media | `in_review` | `in_review→resolved` | Sí | Sí, al sancionado (resumen genérico) | 24 meses mínimo | Sí |
| 12 | Retirar contenido (`content_removed`) | STAFF/ADMIN | Igual que #11 | STAFF/ADMIN | `CommunityPost`/`Comment`/perfil | Contenido + `ModerationAction` | Media-Alta | `in_review` | `in_review→resolved` | Sí | Sí, al autor del contenido | 24 meses mínimo | Sí |
| 13 | Suspender usuario (`user_suspended`) | ADMIN (STAFF puede proponer, no ejecutar) | Igual que #11 | Solo ADMIN | `UserProfile` (capa social) | Acceso social del usuario | Alta | `in_review`/escalado | `in_review→resolved` | Sí | Sí, al suspendido | 24 meses mínimo | Sí |
| 14 | Banear usuario (`user_banned`) | ADMIN | Igual que #11 | Solo ADMIN | `UserProfile` (capa social) | Acceso social del usuario | Crítica | `in_review`/escalado | `in_review→resolved` | Sí | Sí, al baneado | 24 meses mínimo (evaluar retención más larga por reincidencia) | Sí |
| 15 | Revertir una `ModerationAction` previa | ADMIN | Igual que #11 | Solo ADMIN | `ModerationAction` (nueva, referencia a la anterior) | Decisión de moderación previa | Alta | N/A (acción correctiva) | Se crea una `ModerationAction` nueva; la anterior queda inmutable | Sí | Sí, a la parte afectada por la reversión | 24 meses mínimo | Sí |
| 16 | Escalar a SUPPORT | ADMIN (o ausencia de STAFF/ADMIN activo) | SUPPORT + ADMIN que escaló | SUPPORT | `Report`/`ModerationAction` | Igual que el reporte original | Variable (según el caso escalado) | `in_review` | `in_review→resolved` (por SUPPORT) | Sí, con `actor_id=SUPPORT` explícito | Igual que la acción final tomada | Igual que la acción final tomada | Sí |
| 17 | Solicitar revisión de una sanción (apelación vía nuevo `Report`) | El usuario sancionado | STAFF/ADMIN distinto al que decidió, si es posible; si no, el mismo con nota | ADMIN (preferente sobre el STAFF original) | `Report` nuevo, `target_type` referenciando la `ModerationAction` | `Report` + `ModerationAction` original | Media-Alta | `open` | `open→in_review→resolved/dismissed` | Sí | Sí, al usuario que solicitó revisión | 24 meses | Sí |

---

## Notas de lectura de la matriz

- Las acciones **6, 7, 8** (bloquear, desbloquear, ocultar) son deliberadamente de **baja severidad y sin resolución de terceros** — son autoservicio del propio usuario, coherente con el principio de "protección por defecto sin fricción" ya establecido en `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md`, sección 3.
- Las acciones **13 y 14** (suspender/banear) son las únicas reservadas exclusivamente a `ADMIN` — ningún `STAFF` puede ejecutarlas directamente, solo proponerlas escalando el reporte (ya establecido en la sección 13 del documento de moderación).
- La acción **17** (solicitar revisión) es la vía de reclamación del usuario sancionado — su existencia es la mitigación directa del riesgo "sanción sin vía de reclamación" señalado en el flujo 8 de `FLUJOS_UI_MODERACION_REPORTES_COMUNIDAD_PADEL_04.md`.
- **12 de las 17 acciones están marcadas "Revisión legal: Sí"** — ninguna debe considerarse cerrada hasta validación por abogado/DPO real, coherente con el criterio ya aplicado en `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`.
