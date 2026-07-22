# 05 — Contratos de extensión disponibles y cómo implementar futuros proveedores

## Contratos ya declarados (Paso 12), estado tras Paso 13

`factory/extensionPoints.js` sigue teniendo 32 puntos de extensión, TODOS
con `status: "not_implemented"` (ese campo describe integración activa
por defecto, que sigue sin existir para ninguno). De los relacionados con
investigación:

| id | Implementado en Paso 13 | Notas |
|---|---|---|
| `publicWebsiteFetcher` | **Sí** (código real, gateado por `--allow-network`) | Ver `providers/publicWebsiteFetcher.js` |
| `searchEngineProvider` | No | Contrato solo |
| `directoryProvider` | No | Cubierto offline por `MOCK_DIRECTORY_ADAPTER` |
| `socialProfileProvider` | No | — |
| `reviewPlatformProvider` | No | Cubierto offline por `MOCK_REVIEW_SUMMARY_ADAPTER` |
| `lighthouseProvider` | No | Cubierto offline por `MOCK_PERFORMANCE_ADAPTER` |
| `accessibilityProvider` | No | Cubierto offline por `MOCK_ACCESSIBILITY_ADAPTER` |
| `seoProvider` | No | Cubierto offline por `MOCK_SEO_ADAPTER` |
| `technologyFingerprintProvider` | No | Cubierto offline por `MOCK_TECHNOLOGY_DETECTOR_ADAPTER` |
| `openAiCompatibleResearchProvider` / `perplexityCompatibleProvider` / `localModelResearchProvider` | No | Contrato solo |

## Cómo implementar un futuro proveedor real (receta, basada en lo hecho aquí)

1. **No toques los 13 adaptadores offline** (`sourceAdapters.js`) ni su
   conteo — un proveedor de red vive en `providers/<nombre>.js`, aparte.
2. Reutiliza `urlSafety.js` (`classifyUrl`/`classifyIpAddress`) para
   cualquier validación de URL/IP — no reimplementes SSRF checks.
3. Si necesitas resolver DNS y conectar, seguir el patrón "pin de IP":
   resolver una vez, validar, y forzar la conexión a esa IP exacta
   (nunca resolver DNS dos veces para la misma petición).
4. Define un `DEFAULT_<NOMBRE>_LIMITS` con timeouts/tamaños/rate limit
   explícitos — nunca sin límite.
5. Nunca lo invoques por defecto: exige una bandera de tiempo de
   ejecución equivalente a `allowNetwork` (nunca inferida de un modo
   persistido).
6. Haz que `--dry-run` siga funcionando SIN red real, igual que aquí
   (`networkAllowedThisRun = allowNetwork && !dryRun`).
7. Construye Evidence con `createEvidence()` (o reutiliza
   `evidenceFromHtmlText` si el contenido es HTML) — nunca con
   timestamps reales dentro de `metadata` (rompe idempotencia).
8. Añade tests SIN red real primero (inyecta DNS/transporte, como aquí),
   y un archivo `.realnetwork.manual.mjs` aparte (NO `.test.mjs`) para
   la validación opcional con red real de verdad, guardado por una
   variable de entorno.
9. Añade un check a `research:doctor` que confirme que el módulo carga y
   pasa su propio `healthCheck()`, sin cambiar el check existente de
   "extension points not_implemented".
10. Documenta la matriz de amenazas específica de ese proveedor (igual
    que el documento 02 de este paso).

## Ejecutar la validación real opcional

```bash
ALLOW_REAL_NETWORK_TESTS=1 npm run test:real-network
```

Sin la variable de entorno, estos 4 tests se saltan explícitamente (no
fallan, no se ejecutan) — nunca corren por defecto en `npm test` ni en CI.
