# Paso 20 — Generación visual multidispositivo + panel ROI/comercial + preparación de integraciones reales

Construye la capa comercial y visual reutilizable de la Agencia de IA:
motor ROI explicable, panel comercial, generador de propuestas, mockups
multidispositivo, estado central de integraciones, puente sandbox
Stripe/WhatsApp (Paso 19) y CLI dedicada — todo en modo local/fixture/
mock/sandbox, **sin ninguna transacción o mensaje real** y sin depender
de credenciales externas para funcionar.

## Secuencia de trabajo del proyecto (confirmada por el usuario)

Este paso se ejecuta ANTES de: esperar renovación de cuota de Airtable,
validar los 50 flujos de Make con llamadas reales, contratar WhatsApp
Business, configurar Stripe en producción, comprar el dominio en
Hostinger y desplegar en producción real. Por diseño, **nada en este
paso se bloquea esperando esas credenciales** — toda la funcionalidad
usa datos locales, fixtures o simulación sandbox.

## Documentos

1. [01 — Arquitectura: CommercialAssessment, RoiModel, ProposalGenerator, DeliverableGenerator, IntegrationReadiness, VisualPreview/DevicePreview, CommercialPackage, ImplementationRoadmap](./01-arquitectura.md)
2. [02 — Motor ROI: fórmulas, supuestos, escenarios, confianza](./02-motor-roi-formulas-supuestos.md)
3. [03 — Panel, propuesta, mockups y compatibilidad multidispositivo](./03-panel-propuesta-mockups-compatibilidad.md)
4. [04 — Integraciones: Stripe, WhatsApp, Airtable, Make — estados, privacidad, consentimiento, credenciales pendientes](./04-integraciones-stripe-whatsapp-airtable-make.md)
5. [05 — CLI, factory, limitaciones y proceso de producción](./05-cli-factory-limitaciones-produccion.md)
6. [06 — Actualización del roadmap maestro vivo (21 pasos)](./06-actualizacion-roadmap-maestro-21-pasos.md)
7. [07 — PDF vivo: fuente editable (Pasos 1-20)](./07-pdf-vivo-fuente-editable.md)

## Aviso explícito (léase antes de cualquier otra cosa)

**Ninguna cifra de ROI es un resultado garantizado. Ninguna simulación
de Stripe/WhatsApp es una operación real. Ningún estado de integración
proviene de una comprobación de red real.** Cada pieza de este paso
declara explícitamente su naturaleza (provided/calculated/assumed/
unavailable, simulated:true, disclaimer) — ver documentos 02 y 04.

## Código nuevo

```
src/saas-core/commercial/
├── commercialSectorProfiles.js        — supuestos ROI + módulos prioritarios (10 sectores + generic)
├── roiEngine.js            (+ .test.mjs) — motor ROI, 3 escenarios, cada cifra con fuente/fórmula/confianza
├── commercialAssessment.js (+ .test.mjs) — normaliza negocio + scores opcionales
├── integrationReadiness.js (+ .test.mjs) — 9 estados × 10 integraciones
├── commercialSandbox.js    (+ .test.mjs) — puente Stripe/WhatsApp del Paso 19, sin fetch, ids sandbox_
├── implementationRoadmap.js(+ .test.mjs) — roadmap determinista módulos+bloqueos
├── commercialPanel.js      (+ .test.mjs) — panel comercial + secciones HTML reutilizables
├── proposalGenerator.js    (+ .test.mjs) — propuesta en JSON/Markdown/HTML
├── devicePreview.js        (+ .test.mjs) — 21 previews (7 vistas × 3 dispositivos)
└── commercialPipeline.e2e.test.mjs — validación end-to-end de los 24 escenarios

commercial-cli/
├── lib/commercialCli.mjs   (+ .test.mjs) — utilidades compartidas de la CLI
├── commercial-assess.mjs / commercial-roi.mjs / commercial-proposal.mjs
├── commercial-preview.mjs / commercial-integrations.mjs / commercial-readiness.mjs
└── factory-package.mjs / factory-preview.mjs / factory-proposal.mjs

docs/paso-20-visual-roi-commercial/
├── mockups/          — 21 previews HTML reales generados con factory:preview
└── sample-package/   — un CommercialPackage de ejemplo completo generado con factory:package
```

Ningún archivo del motor de investigación (Pasos 12-18), de los
adaptadores Stripe/WhatsApp (Paso 19), ni de ningún otro worktree/PR, se
ha modificado en este paso — verificado en la Fase 11 (escenario 23).
