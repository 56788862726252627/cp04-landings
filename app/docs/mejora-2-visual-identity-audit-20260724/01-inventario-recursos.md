# 01 — Inventario completo de recursos visuales

Inventario real, generado con `find` + `md5sum` + `PIL` (dimensiones) sobre
`public/` y `src/` en esta sesión — 94 archivos de imagen/icono
catalogados, más tokens de diseño, fuentes y CSS.

## A. Icono de la app y favicon (Mejora 1 — oficial y activo)

| Recurso | Ruta | Dimensiones | Peso | Estado |
|---|---|---|---|---|
| Favicon clásico | `public/favicon.ico` | 16/32/48 (multi-res) | 8.0 KB | Oficial y activo |
| Apple touch icon | `public/apple-touch-icon.png` | 180×180 | 46.9 KB | Oficial y activo (duplicado intencional de `icon-180.png`, ver doc. 02) |
| Iconos PWA | `public/icons/icon-{16,32,48,72,96,128,144,152,180,192,256,384,512}.png` | tamaño = nombre | 836 B – 283.6 KB | Oficiales y activos, dimensiones verificadas correctas para los 13 |
| Favicon histórico (rayo) | `public/favicon.svg` | vector | 9.3 KB | **Histórico, conservado deliberadamente** — usado solo como ping de conectividad en `App.jsx` (`retryConnection`), cero uso visual |

## B. Logotipo fuente oficial

| Recurso | Ruta | Dimensiones | Peso | Estado |
|---|---|---|---|---|
| Logo oficial (fuente) | `docs/paso-app-icon-branding-20260724/source/logo-club-padel-04-oficial.png` | 1536×1536 | 2.13 MB | Oficial — fuente canónica para regenerar iconos, deliberadamente fuera de `public/` (no se sirve en producción) |

## C. Fondos internos por rol/módulo

| Recurso | PNG (servido actualmente) | WebP (generado, sin usar) | Ahorro potencial |
|---|---|---|---|
| Fondo login/rol (Torcal) | `public/images/torcal-padel-bg.png` (2.12 MB) | `public/optimized/images/torcal-padel-bg.webp` (150.3 KB) | 93% — **ver doc. 04, corregido en esta mejora** |
| Fondo módulo admin | `public/images/admin-technical-bg.png` (1.59 MB) | `.../admin-technical-bg.webp` (51.6 KB) | 97% — **corregido** |
| Fondo módulo reservas | `public/images/user-reservas-bg.png` (1.90 MB) | `.../user-reservas-bg.webp` (117.9 KB) | 94% — **corregido** |
| Fondo módulos generales | `public/images/general-modules-bg.png` (2.23 MB) | `.../general-modules-bg.webp` (196.4 KB) | 92% — **corregido** |

Estado previo: los 4 PNG se servían directamente desde 3 archivos (`role-background-detector.js`, `internal-module-backgrounds.css`, `torcal-role-background.css`) — los WebP existían ya generados pero **nunca se usaban**. Ver doc. 04 para la corrección aplicada (mismo patrón `image-set()` ya usado en la landing de `projects/club-padel-04/landing/`).

## D. Galería del club (pistas/recepción/cafetería/torneos/instalaciones)

