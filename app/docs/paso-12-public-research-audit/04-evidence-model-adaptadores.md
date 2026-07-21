# 04 — Evidence model y adaptadores de fuente

## Evidence (`evidenceSchema.js`)

Cada pieza de evidencia (`evidenceId, sourceId, sourceType, contentHash,
title, excerpt, normalizedContent, classification, relatedDimension,
signal {strength, polarity}, confidence, freshness, provenance,
limitations, privacyFlags, contradictionGroup, metadata`) es la unidad
atómica que todo hallazgo/score/recomendación enlaza — o queda marcado
explícitamente como inferencia/recomendación/desconocido si no hay
evidencia.

- `classification` ∈ `confirmed | inferred | recommended | unknown |
  contradictory | unavailable` — nunca "confirmed" salvo que venga de una
  fuente directamente observada.
- `contentHash` (sha256) es la ÚNICA base del `evidenceId` — **nunca**
  incluye `capturedAt` ni ningún timestamp, así que la misma evidencia
  produce siempre el mismo id (clave para la idempotencia).
- `deduplicateEvidence()` (evidenceDeduper.js) elimina duplicados por
  `sourceId+contentHash` y devuelve orden estable (por clave, no por
  timestamp de llegada).

## Los 13 adaptadores offline (`sourceAdapters.js`)

Todos comparten el contrato `{id, version, capabilities, inputSchema,
outputSchema, limits: {timeoutMs, retryPolicy, rateLimitPerMinute},
provenance, healthCheck(), collect()}` — mismo patrón que
`adapters/providerAdapters.js` (Paso 09).

| Adaptador | Qué produce |
|---|---|
| `local_html` | Analiza HTML local real (viewport, PWA manifest, SEO técnico/contenido, accesibilidad, booking, contacto, redes, seguridad observable, privacidad, cookies, analítica, chat, CTA, navegación, multidioma, fricción, branding, identidad) |
| `local_json` | Evidencia estructurada explícita `{relatedDimension, title, excerpt, polarity, ...}` |
| `local_markdown` | Estructura y menciones de servicio en un documento Markdown |
| `fixture_website` | Igual que `local_html` pero desde una fixture en memoria (no un archivo) |
| `mock_directory` | Presencia en directorios locales |
| `mock_maps_listing` | Rating/reseñas/dirección/horario de un listado tipo Maps |
| `mock_social_presence` | Plataformas sociales y frescura de actividad |
| `mock_review_summary` | Rating agregado, volumen, proporción de negativas |
| `mock_performance` | Score/LCP tipo Lighthouse |
| `mock_accessibility` | Violaciones tipo axe-core |
| `mock_seo` | Sitemap/datos estructurados/páginas indexables |
| `mock_technology_detector` | Tecnologías detectadas, widgets de reserva/CRM |
| `mock_competitor` | Envuelve HTML de un competidor con `sourceType: "mock_competitor"` |

Extracción de señales HTML real (no simulada): `htmlSignals.js` — 24
funciones puras basadas en regex (sin dependencia nueva), cada una
probada con HTML "moderno" vs "anticuado" real (18 tests).

## Los 13+ contratos futuros (no implementados)

Añadidos a `factory/extensionPoints.js` (reutilizando `defineExtensionPoint`,
no un registro nuevo): `publicWebsiteFetcher, searchEngineProvider,
directoryProvider, socialProfileProvider, reviewPlatformProvider,
lighthouseProvider, accessibilityProvider, seoProvider,
technologyFingerprintProvider, openAiCompatibleResearchProvider,
perplexityCompatibleProvider, localModelResearchProvider` + los 3 ya
existentes de Paso 10 (`publicResearch, googleMaps, websiteAudit`, con su
`docsNote` actualizado). Cada uno declara interfaz, credenciales
necesarias, limitaciones y seguridad — `status: "not_implemented"`
siempre, con un mock automático vía `getExtensionPointWithMock(id)`.

## Recolección tolerante a fallos (fail-soft)

`collectFromFixture()` en `auditOrchestrator.js` envuelve cada llamada de
adaptador en try/catch: si un adaptador falla o una fixture es
desconocida, se registra la limitación y **se continúa con el resto** —
nunca se aborta toda la auditoría por un solo fallo (probado
explícitamente: fixture desconocida junto a una válida → evidencia parcial
+ limitación registrada, no una excepción).
