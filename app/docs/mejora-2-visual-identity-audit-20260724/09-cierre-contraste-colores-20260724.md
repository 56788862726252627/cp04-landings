# 09 — Cierre definitivo: contraste, colores y recursos visuales

Continuación directa de la Mejora 2. Resuelve los 3 pendientes que el
documento 04 había dejado explícitamente aplazados (puntos 3, 4 y 5),
en la misma rama `feature/visual-identity-audit-20260724`, con una
rama de cierre apilada encima para el commit final.

## 1. Contraste Perfil / selector de idioma (antes: aplazado, punto 3 de doc. 04)

### Hallazgo clave que no se conocía al escribir doc. 04

`src/App.css` (584 líneas, con múltiples bloques "AUDITORIA 29") **no
está importado por ningún archivo** — se comprobó con `grep -rn
"App.css" src/ .` sin resultados en ningún `.jsx`/`.js`/`.html` del
proyecto. Es código muerto: todas sus reglas, incluida su propia
batalla de contraste, no tienen ningún efecto en lo que se renderiza.
No se ha modificado (no es scaffolding inequívoco, tiene valor
histórico) — ver sección 3 de este documento.

El archivo que **sí** determina el resultado visual real es
`src/torcal-role-background.css` (se importa el último de los 4 CSS
en `src/App.jsx`, y sus selectores `html body .cp04-sidebar
[data-tour="sidebar-perfil"]` tienen especificidad suficiente para
ganar la cascada frente a `cp04-legibility-polish.css`).

Además, la corrección de contraste ya aplicada en la Mejora 2 al JSX
(`e.currentTarget.style.setProperty("color", "#05080d", "important")`
dentro de los manejadores `onPointerDownCapture`/`onMouseDownCapture`)
**solo se aplica durante la pulsación activa del botón**, no en el
estado de reposo del botón activo — el `style={{color: isActive ?
"#05080d" : ...}}` declarativo de React no lleva `!important`, así que
las reglas `!important` de `torcal-role-background.css` seguían
ganando en el estado de reposo. Esta es la causa técnica exacta de que
el problema pareciera "seguir ahí" pese a la corrección ya hecha en
Mejora 2.

### Corrección aplicada

**Archivo**: `src/torcal-role-background.css` únicamente (7 valores).

| Línea (tras el cambio) | Selector | Antes | Después |
|---|---|---|---|
| 320 | `[data-tour="sidebar-perfil"].is-active` (+variantes) | `color: #ffffff` | `color: #05080d` |
| 330 | descendientes `*` del anterior | `color: #ffffff` | `color: #05080d` |
| 343 | refuerzo "ANTI-ROJO PERFIL" (incondicional) | `color: #ffffff` | `color: #05080d` |
| 350 | descendientes `*` del anterior | `color: #ffffff` | `color: #05080d` |
| 380 | refuerzo "Perfil con texto blanco" (base+hover+activo combinados) | `color: #ffffff` | `color: #05080d` |
| 403 | selector de idioma, TODOS los estados (base/hover/focus/activo) | `color: #ffffff` | `color: #05080d` |
| 419 | descendientes `*` del selector de idioma | `color: #ffffff` | `color: #05080d` |

**No se tocó**: ninguna propiedad `background`, `border-color`,
`box-shadow`, `transition: none`, `animation: none`, ninguna clase JS
(`data-cp04-pressing`), ningún manejador de eventos. Se dejó
intencionadamente sin cambiar la línea 302 (`color: #ffffff` en el
`:hover` simple, no activo) porque su fondo es
`rgba(182,255,0,.13)` — una tinta de muy baja opacidad sobre base
oscura, contraste correcto, no es el bug.

### Por qué no se reintroduce el hover rojo

Ningún selector se ha añadido, eliminado ni reordenado. Los 7 cambios
son sustituciones de valor puro dentro de reglas ya existentes que el
propio archivo etiqueta como "ANTI-ROJO" — el mecanismo que impide el
rojo (especificidad alta + `!important` + `transition: none` +
`animation: none`) permanece exactamente igual; solo cambia qué color
de texto se pinta sobre el verde que ya se mostraba.

### Selector de idioma: severidad real más alta de lo estimado en doc. 03

El bloque "AUDITORIA 29 · Refuerzo Torcal: Idioma / Español verde
neón" (ahora líneas ~384-410) no está condicionado a `:hover` — aplica
el fondo verde brillante de forma **permanente** (base+hover+focus+
activo idénticos) y, por especificidad de cascada, gana sobre el
bloque "neutro" anterior del mismo archivo. Es decir: el selector de
idioma mostraba texto blanco sobre verde lima **de forma constante**,
no solo al pasar el cursor — el hallazgo de doc. 03 lo documentaba
como problema de hover; en código es, de hecho, permanente. Corregido
igual que el resto (línea 403/419).

