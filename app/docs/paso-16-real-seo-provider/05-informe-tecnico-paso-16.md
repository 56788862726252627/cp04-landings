# 05 — Informe técnico del Paso 16

## Resumen

Convierte `seoProvider` (stub desde Paso 14) en el segundo proveedor
real del sistema multiproveedor. Analiza determinísticamente 8
categorías SEO (indexación, metadatos, estructura, enlaces, imágenes,
datos estructurados, contenido, SEO técnico) sobre HTML ya recopilado
por `publicWebsiteFetcher` en la MISMA ejecución — nunca descarga nada
por su cuenta. Conectado al pipeline multiproveedor (Paso 15), al
scoring existente (Paso 12, sin modificarlo), a 10 perfiles sectoriales +
genérico, y a un CLI extendido con un comando dedicado nuevo.

## Precheck (Fase 1)

- Base confirmada: commit `7f4fb84` (Paso 15), branch
  `feature/multiprovider-orchestrator-integration-20260722`.
- PRs previas confirmadas abiertas y sin tocar: #40, #41, #42 (base
  `main`, detectado en Paso 15, sin corregir por instrucción explícita
  de no tocar PRs anteriores), #43 (Paso 15, base correcta: rama de
  Paso 14).
- Baseline verificado antes de tocar nada: 887/887 tests, lint con 4
  errores + 1 warning preexistentes (mismos de siempre, no relacionados
  con este trabajo), build correcto.
- Rama nueva desde `7f4fb84`: `feature/real-seo-provider-20260723`
  (nombre libre, sin colisión).
- Worktree aislado: `/root/cp04-t-real-seo-provider`.
- 3 checkpoints locales creados durante el desarrollo (tras Fases 4, 7 y
  10 del propio trabajo, tal como pedía la instrucción de recuperación
  ante interrupciones) — ninguno se hizo push hasta el commit final.

## Bug real encontrado y corregido durante el desarrollo

Al implementar el paso explícito que invoca `seoProvider` tras
`publicWebsiteFetcher` (necesario porque el pipeline genérico de Paso
14/15 llama a todos los proveedores con el mismo input `{urls,limits}`,
y `seoProvider` necesita `{pages}`), la primera versión llamaba a
`seoProviderDef.collect(...)` directamente con un `try/catch` manual —
**sin pasar por `runProviderPipeline`**, y por tanto **sin heredar
`individualTimeoutMs`/`globalTimeoutMs`**. Un test explícito de timeout
(`"seoProvider respeta individualTimeoutMs"`) lo detectó de inmediato:
el proveedor lento no se cortaba nunca. Se corrigió reutilizando
`runProviderPipeline([seoProviderDef], {pages,...}, {individualTimeoutMs,
globalTimeoutMs})` como mini-pipeline de un solo proveedor, heredando
timeout/cancelación/mapeo de errores sin duplicar esa lógica. Test de
regresión añadido y en verde.

## Verificación ejecutada

```
$ npm test          → 970/970 tests (887 preexistentes + 83 nuevos), 0 fallos
$ npm run lint       → 4 errores + 1 warning, TODOS preexistentes (verificado por git log); 0 introducidos
                        (se corrigieron 2 errores de lint propios de este paso durante el desarrollo:
                        import sin usar y variable sin usar en seoAnalyzer.js, antes del commit final)
$ npm run build      → correcto, mismo aviso preexistente de chunk >500kB
$ grep secretos/tokens en archivos nuevos → sin coincidencias
$ find -type l (symlinks) → ninguno nuevo
$ auditoría de stubs restantes → los 11 stubs restantes (lighthouseProvider,
   performanceProvider, accessibilityProvider, socialProvider, schemaProvider,
   technologyProvider, securityHeadersProvider, dnsProvider, whoisProvider,
   speedProvider, aiContentProvider) siguen devolviendo status="not_implemented"
   con evidencia placeholder, verificado por el mismo test de Paso 14
   (plugins.test.mjs, actualizado solo en el conteo: 11 en vez de 12)
```

### Validación end-to-end (Fase 9)

1. **Offline puro** (`--local-file`/`--demo`): `research:seo` analiza
   HTML sin tocar `publicWebsiteFetcher` en absoluto — probado con la
   fixture `seo-basico-deficiente` y con un archivo HTML local ad hoc.
2. **Auditoría multiproveedor completa offline**: `runResearchAudit`
   con `pipeline:"multiprovider"` + registro inyectado — evidencia de
   ambos proveedores llega a `scores.categories.seo`.
