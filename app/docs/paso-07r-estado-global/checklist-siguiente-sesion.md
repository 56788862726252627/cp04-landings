# Checklist para retomar el proyecto (Paso 07R)

Usar esta checklist al iniciar la siguiente sesión de trabajo sobre este bloque.

- [ ] **Comprobar Airtable:** ¿ha renovado cuota? Sondeo de solo lectura, confirmar que no responde 429 / `PUBLIC_API_BILLING_LIMIT_EXCEEDED`.
- [ ] **Comprobar git/PR:**
  - `cd /root/cp04-t-frontend-fixes && git status -sb` (debe estar limpio).
  - `git branch --show-current` → `frontend/audit-fixes-20260709`.
  - `git log --oneline -5` → confirmar que el HEAD sigue siendo el último commit conocido (`731df78` en el momento de este checkpoint, o posterior si hubo más pasos).
  - `gh pr view 36 --json number,state,isDraft,mergeable,baseRefName,headRefName,url` → confirmar OPEN / draft / MERGEABLE, base/head sin cambios.
- [ ] **Abrir `localhost:5175`** en Terminal 1 y confirmar que responde (`curl -s -o /dev/null -w "%{http_code}" http://localhost:5175/` → `200`).
- [ ] **Abrir el runbook del Paso 07Q:**
  - `app/docs/paso-07q-pruebas-post-airtable-429/runbook-pruebas-reales-post-airtable.md`
  - `app/docs/paso-07q-pruebas-post-airtable-429/checklist-ejecucion-rapida.md`
- [ ] **Ejecutar las pruebas en el orden documentado** (sección B del runbook, 18 pruebas) — solo si Airtable confirmó no dar 429 en el sondeo previo.
- [ ] **Parar de inmediato** ante cualquier criterio de parada (429, 401/403, duplicados, envío real no deseado) — no reintentar, documentar y avisar al propietario.
- [ ] **Registrar los resultados** reales (IDs de ejecución de Make, capturas de Airtable, respuestas del Worker) en un nuevo documento (siguiente numeración, p. ej. Paso 07S).
- [ ] **Decidir si PR #36 puede pasar de draft a revisión** — **NO hacerlo automáticamente ni en este checkpoint.** Esta decisión requiere: (a) evidencia real de que las pruebas del runbook 07Q pasaron, y (b) autorización explícita del propietario del proyecto. Si ambas condiciones no se cumplen, PR #36 permanece en draft.
