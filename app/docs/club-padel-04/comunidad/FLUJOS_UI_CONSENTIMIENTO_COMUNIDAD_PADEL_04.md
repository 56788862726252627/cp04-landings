# Flujos de UI de consentimiento — Comunidad Pádel 04
### 14 flujos pantalla a pantalla, sin implementación

**Estado:** especificación de flujo, sin diseño visual final ni código. Los textos citados son **borrador**, no definitivos — ver `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md` para las versiones extendidas y `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md` para el marco legal completo.
**Fecha:** 2026-07-14
**Depende de:** `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md` (mismo directorio) — usa la taxonomía de 8 consentimientos allí definida.

**Aviso:** ningún diseño visual (color, tipografía, layout) queda fijado aquí — solo estructura funcional de cada pantalla/modal. El diseño visual final es tarea de los Prompts B/C, con identidad 100% propia de Club Pádel 04.

---

## 1. Alta de usuario

- **Objetivo:** informar, en el momento del alta general de la cuenta (fuera de esta capa social), de que existe una comunidad social opcional, sin activarla todavía.
- **Pantalla/modal:** paso informativo dentro del alta ya existente (no un modal nuevo separado) — una tarjeta breve "Club Pádel 04 tiene una comunidad social opcional. Podrás activarla cuando quieras desde tu perfil."
- **Texto corto:** *"Además de reservar pista, puedes conectar con otros jugadores del club cuando tú quieras. Es 100% opcional."*
- **Consentimiento requerido:** ninguno todavía (solo informativo).
- **Obligatorio/opcional:** no aplica (no hay acción de consentimiento en este paso).
- **Dato tratado:** ninguno nuevo.
- **Base jurídica:** no aplica.
- **Acción del usuario:** "Entendido" / continuar el alta normal.
- **Estado guardado:** ninguno (no se registra ni siquiera que vio el aviso, para no generar tracking innecesario).
- **Efecto si rechaza:** no aplica — no hay nada que rechazar en este paso.
- **Efecto si retira después:** no aplica.
- **Log/auditoría:** ninguno.

## 2. Primer acceso a Comunidad

- **Objetivo:** presentar la capa social por primera vez y capturar el consentimiento paraguas (`social_layer_opt_in`) antes de mostrar cualquier función.
- **Pantalla/modal:** pantalla completa (no modal pequeño), con explicación breve de qué implica activarla y enlace al texto legal completo.
- **Texto corto:** *"Antes de activar la comunidad, esto es lo que debes saber: tu perfil social parte en privado, tú decides qué compartir, y puedes desactivarlo cuando quieras. [Leer más]"*
- **Consentimiento requerido:** `social_layer_opt_in`.
- **Obligatorio/opcional:** opcional (pero obligatorio-en-cascada para acceder a cualquier función social posterior).
- **Dato tratado:** creación de `PlayerSocialProfile` con visibilidad por defecto restrictiva.
- **Base jurídica:** consentimiento.
- **Acción del usuario:** botón "Activar comunidad" / "Ahora no".
- **Estado guardado:** `PrivacyConsent(consent_type=social_layer_opt_in, granted=true)`.
- **Efecto si rechaza:** el usuario sigue usando reservas/torneos/perfil premium normalmente; no ve ninguna pantalla social hasta que vuelva a este punto voluntariamente.
- **Efecto si retira después:** desactiva en cascada los 7 consentimientos restantes; oculta todo contenido social propio (no lo borra, ver sección 10 del documento de consentimiento).
- **Log/auditoría:** `AuditLog(action="privacy_consent.granted", target=social_layer_opt_in)`.

## 3. Activar perfil social

