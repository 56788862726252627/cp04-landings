# 06 — Prueba end-to-end real (verificada en esta sesión)

## Objetivo del negocio de prueba

Dominio público, inocuo y explícitamente diseñado para pruebas/ejemplos:
**`https://example.com/`** (reservado por IANA bajo RFC 2606 — nunca un
negocio ni competidor real de un tercero). Máximo 1 dominio, 1 página
(`--max-pages=1`).

## Comando ejecutado

```bash
npm run research:audit -- \
  --business-name="Dominio de Ejemplo IANA" --sector=generic-local-service \
  --mode=public-web --allow-network --url=https://example.com/ --max-pages=1
```

## Resultado real (1ª ejecución)

```
Auditoría "dominio-de-ejemplo-iana" completada en 372ms.
Score global: 32/100 (débil).
Evidencias: 20 · Recomendaciones: 17 · Automatizaciones candidatas: 4.
Archivos creados: 13 · actualizados: 0 · preservados: 0.
Red REAL usada — URLs consultadas: https://example.com/
```

Detalle del score global real: `{ score: 32, confidence: 0.38, status:
"débil", coverage: 1 }`. Una evidencia real de ejemplo (auténtica, de la
respuesta HTTP real de example.com):
`{ relatedDimension: "visiblePrivacy", sourceType: "public_website_real",
classification: "confirmed", title: "Sin enlace visible a política de
privacidad" }` — coherente con el contenido real de esa página (una
página de ejemplo mínima, sin política de privacidad ni formularios).

## Repetición (idempotencia, 2ª ejecución real, mismo comando)

```
Archivos creados: 0 · actualizados: 0 · preservados: 13.
```

**Nota de proceso**: la primera implementación SÍ tenía una fuga de
idempotencia real (`fetchedAt` embebido en la evidencia persistida,
distinto en cada llamada real → 2 archivos "actualizados" en la 2ª
ejecución). Se detectó ejecutando la prueba dos veces de verdad (no
solo leyendo el código), se corrigió (`fetchedAt` se queda fuera de
`Evidence.metadata`, solo vive en el resultado en memoria para el log de
consola), y se reprodujo la prueba desde cero confirmando 0/0/13. Esto
demuestra por qué la Fase 5 exige repetir la auditoría real dos veces:
un bug de este tipo no se detecta solo leyendo el código.

## Degradación controlada ante fallo (real, no simulada)

```bash
npm run research:collect -- --business-name="Prueba 404" --sector=generic-local-service \
  --mode=public-web --allow-network --url=https://example.com/ruta-que-no-existe-de-verdad-12345
```

Resultado real: `classification: "unavailable"`, `errorCode: "HTTP_4XX"`,
`excerpt: "HTTP 404"` — sin lanzar ninguna excepción, sin detener el
proceso.

## Comandos adicionales verificados sobre esta misma auditoría real

- `npm run research:report -- --audit=.../dominio-de-ejemplo-iana/audit.json --format=technical`
  → informe técnico con las 13 categorías renderizado correctamente a partir de datos reales.
- `npm run research:doctor` → saludable, incluyendo el nuevo check `public_website_fetcher_provider_loaded`.

## Lo que esta prueba demuestra (checklist Fase 5)

- [x] Planificación (`research:plan` / `buildResearchPlan`)
- [x] Recopilación REAL (`collectFromPublicWebsite` contra `example.com`)
- [x] Análisis (`evaluateAllDimensions` sobre evidencia real)
- [x] Scoring (`computeAllScores`: 32/100)
- [x] Recomendaciones (17, derivadas de evidencia real)
- [x] Informes (ejecutivo/técnico/comercial, todos renderizados)
- [x] Hashes/evidencias (`contentHash` real del HTML obtenido, `evidenceId` estable)
- [x] Idempotencia (0/0/13 en la 2ª ejecución real, tras el fix)
- [x] Repetición sin duplicados
- [x] Degradación controlada ante fallo (404 real manejado sin lanzar)
