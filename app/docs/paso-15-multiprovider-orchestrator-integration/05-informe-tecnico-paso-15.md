# 05 — Informe técnico del Paso 15

## Resumen

Paso 15 conecta la fábrica multiproveedor de Paso 14 (`ProviderRegistry` +
`ProviderPipeline`, 12 stubs + 1 proveedor real) con el motor de auditoría
de Paso 12/13 (`auditOrchestrator.js`, `scoringEngine.js`,
`dimensionRegistry.js`, `auditReportGenerator.js`), de forma opt-in
(`pipeline: "multiprovider"`, por defecto `"legacy"`). Añade perfiles
sectoriales (10 + genérico), política de ejecución configurable (modo,
concurrencia, timeouts, prioridad, circuit breaker, health gate),
agregación de evidencia con atribución de proveedor y detección de
conflictos, desglose de scoring por proveedor, y CLI extendido (2
comandos nuevos + flags en los existentes).

## Precheck (Fase 1)

- Base confirmada: commit `7e4ce42` (Paso 14), branch
  `feature/multiprovider-factory-architecture-20260722`.
- PRs previas confirmadas abiertas y sin tocar: #40 (Paso 12, base
  `feature/natural-language-business-builder-20260721`), #41 (Paso 13,
  base `feature/public-research-digital-audit-20260721`), #42 (Paso 14,
  base `main` — nota: no `feature/real-public-website-provider-20260722`
  como cabría esperar por el encadenado; se detectó pero NO se modificó,
  ver limitaciones).
- Nota sobre el hash de Paso 13 citado en el encargo: el commit real es
  `fc57e62` (el encargo decía `cf57e62`, probable error tipográfico
  c/f); verificado contra `git log`, sin impacto en el trabajo.
- Baseline verificado ANTES de tocar nada: 812/812 tests, lint con 4
  errores + 1 warning preexistentes (ninguno en código de este paso —
  `App.jsx` ×2, `AuthContext.jsx`, `DemoSafeNotice.jsx`,
  `useTutorialOrchestrator.js`, confirmados anteriores a este branch por
  `git log`), build correcto.
- Rama nueva creada desde `7e4ce42`:
  `feature/multiprovider-orchestrator-integration-20260722`.
- Worktree aislado: `/root/cp04-t-orchestrator-integration` (no se tocó
  ningún otro worktree existente).
- Sin secretos, sin archivos grandes, sin symlinks en el trabajo nuevo
  (verificado por grep/`stat`/`find -type l` sobre los archivos creados).

## Bug real encontrado y corregido durante la implementación

Diseño inicial: resolver la cadena de proveedores con
`registry.resolveFallbackChain("*")`. Al probar `research:providers
--plan` con perfiles reales se detectó que **solo aparecía
`publicWebsiteFetcher`** — ningún stub recomendado por un perfil
(p. ej. `seoProvider` para `hotel`) aparecía nunca, porque
`resolveFallbackChain(dimension)` compara la dimensión LITERAL "*", y
los stubs declaran dimensiones concretas (`"seoTechnical"`, etc.), nunca
`"*"`. Se corrigió usando `registry.list({ onlyEnabled: true })` como
cadena (todos los habilitados, por prioridad) — "recomendado" en un
perfil se traduce en prioridad más alta, "excluido" sigue siendo bloqueo
duro. Test de regresión añadido. Este hallazgo es la prueba de que la
validación E2E (Fase 9) no fue solo automática: se ejecutó manualmente
antes de darlo por bueno.

## Verificación ejecutada

```
$ npm test          → 887/887 tests (812 preexistentes + 75 nuevos), 0 fallos
$ npm run lint       → 4 errores + 1 warning, TODOS preexistentes (verificado por git log
                        que ninguno está en archivos tocados por este paso); 0 introducidos
$ npm run build      → build correcto, mismo aviso preexistente de chunk >500kB
$ grep secretos/tokens en archivos nuevos → sin coincidencias
$ find -type l (symlinks) en archivos nuevos → ninguno
$ stat (archivos >200KB) en archivos nuevos → ninguno
```

### Validación end-to-end real (Fase 9)

1. **Offline** — `research:audit --demo=padel-web-anticuada
   --pipeline=multiprovider`: evidencia y scores idénticos en forma a
   legacy, 0 proveedores intentados (sin URLs en la fixture).
2. **Multiprovider con fixtures** — cubierto por test automatizado
   (`auditOrchestrator.multiprovider.test.mjs`).
3. **`public-web` contra un dominio técnico reservado, con red
   disponible** — ejecutado de verdad contra `https://example.com/`
   (RFC 2606, dominio reservado para documentación/pruebas), 1 página,
   `--allow-network` real: `networkUsed: true`, 20 evidencias reales
   recolectadas, `publicWebsiteFetcher` → `status: "available"`, score
   global calculado (32/100, "débil", coherente con una página mínima de
   ejemplo). `reports/providers.md` y `audit.json` verificados con
   contenido real. Sin auditar ningún competidor ni negocio real.
