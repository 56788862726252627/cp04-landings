# Partidos abiertos / Buscar compañero — Comunidad Pádel 04
### Prompt D ejecutado — Diseño funcional, sin implementación

**Estado:** documento de diseño. Sin código funcional, sin Supabase real, sin integración en `App.jsx`.
**Fecha:** 2026-07-14
**Rama:** `docs-ui/comunidad-padel-partidos-abiertos-2026-07-14`
**Depende de:** `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md`, `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md`, `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md`, `FLUJOS_UI_MODERACION_REPORTES_COMUNIDAD_PADEL_04.md`, `PROTOTIPO_FEED_SOCIAL_COMUNIDAD_PADEL_04.md`, `PROTOTIPO_PERFIL_JUGADOR_COMUNIDAD_PADEL_04.md`, `UX_UI_COMPONENTES_COMUNIDAD_PADEL_04.md` (mismo directorio, ya mergeados en `main`).
**Documentos hermanos:** `FLUJOS_UI_PARTIDOS_ABIERTOS_COMUNIDAD_PADEL_04.md`, `REGLAS_MATCHMAKING_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `CHECKLIST_PARTIDOS_ABIERTOS_COMUNIDAD_PADEL_04.md`.
**Prototipo HTML:** `app/projects/club-padel-04/community-prototypes/partidos-abiertos.html`.

---

## 1. Resumen ejecutivo

Este documento diseña "Partidos abiertos / Buscar compañero", la función que el roadmap y la auditoría de capturas identifican como de mayor impacto comercial con menor esfuerzo (`MATRIZ_RIESGOS...` no aplica aquí, pero `AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md` sección 17 y `ROADMAP_COMUNIDAD_PADEL_04_PLAYTOMIC_VOLA.md` la sitúan como prioridad 1 del efecto red). Se apoya íntegramente en las entidades `OpenMatch` y `MatchInvite` ya mergeadas (`MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, secciones 6.9-6.10) y en las reglas de bloqueo/moderación ya diseñadas (Prompt E) — no redefine el modelo de datos, lo convierte en flujos operativos, reglas de matchmaking y un prototipo visual mock.

## 2. Objetivo funcional

Permitir que un jugador con hueco en su reserva (o que busca reservar y jugar con otros) publique o encuentre partidos abiertos por nivel, fecha y disponibilidad, sin sustituir el sistema de reservas real — esta función es una **capa social de visibilidad sobre una reserva**, nunca crea, modifica ni cancela una reserva real por sí misma (ya establecido en el modelo de datos, 6.9, nota).

## 3. Valor para jugadores

Encontrar rival/compañero sin depender de grupos de WhatsApp externos; visibilidad de partidos con hueco libre en su club; control total de a quién se muestra su disponibilidad (opt-in ya diseñado en el Prompt F).

## 4. Valor para el club

Mayor ocupación de pistas al facilitar que reservas con plazas libres se completen; percepción de comunidad activa; ningún cambio en el flujo de reservas ni en el cobro, que siguen siendo 100% del sistema real ya existente.

## 5. Valor para la Agencia IA

Es la función social más citada como diferenciador comercial frente a "solo reservas" (ya señalado en `ROADMAP_COMUNIDAD_PADEL_04_PLAYTOMIC_VOLA.md`, sección 5, y en la auditoría de capturas, sección 17) — el primer módulo social con lógica de negocio real (no solo contenido/perfil), útil como demo comercial concreta.

## 6. Alcance MVP

Crear/listar/filtrar partidos abiertos dentro de un mismo club; solicitar y aceptar/rechazar plazas; bloqueo efectivo entre usuarios; reportar partido; sin búsqueda cross-club, sin invitación directa a un jugador específico fuera del propio partido, sin geolocalización.

## 7. Alcance premium/futuro

Búsqueda de compañero proactiva (fase 2, sección 15), invitar a un jugador concreto a un partido ya creado (sección 10 de flujos UI), búsqueda cross-club con geolocalización aproximada opt-in (Prompt M, ya diseñado como fase 3), recomendaciones automáticas de partidos por afinidad de nivel (no incluida ni siquiera en fase 2 — ver sección 27).

## 8. Entidades implicadas

