# 05 — Propuesta inicial de branding, landing y PWA

Código: `brandingLandingProposal.js`. Genera una propuesta **declarativa** (nunca
binarios) a partir del Business Intent, consumida por el compositor de Blueprint y,
más adelante, por el motor de branding/landing real de Paso 10 cuando se ejecuta
`--execute`.

## Branding (`buildBrandingProposal`)

- `slug` derivado con el mismo `slugify` de `tenant-cli` (reutilizado, no duplicado).
- Un acento de color por sector (`SECTOR_ACCENT_HINTS`), pero **nunca sin validar**:
  cada acento se comprueba con `meetsWcagAA(acento, fondo)` de `brandingEngine.js`
  (Paso 10) antes de proponerse; si no cumple AA, se descarta a favor de
  `SAFE_DEFAULT_ACCENT` (`#1d4e89`, que también pasa AA). Test dedicado:
  "los 10 sectores producen siempre un acento con contraste AA válido".
- `tone` (uno por sector, p.ej. `formal-institucional` para despachos,
  `cálido-acogedor` para restaurantes).
- `iconManifest`: referencia (no duplica) `ICON_SIZES_PX`/`PENDING_BINARY_ASSETS` de
  `brandingEngine.js` — mismo contrato de Paso 10 para favicon/iconos/PWA pendientes de
  generación visual real.

## Landing (`buildLandingProposal`)

Genera configuración reutilizable (nunca una copia monolítica por negocio): las 12
secciones mínimas del enunciado (`header`, `hero`, `valueProp`, `benefits`, `services`,
`howItWorks`, `testimonials`, `faq`, `cta`, `contact`, `footer`,
`privacyPlaceholder`), CTA configurable, navegación, testimonios y FAQ. Los
testimonios llevan siempre `isDemo: true` — nunca se presentan como reales. El
placeholder de privacidad se declara explícitamente como "pendiente de revisión
legal antes de producción".

## PWA (`buildPwaProposal`)

`themeColor`/`backgroundColor` derivados del acento/fondo de branding (ya validados
AA), `display: standalone`, y un bloque `compatibility` explícito
(`mobile/tablet/desktop/android/ios/modernBrowsers: true`) — declarativo, sin generar
ningún manifest binario real todavía (eso sigue siendo responsabilidad de Paso 10 al
ejecutar `--execute`, con el mismo contrato pendiente de Fase 6 de ese paso).

## Tests

`brandingLandingProposal.test.mjs` (7 tests): slug estable, contraste AA en los 10
sectores, iconManifest nunca afirma haber generado binarios, secciones mínimas
presentes, testimonios etiquetados, PWA deriva colores de branding, determinismo.
