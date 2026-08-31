# PROJECT_PRODUCTION_SCORECARD
## Cuadro de Mando de Producción — Todos los Proyectos

Fecha: 2026-08-31 | Auditoría independiente basada en evidencia real

---

## Puntuaciones Actuales

| # | Proyecto | Score Actual | Código | Producción | Target 9/10 | Target 10/10 |
|---|----------|-------------|--------|------------|-------------|--------------|
| 1 | Factory SaaS | **5.5/10** | 8/10 | 3/10 | +120h | +250h |
| 2 | Agencia IA | **4.5/10** | 8/10 | 2/10 | +140h | +300h |
| 3 | CP04 Club Pádel | **5/10** | 6/10 | 5/10 | +60h | +150h |
| 4 | Bot de Trading | **3/10** | 8/10 | 0/10 | +80h | +200h |
| 5 | SaaS Generado | **3.5/10** | 7/10 | 2/10 | +80h* | +180h* |

*Por cliente adicional, marginal

---

## Desglose por Dimensión de Producción

### OBSERVABILIDAD (crítico para todos)

| Proyecto | Actual | Target 9 | Acción |
|----------|--------|----------|--------|
| Factory/Agency | 1/10 | 8/10 | Cloudflare Logpush + Grafana |
| CP04 | 2/10 | 8/10 | Worker logs + correlation IDs + alertas |
| Trading | 4/10 | 8/10 | Prometheus + Grafana local |

### DEPLOYMENT / AUTONOMÍA

| Proyecto | Pasos Manuales Hoy | Target | Bloqueante |
|----------|--------------------|--------|-----------|
| Factory (por cliente) | ~12 pasos, 2-3 días | 3 pasos, 2h | CD pipeline + One Prompt→Production |
| CP04 (por cambio) | ~8 pasos | 2 pasos | CI/CD + GitHub Actions |
| Trading (para paper) | ~5 pasos | 2 pasos | Exchange adapter + real data |
| Trading (para live) | BLOQUEADO | 8 pasos | ADV completo + regulación |

### TESTING / QA REAL

| Proyecto | Tests | E2E | Datos Reales | Producción |
|----------|-------|-----|-------------|------------|
| Factory | 2645 ✅ | ❌ | ❌ | ❌ |
| CP04 | 193 ✅ | ❌ | PARTIAL | ✅ deployed |
| Trading | CI ✅ | N/A | ❌ | ❌ |

### SEGURIDAD

| Proyecto | Auth | Secrets | GDPR | Rating |
|----------|------|---------|------|--------|
| Factory | DRY_RUN ✅ | SecretStr ✅ | Fixtures ✅ | 7/10 |
| CP04 | Supabase ✅ | Worker ✅ | Sin CMP ❌ | 6/10 |
| Trading | Blocked ✅ | SecretStr ✅ | N/A | 8/10 |

---

## Camino a 9/10 por Proyecto

### Factory SaaS → 9/10

| Mejora | Impacto | Horas |
|--------|---------|-------|
| CI/CD GitHub Actions | +1.5 puntos deploy | 8h |
| Observabilidad Logpush | +1.5 puntos obs | 16h |
| Playwright E2E básico | +1 punto QA | 20h |
| One Prompt→Production pipeline | +1 punto autonomía | 30h |
| Supabase DEV/TEST | +0.5 punto testing | 12h |

**Total: ~86h para Factory 8/10. Para 9/10 necesita además cliente real.**

### CP04 → 9/10

| Mejora | Impacto | Horas |
|--------|---------|-------|
| Airtable upgrade (pagar plan) | +1 punto funcionalidad | 2h + coste |
| App.jsx refactor (lazy loading) | +1 punto arquitectura | 20h |
| Observabilidad Worker | +1.5 punto obs | 12h |
| GDPR CMP | +1 punto privacidad | 8h |
| CI/CD CP04 | +0.5 punto deploy | 6h |
| Validar 36 flujos Make | +1 punto automación | 20h |
| Playwright E2E CP04 | +1 punto QA | 16h |

**Total: ~84h para CP04 7-8/10. Para 9/10: + backup + rollback formal.**

### Trading → 9/10

| Mejora | Impacto | Horas |
|--------|---------|-------|
| Kraken sandbox adapter | +2 puntos base | 20h |
| Datos OHLCV reales (paper) | +2 puntos datos | 10h |
| Paper trading vs Kraken sandbox | +2 puntos QA real | 20h |
| ML feature básico (tendencia) | +1 punto AI | 30h |
| Dashboard Telegram real | +1 punto UX | 16h |
| Deploy cloud (VPS/Railway) | +1 punto deploy | 8h |

**Total: ~104h para Trading 7/10. Para 9/10 añadir: live trading con mínima capital, regulación, audit.**

### Agencia IA → 9/10

| Mejora | Impacto | Horas |
|--------|---------|-------|
| Factory Agent Engine V1 | +2 puntos AI/value | 40h |
| Primer cliente real facturado | +3 puntos business | 20h (comercial) |
| CD pipeline automático | +1 punto deploy | 16h |
| CRM real (Airtable/HubSpot) | +1 punto onboarding | 12h |
| Observabilidad clientes | +1 punto obs | 16h |

**Total: ~104h de código + esfuerzo comercial activo.**

---

## Notas Finales de Puntuación

### ¿Por qué no 10/10 en código?

**Factory (8/10 código):** Naming inconsistency menor (PASO_A vs PASO_D_STATUS_MAIN), falta E2E real, output no testeado con usuarios reales, verticales sin demo viva en todos los sectores.

**Trading (8/10 código):** ML vacío, dashboard sin frontend, Telegram sin integración real, backtesting solo con datos sintéticos.

**CP04 (6/10 código):** App.jsx monolito 9.8K líneas, chunk >500KB, .bak files en src/, tests sin Playwright.

### Nota sobre "100_PERCENT"

Los estados `PASO_A..H = 100_PERCENT` miden completitud del código del sistema de fábrica, que es genuinamente 100% para lo que se propuso (pasos A-H del sistema básico). No miden producción. Esta distinción es importante para no confundir stakeholders.
