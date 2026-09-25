# Política de Anuncios Sociales — ADV-14

## ADS_EXECUTION = BLOCKED
Los anuncios nunca se activan automáticamente. Toda ejecución requiere acción humana externa.

## Flujo permitido (ORGANIC_FIRST)
1. Planificación orgánica primero (ORGANIC_ONLY por defecto)
2. Si se necesitan ads: crear `AdsPlan` (requiere `type: ORGANIC_PLUS_ADS`)
3. El plan se revisa y activa por humanos fuera del sistema
4. `autoActivateAds: true` lanza error en `createSocialCampaign`

## evaluateAdsPolicy()
- `adsRequested: true` → status: BLOCKED, allowed: false
- Sin ads → NOT_PLANNED, ORGANIC_FIRST default

## Aprobación humana
`SOCIAL_APPROVAL_TRIGGER.AD_SPEND` se activa si `adsEnabled: true`
→ requiere `approvedByHuman: true` explícito

## Restricciones absolutas
- NO_REAL_AD_SPEND = SI
- NO_REAL_OUTREACH = SI
- Ningún gasto publicitario real se origina en este sistema
