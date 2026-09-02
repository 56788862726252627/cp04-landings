# Troubleshooting — Social Content Engine (ADV-14)

## Error: "SocialMakeBridge: executeReal=true is not allowed"
`runSocialMakePipeline` recibe `executeReal: true`. Eliminar ese flag. El bridge es DRY_RUN_ONLY.

## Error: "SocialMakePayload must use webhookRef, not realWebhookUrl"
No pasar URLs de webhook reales. Usar `webhookRef` como referencia opaca.

## Error: "SocialMCPRequest must use secretRef, not secretValue"
No pasar tokens directamente. Usar `secretRef`.

## Error: "CHANNEL_AUTH_SAFETY: real OAuth token must not be passed"
No pasar tokens OAuth. Usar `secretRef` en `createChannelAuthStatus`.

## Gate status: BLOCKED
Ver `criticalFailures` en el resultado. Uno o más de los 12 fallos críticos detectado.
Corregir el contenido y volver a evaluar.

## Score < 50 → FAIL
Revisar breakdown: hook débil (hookStrength < 5) o sin CTA (ctaPresence < 5) son causas comunes.

## CLIENT_ISOLATION_BREACH
`post.clientId` no coincide con `requestingClientId`. Verificar que el contenido pertenece al cliente correcto.

## ADS_EXECUTION = BLOCKED
Normal. Los ads nunca se ejecutan desde este sistema. Crear un `AdsPlan` para revisión humana externa.

## Humanness score bajo
Texto contiene plantillas sin rellenar (`{{topic}}`) o patrones de lenguaje robótico.
Revisar el body del post.

## CalendarEntry requires approver
La transición a APPROVED requiere pasar `approver` (string no vacío) como tercer argumento.
