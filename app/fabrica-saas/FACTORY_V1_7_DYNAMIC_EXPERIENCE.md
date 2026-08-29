# FACTORY V1.7 — Dynamic Experience Engine

**Estado:** IMPLEMENTADO — Rama `feature/factory-v1.7-dynamic-experience`
**Tests:** 1179/1179 PASS (275 nuevos en V1.7)
**Backward compatible:** V1.5 ✓ V1.6 ✓ V1.6.1 ✓

---

## Qué es

El Dynamic Experience Engine convierte la fábrica SaaS en un generador de apps
con experiencias de usuario parametrizables y específicas por vertical. Cada app
generada puede tener un perfil de movimiento, interacciones y comportamiento de
vídeo configurados desde el manifest.

---

## Arquitectura

```
fabrica-saas/core/dynamicExperience/
├── presets.js          11 presets de experiencia (subtle → immersive)
├── verticalMapping.js  Mapeo vertical → preset recomendado + interacciones
├── motionConfig.js     CSS motion tokens + reduced-motion utilities
├── videoEngine.js      Gestión segura de vídeo (autoplay safety, posters)
├── interactionEngine.js 18 interacciones parametrizables
├── performanceBudget.js Restricciones de rendimiento y mobile budget
├── components.js       Funciones puras de configuración de componentes (testables)
└── index.js            Re-exportación central + getExperienceConfig()
```

---

## Presets disponibles

| Preset        | Motion | Velocidad  | Uso recomendado           |
|---------------|--------|------------|---------------------------|
| `subtle`      | low    | slow       | Pacientes, legal          |
| `professional`| low    | normal     | Clínicas, consultas       |
| `clinical`    | low    | fast       | Dental, salud             |
| `calm`        | low    | very-slow  | Fisio, psicología         |
| `editorial`   | medium | slow       | Publicaciones, agencias   |
| `luxury`      | medium | very-slow  | Peluquería, estética       |
| `friendly`    | medium | normal     | Veterinaria, logopedia    |
| `energetic`   | high   | fast       | Deportes, fitness         |
| `sports`      | high   | fast       | Clubes deportivos         |
| `tech-premium`| medium | fast       | Tech, SaaS, agencias      |
| `immersive`   | high   | slow       | Luxury brands, inmersión  |

---

## Manifest V1.7

Los manifests V1.5 y V1.6 siguen siendo 100% válidos. Los campos nuevos son opcionales:

```yaml
version: "1.7"
vertical: physio

# NUEVO: Experience config
experience:
  preset: calm          # uno de los 11 presets
  motion: low           # none | low | medium | high
  scrollEffects:
    - fade-in
    - slide-up
    - counter-on-visible
  interactions:
    - animated-metrics
    - expandable-cards
  animatedMetrics: true
  reducedMotion: auto   # auto | always | never

# NUEVO: Video engine config
video:
  autoplay: false
  muted: true           # obligatorio si autoplay: true
  mobileEnabled: false
  lazyLoad: true
  hero:
    autoplay: false
    controls: true
    preload: metadata

# NUEVO: Secciones dinámicas
dynamicSections:
  - type: metric-row
    trigger: on-view
    behavior: animate-count
  - type: faq-accordion
    trigger: immediate
    behavior: expand-on-click
```

---

## API principal

```js
import { getExperienceConfig } from './core/dynamicExperience/index.js';

const cfg = getExperienceConfig(manifest, {
  isMobile: false,
  reducedMotion: false,
});

// cfg contiene:
// {
//   preset,              // config completa del preset
//   presetName,          // 'calm'
//   vertical,            // 'physio'
//   motionCss,           // CSS custom properties
//   video,               // 7 tipos de vídeo resueltos
//   heroType,            // 'split-content'
//   emotionalTone,       // 'recuperación, tranquilidad...'
//   recommendedInteractions,
//   activeInteractions,
//   isMobile,
//   reducedMotion,
// }
```

---

## Flujo de resolución

```
manifest.experience.preset
         │
         ▼
 getDefaultPresetForVertical(vertical)
         │
         ▼
    resolvePreset(name, overrides)
         │
    [reducedMotion?] → getReducedMotionPreset()
         │
    [isMobile?]     → getMobilePreset()
         │
         ▼
    buildMotionCss(preset)  ──→  CSS vars
    resolveVideoManifest()  ──→  7 video configs
    getExperienceConfig()   ──→  resultado final
```

---

## Accesibilidad

- `prefers-reduced-motion` es OBLIGATORIO. `buildReducedMotionCss()` genera las
  overrides CSS; se inyecta automáticamente en el stylesheet generado.
- Todos los preset tienen `reducedMotionFallback` (static | fade-only | minimal).
- Componentes animados incluyen `getAnimationA11yProps()` para ARIA.
- Vídeo ambient desactivado siempre en reduced-motion.

---

## Education vertical

Vertical `education` está arquitectónicamente preparado pero **no implementado**.
Ver `FACTORY_EDUCATION_VERTICAL_READINESS.md` para detalles.

---

## Restricciones de alcance

- NO toca `src/` (app Club Pádel 04)
- NO toca Worker CP04, Make CP04, Airtable CP04
- NO hay datos reales ni credenciales
- NO hay deploy a producción
