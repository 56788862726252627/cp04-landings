# Design System Premium — ADV-07

**isReal:** false | **Módulos:** designTokenEngine, typographySystem, spacingRhythmEngine, surfaceSystem

## Tokens de Diseño

Generados por `generateDesignTokens(profile)`. Salida: `{ spacing, radius, elevation, focus, motion }`.

| Densidad | Efecto |
|----------|--------|
| COMPACT | Espaciado reducido, padding mínimo |
| BALANCED | Proporción áurea, legible |
| SPACIOUS | Más aire, premium/luxury |

## Tipografía

7 perfiles disponibles:

| Perfil | Uso típico | Fuentes |
|--------|-----------|---------|
| WARM_HUMANIST | Veterinaria, pediatría | Nunito, Open Sans |
| ELEGANT_DISPLAY | Beauty, moda | Palatino, Lato |
| SERIF_AUTHORITY | Legal, finanzas | Georgia, Merriweather |
| BOLD_SPORT | Deportes, pádel | Roboto Condensed, Inter |
| MODERN_SANS | General, SaaS | Inter, system-ui |
| CLEAN_MODERN | Dental, clínica | Poppins, Roboto |
| FRIENDLY_READABLE | Educación, terapia | Nunito, Open Sans |

## Superficie

5 perfiles × 9 tipos de superficie (`BASE, ELEVATED, INTERACTIVE, HIGHLIGHT, SUCCESS, WARNING, DANGER, INFO, GLASS`):

| Perfil | Carácter visual |
|--------|----------------|
| LAYERED | Sombras sutiles, neutral |
| WARM_LAYERED | Tonos cálidos, acogedores |
| NEUTRAL_MINIMAL | Sin sombras, denso, formal |
| PREMIUM_GLASS | Glassmorphism, luxury |
| HIGH_CONTRAST | Accesibilidad máxima |

## Uso

```js
import { generateDesignTokens, createTypographyProfile, buildSurfaceSystem } from '../premium-experience/index.js';
const profile = createPremiumExperienceProfile({ vertical: 'beauty', visualDensity: 'SPACIOUS' });
const tokens  = generateDesignTokens(profile);
const typo    = createTypographyProfile('ELEGANT_DISPLAY');
const surface = buildSurfaceSystem('PREMIUM_GLASS');
```
