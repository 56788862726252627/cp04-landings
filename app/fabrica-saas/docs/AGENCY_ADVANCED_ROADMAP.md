# AGENCY_ADVANCED_ROADMAP — Paso H

**Roadmap de 9 Items Avanzados (fuera de BASIC)**

Versión: 1.0.0 | Base: Agencia IA Básica 100%

---

## Contexto

La versión BASIC (Pasos A-H) está 100% completa con 0 horas pendientes. Los siguientes 9 items son extensiones AVANZADAS que requieren infraestructura externa, cuentas de terceros, o configuración específica de producción.

Cada item tiene: objetivo, dependencias, complejidad, y alternativa básica ya disponible.

---

## ADV-01 — Playwright E2E Headless

**Objetivo:** Suite de pruebas end-to-end ejecutando browser real en CI/CD.

**Alternativa básica disponible:** Visual QA plan (`buildVisualQAPlan`) + runtime render gate (`auditRuntimeRender`).

**Dependencias:**
- Node.js con Playwright instalado
- CI runner con Chrome/Firefox headless
- URLs de staging estables para testear

**Tareas:**
1. `npm install playwright @playwright/test`
2. Configurar `playwright.config.ts` con baseURL staging
3. Migrar visual QA plan a specs Playwright
4. Integrar en CI con GitHub Actions

**Complejidad:** HIGH | **Estimación:** 2-3 semanas

---

## ADV-02 — Stripe Payments Real

**Objetivo:** Integración Stripe completa con checkout, webhooks, subscriptions en producción.

**Alternativa básica disponible:** Adapter Stripe aislado (`fabrica-saas/`) + DRY_RUN + secretSafetyGate.

**Dependencias:**
- Cuenta Stripe activa (Business)
- Stripe secret key + publishable key (production)
- Configuración webhooks en Stripe Dashboard
- Endpoint `/api/stripe/webhook` en Worker Cloudflare

**Tareas:**
1. Configurar `STRIPE_SECRET_KEY` en Cloudflare secrets
2. Registrar webhook URL en Stripe Dashboard
3. Implementar handler de webhook con verificación de firma
4. Integrar en UI: `@stripe/stripe-js` + `loadStripe()`
5. Tests con Stripe CLI (`stripe trigger payment_intent.succeeded`)

**Complejidad:** HIGH | **Estimación:** 3-4 semanas

---

## ADV-03 — WhatsApp Business API Real

**Objetivo:** Mensajería WhatsApp real vía Meta Business API / Twilio WhatsApp.

**Alternativa básica disponible:** Adapter WhatsApp aislado + integration manifest (Paso B).

**Dependencias:**
- Cuenta Meta Business Manager verificada
- Número de teléfono dedicado aprobado
- Templates de mensajes aprobados por Meta
- Cuenta Twilio o Meta Cloud API

**Tareas:**
1. Solicitar acceso WhatsApp Business API en Meta
2. Aprobar templates de mensajes (24-72h)
3. Configurar webhook para mensajes entrantes
4. Implementar adapter real (reemplaza DRY_RUN)
5. Tests con números sandbox de Twilio/Meta

**Complejidad:** HIGH | **Estimación:** 4-6 semanas (incl. aprobaciones Meta)

---

## ADV-04 — Multi-Tenant Runtime Real

**Objetivo:** Aislamiento real de datos por tenant: schemas Supabase separados o DB por cliente.

**Alternativa básica disponible:** Modelo de datos por clientId (Paso B) + storageKey isolation.

**Dependencias:**
- Supabase Pro/Team (soporte multi-schema)
- O: múltiples proyectos Supabase (1 por cliente)
- Estrategia de migración definida
- RLS policies por tenant

**Tareas:**
1. Elegir estrategia: multi-schema vs multi-proyecto
2. Implementar provisionado automático de tenant
3. Migrar storageKey isolation a aislamiento de DB real
4. Tests de penetración de datos entre tenants
5. Documentar proceso de offboarding (eliminación de datos)

**Complejidad:** CRITICAL | **Estimación:** 6-10 semanas

---

## ADV-05 — Observability Runtime Real

**Objetivo:** Logs, correlation IDs, alertas y dashboards en producción con Cloudflare Logpush.

**Alternativa básica disponible:** Health check system (Paso G) + SLO engine local.

**Dependencias:**
- Cloudflare Workers Logpush configurado
- Sink de logs: Datadog / Grafana Cloud / ElasticSearch
- Dashboard de alertas configurado
- SLA y error budgets definidos

