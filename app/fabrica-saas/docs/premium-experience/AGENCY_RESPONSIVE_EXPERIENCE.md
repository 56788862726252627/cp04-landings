# Experiencia Responsive — ADV-07

**isReal:** false | **Módulos:** mobileExperienceProfile, tabletExperienceProfile, desktopExperienceProfile, responsiveTransformationEngine

## Breakpoints

| Dispositivo | Rango |
|-------------|-------|
| Mobile | < 768px |
| Tablet | 768–1199px |
| Desktop | ≥ 1200px |

## Viewports E2E (Playwright)

Los 5 viewports testados en `premiumExperience.spec.mjs`:

| Viewport | Tipo |
|----------|------|
| 375×667 | iPhone SE |
| 390×844 | iPhone 14 |
| 768×1024 | iPad |
| 1366×768 | Laptop |
| 1920×1080 | Desktop |

## Mobile

- `MIN_TAP_TARGET = 44px` — targets mínimos táctiles (WCAG 2.1 AA)
- `validateMobileTargets(elements)` — valida `{ width, height }` de cada elemento
- Bottom nav obligatoria en verticales mobile-first (veterinary, beauty, sports)

## Transformaciones Responsive

`buildTransformMatrix(layoutPattern)` devuelve:
- `mobile` → { collapseSidebar, stackColumns, bottomNav, reducePadding }
- `tablet` → { sidebarWidth, gridColumns, hybridNav }

Reglas críticas de transformación:
- SIDEBAR_LEFT → colapsa a hamburger en mobile
- Grid > 4 columnas → 2 columnas en tablet, 1 en mobile
- Dashboard con > 6 widgets → scroll paginado en mobile

## Checklist de Calidad

- [ ] Sin scroll horizontal en ningún viewport
- [ ] Tap targets ≥ 44×44px en mobile
- [ ] Texto legible sin zoom (min 14px base)
- [ ] Formularios usables con teclado virtual
- [ ] Imágenes con lazy loading + dimensiones declaradas
