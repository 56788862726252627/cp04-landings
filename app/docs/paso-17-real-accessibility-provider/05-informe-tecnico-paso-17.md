# 05 — Informe técnico del Paso 17

## Resumen

Convierte `accessibilityProvider` (stub desde Paso 14) en el tercer
proveedor real del sistema multiproveedor. Analiza determinísticamente
10 categorías de accesibilidad (documento, encabezados, imágenes/
multimedia, enlaces/botones, formularios, ARIA, tablas, teclado/foco,
contraste, contenido) sobre HTML ya recopilado en la MISMA ejecución —
nunca descarga nada, no usa navegador automatizado, no instala
Playwright. Cada hallazgo se mapea, cuando es razonable, a un criterio
WCAG 2.2 A/AA, y declara explícitamente si la comprobación es
automática, parcial o manual — **nunca se declara conformidad WCAG
total ni se sustituye una auditoría humana completa**.

## Precheck (Fase 1)

- Base confirmada: commit `09d722f` (Paso 16), branch
  `feature/real-seo-provider-20260723`.
- PRs previas confirmadas abiertas y sin tocar: #40, #41, #42 (base
  `main`, detectado en Paso 15, sin corregir por instrucción explícita),
  #43 (Paso 15), #44 (Paso 16) — todas con base correcta salvo #42.
- Baseline verificado antes de tocar nada: 970/970 tests, lint con 4
  errores + 1 warning preexistentes (no relacionados con este trabajo).
- Rama nueva desde `09d722f`: `feature/real-accessibility-provider-20260723`.
- Worktree aislado: `/root/cp04-t-real-accessibility-provider`.
- 2 checkpoints locales creados durante el desarrollo (tras completar
  Fases 1-7 y tras completar Fases 8-10), ninguno con push hasta el
  commit final consolidado.

## Arquitectura — generalización del patrón de Paso 16

El paso explícito que Paso 16 introdujo específicamente para
`seoProvider` (invocar un "proveedor derivado" fuera de la cadena
genérica, porque necesita `{pages}` en vez de `{urls}`) se **generalizó**
en una única función reutilizable,
`runDerivedPageAnalysisProvider(providerId, {...})`, que ahora sirve
tanto a `seoProvider` como a `accessibilityProvider` — sin duplicar la
lógica de timeout/cancelación/mapeo de estados. Esto deja el sistema
preparado para un cuarto proveedor derivado (p. ej. un futuro
`schemaProvider` real) sin tener que repetir el patrón por tercera vez.

## Verificación ejecutada

```
$ npm test          → 1063/1063 tests (970 preexistentes + 93 nuevos), 0 fallos
$ npm run lint       → 4 errores + 1 warning, TODOS preexistentes (verificados por git log); 0 introducidos
$ npm run build      → correcto, mismo aviso preexistente de chunk >500kB
$ grep secretos/tokens en archivos nuevos → sin coincidencias
$ find -type l (symlinks) → ninguno nuevo
$ auditoría de stubs restantes → los 10 stubs restantes (lighthouseProvider,
   performanceProvider, socialProvider, schemaProvider, technologyProvider,
   securityHeadersProvider, dnsProvider, whoisProvider, speedProvider,
   aiContentProvider) siguen devolviendo status="not_implemented" con
   evidencia placeholder (test actualizado solo en el conteo: 10 en vez de 11)
$ comprobación de no-certificación → test explícito en a11yAnalyzer.test.mjs
   y a11yRecommendations.test.mjs: ningún finding/recomendación usa
   "conformidad total"/"100% accesible"/"certificación"
```

### Validación end-to-end (Fase 9)

1. **Offline puro** (`--local-file`/`--demo`): `research:accessibility`
   analiza HTML sin tocar `publicWebsiteFetcher` en absoluto — probado
   con la fixture `accesibilidad-deficiente` y un archivo HTML local ad
   hoc.
2. **Auditoría multiproveedor completa offline**: `runResearchAudit` con
   los 3 proveedores reales inyectados — evidencia de los 3 llega a
   `scores.categories.accessibility`/`seo`.
3. **Red real contra `example.com`** (RFC 2606, 1 página, 3 proveedores
   reales simultáneos vía `--seo-only --accessibility-only`): confirmado
   `networkUsed:true`, evidencia real de los 3 proveedores, score de
   accesibilidad 44/100 con 6 revisiones manuales explícitas listadas.
   El directorio de auditoría generado se eliminó tras la comprobación.
