# Prompt Agencia IA 3/7 — Conexión de adaptadores reales

Continuación de [Paso 10 (One Prompt Factory)](../paso-10-one-prompt-factory/) y
[Paso 20 (integraciones)](../paso-20-visual-roi-commercial/04-integraciones-stripe-whatsapp-airtable-make.md).
Objetivo del prompt: conectar la fábrica SaaS con adaptadores reales de
Airtable/Stripe/WhatsApp/Google Drive **sin activar ninguna llamada real**.

## Qué se conectó y dónde

Hay dos capas distintas en el repo, y cada una se tocó (o no) por una razón
concreta:

1. **Adaptadores reales** (`src/saas-core/commercial/`, `src/saas-core/deliverables/`)
   — código que SÍ sabe hablar con la API real de cada proveedor, siempre
   detrás de un guard `not_configured`/`dry_run` por defecto.
   - Stripe (`stripeAdapter.js`) y WhatsApp (`whatsappAdapter.js`): ya
     existían (Paso 19), sin cambios.
   - **Airtable (`airtableAdapter.js`): nuevo en esta sesión.** No existía
     ningún adaptador real bajo `src/` — solo un diseño de resiliencia
     (batching/backoff/dedup/budgets) en `audit/airtable-p0-architecture-20260708/`,
     que está gitignorado y fuera de `npm test`. Se creó uno mínimo, mismo
     patrón `not_configured` que `stripeAdapter.js`, implementando el
     contrato `DataRepository` (list/get/create/update/remove). El diseño
     P0 de resiliencia NO se fusionó aquí — sigue pendiente, ver
     "Deuda técnica" en el informe de esta sesión.
   - Google Drive (`driveRealAdapter.js`): ya existía y ya está
     **autenticado de verdad** (OAuth `drive.file`, ver sesión de
     integración Drive) — sin cambios de código, solo se refleja su
     estado real en la capa 2.

2. **Capa de estado en vivo** (`src/saas-core/commercial/integrationReadiness.js`,
   Paso 20) — calcula, a partir de `process.env` real, si cada proveedor
   está `NOT_CONFIGURED`/`SANDBOX`/`READY_FOR_PRODUCTION`/etc. **Nunca hace
   una llamada de red real.** Se amplió con una entrada `googleDrive`
   (antes no existía ninguna) y se hizo que la entrada `airtable`
   reutilice `isAirtableConfigured()` del adaptador real en vez de un
   chequeo ad-hoc de `env.AIRTABLE_API_KEY`.

## Qué NO se conectó, a propósito

- **`extensionPoints.js`** (catálogo estático de puntos de extensión,
  Paso 10) — se dejó intacto. `business:doctor` verifica explícitamente
  que los 32 puntos sigan en `status: "not_implemented"`
  (`all_extension_points_not_implemented`); es un catálogo de diseño, no
  de estado en vivo, y cambiarlo rompería ese check existente sin aportar
  nada (la capa 2 ya cubre "estado real").
- **`orchestrator.js` / `runFactoryPipeline`** (pipeline de generación,
  Paso 10) — se dejó intacto a propósito. Es una pipeline **pura y
  determinista** (mismo blueprint → mismo `report.json` byte a byte,
  verificado por sus propios tests de idempotencia). Si `report.json`
  dependiera de `process.env` en el momento de generar, dos operadores
  con `.env` distinto obtendrían manifiestos distintos para el MISMO
  blueprint — eso rompería la garantía de reproducibilidad que ya
  prueban `orchestrator.test.mjs`. La lectura de estado real de
  integraciones es, por diseño, una operación posterior y separada
  (capa 2), no parte de la generación determinista.

## Cómo consultar el estado real hoy

```js
import { computeIntegrationReadiness } from "../../src/saas-core/commercial/integrationReadiness.js";
computeIntegrationReadiness(process.env).integrations.googleDrive;
// -> { status: "SANDBOX", ... }  (configurado + CP04_DRIVE_DRY_RUN por defecto)
```

`airtable`, `stripe` y `whatsapp` siguen en `NOT_CONFIGURED` (sin
credenciales reales de esos tres) — es el comportamiento esperado y
deseado en esta fase.
