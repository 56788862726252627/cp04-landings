# AGENCY_KNOWN_LIMITATIONS — Paso H

**Limitaciones Conocidas de la Versión Básica**

Versión: 1.0.0 | Fecha: 2026-08-31

---

## Introducción

Este documento lista las limitaciones conocidas de la Agencia IA Básica (Pasos A-H). Todas son **intencionales** o tienen **alternativa básica documentada**. Ninguna es un bug ni un blocker para el uso básico.

---

## L-01: Deploy siempre en DRY_RUN por defecto

**Qué significa:** `runDeployPipeline()` nunca despliega a PRODUCTION sin un override explícito `{ mode: 'PRODUCTION' }`. Todos los deploys de la suite de tests son DRY_RUN.

**Por qué:** Seguridad. Previene deploys accidentales desde entornos de desarrollo.

**Cuándo es relevante:** Solo cuando se quiere hacer un deploy real a producción.

**Alternativa:** Para deploy real, pasar `{ mode: DEPLOY_MODES.PRODUCTION, approvedBy: 'HUMAN_OVERRIDE' }` con revisión humana explícita.

---

## L-02: Visual QA requiere navegador real

**Qué significa:** `buildVisualQAPlan()` genera el plan de QA visual (pantallas, breakpoints, checks) pero no lo ejecuta. La ejecución requiere un browser real.

**Por qué:** Sin Playwright o similar, no hay browser en el entorno de test.

**Cuándo es relevante:** Para QA visual automatizado en CI.

**Alternativa básica:** Ejecutar el plan manualmente. Para headless: ADV-01 (Playwright).

---

## L-03: Stripe en NOT_CONFIGURED

**Qué significa:** El adapter de Stripe existe y está testeado en modo aislado, pero `STRIPE_SECRET_KEY` es `NOT_CONFIGURED`. No se procesa ningún pago real.

**Por qué:** Integración real requiere cuenta Stripe + configuración de webhooks (ADV-02).

**Cuándo es relevante:** Solo para monetización real.

**Alternativa básica:** Adapter aislado + DRY_RUN mode para demos.

---

## L-04: WhatsApp en NOT_CONFIGURED

**Qué significa:** Similar a Stripe — adapter existe, testeado, pero sin credenciales reales de Meta Business API.

**Por qué:** Requiere aprobación de Meta + número de teléfono dedicado (ADV-03).

**Cuándo es relevante:** Para mensajería real con clientes.

**Alternativa básica:** Integration manifest documentado + make.com manifest para flujos de automatización.

---

## L-05: Multi-tenant por clientId, no por DB

**Qué significa:** El aislamiento multi-tenant se basa en `clientId` como clave de partición en los datos, pero no en schemas o bases de datos separadas.

**Por qué:** Multi-tenant real a nivel de DB requiere Supabase Pro + estrategia de migración (ADV-04).

**Cuándo es relevante:** A partir de 10+ clientes activos simultáneos o cuando la regulación requiere aislamiento físico de datos.

**Alternativa básica:** `buildStorageKey(clientId, key)` + policy de acceso por clientId.

---

## L-06: Observability local, no en runtime

**Qué significa:** Health checks y SLO engine funcionan localmente (en test / desarrollo). En producción no hay logs automáticos enviados a ningún sink externo.

**Por qué:** Cloudflare Logpush requiere configuración específica del account (ADV-05).

**Cuándo es relevante:** Para monitorización en producción con alertas.

**Alternativa básica:** `runHealthChecks()` post-deploy + `evaluateRollbackNeed()` manual.

---

## L-07: BPMN genera diagramas, no ejecuta

**Qué significa:** El módulo BPMN de Paso E genera definiciones y diagramas de procesos pero no ejecuta los procesos en un motor BPMN.

**Por qué:** Motor BPMN ejecutable requiere infraestructura dedicada (Camunda/Zeebe) — ADV-09.

**Cuándo es relevante:** Para automatización de procesos compleja con estados persistentes.

**Alternativa básica:** SOPs + decision gates (Paso E) + make.com scenarios (Paso B manifest).

---

## L-08: qualifyClient sin scoring real

**Qué significa:** `qualifyClient()` acepta todos los inputs válidos y devuelve `QUALIFIED`. No hay scoring ML real basado en historial de clientes.

**Por qué:** Scoring real requiere datos históricos + modelo entrenado.

**Cuándo es relevante:** Para calificación automática de leads en volumen.

**Alternativa básica:** Criterios manuales de calificación documentados en el SOP comercial.

---

## L-09: auditDependencies sin npm audit real

**Qué significa:** `auditDependencies()` devuelve una estructura de resultado pero no ejecuta `npm audit` real ni consulta la base de datos de CVEs.

**Por qué:** En CI es donde se ejecuta el audit real. El módulo define el contrato de datos.

**Cuándo es relevante:** Para auditoría automática de dependencias en CI.

**Alternativa básica:** Ejecutar `npm audit` manualmente antes de cada deploy.

---

## L-10: Naming inconsistencia histórica menor

**Qué significa:** `PASO_A_STATUS` no tiene sufijo `_MAIN`, mientras `PASO_D_STATUS_MAIN` sí lo tiene. Inconsistencia introducida en versiones tempranas del registry.

**Impacto:** Ninguno funcional. Solo cosmético.

**Por qué:** Evolución orgánica del registry entre Pasos.

**Resolución:** Aceptada como deuda técnica menor (NAMING-08 en auditoría de naming).

---

## L-11: Supabase sin entorno DEV/TEST

**Qué significa:** No existe un proyecto Supabase dedicado para tests de integración. Los adapters Supabase están implementados pero testeados con mocks.

**Por qué:** ADV-06 — requiere proyecto Supabase de test.

**Cuándo es relevante:** Para tests de integración reales contra Supabase.

**Alternativa básica:** Tests unitarios con mocks internos (2645 tests sin red).

---

## Resumen de Limitaciones

| ID | Categoría | Impacto Básico | Resolución |
|----|-----------|---------------|------------|
| L-01 | Deploy | NINGUNO | DRY_RUN es seguridad intencional |
| L-02 | QA | BAJO | Plan visual es el deliverable |
| L-03 | Payments | NINGUNO para demos | ADV-02 |
| L-04 | WhatsApp | NINGUNO para demos | ADV-03 |
| L-05 | Multi-tenant | BAJO (<10 clientes) | ADV-04 |
| L-06 | Observability | BAJO | Health checks manuales |
| L-07 | BPMN | BAJO | SOPs + decision gates |
| L-08 | Qualification | BAJO | Criterios manuales |
| L-09 | Security deps | BAJO | npm audit manual |
| L-10 | Naming | NINGUNO | Cosmético |
| L-11 | Supabase | BAJO | Mocks en tests |

**Impacto en uso básico: NINGUNO bloqueante.**
