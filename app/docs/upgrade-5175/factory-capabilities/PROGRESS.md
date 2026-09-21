# PROGRESS — Fase 3A: Capacidades Factory en 5175

## Estado: EN CURSO (2026-09-21)

### Etapa 0 — Verificación ✓
- Repo 5175: /root/cp04-landings · branch docs/resultado-merge-pr52-66-20260727 · HEAD f7085ac (Fase 1).
- Backup Fase 1 intacto: 0972aef + tag backup-5175-pre-ux-20260921-0259 (en GitHub).
- Working tree limpio → checkpoint local extra no necesario (HEAD ya es el checkpoint).
- Factory: d79c88e (Fase 2) — solo lectura, no se modifica.

### Etapa 1 — Auditoría de datos reales ✓
- Canales sociales REALES encontrados: **NINGUNO** (ni WhatsApp, ni Instagram, ni
  TikTok, ni YouTube, ni X, ni Facebook, ni LinkedIn, ni email, ni teléfono).
- Dirección física REAL: **NINGUNA**.
- Decisión conforme a reglas del encargo:
  - ContactAndSocial: capacidad preparada (componente + config declarativa vacía
    + i18n) — NO se renderiza nada (cero enlaces muertos/ficticios).
  - PhysicalLocation: capacidad preparada — NO se renderiza (sin dirección real).
  - ProcessSection "Cómo empezar": ADD (contenido real del producto SaaS).
  - CTA "Ver disponibilidad" secundario en hero: ADD (enlaza al login real).
  - SKIP: TeamSection, GallerySection, BlogPreview, LeadForm (existe modal demo),
    MapSection, WhatsApp flotante.

### Plan:
1. src/clients/club-padel-04/socialChannels.js — config declarativa VACÍA (solo
   el dueño puede rellenarla con datos reales; documentado en el archivo).
2. src/components/landing/ContactAndSocial.jsx — componente nativo CP04 (tokens T,
   variantes, cero render sin canales) inspirado en la capability de la Factory.
3. Landing.jsx: sección "Cómo empezar" (ProcessSection nativo) + CTA secundario
   "Ver disponibilidad" + integración ContactAndSocial (condicional) + footer
   social compacto (condicional).
4. i18n: claves es-ES + en-GB/en-US (mínimo ES/EN) para todo lo nuevo.
5. Tests + build + verificación HMR 5175.

### Siguiente acción: crear socialChannels.js


### Etapa final — Verificación ✓ (2026-09-21)

- Build: PASS (4.74s). node --check: OK (translations, socialChannels).
- HMR 5175: Landing.jsx sirve como_empezar/ContactAndSocial/FooterSocial.
- Tests: 22-23 fail en suite global. Diff baseline vs cambios: los 22 del
  baseline idénticos + communityPolling:139 que es FLAKY (pasa 22/22 aislado
  con Y sin mis cambios — timing del suite global, no regresión). Cero
  regresiones nuevas reales.
- FINAL_REPORT.md creado.

### Estado: FASE 3A COMPLETADA
