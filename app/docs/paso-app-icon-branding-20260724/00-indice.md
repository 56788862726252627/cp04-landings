# Sustitución del icono de la app — logotipo oficial Club Pádel 04

Sustituye el icono anterior (rayo morado, `public/favicon.svg`) por el
logotipo oficial circular de Club Pádel 04, con recursos generados para
Android, iOS, PWA y escritorio. **Solo recursos gráficos, configuración
de iconos y manifest** — sin tocar lógica de negocio ni funcionalidad.

## Documentos

1. [01 — Auditoría inicial (recursos localizados antes del cambio)](./01-auditoria-inicial.md)
2. [02 — Recursos generados y procedimiento de generación](./02-recursos-generados.md)
3. [03 — Compatibilidad, dispositivos y limitaciones](./03-compatibilidad-limitaciones.md)
4. [04 — Procedimiento para forzar la actualización del icono en caché (Android/PWA)](./04-forzar-actualizacion-cache.md)
5. [05 — Informe técnico](./05-informe-tecnico.md)

## Resumen del cambio

- **Antes**: `public/favicon.svg` (rayo morado `#863bff`/`#7e14ff`), único
  recurso, referenciado 3 veces (favicon, apple-touch-icon, manifest) +
  precacheado por el service worker. Sin PNG de ningún tamaño, sin
  `favicon.ico`, sin iconos maskable, sin splash screens.
- **Después**: 13 tamaños PNG (`icon-16` … `icon-512`) + `favicon.ico`
  multi-resolución + `apple-touch-icon.png`, todos generados desde el
  logotipo oficial (`docs/paso-app-icon-branding-20260724/source/logo-club-padel-04-oficial.png`),
  con fondo `#05080d` (mismo `theme_color`/`background_color` del
  manifest) y el logo inscrito con margen de seguridad para Android
  adaptive icons.
- `public/favicon.svg` (el rayo) **se mantiene en disco, sin eliminar**
  — `src/App.jsx` lo usa como objetivo ligero de un ping de
  comprobación de conectividad (`retryConnection()`), no como icono
  visual. Ninguna referencia visual activa apunta ya a él.
