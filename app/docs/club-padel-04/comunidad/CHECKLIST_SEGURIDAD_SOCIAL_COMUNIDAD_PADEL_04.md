# Checklist de seguridad social — Comunidad Pádel 04

**Estado:** checklist de cierre del Prompt E. Aplicado al diseño de moderación/reportes/roles y al prototipo `moderacion-reportes.html`.
**Fecha:** 2026-07-14

---

## Checklist de privacidad

- [x] El reportante nunca es visible para el reportado, en ningún flujo (verificado en los 12 flujos de `FLUJOS_UI_MODERACION_REPORTES...md`).
- [x] `ModerationAction.notes` (deliberación interna) nunca visible fuera de STAFF/ADMIN/SUPPORT.
- [x] El bloqueo no notifica a la parte bloqueada.
- [x] El aviso de sanción al usuario nunca incluye detalles que permitan deducir al reportante.

## Checklist RGPD

- [x] Base jurídica declarada para cada acción (interés legítimo, mayoritariamente) en la matriz de acciones.
- [x] Retención diferenciada por tipo de dato (24 meses mínimo para reportes/sanciones, coherente con `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`).
- [x] 12 de 17 acciones marcadas explícitamente como pendientes de revisión legal, sin afirmar cumplimiento al 100%.
- [x] Vía de reclamación (solicitar revisión) para toda sanción — ningún efecto sin posibilidad de cuestionarlo.

## Checklist de moderación

- [x] Ninguna acción de moderación (advertencia, retirar contenido, suspender, banear) ejecutable sin un rol STAFF/ADMIN/SUPPORT humano.
- [x] Escalera de severidad clara (dismissed → warning → content_removed → suspended → banned), sin saltar directamente a la sanción máxima.
- [x] STAFF no puede banear ni suspender de forma permanente — reservado a ADMIN.
- [x] Toda `ModerationAction` es inmutable; una reversión crea un registro nuevo, no edita el anterior.

## Checklist antiabuso

- [x] Reportar y bloquear disponibles sin gate de consentimiento, para no dejar indefensa a una víctima real por no haber activado un toggle.
- [x] Reconocimiento explícito del riesgo de reportes de mala fe/reiterados (sección 16 del documento de moderación), con mitigación que no penaliza automáticamente al reportante (evita silenciar víctimas reales por error).
- [x] "Ocultar" (autoservicio) diferenciado visualmente de "Reportar" (moderación) para no confundir ambas acciones.

## Checklist de roles

- [x] Los 4 roles reales (`PLAYER`, `STAFF`, `ADMIN`, `SUPPORT`) cubiertos con permisos específicos de moderación — ningún rol nuevo inventado.
- [x] `SUPPORT` limitado a intervención excepcional (3 casos definidos), no como vía operativa diaria.
- [x] Permisos de moderación coherentes con `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` — sin contradicciones entre documentos.

## Checklist de logs

- [x] Las 17 acciones de la matriz llevan `AuditLog` requerido = "Sí", salvo "Ocultar publicación" (que deliberadamente no genera log, al no ser una acción de seguridad).
- [x] `AuditLog` inmutable, sin permiso de edición ni borrado dentro del plazo de retención (heredado del modelo de datos).

## Checklist de accesibilidad

- [x] El prototipo `moderacion-reportes.html` reutiliza los componentes ya validados en `UX_UI_COMPONENTES_COMUNIDAD_PADEL_04.md` (contraste AA, `aria-label` en botones de icono, foco visible).
- [x] Estados de reporte (pendiente/en revisión/resuelto/rechazado) comunicados con texto + color, nunca solo color.
- [x] Tablas/paneles de STAFF y ADMIN navegables por teclado (estructura semántica `table`/`section`, sin `div` puro para contenido tabular).

## Checklist de datos ficticios

- [x] Ningún nombre real de jugador, staff o club en el prototipo HTML.
- [x] Ninguna foto real ni de terceros — avatares con iniciales vía CSS, igual criterio que `feed-social.html`/`perfil-jugador.html`.
- [x] Ningún dato de contacto real (email/teléfono).

## Checklist de no copia Playtomic/Vola

- [x] Ningún nombre de sección, icono o layout reproduce lo observado en `AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md`.
- [x] Sin uso de las palabras "Playtomic"/"Vola" en el prototipo.
- [x] Paleta y componentes reutilizados de la marca propia de Club Pádel 04, ya validada en PR #18.

## Checklist antes de integrar con App.jsx

- [ ] Validación legal de los 12 puntos marcados "revisión legal: sí" en la matriz de acciones.
- [ ] Definición operativa del SLA de revisión de reportes por club (no fijado en este prompt).
- [ ] Confirmar el mecanismo de apelación (`Report` sobre una `ModerationAction`) con producto antes de construir la UI real de "solicitar revisión".
- [ ] Autorización explícita del usuario para tocar `App.jsx` (Prompt N) — no concedida en este prompt.
- [ ] Tests de que el bloqueo impide de forma efectiva todas las interacciones listadas (partidos, comentarios, retos, grupos) antes de producción — no solo el feed.
