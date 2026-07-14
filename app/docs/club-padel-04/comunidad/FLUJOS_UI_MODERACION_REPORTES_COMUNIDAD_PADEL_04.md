# Flujos de UI de moderación y reportes — Comunidad Pádel 04
### 12 flujos pantalla a pantalla, sin implementación

**Estado:** especificación de flujo, sin diseño visual final ni código. Ver `app/projects/club-padel-04/community-prototypes/moderacion-reportes.html` para el mock visual estático.
**Fecha:** 2026-07-14
**Depende de:** `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md` (mismo directorio).

---

## 1. Reportar publicación

- **Objetivo:** permitir reportar una `CommunityPost` sin fricción.
- **Usuario/rol:** `PLAYER`/`STAFF`/`ADMIN` (cualquiera con acceso de lectura al post).
- **Pantalla/modal:** modal corto desde el menú "⋯" de la tarjeta.
- **Acción principal:** seleccionar motivo + enviar.
- **Texto visible:** *"Cuéntanos qué ha pasado. Tu identidad no se compartirá con la persona reportada."*
- **Dato tratado:** `Report(target_type=post)`.
- **Consentimiento/base jurídica:** ninguno requerido; interés legítimo.
- **Estado guardado:** `Report(status=open)`.
- **Log/auditoría:** `AuditLog(action="report.created")`.
- **Efecto sobre el contenido:** ninguno inmediato (sigue visible hasta revisión).
- **Efecto sobre el usuario reportado:** ninguno inmediato, no se le notifica el reporte en sí.
- **Efecto sobre el usuario que reporta:** confirmación neutra, sin promesa de plazo.
- **Riesgo:** reportes de mala fe/reiterados.
- **Mitigación:** seguimiento interno de patrones de reporte (sección 16 del documento de moderación), sin bloquear la capacidad de reportar.

## 2. Reportar perfil

- **Objetivo:** reportar a un usuario (perfil falso, comportamiento, etc.), no un contenido concreto.
- **Usuario/rol:** `PLAYER`/`STAFF`/`ADMIN`.
- **Pantalla/modal:** modal desde "⋯" en el perfil del jugador.
- **Acción principal:** seleccionar motivo (incluye `fake_profile`) + detalle opcional.
- **Texto visible:** igual que reportar publicación, adaptado a "este perfil".
- **Dato tratado:** `Report(target_type=user)`.
- **Consentimiento/base jurídica:** ninguno requerido; interés legítimo.
- **Estado guardado:** `Report(status=open)`.
- **Log/auditoría:** `AuditLog(action="report.created")`.
- **Efecto sobre el contenido:** el perfil permanece visible hasta revisión.
- **Efecto sobre el usuario reportado:** ninguno inmediato.
- **Efecto sobre el usuario que reporta:** confirmación neutra.
- **Riesgo:** reportar perfiles para "silenciar" a un rival o conocido sin motivo real.
- **Mitigación:** revisión humana obligatoria antes de cualquier acción (sección 20 del documento de moderación); ningún reporte por sí solo tiene efecto.

## 3. Reportar comentario

- **Objetivo:** reportar un `Comment` específico dentro de una publicación.
- **Usuario/rol:** cualquiera con acceso de lectura al post donde está el comentario.
- **Pantalla/modal:** modal desde "⋯" junto al comentario (mismo componente que el de publicación, target distinto).
- **Acción principal:** seleccionar motivo + enviar.
- **Texto visible:** igual patrón que los anteriores.
- **Dato tratado:** `Report(target_type=comment)`.
- **Consentimiento/base jurídica:** ninguno requerido; interés legítimo.
- **Estado guardado:** `Report(status=open)`.
- **Log/auditoría:** `AuditLog(action="report.created")`.
- **Efecto sobre el contenido:** el comentario permanece visible hasta revisión.
- **Efecto sobre el usuario reportado:** ninguno inmediato.
- **Efecto sobre el usuario que reporta:** confirmación neutra.
- **Riesgo:** igual que publicación, a menor escala.
- **Mitigación:** igual que publicación.

## 4. Bloquear usuario

