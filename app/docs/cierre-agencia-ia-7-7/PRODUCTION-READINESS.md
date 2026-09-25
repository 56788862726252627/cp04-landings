# Production Readiness — Agencia IA

**Evaluación honesta al 2026-07-31. Sin embellecimiento.**

---

## Club Pádel 04 (tenant principal)

| Componente | Estado real | Bloqueador |
|------------|------------|------------|
| Build frontend | ✅ Funciona | — |
| Worker de reservas | ✅ Desplegado (CF Workers) | — |
| Supabase auth | ✅ Funciona (Worker secrets) | — |
| Airtable de reservas | ✅ Funciona (Worker secrets) | — |
| Make webhooks | ✅ 14/50 escenarios activos | 36/50 sin activar |
| Role gates (PLAYER/ADMIN/SUPPORT) | ✅ Activados | — |
| Módulo Torneos (Round Robin) | ✅ Implementado | — |
| LocalStorage de sesión (P0) | ✅ Resuelto (HttpOnly cookies) | — |
| Google Drive | 🟡 OAuth local OK | Sin conectar a Worker |
| Tests E2E visuales (Playwright) | 🔴 No ejecutables | Sin Chromium en este entorno |

**Readiness estimado CP04:** ~75%

---

## Fábrica SaaS Multisector

| Componente | Estado real | Bloqueador |
|------------|------------|------------|
| One Prompt Factory (pipeline) | ✅ Funciona (396 tests) | — |
| Natural Language Builder | ✅ Funciona (542 tests) | — |
| Generación de negocios (7 sectores) | ✅ Funciona en dry-run | — |
| Branding Engine | ✅ WCAG AA verificado | — |
| Landing Generator | ✅ Funciona | — |
| Business Blueprint Schema | ✅ Validación completa | — |
| Terminología multisector | ✅ Funciona | — |

**Readiness estimado Fábrica:** ~90% (funciona localmente, sin despliegue)

---

## Agencia IA — Sistema comercial

| Componente | Estado real | Bloqueador |
|------------|------------|------------|
| buildBusinessStatusReport | ✅ P4/7 — 49 tests | — |
| buildAgencyStatusReport | ✅ P5/7 — 17 tests | — |
| agencyService (filtros+seguridad) | ✅ P6/7 — 40 tests | — |
| agencyWebhookAdapter | ✅ P6/7 — 31 tests, dry-run | Sin webhook real |
| API REST local | ✅ P6/7 — 16 tests | Solo localhost |
| CLI agency:status | ✅ Funciona | — |
| CLI agency:api | ✅ Funciona | Sin auth externa |

**Readiness estimado Agencia:** ~65% (funcional localmente, sin producción)

---

## Integraciones externas (estado real)

### Airtable
- **Estado**: NOT_CONFIGURED en la agencia / CONFIGURADO en CP04 (Worker secrets)
- **Bloqueador para agencia**: No hay credenciales de agencia separadas
- **Acción**: Añadir AIRTABLE_API_KEY + AIRTABLE_BASE_ID a Worker secrets para uso de agencia

### Stripe
- **Estado**: NOT_CONFIGURED
- **Código**: Adapter implementado (56 tests verdes)
- **Bloqueador**: Falta STRIPE_SECRET_KEY real (solo sk_test_ en mock)
- **Acción**: Activar cuenta Stripe, añadir clave a Worker secrets

### WhatsApp
- **Estado**: NOT_CONFIGURED
- **Código**: Adapter implementado (101 tests verdes)
- **Bloqueador**: Falta WHATSAPP_ACCESS_TOKEN + PHONE_NUMBER_ID reales
- **Acción**: Meta Business Manager + aprobación de plantillas

### Google Drive
- **Estado**: OAuth configurado localmente (credentials en .secrets/, gitignorado)
- **Bloqueador**: No conectado al Worker ni al pipeline de la agencia
- **Acción**: Mover token a Worker secrets o usar Service Account para prod

### Make
- **Estado**: 14/50 escenarios activos en CP04; agencia no conectada
- **Bloqueador**: Webhook de agencia no configurado en Make
- **Acción**: Crear escenario Make que reciba el payload del webhook simulado

### Gmail / Correo
- **Estado**: No implementado
- **Bloqueador**: Sin OAuth, sin credenciales
- **Acción**: Fuera del alcance actual

### Dominio / Hosting
- **Estado**: Cloudflare Workers en producción (Worker de reservas)
- **Frontend**: No desplegado en dominio propio (solo localhost:5175)
- **Acción**: Desplegar frontend en CF Pages o similar

---

## Acciones P0 para producción real

1. **Stripe**: Activar cuenta → STRIPE_SECRET_KEY → Worker secret → desactivar flag PAYMENTS_DISABLED
2. **WhatsApp**: Meta Business Manager → WHATSAPP_ACCESS_TOKEN → Worker secret
3. **Make agencia**: Crear escenario receptor → configurar MAKE_WEBHOOK_URL → actualizar Worker
4. **Frontend**: Desplegar en dominio propio (CF Pages recomendado)
5. **Drive agencia**: Service Account → secret → integrar en pipeline de generación de documentos
