# Política de Consentimiento en Media (ADV-13)

## Cuándo se requiere consentimiento
| Situación | Consentimiento |
|-----------|---------------|
| Avatar SYNTHETIC | NO requerido |
| Avatar AUTHORIZED_DIGITAL_TWIN | SÍ — GRANTED |
| Voz SYNTHETIC | NO requerido |
| Voz CLONED (de persona real) | SÍ — GRANTED |
| Imagen de persona real | SÍ — GRANTED |

## Verificación
`checkAvatarConsent(consent)` → `{ allowed: boolean, reason? }`
`checkVoiceConsent(consent)` → `{ allowed: boolean, reason? }`

## Caducidad
Si `consent.expiresAt < Date.now()` → `isConsentValid()` devuelve `false`.
Si `consent.revoked === true` → `isConsentValid()` devuelve `false`.

## Disclosure obligatorio
Todo vídeo con avatar IA lleva: `"Este vídeo incluye un presentador generado por inteligencia artificial."`