- **Objetivo:** configurar visibilidad del perfil (nivel, bio, disponibilidad) tras haber aceptado `social_layer_opt_in`.
- **Pantalla/modal:** pantalla de "Mi perfil social" con toggles independientes por campo (patrón validado en la auditoría de capturas).
- **Texto corto:** *"Elige qué puede ver cada persona. Puedes cambiarlo cuando quieras."*
- **Consentimiento requerido:** ninguno adicional a `social_layer_opt_in` (la configuración de visibilidad es una preferencia, no un consentimiento nuevo — ya está dentro del paraguas).
- **Obligatorio/opcional:** opcional cada campo (nivel visible solo a amigos por defecto, etc.).
- **Dato tratado:** `PlayerSocialProfile.visibility_level/matches_played/availability`.
- **Base jurídica:** consentimiento (heredado de `social_layer_opt_in`).
- **Acción del usuario:** toggles por campo + guardar.
- **Estado guardado:** actualización de `PlayerSocialProfile`.
- **Efecto si rechaza:** todos los campos quedan en el valor más restrictivo por defecto (no requiere una acción de "rechazo" explícita, es el estado inicial).
- **Efecto si retira después:** cambiar cualquier campo a más restrictivo tiene efecto inmediato; los datos ya vistos por otros no se pueden revertir (mismo límite técnico ya documentado).
- **Log/auditoría:** `AuditLog` solo si cambia de más restrictivo a menos restrictivo (evento relevante); no se audita cada ajuste menor para no generar ruido excesivo.

## 4. Activar partidos abiertos

- **Objetivo:** capturar `activity_sharing` antes de permitir crear o unirse a un `OpenMatch` visible a otros.
- **Pantalla/modal:** modal breve al pulsar "Crear partido abierto" por primera vez.
- **Texto corto:** *"Al publicar un partido abierto, otros jugadores de tu club podrán ver que buscas rival en esa fecha y hora. ¿Quieres activarlo?"*
- **Consentimiento requerido:** `activity_sharing`.
- **Obligatorio/opcional:** opcional, pero obligatorio para usar la función concreta.
- **Dato tratado:** `OpenMatch` (fecha, club, nivel), notificaciones a contactos.
- **Base jurídica:** consentimiento.
- **Acción del usuario:** "Sí, activar" / "No, cancelar".
- **Estado guardado:** `PrivacyConsent(consent_type=activity_sharing, granted=true)`.
- **Efecto si rechaza:** no puede crear ni unirse a partidos abiertos; puede seguir reservando pista normalmente (fuera de esta capa).
- **Efecto si retira después:** sus `OpenMatch` activos se cancelan automáticamente (con aviso a quien ya se hubiera unido) o se mantienen visibles solo a quienes ya se unieron (decisión de negocio a definir, marcado como punto abierto).
- **Log/auditoría:** `AuditLog(action="privacy_consent.granted", target=activity_sharing)`.

## 5. Publicar en el muro/feed

- **Objetivo:** capturar `appear_in_feed` (y `publish_photos` si adjunta imagen) antes de publicar el primer post.
- **Pantalla/modal:** aviso inline (no modal bloqueante) la primera vez que el usuario pulsa "Publicar", con checkbox si adjunta foto.
- **Texto corto:** *"Esto se mostrará en el feed según tu visibilidad configurada. Puede ser leído, comentado y, si se reporta, revisado por moderación."* + (si adjunta foto) *"Confirmo que esta imagen es mía o tengo derecho a compartirla."*
- **Consentimiento requerido:** `appear_in_feed` (+ `publish_photos` si aplica).
- **Obligatorio/opcional:** opcional, pero obligatorio para esta función concreta.
- **Dato tratado:** `CommunityPost.body` (+ imagen si aplica).
- **Base jurídica:** consentimiento.
- **Acción del usuario:** activar consentimiento (una vez) + publicar cada post después sin repetir el aviso.
- **Estado guardado:** `PrivacyConsent` + el propio `CommunityPost`.
- **Efecto si rechaza:** no puede publicar (puede seguir leyendo el feed si `social_layer_opt_in` está activo).
- **Efecto si retira después:** posts ya publicados se ocultan (soft delete de visibilidad, no de dato) — ver sección 10 del documento de consentimiento.
- **Log/auditoría:** `AuditLog` en el otorgamiento del consentimiento; no en cada post individual (eso ya queda registrado como `CommunityPost.created_at`).

## 6. Unirse a grupos

