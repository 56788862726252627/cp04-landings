# 02 — Checklist de producción al 100%

Cada ítem indica su estado real y, si no está terminado, de qué depende
exclusivamente.

## Desarrollo técnico (motor de investigación + fábrica SaaS + capa comercial)

- [x] Motor de investigación pública y auditoría digital (Pasos 12-15).
- [x] 4 proveedores reales conectados: SEO, accesibilidad, rendimiento, `publicWebsiteFetcher` (Pasos 13, 16-18).
- [x] Fábrica SaaS multisector + constructor de negocios en lenguaje natural (Pasos 09-11).
- [x] Adaptadores Stripe/WhatsApp aislados, listos para credenciales de test (Paso 19).
- [x] Motor ROI + panel comercial + propuesta + mockups + CLI comercial (Paso 20).
- [x] Auditoría de producción + checklists (Paso 21, este documento).
- [ ] **Depende de decisión de producto**: migrar sesión de `localStorage` a cookies HttpOnly (ver checklist de seguridad).
- [ ] **Depende de decisión de producto**: sustituir el adaptador mock de autenticación por un proveedor de identidad real (Supabase u otro).

## Integraciones externas

- [ ] **Depende de Airtable**: renovar cuota, configurar `AIRTABLE_TOKEN` real.
- [ ] **Depende de Airtable**: validar los 50 flujos de Make con llamadas reales.
- [ ] **Depende de credenciales reales**: configurar `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` (modo test primero, luego live).
- [ ] **Depende de credenciales reales**: contratar y configurar WhatsApp Business (`WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID`/`WHATSAPP_APP_SECRET`).
- [ ] **Depende del dominio**: comprar dominio en Hostinger.
- [ ] **Depende del dominio**: emitir SSL.
- [ ] **Depende del despliegue**: configurar hosting definitivo, backups, monitorización.

## Comercial

- [x] Capacidad de generar propuestas/ROI/mockups para un prospecto (Paso 20).
- [ ] **Depende de un cliente real**: primer piloto comercial (Paso 21 de la proyección original, ver checklist de primer cliente).

## Puntuación de este checklist

**14 de 20 ítems técnicos bajo control directo del equipo ya completados
o con código listo. Los 6 restantes dependen exclusivamente de
credenciales/decisiones externas (Airtable, Stripe, WhatsApp, dominio,
despliegue) o de una decisión de producto (auth real) — ninguno requiere
más desarrollo de funcionalidad nueva.**