- **Objetivo:** cortar toda interacción con otro jugador, con efecto inmediato.
- **Usuario/rol:** cualquier `PLAYER` (también `STAFF`/`ADMIN` en su rol de jugador).
- **Pantalla/modal:** confirmación breve desde "⋯" en el perfil.
- **Acción principal:** confirmar bloqueo.
- **Texto visible:** *"Ya no podrá invitarte a partidos, escribirte ni ver tu actividad. No se le notificará que le has bloqueado."*
- **Dato tratado:** `Friendship.status=blocked`.
- **Consentimiento/base jurídica:** ninguno requerido; interés legítimo (seguridad propia).
- **Estado guardado:** `Friendship(status=blocked)`, conservado indefinidamente.
- **Log/auditoría:** `AuditLog(action="friendship.blocked")`.
- **Efecto sobre el contenido:** contenido mutuo se oculta entre ambos (feed, perfil).
- **Efecto sobre el usuario reportado (bloqueado):** pierde acceso a interactuar con quien le bloqueó, sin aviso.
- **Efecto sobre el usuario que reporta (bloquea):** protección inmediata, reversible.
- **Riesgo:** ninguno significativo — es una función defensiva de bajo riesgo por diseño.
- **Mitigación:** no aplica más allá del diseño ya defensivo.

## 5. Desbloquear usuario

- **Objetivo:** revertir un bloqueo previo, acción explícita y separada.
- **Usuario/rol:** quien ejecutó el bloqueo original.
- **Pantalla/modal:** desde "Privacidad de mi comunidad" → lista de usuarios bloqueados → "Desbloquear".
- **Acción principal:** confirmar desbloqueo.
- **Texto visible:** *"Podrá volver a interactuar contigo. Puedes bloquearle de nuevo cuando quieras."*
- **Dato tratado:** `Friendship.status` vuelve a un estado activo (o se elimina el registro, a definir en implementación).
- **Consentimiento/base jurídica:** ninguno requerido.
- **Estado guardado:** actualización de `Friendship`.
- **Log/auditoría:** `AuditLog(action="friendship.unblocked")`.
- **Efecto sobre el contenido:** vuelve a ser mutuamente visible según configuración de privacidad normal.
- **Efecto sobre el usuario reportado (antes bloqueado):** recupera capacidad de interactuar, sin notificación del desbloqueo.
- **Efecto sobre el usuario que reporta (desbloquea):** ninguno más allá de la reversión.
- **Riesgo:** desbloquear por error a alguien con quien hubo un conflicto real.
- **Mitigación:** confirmación explícita de un solo paso, no automática ni por caducidad.

## 6. Ocultar publicación

- **Objetivo:** dejar de ver un contenido en el propio feed, sin que sea una acción de moderación.
- **Usuario/rol:** cualquier `PLAYER`.
- **Pantalla/modal:** acción directa desde "⋯" en la tarjeta ("Ocultar"), sin modal de confirmación (acción reversible y de bajo impacto).
- **Acción principal:** pulsar "Ocultar".
- **Texto visible:** *"No volverás a ver esta publicación."* (con opción "Deshacer" breve, tipo snackbar).
- **Dato tratado:** preferencia local del usuario (no crea `Report` ni entidad de moderación nueva en el MVP).
- **Consentimiento/base jurídica:** no aplica (preferencia de UX, no tratamiento de datos de terceros).
- **Estado guardado:** preferencia propia, no visible a nadie más.
- **Log/auditoría:** no requerido (no es una acción de seguridad ni de moderación).
- **Efecto sobre el contenido:** ninguno — sigue visible para el resto de la comunidad.
- **Efecto sobre el usuario reportado (autor):** ninguno, ni siquiera se entera.
- **Efecto sobre el usuario que reporta (oculta):** deja de ver ese contenido específico.
- **Riesgo:** confundirse con "Reportar" y no llegar a moderación cuando sí procedía.
- **Mitigación:** los dos botones ("Ocultar" / "Reportar") deben estar visualmente diferenciados en el menú, nunca fusionados en una sola acción.

## 7. Revisar reporte como STAFF