## 2. Verdes y rojos secundarios (antes: aplazado, punto 4 de doc. 04)

En vez de la sustitución masiva descartada en doc. 04, se hizo un
inventario de cada valor con `grep`, se leyó el contexto real de cada
ocurrencia, y solo se tocaron los casos donde el mismo rol semántico
tenía **valores distintos por deriva** (copiar/pegar de sucesivas
"auditorías"), dejando intactas las variantes que representan un rol
genuinamente distinto.

### Verdes

| Valor disperso | Ocurrencias | Rol real | Acción |
|---|---|---|---|
| `#a8ff00` (`index.css`) | 1 | Duplicado por deriva de `T.accent` | → `#b6ff00` |
| `#baff00` (`torcal-role-background.css`) | 1 | Idem | → `#b6ff00` |
| `#b7ff22` (`cp04-legibility-polish.css`) | 2 | Idem (texto sobre fondo oscuro) | → `#b6ff00` |
| `#c8ff4d` (`cp04-legibility-polish.css`) | 1 | Idem, además en conflicto de cascada con el anterior sobre el mismo selector `code` | → `#b6ff00` |
| `#b7ff00` (`cp04-legibility-polish.css`, 2 de 3 ocurrencias) | 2 | Duplicado del estado activo del sidebar genérico | → `#b6ff00` (la 3ª ocurrencia, en el botón CTA "Reservar pista"/"Ir a reservas", es un degradado de 3 paradas deliberado y distinto — **no se tocó**) |
| `#2ee59d` / `#26eba6` (`cp04-legibility-polish.css`, uso en estado activo genérico del sidebar) | 4 | Parada final del degradado de marca, duplicada con deriva frente a `#2df5a3` (ya el valor dominante, 9 usos en `App.jsx` + ahora también en `torcal-role-background.css`) | → `#2df5a3` (la ocurrencia de `#26eba6` dentro del degradado de 3 paradas del CTA — **no se tocó**, igual que arriba) |
| `#31e89f` (`tournament-module.css`, 9 usos + `App.jsx`, 1 uso) | 10 | Misma parada final de degradado, mismo caso | → `#2df5a3` |
| `#20e3b2` (`App.jsx`, 2 usos) | 2 | Valor idéntico a `T.accent2`, sin pasar por el token | → referencia `T.accent2` |
| `#d8ff4d` / `#9eff00` (`cp04-legibility-polish.css`, botón "Siguiente" del tutorial guiado) | 4 | Degradado de 3 paradas deliberado y distinto | **No se tocó** — variante decorativa intencional, ya usa `color:#071000` correcto |

### Rojos

| Valor disperso | Ocurrencias | Rol real | Acción |
|---|---|---|---|
| `#ff8b8b` (`App.jsx`) | 6 | Texto de mensaje de error (login/registro/rol/torneos) — ya consistente internamente | → nuevo token `T.dangerText`, mismo valor |
| `#ff6b6b` (`App.jsx`) | 3 | Borde de campo en estado de error | → nuevo token `T.dangerBorder`, mismo valor |
| `#ff5050` (`App.jsx`) | 1 | Mismo rol que el anterior, con deriva | → `T.dangerBorder` (unifica con el valor mayoritario) |
| `#4ade80` / `#f87171` (`App.jsx`) | 4 + 3 | Par victorias/derrotas y flechas de tendencia en Ranking — consistente internamente, rol claramente distinto de `T.danger`/`T.accent2` | → nuevos tokens `T.trendUp` / `T.trendDown`, mismos valores |
| `#34d399` (`App.jsx`) | 2 | Acento de `MetricCard` en tarjetas de ingresos/backups — rol distinto de los anteriores | → nuevo token `T.metricPositive`, mismo valor |
| `#ff5e3a` (`App.jsx`, campo `dot` de `FlowStatusBadge`) | 1 (+2 análogas: `#b6ff00`, `#ffad47`) | Duplicado literal de `T.danger` (y de `T.accent`/`T.warning` en la misma tabla) ya usado como `col` en la línea de al lado | → referencian `T.danger`/`T.accent`/`T.warning` respectivamente |

**Todas** estas sustituciones son de **valor idéntico** (mismo hex,
solo se centraliza en un token) o de **unificación de un duplicado por
deriva hacia el valor ya mayoritario** — cero cambios de apariencia
salvo los 3 casos de deriva real (`#ff5050`→`#ff6b6b`,
`#b7ff00`→`#b6ff00`, `#2ee59d`/`#26eba6`→`#2df5a3`), donde la
diferencia perceptual entre el valor viejo y el nuevo es de 1-2 pasos
de canal RGB — imperceptible a simple vista.

