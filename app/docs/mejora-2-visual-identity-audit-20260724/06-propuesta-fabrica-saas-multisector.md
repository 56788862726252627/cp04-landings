# 06 — Propuesta de arquitectura visual multisector (`branding.config.json`)

**Propuesta técnica, no implementada.** La app actual no se ha
reconectado a este archivo — es un diseño para que un futuro prompt de
la fábrica SaaS (`src/saas-core/factory/`, `src/saas-core/nl-builder/`)
pueda generar automáticamente la identidad visual completa de cada
cliente nuevo, reutilizando la misma arquitectura de tokens
(`src/theme.js`) ya validada en Club Pádel 04.

## Por qué un archivo de configuración y no tocar la app todavía

`src/theme.js` ya demuestra que la app **puede** funcionar con un
objeto de tokens centralizado — el paso que falta es (a) generalizarlo
para que sus valores vengan de un archivo por cliente en vez de estar
hardcodeados, y (b) generar los assets binarios (iconos, favicon,
manifest) a partir de esos valores con el mismo proceso ya usado en
Mejora 1. Ninguna de las dos cosas se conecta en esta mejora —
solo se deja la propuesta y el esquema.

## Esquema propuesto (`branding.config.json`)

```jsonc
{
  "$schema": "https://clubpadel04.example/schemas/branding.config.schema.json",
  "meta": {
    "clientId": "string — identificador único del cliente (slug)",
    "commercialName": "string — nombre comercial mostrado al público",
    "sector": "string — uno de los sectores soportados (ver lista abajo)",
    "tone": "string — tono de marca: profesional | cercano | premium | tecnico | familiar"
  },
  "logo": {
    "sourcePath": "string — ruta al logotipo oficial fuente (nunca inventado, siempre proporcionado por el cliente)",
    "variant": "circular | rectangular | monograma | wordmark",
    "hasTransparentBackground": "boolean",
    "safeZoneRatio": "number (0-1) — igual que Mejora 1: 0.86 por defecto, 0.98 para iconos <=32px"
  },
  "icons": {
    "faviconSizes": [16, 32, 48],
    "pwaSizes": [16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512],
    "maskableSizes": [192, 512],
    "backgroundColor": "string (hex) — igual que theme_color/background_color del manifest"
  },
  "splash": {
    "enabled": "boolean",
    "backgroundColor": "string (hex)"
  },
  "palette": {
    "bg": "string (hex)",
    "surface": "string (hex)",
    "surface2": "string (hex)",
    "surface3": "string (hex)",
    "accent": "string (hex) — acento principal de marca",
    "accent2": "string (hex) — acento secundario",
    "primary": "string (hex)",
    "text": "string (hex)",
    "textDim": "string (hex)",
    "line": "string (rgba)",
    "success": "string (hex) — ÚNICO color de éxito (lección de la Mejora 2: nunca varios tonos sin normalizar)",
    "warning": "string (hex)",
    "danger": "string (hex) — ÚNICO color de error",
    "info": "string (hex)",
    "disabledOpacity": "number (0-1)"
  },
  "typography": {
    "fontDisplay": "string — nombre de familia",
    "fontBody": "string — nombre de familia",
    "loadStrategy": "system-fallback | self-hosted-woff2 | google-fonts-link — lección de Mejora 2: nunca 'google-fonts-link' sin aprobación explícita (llamada externa)"
  },
  "backgrounds": {
    "perModule": {
      "home": "string — ruta a imagen fuente (PNG/JPG)",
      "admin": "string",
      "reservas_o_equivalente": "string",
      "general": "string"
    },
    "autoGenerateWebp": "boolean — true por defecto, aplica el mismo patrón image-set() de la Mejora 2"
  },
  "photography": {
    "gallery": ["array de rutas — nunca duplicados (Mejora 2: verificar hash antes de aceptar)"],
    "requireDistinctHashes": "boolean — true por defecto, lección directa del hallazgo de 6 fotos duplicadas en Club Pádel 04"
  },
  "modules": ["array de módulos habilitados para este cliente, mismo catálogo que src/saas-core/nl-builder/moduleCatalog.js"],
  "clientData": {
    "contactEmail": "string",
    "contactPhone": "string",
    "siteUrl": "string",
    "locationArea": "string"
  },
  "targetDevices": ["android", "ios", "desktop", "pwa"],
  "commercialAssets": {
    "generateOgImage": "boolean",
    "generateSocialSprite": "boolean"
  }
}
```