`OpenMatch` y `MatchInvite` (ya mergeadas, `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` 6.9-6.10), `Friendship` (para la regla de bloqueo, sección 22), `PlayerSocialProfile` (nivel, visibilidad), `Notification`, `Report`/`ModerationAction` (reportar partido), `PrivacyConsent` (`activity_sharing`, ya definido en el Prompt F). Ninguna entidad nueva se introduce en este documento — es diseño de flujo sobre el modelo ya cerrado.

## 9. Estados de un partido abierto

Reutiliza `OpenMatch.status` ya definido: `open` (con plazas libres) → `full` (completo, sin más solicitudes) → `completed` (fecha pasada, archivable) o `cancelled` (cancelado por el creador en cualquier momento previo a `completed`).

## 10. Estados de una invitación

Reutiliza `MatchInvite.status` ya definido: `pending` → `accepted`/`rejected` (decisión del creador) o `cancelled` (el propio solicitante retira su solicitud antes de que se resuelva).

## 11. Crear partido abierto

El jugador indica: fecha/hora (debe coincidir con una reserva real ya hecha — validado contra el sistema de reservas en integración futura, no en este diseño), nivel mínimo/máximo deseado, plazas totales (1-4, según el modelo de datos), visibilidad (`club`/`friends`). Requiere `activity_sharing` (ya definido en el Prompt F).

## 12. Unirse a partido abierto

Un jugador con nivel dentro del rango y sin bloqueo con el creador puede ver el partido (según su `visibility`) y solicitar plaza (sección 13). No hay unión automática — toda incorporación pasa por solicitud y aceptación (ver flujo 5-6 de `FLUJOS_UI_PARTIDOS_ABIERTOS_COMUNIDAD_PADEL_04.md`).

## 13. Solicitar plaza

Crea un `MatchInvite(status=pending)`. Un jugador no puede tener más de una solicitud `pending` simultánea sobre el mismo `OpenMatch` (regla de validación, ya anticipada en el modelo de datos).

## 14. Aceptar/rechazar solicitud

Solo el `creator_id` del `OpenMatch` decide. Aceptar incrementa `slots_filled`; si se alcanza `slots_total`, el partido pasa a `full` automáticamente (regla de negocio ya anticipada en 6.9-6.10 del modelo de datos).

## 15. Buscar compañero

**Fase 2, no MVP** (distinto de "ver listado de partidos abiertos", que sí es MVP): una búsqueda proactiva por nivel/disponibilidad entre jugadores que no tienen un `OpenMatch` publicado todavía, para conectar a dos personas que ambas quieren jugar sin que ninguna haya creado un partido — requiere `searchable_by_others` (ya definido en el Prompt F), no solo `activity_sharing`.

## 16. Filtros recomendados

Nivel (rango), fecha, modalidad (si aplica, individual/dobles — el modelo de datos no distingue modalidad explícitamente; se recomienda tratarla como parte de `related_booking_id` referenciado, no un campo nuevo en `OpenMatch`), estado (`open` por defecto, con opción de ver `full` para lista de espera informal). "Pista" se muestra como referencia informativa desde `related_booking_id`, nunca como filtro editable en esta capa (la pista la determina la reserva real).

## 17. Nivel de juego

Mismo criterio ya establecido en `PlayerSocialProfile.level_declared` (iniciación/intermedio/avanzado/profesional) — el `level_min`/`level_max` de un `OpenMatch` se define sobre esta misma escala de 4 valores, sin escala numérica adicional, para no fragmentar el sistema de nivel ya diseñado.

## 18. Disponibilidad

La disponibilidad general del perfil (`PlayerSocialProfile.visibility_availability`) es informativa; la disponibilidad real y accionable para partidos abiertos es siempre la de un `OpenMatch` concreto con fecha/hora exacta — evita prometer un calendario completo no soportado por el modelo de datos actual.

## 19. Privacidad por defecto

Un `OpenMatch` nace con `visibility=club` como máximo (nunca cross-club, coherente con el resto del catálogo) y puede restringirse a `friends`. Nunca se muestra la ubicación exacta del jugador, solo el club y la pista de la reserva asociada (dato ya público para quien tiene acceso al club).

## 20. Consentimiento requerido

