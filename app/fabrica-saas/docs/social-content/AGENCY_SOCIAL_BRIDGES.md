# Bridges ADV-14 — Conexiones con el Ecosistema Fábrica SaaS

## 7 bridges activos

### ADV-01 Observabilidad
`emitSocialEvent(eventType, data)` — 8 tipos de evento:
content.generated, content.approved, content.blocked, campaign.planned,
quality.gate.pass, quality.gate.fail, make.payload.created, privacy.validated

### ADV-03 Agent Engine
`bridgeToAgentEngine(post, config)` — tarea de revisión de contenido.
`autoPublish: true` lanza error.

### ADV-08 Lead Engine
`bridgeToLeadEngine(campaign, config)` — señales de lead desde campaña social.
`executeRealOutreach: true` lanza error.

### ADV-09 Agency CRM
`bridgeToCRM(campaign, config)` — actividad de campaña en CRM.
`executeRealWrite: true` lanza error.

### ADV-10 Langfuse/Humanness
`evaluateSocialHumanness(post)` — detecta lenguaje robótico.

### ADV-12 MCP Layer
`createSocialMCPRequest(config)` — SecretRef pattern, `secretValue` lanza error.

### ADV-13 AI Media Engine
`bridgeToAIMedia(post, mediaConfig)` — conecta social post con media IA.
CLIENT_ISOLATION: clientId debe coincidir.

## Norma común
Todos los bridges retornan `isReal: false` y prohíben ejecución real.
