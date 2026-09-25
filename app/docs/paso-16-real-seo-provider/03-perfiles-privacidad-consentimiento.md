# 03 — Perfiles sectoriales, privacidad y consentimiento

## `seo/seoSectorRules.js` — dato puro, sin lógica en el núcleo

`seoAnalyzer.js` no conoce ningún sector: solo llama a
`getSeoSectorRule(profileId)` (con fallback a `generic` si el perfil no
existe) para obtener 4 parámetros de datos:

| Campo | Uso |
|---|---|
| `expectedSchemaTypes` | Adecuación heurística de datos estructurados (categoría F) |
| `relevantContentKeywords` | Palabras clave de contenido relevante (categoría G) |
| `thinContentWordThreshold` | Umbral de "contenido escaso" (categoría G) |
| `requiresNAP` | Si se evalúan dirección/horario (categoría G) — `false` para sectores donde NAP es menos determinante (p. ej. `abogado`, `inmobiliaria`) |

Cubre los 10 perfiles mínimos del enunciado + genérico: `club-deportivo`,
`clinica`, `dentista`, `veterinario`, `abogado`, `restaurante`, `hotel`,
`inmobiliaria`, `peluqueria`, `centro-estetica`, `generic`. Reutiliza los
mismos ids que `providerSectorProfiles.js` (Paso 15) — no inventa una
segunda taxonomía de sectores.

## Privacidad

- `seoProvider` nunca extrae ni procesa datos personales de terceros:
  analiza estructura/metadatos/contenido PÚBLICO ya publicado por el
  propio negocio auditado en su web.
- La detección de "información de contacto"/"dirección"/"horario" es
  heurística sobre TEXTO YA VISIBLE en la página pública — no consulta
  ninguna base de datos externa ni hace scraping adicional.
- Ninguna cabecera de autenticación/cookie llega nunca a `seoProvider`
  (`publicWebsiteFetcher` no las envía ni las recibe de vuelta —
  verificado en Paso 13; `seoProvider` solo ve `body`/`headers`
  whitelisted/`robotsTxt`).

## Consentimiento

`seoProvider` en sí mismo no requiere consentimiento adicional al ya
exigido por `publicWebsiteFetcher` (Paso 13: `allowNetwork:true`
explícito) — es un análisis derivado del MISMO contenido ya
autorizado a recopilarse, sin ninguna llamada nueva a terceros.

Los perfiles sectoriales regulados heredados de Paso 15
(`clinica`/`dentista`/`veterinario`/`abogado`) siguen exigiendo su propio
`consentRequired`/`consentNote` (Paso 15, `providerSectorProfiles.js`)
para proveedores que SÍ necesitan credenciales de terceros
(`socialProvider`, `aiContentProvider`) — `seoProvider` no está en esa
lista porque no usa ninguna API externa.

## Límite honesto

La "adecuación preliminar al perfil sectorial" (categoría F) es una
heurística de coincidencia de nombres de tipo Schema.org — nunca debe
presentarse como una recomendación legal/profesional vinculante,
especialmente en los 4 sectores regulados. El texto de cada hallazgo lo
declara explícitamente en `limitations`.
