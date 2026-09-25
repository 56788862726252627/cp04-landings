# Prototipo — Feed social de Comunidad Pádel 04
### Prompt B ejecutado — Diseño visual aislado, sin integración

**Estado:** especificación de prototipo + HTML estático aislado (`app/projects/club-padel-04/community-prototypes/feed-social.html`). Sin conexión a datos reales, sin integración en `App.jsx`.
**Fecha:** 2026-07-14
**Depende de:** `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md`, `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` (mismo directorio, ya mergeados en `main`).
**Prototipo HTML:** `app/projects/club-padel-04/community-prototypes/feed-social.html` (estático, datos ficticios, ver `UX_UI_COMPONENTES_COMUNIDAD_PADEL_04.md` para el sistema visual).

---

## 1. Objetivo del feed

Mostrar actividad social relevante del club (publicaciones de staff, actividad de partidos abiertos, retos y eventos) en un único listado cronológico filtrable, como punto de entrada diario a la comunidad — sin sustituir el feed por un timeline infinito tipo red social genérica: se prioriza relevancia de club sobre volumen.

## 2. Usuarios destinatarios

`PLAYER` con `social_layer_opt_in` activo (lectura); `STAFF`/`ADMIN` además pueden publicar contenido oficial (`club_announcement`). `SUPPORT` no tiene un feed propio — su acceso es de auditoría, no de uso social (ya establecido en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`).

## 3. Estructura de pantalla

De arriba a abajo: cabecera de comunidad (nombre del club + selector de contexto) → barra de filtros (Todo/Club/Amigos/Partidos/Eventos) → banner de privacidad (solo si aplica, ver sección 9) → CTA doble (Crear publicación / Buscar partido) → listado de tarjetas de publicación → estado vacío o de scroll (si no hay más contenido).

## 4. Estados del feed

| Estado | Cuándo se muestra |
|---|---|
| Cargando | Mientras se resuelve el listado (mock: `skeleton` breve) |
| Con contenido | Listado normal de tarjetas |
| Vacío (club sin actividad) | Club activo pero sin publicaciones recientes |
| Sin consentimiento (`social_layer_opt_in=false`) | El usuario no ha activado la capa social — se sustituye el feed por una pantalla de activación, no un feed vacío |
| Error de carga (mock) | Estado de reintento, sin detalles técnicos expuestos al usuario |

## 5. Tipos de publicaciones

Coherente con `CommunityPost.post_type` (`MODELO_DATOS_SOCIAL...md`, 6.6) y con actividad generada por otras entidades:
- `club_announcement` — publicado por STAFF/ADMIN, siempre visible al club.
- `player_activity` — publicado por un jugador (texto + foto opcional).
- `system_generated` — actividad de partidos abiertos (`OpenMatch` nuevo/completado), retos (`Challenge` resuelto, fase 2) y eventos (`Event` publicado) representada como tarjeta especial, no como post de texto libre.

## 6. Acciones permitidas

Leer, reaccionar (`Reaction`), comentar (`Comment`), publicar (con consentimiento), filtrar, reportar, ocultar (silenciar localmente sin reportar), unirse a un partido abierto mostrado en el feed, ver perfil del autor.

## 7. Acciones bloqueadas

Editar contenido ajeno, ver quién reaccionó en detalle (solo STAFF/ADMIN en moderación, ya definido en RLS), publicar sin `appear_in_feed`, adjuntar foto sin `publish_photos`, interactuar con contenido de un usuario que te ha bloqueado o al que has bloqueado (oculto de forma transparente, sin explicar el motivo).

## 8. Consentimiento requerido

- Leer el feed → `social_layer_opt_in`.
- Publicar → `appear_in_feed` (+ `publish_photos` si adjunta imagen).
- Ver partidos abiertos en el feed → visibilidad del `OpenMatch` según su propio `visibility`, no requiere consentimiento adicional del lector.
Referencia completa: `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, secciones 5 y 8.

## 9. Privacidad por defecto

El filtro por defecto al entrar es **"Club"**, no "Todo" (que en este diseño no existe como opción cross-club — ver sección 6 del roadmap: nada visible entre clubes). El feed nunca muestra contenido `friends` de un usuario que no sea amigo del que mira, incluso si ambos son del mismo club. El banner de privacidad aparece la primera vez que se entra al feed tras activar `social_layer_opt_in`, recordando cómo cambiar la visibilidad — se puede cerrar y no reaparece salvo cambio de consentimiento.

## 10. Moderación

Cada tarjeta tiene un menú "⋯" con "Reportar" y "Ocultar". Ningún contenido se retira del feed de forma automática — un `Report` entra en cola de revisión humana (ya establecido en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección 9). Contenido con `ModerationAction.action_type=content_removed` desaparece del feed para todos salvo STAFF/ADMIN (que ven un marcador "contenido retirado por moderación").

## 11. Reportes

Botón "Reportar" disponible en toda tarjeta y en cada comentario, sin gate de consentimiento (ya establecido, sección 21 de `CONSENTIMIENTO_PRIVACIDAD...md`). El prototipo HTML muestra el modal de reporte como mock (sin envío real).

## 12. Datos usados

`CommunityPost`, `Comment`, `Reaction`, `OpenMatch` (resumen), `Event` (resumen), `UserProfile.display_name`, `PlayerSocialProfile.avatar_url`. Ninguno con datos reales en este prototipo — ver sección "Datos ficticios" en `CHECKLIST_PROTOTIPOS_FEED_PERFIL_COMUNIDAD_PADEL_04.md`.

## 13. Entidades relacionadas

Ver `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`: `CommunityPost` (6.6), `Comment` (6.7), `Reaction` (6.8), `OpenMatch` (6.9), `Event` (6.14), `Report` (6.18). El prototipo no crea, lee ni escribe ninguna de estas entidades contra un backend real — son datos mock embebidos en el HTML.

## 14. Riesgos

Hereda los riesgos ya identificados en `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` #2 (mención de terceros en posts), #3 (fotos de terceros), #4 (contenido ya visto no se revierte), #13 (confusión ranking, no aplica directamente al feed pero sí a las tarjetas de actividad de partidos si se malinterpretan como oficiales — mitigado con etiquetado "social"). Ningún riesgo nuevo introducido por el prototipo visual en sí, al ser estático y sin datos reales.

## 15. Validaciones antes de implementación

- [ ] Confirmar que el filtro por defecto es "Club", no "Todo", en la implementación real (coherente con esta especificación).
- [ ] Confirmar que el banner de privacidad se apoya en el `PrivacyConsent` real, no en un flag de UI aislado.
- [ ] Verificar que "Ocultar" es una preferencia local del usuario (no un `Report`), y que no genera ningún registro visible a terceros.
- [ ] Verificar accesibilidad real (no solo la del mock) antes de integrar — ver `UX_UI_COMPONENTES_COMUNIDAD_PADEL_04.md`.
- [ ] Ninguna integración con `App.jsx` sin autorización explícita (Prompt N).
