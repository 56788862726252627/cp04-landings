# AGENCY_DATA_SAFETY — Paso G

**Gate de Datos: Detección de Datos Demo/Test en Código de Producción**

`auditProductionDataSafety(files)` detecta datos de prueba que no deberían llegar a producción.

---

## Patrones Detectados (8)

| Patrón | Clasificación | Acción |
|---|---|---|
| `test@example.com` / `demo@example.com` | MUST_REMOVE | Eliminar antes de deploy |
| `DEMO_USER_` / `TEST_USER_` | MUST_REMOVE | Eliminar |
| `lorem ipsum` | MUST_REMOVE | Reemplazar con contenido real |
| `placeholder` / `TODO` en campos de datos | HUMAN_REVIEW | Revisar manualmente |
| `fixture` en datos de negocio | HUMAN_REVIEW | Confirmar si es intencional |
| `sample_client_` | MUST_REMOVE | Eliminar datos de muestra |
| `fake_` / `mock_` en variables de runtime | MUST_REMOVE | Eliminar |
| `INTENTIONAL_DEMO` / `SAFE_DEMO` | SAFE_DEMO | Permitido si marcado explícitamente |

---

## Clasificaciones

- `SAFE_DEMO` — Demo intencional, correctamente marcado, permitido en producción
- `MUST_REMOVE` — Dato de test que debe eliminarse antes del deploy
- `HUMAN_REVIEW` — Revisar manualmente si es intencional o accidental

---

## Uso

```js
import { auditProductionDataSafety } from '../deploy/dataSafetyGate.js';

const files = [
  { path: 'src/data.js', code: '...' },
];
const r = auditProductionDataSafety(files);
// r.mustRemove  → número de hallazgos que bloquean
// r.humanReview → número que requieren revisión
// r.findings    → detalles
```

---

## Regla Principal

En un proyecto generado por la fábrica, los datos de demo son **explícitamente marcados** con `SAFE_DEMO`. Todo lo demás que parezca dato de prueba se trata como `MUST_REMOVE`.

> NO_REAL_DATA · NO_REAL_CLIENTS · Auditoría declarativa.
