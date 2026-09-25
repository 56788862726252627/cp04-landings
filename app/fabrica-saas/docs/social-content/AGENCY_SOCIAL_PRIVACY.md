# Privacidad y Aislamiento de Cliente — ADV-14

## Client Isolation (100%)
- Todo contenido tiene `businessId` + `clientId`
- `validateSocialContentPrivacy` rechaza acceso cross-client
- SOCIAL_CRITICAL_FAILURE.CLIENT_ISOLATION_BREACH → gate BLOCKED

## GDPR
- No datos personales en copia (detecta NIF/DNI por regex)
- No imágenes de menores sin `minorConsentRef`
- No imágenes de personas reales sin `personConsentRef`

## PRIVACY_RISK (5 tipos)
REAL_PERSON_WITHOUT_CONSENT, MINOR_IMAGE_WITHOUT_CONSENT,
PERSONAL_DATA_IN_COPY, CLIENT_DATA_CROSS_LEAK, GDPR_NON_COMPLIANT

## Retention
Ninguna política de retención de datos reales se activa desde este motor.
Los datos son fixtures o simulados (`isReal: false` en todo output).

## SocialChannelAuthStatus
OAuth real nunca se pasa directamente: `realOAuthToken` → lanza error.
Solo `secretRef` está permitido.
