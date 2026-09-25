# 05 — Informe técnico del Paso 18

## Resumen

Convierte `performanceProvider` (stub desde Paso 14) en el cuarto
proveedor real del sistema multiproveedor. Analiza determinísticamente
10 categorías de rendimiento (respuesta HTTP, documento HTML, recursos
declarados, imágenes, JavaScript, CSS, fuentes, caché/entrega, señales
móviles, métricas derivadas) sobre timing real + cabeceras + HTML ya
recopilados en la MISMA ejecución — nunca descarga nada adicional, no usa
navegador automatizado, no instala Playwright, no ejecuta JavaScript
remoto, no usa Lighthouse ni PageSpeed Insights ni ninguna API externa.
Cada hallazgo declara explícitamente su `measurementType`
(observado/medido/calculado/estimado/no-medido/no-disponible/requiere-
prueba-de-navegador) — **nunca se calculan ni declaran Core Web Vitals
(LCP/CLS/INP/FCP), nunca se presenta como una puntuación Lighthouse/
PageSpeed, y nunca sustituye una prueba de navegador real**.

## Precheck (Fase 1)

- Base confirmada: commit `c4629cb` (Paso 17), branch
  `feature/real-accessibility-provider-20260723`.
- PR previa confirmada abierta y sin tocar: #45 (Paso 17, base
  `feature/real-seo-provider-20260723`, mergeable); #40-44 también
  verificadas intactas en sesiones anteriores.
- Baseline **real** verificado post-hoc (`git archive c4629cb` + `npm
  test` en un checkout aislado, ver nota de corrección abajo):
  **1017/1017 tests**, lint con 4 errores + 1 warning preexistentes (no
  relacionados con este trabajo), build correcto.
- Rama nueva desde `c4629cb`: `feature/real-performance-provider-20260723`.
- Worktree aislado: `/root/cp04-t-real-performance-provider`.
- 1 checkpoint local creado durante el desarrollo (tras completar Fases
  2-8 + puente + flags CLI), sin push hasta el commit final consolidado.

## Nota de corrección de honestidad (auto-detectada)

El registro de progreso (`PROGRESS.md`) anotó inicialmente un baseline de
"1063/1063 tests" en la Fase 1 — cifra heredada por error del informe de
Paso 17 (que cerró con 1063 tests DESPUÉS de sus propios cambios, no
antes). Al calcular el recuento de tests nuevos de este paso para este
informe, se detectó la inconsistencia y se verificó el baseline real
ejecutando `npm test` contra un checkout aislado (`git archive`) del
commit base `c4629cb`: **1017/1017**, no 1063. El PROGRESS.md se corrigió
en el momento del hallazgo. El recuento de "tests nuevos" de este informe
usa el baseline verificado (1017), no el heredado por error.

## Arquitectura — timing real sin segunda petición

`publicWebsiteFetcher.js` (Paso 13) ya hacía UNA petición HTTP real por
página. Paso 18 añade cronometraje (`Date.now()` al iniciar la petición y
al recibir las cabeceras) y reexpone `httpVersion`, cabeceras adicionales
(whitelist ampliada) y el objeto `timing` en el resultado que YA
devolvía — **cero peticiones adicionales**, verificado por test explícito
contra un servidor HTTP local real con retardo artificial conocido
(`timeToHeadersMs >= 15ms` para un retardo de 20ms, con margen de
tolerancia). El resto de la arquitectura reutiliza sin cambios el patrón
`runDerivedPageAnalysisProvider` generalizado en Paso 17 — ahora sirve a
tres proveedores derivados (`seoProvider`, `accessibilityProvider`,
`performanceProvider`) sin duplicar lógica de timeout/cancelación.

## Verificación ejecutada

```
$ npm test          → 1101/1101 tests (1017 preexistentes + 84 nuevos), 0 fallos
$ npm run lint       → 4 errores + 1 warning, TODOS preexistentes (App.jsx/AuthContext.jsx/DemoSafeNotice.jsx/useTutorialOrchestrator.js); 0 introducidos
$ npm run build      → correcto, mismo aviso preexistente de chunk >500kB
$ grep secretos/tokens en archivos nuevos → sin coincidencias
$ find -type l (symlinks) → ninguno nuevo
$ auditoría de stubs restantes → los 9 stubs restantes (lighthouseProvider,
   socialProvider, schemaProvider, technologyProvider, securityHeadersProvider,
   dnsProvider, whoisProvider, speedProvider, aiContentProvider) siguen
   devolviendo status="not_implemented" con evidencia placeholder
   (plugins.test.mjs actualizado: 9 stubs / 4 reales, 13 proveedores totales)
$ comprobación de no-Core-Web-Vitals → test explícito en perfAnalyzer.test.mjs
   y performanceProviderPlugin.test.mjs: ningún finding/evidencia declara un
   valor numérico bajo LCP/CLS/INP/FCP; el único lugar donde aparecen esas
   siglas es el disclaimer que aclara que NO se miden
```

### Validación end-to-end (Fase 9)

1. **Offline puro** (`--local-file`/`--demo`): `research:performance`
   analiza HTML sin tocar `publicWebsiteFetcher` en absoluto — probado
   con la fixture `padel-web-anticuada` (score 44/100, 1 hallazgo
   crítico: sin meta viewport).
2. **Auditoría multiproveedor completa offline**: `runResearchAudit` con
   los 4 proveedores reales inyectados — evidencia de los 4 llega a
   `scores.categories.technicalQuality` (dimensión `performance`).
