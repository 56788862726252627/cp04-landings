# BRANDING — `<slug-cliente>`

Plantilla. Sustituir todos los placeholders `< ... >` con datos reales del cliente antes de usar en un cliente real.

## Identidad

| Campo | Valor | Origen en `client-config.json` |
|---|---|---|
| Nombre comercial | `<NOMBRE_COMERCIAL_REAL>` | `brand.name` |
| Nombre legal | `<RAZÓN_SOCIAL_O_NULL>` | `brand.legalName` |
| Logo | `<URL_LOGO_O_NULL>` | `brand.logo` |
| Favicon | `<URL_FAVICON_O_NULL>` | `brand.favicon` |
| Imágenes de marca | `<LISTA_DE_URLS_O_VACÍO>` | `brand.images` |

## Tema (opcional — omitir si el cliente usa el CORE_THEME por defecto)

Si el cliente necesita colores/tipografías propios, rellenar solo las claves que cambian (override parcial, mecanismo ya soportado por `resolveTheme()` en `src/theme.js`, Quick Win 3). **No es obligatorio rellenar las 14 claves** — las que se omitan heredan el valor de `CORE_THEME`.

| Token | Valor cliente (opcional) |
|---|---|
| `bg` | |
| `surface` / `surface2` / `surface3` | |
| `accent` / `accent2` | |
| `primary` | |
| `text` / `textDim` | |
| `line` | |
| `danger` / `warning` | |
| `fontDisplay` / `fontBody` | |

## Checklist antes de dar por cerrado el branding

- [ ] Contraste de color verificado (a11y) entre `text`/`bg` y `accent`/`bg`.
- [ ] Logo en formato vectorial o con versión de alta resolución.
- [ ] Ningún asset apunta a `/gallery/cp04/` ni a ninguna ruta de Club Pádel 04.
- [ ] `brand.name` coincide exactamente con el nombre legal/comercial acordado en el contrato.

## Qué NO hacer aquí

- No editar `src/theme.js` directamente por cliente — el override vive en `client-config.json`, no en el código.
- No usar imágenes/textos de Club Pádel 04 como placeholder "temporal" — usar assets neutros o vacíos hasta tener los reales.
