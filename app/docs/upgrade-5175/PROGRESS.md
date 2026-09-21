# PROGRESS — Upgrade UX 5175

## Estado: FASE 1 en curso

### Etapa 0 — Verificación repo REAL ✓ (2026-09-20)
- Proceso 5175: vite en /root/cp04-landings/app (PID 11908) — CONFIRMADO.
- Repo: /root/cp04-landings · branch docs/resultado-merge-pr52-66-20260727 · HEAD fbfaaea.
- Working tree: LIMPIO (0 cambios). 2 stashes antiguos ajenos (no tocar).
- Remoto: github.com/56788862726252627/cp04-landings.git
- Landing: src/components/landing/Landing.jsx (476 líneas) + LandingMedia + DemoRequestModal + landingExperience.css.

### Etapa 4 — Auditoría de la landing actual ✓
Clasificación por sección:
- Nav sticky (desktop+mobile, Escape, aria) → MANTENER (excelente)
- Hero (eyebrow+h1+sub+2 CTAs+mockup panel+video bg) → MANTENER (sólido)
- Problemas (4 cards before/after) → MANTENER
- LandingMedia (zona vídeos) → NO TOCAR (independiente, gated)
- Producto (6 FeatureCards) → MANTENER
- Automatizaciones (texto+checklist+card motor) → PULIR (añadir comparativa visual)
- Integraciones (4 reales + 2 futuras dashed) → MANTENER (honesto)
- Seguridad (3 cards) → MANTENER
- Testimonios (2, con badge DEMO) → MANTENER
- Planes (3, destacado) → MANTENER (bug detectado: p.descacado typo línea 419 — badge nunca se muestra; FIX)
- FAQ (5 items acordeón accesible) → MANTENER
- CTA final → MANTENER
- Footer → PULIR/AMPLIAR (pobre: solo marca+copyright+acceso clientes)
- Selector idioma: NO está en la landing pública (está en la app) → no añadir
- Responsive: media query 860px para nav; grids auto-fit → razonable

GAPS detectados (mejoras a aplicar):
1. BUG: typo `p.descacado` → badge "más elegido" del plan Club nunca se renderiza.
2. FALTA: sección comparativa manual vs Club Pádel 04 (patrón útil).
3. FALTA: footer enriquecido (navegación, contacto, legales).
4. PULIR: alternancia visual — secciones `--dark` consecutivas (Integraciones+Seguridad juntas).
5. PULIR: hero CTA secundario ya existe; ok.
6. FALTA: mini-bloque "cómo encaja en tu día" (operativa) — cubierto por automatizaciones; no duplicar.

Plan de cambios (quirúrgicos, solo Landing.jsx):
A. Fix typo descacado→destacado (badge plan Club).
B. Nueva sección COMPARATIVA (manual vs CP04) tras Problemas, con franja visual diferenciada.
C. Reordenar: Integraciones y Seguridad separadas (mover Integraciones antes de Testimonios, o alternar clase) — cambio mínimo: Integraciones pasa a franja estándar.
D. Footer enriquecido: 3 columnas (marca+tagline / navegación / contacto+acceso) + línea legal.
E. i18n: añadir claves nuevas para comparativa+footer en es-ES (fallback: si falta clave, tx devuelve la clave — usar textos por defecto del array como ya hace PROBLEMAS con tx() + keys; seguir patrón existente de claves landing.*).

### Siguiente acción: Etapa 1 — backup commit+tag local, luego push GitHub.


### Etapa 1 — Backup ✓ (2026-09-21 02:59)
- Commit backup: 0972aef · tag: backup-5175-pre-ux-20260921-0259
- Push GitHub: branch OK (b327d92..0972aef) + tag OK
- BACKUP.md creado con rollback exacto.

### Etapa 5 — Mejoras aplicadas ✓ (2026-09-21)
Archivos modificados:
1. src/components/landing/Landing.jsx:
   - FIX BUG: typo p.descacado→destacado (badge "más elegido" del plan Club ahora se muestra).
   - NUEVA sección comparativa (manual vs CP04, 4 filas, check/cross, franja limpia) tras zona de vídeos.
   - Footer enriquecido: 3 columnas (marca+tagline / navegación / acceso+demo) + línea legal RGPD.
   - Integraciones: clase --dark→--integraciones (rompe dos franjas oscuras consecutivas).
2. src/clients/club-padel-04/landingExperience.css:
   - .cp04-section--comparativa (gradiente sutil, sin imagen — evita repetir A-E).
   - .cp04-section--integraciones (padding propio 88/96px, responsive 720px).
3. src/i18n/translations.js:
   - PRODUCT_NINETEENTH_TRANSLATIONS: claves comparativa.* + footer.* (es-ES, en-GB, en-US; fallback es-ES para el resto).

### Etapa 7 — Pruebas ✓
- node --check translations.js: OK
- npm run build: PASS (8.02s)
- npm test: 2600 pass / 23 fail — MISMOS 23 que baseline (diff vacío verificado con stash): makeInventory/makeAppIntegrationMap/makeArchitectureMatrix/agencyApiRouter + fixtures fecha. CERO regresiones nuevas.
- vite HMR 5175: módulo Landing.jsx sirve comparativa + fix destacado.
- Cero cambios en: auth, RBAC, Worker, Make, Airtable, Supabase, Cloudflare, secrets, webhooks.

### Siguiente: commit final local + FINAL_REPORT.md. SIN segundo push.
