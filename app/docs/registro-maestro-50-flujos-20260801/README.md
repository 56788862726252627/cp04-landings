# Registro maestro de 50 flujos Make — Club Pádel 04 (2026-08-01)

Cierre de la corrección de contadores obsoletos (38/43, 43 flujos) y creación
de una única fuente de verdad con exactamente 50 flujos Make.

## Qué es esto

- **Fuente única de verdad (código):** `src/data/makeMasterRegistry.js`.
  No duplica datos: une por `id` los tres ejes ya existentes y probados por
  separado —
  [`makeInventory.js`](../../src/data/makeInventory.js) (datos operacionales
  confirmados por Make vía MCP + auditoría de verificación),
  [`makeAppIntegrationMap.js`](../../src/data/makeAppIntegrationMap.js)
  (¿el código de la app dispara este escenario?) y
  [`makeArchitectureMatrix.js`](../../src/data/makeArchitectureMatrix.js)
  (arquitectura de producto: roles, módulo, descripción, estado, E2E) —
  y deriva el campo `estadoFuncional` con los 7 estados pedidos
  (`NO_CONECTADO`, `CONECTADO_SIN_PROBAR`, `PROBADO_PARCIAL`, `OPERATIVO`,
  `BLOQUEADO`, `NO_APLICA`, `PENDIENTE_DE_CONFIRMAR`) mediante una regla
  determinista y documentada (ver comentarios en el propio archivo).
- **Matriz documental (este directorio):** `matriz-50-flujos.json` / `.csv` /
  `.md`, generadas programáticamente con
  `node scripts/generar-matriz-50-flujos.mjs` — nunca escritas a mano.
  Reutilizable como entrada de la siguiente fase (matriz E2E + pruebas reales
  de Airtable).
- **Tests:** `src/data/makeMasterRegistry.test.mjs` (23 tests: 50 entradas,
  IDs únicos, números 1–50 sin huecos, campos completos, estados válidos,
  contadores siempre derivados, jerarquía honesta operativos≤probados≤
  conectados≤total, sin secretos/tokens) y
  `src/data/makeRegistryAppReferences.test.mjs` (4 tests: `App.jsx` ya no
  contiene ninguna referencia visible a 38/43 o 43 flujos/procesos, y el Home
  compartido + panel Admin usan el contador derivado, no un número
  hardcodeado).

## Contadores reales (2026-08-01, derivados — no inventados)

| Total | Conectados | Probados | Operativos |
|---|---|---|---|
| 50 | 39 | 2 | 1 |

Desglose completo por estado funcional en `matriz-50-flujos.json` /
`computeMasterCounters()`. **Ningún flujo se declara "operativo" sin evidencia
E2E objetiva ya verificada en el Paso 08E** (🎾 Alta de Jugador es el único).

## Qué corrigió esta fase en la app

`src/App.jsx` mostraba en el Home compartido (visible a PLAYER, STAFF, ADMIN y
SUPPORT) y en el panel Admin un denominador hardcodeado `/43` (y una cadena
i18n muerta "43 procesos/processes/..." en 8 idiomas), heredado de un
recuento antiguo de escenarios. Se sustituyó por el contador real derivado de
`MAKE_MASTER_REGISTRY` (50 totales, 39 conectados). Los detalles completos
del cambio están en el informe de cierre de esta sesión (ver historial de
conversación / commit, no incluido en este directorio).

## Siguiente paso

Matriz E2E y prueba real de Airtable — pendiente de que la cuota de Airtable
se restablezca (bloqueo 429 documentado desde hace meses en las auditorías
previas). No se ha llamado a Make ni a Airtable en esta fase.
