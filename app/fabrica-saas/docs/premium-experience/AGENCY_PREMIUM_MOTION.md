# Motion & Microinteracciones — ADV-07

**isReal:** false | **Módulos:** motionSystem, microinteractionEngine, ctaResolver

## Niveles de Motion

`createMotionPolicy(level)` — 4 niveles:

| Nivel | Uso | Características |
|-------|-----|----------------|
| NONE | Legal, emergencias | Sin animaciones. Máxima accesibilidad. |
| LOW | Dental, clínica | Transiciones sutiles, fade-in only |
| STANDARD | General | Micro-interacciones estándar, no hero |
| RICH | Beauty, luxury | Parallax, hero video, micro-animations |

## Suite de Interacciones

`buildInteractionSuite(motionLevel)` devuelve 10 interacciones con flag `useAnimation`:

1. `HOVER` — hover effects en botones/cards
2. `FOCUS` — ring de foco (siempre visible, incluso en NONE)
3. `CLICK` — feedback visual al hacer click
4. `PRESS` — estado pressed en mobile
5. `LOADING` — transición a estado loading
6. `SUCCESS` — celebración de éxito
7. `ERROR` — shake/shake suave de error
8. `TRANSITION` — transiciones entre páginas
9. `SCROLL` — reveal on scroll
10. `PARALLAX` — parallax hero (solo RICH)

## Política de Accesibilidad

`evaluateMotionPolicy(policy)` advierte cuando:
- Nivel RICH sin soporte para `prefers-reduced-motion`
- Parallax sin respaldo estático
- Duration > 500ms sin opción de omitir

Regla: todos los efectos de motion deben respetar:
```css
@media (prefers-reduced-motion: reduce) { /* disable all */ }
```

## CTAs y Jerarquía

`MAX_COMPETING_CTAS = 2` — máximo 2 CTAs primarios/secundarios compitiendo.

`evaluateCTACrowding(ctas)` usa campo `priority: 'PRIMARY' | 'SECONDARY'`.
- Si `primaries > 1`: overcrowded
- Si `total > 2`: overcrowded
