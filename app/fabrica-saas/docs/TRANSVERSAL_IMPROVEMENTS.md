# TRANSVERSAL_IMPROVEMENTS
## Mejoras Transversales — Impacto en Múltiples Proyectos

Fecha: 2026-08-31 | Ordenadas por valor real, no novedad

---

## Principio de ordenación

1. Mayor valor transversal (afecta ≥2 proyectos)
2. Mayor impacto comercial real
3. Mayor impacto en producción
4. Mayor reducción de riesgo
5. Mayor ahorro de tiempo/coste futuro
6. Mayor reutilización
7. Menor esfuerzo equivalente

---

## T-01 — Observabilidad Real en Producción

**Proyectos afectados:** Factory, CP04, Agencia IA, Trading (parcial)
**Problema actual:** 0 logs en producción. Si algo falla, no hay forma de saberlo sin que el usuario lo reporte.
**Impacto:** Elimina el mayor riesgo de producción de todos los proyectos.

**Componentes:**
- Cloudflare Worker: activar Logpush → sink (Grafana Cloud / Betterstack / Axiom)
- Correlation ID en cada request
- Error tracking (Sentry free tier)
- Alertas básicas (Worker 5xx rate > 5%)
- Trading: Prometheus + Grafana local

**Coste:** Grafana Cloud free tier (50GB logs/mes), Sentry free (5K errors/mes), Betterstack free (1GB)
**Horas:** 20h (Worker + setup Grafana) + 8h (Trading Prometheus)
**Impacto en score:** +1.5 pts a cada proyecto con Worker

---

## T-02 — CI/CD Automatizado (GitHub Actions)

**Proyectos afectados:** Factory, CP04, Agencia IA
**Problema actual:** Sin pipeline automatizado. Push directo a main sin gates.
**Impacto:** Previene regresiones, automatiza deploy a staging.

**Para Factory/CP04 (Cloudflare Pages):**
```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  test: node --test
  lint: eslint
  build: npm run build
  deploy: wrangler pages deploy (solo en main)
```

**Para Trading:** Ya tiene CI en GitHub Actions. Añadir deploy a Railway/VPS.

**Coste:** $0 (GitHub Actions free 2000 min/mes)
**Horas:** 8h Factory + 6h CP04 + 2h Trading extension
**Impacto en score:** +0.5-1 pt cada proyecto

---

## T-03 — Factory Agent Engine V1

**Proyectos afectados:** Agencia IA (directamente), Factory (genera agentes), CP04 (chatbot upgrade)
**Problema actual:** Chatbot CP04 es básico. Factory no genera agentes de ventas. Agencia no tiene captación automatizada.
**Impacto:** Mayor multiplicador de valor comercial del portfolio.

**Especificación de agentes (ver Fase 9 del prompt):**

### CHAT_AGENT (soporte + ventas)
```
propósito: responder consultas, guiar hacia conversión
tono: warm, consultivo, nunca robótico
longitud: adaptativa — respuestas cortas a preguntas simples, extendidas solo si el usuario lo pide
evitar: parrafadas, saber-lo-todo, spam
incluir: empatía, confianza, psicología de ventas consultiva
memoria: last 10 turns solo
escalado: "¿quieres hablar con una persona?" si 3 intentos fallidos
acciones prohibidas: promesas de precio sin verificar, datos de terceros
```

### SALES_AGENT
```
propósito: cualificar lead → propuesta → cierre
flujo: descubrir necesidad → propuesta personalizada → objeciones → cierre suave
psicología: SPIN selling + reciprocidad + urgencia real (no falsa)
prohibido: presión, FUD, descuentos sin autorización
```

### SUPPORT_AGENT
```
propósito: resolver incidencias + prevenir churn
escalado automático: P0 → humano en <5 min
acciones: consultar estado reserva, cancelar, reprogramar (con confirmación)
```

### BOOKING_AGENT
```
propósito: flujo completo de reserva por chat/voz
verificar disponibilidad real (Airtable/Supabase)
confirmar → Make webhook → email/WhatsApp confirmación
```

### LEAD_AGENT
```
propósito: nutrir leads fríos → calientes
flujo: awareness → interés → cualificación → handoff a SALES_AGENT
memoria: CRM-backed
```

