# AGENCY_ADVANCED_ROADMAP_V2
## Roadmap Definitivo de Perfeccionamiento Avanzado

Fecha: 2026-08-31 | Basado en auditoría crítica independiente
Velocidad de referencia observada en A→H: ~35-50 módulos/sesión, ~200-300 tests/sesión

---

## TABLA MAESTRA DE ROADMAP

### CORE_TRANSVERSAL (afecta ≥2 proyectos)

| Prioridad | Mejora | Proyectos | Problema | Valor Esperado | Impacto Prod | Impacto Comercial | Riesgo ↓ | Reutilización | Horas | Coste | Dependencias |
|-----------|--------|-----------|---------|---------------|-------------|------------------|----------|---------------|-------|-------|-------------|
| **1** | Observabilidad Real (T-01) | ALL | 0 logs producción | Visibilidad total | +++++ | ++ | +++++ | Alta | 28h | $0 (free tiers) | Worker deploy |
| **2** | CI/CD Automatizado (T-02) | Factory, CP04, Agency | Sin pipeline, regresiones no detectadas | Gates automáticos, deploy seguro | ++++ | +++ | ++++ | Alta | 16h | $0 | GitHub repo |
| **3** | Factory Agent Engine V1 (T-03) | Agency, Factory, CP04 | Sin agentes de ventas, chatbot básico | Captación automatizada, cierre | ++ | +++++ | +++ | Muy alta | 60h | ~$5/mes API | LLM provider |
| **4** | One Prompt → Production Pipeline (T-04) | Factory, Agency | 10-15 pasos manuales por cliente | 3 pasos, 2h por cliente | +++++ | +++++ | +++ | Muy alta | 30h | $0 | CI/CD (T-02) |
| **5** | Playwright E2E Suite (T-06) | Factory, CP04, SaaS | Sin E2E, regresiones en producción | Cobertura real en browser | ++++ | ++ | ++++ | Alta | 28h | $0 | Dev server |
| **6** | GDPR / CMP (T-07) | CP04, Factory | Riesgo legal en Europa | Compliance, confianza | +++ | +++ | +++++ | Media | 10h | $0 | - |
| **7** | Backup Automático (T-08) | CP04, Trading, SaaS | Sin backup = riesgo irrecuperable | Protección datos | ++ | ++ | +++++ | Media | 10h | $0 | Airtable/Supabase |
| **8** | Supabase DEV/TEST (T-09) | CP04, Factory, SaaS | Mocks ≠ producción | Integration tests reales | +++ | ++ | +++ | Alta | 12h | $0 (free) | - |

### FACTORY_ONLY

| Prioridad | Mejora | Proyectos | Horas | Impacto |
|-----------|--------|-----------|-------|---------|
| **9** | Stripe real (ADV-02) | Factory, Agency | 24h | Monetización real |
| **10** | WhatsApp Business API (ADV-03) | Factory, Agency, CP04 | 30h | Canal ventas real |
| **11** | Lead Engine + Apify (Fase 11) | Agency, Factory | 24h | Captación automática |
| **12** | NL→Make Generator (N-03) | Factory, Agency | 24h | Reduce 4h→10min por cliente |
| **13** | Factory Health Dashboard (N-02) | Factory, Agency | 16h | Gestión multi-cliente |
| **14** | Multi-tenant DB real (ADV-04) | Factory, Agency | 40h | Escala 10+ clientes |
| **15** | Auto-changelog Generator (N-06) | Factory, Agency | 8h | Comunicación cliente |
| **16** | Legal Document Generator (N-10) | Factory, SaaS | 12h | Compliance por vertical |
| **17** | One-Click Staging Share (N-08) | Factory | 8h | Ciclo feedback cliente |
| **18** | Automatic Vertical Updates (N-09) | Factory | 16h | Mantenimiento transversal |
| **19** | Factory Pricing Page Generator (N-04) | Factory | 8h | Elimina tarea manual |
| **20** | Client Portal read-only (N-05) | Factory, Agency | 20h | Soporte → 0 consultas |
| **21** | BPMN Motor ejecutable (ADV-09) | Agency, Factory | 40h | Automatización avanzada |

