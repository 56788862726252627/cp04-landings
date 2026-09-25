# Paso 18 — progreso (archivo de recuperación ante interrupciones)

No commitear checkpoints incompletos con push. Consolidar al final en un único commit atómico.

- [x] Fase 1 — precheck y aislamiento: DONE (rama feature/real-performance-provider-20260723, worktree /root/cp04-t-real-performance-provider, base c4629cb, baseline REAL verificado post-hoc contra c4629cb: 1017/1017 tests — la nota original de esta fase decía "1063", cifra heredada por error del informe de Paso 17; corregida aquí tras verificación directa con `git archive c4629cb`; lint 4 errores + 1 warning preexistentes, build OK)
- [x] Fase 2 — contrato del proveedor de rendimiento real: DONE (performanceProviderPlugin.js reescrito como proveedor real, id/version/priority/capabilities/credentialsNeeded/limitations/collect/healthCheck; 9/9 tests propios en verde)
- [x] Fase 3 — análisis de rendimiento (A-J): DONE (perfHtmlExtractors.js + perfAnalyzer.js, categorías response/html/resources/images/javascript/css/fonts/caching/mobile/derived; 24+11 tests en verde)
- [x] Fase 4 — evidencias: DONE (perfEvidence.js, sourceType "performance_analysis_derived" añadido a evidenceSchema.js; 6/6 tests en verde)
- [x] Fase 5 — scoring: DONE (perfScoring.js, 11 grupos del enunciado con RULE_ID_TO_SCORE_GROUP_OVERRIDE, disclaimer explícito no-Lighthouse/no-Core-Web-Vitals; 9/9 tests en verde)
- [x] Fase 6 — perfiles sectoriales: DONE (perfSectorRules.js, 10 sectores + generic, mismo patrón que seoSectorRules.js/a11ySectorRules.js)
- [x] Fase 7 — recomendaciones: DONE (perfRecommendations.js, 7 severidades incl. not_measured/browser_test_required, remeasureMetric; 8/8 tests en verde)
- [x] Fase 8 — CLI: DONE flags --performance/--performance-only/--include-performance/--exclude-performance en researchCli.mjs + tests; research-performance.mjs (comando dedicado, offline+auditoría completa) creado; research-audit.mjs con --explain-performance-score/--show-unmeasured; renderPerformanceReportMarkdown en auditReportGenerator.js; reports/performance.md condicional en auditOrchestrator.js; script "research:performance" en package.json
- [x] orchestratorProviderBridge.js: DONE (cuarto paso explícito performanceProvider tras accessibility, PERFORMANCE_PROVIDER_ID exportado, providerRunSummary.performance); 29/29 tests de bridge en verde (5 nuevos Paso 18)
- [x] plugins.test.mjs actualizado: 9 stubs / 4 reales, 13 proveedores vía discoverAndRegisterPlugins
- [x] researchCli.test.mjs: doctor check actualizado a "4 real, 9 stub" + 4 tests nuevos de flags --performance*
- [x] Fase 9 — validación E2E: DONE (research-performance.mjs probado offline con fixture padel-web-anticuada; validación con red real contra https://example.com/ vía --allow-network --mode=public-web, score 51/100, timing/cabeceras reales, 1 not_measured + 1 browser_test_required listados por --show-unmeasured; directorio de auditoría generado eliminado tras la comprobación)
- [x] Fase 10 — tests: DONE (auditOrchestrator.performance.test.mjs, 6 tests: 4 proveedores reales simultáneos, HTML con problemas de rendimiento, idempotencia E2E, compatibilidad legacy sin performance.md, sin performanceProvider registrado, perfil clínica)
- [x] Fase 11 — documentación: DONE (docs/paso-18-real-performance-provider/00-06 + PROGRESS.md, incluyendo corrección de honestidad del baseline heredado erróneamente como 1063 en vez de 1017)
- [x] Fase 12 — validación final: DONE (ver informe técnico 05: 1101/1101 tests, lint 4+1 preexistentes/0 nuevos, build OK, sin secretos/symlinks nuevos, sin Core Web Vitals inventados, sin claims de certificación/Lighthouse)
- [ ] Fase 13 — git y PR (en curso: consolidación del historial de checkpoints en un commit atómico, push, PR stacked sobre #45)

Checkpoint local tras Fases 2-7 + bridge + CLI-flags (2026-07-23): 1091/1091 tests en verde en este worktree en ese momento (1090 antes de arreglar el test de researchCli.test.mjs que esperaba el conteo antiguo de proveedores; corregido a 4 real/9 stub).

Estado final antes de consolidar (2026-07-23): 1101/1101 tests en verde (1017 preexistentes verificados contra c4629cb + 84 nuevos de Paso 18), lint sin regresiones, build OK.
