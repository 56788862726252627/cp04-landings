# Plan de Commits — Agencia IA (SIN EJECUTAR)

**Estrategia:** commits semánticos por capa, en orden cronológico de desarrollo.  
**Rama base:** docs/resultado-merge-pr52-66-20260727  
**Destino PR:** main

---

## Orden recomendado de commits

### Commit 1 — Fundamentos de entrega (deliverables)
```
feat(deliverables): añade packaging, folderStructure y driveAdapter mejorados

- folderStructure.js/.test: organización de carpetas por tipo de entregable
- index.js/.test: punto de entrada unificado de deliverables
- packaging/exportPackageManager.js/.test: gestor de paquetes de exportación
- packaging/packageZip.js/.test: empaquetado ZIP de artefactos
- driveAdapter.js: adaptador Google Drive (OAuth, scope drive.file)
- driveSyncManager.js/.test: sincronización con Drive
- e2eFullChain.test.mjs: cadena completa de entrega
```
**Archivos**: `src/saas-core/deliverables/**`

### Commit 2 — Templates y presets ampliados
```
feat(templates): añade sectores veterinary, law y beauty al catálogo de presets
```
**Archivos**: `src/saas-core/templates/presets.js`, `templates.test.mjs`

### Commit 3 — Auth y UI
```
fix(auth): separa AuthContext en módulos independientes y añade useAuth hook

- authContextInstance.js: instancia singleton del contexto
- useAuth.js: hook de acceso al contexto
- AuthContext.jsx: refactorizado para soportar login demo vs real
- DemoSafeNotice.jsx: banner de modo demo
- App.jsx: corrección de efecto de autoguardado en Torneos y lint
```
**Archivos**: `src/auth/**`, `src/components/demo/**`, `src/App.jsx`

### Commit 4 — Adaptador Airtable real
```
feat(commercial): adaptador Airtable real con batching, caché y backoff

Crea airtableAdapter.js para uso de la agencia (distinto del mock de Make).
```
**Archivos**: `src/saas-core/commercial/airtableAdapter.js/.test.mjs`

### Commit 5 — integrationReadiness mejorado
```
feat(commercial): integrationReadiness con soporte completo P3/7
```
**Archivos**: `src/saas-core/commercial/integrationReadiness.js/.test.mjs`

### Commit 6 — Estado operativo P4/7
```
feat(agency): estado operativo per-negocio (business:status, buildBusinessStatusReport)

Prompt Agencia IA 4/7.
```
**Archivos**:
- `src/saas-core/factory/businessStatusReport.js/.test.mjs`
- `factory-cli/business-status.mjs`
- `factory-cli/lib/businessCli.mjs` (parcial)
- `factory-cli/lib/businessCli.test.mjs` (parcial)

### Commit 7 — Dashboard de agencia P5/7
```
feat(agency): dashboard agregado multi-negocio (agency:status, buildAgencyStatusReport)

Prompt Agencia IA 5/7. Reutiliza buildBusinessStatusReport en un bucle.
```
**Archivos**:
- `src/saas-core/factory/agencyStatusReport.js/.test.mjs`
- `factory-cli/agency-status.mjs` (versión base)
- `factory-cli/lib/businessCli.mjs` (+loadAllGeneratedBusinessStatusInputs)
- `factory-cli/lib/businessCli.test.mjs` (+3 tests)
- `package.json` (+agency:status)

### Commit 8 — API interna y webhook P6/7
```
feat(agency): API REST local, service layer y webhook adapter (Prompt 6/7)

- agencyService.js: validación, filtros, seguridad (path traversal, redacción)
- agencyWebhookAdapter.js: simulación webhook, idempotencyKey, dry-run permanente
- agencyApiRouter.mjs: 5 endpoints REST localhost-only
- agency-api.mjs: CLI npm run agency:api
- agency-status.mjs: +filtros --sector, --classification, --webhook-simulate
- package.json: +agency:api
```
**Archivos**: `factory-cli/agency*.mjs`, `src/saas-core/factory/agency*.js`

### Commit 9 — Captura de pantalla y deliverables binarios
```
feat(deliverables): adaptadores de captura y deliverables binarios
```
**Archivos**: `src/saas-core/deliverables/capture/**`

### Commit 10 — Documentación de la serie
```
docs(agency): documentación completa series P3/7–P7/7 y checkpoint final

Incluye:
- docs/paso-21/ a docs/paso-24/
- docs/cierre-agencia-ia-7-7/ (checkpoint final, readiness, plan de commits, acciones manuales)
```
**Archivos**: `docs/**`

---

## Archivos a NO commitear (por .gitignore o por diseño)

- `audit/` — en .gitignore, no committeable sin --force
- `.secrets/` — en .gitignore, nunca commitear
- `.env` — en .gitignore, nunca commitear
- `repro-e2e-tmp.mjs` — archivo temporal, evaluar borrar antes del commit
- `backups/` — archivos de backup históricos, no necesarios en git
- `src/App.jsx.before-demo-realista-*.backup` — archivo de backup suelto, borrar

---

## PR sugerido

**Título**: `feat(agency-ia): serie completa 7 prompts — fábrica SaaS + agencia + API + cierre`

**Base**: main  
**Head**: docs/resultado-merge-pr52-66-20260727

**Descripción**: ver `docs/cierre-agencia-ia-7-7/CHECKPOINT-FINAL.md`

---

## Notas importantes

1. Verificar que `npm test` (suite completa en bloques) pasa al 100% justo antes del PR
2. Hacer `git pull --rebase origin main` antes de crear la PR si main tiene commits nuevos
3. No usar `git push --force` — crear PR nueva si hay conflictos
4. Revisar que no hay secretos accidentalmente en ningún diff antes de hacer push