### AGENCY_ONLY

| Prioridad | Mejora | Horas | Impacto |
|-----------|--------|-------|---------|
| **22** | CRM real (Airtable/HubSpot) | 12h | Gestión pipeline comercial |
| **23** | Avatar + Voz + Video IA (Fase 12) | 20h | Marketing automatizado |
| **24** | Social Content Engine (Fase 13) | 24h | Presencia online automática |
| **25** | Langfuse (evaluación agentes) | 8h | Mejora continua agentes |
| **26** | OpenRouter (multi-LLM) | 6h | Coste-optimización LLM |
| **27** | Agentes telefónicos IA (Fase 10) | 40h | Canal voz entrante/saliente |

### CP04

| Prioridad | Mejora | Horas | Impacto |
|-----------|--------|-------|---------|
| **28** | Airtable upgrade plan ($24/mes) | 2h | Desbloquea 36 flujos Make |
| **29** | App.jsx refactor lazy loading (T-10) | 20h | Rendimiento + mantenibilidad |
| **30** | Validar 36 flujos Make restantes | 20h | 50/50 activos |
| **31** | GDPR CMP formal | 8h | Compliance |

### TRADING

| Prioridad | Mejora | Horas | Impacto |
|-----------|--------|-------|---------|
| **32** | Kraken sandbox adapter + datos reales | 20h | Paper trading real |
| **33** | Paper trading real vs Kraken sandbox | 10h | Validación estrategia |
| **34** | ML: Trend Following básico (N-07) | 24h | Upgrade estrategia |
| **35** | Dashboard Telegram real | 16h | Monitorización móvil |
| **36** | Deploy VPS/Railway | 8h | Trading 24/7 |
| **37** | Multi-exchange (ccxt) (N-01) | 20h | Diversificación |

### OPTIONAL (valor real pero no crítico)

| Mejora | Horas | Nota |
|--------|-------|------|
| Docker para Factory | 8h | Reproducibilidad local |
| Agent Engine V2 multiagente | 60h | Después de V1 validado |
| MCP avanzado | 16h | Si el uso lo justifica |
| Premium 10/10 UX | 40h | Después de 9/10 básico |

---

## FASE 8 — MEJORAS ADICIONALES ENCONTRADAS

Además del roadmap conocido, la auditoría encontró:

1. **N-01 Multi-Exchange Trading** — abstracción ccxt para Binance/Bybit + Kraken
2. **N-02 Factory Health Dashboard** — estado de todos los clientes en un lugar
3. **N-03 NL→Make Automation Generator** — "crea flujo X" → Make blueprint
4. **N-04 Pricing Page Generator** — automático por vertical + paquete
5. **N-05 Client Portal read-only** — cliente ve su SaaS, health, mantenimiento
6. **N-06 Auto-changelog** — commits → changelog para cliente
7. **N-07 Trading ML basic** — regresión lineal de tendencia sobre OHLCV real
8. **N-08 One-Click Staging Share** — URL preview temporal para cliente
9. **N-09 Automatic Vertical Updates** — mejoras de dental → todos los clientes dental
10. **N-10 Legal Document Generator** — política privacidad + términos por vertical

---

## FASE 9 — FACTORY AGENT ENGINE V1

### Arquitectura

```
AgentFactory (factory-registry/agents.js)
  ├── buildChatAgent(config) → ChatAgent
  ├── buildSalesAgent(config) → SalesAgent
  ├── buildSupportAgent(config) → SupportAgent
  ├── buildBookingAgent(config) → BookingAgent
  ├── buildLeadAgent(config) → LeadAgent
  └── buildVoiceAgent(config) → VoiceAgent
```

### Configuración por negocio

