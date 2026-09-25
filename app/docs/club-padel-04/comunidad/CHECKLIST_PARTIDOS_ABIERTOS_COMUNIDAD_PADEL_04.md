# Checklist de validación — Partidos abiertos (Comunidad Pádel 04)

**Estado:** checklist de cierre del Prompt D. Aplicado al diseño funcional, a los flujos UI y al prototipo `partidos-abiertos.html`.
**Fecha:** 2026-07-14

---

## Checklist funcional

- [x] `OpenMatch`/`MatchInvite` reutilizados del modelo de datos ya mergeado, sin entidades nuevas.
- [x] Ningún flujo crea, modifica ni cancela una reserva real — solo referencia `related_booking_id` de solo lectura.
- [x] Estados de partido (`open`/`full`/`cancelled`/`completed`) y de invitación (`pending`/`accepted`/`rejected`/`cancelled`) coherentes con el modelo de datos.
- [x] MVP acotado a 8 de los 15 flujos; "Buscar compañero" e "Invitar jugador" correctamente marcados fase 2.

## Checklist privacidad

- [x] Ubicación exacta nunca mostrada — solo club y pista referenciada desde la reserva real.
- [x] Visibilidad `club`/`friends` del partido independiente de la visibilidad general del perfil.
- [x] Identidad de solicitantes rechazados no visible a otros solicitantes.
- [x] Estado "perfil privado" (flujo 14) diseñado como ausencia silenciosa, no como mensaje de "acceso denegado" que confirmaría la existencia del contenido restringido.

## Checklist consentimiento

- [x] `activity_sharing` requerido para crear/unirse a partidos (coherente con el Prompt F ya mergeado).
- [x] `searchable_by_others` requerido para "Buscar compañero" (fase 2).
- [x] `receive_non_friend_messages` requerido para "Invitar jugador" a un no-amigo (fase 2).
- [x] Ningún flujo del MVP requiere un consentimiento nuevo no definido ya en `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`.

## Checklist moderación

- [x] Reportar partido sigue el mismo flujo ya diseñado en el Prompt E (cola STAFF, revisión humana obligatoria).
- [x] Reportante siempre anónimo frente al creador reportado.
- [x] Decisión pendiente y explícita sobre `Report.target_type` para partidos, sin resolverla de forma improvisada (documentada como punto abierto, no como bug).

## Checklist antiabuso

- [x] Máximo una solicitud `pending` simultánea por jugador y partido.
- [x] Regla de bloqueo con doble barrera (listado + creación de invitación) documentada explícitamente.
- [x] Reconocimiento explícito de riesgos de comportamiento (cancelaciones/abandonos repetidos, rechazo discriminatorio) como fuera de alcance técnico, no ignorados sino documentados como límite del sistema de datos.

## Checklist accesibilidad

- [x] El prototipo `partidos-abiertos.html` reutiliza los componentes ya validados (`chip`, `badge`, `btn`, `empty-state`, `consent-gate`) sin introducir patrones nuevos no accesibles.
- [x] Estados de partido comunicados con texto + color (status-pill ya validado en el Prompt E), nunca solo color.
- [x] Filtros navegables con scroll horizontal propio en móvil, mismo patrón ya validado en el feed.

## Checklist responsive

- [x] Layout de una columna por debajo de 640px, coherente con el resto de prototipos.
- [x] Tarjetas de partido y formulario de creación probados visualmente en viewport móvil y escritorio simulado.

## Checklist datos ficticios

- [x] Ningún nombre real de jugador, staff o club.
- [x] Ninguna foto real ni de terceros — avatares CSS, mismo criterio que el resto de prototipos.
- [x] Ninguna fecha/pista/reserva que corresponda a datos reales del sistema de reservas.

## Checklist de no copia Playtomic/Vola

- [x] Ningún nombre de sección, icono o layout reproduce lo observado en `AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md`.
- [x] Sin uso de las palabras "Playtomic"/"Vola" en el prototipo.
- [x] Componentes y paleta reutilizados de la marca propia de Club Pádel 04, ya validada en PR #18/#19.

## Checklist antes de integrar con App.jsx

- [ ] Decidir `Report.target_type` para partidos abiertos (sección 21 del documento funcional) antes de implementar reportar partido.
- [ ] Validar `related_booking_id` contra el sistema de reservas real en integración futura — no resuelto en este diseño.
- [ ] Tests específicos de la regla de bloqueo con doble barrera antes de cualquier implementación real.
- [ ] Autorización explícita del usuario para tocar `App.jsx` (Prompt N) — no concedida en este prompt.
- [ ] Definir operativamente los límites antiabuso (nº de partidos/invitaciones simultáneas) antes de producción — dejados como parámetro, no como cifra fija en este documento.