3. **Red real contra `example.com`** (RFC 2606, 1 página) — ejecutada
   dos veces: una vía función (`runResearchAudit` directo) y otra vía
   CLI completo (`npm run research:seo -- ... --allow-network`). Ambas
   confirmaron `networkUsed:true`, evidencia real de ambos proveedores,
   score SEO calculado, `reports/seo.md` generado. El directorio de
   auditoría de la prueba CLI se eliminó tras la comprobación.
4. **Título duplicado / canonical contradictorio / noindex / encabezados
   incorrectos / imágenes sin alt / JSON-LD válido e inválido**: cada uno
   cubierto por un test unitario específico de `seoAnalyzer.test.mjs`.
5. **Datos no disponibles**: cabeceras HTTP ausentes (fixture sin
   `headers`) → `status:"unavailable"`, nunca se infiere.
6. **Conflicto entre evidencias**: dos páginas con señal positiva/
   negativa en la misma dimensión → `evidenceConflicts` (mecanismo de
   Paso 15, reutilizado sin cambios) lo detecta igual que con cualquier
   otra fuente.
7. **Timeout del proveedor SEO**: cubierto (ver bug encontrado arriba).
8. **Fallo aislado**: un `seoProvider` que lanza excepción se captura
   como `status:"failed"` sin romper la auditoría (mismo mecanismo de
   `runOneProvider`, Paso 14).
9. **Repetición idempotente**: verificado con escritura real a disco dos
   veces, `filesUpdated.length === 0` en la segunda, incluyendo
   `reports/seo.md`.
10. **Perfil club deportivo / clínica / restaurante**: cubiertos por
    tests con `profileId` explícito, confirmando pesos/reglas por sector.
11. **Informe JSON y Markdown**: `audit.json` (JSON completo) y
    `reports/seo.md` (Markdown dedicado) verificados con contenido real
    en la validación con red real.
12. **Red bloqueada por defecto**: sin `--allow-network`, `seoProvider`
    nunca recibe páginas (test explícito).

Todos los tests por defecto (`npm test`) son offline. La única llamada
de red real de esta sesión fue la validación manual explícita (puntos 3
y el ejemplo del CLI), contra un único dominio técnico reservado, sin
auditar ningún competidor ni negocio real.

## Alcance y honestidad

- **Fase 3.D (enlaces rotos)**: solo se declaran comprobados los que
  apuntan a otra página YA recopilada en el mismo lote — nunca se afirma
  sin verificación, tal como exige el enunciado.
- **Fase 3.E (peso de imágenes)**: siempre `"unavailable"` — no se
  descargan recursos de imagen (sería una segunda descarga fuera de
  `publicWebsiteFetcher`).
- **Fase 3.F (adecuación Schema.org)**: heurística preliminar,
  explícitamente declarada como no-oficial en cada hallazgo.
- **Fase 3.A (sitemap)**: solo se lee la directiva `Sitemap:` de
  robots.txt (ya descargado) — el sitemap.xml en sí nunca se descarga.
- **"Pesos por proveedor" en scoring** (heredado del límite ya declarado
  en Paso 15): con 2 proveedores reales, `publicWebsiteFetcher` (URLs) y
  `seoProvider` (análisis derivado de las MISMAS URLs) no compiten por la
  misma evidencia — siguen sin necesitar un multiplicador de confianza
  por proveedor; sigue siendo una pieza preparada, no activada.
- No se ejecutaron acciones irreversibles, ni merge, ni cambios directos
  sobre `main`, ni se tocó ningún otro worktree ni PR ajena.

## Tiempo

**Nota de honestidad**: sin acceso a timestamps de herramienta para una
medición formal de reloj real — mismo límite que en informes anteriores
de esta serie. Estimación de ingeniería basada en el volumen de trabajo:

| | |
|---|---|
| Estimación inicial del encargo | 2h 15min |
| Trabajo realizado | 13 fases completas: contrato del proveedor, 8 categorías de análisis SEO (~30 reglas concretas), evidencia, scoring (9 grupos), 10 perfiles + genérico, recomendaciones, CLI (1 comando nuevo + 6 flags), 1 bug real de timeout encontrado y corregido, validación E2E con red real (2 rutas distintas), 83 tests nuevos, 3 checkpoints locales, 7 documentos |
| Estimación real de tiempo de ingeniería | **~4-5 horas** — alcance comparable o mayor al de Paso 15 (13 fases también), con la complejidad añadida de escribir un analizador HTML nuevo desde cero (no reutilizable en su mayor parte de Paso 12) |
| Diferencia frente a la estimación inicial | La estimación de 2h 15min volvió a resultar corta para el alcance real pedido; se completó sin recortar fases ni tests, igual que en Paso 15 |