- **Objetivo:** dar a STAFF una cola de trabajo clara para resolver reportes de su club.
- **Usuario/rol:** `STAFF` (y `ADMIN`, que ve lo mismo más opciones adicionales).
- **Pantalla/modal:** pantalla "Moderación" (nueva sección visible solo con estos roles) → lista de `Report(status=open/in_review)` → detalle de un reporte.
- **Acción principal:** marcar `in_review`, luego `dismissed` o crear `ModerationAction`.
- **Texto visible:** *"Reporte de [motivo] · [fecha]. El reportante no aparece aquí por privacidad."*
- **Dato tratado:** `Report` (lectura completa salvo `reporter_id`), contenido/perfil reportado.
- **Consentimiento/base jurídica:** interés legítimo (seguridad de la comunidad).
- **Estado guardado:** `Report.status` actualizado; `ModerationAction` si aplica.
- **Log/auditoría:** `AuditLog(action="report.status_changed")` + `AuditLog(action="moderation_action.created")` si aplica.
- **Efecto sobre el contenido:** puede pasar a oculto/retirado si se decide `content_removed`.
- **Efecto sobre el usuario reportado:** puede recibir un aviso genérico (flujo 12) según la acción tomada.
- **Efecto sobre el usuario que reporta:** ve el estado actualizado (flujo 10), sin detalle de la decisión interna.
- **Riesgo:** decisiones inconsistentes entre distintos STAFF del mismo club.
- **Mitigación:** motivos y acciones estandarizados (enum ya cerrado en el modelo de datos, no texto libre para la decisión).

## 8. Resolver reporte como ADMIN

- **Objetivo:** dar a ADMIN capacidad de resolver casos escalados o de mayor severidad (suspensión, baneo).
- **Usuario/rol:** `ADMIN`.
- **Pantalla/modal:** misma pantalla de "Moderación" que STAFF, con acciones adicionales visibles (`user_suspended`, `user_banned`) y capacidad de revertir una `ModerationAction` de STAFF.
- **Acción principal:** aplicar la acción de mayor severidad o revertir una decisión previa.
- **Texto visible:** *"Esta acción afecta a la cuenta completa del usuario, no solo a este contenido. Confirma antes de continuar."*
- **Dato tratado:** `Report`, `ModerationAction` (nueva, referenciando la anterior si es una reversión).
- **Consentimiento/base jurídica:** interés legítimo.
- **Estado guardado:** `ModerationAction` nueva (inmutable); `UserProfile` no se edita directamente en el MVP de moderación (una suspensión se representa como `ModerationAction`, no como cambio de `role`).
- **Log/auditoría:** `AuditLog(action="moderation_action.created")`.
- **Efecto sobre el contenido:** según la acción (retirado, o sin cambio si es solo sobre el usuario).
- **Efecto sobre el usuario reportado:** puede perder acceso temporal (`user_suspended`) o permanente (`user_banned`) a la capa social — nunca a reservas/torneos oficiales, que son un sistema aparte.
- **Efecto sobre el usuario que reporta:** ve el estado final (resuelto).
- **Riesgo:** una suspensión/baneo mal aplicado sin vía de reclamación clara.
- **Mitigación:** el usuario afectado puede iniciar un nuevo `Report` sobre la propia decisión (mecanismo de "solicitar revisión", sección 13 del documento de moderación) — no hay una acción sin posibilidad de cuestionarla.

## 9. Pedir revisión desde SUPPORT

- **Objetivo:** permitir que `SUPPORT` intervenga en casos excepcionales (club sin STAFF/ADMIN activo, o patrón cross-club).
- **Usuario/rol:** `SUPPORT`.
- **Pantalla/modal:** panel de soporte (ya existente en el rol SUPPORT de la app real, extendido conceptualmente aquí) con vista de reportes de todos los clubes, filtrable.
- **Acción principal:** tomar el caso, resolverlo o devolverlo al club con una nota.
- **Texto visible:** *"Este caso fue escalado. Revisa el contexto antes de actuar."*
- **Dato tratado:** `Report`, `ModerationAction`, `AuditLog` (con visión multi-club, ya permitido por RLS).
- **Consentimiento/base jurídica:** interés legítimo.
- **Estado guardado:** igual que flujo 8.
- **Log/auditoría:** `AuditLog`, con `actor_id=SUPPORT`, para dejar claro que la intervención fue excepcional.
- **Efecto sobre el contenido/usuario:** igual que flujo 8, ejecutado por un rol distinto.
- **Riesgo:** uso de SUPPORT como vía habitual en vez de excepción, erosionando la autonomía de moderación de cada club.
- **Mitigación:** principio ya establecido en la sección 14 del documento de moderación — SUPPORT solo interviene en los 3 casos ahí definidos, no en la operativa diaria.

## 10. Mostrar estado de reporte al usuario

