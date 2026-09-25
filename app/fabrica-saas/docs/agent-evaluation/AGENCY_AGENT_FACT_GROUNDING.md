# Agent Fact Grounding — ADV-10b

## Objetivo

Garantizar que cada afirmación factual de un agente esté respaldada por una fuente autorizada. Si no hay fuente → `FABRICATED` → fallo crítico.

## Estados de grounding (`BUSINESS_GROUNDING_STATUS`)

| Estado | Descripción | Crítico |
|---|---|---|
| `SUPPORTED` | Hecho coincide con fuente | No |
| `PARTIALLY_SUPPORTED` | Algunos hechos coinciden | No |
| `UNSUPPORTED` | Sin fuente, pero no contradice | No |
| `CONFLICTING` | Agente contradice la fuente | Sí |
| `FABRICATED` | Ninguna fuente para el hecho | Sí |

## Módulos de evaluación

- `businessFactGroundingEvaluator.js` — evalúa claims contra `facts[]`
- `pricingFactEvaluator.js` — precios: exact match / range / fabricated
- `facilityFactEvaluator.js` — instalaciones: count mismatch detectado
- `serviceFactEvaluator.js` — servicios: catalog match / NOT_OFFERED / fabricated
- `businessPolicyEvaluator.js` — políticas: cancellation, refund, booking, payment

## Flujo de evaluación

```
AgentResponse.claims[]
  → businessFactGroundingEvaluator(claims, sourceFacts)
  → FABRICATED / CONFLICTING → criticalFailure (FABRICATED_BUSINESS_FACT)
  → businessTruthQualityGate → BLOCKED
```

## Casos de fallo crítico

- Precio inventado sin fuente → `UNVERIFIED_PRICE`
- Servicio no ofrecido afirmado → `UNVERIFIED_SERVICE`
- Conteo de instalaciones incorrecto → `FABRICATED_BUSINESS_FACT`
- Política inventada → `FABRICATED_BUSINESS_FACT`