**Tareas:**
1. Activar Cloudflare Logpush hacia sink elegido
2. Instrumentar Worker con correlation IDs
3. Crear dashboard de latencias + error rates
4. Configurar alertas (PagerDuty / OpsGenie)
5. Implementar SLO tracking automático

**Complejidad:** HIGH | **Estimación:** 3-4 semanas

---

## ADV-06 — Supabase DEV/TEST Aislado

**Objetivo:** Proyecto Supabase dedicado para desarrollo y testing con RLS policies validadas.

**Alternativa básica disponible:** Adapters con mocks internos + tests unitarios (Pasos B-G).

**Dependencias:**
- Proyecto Supabase separado (no producción)
- Credenciales DEV en `.env.test`
- RLS policies testeadas en entorno aislado
- Seed data para tests de integración

**Tareas:**
1. Crear proyecto Supabase de test
2. Configurar `.env.test` con credenciales DEV
3. Implementar migration runner para tests
4. Escribir integration tests contra Supabase real
5. Activar en CI con secrets de GitHub

**Complejidad:** MEDIUM | **Estimación:** 2-3 semanas

---

## ADV-07 — Google Drive OAuth Productivo

**Objetivo:** Sync bidireccional con Google Drive usando OAuth2 real con refresh tokens.

**Alternativa básica disponible:** Drive adapter diseñado + integration manifest (Paso B). (Nota: OAuth Drive REAL completado en 2026-07-31 en cp04 — no en fabrica-saas.)

**Dependencias:**
- Google Cloud Console project activo
- OAuth consent screen aprobado (para producción)
- Scopes: drive.file o drive.readonly
- Servidor de callback OAuth accesible

**Tareas:**
1. Configurar OAuth app en Google Cloud Console
2. Implementar flujo de autorización (redirect → callback → token exchange)
3. Almacenar refresh tokens de forma segura (cifrados, no localStorage)
4. Implementar auto-refresh de tokens expirados
5. Tests E2E del flujo OAuth con cuenta de test

**Complejidad:** MEDIUM | **Estimación:** 2-3 semanas

---

## ADV-08 — CI/CD Pipeline Automatizado

**Objetivo:** GitHub Actions o Cloudflare Pages CI con gates de calidad automáticos por PR.

**Alternativa básica disponible:** Release engineering system local (Paso G) + checklist manual.

**Dependencias:**
- Repositorio en GitHub
- Cloudflare Pages API key
- Secrets configurados en GitHub repo

**Tareas:**
1. Crear `.github/workflows/ci.yml`: lint + tests + build
2. Crear `.github/workflows/deploy.yml`: deploy a staging en merge a main
3. Configurar PR gates: bloquear merge si CI falla
4. Integrar evaluateReleaseGates en CI pipeline
5. Notificaciones Slack/Discord en deploy exitoso/fallido

**Complejidad:** MEDIUM | **Estimación:** 1-2 semanas

---

## ADV-09 — Motor BPMN Ejecutable

**Objetivo:** Motor BPMN que ejecute procesos reales (Camunda, Zeebe, o similar).

**Alternativa básica disponible:** BPMN generador de diagramas + decision gates (Paso E).

**Dependencias:**
- Servidor de procesos (Camunda Community Edition / Zeebe)
- O: servicio SaaS BPMN (Camunda Cloud)
- Integración con sistemas externos (Airtable, Make, etc.)
- Definición de procesos en formato BPMN 2.0

**Tareas:**
1. Elegir motor: Camunda Self-hosted vs SaaS
2. Convertir definiciones de Paso E a BPMN 2.0 XML
3. Desplegar motor BPMN
4. Implementar client de Worker → motor BPMN
5. Tests de integración del motor

**Complejidad:** HIGH | **Estimación:** 4-6 semanas

---

## Priorización Recomendada

| Prioridad | Item | Razón |
|-----------|------|-------|
| 1 | ADV-08 CI/CD | Alto impacto, baja complejidad |
| 2 | ADV-06 Supabase DEV/TEST | Desbloquea tests de integración |
| 3 | ADV-07 Drive OAuth | Completar integración docs |
| 4 | ADV-05 Observability | Visibilidad en producción |
| 5 | ADV-01 Playwright | Cobertura E2E completa |
| 6 | ADV-02 Stripe | Monetización real |
| 7 | ADV-03 WhatsApp | Canal de comunicación |
| 8 | ADV-04 Multi-tenant | Escala multi-cliente |
| 9 | ADV-09 BPMN Motor | Automatización avanzada |

**Nota:** Los items 4-9 requieren inversión significativa. Recomendado en Fase Advanced (post-básica).