**`src/theme.js`** ganó 5 tokens nuevos, puramente aditivos (ningún
token existente se modificó): `dangerText`, `dangerBorder`, `trendUp`,
`trendDown`, `metricPositive`.

## 3. Duplicados y huérfanos (antes: aplazado, punto 5 de doc. 04)

Reclasificación completa en 8 categorías. Solo se elimina lo que
cumple las 5 condiciones exigidas (scaffolding inequívoco + cero
referencias + cubierto por Git + build/tests/docs intactos + decisión
totalmente segura).

| Recurso | Categoría | Decisión |
|---|---|---|
| `src/assets/vite.svg` | Huérfano confirmado (scaffolding de plantilla Vite) | **Eliminado** — 0 referencias (`grep` en todo el repo), cubierto por Git, build (`vite build`) y tests (1302/1302) verificados sin cambios tras borrarlo |
| `src/assets/react.svg` | Huérfano confirmado (scaffolding de plantilla React) | **Eliminado** — mismas verificaciones que el anterior |
| `src/assets/hero.png` | Requiere decisión humana | **Conservado** — no es scaffolding identificable (foto real, origen desconocido), doc. 02 ya señalaba esta duda; no cumple la condición de "scaffolding inequívoco" |
| `src/App.css` | Huérfano confirmado (nuevo, no detectado en Mejora 2) | **Conservado** — 0 imports en todo el proyecto, pero contiene historial real de correcciones (no es scaffolding); se documenta aquí, decisión de eliminarlo queda para una mejora futura dedicada a limpieza de CSS muerto |
| `public/gallery/cp04/candidatas/` (24 archivos, 96 MB) | Potencialmente útil / requiere decisión humana | **No tocado** — solo inventariado (igual que en doc. 02), instrucción explícita de no tocar salvo inventariar |
| `public/gallery/cp04/{cafeteria,instalaciones,pistas,recepcion,torneos}.jpg` + `collage_club_padel_04.png` (duplicado exacto MD5) | Duplicado exacto | **No tocado** — ya identificado en doc. 02, requiere confirmar antes si `ClubGallery.jsx`/`visualAssets.js` (código muerto) se descartan primero |
| `public/icons.svg` | Requiere decisión humana | **No tocado** — sin cambios respecto a doc. 02 |
| `src/data/visualAssets.js` + `src/components/ClubGallery.jsx` | Código muerto, requiere decisión humana | **No tocado** — sin cambios respecto a doc. 02 |
| `public/gallery/cp04/galeria_completa_club_padel_04.png` + `.webp` | Seguro para archivar | **No tocado** — sin cambios respecto a doc. 02 |

## 4. Validación técnica

- `npm test`: 1302/1302 tests, 0 fallos (antes y después de cada tanda de cambios).
- `npm run lint`: 4 errores + 1 warning preexistentes, en archivos y líneas no tocados por este cierre (`App.jsx:6129`, `App.jsx:7846`, `AuthContext.jsx:113`, `DemoSafeNotice.jsx:61`, `useTutorialOrchestrator.js:50`) — 0 errores nuevos.
- `npm run build`: correcto, mismo output (`dist/assets/index-CC7fqK8G.css`, `index-C7khc5jv.js`, mismo tamaño) antes y después de eliminar `vite.svg`/`react.svg`.
- `localhost:5175` (Terminal 1): sigue respondiendo `200` tras cada tanda de cambios (hot-reload de Vite, sin reinicio manual).
- `git status`/`git diff`: alcance confirmado — 6 archivos de código (`App.jsx`, `theme.js`, `torcal-role-background.css`, `cp04-legibility-polish.css`, `tournament-module.css`, `index.css`) + 2 archivos eliminados (`vite.svg`, `react.svg`) + esta documentación. Ningún archivo fuera de `/root/cp04-t-vite-watcher-fix`.

## 5. Validación humana pendiente (no declarada como confirmada)

- Confirmación visual en **tablet** (el dispositivo real del usuario) de que "Perfil" y el selector de idioma ahora muestran texto oscuro legible sobre el fondo verde/menta, en los 4 roles (PLAYER/STAFF/ADMIN/SUPPORT) — no verificable desde este entorno sin navegador.
- Confirmación de que el hover no ha vuelto a ponerse rojo en ningún punto — el análisis de código confirma que ningún mecanismo "anti-rojo" se ha tocado, pero solo una prueba visual real lo confirma al 100%.
- **iOS**: no se declara validado físicamente, igual que en Mejora 2 (doc. 07/08) — sin cambios respecto a esa restricción.