```js
const nexoAgent = buildSalesAgent({
  businessName: 'Clínica Veterinaria Nexo',
  sector: 'veterinary',
  tone: 'warm_professional',   // warm | formal | casual
  language: 'es',
  maxResponseTokens: 200,       // evitar parrafadas
  allowedActions: ['check_availability', 'book_appointment', 'send_quote'],
  forbiddenActions: ['make_promises', 'reveal_costs_without_approval'],
  escalationTriggers: ['no_entiendo', 'hablar_con_persona', '3_failed_turns'],
  memory: { turns: 10, crm: true },
  salesConfig: {
    methodology: 'consultive',  // spin | consultive | challenger
    closingStyle: 'soft',
    objectionHandling: true,
    ethicalPersuasion: true,
  },
  evaluation: {
    langfuse: false,           // activar cuando Langfuse esté configurado
    localMetrics: true,
  }
});
```

### Características de respuesta

```
REGLAS DE COMUNICACIÓN:
- Longitud: corta por defecto (1-3 frases), larga solo si el usuario pide detalle
- Tono: humano, cálido, sin ser servil
- Prohibido: parrafadas, listar todo lo que hace la empresa, saber-lo-todo
- Psicología: descubrir necesidad antes de proponer → reciprocidad → urgencia real
- Objeciones: escuchar completo, reformular, responder → nunca refutar directo
- Cierre: "¿te apetece que lo reservemos ahora?" — suave, sin presión
- Escalado: "¿prefieres hablar con [nombre]?" — siempre opción humana
```

---

## FASE 10 — AGENTES TELEFÓNICOS IA

### Arquitectura Voz (coste mínimo)

```
┌─────────────────────────────────────────────┐
│         LLAMADA ENTRANTE/SALIENTE           │
│                                             │
│  Twilio / VAPI ($0.05/min) o Asterisk (0€) │
│              ↓                              │
│    STT: Whisper.cpp (local, 0€)             │
│         o Deepgram Nova-2 ($0.0059/min)     │
│              ↓                              │
│    LLM: Claude Haiku (latencia ~150ms)      │
│              ↓                              │
│    TTS: Coqui TTS (local, 0€)               │
│         o ElevenLabs Starter ($5/mes)       │
│              ↓                              │
│    VAD: Silero VAD (local, 0€)              │
└─────────────────────────────────────────────┘
```

### Comparativa STT

| Opción | Coste | Calidad | Latencia | Privacidad |
|--------|-------|---------|----------|------------|
| Whisper.cpp local | 0€ | Alta | 800ms-2s | Total |
| Deepgram Nova-2 | $0.006/min | Muy alta | 200ms | En nube |
| Google STT | $0.004/min | Alta | 200ms | En nube |
| Azure STT | $0.003/min | Alta | 250ms | En nube |

**Recomendación:** Deepgram para calidad + latencia. Whisper local para privacidad/coste 0.

### Comparativa TTS

| Opción | Coste | Calidad | Licencia Comercial |
|--------|-------|---------|---------------------|
| Coqui TTS | 0€ | Media | ✅ (MOZILLA PUBLIC) |
| Piper TTS | 0€ | Media-alta | ✅ (MIT) |
| ElevenLabs Starter | $5/mes 10K chars | Excelente | ✅ |
| Google TTS | $4/1M chars | Alta | ✅ |
| OpenAI TTS | $15/1M chars | Excelente | ✅ |

**Recomendación base (0€):** Piper TTS (voz es > Coqui, MIT license, voces en español).
**Recomendación calidad:** ElevenLabs $5/mes para demos de cliente.

### Turn-taking + Interrupciones

```
VAD detecta fin de turno (silencio >800ms)
  → STT transcribe
  → LLM genera respuesta
  → TTS sintetiza (streaming chunk por chunk)
  → Si VAD detecta voz durante TTS → barge-in (interrumpir)
  → Escuchar al usuario
  
Latencia total objetivo: <1.5s desde fin de habla usuario
Latencia actual estimada: Whisper(1s) + Haiku(0.3s) + Piper(0.2s) = ~1.5s
```

