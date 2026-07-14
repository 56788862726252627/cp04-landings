# Flujos de UI de amigos y seguidores — Comunidad Pádel 04
### 17 flujos pantalla a pantalla, sin implementación

**Estado:** especificación de flujo, sin diseño visual final ni código. Ver `app/projects/club-padel-04/community-prototypes/amigos-seguidores.html` para el mock visual estático.
**Fecha:** 2026-07-14
**Depende de:** `AMIGOS_SEGUIDORES_CONEXIONES_COMUNIDAD_PADEL_04.md` (mismo directorio).

Cada flujo incluye exactamente 15 puntos: objetivo, rol/usuario, pantalla/modal, acción principal, texto visible, dato tratado, consentimiento requerido, base jurídica sugerida, estado guardado, log/auditoría, efecto sobre el feed, efecto sobre el perfil, efecto sobre partidos abiertos, riesgo, mitigación.

---

## 1. Ver lista de amigos

- **Objetivo:** mostrar los `Friendship(status=accepted)` propios.
- **Rol/usuario:** `PLAYER` con `social_layer_opt_in` activo.
- **Pantalla/modal:** pantalla "Amigos" con lista simple.
- **Acción principal:** listar (solo lectura).
- **Texto visible:** *"Tus amigos en Club Pádel 04"*.
- **Dato tratado:** lectura de `Friendship(status=accepted)` propias.
- **Consentimiento requerido:** `social_layer_opt_in`.
- **Base jurídica sugerida:** consentimiento (heredado).
- **Estado guardado:** ninguno (solo lectura).
- **Log/auditoría:** no requerido.
- **Efecto sobre el feed:** ninguno directo (la lista en sí no cambia el feed).
- **Efecto sobre el perfil:** ninguno directo.
- **Efecto sobre partidos abiertos:** ninguno directo.
- **Riesgo:** exponer amigos de un bloqueado si la regla de bloqueo falla.
- **Mitigación:** filtrado de bloqueo aplicado también en esta lectura, no solo al crear relaciones.

## 2. Ver seguidores

- **Objetivo:** mostrar quién sigue al propio usuario — **fase 2**.
- **Rol/usuario:** `PLAYER` con `social_layer_opt_in` activo.
- **Pantalla/modal:** pantalla "Seguidores" (tab dentro de "Amigos").
- **Acción principal:** listar (solo lectura).
- **Texto visible:** *"Personas que te siguen"*.
- **Dato tratado:** lectura de `Follow(followed_id=propio)`.
- **Consentimiento requerido:** `social_layer_opt_in`; visibilidad propia en `club` o superior para que existan seguidores.
- **Base jurídica sugerida:** consentimiento.
- **Estado guardado:** ninguno.
- **Log/auditoría:** no requerido.
- **Efecto sobre el feed:** ninguno directo.
- **Efecto sobre el perfil:** el contador de seguidores puede mostrarse en el perfil (fase 2).
- **Efecto sobre partidos abiertos:** ninguno.
- **Riesgo:** exponer la lista completa de seguidores de forma pública sin querer.
- **Mitigación:** lista detallada visible solo al propio usuario; contador agregado como máximo dato público (ya establecido en el modelo de datos).

## 3. Ver seguidos

- **Objetivo:** mostrar a quién sigue el propio usuario — **fase 2**.
- **Rol/usuario:** `PLAYER` con `social_layer_opt_in` activo.
- **Pantalla/modal:** pantalla "Siguiendo" (tab dentro de "Amigos").
- **Acción principal:** listar (solo lectura).
- **Texto visible:** *"Jugadores que sigues"*.
- **Dato tratado:** lectura de `Follow(follower_id=propio)`.
- **Consentimiento requerido:** `social_layer_opt_in`.
- **Base jurídica sugerida:** consentimiento.
- **Estado guardado:** ninguno.
- **Log/auditoría:** no requerido.
- **Efecto sobre el feed:** ninguno directo en el MVP (el feed no filtra por "seguidos" todavía).
- **Efecto sobre el perfil:** ninguno directo.
- **Efecto sobre partidos abiertos:** ninguno.
- **Riesgo:** ninguno significativo (es la propia lista del usuario, privada por defecto).
- **Mitigación:** no aplica.

## 4. Enviar solicitud de amistad