- **Objetivo:** dar transparencia mínima al reportante sin exponer el proceso interno.
- **Usuario/rol:** `PLAYER` que reportó.
- **Pantalla/modal:** sección "Mis reportes" (dentro de "Privacidad de mi comunidad" o similar) con lista simple: motivo, fecha, estado.
- **Acción principal:** ninguna (solo lectura).
- **Texto visible:** *"Reportado el [fecha] · Estado: en revisión / resuelto / no procede."*
- **Dato tratado:** lectura de los propios `Report` (sin `ModerationAction.notes`).
- **Consentimiento/base jurídica:** ejercicio de transparencia, no requiere consentimiento adicional.
- **Estado guardado:** no aplica (solo lectura).
- **Log/auditoría:** no requerido.
- **Efecto sobre el contenido/usuario reportado:** ninguno.
- **Efecto sobre el usuario que reporta:** confianza en que el reporte se procesó, sin detalle interno.
- **Riesgo:** frustración si el usuario espera saber "qué se hizo exactamente".
- **Mitigación:** copy claro desde el primer momento (flujo 1) de que no se comparte el detalle de la resolución, para no generar expectativas incumplidas.

## 11. Mostrar aviso de contenido oculto

- **Objetivo:** informar con transparencia cuando un contenido ha sido retirado por moderación, sin dejar un hueco vacío sin explicación.
- **Usuario/rol:** cualquier `PLAYER` que hubiera visto ese contenido.
- **Pantalla/modal:** tarjeta sustituida en el feed por un marcador "Contenido no disponible".
- **Acción principal:** ninguna (informativo).
- **Texto visible:** *"Este contenido fue revisado por el equipo de moderación del club y ya no está visible."*
- **Dato tratado:** ninguno nuevo — es una representación del estado ya guardado (`CommunityPost.deleted_at` por moderación).
- **Consentimiento/base jurídica:** no aplica.
- **Estado guardado:** no aplica (lectura).
- **Log/auditoría:** ya cubierto por el `AuditLog` de la `ModerationAction` original.
- **Efecto sobre el contenido:** visualmente sustituido para todos salvo STAFF/ADMIN (que ven el original con la etiqueta de retirado, ya definido en el prototipo de feed).
- **Efecto sobre el usuario reportado (autor):** ve su propio contenido marcado como retirado si entra a su perfil/historial.
- **Efecto sobre el usuario que reporta:** confirma que su reporte tuvo efecto, sin más detalle.
- **Riesgo:** ninguno significativo.
- **Mitigación:** no aplica.

## 12. Mostrar sanción o advertencia

- **Objetivo:** comunicar al usuario afectado que ha recibido una `ModerationAction`, sin exponer deliberación interna ni al reportante.
- **Usuario/rol:** el `PLAYER` sancionado.
- **Pantalla/modal:** `Notification` (`notification_type=moderation_action`) + pantalla de detalle si la abre.
- **Acción principal:** el usuario puede "Solicitar revisión" (crea un nuevo `Report` sobre la decisión, ver sección 13 del documento de moderación).
- **Texto visible:** *"Has recibido un aviso de nuestro equipo de moderación por [motivo general, sin detalle del reportante]. Si crees que es un error, puedes solicitar revisión."*
- **Dato tratado:** `Notification`, lectura de `ModerationAction` (resumen, sin `notes`).
- **Consentimiento/base jurídica:** no aplica (esta notificación no es opcional, es informativa de una decisión que ya le afecta — ejecución de contrato/interés legítimo, no puede desactivarse como el resto de notificaciones sociales).
- **Estado guardado:** `Notification.read_at` al abrirla.
- **Log/auditoría:** ya cubierto por la `ModerationAction` original; si solicita revisión, nuevo `Report` + `AuditLog`.
- **Efecto sobre el contenido:** no aplica (ya resuelto en el flujo que generó la sanción).
- **Efecto sobre el usuario reportado (sancionado):** informado, con vía de reclamación.
- **Efecto sobre el usuario que reporta:** no interviene en este flujo.
- **Riesgo:** que el usuario sancionado identifique al reportante por deducción (p. ej. si solo interactuó con una persona ese día).
- **Mitigación:** el aviso nunca incluye fecha/hora exacta del contenido reportado ni detalles que permitan deducir al reportante — solo el motivo general.
