# Make Bridge Social — ADV-14

## Principio fundamental
`MAKE_BRIDGE_MODE = DRY_RUN` siempre. Nunca se activa un webhook real.

## SocialMakePayload
Estructura conceptualmente compatible con el contrato Make de CP04,
pero NO toca el escenario "📣 Social Media & Ads Hub · Club Pádel 04".

Campos obligatorios: businessId, clientId, channel, postContent
Campos prohibidos: realWebhookUrl, realToken (usar webhookRef/secretRef)

## runSocialMakePipeline()
1. Valida `executeReal !== true` (lanza error si es true)
2. Evalúa estado de automatización (aprobación, auth de canal)
3. Si BLOCKED → retorna sin payload
4. Si aprobado → genera payload DRY_RUN con `dryRun: true`

## SOCIAL_AUTOMATION_STATUS (6 valores)
READY, WAITING_APPROVAL, WAITING_AUTH, READY_FOR_MAKE, BLOCKED, FAILED

## Seguridad
- No hardcodear tokens
- No usar OAuth real (secretRef únicamente)
- No publicar en redes sociales reales
