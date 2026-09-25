# 04 — Procedimiento para forzar la actualización del icono en caché

Android, iOS y los navegadores de escritorio cachean agresivamente los
iconos de PWA/favicon. Si tras desplegar este cambio un dispositivo
sigue mostrando el rayo morado, seguir este procedimiento:

## 1. Service worker (mecanismo ya incorporado en este cambio)

`public/sw.js` sube `CACHE_VERSION` de `"v1"` a `"v2"` — el paso
`activate` del propio service worker ya borra cualquier caché con
nombre distinto al actual (`cp04-static-v2`), así que **la mayoría de
navegadores/PWA instaladas se autoactualizan solas** en cuanto:

1. Se despliega esta versión.
2. El navegador detecta un `sw.js` distinto (comparación byte a byte) —
   ocurre automáticamente en la siguiente visita/apertura de la PWA.
3. El nuevo SW pasa a `activate` (puede requerir cerrar y reabrir la
   app, o que el usuario acepte la actualización si la app ya escucha
   `cp04:sw-update-available`, ver `src/App.jsx`).

## 2. Si Android/Chrome sigue mostrando el icono antiguo

- Forzar recarga sin caché de la página: `Ctrl+Shift+R` (escritorio) o
  borrar caché del sitio desde `chrome://settings/content/all` →
  buscar el dominio → "Borrar datos".
- Si la PWA ya está instalada como app: desinstalar el acceso directo/
  app desde el launcher de Android y volver a "Añadir a pantalla de
  inicio" — Android regenera el icono desde el manifest en ese momento.
- Verificar en `chrome://serviceworker-internals/` (o
  `edge://serviceworker-internals/`) que el service worker activo es la
  versión nueva; si sigue apareciendo la antigua, pulsar "Unregister" y
  recargar.

## 3. Si iOS/Safari sigue mostrando el icono antiguo

- iOS cachea el `apple-touch-icon` de forma especialmente persistente.
  Si ya existía un acceso directo en la pantalla de inicio:
  eliminarlo y volver a añadirlo desde Safari ("Compartir" → "Añadir a
  pantalla de inicio") — iOS no actualiza el icono de un acceso directo
  ya creado automáticamente.
- Confirmar que el servidor no sirve `apple-touch-icon.png`/
  `icon-180.png`/`icon-152.png` con cabeceras de caché de larga
  duración sin invalidación (revisar la configuración de caché del
  hosting elegido en el momento del despliegue real).

## 4. Verificación de que el cambio se sirvió correctamente

```bash
curl -I https://<dominio-real>/favicon.ico
curl -I https://<dominio-real>/icons/icon-192.png
curl -s https://<dominio-real>/manifest.webmanifest | grep icon-192
```

Si estas peticiones devuelven `200` y el manifest lista los tamaños
nuevos, el servidor ya sirve los recursos correctos — cualquier icono
antiguo remanente es un problema de caché del cliente (pasos 2-3), no
del despliegue.