`activity_sharing` para crear/unirse a partidos abiertos (ya establecido en `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección 8, y en el flujo 4 de `FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md`). `searchable_by_others` adicional para la función de "Buscar compañero" (fase 2, sección 15).

## 21. Bloqueos y reportes

Reportar un `OpenMatch` genera un `Report(target_type=event)` — nota: el modelo de datos actual no tiene `target_type=open_match` explícito; se recomienda usar `event` como aproximación o, en implementación real, ampliar el enum (**punto a decidir en el Prompt N**, no resuelto aquí para no modificar el modelo ya mergeado sin autorización). Bloquear al creador de un partido oculta ese partido de la vista del bloqueado (regla ya general de bloqueo, `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección 7).

## 22. Regla crítica: usuarios bloqueados no pueden crear invitaciones entre sí

Ya anticipada en la auditoría del Prompt E (`MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md`, sección 24) y confirmada aquí como regla de validación explícita: **ningún `MatchInvite` puede crearse si existe `Friendship.status=blocked` entre `requester_id` y `creator_id` del `OpenMatch`, en cualquier dirección del bloqueo**. Esta regla debe validarse tanto al listar (el partido no debe ni mostrarse) como al solicitar (doble barrera, defensa en profundidad). Ver detalle en `REGLAS_MATCHMAKING_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección de bloqueo.

## 23. Moderación

Mismo flujo ya diseñado en el Prompt E: `Report` → cola STAFF → `ModerationAction` si procede (p. ej. `content_removed` cancela el `OpenMatch`, no solo lo oculta). Ninguna acción automática sin revisión humana (mismo principio, reafirmado).

## 24. Notificaciones mock

`Notification(notification_type=match_invite)` al creador cuando alguien solicita plaza; al solicitante cuando se acepta/rechaza; sin proveedor push/email real, igual que el resto del catálogo (Prompt A, sección 6.17).

## 25. Riesgos RGPD

Un `OpenMatch` revela disponibilidad y ubicación (club) del creador en una fecha concreta — ya señalado como riesgo medio en `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` (6.9) y mitigado con `activity_sharing` + visibilidad restrictiva por defecto (sección 19). Ninguna geolocalización exacta en el MVP.

## 26. Riesgos de abuso

Partidos falsos/spam (mitigado con reporte + moderación, sección 23); acoso a través de solicitudes repetidas de un usuario ya rechazado (mitigado con la regla de bloqueo, sección 22, y con el límite de una solicitud `pending` simultánea, sección 13); uso de "nivel" declarado falsamente para acceder a partidos de nivel superior con fines de acoso (riesgo residual, no resuelto técnicamente — mitigación social vía reporte, no automatización).

## 27. Qué NO entra todavía

Recomendaciones automáticas de partidos (matching algorítmico), geolocalización real, invitación directa a un jugador fuera de un partido ya creado (fase 2, sección 10 de flujos UI), integración real con el sistema de reservas (solo referencia de solo lectura vía `related_booking_id`), pagos o reparto de coste de pista entre los jugadores del partido, chat entre los participantes del partido (se apoya en Prompts K/L, no en este documento), integración con `App.jsx`, Supabase real, migraciones SQL reales.

## 28. MVP recomendado

Ver listado de partidos abiertos, crear partido abierto, editar/cancelar partido propio, solicitar plaza, aceptar/rechazar solicitud, abandonar partido, reportar partido, bloquear desde partido — 8 de los 15 flujos de `FLUJOS_UI_PARTIDOS_ABIERTOS_COMUNIDAD_PADEL_04.md`. "Buscar compañero" e "Invitar jugador" quedan documentados pero marcados fase 2 (secciones 15 y 27).

## 29. Checklist antes de implementación

- [ ] Decidir el `target_type` de `Report` para partidos abiertos (`event` como aproximación vs. ampliar el enum) antes de implementar reportar partido — señalado en sección 21.
- [ ] Confirmar contra el sistema de reservas real, en integración futura, que `related_booking_id` es válido y pertenece al creador — validación de negocio no resuelta en este diseño.
- [ ] Tests específicos de la regla de bloqueo (sección 22) antes de cualquier implementación real — dos barreras (listado + solicitud), no solo una.
- [ ] Ninguna implementación real hasta autorización explícita (Prompt N).

## 30. Siguiente prompt recomendado

Con Partidos abiertos diseñado (Prompt D), el catálogo recomienda avanzar al **Prompt G — Amigos y seguidores** (lógica aislada + tests), que completa el ciclo social básico ya iniciado por el bloqueo (`Friendship`) y permite enriquecer la visibilidad `friends` ya usada en partidos abiertos, feed y perfil.
