# 11 — Corrección final Mejora 2.1: color de texto de "Perfil y ajustes" (4 roles)

Continuación de la Mejora 2.1 (PR #54). El retargeting de
`:last-child` eliminó el borde/fondo rojizo, pero la validación visual
humana detectó que el texto de "Perfil y ajustes" seguía sin coincidir
exactamente con el resto de módulos del sidebar.

## Causa raíz exacta

`src/cp04-legibility-polish.css`, bloque "Perfil y ajustes: quitar
rojo/burdeos permanente" (antes líneas 834-847), selector:

```css
body.cp04-module-screen-active .cp04-sidebar button[aria-label*="Perfil"],
body.cp04-role-screen-active .cp04-sidebar button[aria-label*="Perfil"],
body.cp04-module-screen-active .cp04-sidebar button[title*="Perfil"],
body.cp04-role-screen-active .cp04-sidebar button[title*="Perfil"] {
  color: rgba(255,255,255,.86) !important;
  ...
}
```

Este selector **no es huérfano**: el botón real de "Perfil y ajustes"
tiene `aria-label="Perfil y ajustes"` (línea `aria-label={`${label}`}`
del componente `Sidebar` en `App.jsx`, con `label = tx("nav.perfil")`
= "Perfil y ajustes" en los 4 roles), así que `[aria-label*="Perfil"]`
coincide de verdad.

El problema de especificidad:

| Regla | Selector | Especificidad | Aplica en |
|---|---|---|---|
| Genérica (normal) | `body.cp04-module-screen-active .cp04-sidebar button` | (0,2,2) | Todos los módulos |
| Genérica (hover) | `body.cp04-module-screen-active .cp04-sidebar button:hover` | (0,3,2) | Todos los módulos |
| Perfil (sin pseudoclase, aplica siempre) | `body.cp04-module-screen-active .cp04-sidebar button[aria-label*="Perfil"]` | (0,3,2) | Solo Perfil, **en cualquier estado** |

La regla de Perfil empata en especificidad con la regla de `:hover`
genérica, y al aparecer **más tarde** en el archivo, gana el
desempate — tanto en estado normal como en hover. Resultado: Perfil
usaba `rgba(255,255,255,.86)` (blanco puro al 86%) en vez de
`rgba(245,250,255,.92)` (normal, línea 508) o `#ffffff` puro (hover,
línea 525) que usa el resto de módulos — una diferencia perceptible
tanto de tono (255,255,255 vs 245,250,255) como de opacidad (.86 vs
.92 vs 1).

**Por qué no afecta al estado activo/seleccionado**: el texto visible
está dentro de un `<span>`, y cuando Perfil es el módulo activo, el
color del `<span>` lo fija una regla distinta y más específica
(`[aria-current="page"] *`, sin competencia de ninguna regla
`[aria-label*="Perfil"] *` — esa variante no existe), que ya usaba
`#061006` correctamente. Confirmado por código que el estado activo
no estaba afectado por este bug.

## Corrección aplicada

**Archivo**: `src/cp04-legibility-polish.css` (1 propiedad eliminada, 0 propiedades añadidas).

Se eliminó únicamente la línea `color: rgba(255,255,255,.86) !important;`
del bloque `[aria-label*="Perfil"]`/`[title*="Perfil"]`. `background`,
`border-color` y `box-shadow` de ese mismo bloque se dejaron
intactos (fuera del alcance solicitado: "corrige exclusivamente el
color tipográfico").

Al no declarar `color` ahí, Perfil cae automáticamente en la misma
regla genérica que usan Inicio/Reservas/Comunidad/Centro
técnico/Soporte — mismo token, sin duplicar ningún valor hex nuevo,
igual en los 4 roles (el selector no depende de rol).

## Auditoría de los 4 roles (Fase 2)

- `src/utils/rbac.js`: "perfil" está presente y es el **último**
  elemento de la lista de permisos en los 4 roles (`PLAYER`, `STAFF`,
  `ADMIN`, `SUPPORT`) — el bug (y su corrección) es idéntico en los 4,
  no depende del número de módulos visibles por rol.
- Sin `:nth-child`, `:first-child`, `:last-of-type` ni `:nth-of-type`
  adicionales afectando `.cp04-sidebar` (verificado con `grep` en
  todos los `.css` — los únicos usos de esos pseudo-selectores están
  en tablas de ranking y el tutorial guiado, sin relación).
- Sin clases heredadas ni selectores estructurales adicionales que
  distingan a Perfil de otros módulos, aparte del ya corregido en
  esta misma corrección.

## Validación

- `npm test`: 1302/1302, 0 fallos.
- `npm run lint`: mismos 4 errores + 1 warning preexistentes, 0 nuevos.
- `npm run build`: correcto.
- `localhost:5175`: 200.
- `git diff --stat`: 1 archivo, 8 inserciones/2 eliminaciones (incluye comentario explicativo).
- Botón "Cerrar sesión" (`cp04-sidebar-logout-btn`, PR #54): no tocado en esta corrección.
- Selector de idioma: no tocado en esta corrección.