- **Objetivo:** confirmar que unirse a un grupo (fase 2) revela la pertenencia a otros miembros.
- **Pantalla/modal:** modal breve al pulsar "Unirme" en un grupo público, o al aceptar una invitación a uno privado.
- **Texto corto:** *"Los demás miembros de este grupo podrán ver que formas parte de él."*
- **Consentimiento requerido:** ninguno nuevo — cubierto por `social_layer_opt_in` ya activo (unirse es una acción directa, no una exposición pasiva nueva).
- **Obligatorio/opcional:** opcional (la acción en sí).
- **Dato tratado:** `GroupMember`.
- **Base jurídica:** consentimiento (heredado) / ejecución de la acción solicitada por el usuario.
- **Acción del usuario:** "Unirme" / cancelar.
- **Estado guardado:** creación de `GroupMember`.
- **Efecto si rechaza:** no se une, sin más efecto.
- **Efecto si retira después:** abandonar el grupo (acción directa, no requiere retirar consentimiento general).
- **Log/auditoría:** no requiere `AuditLog` dedicado (es una acción social ordinaria, no un consentimiento nuevo); queda registrada en `GroupMember.joined_at/left_at`.

## 7. Participar en eventos

- **Objetivo:** informar, al inscribirse, de la visibilidad de la lista de inscritos si aplica.
- **Pantalla/modal:** paso final del flujo de inscripción a un `Event`.
- **Texto corto:** *"Al inscribirte, el organizador verá tu nombre. [Si aplica:] Otros inscritos también podrán verte en la lista."*
- **Consentimiento requerido:** ninguno nuevo (ejecución de contrato/interés legítimo, ya cubierto en `social_layer_opt_in`).
- **Obligatorio/opcional:** obligatorio ver el aviso; la inscripción en sí es voluntaria.
- **Dato tratado:** `EventRegistration`.
- **Base jurídica:** ejecución de contrato / interés legítimo.
- **Acción del usuario:** "Confirmar inscripción" / cancelar.
- **Estado guardado:** creación de `EventRegistration`.
- **Efecto si rechaza:** no se inscribe.
- **Efecto si retira después:** cancelar inscripción (acción directa; libera cupo para lista de espera).
- **Log/auditoría:** no requiere `AuditLog` dedicado; queda en `EventRegistration.status/cancelled_at`.

## 8. Aparecer en ranking social

- **Objetivo:** capturar `ranking_visibility` antes de incluir al jugador en el listado público del ranking social.
- **Pantalla/modal:** toggle específico dentro de "Mi perfil social", con explicación breve.
- **Texto corto:** *"Si lo activas, tu posición y puntos serán visibles para el club en el ranking social (no oficial). Puedes desactivarlo cuando quieras."*
- **Consentimiento requerido:** `ranking_visibility`.
- **Obligatorio/opcional:** opcional.
- **Dato tratado:** `SocialRanking.points/position` visibles a terceros.
- **Base jurídica:** consentimiento.
- **Acción del usuario:** activar/desactivar toggle.
- **Estado guardado:** `PrivacyConsent(consent_type=ranking_visibility)`.
- **Efecto si rechaza:** sus puntos se siguen calculando internamente pero no aparece en el listado público.
- **Efecto si retira después:** desaparece del listado público de inmediato; histórico interno se conserva (no se pierde si reactiva).
- **Log/auditoría:** `AuditLog(action="privacy_consent.granted/revoked", target=ranking_visibility)`.

## 9. Recibir notificaciones

- **Objetivo:** dar control de preferencias de notificación, distinguiendo lo funcional (no requiere consentimiento) de lo social (si aplica).
- **Pantalla/modal:** pantalla de "Preferencias de notificaciones" con toggles por tipo (`friend_request`, `match_invite`, `event_reminder`, `moderation_action`, `system`).
- **Texto corto:** *"Elige qué notificaciones quieres recibir. Las de seguridad y moderación no se pueden desactivar."*
- **Consentimiento requerido:** ninguno formal (preferencia de UX, no gate RGPD) salvo la relación con `activity_sharing` para notificaciones que informan a terceros sobre uno mismo.
- **Obligatorio/opcional:** opcionales salvo `moderation_action` (no desactivable, por seguridad) y avisos de sistema críticos.
- **Dato tratado:** `Notification` (preferencias de tipo).
- **Base jurídica:** ejecución de contrato / interés legítimo (funcionales); consentimiento (las derivadas de `activity_sharing`).
- **Acción del usuario:** toggles por tipo.
- **Estado guardado:** preferencia de notificación (no necesariamente en `PrivacyConsent`, puede ser un campo propio de preferencias — a definir en implementación).
- **Efecto si rechaza:** deja de recibir ese tipo de notificación; no afecta a que se genere el evento subyacente.
- **Efecto si retira después:** aplica de inmediato a notificaciones futuras, no borra las ya enviadas.
- **Log/auditoría:** no crítico; cambios de preferencia no requieren `AuditLog` dedicado.

