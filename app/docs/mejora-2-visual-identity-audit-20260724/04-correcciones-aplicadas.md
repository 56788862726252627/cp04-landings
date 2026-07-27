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

## Aplazadas (documentadas, NO aplicadas en esta mejora)

### 3. Mismo bug de contraste en el botón "Perfil" y el selector de idioma (`torcal-role-background.css`)

**Por qué no se corrige ahora**: protegido por 4-5 capas de reglas `!important` superpuestas de una auditoría histórica ("AUDITORIA 29 · FIX FINAL HOVER PERFIL NO ROJO") que ya resolvió un bug de "hover rojo" en este mismo elemento. Modificar estas reglas sin un plan de pruebas dedicado (idealmente con validación visual real, no solo lectura de código) tiene riesgo real de reintroducir ese bug ya corregido. Ver doc. 03 para el detalle técnico completo.

**Recomendación para la mejora futura dedicada**: aislar visualmente el botón "Perfil" en un entorno de prueba, revisar las 5 capas de reglas una por una, y cambiar `color: #ffffff` a `color: #05080d` solo en las reglas que coinciden con el fondo degradado lima/menta — validando en cada paso que el hover no vuelve a ponerse rojo.

### 4. Verdes y rojos inconsistentes (5 tonos de cada uno en `App.jsx`)

**Por qué no se corrige ahora**: normalizarlos a los tokens únicos de `theme.js` (`T.accent2` para verde, `T.danger` para rojo) implicaría tocar docenas de puntos dispersos en un archivo de 8499 líneas — calificado explícitamente como "sustitución masiva de colores" y "refactor grande", fuera del alcance permitido en esta mejora.

**Recomendación**: una mejora futura dedicada a "normalización de paleta", con una pasada sistemática archivo por archivo, revisando visualmente cada cambio antes de aplicarlo.

### 5. Duplicados y recursos huérfanos (96 MB en `candidatas/`, 6 archivos de galería duplicados, componente `ClubGallery.jsx` no usado)

**Por qué no se corrige ahora**: la regla de seguridad explícita de esta mejora prohíbe "eliminación masiva de activos" y "movimiento masivo de archivos" sin aprobación humana previa. Ver doc. 02 para las tablas completas de qué archivar/conservar/revisar.

### 6. Estilos inline repetidos (el mismo bloque de estilo 9 veces en el componente de barra lateral)

**Por qué no se corrige ahora**: consolidar esto en una función compartida o una clase CSS es un refactor de estructura de código, no una corrección de contraste puntual — fuera de alcance de "correcciones locales/reversibles" de esta mejora, aunque de bajo riesgo funcional.

### 7. Tipografía de marca no cargada (Syne/DM Sans)

**Por qué no se corrige ahora**: es una decisión de producto ya tomada deliberadamente en una fase anterior (evitar llamadas externas), no un bug. Cambiarla (autoalojando los `.woff2`) es una mejora válida pero requiere decidir primero si se auto-alojan los archivos de fuente (añadiría peso al bundle) — decisión pendiente de aprobación humana, no una corrección "evidente y seguro".
