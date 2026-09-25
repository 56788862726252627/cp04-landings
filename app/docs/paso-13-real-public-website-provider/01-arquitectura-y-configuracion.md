# 01 — Arquitectura, configuración y CLI

## Arquitectura

```
fetchPublicWebsite(url, limits)
  1. normalizeUrl()               — determinista: minúsculas, sin puerto por defecto, sin fragmento
  2. validateUrlForRealFetch()    — CAPA 1 (classifyUrl: esquema/hostname literal)
                                     + CAPA 2 (resolveHostnameSafely: DNS real + classifyIpAddress)
  3. checkRobotsPermission()      — fetchRobotsTxt() + isPathAllowedByRobots() (fail-open si no hay robots.txt)
  4. performPinnedRequest()       — conecta DIRECTO a la IP ya validada (lookup "pinneado"),
                                     sin cookies/auth, timeout real (AbortController),
                                     límite de tamaño real, sin seguir redirecciones
  5. Si 3xx: vuelve a 2 con la URL de destino (revalidación completa), hasta maxRedirects
  6. Si 2xx + MIME permitido: extrae señales con htmlSignals.js (reutilizado de Paso 12,
     vía evidenceFromHtmlText) → Evidence con sourceType="public_website_real"
```

Módulos nuevos:

- `src/saas-core/research/providers/publicWebsiteFetcher.js` — implementación completa.
- `src/saas-core/research/providers/publicWebsiteFetcher.test.mjs` — 30 tests (sin red real).
- `src/saas-core/research/providers/publicWebsiteFetcher.realnetwork.manual.mjs` — 4 tests opcionales con red real (ver 06).

Cambios aditivos en archivos de Paso 12 (documentados, no rompen nada — 767/767 tests):

| Archivo | Cambio |
|---|---|
| `urlSafety.js` | + `classifyIpAddress()` (reutilizable para IP literal o resuelta por DNS) + rangos multicast/broadcast/TEST-NET/reservados |
| `evidenceSchema.js` | + `"public_website_real"` en `SOURCE_TYPES` |
| `researchRequestSchema.js` | + `"public-web"`, `"hybrid"` en `RESEARCH_MODES` (junto a los ya existentes `"offline"`, `"online"`) |
| `auditOrchestrator.js` | `collectEvidence`/`runResearchAudit` aceptan `allowNetwork`/`networkLimits`; **fix de idempotencia**: `--dry-run` fuerza `allowNetwork:false` internamente (ver 07) |
| `auditReportGenerator.js` | `reportData` incluye `networkUsed`/`consultedUrls`; el informe ejecutivo cita las URLs reales consultadas |
| `research-cli/lib/researchCli.mjs` | + `resolveNetworkOptionsFromArgs()`, `--mode` explícito, check nuevo en `research:doctor` |
| `research-cli/{research-audit,research-collect,business-research}.mjs` | + flags de red (ver abajo) |

`factory/extensionPoints.js` (Paso 10) **no se tocó**: el contrato
`publicWebsiteFetcher` sigue registrado ahí con `status: "not_implemented"`
a propósito — ese campo describe si hay una integración activa POR
DEFECTO (no la hay: todo requiere `--allow-network` explícito cada vez),
no si el código existe. `research:doctor` añade un check separado
(`public_website_fetcher_provider_loaded`) que sí confirma que el módulo
real existe y funciona.

## Modos

| Modo | Comportamiento |
|---|---|
| `offline` (por defecto) | Igual que Paso 12: cualquier URL → evidencia `"unavailable"` |
| `online` | Heredado de Paso 12 (nunca implementó red; se mantiene por compatibilidad) |
| `public-web` | **Nuevo.** Con `--allow-network`, usa `publicWebsiteFetcher` para las URLs declaradas |
| `hybrid` | **Nuevo.** Igual que `public-web`, pensado para combinar con fixtures/archivos locales en la misma auditoría |

**Regla de oro**: `allowNetwork` es una bandera de **tiempo de
ejecución**, nunca parte de lo que se guarda en `research-request.json`.
Volver a ejecutar una auditoría desde un archivo guardado con
`mode: "public-web"` SIN pasar `--allow-network` de nuevo se comporta
exactamente como offline. Verificado por test
(`auditOrchestrator.test.mjs`).

## Límites configurables (valores por defecto seguros)

```js
DEFAULT_FETCHER_LIMITS = {
  timeoutMs: 8000,
  maxBytes: 2_000_000,       // 2 MB
  maxRedirects: 3,
  maxPages: 3,
  rateLimitMs: 500,          // pausa entre páginas de una misma auditoría
  allowedMimeTypes: ["text/html", "text/plain", "application/xhtml+xml"],
  userAgent: "ClubPadel04-ResearchBot/1.0 (...)",
  respectRobots: true,
}
```

## CLI

```bash
# Solo recolección real de 1 URL (requiere mode+allow-network)
npm run research:collect -- --business-name="X" --sector=dental \
  --url=https://example.com/ --mode=public-web --allow-network \
  --provider=publicWebsiteFetcher --max-pages=1

# Auditoría completa real
npm run research:audit -- --business-name="X" --sector=dental \
  --url=https://example.com/ --mode=public-web --allow-network \
  --timeout=8000 --max-bytes=2000000 --max-pages=1 --respect-robots=true

# Dry-run: SOLO plan, nunca red real (aunque se pida --allow-network)
npm run research:audit -- --business-name="X" --sector=dental \
  --url=https://example.com/ --mode=public-web --allow-network --dry-run

# Puente Business Intent → auditoría real
npm run business:research -- --business-intent=<ruta> \
  --url=https://example.com/ --mode=public-web --allow-network

# Salud del motor (incluye el proveedor real)
npm run research:doctor
```

Todas las opciones nuevas: `--mode`, `--allow-network`, `--provider`,
`--timeout`, `--max-bytes`, `--max-pages`, `--respect-robots`,
`--user-agent` — documentadas con `--help` en cada comando.