4. **`--dry-run`** — cubierto por test automatizado: nunca red real
   aunque se combine con `pipeline=multiprovider --allow-network`.
5. **Idempotencia (repetición)** — test automatizado: segunda ejecución
   sobre el mismo request en modo multiproveedor produce 0 archivos
   creados/actualizados (el `durationMs` por proveedor se excluye del
   hash, igual que `generatedAt`).
6. **Caída simulada de proveedor** — test automatizado: proveedor real
   inyectado con `status:"failed"`; la auditoría completa igualmente,
   `networkUsed:true` (se intentó), evidencia cae a "unavailable",
   `orchestratorStatus:"failed"` en el resumen.
7. **Timeout simulado** — test automatizado: proveedor con `delayMs:200`
   e `individualTimeoutMs:20` → `orchestratorStatus:"timed_out"`, sin
   bloquear la auditoría.
8. **Conflicto de evidencias** — test automatizado: dos URLs, un mismo
   proveedor real (inyectado) devuelve evidencia positiva y negativa para
   `trustSignals` → `evidenceConflicts` no vacío, con la dimensión
   correcta.
9. **Selección de perfil sectorial** — test automatizado (`--profile`) +
   manual (`research:providers --plan --profile=hotel` /
   `--profile=abogado`, confirmando prioridad y exclusiones correctas).
10. **Informe JSON y Markdown** — verificado manualmente sobre la
    ejecución real (punto 3): `audit.json` y las 10 (legacy) + 1
    (`reports/providers.md`, solo multiproveedor) páginas Markdown se
    generan correctamente.

Todos los tests por defecto (`npm test`) son offline — cero dependencia
de red; la única llamada de red real de esta sesión fue la validación
manual explícita del punto 3, descartada (directorio temporal eliminado
tras la comprobación, nada quedó persistido en el repo).

## Alcance y honestidad

- **Pesos por proveedor** (Fase 5) se implementaron como prioridad de
  intento (orden de ejecución), no como multiplicador de confianza en el
  scoring — con un único proveedor real hoy, un multiplicador de
  confianza por proveedor no tendría efecto observable. `providerScoreBreakdown`
  deja la pieza lista para cuando haya un segundo proveedor real.
- **Consentimiento** (`consentRequired`/`consentNote` en los perfiles) es
  hoy informativo (expuesto en CLI/informes), no una puerta técnica que
  bloquee la ejecución — no existe un campo de consentimiento en
  `researchRequestSchema.js`. Documentado como límite explícito.
- **`hotel`** no tiene preset de auditoría 1:1 en Paso 12 (no es uno de
  los 10 sectores de Paso 11); usa el preset genérico como base con pesos
  propios — no se modificó el lexicón de sectores de Paso 11 para
  evitarlo (fuera de alcance de este paso).
- El PR de Paso 14 (#42) tiene como base `main` en vez de la rama de
  Paso 13, detectado durante el precheck (Fase 1) — **no se modificó**
  (conservar PRs anteriores intactos era instrucción explícita); se deja
  constancia aquí para que se corrija conscientemente si procede.
- No se ejecutaron acciones irreversibles, ni merge, ni cambios directos
  sobre `main`, ni se tocó ningún otro worktree.

## Tiempo

**Nota de honestidad**: no hay acceso a un cronómetro de sesión con
timestamps de herramienta; durante esta sesión el reloj del sistema
avanzó de 2026-07-22 a 2026-07-23 (cruce de medianoche confirmado por el
entorno), lo que indica una sesión larga en tiempo de reloj real, no solo
en cómputo. La estimación de abajo es de ingeniería, no una medición
formal.

| | |
|---|---|
| Estimación inicial del encargo | 2h 15min |
| Trabajo realizado | 13 fases completas: puente orchestrator↔registry, política de ejecución, circuit breaker, agregación de evidencia con conflictos, scoring multiproveedor, 10 perfiles sectoriales + genérico, 2 comandos CLI nuevos + flags en 2 existentes, 1 bug real encontrado y corregido tras validación manual, 1 validación E2E con red real, 75 tests nuevos, 6 documentos |
| Estimación real de tiempo de ingeniería | **~4-5 horas** — orden de magnitud mayor que Paso 13/14 individualmente (cada uno ~1 sesión extensa), coherente con integrar 13 fases en un solo paso en vez de dividirlas |
| Diferencia frente a la estimación inicial | La estimación de 2h 15min resultó corta para el alcance real pedido (13 fases con requisitos de test exhaustivos); el trabajo se completó igualmente sin recortar alcance ni tests |
