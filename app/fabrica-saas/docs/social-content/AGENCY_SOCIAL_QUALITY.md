# Sistema de Calidad de Contenido Social — ADV-14

## Score (11 factores)
hookStrength, ctaPresence, copyClarity, pillarAlignment, objectiveMatch,
brandConsistency, claimSafety, hashtagQuality, channelFit, novelty, humanness

Puntuación 0–100. Gate: < 50 = FAIL, < 70 = WARN, ≥ 70 = PASS.

## Quality Gate — 12 razones de BLOCKED
| Código | Descripción |
|--------|-------------|
| INVENTED_PRICE | Precio no verificado |
| INVENTED_HOURS | Horario no verificado |
| FAKE_TESTIMONIAL | Testimonio fabricado |
| INVENTED_RESULTS | Resultados inventados |
| MISSING_APPROVAL_SOCIAL | Sin aprobación para publicación social |
| FALSE_HUMAN_REPR | Representación falsa de persona real |
| REAL_PUBLISH_ATTEMPTED | Intento de publicación real |
| CLIENT_ISOLATION_BREACH | Datos de otro cliente |
| REAL_AD_SPEND | Gasto publicitario real |
| GDPR_VIOLATION | Incumplimiento GDPR |
| MISLEADING_GUARANTEE | Garantía engañosa |
| UNLICENSED_ASSET | Asset sin licencia |

Si `criticalFailures.length > 0` → BLOCKED, sin excepción.

## Brand Consistency
Verifica palabras prohibidas + hashtag de marca requerido.

## Humanness Evaluator (ADV-10)
Detecta lenguaje robótico, plantillas sin rellenar (`{{topic}}`), contenido demasiado corto.