## 10. Retirar consentimiento

- **Objetivo:** un único lugar central donde ver y retirar cualquiera de los 8 consentimientos, con la misma facilidad con la que se otorgaron.
- **Pantalla/modal:** pantalla "Privacidad de mi comunidad" — lista de los 8 consentimientos con su estado actual y fecha de otorgamiento.
- **Texto corto:** *"Aquí puedes ver y cambiar todo lo que has aceptado. Retirar un permiso tiene efecto inmediato."*
- **Consentimiento requerido:** no aplica (es la pantalla de gestión, no de captura).
- **Obligatorio/opcional:** no aplica.
- **Dato tratado:** lectura de todos los `PrivacyConsent` propios.
- **Base jurídica:** ejercicio de derecho (art. 7.3 RGPD).
- **Acción del usuario:** toggle "off" en cualquier consentimiento individual.
- **Estado guardado:** nuevo registro `PrivacyConsent(granted=false, revoked_at=now)` — histórico inmutable, nunca se edita el registro anterior.
- **Efecto si rechaza:** no aplica (esta pantalla no "rechaza", solo gestiona lo ya otorgado).
- **Efecto si retira después:** ver efectos específicos por consentimiento en las secciones 3-8 de este documento y sección 10 de `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`.
- **Log/auditoría:** `AuditLog(action="privacy_consent.revoked", target=<tipo>)` en cada retirada.

## 11. Exportar datos

- **Objetivo:** ejercicio del derecho de portabilidad sobre los propios datos sociales.
- **Pantalla/modal:** botón "Exportar mis datos" dentro de "Privacidad de mi comunidad", con confirmación por email antes de generar el archivo (evita exportar por error o por un tercero con sesión abierta).
- **Texto corto:** *"Te enviaremos un archivo con tus datos de la comunidad (perfil, publicaciones, consentimientos). Puede tardar unos minutos."*
- **Consentimiento requerido:** no aplica (es un derecho, no un consentimiento).
- **Obligatorio/opcional:** disponible siempre, sin condición.
- **Dato tratado:** agregación de sus propias entidades (`PlayerSocialProfile`, `PlayerStats`, `CommunityPost`, `Comment`, `Friendship`, `PrivacyConsent`, etc.) — no incluye `AuditLog`/`ModerationAction` internos íntegros, solo un resumen (punto pendiente de validar con DPO, ya señalado).
- **Base jurídica:** ejercicio de derecho (art. 20 RGPD).
- **Acción del usuario:** solicitar → confirmar por email → descargar.
- **Estado guardado:** registro de la solicitud (para no duplicar exportaciones simultáneas, y por trazabilidad de cumplimiento).
- **Efecto si rechaza:** no aplica.
- **Efecto si retira después:** no aplica (es una exportación puntual, no un consentimiento continuo).
- **Log/auditoría:** `AuditLog(action="data_export.requested/completed")`.

## 12. Borrar cuenta o solicitar supresión

