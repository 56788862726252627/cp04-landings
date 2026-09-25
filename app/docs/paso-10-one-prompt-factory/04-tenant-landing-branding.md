# Paso 10 · Fases 4-6 — Tenant, landing y branding

## Fase 4 — Generador de tenant (`blueprintToTenant.js`)

`blueprintToTenantConfig(blueprint)` traduce un Business Blueprint YA
VALIDADO a un `tenant.config.json` que valida contra el **mismo**
`tenantSchema.validateTenantConfig` de Paso 09 — sin excepciones ni modo
especial. Resuelve la plantilla/preset por `sector` (busca primero en
presets, luego en plantillas base), deriva `roles`/`permissions` de esa
base (nunca los reinventa) y declara integraciones con solo nombres de
variable. Tests: `blueprintToTenant.test.mjs` (6 tests), incluyendo un test
que recorre las 7 plantillas de Paso 09 y confirma que el puente produce un
tenant válido para cada una — sin generar ni una línea de código específica
por sector.

Club Pádel 04 (`CLUB_PADEL_04_TENANT`, Paso 09) no se toca: sigue siendo el
tenant por defecto y su equivalencia con `rbac.js` la sigue verificando
`moduleRegistry.test.mjs` de Paso 09, intacto.

## Fase 5 — Generador de landing (`landingGenerator.js`)

Dos funciones puras:

- `buildLandingConfig(blueprint, terminology)` — compone la CONFIGURACIÓN
  (JSON) de la landing: header, hero, propuesta de valor, beneficios,
  servicios, cómo funciona, testimonios (siempre marcados
  `isDemoData: true`, nunca implican ser reales), FAQ, CTA, contacto,
  footer con placeholders de privacidad/términos explícitamente marcados
  como pendientes de revisión legal. `robots: noindex,nofollow` por
  defecto — nada se publica.
- `renderLandingHtml(landingConfig, brandTokens)` — el **único** renderer:
  cualquier negocio pasa por esta misma función. Añadir un negocio nunca
  duplica HTML, solo produce un nuevo objeto de configuración. Escapa HTML
  de todas las entradas (sin XSS — verificado en test).

Tests: `landingGenerator.test.mjs` (7 tests), incluye una prueba explícita
de que el mismo renderer produce salidas distintas y correctas para dos
negocios distintos (reutilización real, no solo teórica).

## Fase 6 — Motor de branding (`brandingEngine.js`)

`resolveBrandTokens(branding)` combina lo declarado en el blueprint con
valores por defecto seguros (`DEFAULT_COLORS/FONTS/RADII/SHADOWS`) y calcula
contraste WCAG 2 (`relativeLuminance`, `contrastRatio`, `meetsWcagAA`) para
los pares texto/fondo, texto/superficie y fondo/color primario — reporta
`contrast.allPassAA` y qué pares fallan, sin bloquear la generación (se
registra como riesgo en el informe, ver Fase 10).

`tokensToCssVariables(tokens)` serializa los tokens como custom properties
CSS (`:root {--color-primary: ...}`), consumible por cualquier render
futuro (landing, app, emails).

### Contrato de binarios (favicon/iconos/PWA) — Fase 6, preparado no implementado

`ICON_SIZES_PX` = los 13 tamaños pedidos (16, 32, 48, 72, 96, 128, 144, 152,
180, 192, 256, 384, 512). `PENDING_BINARY_ASSETS` enumera favicon.ico,
cada icono, apple-touch-icon, maskable icons (192/512) y
manifest.webmanifest — todos con `status: "not_implemented"`.
`buildPendingAssetsManifest({businessId})` produce el manifest declarativo
que el orquestador escribe en `branding/pending-assets.json`. Ninguna
función de este módulo genera un PNG/ICO real: eso queda como trabajo de un
paso futuro (ver `08-puntos-extension-futuro.md`, `advancedBrandingGeneration`
e `imageGeneration`).

Tests: `brandingEngine.test.mjs` (10 tests) — incluye verificación matemática
de `contrastRatio` (negro/blanco = 21:1, un color contra sí mismo = 1:1) y
que los 13 tamaños de icono están presentes.
