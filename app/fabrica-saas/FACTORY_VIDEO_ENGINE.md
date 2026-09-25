# FACTORY — Video Engine V1.7

**Módulo:** `fabrica-saas/core/dynamicExperience/videoEngine.js`
**Extensión mediaEngine:** `fabrica-saas/core/mediaEngine.js` (getVideoPlaceholderPoster, resolveManifestMediaV17)

---

## Tipos de vídeo soportados

| Tipo              | Uso                              | Auto/Manual |
|-------------------|----------------------------------|-------------|
| `heroVideo`       | Vídeo en hero section            | Manual      |
| `serviceVideo`    | Vídeo de servicio individual     | Manual      |
| `backgroundVideo` | Fondo de sección                 | Auto (ambient defaults) |
| `testimonialVideo`| Testimonio de cliente            | Manual      |
| `explainerVideo`  | Vídeo explicativo / how-it-works | Manual      |
| `teamVideo`       | Presentación del equipo          | Manual      |
| `ambientLoop`     | Loop ambiental de fondo          | Auto        |

---

## Reglas de seguridad (OBLIGATORIAS)

1. **autoplay siempre requiere muted: true** (requisito del navegador).
   El motor lo fuerza automáticamente — no se puede desactivar.

2. **ambient y background** tienen `autoplay: true` y `muted: true` por defecto.

3. **mobile + ambient** → video desactivado por defecto (`mobileEnabled: false`).

4. **reducedMotion + ambient** → video desactivado siempre.

5. **data saver** → video desactivado cuando `dataSaverAware: true` en config.

---

## buildVideoConfig()

```js
import { buildVideoConfig } from './core/dynamicExperience/videoEngine.js';

const cfg = buildVideoConfig(
  { src: '/video.mp4', autoplay: false, controls: true },
  'dental',
  'heroVideo'
);
// {
//   src: '/video.mp4',
//   sources: [{ src: '/video.mp4', type: 'video/mp4' }],
//   poster: '<data URI SVG placeholder>',
//   muted: true,         // siempre true si autoplay=true
//   autoplay: false,
//   loop: false,
//   controls: true,
//   preload: 'metadata',
//   lazy: true,
//   mobileEnabled: true,
//   type: 'heroVideo',
//   placeholder: false,
//   staticFallback: null,
// }
```

---

## resolveVideoManifest()

Resuelve los 7 tipos de vídeo a partir del manifest:

```js
import { resolveVideoManifest } from './core/dynamicExperience/videoEngine.js';

const video = resolveVideoManifest(manifest, 'dental');
// {
//   hero:         VideoConfig,
//   background:   VideoConfig,
//   services:     VideoConfig,
//   testimonials: VideoConfig,
//   explainer:    VideoConfig,
//   team:         VideoConfig,
//   ambient:      VideoConfig,
// }
```

---

## shouldDisableVideo()

```js
import { shouldDisableVideo } from './core/dynamicExperience/videoEngine.js';

const disabled = shouldDisableVideo(videoConfig, {
  isMobile:     false,
  isDataSaver:  false,
  reducedMotion: false,
});
// true → no mostrar el vídeo, usar fallback poster
```

---

## getVideoFallback()

Cuando el vídeo no puede reproducirse:

```js
const fallback = getVideoFallback(videoConfig);
// { type: 'image', src: poster, alt: '...', placeholder: true }
```

---

## Poster placeholder automático

Si no se proporciona `poster`, se genera automáticamente un SVG con el color
del sector correspondiente y dimensiones apropiadas:
- Hero/Services: 1280×720
- Background/Ambient: 1920×1080

```js
import { getVideoPlaceholderPoster } from './core/mediaEngine.js';
const poster = getVideoPlaceholderPoster('dental', 'hero');
// 'data:image/svg+xml;base64,...'
```

---

## Manifest V1.7 — configuración de vídeo

```yaml
video:
  autoplay: false     # global default
  muted: true
  mobileEnabled: false
  lazyLoad: true

  hero:
    autoplay: false   # override para el hero
    controls: true
    preload: metadata
    poster: null      # usa placeholder automático

  ambient:
    autoplay: true    # permitido solo si muted: true
    muted: true
    loop: true
    controls: false
    mobileEnabled: false
```

---

## validateVideoPerformance()

Devuelve warnings (no errores) sobre configuración de rendimiento:
- `preload: 'auto'` → warning de impacto en carga inicial
- `autoplay: true` sin `lazy: true` → warning de bloqueo de render
- `backgroundVideo` con `mobileEnabled: true` → warning de datos móvil