- **Objetivo:** iniciar una relación de amistad con otro jugador.
- **Rol/usuario:** `PLAYER` con `social_layer_opt_in` activo, sin bloqueo con el destinatario.
- **Pantalla/modal:** botón "Añadir amigo" en el perfil del jugador.
- **Acción principal:** pulsar y confirmar envío.
- **Texto visible:** *"Se enviará una solicitud de amistad."*
- **Dato tratado:** creación de `Friendship(status=pending)`.
- **Consentimiento requerido:** `social_layer_opt_in`.
- **Base jurídica sugerida:** consentimiento.
- **Estado guardado:** `Friendship(status=pending)`.
- **Log/auditoría:** no crítico (mismo criterio que `MatchInvite`, sin `AuditLog` dedicado).
- **Efecto sobre el feed:** ninguno hasta que se acepte.
- **Efecto sobre el perfil:** ninguno hasta que se acepte.
- **Efecto sobre partidos abiertos:** ninguno hasta que se acepte.
- **Riesgo:** solicitudes masivas no deseadas (spam de solicitudes).
- **Mitigación:** límite operativo de solicitudes pendientes simultáneas (no numérico fijo en este documento, ver `REGLAS_PRIVACIDAD_CONEXIONES_COMUNIDAD_PADEL_04.md`); bloqueo y reporte disponibles.

## 5. Aceptar solicitud

- **Objetivo:** activar la relación de amistad.
- **Rol/usuario:** `addressee_id` de la solicitud.
- **Pantalla/modal:** lista de "Solicitudes pendientes", botón "Aceptar".
- **Acción principal:** pulsar "Aceptar".
- **Texto visible:** *"Ahora sois amigos en Club Pádel 04."*
- **Dato tratado:** `Friendship(status=accepted)`.
- **Consentimiento requerido:** ninguno adicional.
- **Base jurídica sugerida:** consentimiento (heredado) / ejecución de la acción solicitada.
- **Estado guardado:** `Friendship(status=accepted)`.
- **Log/auditoría:** no crítico.
- **Efecto sobre el feed:** el contenido `visibility=friends` de ambos pasa a ser mutuamente visible.
- **Efecto sobre el perfil:** los campos `visibility_*=friends` de ambos pasan a ser mutuamente visibles.
- **Efecto sobre partidos abiertos:** los `OpenMatch.visibility=friends` de ambos pasan a ser mutuamente visibles.
- **Riesgo:** aceptar por error a alguien no deseado.
- **Mitigación:** eliminar amigo disponible en cualquier momento (flujo 8), sin fricción.

## 6. Rechazar solicitud

- **Objetivo:** declinar una solicitud sin obligación de justificar el motivo.
- **Rol/usuario:** `addressee_id` de la solicitud.
- **Pantalla/modal:** misma lista de "Solicitudes pendientes", botón "Rechazar".
- **Acción principal:** pulsar "Rechazar".
- **Texto visible:** *"No se notificará el rechazo de forma directa."*
- **Dato tratado:** `Friendship(status=rejected)`.
- **Consentimiento requerido:** ninguno adicional.
- **Base jurídica sugerida:** consentimiento (heredado) / ejecución de la acción solicitada.
- **Estado guardado:** `Friendship(status=rejected)`.
- **Log/auditoría:** no crítico.
- **Efecto sobre el feed:** ninguno (nunca llegó a activarse la relación).
- **Efecto sobre el perfil:** ninguno.
- **Efecto sobre partidos abiertos:** ninguno.
- **Riesgo:** rechazo reiterado percibido como hostilidad si se permite reintentar sin límite.
- **Mitigación:** se permite un nuevo intento tras un rechazo (sección 11 del documento funcional), pero con el mismo límite operativo de solicitudes pendientes ya mencionado.

## 7. Cancelar solicitud enviada

- **Objetivo:** retirar una solicitud propia antes de que se resuelva.
- **Rol/usuario:** `requester_id` de la solicitud.
- **Pantalla/modal:** lista de "Solicitudes enviadas", botón "Cancelar".
- **Acción principal:** confirmar cancelación.
- **Texto visible:** *"Se retirará tu solicitud."*
- **Dato tratado:** `Friendship` eliminada o marcada `cancelled` (a definir en implementación si se distingue de `rejected` — este documento recomienda un estado distinto para no confundir "yo la retiré" con "me rechazaron", aunque el modelo de datos actual no tiene `cancelled` en `Friendship.status`; señalado en el checklist).
- **Consentimiento requerido:** ninguno adicional.
- **Base jurídica sugerida:** consentimiento (heredado) / ejecución de la acción solicitada.
- **Estado guardado:** según la decisión anterior.
- **Log/auditoría:** no crítico.
- **Efecto sobre el feed:** ninguno.
- **Efecto sobre el perfil:** ninguno.
- **Efecto sobre partidos abiertos:** ninguno.
- **Riesgo:** ninguno significativo.
- **Mitigación:** no aplica.

