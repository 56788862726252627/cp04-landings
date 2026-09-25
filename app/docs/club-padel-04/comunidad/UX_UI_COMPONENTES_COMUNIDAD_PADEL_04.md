# Sistema UX/UI de componentes — Comunidad Pádel 04

**Estado:** guía de diseño para los prototipos de Feed y Perfil. Sin librerías externas, sin dependencias nuevas, sin tocar `package.json`.
**Fecha:** 2026-07-14
**Aplica a:** `app/projects/club-padel-04/community-prototypes/` (HTML/CSS estáticos).

**Aviso de originalidad:** este sistema reutiliza y extiende la identidad visual **propia** de Club Pádel 04, ya documentada en `app/projects/club-padel-04/landing/figma/BRAND_SYSTEM_CLUB_PADEL_04.md` (fondo casi negro, acento verde lima/teal, sin gradientes ajenos) — no reproduce ningún componente, layout ni paleta de Playtomic/Vola.

---

## 1. Sistema visual recomendado

Reutiliza los tokens de marca ya existentes: `bg #05080d`, `surface #0b111d`, `surface2 #111a2b`, `surface3 #18243a`, `accent #b6ff00` (verde lima, CTA primario), `accent2 #20e3b2` (verde-teal, estados de éxito), `primary #2f6bff` (uso puntual, nunca CTA principal), `text #ffffff`, `textDim #9aa8bd`, `danger #ff5e3a`, `warning #ffad47`. Sin colores nuevos — la capa social usa exactamente la misma paleta que el resto del producto, para que no se perciba como una app aparte.

## 2. Componentes reutilizables

Un set mínimo de 12 componentes cubre feed + perfil sin duplicar código: `Avatar`, `Tarjeta de publicación`, `Chip de filtro`, `Badge de estado`, `Botón (primario/secundario/texto)`, `Tab`, `Banner de privacidad`, `Modal de consentimiento`, `Estado vacío`, `Menú de acciones (⋯)`, `Barra de estadística`, `Aviso inline`.

## 3. Tarjetas

Fondo `surface2`, radio de borde 16px, borde 1px `rgba(255,255,255,0.10)` (sin borde de color, coherente con la marca), sombra sutil oscura. Tres variantes: tarjeta de post (texto/foto), tarjeta de actividad de sistema (partido abierto/evento, con icono en `surface3` + `accent`), tarjeta de perfil resumido (usada en listas de amigos/conexiones).

## 4. Chips

Pill (radio 999px), fondo `surface3`, texto `textDim`; estado activo con fondo `accent`, texto `bg` (oscuro sobre verde claro, igual criterio que el CTA primario de marca). Usados en los filtros del feed (Todo/Club/Amigos/Partidos/Eventos) y en etiquetas de nivel (Iniciación/Intermedio/Avanzado/Profesional).

## 5. Badges

Pequeños, sin relleno saturado — fondo `surface3`, texto `textDim`, con un punto de color `accent2` para "activo"/"disponible", `danger` reservado solo a estados de alerta reales (nunca decorativo, mismo criterio que la marca). Usados para "Ranking no oficial", "Nivel autodeclarado", "Contenido retirado por moderación".

## 6. Estados vacíos

Icono simple en `accent`/`accent2` sobre `surface3` (nunca emoji multicolor, mismo criterio que la marca), texto breve en `textDim`, CTA opcional en `accent`. Un estado vacío nunca es una pantalla en blanco — siempre explica qué está pasando y qué puede hacer el usuario.

## 7. Modales de consentimiento

Modal centrado sobre overlay oscuro semitransparente, fondo `surface`, título en `text`, cuerpo en `textDim`, dos acciones claras (aceptar en `accent`, rechazar/cancelar en texto plano) — nunca una única acción de "aceptar" sin opción de rechazo visible al mismo nivel visual (principio de consentimiento libre, ya establecido en `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`).

## 8. Banners de privacidad

Barra no bloqueante (no modal) en la parte superior del contenido, fondo `surface2`, borde izquierdo 3px `accent2`, icono de escudo/candado en `accent2`, texto breve + enlace "Gestionar privacidad". Cerrable, no vuelve a aparecer hasta que cambie el consentimiento relevante.

## 9. Botones

Primario: fondo sólido/gradiente `accent → accent2`, texto en `bg`, radio grande (pill o 12px), peso de fuente alto — reservado a una única acción por pantalla (crear publicación, activar comunidad). Secundario: borde `line`, fondo transparente, texto `text`. Texto: sin fondo, color `accent` o `textDim` según jerarquía. Destructivo (bloquear, eliminar): borde/texto `danger`, nunca relleno sólido para evitar parecer un CTA positivo.

## 10. Tabs

Usados en el perfil (si se separan secciones) y en cabeceras de contexto — subrayado inferior `accent` en el tab activo, resto en `textDim`, sin fondo de color en los tabs inactivos.

## 11. Filtros

Fila horizontal de chips con scroll propio en móvil (`overflow-x: auto`), nunca un dropdown escondido para los 5 filtros del feed — deben ser accesibles con un solo toque.

## 12. Menú de acciones

Icono "⋯" (kebab), fondo transparente, al pulsar despliega un menú simple (`surface3`, lista vertical) con "Reportar", "Ocultar"/"Bloquear" y, si aplica, "Copiar enlace". El menú de moderación diferenciado (STAFF/ADMIN) no se mezcla visualmente con el menú del usuario normal — es un componente distinto, no el mismo con más opciones.

## 13. Patrones responsive

Mobile-first (el roadmap ya prioriza experiencia móvil): una columna en `<640px` (feed y perfil apilados), dos columnas opcionales en `≥980px` (feed principal + panel lateral de "próximos eventos"/"sugerencias de amigos", no incluido en el MVP visual pero reservado en el layout). Tipografía y padding reducidos por debajo de 640px, coherente con el resto de la app (`predeploy`/`performance` ya auditados en otros módulos).

## 14. Accesibilidad

Contraste mínimo AA sobre el fondo oscuro (ya validado en la marca: `text`/`textDim` sobre `bg`/`surface`); todo botón/chip con `aria-label` cuando el contenido es solo icono; foco visible (outline `accent`) en navegación por teclado; modales con `role="dialog"` y cierre por `Escape`; ningún color como único indicador de estado (siempre acompañado de texto/icono).

## 15. Microcopy

Tono cercano, breve, sin jerga técnica ("Activa tu comunidad", no "Configura tus preferencias de tratamiento de datos"); siempre honesto sobre límites técnicos (p. ej. "No podemos borrar lo que otros ya vieron", coherente con `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md`); nunca dark patterns (el botón de rechazar/cancelar tiene el mismo tamaño y contraste que el de aceptar).

## 16. No copiar UI de terceros

Ningún componente de este sistema reproduce el layout exacto, iconografía propietaria, nombres de sección ni paleta observados en la auditoría de capturas (`AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md`) — se reutilizan solo categorías funcionales (existe un feed, existen chips de filtro), nunca su forma visual exacta. Toda decisión de color/forma de este documento proviene de la marca ya existente de Club Pádel 04, no de una referencia externa.