3. **Red real contra `example.com`** (RFC 2606, 1 página, vía
   `research:performance --url --allow-network --mode=public-web`):
   confirmado `networkUsed:true`, evidencia real medida (timing real:
   respuesta rápida, HTTP/1.1, sin Cache-Control), score de rendimiento
   51/100, 1 métrica `not_measured` (compresión) y 1
   `browser_test_required` (CSS no utilizado) listadas explícitamente por
   `--show-unmeasured`. El directorio de auditoría generado
   (`example-test`) se eliminó tras la comprobación.
4. **Casos específicos** (sin meta viewport, imagen sin dimensiones,
   HTTP sin cifrar, sin Cache-Control, scripts/CSS bloqueantes, CDN
   detectado solo por cabecera pública, dominios de terceros, documento
   mal formado): cada uno cubierto por un test unitario dedicado en
   `perfAnalyzer.test.mjs`.
5. **Timeout del proveedor de rendimiento**: cubierto con un proveedor
   falso lento e `individualTimeoutMs` bajo — confirma que
   `runDerivedPageAnalysisProvider` hereda el timeout correctamente (Paso
   18 solo añade un tercer consumidor del mismo mecanismo, sin
   modificarlo).
6. **Fallo aislado**: cubierto por un test que pasa una página sin
   `body` — `performanceProviderPlugin.collect()` captura el error y
   devuelve `status: "failed"` de forma controlada, nunca lanza.
7. **Repetición idempotente**: verificado con escritura real a disco dos
   veces, `filesUpdated.length === 0` en la segunda, incluyendo
   `reports/performance.md` en el manifiesto — el `timing` real de la
   entrada se fija en los tests (mismo principio que fijar datos de
   entrada, no el reloj del sistema).
8. **Perfil clínica**: cubierto por un test con `profileId` explícito,
   confirma `groupsTotal === 11` y `profileId` propagado a la evidencia.
9. **Informe JSON y Markdown**: `audit.json` y `reports/performance.md`
   verificados con contenido real en la validación con red real.
10. **Deduplicación/conflicto de evidencias**: reutiliza el mecanismo de
    Paso 15 (`EvidenceAggregator`) sin cambios; test explícito confirma
    que los `evidenceId` de los 4 proveedores nunca se solapan.
11. **Los 4 proveedores reales simultáneos**: test dedicado
    (`orchestratorProviderBridge.test.mjs` y
    `auditOrchestrator.performance.test.mjs`) confirma evidencia
    diferenciada, deduplicada, con procedencia preservada, y que la
    categoría `technicalQuality` del scoring general recibe datos.

Todos los tests por defecto (`npm test`) son offline. La única llamada de
red real de esta sesión fue la validación manual explícita (punto 3),
contra un único dominio técnico reservado, sin auditar ningún competidor
ni negocio real.

## Alcance y honestidad

- **Nunca se declaran Core Web Vitals**: verificado por test explícito en
  3 capas (findings de `perfAnalyzer.js`, evidencia/metadata de
  `performanceProviderPlugin.js`, disclaimer obligatorio en
  `perfScoring.js`/`reports/performance.md`) — la única mención de
  LCP/CLS/INP/FCP en toda la salida es dentro de la frase que aclara que
  NO se miden.
- **6 métricas quedan SIEMPRE fuera de alcance** (Core Web Vitals,
  compresión real, peso real de recursos, coste de ejecución JS, CSS no
  utilizado, filmstrip/Speed Index) — ver documento 03.
- **Timing real, con límite declarado**: `timeToHeadersMs`/`totalMs` son
  reales (cronometrados por Node), pero cada finding correspondiente
  incluye la limitación explícita de que no equivalen al TTFB de un
  navegador real.
- **Compresión**: `publicWebsiteFetcher` sigue pidiendo
  `Accept-Encoding: identity` (decisión de seguridad de Paso 13, NO
  tocada) — la compresión se reporta siempre `not_measured`, nunca se
  infiere.
- **CDN**: solo se declara `observed` si una cabecera pública whitelisted
  (`cf-ray`/`x-cache`/`x-served-by`/`via`) está literalmente presente —
  nunca se infiere de otro modo.
- **"Pesos por proveedor" en scoring** (límite heredado de Paso 15/16/17):
  con 4 proveedores reales que analizan las MISMAS URLs desde ángulos
  distintos, no compiten por la misma evidencia — sigue sin necesitar un
  multiplicador de confianza por proveedor.
- No se ejecutaron acciones irreversibles, ni merge, ni cambios directos
  sobre `main`, ni se tocó ningún otro worktree ni PR ajena.

## Tiempo

**Nota de honestidad**: sin acceso a timestamps de herramienta para una
medición formal de reloj real — mismo límite que en informes anteriores.
Estimación de ingeniería basada en el volumen de trabajo:

| | |
|---|---|
| Estimación inicial del encargo | 4h 30min |
| Trabajo realizado | 13 fases completas: contrato del proveedor, timing real en publicWebsiteFetcher (sin segunda petición), 10 categorías de análisis (~45 reglas concretas) con measurementType explícito, evidencia, scoring (11 grupos, con mapeo regla→grupo explícito para compresión/terceros), 10 perfiles + genérico, recomendaciones con 7 severidades, CLI (1 comando nuevo + 6 flags/opciones), reutilización sin cambios del patrón de proveedor derivado, validación E2E con red real (4 proveedores simultáneos), 84 tests nuevos, 1 checkpoint local, 6 documentos, corrección de honestidad del baseline detectada y resuelta en el propio informe |
| Estimación real de tiempo de ingeniería | **~5-6 horas** — similar a Paso 17, algo mayor por el trabajo adicional en `publicWebsiteFetcher.js` (timing real con servidor HTTP local de prueba) y la reconciliación entre 10 categorías de análisis y 11 grupos de scoring |
| Diferencia frente a la estimación inicial | La estimación de 4h 30min resultó razonablemente ajustada al alcance real pedido; se completó sin recortar fases, tests ni el disclaimer técnico obligatorio |
