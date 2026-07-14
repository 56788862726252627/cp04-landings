# Checklist de validación — Prototipos Feed y Perfil (Comunidad Pádel 04)

**Estado:** checklist de cierre de los Prompts B/C. Aplicado a `feed-social.html` y `perfil-jugador.html` en `app/projects/club-padel-04/community-prototypes/`.
**Fecha:** 2026-07-14

---

## Checklist visual

- [x] Usa exclusivamente los tokens de marca ya existentes (`#05080d`, `#b6ff00`, `#20e3b2`, etc.), sin colores nuevos inventados.
- [x] Sin gradientes ni acentos de color ajenos a la marca (un único gradiente de marca, verde lima → teal).
- [x] Sin fondos blancos ni pastel (coherente con la regla de marca "no usar fondos blancos").
- [x] Iconografía simple, un color de acento por icono, sin emoji multicolor.
- [x] Componentes consistentes entre feed y perfil (misma tarjeta, mismos chips, mismo menú de acciones).

## Checklist RGPD

- [x] Ningún consentimiento aparece premarcado en los mocks de modal.
- [x] Estado "sin consentimiento" (`social_layer_opt_in=false`) representado explícitamente en ambos prototipos, no omitido.
- [x] Banner de privacidad presente y no bloqueante.
- [x] Botón "Reportar" y "Bloquear" disponibles sin gate de consentimiento (coherente con `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, secciones 13-14 de los flujos).
- [x] Ranking/estadísticas etiquetadas "no oficial"/"autodeclarado" donde corresponde.
- [x] Ningún dato de contacto real (email/teléfono) mostrado en ningún mock.

## Checklist accesibilidad

- [x] Contraste de texto sobre fondo oscuro conforme a AA (blanco/`textDim` sobre `bg`/`surface`).
- [x] Botones e iconos interactivos con `aria-label` cuando no llevan texto visible.
- [x] Foco visible al navegar con teclado (`outline` en `accent` sobre elementos interactivos).
- [x] Jerarquía semántica de encabezados (`h1`-`h3`) coherente en ambos HTML.
- [x] Ningún estado comunicado solo por color (siempre texto o icono adicional).

## Checklist responsive

- [x] Layout de una columna por debajo de 640px en ambos prototipos.
- [x] Filtros del feed con scroll horizontal propio en móvil, sin depender de un menú oculto.
- [x] Tipografía y espaciados reducidos en viewport estrecho.
- [x] Probado visualmente en ancho de viewport simulado móvil y escritorio (manual, sin herramienta de test automatizada en este prompt).

## Checklist moderación

- [x] Toda tarjeta de post y todo perfil tiene acceso a "Reportar".
- [x] Ninguna acción de moderación se muestra como automática/por IA — el mock solo simula "reporte enviado", nunca "contenido retirado automáticamente".
- [x] Estado "contenido retirado por moderación" representado como posibilidad en el feed (mock estático, no interactivo).

## Checklist de datos ficticios

- [x] Ningún nombre real de jugador, staff o club — nombres genéricos tipo "Jugador Demo 1", "Club Pádel 04 (demo)".
- [x] Ninguna foto real ni de terceros — avatares con iniciales generadas por CSS, sin imágenes externas ni locales de stock.
- [x] Ninguna fecha, ubicación o dato que pueda vincularse a una persona o club real.
- [x] Ningún dato copiado de las capturas de Playtomic/Vola auditadas previamente.

## Checklist de no copia Playtomic/Vola

- [x] Ningún nombre de sección, icono o layout reproduce exactamente lo observado en `AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md`.
- [x] Sin uso de las palabras "Playtomic"/"Vola" en ningún texto visible del prototipo.
- [x] Paleta y tipografía 100% de Club Pádel 04, no inspiradas en captura alguna.
- [x] Estructura de componentes derivada del sistema de marca propio (`UX_UI_COMPONENTES_COMUNIDAD_PADEL_04.md`), no de un layout externo.

## Checklist antes de implementar en App.jsx

- [ ] Validación legal de los textos de consentimiento (pendiente, ya señalado en `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`).
- [ ] Decisión de negocio sobre menores de edad (riesgo abierto, sin resolver).
- [ ] Modelo de datos (`MODELO_DATOS_SOCIAL...md`) confirmado como estable antes de generar componentes React reales a partir de este HTML.
- [ ] Autorización explícita del usuario para tocar `App.jsx` (Prompt N) — no concedida en este prompt.
- [ ] Revisión de accesibilidad con herramienta automatizada (axe o equivalente) antes de producción, no solo revisión manual.
- [ ] Confirmar que ningún dato mock de este prototipo se reutiliza literalmente como dato de seed/demo en producción sin revisión.
