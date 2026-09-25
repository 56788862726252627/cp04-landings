# Prototipos visuales — Comunidad Pádel 04 (Feed + Perfil)

**Estado:** prototipos HTML/CSS estáticos, aislados. **No integrados en `App.jsx`. No conectados a ningún backend real (Supabase, worker, Make, Airtable). No usan datos personales reales.**

Ejecutan los **Prompts B y C** del catálogo de Comunidad Pádel 04 (`app/docs/club-padel-04/comunidad/PROMPTS_IMPLEMENTACION_COMUNIDAD_PADEL_04.md`).

## Archivos

- `feed-social.html` — prototipo del feed social (Prompt B).
- `perfil-jugador.html` — prototipo del perfil de jugador (Prompt C).
- `community-prototypes.css` — hoja de estilos compartida, basada en la identidad de marca ya existente de Club Pádel 04 (`app/projects/club-padel-04/landing/figma/BRAND_SYSTEM_CLUB_PADEL_04.md`).

## Cómo verlos

Son archivos HTML estáticos sin dependencias. Basta con abrirlos directamente en un navegador:

```
open app/projects/club-padel-04/community-prototypes/feed-social.html
open app/projects/club-padel-04/community-prototypes/perfil-jugador.html
```

No requieren `npm install`, no requieren servidor de desarrollo, no requieren build. No se ha tocado `package.json` para crearlos.

## Qué muestran

Cada HTML incluye, en una sola página de referencia:
- El estado "feliz" completo (con contenido, con consentimiento activo).
- Estados alternativos relevantes (sin consentimiento social, contenido vacío, perfil privado, perfil bloqueado, contenido retirado por moderación) mostrados como secciones adicionales en la misma página, claramente rotuladas — no son pantallas navegables entre sí (no hay JavaScript ni enrutamiento), son referencia visual de cada estado.
- Mocks estáticos de modales (reporte, menú de acciones) — no ejecutan ninguna acción real al pulsarlos.

## Qué NO hacen (deliberadamente)

- No importan librerías externas (sin CDN, sin frameworks, sin fuentes externas).
- No usan imágenes externas ni locales — los avatares son iniciales generadas con CSS.
- No usan JavaScript — cero `<script>` en ambos archivos, por diseño, para eliminar cualquier riesgo de conexión a red, `localStorage` o comportamiento dinámico no revisado.
- No usan datos reales — todos los nombres, clubes y cifras son ficticios ("Jugador Demo 1", "Club Pádel 04 (demo)").
- No copian diseño, textos, marca ni código de Playtomic/Vola — ver `AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md` y `UX_UI_COMPONENTES_COMUNIDAD_PADEL_04.md` (ambos en `app/docs/club-padel-04/comunidad/`) para el criterio de originalidad aplicado.

## Documentación relacionada

Toda la especificación funcional, de datos, de privacidad y de checklist vive en `app/docs/club-padel-04/comunidad/`:
- `PROTOTIPO_FEED_SOCIAL_COMUNIDAD_PADEL_04.md`
- `PROTOTIPO_PERFIL_JUGADOR_COMUNIDAD_PADEL_04.md`
- `UX_UI_COMPONENTES_COMUNIDAD_PADEL_04.md`
- `CHECKLIST_PROTOTIPOS_FEED_PERFIL_COMUNIDAD_PADEL_04.md`

## Siguiente paso

Ninguna integración con `App.jsx` ni con datos reales debe hacerse a partir de estos archivos sin autorización explícita (Prompt N del catálogo). El siguiente paso recomendado del catálogo tras estos prototipos es continuar con los módulos de fase MVP restantes (Prompt D — Partidos abiertos, Prompt E — Moderación) antes de considerar cualquier integración.
