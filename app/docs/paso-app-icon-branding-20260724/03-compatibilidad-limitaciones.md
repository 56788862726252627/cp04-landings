# 03 — Compatibilidad, dispositivos y limitaciones

## Compatibilidad declarada

| Plataforma | Cobertura |
|---|---|
| **Android** (Chrome/WebView) | `icon-192`/`icon-512` con `purpose: "any maskable"` — el sistema puede recortar el icono a círculo/squircle/gota sin perder el logo (zona segura respetada) |
| **iOS** (Safari, "Añadir a inicio") | `apple-touch-icon` 180×180 (iPhone) y 152×152 (iPad), opacos, sin depender de canal alfa |
| **PWA** (instalación en escritorio/móvil) | Manifest con 13 tamaños, `display: standalone` sin cambios, iconos usados en la pantalla de instalación y en el icono resultante |
| **Escritorio** (pestaña del navegador) | `favicon.ico` (16/32/48 multi-res) + PNG 16/32/192 como refuerzo moderno |
| **Accesos directos / pantalla de instalación** | Mismos iconos del manifest — no se ha añadido un array `shortcuts` nuevo (sería una funcionalidad nueva, fuera del alcance de "solo recursos gráficos/manifest") |

## Dispositivos/contextos comprobados en esta sesión

- Servidor de desarrollo (`vite dev`) — confirmado por `curl`: `index.html`,
  `favicon.ico`, `icons/icon-192.png` y `manifest.webmanifest` sirven
  `200 OK`, y el HTML renderizado contiene los nuevos `<link>` de icono.
- `npm run build` — confirmado que los 13 PNG + `favicon.ico` +
  `apple-touch-icon.png` se copian correctamente a `dist/`, y que el
  logotipo fuente (2.2MB, fuera de `public/`) **no** se incluye en el
  build.
- Validación manual del contenido visual de `icon-16`, `icon-32`,
  `icon-192` y `icon-512` (inspección directa de los PNG generados).

**No comprobado en esta sesión** (fuera del alcance posible desde
terminal, sin dispositivo/navegador real): renderizado real en un
Android/iPhone/iPad físico, ni en un navegador de escritorio con
capturas de pantalla — no hay herramienta de automatización de
navegador en este entorno (ni se ha instalado ninguna, según la regla
de no añadir herramientas pesadas). La validación se ha basado en:
inspección directa de los píxeles generados + verificación de que el
manifest/HTML/service worker sirven y referencian los archivos
correctos.

## Limitaciones explícitas

- **Legibilidad a 16px**: el logotipo oficial es una insignia circular
  fotorrealista con texto — a 16×16 píxeles (tamaño de pestaña de
  navegador) el detalle se pierde inevitablemente; solo se distingue
  una forma circular con manchas de color. Esto es una limitación
  física del diseño de origen, no del proceso de generación — no se ha
  inventado un logotipo simplificado alternativo (fuera de alcance:
  "usa exclusivamente este logotipo").
- **`favicon.svg` (rayo) permanece en el repositorio**, sin ninguna
  referencia visual activa, pero SÍ usado como ping de conectividad en
  `src/App.jsx` — no se puede eliminar sin tocar esa lógica, lo cual
  está fuera de alcance de este cambio.
- **Sin `shortcuts` en el manifest**: no se ha añadido (sería
  funcionalidad nueva).
- **Sin splash screens específicas de iOS** (`apple-touch-startup-image`):
  iOS moderno genera su propia pantalla de arranque a partir del
  icono/`theme_color`/`background_color` del manifest sin necesitar
  imágenes de splash dedicadas — no se ha añadido ese recurso adicional
  al no ser estrictamente necesario con el enfoque actual.
