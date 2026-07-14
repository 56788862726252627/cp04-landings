# Amigos, seguidores y conexiones — Comunidad Pádel 04
### Prompt G ejecutado — Diseño funcional, sin implementación

**Estado:** documento de diseño. Sin código funcional, sin Supabase real, sin integración en `App.jsx`.
**Fecha:** 2026-07-14
**Rama:** `docs-ui/comunidad-padel-amigos-seguidores-2026-07-14`
**Depende de:** `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md`, `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md`, `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md`, `FLUJOS_UI_MODERACION_REPORTES_COMUNIDAD_PADEL_04.md`, `PROTOTIPO_FEED_SOCIAL_COMUNIDAD_PADEL_04.md`, `PROTOTIPO_PERFIL_JUGADOR_COMUNIDAD_PADEL_04.md`, `PARTIDOS_ABIERTOS_BUSCAR_COMPANERO_COMUNIDAD_PADEL_04.md`, `REGLAS_MATCHMAKING_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `UX_UI_COMPONENTES_COMUNIDAD_PADEL_04.md` (mismo directorio, ya mergeados en `main`).
**Documentos hermanos:** `FLUJOS_UI_AMIGOS_SEGUIDORES_COMUNIDAD_PADEL_04.md`, `REGLAS_PRIVACIDAD_CONEXIONES_COMUNIDAD_PADEL_04.md`, `CHECKLIST_AMIGOS_SEGUIDORES_COMUNIDAD_PADEL_04.md`.
**Prototipo HTML:** `app/projects/club-padel-04/community-prototypes/amigos-seguidores.html`.

---

## 1. Resumen ejecutivo

Este documento diseña la capa de relaciones sociales de Comunidad Pádel 04: amigos (bidireccional), seguidores (unidireccional, fase 2) y conexiones sugeridas. Se apoya íntegramente en las entidades `Friendship` y `Follow` ya mergeadas (`MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, secciones 6.4-6.5) y en la regla de bloqueo ya confirmada en los Prompts E y D — no redefine el modelo de datos, lo convierte en flujos operativos, reglas de privacidad y un prototipo visual mock. Es la pieza que cierra el ciclo social básico: la visibilidad `friends` ya usada en feed, perfil y partidos abiertos depende directamente de lo diseñado aquí.

## 2. Objetivo funcional

Permitir que un jugador construya su red de contactos dentro del club (amigos con relación mutua, seguidores para visibilidad unidireccional de actividad) de forma que el resto de módulos ya mergeados (feed, perfil, partidos abiertos) puedan resolver correctamente su visibilidad `friends` sin ambigüedad.

## 3. Valor para jugadores

Ver actividad de gente que conocen sin ruido de todo el club; encontrar rivales habituales más rápido en partidos abiertos (visibilidad `friends` ya prioriza contactos); control total de quién es "amigo" (requiere aceptación mutua, no unilateral).

## 4. Valor para el club

Mayor retención al reforzar vínculos entre socios ya conocidos; ningún coste operativo nuevo (autoservicio total, sin intervención de STAFF salvo moderación).

## 5. Valor para la Agencia IA

Completa el ciclo social mínimo viable — sin esta pieza, "visibilidad friends" (ya usada en 3 módulos mergeados) sería una promesa sin mecanismo real detrás. Es la función que hace coherente todo lo construido hasta ahora, no una función aislada nueva.

## 6. Alcance MVP

Amigos: enviar/aceptar/rechazar/cancelar solicitud, eliminar amigo, ver lista de amigos. Bloqueo y reporte (ya diseñados, reutilizados aquí). Sin seguidores, sin conexiones sugeridas en el MVP — ver sección 7.

## 7. Alcance premium/futuro