## 8. Eliminar amigo

- **Objetivo:** deshacer una relación de amistad ya activa.
- **Rol/usuario:** cualquiera de las dos partes.
- **Pantalla/modal:** confirmación breve desde el perfil del amigo o desde la lista de amigos.
- **Acción principal:** confirmar eliminación.
- **Texto visible:** *"Dejaréis de ser amigos. No se le notificará."*
- **Dato tratado:** `Friendship` eliminada (borrado inmediato, no soft delete, ya establecido en el modelo de datos 6.4).
- **Consentimiento requerido:** ninguno adicional.
- **Base jurídica sugerida:** consentimiento (heredado) / ejecución de la acción solicitada.
- **Estado guardado:** eliminación de `Friendship`.
- **Log/auditoría:** no crítico.
- **Efecto sobre el feed:** el contenido `visibility=friends` deja de ser mutuamente visible de inmediato.
- **Efecto sobre el perfil:** los campos `visibility_*=friends` dejan de ser mutuamente visibles.
- **Efecto sobre partidos abiertos:** los `OpenMatch.visibility=friends` dejan de ser mutuamente visibles.
- **Riesgo:** usarlo como forma silenciosa de distanciarse sin que el otro note nada hasta más tarde (comportamiento social, no técnico).
- **Mitigación:** no notificar es una decisión de diseño deliberada (reduce fricción social), documentada aquí como tal, no como omisión.

## 9. Seguir jugador

- **Objetivo:** crear un `Follow` unidireccional — **fase 2**.
- **Rol/usuario:** `PLAYER` con `social_layer_opt_in` activo, sin bloqueo.
- **Pantalla/modal:** botón "Seguir" en el perfil del jugador (visible solo si `visibility_level ≥ club`).
- **Acción principal:** pulsar "Seguir".
- **Texto visible:** *"Verás su actividad pública en el feed."*
- **Dato tratado:** creación de `Follow`.
- **Consentimiento requerido:** `social_layer_opt_in` (propio); visibilidad `club` o superior del seguido.
- **Base jurídica sugerida:** consentimiento.
- **Estado guardado:** `Follow` creado.
- **Log/auditoría:** no crítico.
- **Efecto sobre el feed:** actividad pública del seguido puede aparecer con mayor prioridad (fase 2, criterio de orden no definido en este documento).
- **Efecto sobre el perfil:** contador de seguidores del seguido se incrementa.
- **Efecto sobre partidos abiertos:** ninguno — `Follow` no otorga visibilidad `friends`, solo `Friendship` lo hace (ya establecido en la sección 9 del documento funcional).
- **Riesgo:** usarlo para vigilar la actividad de alguien sin su consentimiento explícito de amistad.
- **Mitigación:** solo aplica sobre perfiles ya visibles a `club` (el propio usuario decidió esa visibilidad); bloqueo disponible si se percibe como acoso.

## 10. Dejar de seguir

- **Objetivo:** eliminar un `Follow` — **fase 2**.
- **Rol/usuario:** `follower_id`.
- **Pantalla/modal:** botón "Siguiendo" (toggle) en el perfil o desde la lista de seguidos.
- **Acción principal:** pulsar y confirmar.
- **Texto visible:** *"Dejarás de ver su actividad destacada. No se le notificará."*
- **Dato tratado:** eliminación de `Follow`.
- **Consentimiento requerido:** ninguno adicional.
- **Base jurídica sugerida:** consentimiento (heredado) / ejecución de la acción solicitada.
- **Estado guardado:** eliminación de `Follow`.
- **Log/auditoría:** no crítico.
- **Efecto sobre el feed:** deja de priorizarse su actividad.
- **Efecto sobre el perfil:** contador de seguidores del seguido se decrementa.
- **Efecto sobre partidos abiertos:** ninguno.
- **Riesgo:** ninguno significativo.
- **Mitigación:** no aplica.