### VOICE_AGENT
```
propósito: llamadas entrantes y salientes
STT: Whisper local (gratis) o Deepgram (freemium)
LLM: Claude Haiku (latencia <300ms)
TTS: Coqui TTS (open-source, gratis) o ElevenLabs (freemium)
turn-taking: VAD (Voice Activity Detection) + silencio 800ms
interrupciones: natural (barge-in support)
transferencia: "Un momento, te paso con [nombre]" → webhook
```

**Horas:** 40h (base engine + 3 agentes core) + 20h (voice agent skeleton)
**Coste:** $0 con Whisper/Coqui + Claude Haiku API

---

## T-04 — One Prompt → Production Pipeline

**Proyectos afectados:** Factory, Agencia IA
**Problema actual:** 10-15 pasos manuales entre "genera SaaS" y "en producción para el cliente".
**Impacto:** Reduce de 3 días a ~2 horas el tiempo de entrega de primer cliente.

**Pipeline a automatizar:**
```
brief → analyze → generate → test → build → 
→ [auto] Cloudflare Pages project create
→ [auto] Deploy staging
→ [auto] Run E2E
→ [human] Approve + configure domain
→ [auto] Deploy production
→ [auto] Health check
→ [auto] Notify client
```

**Bloqueantes:**
- Cloudflare API para crear Pages project (automatizable)
- Supabase CLI para crear proyecto + migraciones (automatizable)
- Domain config (siempre manual)
- Variables de entorno del cliente (siempre manual pero reducible)

**Horas:** 30h (pipeline básico, no incluye Stripe/WhatsApp)

---

## T-05 — Airtable: Resolver Cuota + Estrategia

**Proyectos afectados:** CP04 (crítico), Agencia IA (planned), Factory (manifests)
**Problema actual:** Cuota gratuita Airtable agotada. 36/50 flujos Make bloqueados en CP04.
**Impacto:** Desbloquea toda la automatización de CP04 de forma inmediata.

**Opciones:**
1. **Airtable Team Plan ($24/mes):** Desbloquea cuota. ROI inmediato si hay 1 cliente. Recomendado.
2. **Migrar a NocoDB / Baserow (open-source, gratis):** Mayor trabajo (4-6h migración), 0 coste recurrente.
3. **Supabase como sustituto de Airtable:** Mayor trabajo (8-12h), pero mejor escalabilidad a largo plazo.

**Recomendación:** Opción 1 (pagar plan Airtable Team) si CP04 es activo. Si se prevé escalar a 10+ clientes: migrar a Supabase.

**Horas:** 2h (upgrade plan) o 8h (migración Supabase)
**Impacto:** +1 punto CP04 funcionalidad inmediatamente

---

## T-06 — Playwright E2E Suite

**Proyectos afectados:** Factory, CP04, futuros SaaS
**Problema actual:** 0 tests E2E. QA visual es plan manual.
**Impacto:** Detecta regresiones antes de llegar a usuarios.

**Implementación:**
```js
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:5173' },
});

// e2e/cp04.spec.ts
test('booking flow', async ({ page }) => {
  await page.goto('/');
  // login → select court → book → confirm
});
```

**Horas:** 16h (CP04 golden path) + 12h (Factory generated app basic tests)

---

## T-07 — GDPR / Privacy Compliance

**Proyectos afectados:** CP04, futuros SaaS generados
**Problema actual:** Sin CMP (Consent Management Platform), sin política de cookies formal, sin aviso GDPR en CP04.
**Impacto:** Riesgo legal real para clientes en Europa.

**Implementación mínima:**
- Banner de cookies (CookieYes free tier o implementación propia: 4h)
- Política de privacidad real (legal template: 2h)
- Opt-out de analytics (si los hay)
- Data retention policy documentada

**Horas:** 8h total para CP04 + factory template reutilizable

---

## T-08 — Backup Automático

**Proyectos afectados:** CP04, Trading, futuros SaaS
**Problema actual:** Sin backup automático en ningún proyecto. Pérdida de datos = irrecuperable.
**Impacto:** Reduce riesgo de pérdida de datos a 0.

