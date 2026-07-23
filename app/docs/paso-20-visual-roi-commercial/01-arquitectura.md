# 01 — Arquitectura

## Mapeo de conceptos del enunciado a código real

| Concepto pedido | Implementación real | Archivo |
|---|---|---|
| `CommercialAssessment` | `buildCommercialAssessment(input)` | `commercialAssessment.js` |
| `RoiModel`/`RoiScenario` | `computeRoiScenarios(inputs, {profileId})` → `{scenarios: {conservative, central, optimistic}}` | `roiEngine.js` |
| `ProposalGenerator` | `buildCommercialProposal({assessment, roi, roadmap, integrationsReadiness})` + `renderProposalJson/Markdown/Html` | `proposalGenerator.js` |
| `DeliverableGenerator` | `factory-package.mjs` (CLI) — bundla assessment+roi+integraciones+roadmap+propuesta+panel+21 previews en un directorio | `commercial-cli/factory-package.mjs` |
| `IntegrationReadiness` | `computeIntegrationReadiness(env, externalContext)` | `integrationReadiness.js` |
| `CredentialChecklist` | Integrado en cada entrada de `IntegrationReadiness` (`credentialsNeeded`, `providedBy`, `pendingTests`, `nextSteps`) — no se separó en un módulo propio para no duplicar la misma información en dos sitios | `integrationReadiness.js` |
| `VisualPreview`/`DevicePreview` | `renderDevicePreviewHtml(view, device, context)` / `buildAllDevicePreviews(context)` | `devicePreview.js` |
| `CommercialPackage` | Objeto bundle construido por `factory-package.mjs` (`{assessment, roi, integrationsReadiness, roadmap, proposal, panel}`) | `commercial-cli/factory-package.mjs` |
| `SalesOpportunity` | `assessment.opportunities` (lista `{title, impact?, evidence?}`) — no se creó un módulo propio: son datos de entrada/salida del `CommercialAssessment`, no un motor con lógica propia | `commercialAssessment.js` |
| `ImplementationRoadmap` | `buildImplementationRoadmap({profileId, integrationsReadiness})` | `implementationRoadmap.js` |

## Por qué no se acopla al motor de investigación (Pasos 12-18)

`CommercialAssessment` acepta `auditScores` en la MISMA forma que
`result.scores.categories` de una auditoría real de
`auditOrchestrator.js` (`{[categoryId]: {score, coverage}}`) — pero
**nunca importa ni llama a `auditOrchestrator.js`**. Esto significa:

- Si mañana se quiere alimentar el panel con una auditoría SEO/
  accesibilidad/rendimiento real (Pasos 16-18), basta con pasar
  `result.scores.categories` tal cual como `auditScores` — sin adaptador
  intermedio.
- Si no hay ninguna auditoría (uso puramente comercial, sin research
  engine), el panel funciona igual, con `scores.hasScores: false` y
  `missingData: ["auditScores"]` explícito — nunca inventa una
  puntuación.
- El motor de investigación (Pasos 12-18) queda completamente intacto —
  verificado por test (`commercialPipeline.e2e.test.mjs`, escenario 23:
  una auditoría legacy real sigue funcionando exactamente igual).

## Perfiles sectoriales — mismo patrón que Pasos 15-18

`commercialSectorProfiles.js` reutiliza los mismos 10 ids de perfil +
`generic` que `providerSectorProfiles.js` (Paso 15) /
`seoSectorRules.js`/`a11ySectorRules.js`/`perfSectorRules.js` (Pasos
16-18) — la lógica sectorial vive SOLO en este archivo de datos, nunca
en `roiEngine.js`/`commercialPanel.js`/la interfaz.

## Puente sandbox — reutiliza el Paso 19 sin modificarlo

`commercialSandbox.js` importa `getStripeRuntimeStatus`/
`getWhatsAppRuntimeStatus`/`hasRecordedConsent` de
`stripeAdapter.js`/`whatsappAdapter.js` (Paso 19) — **ningún archivo del
Paso 19 se ha modificado**. El puente añade una capa de simulación
completamente nueva, sin `fetch`, para que el panel pueda "demostrar" el
flujo de pago/mensajería sin ningún riesgo de tocar red real,
independientemente de si hay credenciales configuradas o no.

## Puntos de extensión (factory)

Este paso extiende el patrón de "factory" ya establecido en
`src/saas-core/factory/extensionPoints.js` (Paso 10) con un nuevo
dominio (`commercial`), sin modificar los puntos de extensión existentes
del research engine ni del constructor de negocios. Los comandos
`factory:package`/`factory:preview`/`factory:proposal` son atajos de
conveniencia sobre las mismas funciones que `commercial:*`, pensados
como "generar el entregable completo de un golpe" frente a "un dato
concreto a la vez".