## 11. Ver conexiones sugeridas

- **Objetivo:** mostrar candidatos a amistad calculados por club/nivel/amigos en común — **fase 2**.
- **Rol/usuario:** `PLAYER` con `social_layer_opt_in` activo.
- **Pantalla/modal:** sección "Quizás conozcas" en la pantalla de "Amigos".
- **Acción principal:** listar (solo lectura), con CTA "Añadir amigo" por tarjeta.
- **Texto visible:** *"Sugerencias basadas en tu club y amigos en común."*
- **Dato tratado:** cálculo en el momento (no persistente) sobre `UserProfile`/`Friendship` del mismo club.
- **Consentimiento requerido:** `social_layer_opt_in` (propio); el sugerido también debe tenerlo activo para aparecer.
- **Base jurídica sugerida:** consentimiento.
- **Estado guardado:** ninguno (cálculo no persistente).
- **Log/auditoría:** no requerido.
- **Efecto sobre el feed:** ninguno.
- **Efecto sobre el perfil:** ninguno.
- **Efecto sobre partidos abiertos:** ninguno.
- **Riesgo:** convertirse en un directorio de facto para localizar a alguien que prefiere no ser encontrado.
- **Mitigación:** exclusión automática de bloqueados; sin geolocalización ni datos adicionales más allá de club/nivel/amigos en común ya visibles.

## 12. Ocultar sugerencia

- **Objetivo:** que el usuario descarte una sugerencia sin bloquear ni reportar — **fase 2**.
- **Rol/usuario:** `PLAYER`.
- **Pantalla/modal:** botón "×" en la tarjeta de sugerencia.
- **Acción principal:** pulsar "×".
- **Texto visible:** *"No volverás a ver esta sugerencia."*
- **Dato tratado:** preferencia local (no crea entidad nueva en el MVP, mismo criterio que "Ocultar publicación" del Prompt E).
- **Consentimiento requerido:** ninguno.
- **Base jurídica sugerida:** no aplica (preferencia de UX).
- **Estado guardado:** preferencia propia, no visible a nadie más.
- **Log/auditoría:** no requerido.
- **Efecto sobre el feed:** ninguno.
- **Efecto sobre el perfil:** ninguno.
- **Efecto sobre partidos abiertos:** ninguno.
- **Riesgo:** confundirse con bloquear (dos acciones de intención muy distinta).
- **Mitigación:** botones visualmente diferenciados, mismo principio ya aplicado en "Ocultar" vs. "Reportar" del Prompt E.

## 13. Bloquear usuario

- **Objetivo:** cortar toda interacción, incluida cualquier relación de amistad/seguimiento existente.
- **Rol/usuario:** cualquier `PLAYER`.
- **Pantalla/modal:** mismo modal de bloqueo ya diseñado (Prompt E), accesible desde el perfil o la lista de amigos/sugerencias.
- **Acción principal:** confirmar bloqueo.
- **Texto visible:** *"Ya no podrá invitarte a partidos, escribirte ni ver tu actividad. Si erais amigos, dejaréis de serlo. No se le notificará que le has bloqueado."*
- **Dato tratado:** `Friendship.status=blocked`; elimina cualquier `Friendship(status=accepted)`/`Follow` previa entre las partes.
- **Consentimiento requerido:** ninguno.
- **Base jurídica sugerida:** interés legítimo.
- **Estado guardado:** `Friendship(status=blocked)`.
- **Log/auditoría:** `AuditLog(action="friendship.blocked")`.
- **Efecto sobre el feed:** contenido mutuo se oculta entre ambos.
- **Efecto sobre el perfil:** perfiles mutuamente inaccesibles (mismo estado ya diseñado en `PROTOTIPO_PERFIL_JUGADOR_COMUNIDAD_PADEL_04.md`).
- **Efecto sobre partidos abiertos:** partidos mutuos se ocultan, `MatchInvite` entre ambos ya no puede crearse (regla ya confirmada en el Prompt D).
- **Riesgo:** ninguno significativo — función defensiva de bajo riesgo por diseño.
- **Mitigación:** no aplica.

## 14. Reportar usuario