- **Objetivo:** ejercicio del derecho de supresión sobre la capa social (la cuenta real/reservas es un flujo distinto, fuera de alcance).
- **Pantalla/modal:** pantalla dedicada con doble confirmación (no un simple botón — acción irreversible), explicando qué se borra, qué se anonimiza y qué se conserva por obligación legal.
- **Texto corto:** *"Esto desactivará tu perfil social y ocultará tu contenido. Algunos registros se conservan de forma anonimizada por seguridad y obligación legal, según lo explicado en nuestra política de privacidad."*
- **Consentimiento requerido:** no aplica (es un derecho); se pide confirmación explícita de la acción, no un "consentimiento" en sentido RGPD.
- **Obligatorio/opcional:** disponible siempre.
- **Dato tratado:** todas las entidades sociales del usuario — desactivación/anonimización según la tabla de retención ya definida (`MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, sección 27).
- **Base jurídica:** ejercicio de derecho (art. 17 RGPD).
- **Acción del usuario:** solicitar → confirmar con contraseña o similar → confirmación final.
- **Estado guardado:** `UserProfile.deactivated_at`; `PlayerSocialProfile` soft delete a 30 días; resto según tabla de retención.
- **Efecto si rechaza:** no aplica (cancelar el flujo simplemente no ejecuta nada).
- **Efecto si retira después:** no aplica (es una acción terminal, no reversible tras el plazo de gracia — a definir si existe un plazo de arrepentimiento, punto para negocio/legal).
- **Log/auditoría:** `AuditLog(action="account.deletion_requested/executed")`, con retención larga por trazabilidad legal.

## 13. Reportar usuario/contenido

- **Objetivo:** permitir reportar sin fricción ni gate de consentimiento, en cualquier momento.
- **Pantalla/modal:** modal corto accesible desde cualquier contenido/perfil ("⋯" → "Reportar").
- **Texto corto:** *"Cuéntanos qué ha pasado. Tu identidad no se compartirá con la persona reportada."*
- **Consentimiento requerido:** ninguno.
- **Obligatorio/opcional:** disponible siempre, para cualquier usuario con `social_layer_opt_in` activo (necesita estar dentro de la capa social para reportar contenido de ella).
- **Dato tratado:** `Report` (motivo, detalle opcional).
- **Base jurídica:** interés legítimo (seguridad de la comunidad).
- **Acción del usuario:** seleccionar motivo + detalle opcional + enviar.
- **Estado guardado:** creación de `Report`.
- **Efecto si rechaza:** no aplica (cerrar el modal simplemente no envía nada).
- **Efecto si retira después:** un reporte, una vez enviado, no se retira por el usuario (evita manipulación de la cola de moderación); sí puede marcarse `dismissed` por staff si corresponde.
- **Log/auditoría:** `AuditLog` no es necesario aparte (el propio `Report`/`ModerationAction` ya es el registro).

## 14. Bloquear usuario

- **Objetivo:** permitir bloquear a otro jugador sin fricción ni gate de consentimiento, con efecto inmediato.
- **Pantalla/modal:** acción directa desde el perfil del otro usuario ("⋯" → "Bloquear"), con una única confirmación breve.
- **Texto corto:** *"Ya no podrá invitarte a partidos, escribirte ni ver tu actividad. No se le notificará que le has bloqueado."*
- **Consentimiento requerido:** ninguno.
- **Obligatorio/opcional:** disponible siempre.
- **Dato tratado:** `Friendship(status=blocked)`.
- **Base jurídica:** interés legítimo (seguridad propia).
- **Acción del usuario:** confirmar bloqueo.
- **Estado guardado:** `Friendship.status=blocked` (se conserva indefinidamente, ver `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, sección 27).
- **Efecto si rechaza:** no aplica (cancelar no ejecuta nada).
- **Efecto si retira después:** desbloquear es una acción explícita separada, disponible en cualquier momento, sin gate adicional.
- **Log/auditoría:** `AuditLog(action="friendship.blocked/unblocked")`.

---

## Resumen de consentimientos capturados en estos 14 flujos

De los 8 consentimientos definidos en `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, este documento captura explícitamente 5 en un flujo dedicado (`social_layer_opt_in`, `activity_sharing`, `appear_in_feed`+`publish_photos`, `ranking_visibility`) y confirma que 3 no requieren flujo propio por estar cubiertos por el paraguas general (`searchable_by_others`, `receive_non_friend_messages`, `approximate_location` — corresponden a funciones de fase 2/3 no incluidas en el MVP de estos 14 flujos, y tendrán su propio flujo cuando se activen esas funciones en los Prompts K/L/M).
