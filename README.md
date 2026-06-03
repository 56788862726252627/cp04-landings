# Club Pádel 04 · Landings y accesos rápidos

Este repositorio contiene accesos HTML cortos para abrir la app privada de Club Pádel 04.

## Estado actual

- Sitio servido desde GitHub Pages.
- Rama principal: `main`.
- Acceso actual funcional: `index.html` y `a/index.html`.
- Objetivo pendiente: añadir `landing-a/index.html` y `landing-b/index.html`.

## Archivos principales actuales

- `index.html`: página principal con botones de acceso.
- `a/index.html`: enlace corto general para abrir la app.
- `manifest.webmanifest`: configuración para instalar como app/PWA desde el navegador.
- `icon.svg`: icono de Club Pádel 04.
- `cp04-app.url`: acceso directo para Windows.

## Destino actual

Todos los accesos redirigen a:

`https://padel04-app.tailbecacd.ts.net/`

## Importante

Como la URL usa Tailscale, cada dispositivo que quiera abrir la app debe tener Tailscale instalado, iniciado sesión y conectado al mismo tailnet autorizado.
