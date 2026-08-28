# Fábrica SaaS · Generador de Prototipos v1

## Objetivo

Convertir la Fábrica SaaS en un generador interno capaz de producir, desde terminal y con Claude Code/ChatGPT, prototipos SaaS navegables equivalentes al trabajo que hoy haría un constructor externo como Lovable, sin depender de créditos por generación.

## Principio arquitectónico

La generación se divide en tres capas estrictas:

1. **CORE** — piezas reutilizables entre sectores: shell de aplicación, sistema de diseño, navegación, auth opcional, RBAC opcional, chatbot base, CRM base, agenda/reservas base, recuperación de leads, dashboard, logs, métricas, mocks, testing y build.
2. **VERTICAL** — reglas del sector: terminología, tipos de servicio, formularios, precalificación, restricciones, flujos, métricas y disclaimers propios de dental, pádel, legal, fisioterapia, etc.
3. **CLIENTE** — branding, nombre, colores, sedes, servicios, horarios, textos, rangos de precio, configuración de módulos e integraciones.

La capa CLIENTE nunca debe duplicar lógica que pertenezca a CORE o VERTICAL.

## Entrada única

La fábrica debe aceptar un manifiesto YAML validado. El manifiesto define al menos:

- cliente
- vertical
- modo_demo
- módulos habilitados
- sedes
- roles
- branding
- canales externos permitidos o bloqueados
- integraciones reales permitidas o bloqueadas
- datos mock obligatorios en demo

## Salida esperada

Una ejecución de la fábrica debe producir un proyecto aislado con:

- app responsive móvil/tablet/desktop
- navegación funcional
- módulos solicitados
- datos mock cuando `modo_demo: true`
- flujo de usuario principal navegable
- tests mínimos de unidad/integración del generador y del vertical
- build limpio
- README de ejecución
- evidencia de qué se generó y qué quedó pendiente
- cero secretos embebidos
- cero envíos externos si `canales_externos: false`

## Módulo oficial v1: generador de prototipos

Capacidades iniciales:

1. `chatbot_ia`
2. `crm`
3. `reservas`
4. `recuperacion_leads`
5. `dashboard`
6. `rbac` opcional
7. `auth` opcional
8. `logs` opcional

El generador debe ser idempotente: reejecutar sobre el mismo cliente no debe duplicar módulos ni romper personalizaciones existentes.

## Caso de aceptación 001 · Clínica Dental Demo

Debe recrear internamente el prototipo dental que se intentó construir en Lovable.

### Flujo demo

`consulta → clasificación → sede/tratamiento → datos ficticios → precalificación → huecos simulados → cita simulada → CRM simulado → seguimiento simulado → métricas`

### Intenciones

- primera visita
- implantes/cirugía
- ortodoncia
- estética
- urgencia
- consulta general

### Seguridad clínica

- no diagnóstico
- no prescripción
- no consejo médico
- ante contenido clínico sensible: derivación a profesional
- solo datos ficticios
- ningún email/WhatsApp/SMS real
- ninguna integración real

### Pantallas mínimas

1. Asistente IA
2. CRM simulado
3. Recuperación de leads
4. Dashboard de métricas

### Casos de prueba

1. Implantes/cirugía con financiación
2. Primera visita
3. Consulta fuera de horario
4. Abandono antes de reservar
5. Consulta clínica sensible

## Estructura objetivo

```text
fabrica-saas/
  core/
    app-shell/
    design-system/
    chatbot/
    crm/
    booking/
    recovery/
    dashboard/
    rbac/
    testing/
  verticals/
    dental/
  clients/
    clinica-dental-demo/
      manifest.yaml
      overrides/
  generator/
    schema/
    templates/
    scripts/
    tests/
```

La implementación física puede adaptarse al repo actual tras la auditoría previa; esta estructura es el modelo lógico, no una orden de mover archivos existentes sin análisis.

## Reglas de ejecución

- Auditar antes de crear cualquier pieza nueva.
- Reutilizar componentes/servicios/endpoints existentes cuando sean compatibles.
- No tocar Auth estable, Omni estable ni otros módulos CP04 certificados salvo necesidad demostrada.
- No borrar ni mover archivos existentes en v1.
- No usar secretos reales en el caso dental.
- No activar canales externos.
- No desplegar a producción en esta fase.
- No hacer commit/push desde Claude salvo instrucción expresa del usuario; la primera ejecución debe trabajar localmente y mostrar diff/evidencia.

## Definition of Done v1

La v1 queda aceptada cuando, desde un único manifiesto dental y un único comando de generación, se obtiene localmente un prototipo navegable con las cuatro pantallas, los cinco casos de prueba, tests y build correctos, sin llamadas externas ni datos reales.

---

## Checkpoint v1 — Implementado y mergeado (2026-08-28)

### Git

| Campo | Valor |
|---|---|
| **PR** | #81 |
| **Rama** | `agency/fabrica-saas-prototipos-v1-20260828` |
| **Base** | `main` |
| **Merge commit** | `1b190201111f77d9b04879fa782d8df02f692ebf` |
| **Commit principal** | `cbb1628` — `feat(factory): add SaaS prototype generator v1 dental pilot` |
| **Archivos en PR** | 23 (+3.107 / -2) |
| **Fecha merge** | 2026-08-28 |

