# FACTORY — Dynamic Performance Policy

**Versión:** V1.7
**Módulo:** `fabrica-saas/core/dynamicExperience/performanceBudget.js`

---

## Política de rendimiento (FACTORY_DYNAMIC_PERFORMANCE_POLICY)

La fábrica impone restricciones de rendimiento para garantizar que las apps
generadas sean funcionales en dispositivos reales, especialmente móviles.

---

## Presupuesto de animaciones

| Constante                       | Valor | Descripción                              |
|---------------------------------|-------|------------------------------------------|
| MAX_ANIMATIONS_CONCURRENT       | 5     | Máximo de animaciones simultáneas        |
| MOBILE_MAX_ANIMATIONS_CONCURRENT| 2     | Límite en móvil                          |
| MAX_STAGGER_CHILDREN            | 12    | Máximo de hijos en stagger               |
| COUNTER_ANIMATION_MAX_DURATION  | 3000ms| Duración máxima de contadores            |

## Presupuesto de scroll

| Constante                  | Valor | Descripción                              |
|----------------------------|-------|------------------------------------------|
| MAX_SCROLL_LISTENERS       | 3     | Máximo de efectos de scroll activos      |
| MOBILE_MAX_SCROLL_EFFECTS  | 2     | Límite en móvil                          |
| MOBILE_DISABLE_PARALLAX    | true  | Parallax siempre desactivado en móvil    |

## Presupuesto de vídeo

| Constante                   | Valor  | Descripción                              |
|-----------------------------|--------|------------------------------------------|
| MAX_VIDEO_SIZE_MB           | 10 MB  | Límite general de vídeo                  |
| MAX_HERO_VIDEO_SIZE_MB      | 6 MB   | Límite de hero video                     |
| MAX_AMBIENT_VIDEO_SIZE_MB   | 4 MB   | Límite de ambient loop                   |
| MOBILE_DISABLE_AMBIENT_VIDEO| true   | Ambient loop desactivado en móvil        |
| LAZY_LOAD_THRESHOLD_PX      | 200px  | Margen para lazy loading                 |

## Presupuesto de JavaScript

| Constante            | Valor  | Descripción                              |
|----------------------|--------|------------------------------------------|
| MAX_JS_ADDITIONAL_KB | 50 KB  | Budget adicional de JS por features      |

---

## Reglas automáticas por contexto

### Móvil (`isMobile: true`)

`getMobilePreset(preset)` aplica automáticamente:
- Elimina `parallax-subtle` de `scrollEffects`
- Limita scrollEffects a `MOBILE_MAX_SCROLL_EFFECTS` (2)
- Cambia `videoBehavior: 'ambient-loop'` → `'none'`
- Cambia `backgroundMotion: true` → `false`
- Reduce `motionIntensity: 'high'` → `'medium'`

### Reduced Motion (`reducedMotion: true`)

`getReducedMotionPreset(preset)` aplica según `reducedMotionFallback`:
- **static**: Elimina todas las animaciones
- **fade-only**: Solo permite fade-in, sin vídeo ambient
- **minimal**: Solo fade-in + slide-up, vídeo on-demand

### Data Saver

Si `videoConfig.dataSaverAware === true` y el contexto tiene `isDataSaver: true`,
el vídeo se desactiva automáticamente (`shouldDisableVideo()` → `true`).

---

## API

```js
import {
  PERFORMANCE_BUDGET,
  checkPerformanceBudget,
  getMobilePreset,
  getPerformancePolicyText,
} from './core/dynamicExperience/performanceBudget.js';

// Verificar si un preset pasa el budget
const result = checkPerformanceBudget(preset, { isMobile: true });
// { ok: boolean, warnings: string[], errors: string[] }

// Obtener preset adaptado para móvil
const mobilePreset = getMobilePreset(preset);

// Texto de política para documentación
const policy = getPerformancePolicyText();
```

---

## Integración con manifest

El sistema valida automáticamente:
- `preload: 'auto'` en background video → warning
- `ambient.mobileEnabled: true` → warning
- Alto número de scrollEffects en móvil → warning
- Motion alto en móvil → warning
