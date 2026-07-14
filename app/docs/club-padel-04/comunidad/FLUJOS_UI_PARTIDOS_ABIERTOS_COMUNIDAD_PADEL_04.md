# Flujos de UI de partidos abiertos — Comunidad Pádel 04
### 15 flujos pantalla a pantalla, sin implementación

**Estado:** especificación de flujo, sin diseño visual final ni código. Ver `app/projects/club-padel-04/community-prototypes/partidos-abiertos.html` para el mock visual estático.
**Fecha:** 2026-07-14
**Depende de:** `PARTIDOS_ABIERTOS_BUSCAR_COMPANERO_COMUNIDAD_PADEL_04.md` (mismo directorio).

Cada flujo incluye exactamente 14 puntos: objetivo, rol/usuario, pantalla/modal, acción principal, texto visible, dato tratado, consentimiento requerido, base jurídica sugerida, estado guardado, log/auditoría, efecto sobre el partido, efecto sobre otros usuarios, riesgo, mitigación.

---

## 1. Ver listado de partidos abiertos

- **Objetivo:** mostrar los `OpenMatch` visibles al usuario según su club y su configuración de privacidad.
- **Rol/usuario:** `PLAYER` con `social_layer_opt_in` activo.
- **Pantalla/modal:** pantalla "Partidos abiertos" con filtros (sección 16 del documento funcional).
- **Acción principal:** listar y filtrar.
- **Texto visible:** *"Partidos abiertos en tu club"*.
- **Dato tratado:** lectura de `OpenMatch` según `visibility`.
- **Consentimiento requerido:** `social_layer_opt_in` (lectura); ninguno adicional solo para ver.
- **Base jurídica sugerida:** consentimiento (heredado del paraguas general).
- **Estado guardado:** ninguno (solo lectura).
- **Log/auditoría:** no requerido (lectura no auditada, coherente con el resto del catálogo).
- **Efecto sobre el partido:** ninguno.
- **Efecto sobre otros usuarios:** ninguno.
- **Riesgo:** exponer partidos de usuarios bloqueados si la regla de la sección 22 del documento funcional falla.
- **Mitigación:** filtrado de bloqueo aplicado en el propio listado, no solo al solicitar (doble barrera ya especificada).

## 2. Crear partido abierto

- **Objetivo:** publicar un `OpenMatch` asociado a una reserva ya existente.
- **Rol/usuario:** `PLAYER` con reserva real asociada.
- **Pantalla/modal:** formulario "Crear partido abierto" (nivel, plazas, visibilidad).
- **Acción principal:** rellenar formulario y publicar.
- **Texto visible:** *"Al publicar, otros jugadores de tu club podrán ver que buscas rival en esta fecha y hora."*
- **Dato tratado:** creación de `OpenMatch`.
- **Consentimiento requerido:** `activity_sharing`.
- **Base jurídica sugerida:** consentimiento.
- **Estado guardado:** `OpenMatch(status=open)`.
- **Log/auditoría:** no crítico (queda registrado en la propia entidad, sin `AuditLog` dedicado, mismo criterio que `CommunityPost`).
- **Efecto sobre el partido:** se crea y queda visible según su `visibility`.
- **Efecto sobre otros usuarios:** pueden verlo y solicitar plaza si cumplen nivel y no están bloqueados.
- **Riesgo:** crear partidos falsos o repetidos (spam).
- **Mitigación:** reporte disponible (flujo 11) + límite razonable de partidos activos simultáneos por usuario (regla operativa, no fijada numéricamente en este documento).

## 3. Editar partido abierto propio

