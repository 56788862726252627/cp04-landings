# 02 — Recursos generados y procedimiento de generación

## Origen

`docs/paso-app-icon-branding-20260724/source/logo-club-padel-04-oficial.png`
— logotipo oficial circular de Club Pádel 04 (Antequera), 1536×1536,
RGBA. Se mantiene aquí (fuera de `public/`, para no inflar el bundle
desplegado con un archivo de 2.2MB que ningún cliente necesita
descargar) como fuente canónica para regenerar los iconos en el futuro
si el logotipo cambia.

## Composición aplicada

El logotipo es un círculo perfecto inscrito en el lienzo cuadrado
(toca los 4 puntos medios de los bordes), con las esquinas en negro
sólido `#000000` (no transparencia real). Para cada tamaño se generó:

- Un lienzo cuadrado nuevo, relleno con `#05080d` (mismo `theme_color`/
  `background_color` que ya usaba el manifest — la diferencia con el
  negro original de las esquinas es imperceptible).
- El logo redimensionado y centrado dentro de ese lienzo:
  - **Tamaños ≤32px** (favicon de pestaña): escala 98% — casi sin
    margen, para aprovechar cada píxel en el tamaño donde la
    legibilidad es más difícil — más una máscara de nitidez
    (`UnsharpMask`) para reforzar el contraste tras el reescalado
    agresivo.
  - **Tamaños ≥48px**: escala 86% — margen visible, coherente con un
    icono de app normal y dentro de la "zona segura" de un icono
    adaptable de Android (evita recortes si el sistema aplica su propia
    máscara circular/squircle).
- Redimensionado con remuestreo LANCZOS (alta calidad) en todos los
  casos.

Composición 100% opaca (sin transparencia) — necesario para que
`apple-touch-icon` se vea correctamente en iOS (que históricamente no
respeta bien el canal alfa) y para que los mismos archivos sirvan a la
vez como icono "any" y como icono "maskable" en el manifest.

## Archivos generados

| Archivo | Tamaño | Uso |
|---|---|---|
| `public/favicon.ico` | multi-resolución 16/32/48 | Favicon clásico, fallback universal |
| `public/apple-touch-icon.png` | 180×180 | Nombre convencional que algunos navegadores/iOS buscan sin `<link>` explícito |
| `public/icons/icon-16.png` | 16×16 | Favicon de pestaña |
| `public/icons/icon-32.png` | 32×32 | Favicon de pestaña (pantallas de alta densidad) |
| `public/icons/icon-48.png` | 48×48 | Favicon/escritorio |
| `public/icons/icon-72.png` | 72×72 | Android (densidad media) |
| `public/icons/icon-96.png` | 96×96 | Android (densidad alta) |
| `public/icons/icon-128.png` | 128×128 | Escritorio/Chrome Web Store style |
| `public/icons/icon-144.png` | 144×144 | Android (xhdpi) / Windows tiles |
| `public/icons/icon-152.png` | 152×152 | iPad (`apple-touch-icon`) |
| `public/icons/icon-180.png` | 180×180 | iPhone (`apple-touch-icon`) |
| `public/icons/icon-192.png` | 192×192 | PWA estándar + **maskable** (Android adaptive icon) |
| `public/icons/icon-256.png` | 256×256 | Escritorio/instalador |
| `public/icons/icon-384.png` | 384×384 | PWA de alta resolución |
| `public/icons/icon-512.png` | 512×512 | PWA estándar + **maskable** — pantalla de instalación/splash |

## Referencias actualizadas

- `index.html`: `<link rel="icon">` (favicon.ico + PNG 16/32/192),
  `<link rel="apple-touch-icon">` (180 y 152), manifest sin cambios de
  ruta.
- `public/manifest.webmanifest`: array `icons` con los 13 tamaños;
  `192x192` y `512x512` con `"purpose": "any maskable"`.
- `public/sw.js`: `CACHE_VERSION` subido a `v2`; `PRECACHE_URLS` ahora
  incluye `/favicon.ico`, `/icons/icon-192.png`, `/icons/icon-512.png`
  en vez de `/favicon.svg`.

## Recurso mantenido por compatibilidad (no eliminado)

`public/favicon.svg` (el rayo morado original) **sigue en el
repositorio** — no se ha borrado. Motivo verificado: `src/App.jsx`
(`retryConnection()`) lo usa como objetivo de un `fetch HEAD` para
comprobar conectividad de red, sin relación con el icono visual. Ver
documento 05 para el detalle de esta decisión.