### Estructura física implementada

```text
fabrica-saas/
  core/
    AppShell.jsx        ← layout, Card, Badge, FicticioLabel, StatCard, SectionTitle, Divider
    mockData.js         ← pickRandom, formatDateEs, generateFutureSlots, isInsideWorkingHours
  verticals/
    dental/
      config.js         ← DENTAL_VERTICAL, detectaSensible(), getIntencion(), getSede(), estaEnHorario()
      mockData.js       ← MOCK_PACIENTES, MOCK_METRICAS, MOCK_LEADS_ABANDONO, MOCK_SLOTS
  clients/
    clinica-dental-demo/
      manifest.yaml
  generator/
    schema/
      manifestSchema.js ← validateManifest(), MODULOS_VALIDOS, VERTICALES_VALIDOS
    scripts/
      generate.mjs      ← parseSimpleYaml(), writeIdempotent(), generateRuntimeConfig(), runGeneration()
    tests/
      generator.test.mjs
      dental-cases.test.mjs
  output/
    clinica-dental-demo/
      DentalApp.jsx
      DentalChatbot.jsx
      DentalCrm.jsx
      DentalRecovery.jsx
      DentalDashboard.jsx
      main.jsx
      runtime-config.js ← generado por CLI, idempotente, SHA-256
```

### Capacidades v1 completadas

- AppShell reutilizable entre verticales (banner DEMO obligatorio sticky)
- Manifiesto YAML validado con parser propio (sin dependencias externas)
- Schema + validación: 8 módulos válidos, 6 verticales válidos, conflict mode_demo vs integraciones reales
- Generador CLI idempotente: `npm run factory:generate` — SHA-256, no sobrescribe si sin cambios
- `runtime-config.js` generado determinista (sin timestamp)
- Slug Unicode-safe: `.normalize('NFD')` antes de lowercase para caracteres acentuados
- Chatbot dental multi-step (intención → sede → franja → financiación → slots → confirmación)
- CRM simulado con filtros, filas expandibles, avatares, estados
- Recuperación de leads con secuencias y timeline
- Dashboard con métricas, BarChart CSS, DonutSimple SVG, TrendBadge
- Reservas simuladas (datos ficticios, sin envío real)
- Seguridad clínica: `detectaSensible()` con lista de keywords; sin diagnóstico, sin prescripción; mensaje de derivación incluye "profesional"
- Banner DEMO en todas las pantallas
- `FicticioLabel` en todos los datos ficticios
- Vite multi-page: `dental-demo.html` como segundo entry point
- `npm run factory:test`: `node:test` built-in, sin dependencias externas

### Evidencia técnica

| Métrica | Resultado |
|---|---|
| Tests | 59/59 PASS |
| Lint | PASS (0 errores ESLint) |
| Build | PASS (`npm run build`) |
| Llamadas HTTP externas | 0 |
| Secretos añadidos | 0 |
| Binarios/PDFs | 0 |

### Fixes aplicados durante implementación

1. `useState` importado sin uso en `AppShell.jsx` — eliminado
2. `startHour` param sin uso en `generateFutureSlots` — corregido (`startHour + (i % 3) * 2`)
3. `Badge` importado sin uso en `DentalChatbot.jsx` — eliminado
4. `SectionTitle` importado sin uso en `DentalCrm.jsx` — eliminado
5. `useTab` hook con react-refresh/only-export-components — eliminado
6. Mensaje de derivación sin "profesional" — corregido
7. `generateRuntimeConfig` no era idempotente por `new Date().toISOString()` — eliminado timestamp
8. Slug roto `cl-nica-dental-demo/` por acento en 'Clínica' — normalización NFD añadida

### Limitaciones conocidas (deuda v1)

- El generador v1 produce `runtime-config.js`; los componentes React siguen preescritos (no generados dinámicamente desde el manifiesto)
- RBAC runtime: pendiente — módulo habilitado en schema pero sin runtime wiring
- Auth runtime: pendiente
- Logs runtime: pendiente
- QA visual en navegador: pendiente (entorno sin navegador real)
- Un solo vertical implementado; reutilización multisector no demostrada aún
- `npm audit` reportó vulnerabilidades preexistentes del repo base; no corregidas en esta fase
- Directorio `cl-nica-dental-demo/` untracked (slug roto anterior al fix NFD): no en git, no en PR, inofensivo

### Madurez estimada

**Fábrica SaaS v1 ≈ 72 %** antes de comenzar v1.1.

Gaps para llegar al 100 %: generación dinámica de componentes desde manifiesto, RBAC/Auth/Logs runtime, QA visual, segundo vertical probado, README de ejecución final.

### Siguiente fase

| Campo | Valor |
|---|---|
| **Versión** | v1.1 |
| **Rama** | `agency/fabrica-saas-v1.1-fisioterapia-20260828` |
| **Objetivo** | Añadir vertical fisioterapia reutilizando CORE sin duplicar lógica |
| **Hipótesis** | Si CORE está bien aislado, el segundo vertical debe implementarse solo con `verticals/fisioterapia/` y `clients/<cliente>/` |
| **Métrica de éxito** | 0 líneas duplicadas de CORE/VERTICAL dental; tests PASS; build PASS |
