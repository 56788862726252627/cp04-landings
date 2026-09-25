# Prototipo — Perfil de jugador de Comunidad Pádel 04
### Prompt C ejecutado — Diseño visual aislado, sin integración

**Estado:** especificación de prototipo + HTML estático aislado (`app/projects/club-padel-04/community-prototypes/perfil-jugador.html`). Sin conexión a datos reales, sin integración en `App.jsx`, sin tocar el perfil deportivo premium ya existente en producción.
**Fecha:** 2026-07-14
**Depende de:** `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md` (mismo directorio, ya mergeados en `main`).
**Prototipo HTML:** `app/projects/club-padel-04/community-prototypes/perfil-jugador.html`.

---

## 1. Objetivo del perfil

Mostrar la identidad social de un jugador dentro de la comunidad (nivel, disponibilidad, actividad, estadísticas sociales) de forma coherente con su configuración de privacidad, sirviendo como punto de partida para amistad, invitación a partido o reto — sin duplicar ni sustituir el perfil deportivo premium ya existente en producción (`PlayerSocialProfile` es una tabla nueva y separada, ver `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, sección 17).

## 2. Estructura de pantalla

De arriba a abajo: cabecera con avatar + nombre + club principal + nivel → fila de acciones (Invitar a partido / Seguir-Conectar / ⋯ Reportar) → bloque de disponibilidad → bloque de estadísticas sociales → bloque de amigos/conexiones en común → historial social reciente (actividad tipo feed, acotada al propio perfil) → aviso de privacidad al pie.

## 3. Campos visibles

Según `PlayerSocialProfile.visibility_*` (ya definido en el modelo): `display_name` (siempre, dentro del club), `level_declared`, `avatar_url`, `bio`, disponibilidad (`visibility_availability`), partidos jugados (`visibility_matches_played`) — cada uno mostrado u oculto de forma independiente según lo que el propio jugador haya configurado, nunca todo-o-nada.

## 4. Campos privados

`auth_user_id`, `UserProfile.role`, cualquier dato de contacto real (email/teléfono — no forman parte de este modelo social en absoluto), `PrivacyConsent` propio (invisible a terceros), `AuditLog` (invisible a todos salvo ADMIN/SUPPORT).

## 5. Consentimientos asociados

- Ver el perfil de otro jugador → requiere que ese jugador tenga `social_layer_opt_in` activo (si no, el perfil no es alcanzable, ver sección 15).
- Aparecer con nivel/disponibilidad visibles → configuración propia de `visibility_*`, no un consentimiento nuevo (es una preferencia derivada del consentimiento general).
- Aparecer en ranking (si se muestra en el perfil) → `ranking_visibility`.
Referencia completa: `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección 8.

## 6. Estadísticas mostrables

De `PlayerStats` (6.3 del modelo de datos): partidos jugados, partidos ganados, racha actual — todas derivadas/agregadas, nunca editables por el usuario, mostradas solo si `visibility_matches_played` lo permite. Etiquetadas siempre como estadísticas sociales, no oficiales.

## 7. Nivel de jugador

`PlayerSocialProfile.level_declared` (iniciación/intermedio/avanzado/profesional), mostrado con una etiqueta clara **"nivel autodeclarado"** — nunca presentado como una clasificación oficial o verificada (coherente con la auditoría de capturas, sección 7).

## 8. Disponibilidad

Campo textual/simple (no calendario completo en el MVP), visible solo según `visibility_availability` (restrictivo por defecto). El prototipo lo muestra como franjas simples ("Fines de semana", "Tardes entre semana"), sin geolocalización ni datos horarios exactos en tiempo real.

## 9. Partidos abiertos

Sección "Partidos abiertos de [nombre]" — lista de `OpenMatch.status=open` creados por ese jugador y visibles al espectador según el `visibility` de cada partido. Vacía si no tiene ninguno activo o si el espectador no tiene visibilidad.

## 10. Historial social

Mini-feed acotado a la actividad propia del jugador (sus `CommunityPost` visibles al espectador según su configuración), no el feed completo del club — mismo componente de tarjeta reutilizado de `feed-social.html` mostrando un subconjunto.

## 11. Retos

Fase 2, no incluido en el MVP visual de este prototipo — se documenta el hueco reservado en el layout ("Retos" como sección futura, mostrada solo si existe al menos un `Challenge` resuelto) para no rediseñar el layout cuando se active.

## 12. Insignias

No definidas en el modelo de datos actual (no existe una entidad `Badge`). Se documenta como **hueco de diseño futuro**, no incluido en el MVP ni en el prototipo HTML — mencionarlo aquí evita que se añada de forma improvisada sin pasar por el modelo de datos primero.

## 13. Privacidad

El perfil completo respeta la configuración de visibilidad campo a campo (no hay modo "todo o nada"). Un perfil con `visibility_level=private` en todos sus campos se muestra igualmente (nombre + avatar, mínimo irreducible dentro del club), pero con un aviso "Este jugador mantiene su actividad privada" en vez de bloques vacíos sin explicación.

## 14. Bloqueo/reporte

Botón "⋯" con "Reportar perfil" y "Bloquear" — mismo patrón que en el feed, sin gate de consentimiento, con efecto inmediato (`Friendship.status=blocked`, ya definido en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección 7). Tras bloquear, el prototipo muestra el estado "Perfil no disponible" si se reintenta acceder, en vez de redirigir con explicación (protección frente a escalada, ya establecido).

## 15. Estados del perfil

| Estado | Cuándo se muestra |
|---|---|
| Perfil propio | Vista con edición habilitada de todos los campos |
| Perfil de otro (con consentimiento social activo) | Vista de solo lectura según visibilidad configurada |
| Perfil sin consentimiento social (`social_layer_opt_in=false`) | El perfil social no existe todavía — pantalla "Este jugador no ha activado su perfil de comunidad" |
| Perfil bloqueado (mutuamente) | "Perfil no disponible" |
| Perfil suspendido por moderación | "Este perfil no está disponible temporalmente" (sin detalle del motivo, visible solo a STAFF/ADMIN) |