- **Objetivo:** permitir ajustar detalles de un `OpenMatch` propio antes de que se complete.
- **Rol/usuario:** `creator_id` del partido.
- **Pantalla/modal:** mismo formulario de creación, precargado.
- **Acción principal:** modificar nivel/plazas/visibilidad y guardar.
- **Texto visible:** *"Los cambios se aplican de inmediato a quienes ya vean este partido."*
- **Dato tratado:** actualización de `OpenMatch`.
- **Consentimiento requerido:** ninguno adicional (ya cubierto por `activity_sharing` al crear).
- **Base jurídica sugerida:** consentimiento (heredado).
- **Estado guardado:** `OpenMatch` actualizado.
- **Log/auditoría:** no crítico.
- **Efecto sobre el partido:** cambia visibilidad/condiciones.
- **Efecto sobre otros usuarios:** quienes ya solicitaron plaza mantienen su `MatchInvite`; el cambio no la invalida automáticamente (regla de negocio a confirmar en implementación).
- **Riesgo:** cambiar el nivel después de recibir solicitudes para excluir a alguien de forma dirigida.
- **Mitigación:** reportable como abuso (flujo 11); visible en el propio historial del partido si se implementa un registro de cambios (no incluido en el MVP).

## 4. Cancelar partido abierto propio

- **Objetivo:** cancelar un `OpenMatch` sin borrarlo (soft state, coherente con el modelo de datos).
- **Rol/usuario:** `creator_id`.
- **Pantalla/modal:** confirmación breve desde el detalle del partido.
- **Acción principal:** confirmar cancelación.
- **Texto visible:** *"Se avisará a quienes ya se hayan unido."*
- **Dato tratado:** `OpenMatch.status=cancelled`, `cancelled_at`.
- **Consentimiento requerido:** ninguno adicional.
- **Base jurídica sugerida:** consentimiento (heredado) / ejecución de la acción solicitada.
- **Estado guardado:** `OpenMatch(status=cancelled)`.
- **Log/auditoría:** no crítico.
- **Efecto sobre el partido:** deja de ser visible como `open`; queda como histórico.
- **Efecto sobre otros usuarios:** quienes se habían unido reciben `Notification`.
- **Riesgo:** cancelaciones repetidas de última hora que generan mala experiencia.
- **Mitigación:** fuera de alcance técnico de este documento — es un problema de comportamiento, no de datos; posible aviso reputacional en fases futuras, no incluido en el MVP.

## 5. Solicitar plaza

- **Objetivo:** que un jugador pida unirse a un `OpenMatch` de otro.
- **Rol/usuario:** `PLAYER` con nivel dentro del rango y sin bloqueo con el creador.
- **Pantalla/modal:** botón "Unirme" en la tarjeta del partido, con confirmación breve.
- **Acción principal:** confirmar solicitud.
- **Texto visible:** *"Se avisará al creador del partido. Podrá aceptar o rechazar tu solicitud."*
- **Dato tratado:** creación de `MatchInvite(status=pending)`.
- **Consentimiento requerido:** `activity_sharing`.
- **Base jurídica sugerida:** consentimiento.
- **Estado guardado:** `MatchInvite(status=pending)`.
- **Log/auditoría:** no crítico.
- **Efecto sobre el partido:** ninguno todavía (no cambia `slots_filled` hasta aceptación).
- **Efecto sobre otros usuarios:** el creador recibe `Notification`.
- **Riesgo:** solicitudes repetidas de un mismo usuario como forma de acoso.
- **Mitigación:** límite de una solicitud `pending` simultánea por usuario y partido (ya establecido en el documento funcional, sección 13); bloqueo disponible (flujo 12).

## 6. Aceptar solicitud

