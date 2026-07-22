# Paso 10 · Fase 3 — Orquestador de generación

Código: `app/src/saas-core/factory/orchestrator.js`. Tests:
`orchestrator.test.mjs` (10 tests, todos con directorios temporales
aislados del repositorio).

## Diagrama textual del pipeline

```
Business Blueprint
   │
   ▼ validateBusinessBlueprint()               → BlueprintValidationError si falla
Validación
   │
   ▼ blueprintToTenantConfig()                 → reutiliza templates/presets/tenantSchema
Tenant
   │
   ▼ (terminología ya resuelta arriba; findLeakedSportsTerms() alimenta riesgos)
Terminología
   │
   ▼ resolveBrandTokens() + buildPendingAssetsManifest()
Branding
   │
   ▼ tenantConfig.modulesEnabled (+ modulesDiscarded si el blueprint override)
Módulos
   │
   ▼ buildNavigationPreview()                  → moduleRegistry.buildSidebarNavigation()
Navegación
   │
   ▼ tenantConfig.roles / permissions (ya derivados por Paso 09)
Roles y permisos
   │
   ▼ generateDemoDataset() + checkDatasetReferentialIntegrity()
Datos demo                                     → BusinessFactoryError si inconsistente
   │
   ▼ buildLandingConfig() + renderLandingHtml()
Landing
   │
   ▼ buildPwaConfig()
Configuración PWA
   │
   ▼ buildReadme/buildQuickGuide/buildOnboarding/buildTechnicalChecklist/buildCommercialChecklist
Documentación
   │
   ▼ planFiles() (create/update/preserve/collision) → CollisionError si !force
   ▼ escritura atómica (solo si !dryRun)
   ▼ buildReportData() + renderReportMarkdown/Json()
Informe
   │
   ▼ escaneo de secretos en cada archivo generado + reconfirmación de tenant/dataset
Validaciones finales
```

## Idempotencia

Cada archivo generado se hashea (SHA-256) y se registra en
`.factory-manifest.json` dentro del directorio del negocio. En la siguiente
ejecución:

1. Si el archivo no existe → se crea.
2. Si existe pero no está en el manifest → **colisión** (posible archivo
   manual): se aborta sin escribir nada, salvo `--force`.
3. Si existe y está en el manifest pero el hash en disco no coincide con el
   último hash generado → **colisión** (edición manual detectada sobre un
   archivo "generado"): mismo tratamiento que el caso 2.
4. Si existe, está en el manifest y el hash coincide, y el contenido nuevo
   es idéntico al actual → se preserva sin tocar (`filesPreserved`).
5. Si existe, está en el manifest, el hash coincide, pero el contenido
   nuevo difiere (el blueprint cambió) → se actualiza (`filesUpdated`).

`result.idempotent` es `true` solo si una ejecución no creó ni actualizó
ningún archivo — verificado en el test "una segunda ejecución idéntica es
idempotente" y en la ejecución real de la Fase 12 (ver
`07-prueba-clinica-dental.md`).

`report.md`/`report.json` son la única excepción deliberada: su contenido
incluye timestamp/duración y por tanto cambia en cada ejecución no-dryRun,
pero SÍ pasan por la misma comprobación de colisión (no pisan un
`report.md` manual preexistente) y quedan registrados en el manifest.

## Dry-run

`dryRun: true` calcula el plan completo (incluida la lectura de archivos
existentes para diffear) pero no escribe nada — ni siquiera crea el
directorio del negocio. Usado por `business:create` (paso 2/3, antes de
escribir) y por `business:diff`.

## Rollback lógico

No hay una función de "deshacer" automática en este paso: el rollback es
**lógico**, vía el propio `.factory-manifest.json` (qué se generó, con qué
hash, cuándo) y los campos `filesCreated/filesUpdated/filesPreserved` del
resultado — suficiente para que un humano revierta con `git` o borrando el
directorio del negocio, sin necesidad de adivinar qué cambió.

## Trazabilidad y modo verbose

`verbose: true` imprime cada etapa del pipeline por `console.log` (prefijo
`[factory]`) en el orden exacto del diagrama de arriba — usado para
depuración, no para producción.

## Errores tipados

`BusinessFactoryError` (base), `BlueprintValidationError` (con
`.errors[]`), `CollisionError` (con `.collisions[]`). El CLI (Fase 11)
distingue estos tipos para imprimir mensajes limpios sin stack trace y
fijar `process.exitCode = 1`.

## Qué nunca hace este orquestador

- No escribe fuera de `businesses/<businessId>/`.
- No llama a ningún proveedor externo (Airtable/Make/Stripe/...).
- No modifica `tenants/demo/` (espacio de Paso 09) ni ningún archivo del
  núcleo (`templates.js`, `presets.js`, `tenantSchema.js`, etc.).