- **Objetivo:** reportar a un jugador desde el contexto de amigos/seguidores/sugerencias.
- **Rol/usuario:** cualquier `PLAYER`.
- **Pantalla/modal:** mismo modal de reporte ya diseñado (Prompt E), accesible desde el perfil o cualquier tarjeta de jugador en esta pantalla.
- **Acción principal:** seleccionar motivo + enviar.
- **Texto visible:** *"Cuéntanos qué ha pasado. Tu identidad no se compartirá con la persona reportada."*
- **Dato tratado:** `Report(target_type=user)`.
- **Consentimiento requerido:** ninguno.
- **Base jurídica sugerida:** interés legítimo.
- **Estado guardado:** `Report(status=open)`.
- **Log/auditoría:** `AuditLog(action="report.created")`.
- **Efecto sobre el feed:** ninguno inmediato.
- **Efecto sobre el perfil:** ninguno inmediato.
- **Efecto sobre partidos abiertos:** ninguno inmediato.
- **Riesgo:** reportes de mala fe por rechazo de una solicitud de amistad.
- **Mitigación:** revisión humana obligatoria antes de cualquier acción (mismo principio ya establecido en el Prompt E).

## 15. Estado sin consentimiento social

- **Objetivo:** mostrar con claridad que la función requiere activar la comunidad.
- **Rol/usuario:** `PLAYER` sin `social_layer_opt_in` activo.
- **Pantalla/modal:** pantalla "Amigos" sustituida por un `consent-gate` (mismo componente ya usado en feed, perfil y partidos abiertos).
- **Acción principal:** "Activar comunidad".
- **Texto visible:** *"Activa tu comunidad para conectar con otros jugadores."*
- **Dato tratado:** ninguno todavía.
- **Consentimiento requerido:** no aplica (puerta de entrada).
- **Base jurídica sugerida:** no aplica.
- **Estado guardado:** no aplica.
- **Log/auditoría:** no aplica.
- **Efecto sobre el feed:** no aplica.
- **Efecto sobre el perfil:** no aplica.
- **Efecto sobre partidos abiertos:** no aplica.
- **Riesgo:** ninguno.
- **Mitigación:** no aplica.

## 16. Estado perfil privado

- **Objetivo:** mostrar el comportamiento correcto cuando se intenta actuar sobre un perfil con privacidad restrictiva.
- **Rol/usuario:** `PLAYER` que visita un perfil con `visibility_level=private`.
- **Pantalla/modal:** mismo estado ya diseñado en `PROTOTIPO_PERFIL_JUGADOR_COMUNIDAD_PADEL_04.md` ("Este jugador mantiene su actividad privada"), con el botón "Añadir amigo" como única acción disponible (no "Seguir", que requiere `club` o superior).
- **Acción principal:** enviar solicitud de amistad (única vía de acercamiento a un perfil privado).
- **Texto visible:** *"Este jugador mantiene su actividad privada. Puedes enviarle una solicitud de amistad."*
- **Dato tratado:** igual que el flujo 4 si se envía solicitud.
- **Consentimiento requerido:** igual que el flujo 4.
- **Base jurídica sugerida:** igual que el flujo 4.
- **Estado guardado:** igual que el flujo 4, si se ejecuta la acción.
- **Log/auditoría:** igual que el flujo 4.
- **Efecto sobre el feed:** ninguno hasta que se acepte la amistad.
- **Efecto sobre el perfil:** ninguno hasta que se acepte.
- **Efecto sobre partidos abiertos:** ninguno hasta que se acepte.
- **Riesgo:** ninguno adicional al ya cubierto en el flujo 4.
- **Mitigación:** no aplica.

## 17. Estado sin conexiones

- **Objetivo:** comunicar con claridad cuando el usuario no tiene amigos ni sugerencias todavía.
- **Rol/usuario:** `PLAYER` recién activado en la comunidad.
- **Pantalla/modal:** estado vacío estándar (mismo componente ya usado en feed y partidos abiertos).
- **Acción principal:** explorar el feed o buscar jugadores (CTA).
- **Texto visible:** *"Todavía no tienes amigos aquí. Explora el feed de tu club para empezar."*
- **Dato tratado:** ninguno.
- **Consentimiento requerido:** no aplica.
- **Base jurídica sugerida:** no aplica.
- **Estado guardado:** no aplica.
- **Log/auditoría:** no aplica.
- **Efecto sobre el feed:** no aplica.
- **Efecto sobre el perfil:** no aplica.
- **Efecto sobre partidos abiertos:** no aplica.
- **Riesgo:** ninguno.
- **Mitigación:** no aplica.