- **Objetivo:** que el creador incorpore a un solicitante a su partido.
- **Rol/usuario:** `creator_id` del `OpenMatch`.
- **Pantalla/modal:** lista de solicitudes pendientes en el detalle del partido propio.
- **Acción principal:** pulsar "Aceptar".
- **Texto visible:** *"[Nombre] se unirá a tu partido."*
- **Dato tratado:** `MatchInvite(status=accepted)`, `OpenMatch.slots_filled` incrementado.
- **Consentimiento requerido:** ninguno adicional.
- **Base jurídica sugerida:** consentimiento (heredado) / ejecución de la acción solicitada.
- **Estado guardado:** `MatchInvite` y `OpenMatch` actualizados; si se alcanza `slots_total`, `OpenMatch.status=full`.
- **Log/auditoría:** no crítico.
- **Efecto sobre el partido:** gana un participante; puede pasar a `full`.
- **Efecto sobre otros usuarios:** el solicitante recibe `Notification` positiva.
- **Riesgo:** aceptar/rechazar de forma discriminatoria (p. ej. por motivos ajenos al nivel de juego).
- **Mitigación:** fuera de alcance técnico — es comportamiento social, mitigado solo por reporte (flujo 11), no por el sistema de datos.

## 7. Rechazar solicitud

- **Objetivo:** que el creador decline una solicitud, sin obligación de justificar el motivo.
- **Rol/usuario:** `creator_id` del `OpenMatch`.
- **Pantalla/modal:** misma lista de solicitudes, botón "Rechazar".
- **Acción principal:** pulsar "Rechazar".
- **Texto visible:** *"No se compartirá el motivo con la persona."*
- **Dato tratado:** `MatchInvite(status=rejected)`.
- **Consentimiento requerido:** ninguno adicional.
- **Base jurídica sugerida:** consentimiento (heredado) / ejecución de la acción solicitada.
- **Estado guardado:** `MatchInvite(status=rejected)`.
- **Log/auditoría:** no crítico.
- **Efecto sobre el partido:** sin cambios en `slots_filled`.
- **Efecto sobre otros usuarios:** el solicitante recibe `Notification` neutra (sin motivo).
- **Riesgo:** rechazo reiterado del mismo creador hacia el mismo jugador como forma de exclusión sistemática.
- **Mitigación:** reportable (flujo 11); el jugador puede simplemente buscar otro partido, el sistema no obliga a la aceptación en ningún caso (diseño deliberado — nadie está obligado a jugar con nadie).

## 8. Abandonar partido abierto

- **Objetivo:** que un jugador ya aceptado se retire de un partido antes de la fecha.
- **Rol/usuario:** `PLAYER` con `MatchInvite(status=accepted)`.
- **Pantalla/modal:** botón "Abandonar" en el detalle del partido al que se unió.
- **Acción principal:** confirmar abandono.
- **Texto visible:** *"Se avisará al creador. La plaza quedará libre de nuevo."*
- **Dato tratado:** `MatchInvite(status=cancelled)`, `OpenMatch.slots_filled` decrementado.
- **Consentimiento requerido:** ninguno adicional.
- **Base jurídica sugerida:** consentimiento (heredado) / ejecución de la acción solicitada.
- **Estado guardado:** `MatchInvite` y `OpenMatch` actualizados; si estaba `full`, vuelve a `open`.
- **Log/auditoría:** no crítico.
- **Efecto sobre el partido:** libera una plaza.
- **Efecto sobre otros usuarios:** el creador recibe `Notification`.
- **Riesgo:** abandonos de última hora repetidos (comportamiento, no dato).
- **Mitigación:** fuera de alcance técnico de este documento, igual que la cancelación (flujo 4).

## 9. Buscar compañero

- **Objetivo:** conectar proactivamente a dos jugadores por nivel/disponibilidad sin partir de un `OpenMatch` ya creado — **fase 2, no MVP**.
- **Rol/usuario:** `PLAYER` con `searchable_by_others` activo.
- **Pantalla/modal:** pantalla "Buscar compañero" con filtros de nivel/disponibilidad general.
- **Acción principal:** buscar y ver perfiles compatibles.
- **Texto visible:** *"Solo verás jugadores que han activado ser buscables."*
- **Dato tratado:** lectura de `PlayerSocialProfile` de jugadores con `searchable_by_others=true`.
- **Consentimiento requerido:** `searchable_by_others` (propio, para aparecer; no se requiere nada adicional para buscar).
- **Base jurídica sugerida:** consentimiento.
- **Estado guardado:** ninguno (solo lectura, hasta que se invite — ver flujo 10).
- **Log/auditoría:** no requerido.
- **Efecto sobre el partido:** no aplica (no parte de un partido existente).
- **Efecto sobre otros usuarios:** ninguno hasta que se les invite.
- **Riesgo:** uso de esta función como directorio para acoso dirigido.
- **Mitigación:** opt-in estricto (`searchable_by_others`, distinto y más restrictivo que `activity_sharing`); bloqueo disponible; excluidos automáticamente los usuarios con bloqueo mutuo con el buscador.

