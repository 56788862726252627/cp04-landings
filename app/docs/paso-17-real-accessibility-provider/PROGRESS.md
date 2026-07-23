# Paso 17 — progreso (archivo de recuperación ante interrupciones)

No commitear checkpoints incompletos con push. Consolidar al final en un único commit atómico.

- [x] Fase 1 — precheck y aislamiento: DONE (rama feature/real-accessibility-provider-20260723, worktree /root/cp04-t-real-accessibility-provider, base 09d722f, baseline 970/970 tests, lint 4 preexistentes, build OK)
- [x] Fase 2 — contrato del proveedor de accesibilidad real: accessibilityProviderPlugin.js reescrito (status:"real", collect({pages,profileId}), sin red/navegador/credenciales)
- [x] Fase 3 — análisis de accesibilidad (A-J, con K = mapeo WCAG en cada finding.wcag): a11yAnalyzer.js + a11yHtmlExtractors.js + a11yContrast.js (cálculo de contraste WCAG real)
- [x] Fase 4 — evidencias: a11yEvidence.js (finding -> Evidence válida, sourceType "accessibility_analysis_derived" nuevo), bridge conecta accessibilityProvider tras seoProvider tras publicWebsiteFetcher (paso explícito generalizado runDerivedPageAnalysisProvider, reutilizado también por seoProvider)
- [x] Fase 5 — scoring: a11yScoring.js (9 grupos: structure/images/forms/navigation/aria/tables/keyboard/contrast/content), comprobaciones manuales nunca penalizan, disclaimer explícito de no-certificación
- [x] Fase 6 — perfiles sectoriales: a11ySectorRules.js (10 perfiles + genérico, dato puro)
- [x] Fase 7 — recomendaciones: a11yRecommendations.js (dedupe, severidad incl. manual_review, criterio WCAG, sin afirmar certificación)
- [x] Fase 8 — CLI: --accessibility/--accessibility-only/--include-accessibility/--exclude-accessibility/--wcag-level/--explain-accessibility-score/--show-manual-checks en research-audit.mjs; research-accessibility.mjs nuevo (offline --local-file/--demo + auditoría completa --url)
- [x] Fase 9 — validación E2E: offline (demo/local-file), fixtures, auditoría completa multiprovider con 3 proveedores reales, red real contra example.com (CLI con --seo-only --accessibility-only), timeout accessibility real verificado, idempotencia, dedupe/conflicto — 1063/1063 tests
- [x] Fase 10 — tests: 1063-970=93 tests nuevos, todos offline por defecto salvo la validación manual E2E
- [x] Fase 11 — documentación: 7 documentos en docs/paso-17-real-accessibility-provider/ (arquitectura, scoring, revisión manual/privacidad, perfiles/CLI, informe técnico, roadmap 21 pasos)
- [x] Fase 12 — validación final: en curso (ver commit final)
- [ ] Fase 13 — git y PR
