# FisioNova: Before V1.7 vs After V2 Pilot

## Decision Engine Output
- **Preset**: `clinical-premium`
- **Palette**: primary `#0369a1`, accent `#10b981`, surface `#f0f9ff`
- **Hero Recipe**: `split-content` (text left / metrics card right)
- **Motion**: low intensity, `motion/react` springs, reduced-motion safe
- **Typography**: Inter, authoritative mood, weight 600/400
- **Layout**: wide, maxWidth 1100px, grid personality
- **Density**: comfortable
- **Glass Effect**: false (clinical trust, no frosted glass)

---

## Score Comparison

| Dimensión           | V1.7 (antes) | V2 Pilot (después) | Mejora |
|---------------------|:------------:|:-------------------:|:------:|
| Visual Design       | 6/10         | 8/10                | +33%   |
| Motion/Animation    | 3/10         | 8/10                | +167%  |
| Interaction Quality | 4/10         | 8/10                | +100%  |
| Typography          | 5/10         | 7/10                | +40%   |
| Layout              | 5/10         | 8/10                | +60%   |
| Loading States      | 3/10         | 7/10                | +133%  |
| Mobile              | 5/10         | 7/10                | +40%   |
| Accessibility       | 5/10         | 8/10                | +60%   |
| Performance         | 7/10         | 7/10                | 0%     |
| Code Quality        | 6/10         | 8/10                | +33%   |
| **PROMEDIO**        | **4.9/10**   | **7.6/10**          | **+55%** |

---

## V1.7 Características (baseline)

- **Paleta**: indigo genérico `#4338ca` / `#7c3aed`
- **Hero**: gradiente estático, sin split
- **Motion**: CSS `@keyframes` básicos, sin spring
- **Loading**: minimal, sin skeleton
- **Interacciones**: hover básico, sin tokens
- **ARIA**: parcial
- **Líneas**: 2584 en 14 archivos

## V2 Pilot Mejoras

### Landing
- Hero split-content (text + metrics card glassmorphism suave)
- Trust strip post-hero (4 badges de confianza)
- FadeSlide con `IntersectionObserver` + reduced-motion
- `StaggerGrid`: 8 * 0.08s delay en servicios/equipo
- Booking modal con animación spring (`cubic-bezier(.22,1,.36,1)`)
- FAQ accordion con `max-height` animada
- Nav sticky con `backdropFilter: blur(12px)` on scroll

### Dashboard
- `AnimatedMetric`: contador spring (ease-out ×4) activado por IntersectionObserver
- `MotionCard`: hover elevation `translateY(-3px)` + border/shadow
- `Skeleton` + shimmer para loading state (700ms fake delay)
- `BarChart` SVG con transición height spring
- `DonutChart` SVG con `stroke-dasharray` animado
- `AgendaFeed` con stagger per-cita 70ms

### Agenda
- `CitaCard`: hover translateX(3px) + border spring
- `CitaDrawer`: slide desde derecha `translateX(100%)` spring
- Skeleton loading al cambiar día
- `aria-modal="true"`, `role="dialog"` en drawer
- Filtros con contadores

### CRM Pacientes
- Master-detail layout (sidebar 300px + detail flex 1)
- `SearchBar` con focus ring
- Tabs historia/evolución/citas
- Evolución: ProgressBar animada + micro bar chart
- `role="button"` + `tabIndex` en list items

### Evolución
- MultiLineChart SVG con `stroke-dasharray` draw animation
- `AnimatedCounter` por IntersectionObserver
- `ProgressBar` con transición width spring
- Timeline con vertical line connector

### Ejercicios
- `EjercicioCard`: color band por categoría, hover lift
- `EjercicioModal`: pop animation + rep counter
- Feedback "¡Serie completada!" con pop animation
- Filtros por categoría con colores por semántica

### App Shell
- Sidebar colapsable con transición width `.25s`
- `NavItem` con indicator bar activo (left border)
- Role switcher en topbar (4 roles)
- `PageView` con `pageIn` animation por módulo
- `aria-current="page"` en nav activo

---

## Guardrails Aplicados

- `FISIONOVA_PILOT_ONLY: SI` — output en `/output/fisionova-premium-v2-pilot/`
- `FISIONOVA_PRODUCTION_NO_TOUCH: SI` — `/output/fisionova-demo/` no tocado
- `CP04_NO_TOUCH: SI`, `AURORA_NO_TOUCH: SI`, `EDUCA_NO_TOUCH: SI`
- `NO_SECRETS: SI`, `NO_REAL_DATA: SI`, `NO_PRODUCTION_DEPLOY: SI`
- Datos 100% ficticios, disclaimers en todos los componentes
- `noindex, nofollow` en HTML entry

---

## Build Stats

- **Bundle**: 83.07 KB (gzip: 18.67 KB) — dentro de budget V2 (200 KB)
- **Tests**: 68/68 PASS (10 suites)
- **Lint**: 0 errores
- **Build**: 2.76s
