# Club Pádel 04 · Plan de integración visual controlada

## Auditoría 50

50%

## Componentes creados

- src/components/demo/DemoSafeNotice.jsx
- src/styles/demo-safe.css

## Estado

Componentes preparados pero no necesariamente integrados de forma global en App.jsx.

## Próximo paso recomendado

En la fase 75 se debe integrar de forma controlada:

1. Importar DemoSafeBanner en App.jsx.
2. Mostrar banner superior global.
3. Importar estilos demo-safe.css si no se cargan desde el componente.
4. Validar build.
5. Validar preview local/dist.
6. Confirmar que no se activan pagos, webhooks, Airtable ni WhatsApp.

## Regla

Cualquier integración debe ser reversible con checkpoint.
