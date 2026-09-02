# Social Content Engine — ADV-14

## Propósito
Motor completo de contenido social para agencia IA: estrategia, generación, calendario, QA y puente Make.

## Guardrails activos
| Guardrail | Valor |
|-----------|-------|
| NO_REAL_SOCIAL_PUBLISH | SI |
| NO_REAL_AD_SPEND | SI |
| NO_REAL_OUTREACH | SI |
| ADS_EXECUTION | BLOCKED |
| MAKE_BRIDGE_MODE | DRY_RUN_ONLY |

## Módulos principales (51)
- **Core**: objetivo social (12), pilares (15), perfil de estrategia, estilo de copy (10), cadencia
- **Strategy**: resolveSocialStrategy, política local, estacionalidad
- **Ideas**: generación de ideas, scoring, novelty engine (FRESH/SIMILAR/REPETITIVE/DUPLICATE)
- **Generators**: hook engine (9 tipos), CTA engine (10 tipos), hashtags, post completo
- **Platforms**: 7 adaptadores (Instagram/Facebook/TikTok/YouTube/LinkedIn/X/Threads)
- **Calendar**: entradas con 7 estados, balance y cadencia
- **Quality**: score 11 factores, gate 12 BLOCKED, consistencia de marca, humanness
- **Policies**: aprobación, ads, auth de canal, privacidad
- **Make**: payload, bridge DRY_RUN, automation status
- **Campaigns**: modelo de campaña, generador de plan orgánico
- **Bridges**: 6 bridges (ADV-01/03/08/09/12/13)
- **Reporting**: informe y score del motor

## Flujo típico
1. `resolveSocialStrategy(business)` → perfil de estrategia
2. `generateContentIdeas(params)` → ideas priorizadas
3. `generateSocialPost(brief)` → post completo
4. `repurposeContent(post, channels)` → adaptaciones por canal
5. `evaluateSocialContentQualityGate(score, failures)` → gate PASS/WARN/FAIL/BLOCKED
6. `runSocialMakePipeline(config)` → payload DRY_RUN para revisión humana

## Versión
REGISTRY_VERSION: 3.8.0 | ADV-14 | Módulos: 51
