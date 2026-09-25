# UX por Negocio/Vertical — ADV-07

**isReal:** false | **Módulos:** industryVisualAdapters, businessExperienceOverride, businessFitEngine, businessExperienceResolver

## Verticales (12)

Cada vertical resuelve automáticamente: paleta, tipografía, densidad, patrón de navegación, layout, señales de confianza, tono de copy.

| Vertical | Personalidad | Superficie | Patrón |
|----------|-------------|-----------|--------|
| dental | CLINICAL_WARM | LAYERED | BOOKING_FIRST |
| physio | WARM + CLINICAL | WARM_LAYERED | SPLIT |
| psychology | CALM + TRUSTED | NEUTRAL_MINIMAL | INFO |
| speech_therapy | FRIENDLY + WARM | WARM_LAYERED | CARDS |
| sports | SPORTY + MODERN | LAYERED | FULL_BLEED |
| padel | SPORTY | LAYERED | BOOKING_FIRST |
| veterinary | WARM + TRUSTED | WARM_LAYERED | BOOKING_FIRST |
| hairdresser | WARM + PLAYFUL | WARM_LAYERED | GALLERY |
| beauty | PREMIUM + LUXURY | PREMIUM_GLASS | GALLERY |
| legal | PROFESSIONAL | NEUTRAL_MINIMAL | INFO_DENSE |
| fertility | WARM + CLINICAL | WARM_LAYERED | INFO |
| education | TRUSTED + FRIENDLY | LAYERED | CARDS |

## Perfiles de Negocio (5)

Overrides sobre el perfil vertical base:

| Perfil | Carácter |
|--------|---------|
| PREMIUM_URBAN | Alto precio, glass, SPACIOUS |
| FAMILY_LOCAL | Cercanía, cálido, BALANCED |
| EMERGENCY_24H | Urgencia, alto contraste, COMPACT |
| SPECIALIST | Autoridad, serif, NEUTRAL_MINIMAL |
| BOUTIQUE | Exclusividad, luxury, PREMIUM_GLASS |

## Evaluación de Ajuste

`evaluateBusinessExperienceFit(profile, vertical)` — valida que el perfil es coherente con el vertical.

## Uso

```js
import { resolvePremiumExperience, getIndustryAdapter } from '../premium-experience/index.js';
const result = resolvePremiumExperience({ vertical: 'legal', businessType: 'SPECIALIST' });
// result.profile → perfil final
// result.resolvedFrom → 'VERTICAL' | 'DEFAULT'
// result.isReal → false
```