| Recurso | Ruta | Dimensiones | Peso | Estado |
|---|---|---|---|---|
| Versión servida (real, distinta cada una) | `public/optimized/gallery/cp04/{pistas,recepcion,cafeteria,torneos,instalaciones}.webp` | variable | 15.8–87.8 KB c/u | **Oficial y activo** — referenciado directamente en `App.jsx` líneas 86-110 |
| Versión "original" distinta (fuente) | `public/gallery/cp04/{pistas,recepcion,cafeteria,torneos,instalaciones}.png` | variable, 351-1090px alto | 310-735 KB c/u | Activo indirecto — fuente para regenerar el WebP, no servido directamente |
| **Duplicado exacto sin uso** | `public/gallery/cp04/{cafeteria,instalaciones,pistas,recepcion,torneos}.jpg` + `collage_club_padel_04.png` | 1448×1086 (los 6) | **2.14 MB cada uno, MISMO archivo binario** (MD5 idéntico) | **Duplicado exacto, no referenciado activamente** — ver doc. 02 |
| Collage completo | `public/gallery/cp04/galeria_completa_club_padel_04.png` + `.webp` | — | 735.4 KB / 209.9 KB | No referenciado en código — potencialmente obsoleto |
| Casting de candidatas | `public/gallery/cp04/candidatas/` (23 archivos: 20 `.jpg` a 4128×3096 + 3 `.png`) | 4128×3096 (fotos) | **96 MB en total** | **No referenciado en ningún sitio** — histórico (proceso de selección de fotos), ver doc. 02 |

## E. Recursos comerciales / redes sociales

| Recurso | Ruta | Estado |
|---|---|---|
| Imagen social (`og:image`) | `public/og-image.svg` | Oficial y activo — referenciado en `index.html` (og:image, twitter:image, JSON-LD) |
| Sprite de iconos sociales | `public/icons.svg` (Bluesky, etc.) | **No referenciado en ningún sitio** — histórico |

## F. Leftovers de scaffolding (sin relación con la marca)

| Recurso | Ruta | Estado |
|---|---|---|
| Logo Vite por defecto | `src/assets/vite.svg` | No referenciado — plantilla por defecto de `npm create vite` nunca eliminada |
| Logo React por defecto | `src/assets/react.svg` | No referenciado — ídem |
| Imagen hero temprana | `src/assets/hero.png` | No referenciado — prototipo abandonado |

## G. Tokens de diseño y CSS

| Recurso | Ruta | Contenido | Estado |
|---|---|---|---|
| Tokens de color/tipografía | `src/theme.js` | `T = {bg, surface, surface2, surface3, accent, accent2, primary, text, textDim, line, danger, warning, fontDisplay, fontBody}` | Oficial y activo — fuente de verdad del sistema visual |
| Variables globales | `src/index.css` `:root` | `color-scheme`, `font-synthesis`, antialiasing | Oficial y activo |
| Reglas `:focus`/`:focus-visible` | Repartidas en `src/*.css` | 65 reglas | Oficial y activo — buena cobertura de accesibilidad de teclado |
| Fuentes de marca | `Syne` (display), `DM Sans` (body) | Declaradas en `T.fontDisplay`/`T.fontBody` | **Activo pero mejorable** — nunca se cargan (`@font-face`/Google Fonts ausente), fallback real a fuente del sistema. Decisión deliberada documentada en `projects/club-padel-04/landing/docs/README_LANDING_CLUB_PADEL_04.md` ("evitado a propósito para no hacer llamadas externas") |

## H. Módulos de código relacionados (no assets binarios, pero forman parte de la identidad visual)

| Recurso | Ruta | Estado |
|---|---|---|
| Catálogo de galería + fondos (datos) | `src/data/visualAssets.js` | **No referenciado por App.jsx** — exporta `cp04GalleryAssets` (usado solo por `ClubGallery.jsx`) y `cp04VisualBackgrounds` (no usado por nadie) |
| Componente de galería alternativo | `src/components/ClubGallery.jsx` | **No importado en `App.jsx`** — código muerto, no se renderiza nunca |

## Resumen numérico

- **94 archivos de imagen/icono** inventariados.
- **~113 MB** de peso total en `public/gallery/cp04/` (17 MB) + `candidatas/` (96 MB) — la inmensa mayoría (96 MB) sin ninguna referencia activa.
- **13 iconos PWA** + favicon + apple-touch-icon: 100% correctos (Mejora 1).
- **4 fondos** con WebP ya generado pero sin conectar (corregido en esta mejora, ver doc. 04).
- **2 componentes/módulos de código muertos** relacionados con la galería (`ClubGallery.jsx` + su catálogo de datos).