## 10. Invitar jugador

- **Objetivo:** invitar a un jugador concreto (encontrado vía "Buscar compañero") a un partido propio — **fase 2, no MVP**.
- **Rol/usuario:** `creator_id` de un `OpenMatch` propio.
- **Pantalla/modal:** desde el resultado de "Buscar compañero", botón "Invitar a mi partido".
- **Acción principal:** seleccionar el `OpenMatch` propio y enviar invitación directa.
- **Texto visible:** *"Le enviaremos una invitación directa a tu partido."*
- **Dato tratado:** creación de `MatchInvite` iniciada por el creador en vez de por el solicitante (variante del flujo 5, dirección invertida).
- **Consentimiento requerido:** `activity_sharing` (creador) + `receive_non_friend_messages` (invitado, si no son amigos) — ambos ya definidos en el Prompt F.
- **Base jurídica sugerida:** consentimiento.
- **Estado guardado:** `MatchInvite(status=pending)`, iniciado por el creador.
- **Log/auditoría:** no crítico.
- **Efecto sobre el partido:** ninguno hasta que el invitado acepte.
- **Efecto sobre otros usuarios:** el invitado recibe `Notification` y puede aceptar/rechazar.
- **Riesgo:** invitaciones no deseadas y repetidas a un mismo jugador.
- **Mitigación:** requiere `receive_non_friend_messages` del invitado (gate explícito ya diseñado); bloqueo disponible; límite de invitaciones simultáneas por usuario (regla operativa, no numérica en este documento).

## 11. Reportar partido

- **Objetivo:** reportar un `OpenMatch` por spam, contenido inapropiado o uso indebido.
- **Rol/usuario:** cualquier `PLAYER` con acceso de lectura al partido.
- **Pantalla/modal:** modal desde "⋯" en la tarjeta del partido, mismo patrón que el resto del catálogo.
- **Acción principal:** seleccionar motivo + enviar.
- **Texto visible:** *"Cuéntanos qué ha pasado. Tu identidad no se compartirá con la persona reportada."*
- **Dato tratado:** `Report(target_type=event)` (aproximación documentada en la sección 21 del documento funcional, pendiente de decisión final en implementación).
- **Consentimiento requerido:** ninguno.
- **Base jurídica sugerida:** interés legítimo.
- **Estado guardado:** `Report(status=open)`.
- **Log/auditoría:** `AuditLog(action="report.created")`.
- **Efecto sobre el partido:** ninguno inmediato (sigue visible hasta revisión).
- **Efecto sobre otros usuarios:** ninguno inmediato.
- **Riesgo:** reportes de mala fe para eliminar competencia por una plaza.
- **Mitigación:** revisión humana obligatoria antes de cualquier acción (mismo principio ya establecido en el Prompt E).

## 12. Bloquear usuario desde partido

