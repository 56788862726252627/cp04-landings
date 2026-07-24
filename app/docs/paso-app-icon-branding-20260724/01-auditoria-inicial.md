# 01 — Auditoría inicial (recursos localizados antes del cambio)

Realizada por inspección directa del árbol (`grep`/`find`/lectura de
archivos), sobre el commit base `d30dc0b` (Paso 21).

| Recurso | Ubicación | Uso |
|---|---|---|
| `public/favicon.svg` | único archivo de icono existente | Rayo morado (`#863bff`/`#7e14ff`), SVG con máscara/gradientes |
| `<link rel="icon">` | `index.html:5` | Apuntaba a `favicon.svg` |
| `<link rel="apple-touch-icon">` | `index.html:6` | Apuntaba también a `favicon.svg` (sin PNG dedicado — iOS sin icono óptimo) |
| `manifest.webmanifest` → `icons` | `public/manifest.webmanifest` | Un único icono `{src: "/favicon.svg", sizes: "any", type: "image/svg+xml"}` |
| Service worker | `public/sw.js:18` | Precacheaba `/favicon.svg` como parte del app-shell offline |
| `theme_color`/`background_color` | `index.html:10` y `manifest.webmanifest` | `#05080d` — no dependen del icono, sin necesidad de cambio |
| `vite.config.js` | raíz de `app/` | Sin ninguna configuración de PWA/generación de iconos (no usa `vite-plugin-pwa`) |
| `favicon.ico` | — | No existía |
| Iconos PNG (16-512) | — | No existían en ningún tamaño |
| Iconos maskable | — | No existían |
| Splash screens | — | No existían |
| `manifest.json` (Web App Manifest alternativo) | — | No existe; solo se usa `manifest.webmanifest` — hay dos `manifest.json` no relacionados dentro de `src/saas-core/businesses/*/mockups/`, que son plantillas de ejemplo de la fábrica SaaS para OTROS negocios generados, no de esta app — no se han tocado |

## Otras referencias al rayo morado detectadas

- `src/App.jsx:7757`: `fetch("/favicon.svg", ...)` — **no es un uso
  visual del icono**, es un ping de comprobación de conectividad
  (`retryConnection()`) que usa el archivo por ser pequeño y estar
  siempre presente. Ver documento 05 para la decisión tomada al
  respecto (mantener el archivo, no tocar esa lógica).
- Ningún otro archivo HTML/CSS/JS del árbol referenciaba los colores
  `#863bff`/`#7e14ff` ni el propio `favicon.svg`.