Seguidores (`Follow`, ya mergeada como entidad, fase 2 en el roadmap original — este documento no adelanta su fecha, solo diseña su flujo para cuando se active), conexiones sugeridas (algoritmo simple por club/nivel, sin IA), estadísticas de "amigos en común" ya mostradas de forma básica en el prototipo de perfil (PR #18) pero sin fuente de datos real hasta este documento.

## 8. Entidades implicadas

`Friendship` (6.4) y `Follow` (6.5), ya mergeadas. Relacionadas: `UserProfile`, `PlayerSocialProfile` (visibilidad), `Notification`, `Report`/`ModerationAction`, `AuditLog`. Ninguna entidad nueva se introduce en este documento.

## 9. Diferencia entre amigos, seguidores y conexiones

- **Amigos** (`Friendship`, MVP): relación bidireccional, requiere aceptación de ambas partes, da acceso a la visibilidad `friends` en feed/perfil/partidos abiertos.
- **Seguidores** (`Follow`, fase 2): relación unidireccional, sin aceptación (si el perfil objetivo lo permite), da visibilidad de actividad pública pero **no** habilita la visibilidad `friends` — son conceptos distintos, no un subconjunto uno del otro.
- **Conexiones sugeridas** (fase 2): no es una relación en sí misma, es una lista de candidatos a amistad, calculada por coincidencia de club/nivel/amigos en común — no persiste como entidad, se calcula en el momento.

## 10. Solicitud de amistad

Cualquier `PLAYER` con `social_layer_opt_in` activo puede enviar una solicitud a otro jugador del mismo club, salvo bloqueo mutuo (sección 18). Crea `Friendship(status=pending, requester_id=quien envía)`. No requiere que el destinatario tenga ningún consentimiento adicional para *recibir* la solicitud — recibirla es pasivo, aceptarla es la acción que activa la relación.

## 11. Aceptar/rechazar solicitud

Solo el `addressee_id` decide. Aceptar pasa `Friendship.status=accepted` (relación activa). Rechazar pasa a `status=rejected` — el modelo de datos no distingue explícitamente si un rechazo permite reintentar una nueva solicitud más tarde; se recomienda **sí permitirlo** (un rechazo no es un bloqueo permanente), salvo que el destinatario bloquee directamente.

## 12. Seguir/dejar de seguir

**Fase 2.** Crea/elimina `Follow(follower_id, followed_id)`, solo si `followed_id` tiene `visibility_level ≥ club` (ya definido en el modelo de datos). No requiere aceptación del seguido.

## 13. Conexiones sugeridas

**Fase 2.** Cálculo simple (no IA, no matching algorítmico): jugadores del mismo club con `social_layer_opt_in` activo, ordenados por número de amigos en común, excluyendo ya-amigos, solicitudes pendientes y bloqueados. Sin persistencia — se recalcula en cada visita a la pantalla.

## 14. Visibilidad de amigos y seguidores

La lista de amigos de un jugador es visible según su propia configuración (recomendado: visible solo a otros amigos por defecto, nunca pública a todo el club sin acción explícita — más restrictivo que el nivel/bio, porque revela una red de relaciones de terceros, no solo datos propios). La lista de seguidores/seguidos (fase 2) puede ser más laxa (contador público, lista detallada solo al propio usuario), mismo criterio ya aplicado en `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` sección 6.5.

## 15. Privacidad por defecto

Ninguna lista de amigos/seguidores nace pública. El propio hecho de "ser amigos" solo es visible si ambas partes lo permiten (ya establecido en `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, 6.4). Una solicitud de amistad pendiente nunca es visible a nadie más que las dos partes implicadas.

## 16. Consentimiento requerido

`social_layer_opt_in` para enviar o recibir solicitudes (paraguas general, ya establecido). No se requiere un consentimiento nuevo específico de "amigos" — a diferencia de `searchable_by_others` (necesario para aparecer en búsqueda de jugadores, fase 2, no cubierto por este documento) o `receive_non_friend_messages` (necesario para mensajería con no-amigos, Prompt K/L). Seguir a alguien (fase 2) sí requiere que el seguido tenga su visibilidad en `club` o superior (sección 12).

## 17. Bloqueos y reportes

Mismo flujo ya diseñado en el Prompt E: reportar un perfil o usuario sin gate de consentimiento, reportante siempre anónimo. Bloquear deshace automáticamente cualquier `Friendship`/`Follow` existente entre las partes (regla de negocio nueva, no explícita en el modelo de datos original — se recomienda aquí como comportamiento correcto, ver checklist).

## 18. Regla crítica: usuarios bloqueados no pueden seguirse, invitarse ni enviarse solicitudes

Extiende la regla crítica ya establecida en partidos abiertos (`PARTIDOS_ABIERTOS_BUSCAR_COMPANERO_COMUNIDAD_PADEL_04.md`, sección 22) a esta capa: **ningún `Friendship(status=pending)` ni `Follow` puede crearse si existe `Friendship.status=blocked` entre las partes, en cualquier dirección.** Doble barrera: (1) el perfil bloqueado no debe aparecer en conexiones sugeridas ni ser encontrable para enviar solicitud; (2) la creación de la solicitud/seguimiento debe validarse igualmente, nunca confiar solo en el filtrado de UI.

## 19. Impacto en feed

La visibilidad `friends` de `CommunityPost` (ya mergeada, Prompt B) depende directamente de `Friendship.status=accepted` — este documento es la pieza que hace funcional esa visibilidad, ya prometida pero no implementada hasta ahora.

## 20. Impacto en perfil

`PlayerSocialProfile.visibility_*` en modo `friends` (ya mergeado, Prompt C) depende de esta misma relación. "Amigos en común" (ya mostrado como mock en `perfil-jugador.html`, PR #18) se calcula por intersección de `Friendship(status=accepted)` de ambos usuarios.

## 21. Impacto en partidos abiertos

`OpenMatch.visibility=friends` (ya mergeado, Prompt D) depende de esta misma relación — un partido con visibilidad `friends` solo es visible a quienes tengan `Friendship.status=accepted` con el creador.

## 22. Notificaciones mock

`Notification(notification_type=friend_request)` al destinatario de una solicitud; al remitente cuando se acepta (no se notifica el rechazo de forma intrusiva, solo se refleja en el estado si el usuario revisa sus solicitudes enviadas — evita fricción social innecesaria). Sin proveedor push/email real, igual que el resto del catálogo.

## 23. Riesgos RGPD

La lista de amigos revela relaciones sociales entre personas identificables — ya señalado como riesgo medio en `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` (6.4) y mitigado con visibilidad restrictiva por defecto (sección 15). "Amigos en común" combina datos de dos personas para mostrárselos a una tercera — riesgo adicional no señalado explícitamente hasta ahora, mitigado porque solo se muestra el número/nombres si ambos amigos en común tienen visibilidad que lo permite, nunca de forma incondicional.

## 24. Riesgos de abuso

Solicitudes de amistad repetidas tras rechazo como forma de acoso (mitigado con reporte + bloqueo, no con límite técnico de reintentos en el MVP — señalado como posible mejora futura); uso de "conexiones sugeridas" para localizar a alguien que prefiere no ser encontrado (mitigado con exclusión de bloqueados y con que solo aparecen jugadores con `social_layer_opt_in` activo, nunca terceros pasivos).

## 25. Qué NO entra todavía

Mensajería entre amigos (Prompts K/L), notificaciones push/email reales, sugerencias por IA/matching algorítmico, importación de contactos externos (ya descartada en el roadmap, sección 20), listas de amigos "cercanos"/categorías dentro de amigos, integración con `App.jsx`, Supabase real, migraciones SQL reales.

## 26. MVP recomendado

7 de los 17 flujos: ver lista de amigos, enviar solicitud, aceptar solicitud, rechazar solicitud, cancelar solicitud enviada, eliminar amigo, bloquear/reportar (ya reutilizados de Prompts E/D). Seguidores, seguidos, conexiones sugeridas y ocultar sugerencia quedan documentados pero marcados fase 2.

## 27. Checklist antes de implementación

- [ ] Confirmar la regla "bloquear deshace amistad/seguimiento existente" con producto antes de implementar (sección 17) — extensión de comportamiento no explícita en el modelo de datos original.
- [ ] Tests específicos de la regla de bloqueo con doble barrera (sección 18), mismo criterio que en partidos abiertos.
- [ ] Confirmar el criterio de "amigos en común" (qué visibilidad debe cumplirse para mostrarlo) con producto antes de implementar.
- [ ] Ninguna implementación real hasta autorización explícita (Prompt N).

## 28. Siguiente prompt recomendado

Con amigos y seguidores diseñados (Prompt G), el ciclo social básico del MVP queda completo (perfil, feed, moderación, partidos abiertos, amigos). El catálogo recomienda avanzar al **Prompt Q — QA, seguridad y cierre de calidad**, revisando de forma transversal los 5 módulos ya diseñados antes de considerar cualquier paso hacia el Prompt N (integración con `App.jsx`, que requiere autorización explícita).
