# 04 — Correcciones aplicadas y aplazadas

## Aplicadas en esta mejora

### 1. Corrección de contraste — texto ilegible en el ítem activo de la barra lateral

**Archivo**: `src/App.jsx` (9 ubicaciones dentro del mismo componente de barra lateral).

**Antes**: `color: "#ffffff"` sobre `background: "linear-gradient(135deg, #b6ff00 0%, #2df5a3 100%)"` — contraste WCAG 1.21-1.43 (mínimo exigido: 4.5).

**Después**: `color: "#05080d"` (el propio color de fondo de la app, `T.bg`) en las mismas 9 ubicaciones, sobre el mismo degradado — contraste WCAG 14.04-16.52.

**Alcance del cambio**: únicamente el valor del `color` en los estados donde el elemento está activo/en la variante que usa el degradado lima/menta. Las ramas donde el fondo es oscuro (`T.textDim`, `rgba(7,11,20,.72)`, `rgba(182,255,0,.13)`) se dejaron intactas — solo se tocó el caso con contraste matemáticamente insuficiente.

**Riesgo**: nulo. Es un cambio de valor de color puro, sin tocar ningún manejador de eventos, temporización, `dataset`, ni lógica de navegación (`onClick={() => onNavigate(id)}` no se ha tocado).

**Validado**: `npm test` (1302/1302), `npm run lint` (sin errores nuevos), `npm run build` (correcto), `localhost:5175` sigue respondiendo tras el hot-reload de Vite.

### 2. Optimización de fondos internos — WebP conectado (nunca se usaba)

**Archivos**: `src/torcal-role-background.css` (3 bloques), `src/internal-module-backgrounds.css` (1 bloque + 3 variables).

**Antes**: los 4 fondos internos (`torcal-padel-bg`, `admin-technical-bg`, `user-reservas-bg`, `general-modules-bg`) se servían directamente en PNG (1.6-2.3 MB cada uno), pese a que sus versiones WebP (52-201 KB, 92-97% menos peso) ya existían generadas en `public/optimized/images/` desde el Paso 20 — simplemente nunca se conectaron.

**Después**: se añadió una segunda declaración `background-image` con `image-set()` (WebP con tipo `image/webp`, PNG con tipo `image/png` como fallback) inmediatamente después de cada declaración PNG existente — **sin tocar ni eliminar la declaración PNG original**. Mismo patrón exacto ya usado y probado en `projects/club-padel-04/landing/src/styles.css` (documentado en su propio README como solución ya validada).

**Por qué es seguro**: los navegadores que no reconocen la función `image-set()` descartan esa declaración entera al analizar la hoja de estilos (no la interpretan parcialmente), dejando vigente la declaración PNG anterior — nunca se rompe el fondo, en el peor caso simplemente no se aprovecha el ahorro de peso.

**Riesgo**: nulo — no se modificó ningún archivo de imagen original, no se tocó `role-background-detector.js` (su fondo inline queda sobreescrito de todos modos por las reglas `!important` de estas hojas de estilo, así que no hacía falta tocarlo).

**Validado**: mismas comprobaciones que el punto 1.

## Resueltas en el cierre definitivo (2026-07-24, ver doc. 09)

### 3. Mismo bug de contraste en el botón "Perfil" y el selector de idioma (`torcal-role-background.css`)

**Estado: corregido.** Ver doc. 09 para el detalle completo — incluye el hallazgo de que `src/App.css` (donde se había leído originalmente este bloque) no está importado por ningún archivo, y que el archivo que realmente gana la cascada es `torcal-role-background.css`. 7 valores `color: #ffffff` cambiados a `color: #05080d`, sin tocar ninguna otra propiedad ni selector.

### 4. Verdes y rojos inconsistentes (5 tonos de cada uno en `App.jsx`)

**Estado: normalizado de forma selectiva.** Ver doc. 09 — no fue sustitución masiva ciega: cada ocurrencia se revisó en contexto, se unificaron solo los duplicados por deriva (mismo rol, valores ligeramente distintos) y se conservaron como variantes intencionales los degradados decorativos distintos (CTA "Reservar pista", botón "Siguiente" del tutorial). 5 tokens nuevos y puramente aditivos en `theme.js`.

### 5. Duplicados y recursos huérfanos (96 MB en `candidatas/`, 6 archivos de galería duplicados, componente `ClubGallery.jsx` no usado)

**Estado: reclasificado, sin eliminación masiva.** Ver doc. 09 — solo se eliminaron `src/assets/vite.svg` y `src/assets/react.svg` (scaffolding de plantilla sin ninguna referencia, verificado con build/tests antes y después). El resto (candidatas/, duplicados de galería, `ClubGallery.jsx`, `icons.svg`) permanece exactamente igual que en doc. 02, sin tocar, tal como exige la regla de seguridad de esta tarea.

### 6. Estilos inline repetidos (el mismo bloque de estilo 9 veces en el componente de barra lateral)

**Por qué no se corrige ahora**: consolidar esto en una función compartida o una clase CSS es un refactor de estructura de código, no una corrección de contraste puntual — fuera de alcance de "correcciones locales/reversibles" de esta mejora, aunque de bajo riesgo funcional.

### 7. Tipografía de marca no cargada (Syne/DM Sans)

**Por qué no se corrige ahora**: es una decisión de producto ya tomada deliberadamente en una fase anterior (evitar llamadas externas), no un bug. Cambiarla (autoalojando los `.woff2`) es una mejora válida pero requiere decidir primero si se auto-alojan los archivos de fuente (añadiría peso al bundle) — decisión pendiente de aprobación humana, no una corrección "evidente y seguro".