- **Objetivo:** bloquear al creador o a otro solicitante directamente desde el contexto de un partido.
- **Rol/usuario:** cualquier `PLAYER`.
- **Pantalla/modal:** mismo modal de bloqueo ya diseñado (Prompt E), accesible desde "⋯" en la tarjeta del partido o en la lista de solicitantes.
- **Acción principal:** confirmar bloqueo.
- **Texto visible:** *"Ya no podrá invitarte a partidos, escribirte ni ver tu actividad. No se le notificará que le has bloqueado."*
- **Dato tratado:** `Friendship.status=blocked`.
- **Consentimiento requerido:** ninguno.
- **Base jurídica sugerida:** interés legítimo.
- **Estado guardado:** `Friendship(status=blocked)`.
- **Log/auditoría:** `AuditLog(action="friendship.blocked")`.
- **Efecto sobre el partido:** el partido deja de ser visible para el bloqueado (y viceversa), coherente con la regla crítica del documento funcional (sección 22).
- **Efecto sobre otros usuarios:** ninguno más allá de las dos partes implicadas.
- **Riesgo:** ninguno significativo — función defensiva de bajo riesgo por diseño.
- **Mitigación:** no aplica.

## 13. Estado sin consentimiento

- **Objetivo:** mostrar con claridad que la función requiere activar la comunidad antes de usarse.
- **Rol/usuario:** `PLAYER` sin `social_layer_opt_in`/`activity_sharing` activo.
- **Pantalla/modal:** pantalla "Partidos abiertos" sustituida por un `consent-gate` (mismo componente ya usado en feed y perfil).
- **Acción principal:** "Activar comunidad" (redirige al flujo 2 de `FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md`).
- **Texto visible:** *"Activa tu comunidad para ver y crear partidos abiertos."*
- **Dato tratado:** ninguno todavía.
- **Consentimiento requerido:** no aplica (esta pantalla es la puerta de entrada al consentimiento).
- **Base jurídica sugerida:** no aplica.
- **Estado guardado:** no aplica.
- **Log/auditoría:** no aplica.
- **Efecto sobre el partido:** no aplica.
- **Efecto sobre otros usuarios:** no aplica.
- **Riesgo:** ninguno.
- **Mitigación:** no aplica.

## 14. Estado perfil privado

- **Objetivo:** mostrar con claridad cuando un partido no puede unirse un solicitante por configuración de privacidad del creador (visibilidad `friends` y no son amigos).
- **Rol/usuario:** `PLAYER` que intenta acceder a un partido fuera de su visibilidad permitida.
- **Pantalla/modal:** el partido simplemente no aparece en el listado (no hay una pantalla de "acceso denegado" — se prefiere la ausencia, coherente con el principio de no confirmar existencia de contenido restringido).
- **Acción principal:** ninguna (el partido no es visible, no hay acción posible).
- **Texto visible:** no aplica (no hay mensaje específico, el contenido simplemente no está en el listado).
- **Dato tratado:** ninguno.
- **Consentimiento requerido:** no aplica.
- **Base jurídica sugerida:** no aplica.
- **Estado guardado:** no aplica.
- **Log/auditoría:** no aplica.
- **Efecto sobre el partido:** ninguno.
- **Efecto sobre otros usuarios:** ninguno.
- **Riesgo:** confusión del usuario si esperaba ver un partido que un amigo le mencionó verbalmente.
- **Mitigación:** aceptado como comportamiento correcto por diseño — la privacidad del creador prevalece sobre la conveniencia de un tercero; no se "filtra" la existencia del partido de ninguna forma.

## 15. Estado sin resultados

- **Objetivo:** comunicar con claridad cuando no hay partidos abiertos que coincidan con los filtros aplicados.
- **Rol/usuario:** `PLAYER` con `social_layer_opt_in` activo.
- **Pantalla/modal:** estado vacío estándar (mismo componente ya usado en el feed).
- **Acción principal:** ajustar filtros o crear un partido propio (CTA).
- **Texto visible:** *"No hay partidos abiertos con estos filtros. ¿Creas uno tú?"*
- **Dato tratado:** ninguno.
- **Consentimiento requerido:** no aplica.
- **Base jurídica sugerida:** no aplica.
- **Estado guardado:** no aplica.
- **Log/auditoría:** no aplica.
- **Efecto sobre el partido:** no aplica.
- **Efecto sobre otros usuarios:** no aplica.
- **Riesgo:** ninguno.
- **Mitigación:** no aplica.
