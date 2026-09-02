# Sistema de Voz IA para Media (ADV-13)

## Perfiles de voz disponibles (Español)
| ID | Acento | Tono | Energía |
|----|--------|------|---------|
| es_es_neutral | Neutro | PROFESSIONAL | 5/10 |
| es_es_warm | Neutro | WARM | 5/10 |
| es_es_professional | Neutro | AUTHORITATIVE | 6/10 |
| es_es_energetic | Neutro | ENERGETIC | 9/10 |
| es_and_soft | Andaluz suave | WARM | 5/10 |

## Reglas de consentimiento
- Voz SYNTHETIC → `consentRequired: false`, `commercialRightsStatus: SYNTHETIC_FREE`
- Voz CLONED → `consentRequired: true` → requiere `VOICE_CONSENT_NOT_GRANTED` check
- Voz AUTHORIZED → consentimiento registrado con `evidenceReference`

## Bridge con ADV-11 (Voice Agent)
`reuseVoicePersonality()` importa accent/speechStyle/pace/expressiveness del agente de voz.

## Evaluación de calidad
6 dimensiones: clarity, naturalness, pace, business_fit, pronunciation, expressiveness.