**CP04:**
- Airtable: webhook → Make → Google Sheets backup (4h)
- Supabase: pg_dump vía GitHub Actions nightly (4h)

**Trading:**
- SQLite: rsync a S3/R2 nightly (2h)

**Horas:** 10h total

---

## T-09 — Supabase DEV/TEST Aislado

**Proyectos afectados:** CP04, Factory, futuros SaaS
**Problema actual:** Sin entorno de test para Supabase. Tests de integración usan mocks.
**Impacto:** Detecta bugs de RLS, migración, consultas antes de producción.

**Coste:** Supabase free tier (2 proyectos gratis)
**Horas:** 12h (setup + RLS tests básicos)

---

## T-10 — App.jsx CP04 Refactor (Lazy Loading)

**Proyectos afectados:** CP04, futuros SaaS (lección)
**Problema actual:** 9.801 líneas, chunk >500KB. Tiempo de carga inicial alto.
**Impacto:** Rendimiento, mantenibilidad, score arquitectura.

**Estrategia:**
```js
// Lazy loading por módulo
const ReservasModule = lazy(() => import('./modules/Reservas'));
const AdminModule = lazy(() => import('./modules/Admin'));
```

**No reescribir:** solo extraer módulos a ficheros propios + lazy import.
**Horas:** 20h para CP04. Genera patrón reutilizable en Factory.

---

## MEJORAS NUEVAS (no en roadmap conocido)

### N-01 — Multi-Exchange Trading (no solo Kraken)
**Descripción:** Abstracción de exchange para soportar Binance/Bybit + Kraken.
**Valor:** Diversificación de riesgo de exchange, mercado más líquido.
**Horas:** 20h (adapter pattern sobre ccxt)

### N-02 — Factory Health Dashboard
**Descripción:** Dashboard web que muestra el estado de todos los clientes generados.
**Valor:** Un lugar para ver: qué SaaS están en producción, health score, últimos deploys.
**Horas:** 16h (usando componentes existentes de Factory + agencyApiRouter)

### N-03 — NL → Make Automation Generator
**Descripción:** "Crea un flujo que envíe un WhatsApp cuando se hace una reserva" → Make blueprint.
**Valor:** Reduce de 4h a 10 min el tiempo de configurar automaciones Make.
**Horas:** 24h (LLM + Make API + template engine)

### N-04 — Factory Pricing Page Generator
**Descripción:** Genera automáticamente la página de precios del SaaS basándose en el vertical + paquete.
**Valor:** Elimina una tarea manual de cada entrega.
**Horas:** 8h

### N-05 — Client Portal (read-only)
**Descripción:** Portal web donde el cliente ve: estado de su SaaS, health checks, próximo mantenimiento.
**Valor:** Reduce consultas de soporte, aumenta percepción de profesionalismo.
**Horas:** 20h

### N-06 — Auto-changelog Generator
**Descripción:** Genera automáticamente el changelog para el cliente basándose en los commits.
**Valor:** Ahorra ~1h por entrega, mejora comunicación con cliente.
**Horas:** 8h

### N-07 — Trading ML: Trend Following Basic
**Descripción:** Primer modelo ML real: regresión lineal para detección de tendencia sobre OHLCV.
**Valor:** Upgrade real del bot desde estrategias técnicas básicas.
**Horas:** 24h (datos + features + sklearn básico)

### N-08 — One-Click Staging Share
**Descripción:** `agency share --client nexo` genera URL temporal de preview para el cliente.
**Valor:** Acelera ciclo de feedback cliente antes de deploy final.
**Horas:** 8h (Cloudflare Workers + JWT temporal)

### N-09 — Automatic Vertical Updates
**Descripción:** Cuando Factory añade una mejora a dental, la propaga automáticamente a todos los clientes dental.
**Valor:** Mantenimiento transversal sin trabajo manual por cliente.
**Horas:** 16h

### N-10 — Legal Document Generator
**Descripción:** Genera automáticamente: política de privacidad, términos de servicio, aviso de cookies por vertical.
**Valor:** Elimina trabajo manual y riesgo legal en cada entrega.
**Horas:** 12h + revisión legal
