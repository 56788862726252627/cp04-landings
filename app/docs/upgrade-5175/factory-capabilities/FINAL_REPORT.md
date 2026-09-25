# FINAL REPORT — Fase 3A: Capacidades Factory en 5175

**Fecha:** 2026-09-21 · **Repo:** /root/cp04-landings · **Branch:** docs/resultado-merge-pr52-66-20260727

## Capacidades aplicadas (de la Fábrica Fase 2 → identidad CP04)

| Capability Factory | Decisión | Implementación CP04 |
|---|---|---|
| ProcessSection | **ADD** | Sección "Cómo empezar" (3 pasos reales del producto: demo → configuración → operativa), tokens T, glass sutil |
| CONTACT_AND_SOCIAL | **PREPARADA (oculta)** | ContactAndSocial.jsx + socialChannels.js (config declarativa VACÍA) — 0 canales reales encontrados |
| CTA adaptativo pádel | **ADD** | "Ver disponibilidad" (ghost) en hero → login real de la app |
| Footer social compacto | **PREPARADO (oculto)** | FooterSocial en el footer — solo renderiza con canales reales |
| PhysicalLocation / MapSection | **PREPARADA (oculta)** | Sin dirección real: no se crea sección (regla anti-dato-ficticio) |
| LeadForm | **SKIP** | Ya existe DemoRequestModal con el mismo propósito |
| TeamSection | **SKIP** | Sin datos reales de equipo |
| GallerySection | **SKIP** | Ya existe LandingMedia (zona de vídeos) — no duplicar |
| BlogPreview | **SKIP** | Sin blog real |

## Canales sociales reales encontrados

**NINGUNO.** Auditoría de src/ (landing, clients/club-padel-04, config, i18n): cero teléfonos, emails, handles o URLs sociales reales del club. Conforme a la regla del encargo: la capacidad queda implementada y configurada (socialChannels.js con instrucciones para el dueño), pero NO se renderiza nada — cero enlaces muertos. Cuando el dueño rellene un canal real, aparecerá automáticamente en sección + footer según placement, sin tocar código.

## Ubicación

Sin dirección física real confirmada → sin sección "Dónde encontrarnos", sin mapa, sin embed. La capability queda documentada para futura activación con dato real.

## Archivos modificados (5)

1. `src/clients/club-padel-04/socialChannels.js` — NUEVO: config declarativa vacía + resolveCp04SocialChannels (lógica Factory adaptada)
2. `src/components/landing/ContactAndSocial.jsx` — NUEVO: sección nativa CP04 + FooterSocial (render condicional a canales reales)
3. `src/components/landing/Landing.jsx` — sección "Cómo empezar" + integración ContactAndSocial + FooterSocial en footer + CTA "Ver disponibilidad"
4. `src/i18n/translations.js` — PRODUCT_TWENTIETH_TRANSLATIONS (es-ES, en-GB, en-US): 12 claves nuevas
5. `src/clients/club-padel-04/landingExperience.css` — .cp04-section--como-empezar y --contacto (franja limpia, responsive 720px)

## Identidad conservada

Tokens T existentes (negro/grafito, lima, glass), SectionTitle/Container/LandingBtn reutilizados, misma tipografía display, ritmo de franjas respetado (como-empezar entre planes y FAQ). Cero cambios en: hero existente, nav, problemas, vídeos, producto, automatizaciones, integraciones, seguridad, testimonios, planes, comparativa, FAQ, CTA final, login, auth/RBAC, Worker, Make, Airtable, Supabase, Cloudflare, secrets, webhooks.

## Accesibilidad

- Sección "Cómo empezar": ol semántico, números aria-hidden, contraste T.textDim sobre fondo oscuro
- ContactAndSocial (cuando se active): aria-label por canal, rel="noopener noreferrer" en externos, touch targets ≥32px
- FooterSocial: nav aria-label="Redes del club", targets 32px
- CTA "Ver disponibilidad": botón real con foco visible (LandingBtn ghost existente)

## Responsive

Grids auto-fit (como-empezar min 240px), media query 720px para padding de las dos secciones nuevas, flex-wrap en canales sociales. Validación visual en tablet pendiente de revisión humana (checklist en Fase 1 sigue vigente + nuevas secciones).

## Pruebas

- node --check: translations.js OK, socialChannels.js OK
- npm run build: **PASS** (4.74s)
- npm test: 23 fail en suite global — 22 preexistentes idénticos al baseline + communityPolling:139 FLAKY (22/22 PASS aislado con y sin cambios; timing del suite, no regresión). Cero regresiones nuevas.
- HMR 5175: módulo Landing.jsx sirve los cambios (12 menciones como_empezar/ContactAndSocial/FooterSocial)
- Cero llamadas Airtable/Make/Stripe/WhatsApp, cero efectos externos

## Rollback

```
cd /root/cp04-landings
git checkout docs/resultado-merge-pr52-66-20260727
git reset --hard <commit-fase-3A>~1   # vuelve a f7085ac (Fase 1)
# o al punto de restauración original:
git reset --hard backup-5175-pre-ux-20260921-0259
```
