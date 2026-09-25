# Troubleshooting Media IA (ADV-13)

## Gate BLOCKED
**Causa más común**: `criticalFailures.length > 0`.
**Diagnóstico**: revisar `mediaQualityGate` output → array `criticalFailures`.
**Fix**: corregir la falla crítica antes de intentar publicar.

## MISSING_CONSENT
Avatar o voz con `consentStatus !== GRANTED`.
**Fix**: usar avatar SYNTHETIC (no requiere consentimiento) o registrar evidencia de consentimiento.

## COST_WITHOUT_APPROVAL
`totalEstimatedCents > 0` y `approvedByHuman === false`.
**Fix**: llamar `evaluateMediaApproval(project, true)` tras obtener aprobación explícita.

## WRONG_FACTS
Script menciona datos no verificados del negocio.
**Fix**: usar `businessFactSources` con referencias a registros Airtable/Drive verificados.

## NO_REAL_SOCIAL_PUBLISH error
`socialPublishPlan.noRealPublish === true` → nunca llamar a API social sin gate de aprobación.

## Provider CONFIG_REQUIRED
Los providers Local/External lanzan error hasta tener credenciales reales.
**En tests**: usar siempre `FixtureAvatarProvider` / `FixtureLipSyncProvider`.

## FALSE_HUMAN_REPR
Script o avatar afirma ser humano real.
**Fix**: `identityDisclosure: 'AI_GENERATED'` en avatar + eliminar frase del script.
