# Sistema de Avatar IA (ADV-13)

## Tipos de avatar
| Tipo | Descripción | Requiere consentimiento |
|------|-------------|------------------------|
| SYNTHETIC | Generado por IA, sin persona real | NO |
| BRAND_CHARACTER | Personaje de marca | NO |
| AUTHORIZED_DIGITAL_TWIN | Gemelo digital con consentimiento | SÍ |
| GENERIC_PRESENTER | Presentador genérico de librería | NO |

## Reglas de cumplimiento
- Todos los avatares llevan `identityDisclosure: 'AI_GENERATED'`
- `isRealPerson: false` por defecto
- Consentimiento GRANTED requerido antes de usar AUTHORIZED_DIGITAL_TWIN
- Prohibido afirmar que el avatar es una persona humana real

## Estilos disponibles
REALISTIC / ILLUSTRATED / ANIMATED / SILHOUETTE

## Evaluación de calidad
6 dimensiones: visual coherence, brand fit, expression, framing, artifact risk, identity compliance.
Si `identityDisclosure !== 'AI_GENERATED'` → `criticalFail = true` → gate BLOCKED.
