# Reglas de matchmaking y privacidad — Partidos abiertos (Comunidad Pádel 04)

**Estado:** documento de reglas de negocio y privacidad. Sin código, sin Supabase real.
**Fecha:** 2026-07-14
**Depende de:** `PARTIDOS_ABIERTOS_BUSCAR_COMPANERO_COMUNIDAD_PADEL_04.md`, `FLUJOS_UI_PARTIDOS_ABIERTOS_COMUNIDAD_PADEL_04.md`, `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md`.

---

## Reglas de visibilidad

Un `OpenMatch` es visible según su propio `visibility` (`club`/`friends`), nunca según la visibilidad general del perfil del creador — son dos configuraciones independientes (un jugador puede tener el perfil muy restrictivo y aun así publicar un partido visible a todo el club, y viceversa). Ningún `OpenMatch` es visible fuera del `club_id` del creador, sin excepción, en el diseño actual (MVP ni fase 2).

## Reglas de nivel

`level_min`/`level_max` se definen sobre la escala de 4 valores ya establecida (`iniciación`/`intermedio`/`avanzado`/`profesional`), nunca sobre una escala numérica nueva. Un jugador fuera de rango puede seguir viendo el partido en el listado (transparencia), pero el sistema debe advertir visualmente que su nivel no coincide antes de que solicite plaza — no se le impide solicitar (el creador decide, ver `MODERACION_REPORTES_ROLES...md` sección 3, principio de no obligar), pero sí se le informa para evitar solicitudes por desconocimiento.

## Reglas de disponibilidad

La única disponibilidad accionable es la de un `OpenMatch` concreto (fecha/hora exacta de una reserva real). El campo general `PlayerSocialProfile.visibility_availability` es puramente informativo en el perfil y no genera ni filtra partidos automáticamente — evita prometer un sistema de calendario/disponibilidad recurrente no soportado por el modelo de datos actual.

## Reglas de privacidad

Ningún dato de ubicación exacta (dirección del club, coordenadas) se muestra en ningún momento — solo el nombre del club (ya público para cualquier socio) y la pista referenciada desde la reserva real. La identidad de quienes solicitaron y fueron rechazados nunca es visible a otros solicitantes (cada `MatchInvite` es visible solo a las dos partes implicadas, ya establecido en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`).

## Reglas de bloqueo

Regla crítica (ya establecida en el documento funcional, sección 22): un `MatchInvite` no puede crearse si existe `Friendship.status=blocked` entre las partes, en cualquier dirección. Aplica en dos puntos de control: (1) al listar — un `OpenMatch` de un usuario bloqueado no aparece en el listado del otro; (2) al solicitar — aunque por algún fallo de UI el partido fuera visible, la creación del `MatchInvite` debe fallar de todas formas (defensa en profundidad, nunca confiar solo en el filtrado de listado).

## Reglas de reportes

Reportar un `OpenMatch` sigue el mismo flujo ya diseñado en el Prompt E (`Report` → cola STAFF → `ModerationAction`), sin gate de consentimiento, con el reportante siempre anónimo frente al creador reportado. Pendiente de decisión técnica (no resuelta en este documento): si `Report.target_type` usa `event` como aproximación o si se amplía el enum en implementación real — ver checklist.

## Reglas antiabuso

- Máximo una solicitud `pending` simultánea por jugador y partido (ya establecida).
- Límite operativo (no numérico fijo en este documento) de partidos activos simultáneos por creador, para prevenir spam de publicaciones.
- Límite operativo de invitaciones directas simultáneas por creador (fase 2, "Invitar jugador"), mismo motivo.
- Ninguna de estas cifras se define aquí como número exacto — se recomienda definirlas operativamente por club o de forma global en implementación real, con capacidad de ajuste sin cambio de modelo de datos.

## Reglas de notificación

`Notification(notification_type=match_invite)` para: nueva solicitud recibida (al creador), solicitud aceptada/rechazada (al solicitante), partido cancelado (a quienes se habían unido), abandono de un participante (al creador). Ninguna notificación revela más datos de los estrictamente necesarios para la acción (p. ej. un rechazo nunca incluye el motivo, ya establecido en el flujo 7).

## Reglas de retención

Hereda íntegramente la tabla ya definida en `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` (sección 27): `OpenMatch`/`MatchInvite` se purgan o archivan de forma agregada a los 90 días tras la fecha del partido — no se redefine aquí, se referencia como fuente de verdad única.

## Reglas para STAFF/ADMIN

`STAFF`/`ADMIN` pueden ver y moderar partidos abiertos de su club igual que cualquier otro contenido reportable (mismo permiso ya establecido en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`), pero **no pueden crear partidos abiertos en nombre de otro jugador** ni forzar la aceptación de una solicitud — su rol aquí es exclusivamente de moderación ante reporte, no de gestión operativa de partidos.

## Reglas para SUPPORT

Mismo criterio ya establecido en el Prompt E: `SUPPORT` solo interviene en partidos abiertos si se le escala explícitamente un caso (club sin STAFF/ADMIN activo, o patrón de abuso cross-club detectado) — nunca como vía habitual.

## Reglas que NO deben automatizarse todavía

- **Matching automático** (sugerir partidos por afinidad calculada) — no incluido ni en MVP ni en fase 2 de este documento; requeriría su propio diseño de datos y de riesgo, no asumido aquí.
- **Aceptación automática de solicitudes** (p. ej. auto-aceptar si el nivel coincide exactamente) — deliberadamente no incluida; la decisión de con quién jugar es siempre humana y del creador.
- **Detección automática de contenido de spam en partidos** vía IA — ninguna moderación de esta función se automatiza sin revisión humana, mismo principio ya reafirmado en todo el catálogo (Prompt E, sección 20).
- **Verificación automática de nivel real** (contra resultados de torneos oficiales u otra fuente) — el nivel sigue siendo autodeclarado, sin cruce automático con datos oficiales en esta fase.
