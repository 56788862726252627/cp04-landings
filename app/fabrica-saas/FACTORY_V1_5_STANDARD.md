# FACTORY_V1_5_PREMIUM_VERTICAL_STANDARD

## Qué es

V1.5 es el estándar de calidad premium de la Fábrica SaaS multisector. Establece:

- **Design System parametrizable** — tokens por vertical (dental, fisioterapia, estética, abogados), override desde branding
- **AppShell premium** — sidebar de navegación en desktop, header con breadcrumb, layout responsive
- **Módulos dentales profundos** — Landing, Agenda, Tratamientos, Profesionales, Presupuestos
- **MockData enriquecida** — 12+ tratamientos, 8+ citas de agenda, 6+ presupuestos, 4+ profesionales
- **Manifest V1.5** — campos branding.tagline, branding.tono, experiencia.publica/interna/booking_cta
- **Aislamiento garantizado** — cada cliente genera código sin referencias a otros clientes

---

## Design System

**Archivo:** `fabrica-saas/core/branding/designSystem.js`

### Uso básico

```js
import { getTokens, generateThemeCss, getVerticalSector } from '../../core/branding/designSystem.js';

// Obtener tokens del vertical con override de branding
const tokens = getTokens('dental', { primaryColor: '#0c7873', secondaryColor: '#0284c7' });

// Generar CSS con custom properties
const css = generateThemeCss(tokens);
// → :root { --color-primary: #0c7873; --font-sans: ...; ... }

// Metadata del sector
const sector = getVerticalSector('dental');
// → { icon: '🦷', entity: 'Paciente', service: 'Tratamiento', booking: 'Cita', ... }
```

### Verticales disponibles

| Vertical | Primary | Tono | Sector |
|---|---|---|---|
| `dental` | `#0c7873` (teal) | sanitario, limpio | Clínica Dental |
| `fisioterapia` | `#0d9488` (teal) | bienestar | Clínica Fisioterapia |
| `estetica` | `#9d174d` (rose) | lujo, premium | Centro de Estética |
| `abogados` | `#1e3a5f` (navy) | sobrio, corporativo | Despacho de Abogados |

---

## AppShell V1.5

**Archivo:** `fabrica-saas/core/AppShell.jsx`

### Componentes exportados

| Componente | Descripción |
|---|---|
| `AppShell` | Layout principal con sidebar + header |
| `Card` | Tarjeta de contenido (title, subtitle, action, padding) |
| `Badge` | Pill de estado (colores: blue, green, teal, yellow, red, gray, purple, orange, indigo) |
| `StatCard` | Tarjeta de métrica con icono, valor, trend |
| `FicticioLabel` | Etiqueta "FICTICIO" para datos demo |
| `SectionTitle` | Título de sección con subtítulo y acción |
| `Divider` | Separador horizontal (opcional con label) |
| `HeroSection` | Banner hero con degradado, badge, CTAs |
| `MetricGrid` | Grid de StatCards (cols configurable) |
| `Table` | Tabla con headers y filas, maneja empty state |
| `EmptyState` | Estado vacío con icono, título, subtítulo |
| `Loader` | Indicador de carga |
| `PillTabs` | Tabs tipo pill para filtros |
| `TimelineItem` | Item de línea de tiempo con icono y conector |

### AppShell props

```jsx
<AppShell
  tabs={[{ id: 'landing', label: 'Inicio', icon: '🏠' }]}
  activeTab="landing"
  onTabChange={setActiveTab}
  branding={{ nombre: 'Clínica Aurora', inicial: 'A', color: '#0c7873' }}
>
  {children}
</AppShell>
```

---

## Manifest V1.5

### Nuevos campos

```yaml
branding:
  tagline: "Salud dental de excelencia para toda la familia"  # Subtitle hero
  secondaryColor: "#0284c7"   # Color secundario (opcional)
  accentColor: "#06b6d4"      # Color de acento (opcional)
  tono: "profesional, cercano y confiable"  # Tono comunicativo

experiencia:
  publica: true         # Si tiene landing pública
  interna: true         # Si tiene panel de operaciones interno
  booking_cta: "Reservar cita gratis"  # CTA principal

modules:
  - landing             # V1.5: Hero + servicios + CTA
  - chatbot_ia          # V1.0+: Chatbot de reservas
  - agenda              # V1.5: Agenda semanal de citas
  - tratamientos        # V1.5: Catálogo de servicios
  - pacientes_crm       # V1.5 alias de crm
  - profesionales       # V1.5: Equipo médico
  - recuperacion_leads  # V1.0+: Pipeline de leads
  - presupuestos        # V1.5: Gestión presupuestos
  - dashboard           # V1.0+: Dashboard ejecutivo
```