## Sectores mínimos soportados (coincide con los perfiles ya usados en el motor de investigación, Pasos 15-20)

`club-deportivo` (Club Pádel 04 es la instancia concreta) · `clinica-dental` · `fisioterapia` · `logopedia` · `psicologia` · `veterinario` · `peluqueria` · `estetica` · `fertilidad` · `abogado` · `negocio-local` · `profesional-independiente`.

## Ejemplo conceptual — Club Pádel 04 (datos ya públicos del propio proyecto)

```json
{
  "meta": {
    "clientId": "club-padel-04",
    "commercialName": "Club Pádel 04",
    "sector": "club-deportivo",
    "tone": "tecnico"
  },
  "logo": {
    "sourcePath": "docs/paso-app-icon-branding-20260724/source/logo-club-padel-04-oficial.png",
    "variant": "circular",
    "hasTransparentBackground": false,
    "safeZoneRatio": 0.86
  },
  "palette": {
    "bg": "#05080d",
    "accent": "#b6ff00",
    "accent2": "#20e3b2",
    "primary": "#2f6bff",
    "success": "#20e3b2",
    "danger": "#ff5e3a",
    "warning": "#ffad47"
  },
  "typography": {
    "fontDisplay": "Syne",
    "fontBody": "DM Sans",
    "loadStrategy": "system-fallback"
  },
  "targetDevices": ["android", "ios", "desktop", "pwa"]
}
```

## Ejemplo genérico — clínica dental (sin datos reales, ficticio)

```json
{
  "meta": {
    "clientId": "clinica-dental-generica",
    "commercialName": "Clínica Dental [Nombre a definir]",
    "sector": "clinica-dental",
    "tone": "cercano"
  },
  "logo": {
    "sourcePath": "PENDIENTE — el cliente debe proporcionar su logotipo oficial, nunca se inventa uno",
    "variant": "wordmark",
    "hasTransparentBackground": true,
    "safeZoneRatio": 0.86
  },
  "palette": {
    "bg": "#0a0f14",
    "accent": "#2fb8a8",
    "accent2": "#7bd9cc",
    "primary": "#2f6bff",
    "success": "#2fb8a8",
    "danger": "#e5484d",
    "warning": "#f5a623"
  },
  "typography": {
    "fontDisplay": "sistema (pendiente de decisión)",
    "fontBody": "sistema (pendiente de decisión)",
    "loadStrategy": "system-fallback"
  },
  "targetDevices": ["android", "ios", "desktop", "pwa"]
}
```

## Cómo se conectaría en el futuro (sin hacerlo ahora)

1. `src/theme.js` pasaría de exportar un objeto fijo `T` a una función
   `buildTheme(brandingConfig)` que lo genere dinámicamente — cambio
   aislado, no toca los cientos de puntos que ya usan `T.accent`, etc.
2. Un nuevo script en `factory-cli/` (mismo patrón que
   `business-create.mjs`) leería `branding.config.json` y ejecutaría el
   mismo proceso de generación de iconos de Mejora 1 (recorte, zona de
   seguridad, 13 tamaños, favicon.ico) para el logotipo del cliente.
3. `manifest.webmanifest`/`index.html` pasarían de valores hardcodeados
   a plantillas rellenadas por ese script en el momento de generar el
   proyecto del cliente — nunca en tiempo de ejecución de la app ya
   desplegada.

Ninguno de estos 3 puntos se ha implementado — quedan como diseño para
una mejora futura dedicada.
