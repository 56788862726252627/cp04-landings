# Factory Motion Foundation V2

Motion wrappers built on `motion/react` (Framer Motion). All respect `prefers-reduced-motion`.

## Dependency

`motion` package installed in app/. No CDN, no peer deps issues with React 19.

## Usage

```jsx
import { Reveal, Stagger, MotionCard, AnimatedMetric } from 'fabrica-saas/core/designSystemV2';

// Scroll entrance
<Reveal direction="up" delay={100}>
  <h2>Título</h2>
</Reveal>

// Staggered list
<Stagger staggerDelay={0.07}>
  {features.map(f => <FeatureCard key={f.id} {...f} />)}
</Stagger>

// Animated card
<MotionCard hoverY={-4} hoverShadow="0 16px 48px rgba(0,0,0,.12)">
  <Card />
</MotionCard>

// Animated number
<AnimatedMetric value={2400} suffix="+" />
```

## Reduced Motion

All wrappers call `useReducedMotion()` internally. When the media query fires:
- `Reveal`, `Stagger`: initial = false (no initial hidden state)
- `MotionButton`, `MotionCard`: whileHover/whileTap = {}
- `PageTransition`, `MotionDrawer`, `MotionToast`: transitions have duration: 0
- `AnimatedMetric`: spring still plays (value-only change, not a motion concern)

## Performance

See `FACTORY_DYNAMIC_PERFORMANCE_POLICY.md` for V1 limits.
V2 additions: max 8 springs desktop / 3 mobile, max 4 layout animations.