### Validación

```js
import { validateV15Fields } from '../schema/v1.5Schema.js';
const { valid, warnings, v15Fields } = validateV15Fields(manifest);
```

---

## Cómo generar un cliente V1.5

### 1. Crear manifest

```bash
cp fabrica-saas/clients/clinica-dental-aurora-demo/manifest-gen.yaml \
   fabrica-saas/clients/mi-clinica-demo/manifest-gen.yaml
# Editar: business.name, business.slug, branding, sedes, demoData
```

### 2. Generar output

```bash
node fabrica-saas/generator/scripts/create-client.mjs \
  --manifest fabrica-saas/clients/mi-clinica-demo/manifest-gen.yaml --verbose
```

Genera en `fabrica-saas/output/<slug>/`:
- `MockData.js` — datos ficticios (+ MOCK_TRATAMIENTOS, MOCK_PRESUPUESTOS, MOCK_AGENDA si V1.5)
- `App.jsx` — shell con todos los tabs
- `Landing.jsx`, `Agenda.jsx`, `Tratamientos.jsx`, `Profesionales.jsx`, `Presupuestos.jsx` — módulos V1.5
- `Chatbot.jsx`, `Crm.jsx`, `Dashboard.jsx`, `Recovery.jsx` — módulos base
- `main.jsx` — entry point React

### 3. Build y deploy

```bash
npm run build
node fabrica-saas/generator/scripts/prepare-deploy.mjs \
  --manifest fabrica-saas/clients/mi-clinica-demo/manifest.yaml
# Deploy package listo en fabrica-saas/deploy/<slug>/
```

---

## Cómo replicar a otro sector (ejemplo: fisioterapia)

1. Crear vertical config en `fabrica-saas/verticals/fisioterapia/config.js`
2. Crear manifest `manifest-gen.yaml` con `vertical: fisioterapia`
3. Los tokens de color/tipografía se aplican automáticamente desde `VERTICAL_TOKENS.fisioterapia`
4. Los módulos landing/agenda/tratamientos/profesionales/presupuestos se generan con el mismo generador
5. `getVerticalSector('fisioterapia')` devuelve: entity=Paciente, service=Tratamiento, booking=Sesión

---

## QA Checklist por cliente

- [ ] `<title>` contiene nombre del cliente, no "Club Pádel 04"
- [ ] favicon tiene inicial y color primario del cliente
- [ ] `<meta name="theme-color">` coincide con `branding.primaryColor`
- [ ] `genMockData()` no contiene datos de otro cliente
- [ ] `validateClientContent()` pasa sin errores de contaminación CP04
- [ ] Todos los tabs V1.5 renderizan sin errores de importación
- [ ] MockData marcada con "(ficticio)" en textos
- [ ] Banner demo visible: "PROTOTIPO INTERNO · DATOS 100% FICTICIOS"
- [ ] Sidebar muestra nombre del cliente y badge "DEMO V1.5"
- [ ] `npm run factory:test:all` → 683/683 PASS
- [ ] `npm run lint` → 0 errores
- [ ] `npm run build` → ✓ sin errores

---

## Aislamiento entre clientes

La Fábrica garantiza aislamiento mediante:

1. **Un slug único por cliente** → directorio de output separado
2. **`validateClientContent(html, slug)`** → bloquea si detecta contenido de CP04
3. **Deploy package isolado** → `fabrica-saas/deploy/<slug>/` con solo los assets del cliente
4. **MockData generada por manifest** → cada cliente tiene sus propios datos ficticios
5. **Tests de aislamiento** (Cat. 13 en v1.5-cases.test.mjs) → verifican 0 referencias CP04

---

## Tests V1.5

```bash
npm run factory:test:v1.5   # 110 tests V1.5 solamente
npm run factory:test:all    # 683 tests completos (V1.0–V1.5)
```

Cobertura V1.5:
- Design system tokens (14 tests)
- AppShell V1.5 exports (18 tests)
- genLanding() (8 tests)
- genAgenda() (5 tests)
- genTratamientos() (5 tests)
- genProfesionales() (5 tests)
- genPresupuestos() (5 tests)
- genApp() V1.5 tabs (11 tests)
- genMockData() V1.5 (7 tests)
- genDashboard() V1.5 (7 tests)
- validateV15Fields() (8 tests)
- Output Aurora generado (9 tests)
- Aislamiento CP04 (8 tests)