---

## FASE 11 — LEAD ENGINE + APIFY

### Arquitectura

```
LeadEngine
  ├── Sourcing (Apify)
  │   ├── Google Maps Scraper (negocios locales)
  │   ├── LinkedIn Companies Scraper
  │   └── Instagram Business Scraper
  ├── Enrichment
  │   ├── Company website → industry + size + tech stack
  │   └── Email validator (Hunter.io free: 25/mes)
  ├── Deduplication
  │   └── Fuzzy match nombre + dominio
  ├── Qualification
  │   └── Sector ∈ factory_verticals? + budget_signal
  └── Scoring → LEAD_OPPORTUNITY_SCORE (0-100)
```

### LEAD_OPPORTUNITY_SCORE (0-100)

```
FIT_SCORE (40 pts max):
  + sector ∈ factory_verticals: +20
  + localización España/LATAM: +10
  + tamaño 2-50 empleados: +10

URGENCY_SCORE (30 pts max):
  + web obsoleta (>3 años): +15
  + sin presencia mobile: +10
  + reviews negativas proceso: +5

VALUE_SCORE (20 pts max):
  + facturación estimada >200K€: +10
  + múltiples locales: +5
  + ya usa herramientas SaaS: +5

EASE_SCORE (10 pts max):
  + contacto email directo encontrado: +5
  + LinkedIn profile del dueño: +5

→ SCORE 80-100: HOT (contactar en 24h)
→ SCORE 60-79: WARM (secuencia email 3 pasos)
→ SCORE 40-59: COLD (nurturing)
→ SCORE <40: DISCARD
```

**Coste Apify:** Free plan 5$/mes en créditos (suficiente para 500-1000 leads/mes).

---

## FASE 12 — AVATAR + VOZ + VIDEO IA (coste 0€)

### Evaluación de opciones

| Herramienta | Coste | Avatar | Voz | Lip-sync | Comercial | Calidad |
|-------------|-------|--------|-----|----------|-----------|---------|
| HeyGen Free | 1 min/mes | ✅ | ✅ | ✅ | ❌ (free) | Excelente |
| D-ID Free | 5 min/mes | ✅ | ✅ | ✅ | ❌ (free) | Alta |
| Synthesia Free | No existe free tier | - | - | - | - | - |
| SadTalker (local) | 0€ | ✅ | 0 (usa audio) | ✅ | ✅ (MIT) | Media |
| Wav2Lip (local) | 0€ | ✅ | 0 | ✅ | ✅ (MIT) | Media |
| LatentSync (local) | 0€ | ✅ | 0 | ✅ | ✅ (Apache) | Alta |

**Recomendación para producción comercial a 0€:**
- Avatar: foto propia + LatentSync (Apache 2.0, uso comercial permitido)
- Voz: Piper TTS (MIT) o grabación real del usuario
- Edición: CapCut (subtítulos auto, 0€)
- Formatos: 9:16 (TikTok/Reels), 1:1 (LinkedIn), 16:9 (YouTube)

**⚠️ AVISO LEGAL:** HeyGen Free y D-ID Free no permiten uso comercial en el plan gratuito. Verificado en sus términos de servicio. Para uso comercial requieren plan de pago o herramientas open-source.

---

## FASE 13 — SOCIAL CONTENT ENGINE

### Flujo completo

```
IDEA/BRIEF (texto)
  → AI Research (web search + competencia)
  → Guion adaptado al tono del negocio
  → Adaptación por red (TikTok 30s, LinkedIn 60s, etc.)
  → LatentSync/Piper TTS → video
  → CapCut → subtítulos + formato
  → QA (checklist: mensaje claro, CTA, no spam, tono correcto)
  → HUMAN APPROVAL (obligatorio antes de publicar)
  → Make → publicación programada (Buffer/Later API)
```

### Meta Ads — regla de gasto

