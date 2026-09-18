# Acciones Manuales Pendientes — Agencia IA

**Fecha:** 2026-07-31  
**Prioridad:** P0 (bloqueante para producción) / P1 (importante) / P2 (mejora)

---

## P0 — Bloqueante para activar servicios reales

### MA-01: Activar Stripe
1. Crear cuenta en stripe.com (o usar cuenta existente)
2. Obtener `STRIPE_SECRET_KEY` (producción: `sk_live_...` / sandbox: `sk_test_...`)
3. Añadir a Worker secrets: `wrangler secret put STRIPE_SECRET_KEY`
4. Activar en la app: cambiar `PAYMENTS_DISABLED=false` o eliminar el flag
5. Probar con un pago de prueba en sandbox
6. **Verificar**: `npm run agency:status -- --scope=production` debe mostrar Stripe en SANDBOX o PRODUCTION

### MA-02: Activar WhatsApp Business
1. Acceder a Meta Business Manager (business.facebook.com)
2. Crear app de tipo Business, añadir producto WhatsApp
3. Aprobar plantillas de mensaje (proceso 1-7 días hábiles)
4. Obtener: `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
5. Añadir a Worker secrets: `wrangler secret put WHATSAPP_ACCESS_TOKEN`
6. Probar envío con número de test

### MA-03: Configurar webhook Make para la agencia
1. Crear escenario Make que reciba POST JSON (usar módulo Webhook)
2. Copiar la URL del webhook de Make (ej. `https://hook.eu1.make.com/xxxx`)
3. Añadir al entorno: `MAKE_WEBHOOK_URL=https://hook.eu1.make.com/xxxx`
4. Probar: `npm run agency:status -- --webhook-simulate --webhook-destination=<URL>`
5. Cuando esté listo para envío real: implementar `fetchImpl` real en agencyWebhookAdapter

### MA-04: Conectar Google Drive al pipeline de la agencia
1. Usar las credenciales ya configuradas en `.secrets/` (OAuth funcionando localmente)
2. Para producción: crear una Service Account en Google Cloud Console
3. Descargar JSON de la Service Account
4. Añadir a Worker secrets o a la configuración del servidor donde corre la agencia
5. Actualizar `driveAdapter.js` para usar Service Account en producción

---

## P1 — Importante

### MA-05: Completar escenarios Make de CP04 (36/50 pendientes)
- Los 36 escenarios inactivos están documentados en `audit/make-master-audit-20260710/`
- Activar por prioridad: escenarios de notificación → confirmación → recordatorio

### MA-06: Desplegar frontend en dominio propio
1. Build: `npm run build`
2. Desplegar en Cloudflare Pages (recomendado: misma cuenta que el Worker)
3. Configurar variables de entorno en CF Pages (VITE_WORKER_URL, etc.)
4. Verificar CORS en el Worker con el nuevo dominio
5. Activar CP04_ENFORCE_ROLE_GATES en producción

### MA-07: Tests E2E visuales
- Instalar Playwright + Chromium: `npx playwright install chromium`
- Ejecutar: `npx playwright test`
- El entorno actual (PRoot/Android) no tiene Chromium disponible
- Alternativa: usar GitHub Actions o un entorno Linux con display

### MA-08: Supabase — corregir role gate SUPPORT→PLAYER
- Verificado en código: la lógica es correcta
- La causa probable es `user_metadata` vs `app_metadata` en el token
- Acción: ejecutar script de remediación con `--apply` (ver `scripts/support-role-remediation/`)

---

## P2 — Mejoras

### MA-09: Consolidar la lógica de redacción de secretos
- `agencyService.js` y `agencyWebhookAdapter.js` tienen su propia implementación de redact
- `scripts/observability/redactor.mjs` tiene la versión más completa del proyecto
- Consideración: extraer a un módulo compartido en `src/saas-core/security/`

### MA-10: Autenticación en la API local (agency:api)
- La API local solo escucha en 127.0.0.1 (segura para uso personal)
- Si se expone en red LAN o en un servidor: añadir Bearer token simple
- Patrón sugerido: variable de entorno `AGENCY_API_TOKEN` verificada en el handler

### MA-11: Archivar archivo temporal `repro-e2e-tmp.mjs`
- Archivo de diagnóstico de un E2E anterior, no forma parte del producto
- Acción: mover a `audit/` o borrar antes del commit definitivo

### MA-12: Borrar backup suelto en src/
- `src/App.jsx.before-demo-realista-*.backup` — no necesario en el repo
- Acción: `git rm --cached src/App.jsx.before-demo-realista-*.backup` si está trackeado, o simplemente borrar

---

## Resumen de prioridades

| ID | Servicio | Prioridad | Tiempo estimado |
|----|---------|-----------|-----------------|
| MA-01 | Stripe | P0 | 2-4 horas |
| MA-02 | WhatsApp | P0 | 1-7 días (aprobación Meta) |
| MA-03 | Make webhook | P0 | 1-2 horas |
| MA-04 | Google Drive | P0 | 2-3 horas |
| MA-05 | Make escenarios | P1 | 2-4 días |
| MA-06 | Frontend deploy | P1 | 4-8 horas |
| MA-07 | Tests E2E | P1 | 1-2 horas |
| MA-08 | Supabase roles | P1 | 1-2 horas |
| MA-09 | Refactor redact | P2 | 1 hora |
| MA-10 | API auth | P2 | 1-2 horas |
| MA-11 | Limpiar tmp | P2 | 5 min |
| MA-12 | Borrar backup | P2 | 5 min |
