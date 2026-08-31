# Factory Design Tokens V2

Source: `fabrica-saas/core/designSystemV2/tokens.js`

## Token Categories

### Motion
- `MOTION_DURATION` — instant(0) → dramatic(900ms)
- `MOTION_EASING` — 13 curves including spring, bounce, overshoot
- `MOTION_DISTANCE` — xs(4px) → xxl(64px) for translate animations
- `MOTION_SPRING` — stiff/medium/gentle/bouncy/wobbly/slow spring configs
- `STAGGER_DELAYS` — tight(40ms) → slow(180ms) per-child delay

### Interaction
- `INTERACTION_HOVER` — none/subtle/moderate/deep/lift (scale + shadow + translateY)
- `INTERACTION_TAP` — none/subtle/medium/strong/bounce (scale only)
- `INTERACTION_FOCUS` — ring/ringOffset/glow/none

### Depth
- `DEPTH_LEVELS` — flat → immersive (blur + opacity + scale)
- `ELEVATION` — 0-7 + inset + colored() function

### Visual Effects
- `BLUR` — none → ultra(80px)
- `GLASS` — light/dark/frosted + tinted(r,g,b) function
- `GRADIENT` — primary()/warm/cool/fresh/sunset/ocean/forest/slate/aurora/mesh()/noise

### Layout
- `DENSITY` — compact/comfortable/spacious/airy (spaceBase, padding, gap, lineHeight, borderRadius)
- `TYPE_SCALE` — xs → 7xl (rem values)
- `FONT_WEIGHT` — light(300) → black(900)

## CSS Variables

```js
import { buildV2CssVars } from 'fabrica-saas/core/designSystemV2/tokens.js';

const vars = buildV2CssVars({ density: 'comfortable', durationMultiplier: 1 });
// → { '--motion-fast': '150ms', '--gap': '16px', '--radius-card': '12px', ... }
```

Apply with `<div style={vars}>`.