```
REGLA ABSOLUTA:
  NEVER autoPublish = true cuando adSpend > 0
  Requiere: HUMAN_APPROVAL + EXPLICIT_BUDGET_CAP
  Implementación: gate en Make scenario con webhook de confirmación
```

---

## FASE 14 — AUTONOMÍA ACTUAL

### MANUAL_STEPS_TO_PRODUCTION

| Proyecto | Pasos Manuales | Tiempo | Bloqueante |
|----------|---------------|--------|-----------|
| Agencia → 1er cliente | 15 | 2-3 días | Onboarding no automatizado |
| Factory → cliente nuevo | 12 | 1-2 días | CD pipeline + domain + Supabase |
| CP04 → nuevo cambio | 8 | 30-60 min | Sin CI/CD |
| Trading → paper real | 5 | 2h | Exchange adapter |
| Trading → live | BLOQUEADO | N/A | Regulación + capital |

### Pasos manuales que siempre requieren humano (inevitables)

1. OAuth autorización inicial (Drive, Make, Stripe)
2. Configuración DNS de dominio
3. Aprobación de templates WhatsApp (Meta)
4. Revisión legal de contenido
5. Billing configuration (Stripe, Cloudflare, Supabase)
6. Claves API del cliente (Airtable, etc.)

### Pasos actualmente manuales que se pueden automatizar

1. Crear proyecto Cloudflare Pages → API call
2. Crear proyecto Supabase → CLI
3. Configurar variables de entorno → wrangler secret put (scripteable)
4. Primer deploy a staging → GitHub Actions
5. Health check post-deploy → ya diseñado en Paso G
6. Notificación al cliente → Make webhook
7. Crear backup policy → ya diseñado en Paso F

**MANUAL_STEPS_AFTER_ADVANCED: 6 inevitables** (vs 12-15 actuales)

---

## FASE 15 — HERRAMIENTAS

### Recomendadas (valor real, no duplican)

| Herramienta | Tipo | Propósito | Coste | Status |
|-------------|------|-----------|-------|--------|
| Langfuse | Open-source / Cloud | Evaluación agentes IA, traces, métricas | 0€ local / $30/mes cloud | **RECOMMENDED** |
| Sentry | SaaS | Error tracking producción | Free 5K errors/mes | **RECOMMENDED** |
| Grafana Cloud | SaaS | Dashboards observabilidad | Free 50GB/mes | **RECOMMENDED** |
| Apify | SaaS | Scraping para lead engine | Free $5 créditos | **RECOMMENDED** |
| Piper TTS | Open-source | TTS local en español | 0€ MIT | **RECOMMENDED** |
| Whisper.cpp | Open-source | STT local, sin red | 0€ MIT | **RECOMMENDED** |
| LatentSync | Open-source | Lip-sync para video | 0€ Apache 2.0 | **RECOMMENDED** |
| Playwright | Open-source | E2E testing browser | 0€ Apache 2.0 | **RECOMMENDED** |
| ccxt | Open-source | Abstracción exchanges | 0€ MIT | **RECOMMENDED** (trading) |
| OpenRouter | API | Multi-LLM routing con fallback | Pay-per-use | **RECOMMENDED** (reducción coste LLM) |
| Betterstack | SaaS | Logs + alertas + uptime | Free 1GB/mes | **RECOMMENDED** |

### No recomendadas (duplican capacidades existentes)

- Vitest: ya usa node:test, no duplicar
- Create React App: ya usa Vite
- Redux: no necesario con estado actual
- Prisma: Supabase ya provee ORM

---

## FASE 17 — TIEMPOS REALES

### Velocidad observada en A→H

- Módulos JS por sesión: 15-25 (media 20)
- Tests por módulo: 8-15 (media 10)
- Tiempo por módulo funcional completo (código + tests + doc): 45-90 min
- Build pass: inmediato si arquitectura es limpia
- Push protection issues: +30 min cuando ocurre

### Estimaciones revisadas