4. **Casos específicos** (imagen sin alt, formulario sin label, botón sin
   nombre, aria-labelledby roto, encabezados incorrectos, tabla sin
   encabezados, tabindex positivo, contraste insuficiente calculable,
   comprobación no evaluable): cada uno cubierto por un test unitario
   dedicado en `a11yAnalyzer.test.mjs`.
5. **Timeout del proveedor de accesibilidad**: cubierto con un proveedor
   falso lento e `individualTimeoutMs` bajo — confirma que
   `runDerivedPageAnalysisProvider` hereda el timeout correctamente
   (mismo mecanismo corregido en Paso 16, ahora reutilizado, sin
   regresión).
6. **Fallo aislado**: capturado por `runOneProvider` (Paso 14) vía el
   mismo mini-pipeline — sin cambios necesarios.
7. **Repetición idempotente**: verificado con escritura real a disco dos
   veces, `filesUpdated.length === 0` en la segunda, incluyendo
   `reports/accessibility.md` en el manifiesto.
8. **Perfiles club deportivo / clínica**: cubiertos por tests con
   `profileId` explícito.
9. **Informe JSON y Markdown**: `audit.json` y `reports/accessibility.md`
   verificados con contenido real en la validación con red real.
10. **Deduplicación/conflicto de evidencias**: reutiliza el mecanismo de
    Paso 15 (`EvidenceAggregator`/`buildEvidenceConflictReport`) sin
    cambios; test explícito confirma que los `evidenceId` de los 3
    proveedores nunca se solapan.

Todos los tests por defecto (`npm test`) son offline. La única llamada de
red real de esta sesión fue la validación manual explícita (punto 3),
contra un único dominio técnico reservado, sin auditar ningún competidor
ni negocio real.

## Alcance y honestidad

- **Nunca se declara conformidad WCAG 2.2 total**: verificado por test
  explícito en 3 capas (findings, recomendaciones, informe con
  disclaimer obligatorio).
- **7 comprobaciones quedan SIEMPRE como revisión manual pendiente**
  (orden de lectura, encabezados por estilo, mensajes de error dinámicos,
  validación ARIA normativa completa, navegación por teclado real,
  dependencia exclusiva del color, subtítulos/transcripción reales) — ver
  documento 03.
- **Contraste**: solo se calcula sobre colores declarados de forma
  INLINE (`style="color:...;background-color:..."`) — colores en hojas
  de estilo externas o bloques `<style>` no son analizables sin
  descargarlas (fuera de alcance, evita una segunda descarga).
- **Validación ARIA**: lista curada de ~65 roles WAI-ARIA 1.2 conocidos,
  no un parser normativo exhaustivo de combinaciones rol/atributo
  permitidas — declarado explícitamente como límite.
- **"Pesos por proveedor" en scoring** (límite heredado de Paso 15/16):
  con 3 proveedores reales que analizan las MISMAS URLs desde ángulos
  distintos (SEO vs. accesibilidad), no compiten por la misma evidencia
  — sigue sin necesitar un multiplicador de confianza por proveedor.
- No se ejecutaron acciones irreversibles, ni merge, ni cambios directos
  sobre `main`, ni se tocó ningún otro worktree ni PR ajena.

## Tiempo

**Nota de honestidad**: sin acceso a timestamps de herramienta para una
medición formal de reloj real — mismo límite que en informes anteriores.
Estimación de ingeniería basada en el volumen de trabajo:

| | |
|---|---|
| Estimación inicial del encargo | 3h 30min |
| Trabajo realizado | 13 fases completas: contrato del proveedor, 10 categorías de análisis (~40 reglas concretas) con mapeo WCAG, cálculo real de contraste, evidencia, scoring (9 grupos), 10 perfiles + genérico, recomendaciones con distinción de revisión manual, CLI (1 comando nuevo + 7 flags), generalización del patrón de proveedor derivado de Paso 16, validación E2E con red real (3 proveedores simultáneos), 93 tests nuevos, 2 checkpoints locales, 6 documentos |
| Estimación real de tiempo de ingeniería | **~5-6 horas** — mayor que Paso 16 por el volumen de categorías (10 vs 8) y la necesidad de un cálculo matemático real nuevo (contraste WCAG) sin equivalente reutilizable de pasos anteriores |
| Diferencia frente a la estimación inicial | La estimación de 3h 30min volvió a resultar corta para el alcance real pedido; se completó sin recortar fases, tests ni el disclaimer legal obligatorio |
