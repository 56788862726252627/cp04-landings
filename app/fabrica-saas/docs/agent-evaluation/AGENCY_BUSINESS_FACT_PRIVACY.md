# Business Fact Privacy & Client Isolation — ADV-10b

## Principio de aislamiento

Los hechos de un cliente **nunca** pueden aparecer en las respuestas de otro cliente.

Módulo: `clientFactIsolation.js`

## Detección de fugas

`assertClientIsolation(expectedClientId, facts)`:
- Comprueba que todos los hechos tienen `clientId === expectedClientId`
- Detecta hechos de otros clientes mezclados en el contexto
- `isCritical: true` en cualquier fuga

`detectCrossClientFactLeak(responseText, clientAFacts, clientBId)`:
- Analiza el texto de respuesta del agente
- Busca menciones de datos que pertenecen a otro cliente

## Fallo crítico

`CROSS_CLIENT_FACT_LEAK` → bloquea inmediatamente en `businessTruthQualityGate`.

## Clientes de fixture (testing)

| ID | Descripción |
|---|---|
| `cp04-padel` | Club de pádel (fixture) |
| `dental-fixture` | Clínica dental (fixture) |

## Políticas de privacidad de hechos

`agentBusinessFactPolicy.js` bloquea:
- Hechos con `source === 'MODEL_ASSUMPTION'`
- Hechos operacionales (AVAILABILITY, CAPACITY) sin verificación
- Hechos con `confidence < 50`

## Relación con `redactionPolicy.js`

La política de redacción (`redactionPolicy.js`) se aplica al texto de respuesta antes de enviarlo a observabilidad/Langfuse. La política de aislamiento de hechos opera en la capa de evaluación, antes de que se genere la respuesta.
