# 03 — Perfiles sectoriales: privacidad, consentimiento, límites

## Los 10 perfiles mínimos + 1 genérico

`providers/providerSectorProfiles.js` — puro dato, **sin lógica de sector
dentro del núcleo** (`providerRegistry.js`/`providerPipeline.js` no saben
que existen sectores). Cada perfil declara:

| Campo | Contenido |
|---|---|
| `recommendedProviders` | Proveedores recomendados, en orden de prioridad |
| `providerPriorities` | Prioridad numérica derivada del orden (10, 15, 20…) — gana sobre la prioridad por defecto del proveedor, pierde frente a `--provider-priority` explícito en CLI |
| `relevantDimensions` | Subconjunto de las 45 dimensiones de Paso 12 |
| `dimensionWeights` / `categoryWeights` | Se fusionan con el preset de Paso 12 vía `mergeAuditPreset` (ver documento 02) |
| `rules` | Reglas de negoción del sector (texto, informativo) |
| `warnings` | Patrones de riesgo conocidos del sector |
| `recommendations` | Sugerencias por defecto |
| `optionalFields` | Campos de negocio opcionales relevantes (p. ej. `numero_colegiado`) |
| `consentRequired` + `consentNote` | Ver más abajo |
| `exclusions` | Proveedores que NUNCA se intentan para este perfil (bloqueo duro) |

| id | label | preset de auditoría base (Paso 12) |
|---|---|---|
| `club-deportivo` | Club deportivo (pádel, tenis…) | `padel-sports` |
| `clinica` | Clínica (fisioterapia y asimilables) | `physiotherapy` |
| `dentista` | Clínica dental | `dental` |
| `veterinario` | Clínica veterinaria | `veterinary` |
| `abogado` | Despacho de abogados | `law` |
| `restaurante` | Restaurante | `restaurant` |
| `hotel` | Hotel / alojamiento | *(sin equivalente 1:1 — usa el preset genérico como base)* |
| `inmobiliaria` | Inmobiliaria | `real-estate` |
| `peluqueria` | Peluquería / barbería | `hair-beauty` |
| `centro-estetica` | Centro de estética | `hair-beauty` (compartido con peluquería, perfil propio) |
| `generic` | Perfil genérico (fallback) | `generic-local-service` |

`getProviderSectorProfile(id)` nunca lanza: id desconocido o ausente cae
al perfil genérico.

## Por qué "hotel" no tiene preset 1:1

`sectorAuditPresets.js` (Paso 12) reutiliza los 10 sectores YA definidos
en Paso 11 (`nl-builder/sectorLexicon.js`) — no crea una taxonomía nueva.
Ese lexicón no incluye "hotel" como sector propio. En vez de inventar un
sector nuevo en el núcleo de Paso 11/12 (fuera del alcance de este paso),
`hotel` usa `GENERIC_AUDIT_PRESET` como base y aporta sus propios pesos
(`bookingCapability: 1.5`, `mobileExperience: 1.3`,
`categoryWeights.conversion: 1.3`) por encima — mismo patrón que
cualquier perfil, sin necesidad de tocar Paso 11/12.

## Consentimiento y privacidad

Regla aplicada de forma consistente: **todo perfil que recomiende
`socialProvider` o `aiContentProvider` exige `consentRequired: true` con
un `consentNote` explicando por qué** (verificado por test —
`providerSectorProfiles.test.mjs`). Razón: `socialProvider` necesita
`SOCIAL_PROVIDER_API_KEY` (credencial de terceros) y `aiContentProvider`
analiza contenido con un LLM — ambos exigen decisión explícita del
negocio auditado antes de activarse, no solo una bandera técnica.

Los 4 sectores regulados heredados de Paso 12
(`dental`/`physiotherapy`/`veterinary`/`law` → aquí `dentista`/
`clinica`/`veterinario`/`abogado`) **excluyen `aiContentProvider`** en su
perfil de proveedores — ningún análisis automático de contenido debe
sugerir implícitamente un diagnóstico o estrategia jurídica. `abogado`
excluye además `socialProvider` (deontología profesional más estricta
sobre datos de terceros).

**Límite honesto**: `consentRequired`/`consentNote` son campos
informativos que el CLI/informes exponen (`research:profiles --describe`,
`reports/providers.md`) — no hay hoy una puerta técnica que bloquee la
ejecución si el consentimiento no se registró en ningún sitio (no existe
un campo de consentimiento en `researchRequestSchema.js`). Igual que
Paso 13 documentó sus propios "riesgos residuales", este es uno
declarado: el consentimiento es hoy una responsabilidad de proceso
(quien ejecuta el CLI), no una barrera de código. Añadir esa barrera
(p. ej. `--consent-confirmed` obligatorio cuando el perfil lo exige)
sería una extensión natural de un paso futuro.

## Exclusiones — bloqueo duro, no solo advisory

`exclusions` se aplica en `applyExecutionPolicyToRegistry` (vía
`mergePolicyOptionsWithProfile`, que ACUMULA las exclusiones del perfil
con las que ya vinieran explícitas del CLI) **antes** de resolver la
cadena — un proveedor excluido ni siquiera aparece en
`providerRunSummary.providers` (nunca se intenta, no es que "se intente
y se descarte"). Verificado por test.

## Límites de la auditoría (Fase 9 del enunciado, aplicado también aquí)

Los propios tests end-to-end del Paso 15 respetan la misma disciplina
que Paso 13 exigió para pruebas con red real: **un único dominio técnico
reservado (`example.com`, RFC 2606) y una sola página**, nunca un
competidor o negocio real sin consentimiento — ver validación en el
[informe técnico](./05-informe-tecnico-paso-15.md).
