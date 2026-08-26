# Agencia IA / Fábrica Agencia IA

Capa que convierte el producto validado de Club Pádel 04 en una fábrica
replicable de SaaS para otros negocios locales (CORE / VERTICAL / CLIENTE).

## Estado resumido

CLI local (`factory-cli/`) y núcleo (`src/saas-core/`) operativos como
herramienta de generación/estado; sin integraciones de pago/mensajería
confirmadas en producción real. El BPMN Maestro del proceso vive fuera de
este repositorio, como Artifact publicado.

Certeza general: **EVIDENCIA PREVIA** (memoria del asistente) +
**VERIFICADO DIRECTAMENTE** para la estructura de archivos comprobada hoy.

## Qué existe en este repo (VERIFICADO DIRECTAMENTE, 2026-08-26)

- `factory-cli/`: scripts `business:create`, `business:validate`,
  `business:preview`, `business:build`, `business:report`, `business:list`,
  `business:diff`, `business:doctor`, `business:status`, `business:interpret`,
  `business:ask`, `business:compose`, `business:explain`,
  `business:recommend`, `business:from-prompt`, `business:research`,
  `agency:status`, `agency:api` (registrados en `package.json`).
- `src/saas-core/`: `adapters`, `automations`, `businesses`, `commercial`,
  `deliverables`, `domain`, `factory`, `modules`, `nl-builder`, `research`,
  `security`, `templates`, `tenant`, `tenants`, `terminology`.
- `docs/paso-21-conexion-adaptadores-reales-agencia-ia-p3/` …
  `docs/paso-24-api-interna-agencia-ia-p6/`: documentación de los últimos
  hitos de la fábrica (adaptadores reales, estado operativo, dashboard, API
  interna). Untracked al momento de crear este hub — no commiteados.
- `docs/registro-maestro-50-flujos-20260801/`: registro de los 50 flujos de
  Make/negocio. Untracked al momento de crear este hub.

## Qué NO vive en este repo

- **BPMN Maestro · Fábrica Agencia IA**: existe como Artifact publicado
  (HTML/SVG con 3 vistas: Interna Operativa, Comercial·Cliente,
  Miro-ready), fuera de `/root/cp04-landings/app`. No hay copia local del
  archivo en este directorio. Si se quiere una copia versionada en el repo,
  es una tarea explícita pendiente (no asumir que ya existe).
  Certeza: VERIFICADO DIRECTAMENTE (no se encontró el archivo al buscar).

## Reglas permanentes de la fábrica (EVIDENCIA PREVIA — ver también la skill `fabrica-agencia-ia`)

- Separar siempre CORE / VERTICAL / CLIENTE.
- No declarar producción real sin gate de validación y evidencia (pruebas
  normales y de fallo).
- Conservar Make hasta que una migración tenga plan, pruebas y reversión.
- Club Pádel 04 se sirve en local en `http://localhost:5175` durante
  desarrollo/validación visual.

## Bloqueadores conocidos (EVIDENCIA PREVIA)

- Stripe y WhatsApp Business: adaptadores aislados, entornos marcados
  `NOT_CONFIGURED` en auditorías previas.
- Multi-tenant runtime y algunos cierres de capacidad documentados como
  "diseñados mas no integrados en `App.jsx`" en auditorías previas — no
  reverificado en esta sesión.

## Siguiente paso

Decidir si el BPMN Maestro debe tener una copia versionada dentro de este
repo (p. ej. bajo `docs/`) para que quede referenciado desde este Context
Hub con ruta local real, en vez de depender solo del enlace del Artifact.