| Grupo | MIN | CENTRAL | MAX |
|-------|-----|---------|-----|
| CORE_TRANSVERSAL (T-01..T-10) | 80h | 124h | 180h |
| FACTORY_ONLY | 100h | 156h | 240h |
| AGENCY_ONLY | 60h | 110h | 170h |
| CP04 | 30h | 50h | 80h |
| TRADING | 60h | 98h | 150h |
| OPTIONAL | 80h | 124h | 200h |
| **TOTAL** | **410h** | **662h** | **1020h** |

**Nota:** Las estimaciones incluyen código + tests + documentación mínima. No incluyen:
- Tiempo de aprobaciones externas (Meta, Stripe, etc.)
- Tiempo de configuración de cuentas de terceros
- Tiempo de QA con usuarios reales
- Trabajo comercial (conseguir clientes)

```
ADVANCED_MIN_HOURS: 410h
ADVANCED_CENTRAL_HOURS: 662h
ADVANCED_MAX_HOURS: 1020h
```

---

## FASE 18 — NOTAS ESPERADAS DESPUÉS DEL ROADMAP

### Después de implementar los TOP 10 (prioridades 1-10, ~250h)

| Proyecto | Score Actual | Score Esperado | Qué lo mueve |
|----------|-------------|----------------|--------------|
| Agencia IA | 4.5/10 | **7.5/10** | Observabilidad + CI/CD + Agent Engine + 1er cliente |
| Factory SaaS | 5.5/10 | **8/10** | CI/CD + Playwright + Production Pipeline |
| CP04 | 5/10 | **7/10** | Airtable plan + 50/50 flows + observabilidad |
| Trading | 3/10 | **5.5/10** | Kraken sandbox + paper trading real |
| SaaS Generado | 3.5/10 | **6.5/10** | Pipeline producción + E2E |

### Después del roadmap completo (~660h central)

```
AGENCY_EXPECTED_SCORE: 9/10
FACTORY_EXPECTED_SCORE: 9/10
CP04_EXPECTED_SCORE: 8/10
TRADING_EXPECTED_SCORE: 7/10
FUTURE_SAAS_EXPECTED_SCORE: 8/10
```

### Qué necesita cada uno para 10/10

- **Agencia 10/10:** 3+ clientes facturados, revenue demostrable, NPS > 8
- **Factory 10/10:** 10+ SaaS en producción para clientes reales, 0 incidentes en 6 meses
- **CP04 10/10:** GDPR completo, 50/50 Make activos, observabilidad completa, <100ms p95
- **Trading 10/10:** Estrategia profitable en paper 6 meses, ML validado, live con capital real
- **SaaS 10/10:** Onboarding automático < 2h, 0 intervención manual post-deploy

---

## TOP 5 MEJORAS DE MAYOR VALOR

### #1 — Observabilidad Real (T-01) · 28h · $0
Sin logs = sin production. La mejora con mayor ratio impacto/esfuerzo de todo el portfolio.

### #2 — Factory Agent Engine V1 (T-03) · 60h · ~$5/mes
El mayor multiplicador de valor comercial: transforma demos en ventas, soporte en automatización.

### #3 — One Prompt → Production Pipeline (T-04) · 30h · $0
Reduce de 3 días a 2 horas el time-to-market por cliente. Cambia la ecuación comercial completa.

### #4 — CI/CD Automatizado (T-02) · 16h · $0
Prerequisito para escalar. Sin CI/CD, cada despliegue es un riesgo.

### #5 — Airtable Plan + Validar 50/50 Make (T-05 + CP04) · 22h · $24/mes
Desbloquea el flujo más crítico de CP04 de forma inmediata. ROI inmediato.

---

## PRÓXIMA MEJORA RECOMENDADA

**T-01 — Observabilidad Real** en CP04 Worker (primer paso: 4h).

Razón: es la mejora de mayor impacto inmediato en producción real, aplica a un sistema ya deployed, $0 coste, y desbloquea la capacidad de detectar errores en los 36/50 flujos Make que se validarán después.
