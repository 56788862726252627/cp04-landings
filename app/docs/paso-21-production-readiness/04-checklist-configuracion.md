# 04 — Checklist de configuración

## Frontend

- [x] `.env.example` completo, con separación clara pública/backend-only.
- [ ] **Depende de decisión editorial**: rellenar `VITE_CP04_PUBLIC_CONTACT_EMAIL`/`VITE_CP04_PUBLIC_CONTACT_PHONE`/`VITE_CP04_PUBLIC_SEO_AREA` con datos reales aprobados.
- [ ] **Depende del dominio**: actualizar `VITE_CP04_PUBLIC_SITE_URL` al dominio real.
- [ ] **Depende de contenido real**: rellenar las URLs de galería (`VITE_CP04_PUBLIC_GALLERY_*`) cuando existan fotos reales del club.
- [x] `VITE_CP04_AUTH_MODE=production` por defecto, con downgrade automático fail-closed documentado (un valor `"demo"` mal puesto nunca se activa en build de producción).

## Backend (Worker)

- [x] `ALLOWED_ORIGIN` configurado con allowlist explícita.
- [x] `AIRTABLE_BASE_ID`/`AIRTABLE_TABLE_ID` configurados (valores no sensibles).
- [x] `CP04_ENFORCE_ROLE_GATES=true` activo.
- [ ] **Depende de credenciales reales**: `AIRTABLE_TOKEN` (secreto, vía `wrangler secret put`, nunca en `wrangler.toml`).
- [ ] **Depende de credenciales reales**: `MAKE_RESERVAS_WEBHOOK` (secreto).
- [ ] **Depende de credenciales reales**: `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` (Paso 19, adaptador ya listo).
- [ ] **Depende de credenciales reales**: `WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID`/`WHATSAPP_APP_SECRET` (Paso 19, adaptador ya listo).

## Herramientas de desarrollo

- [x] `eslint.config.js` correcto, sin errores nuevos introducidos en ningún paso desde el 14.
- [x] `vite.config.js` correcto, build reproducible.
- [ ] **Recomendado, no crítico**: ejecutar `npm audit fix` para corregir la dependencia transitiva `brace-expansion` (alta severidad, solo en devDependencies — no afecta al bundle de producción). No aplicado en este paso por ser un cambio de dependencias que merece su propia decisión explícita, no un efecto colateral de una auditoría.
