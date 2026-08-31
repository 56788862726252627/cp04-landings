# AGENCY_RUNTIME_RENDER_GATE — Paso G

**Gate Obligatorio: Detección de Blank Screen y Fallos de Runtime**

`auditRuntimeRender(checks, context)` es el gate que ningún deploy puede saltarse.

---

## Checks (9)

| ID | Check | Fallo Asociado | Crítico |
|---|---|---|---|
| RG-01 | Body no está en blanco | BLANK_BODY | ✅ |
| RG-02 | Root element tiene hijos | EMPTY_ROOT | ✅ |
| RG-03 | Sin render error no capturado | UNHANDLED_RENDER_ERROR | ✅ |
| RG-04 | Assets JS cargados | MISSING_JS_ASSET | ✅ |
| RG-05 | Sin JS 404 | JS_BUNDLE_404 | ✅ |
| RG-06 | MIME type correcto para JS | WRONG_MIME_TYPE | No |
| RG-07 | Sin excepción de runtime | RUNTIME_EXCEPTION | ✅ |
| RG-08 | Sin bucle infinito de render | INFINITE_RENDER_LOOP | ✅ |
| RG-09 | Sin output de ErrorBoundary | ERROR_BOUNDARY_OUTPUT | ✅ |

---

## Comportamiento sin Checks

Si se invoca sin checks y sin URL: `status: 'BLOCKED'`

```
reason: 'No check results provided — browser runtime required for live render audit'
```

---

## Uso

```js
import { auditRuntimeRender, RENDER_GATE_STATUS } from '../deploy/runtimeRenderGate.js';

// Con fixture data (Paso G mode)
const r = auditRuntimeRender({
  'RG-01': true,
  'RG-02': true,
  'RG-03': true,
  'RG-04': true,
  'RG-05': true,
  'RG-07': true,
  'RG-08': true,
  'RG-09': true,
}, { url: 'https://nexo.pages.dev', environment: 'PREVIEW' });

// r.status → 'PASS' | 'FAIL' | 'BLOCKED'
// r.criticalFailed → número
// r.failureTypes   → ['BLANK_BODY', ...]
```

---

## Tipos de Fallo (RENDER_FAILURE_TYPES)

- `BLANK_BODY` — El body del HTML está vacío
- `EMPTY_ROOT` — `#root` existe pero sin hijos
- `RUNTIME_EXCEPTION` — Error no capturado en consola
- `INFINITE_RENDER_LOOP` — Componente re-renderizando sin parar
- `ERROR_BOUNDARY_OUTPUT` — ErrorBoundary ha activado su fallback UI

---

## En la Práctica

Este gate detecta el escenario más común de regresión: **blank screen tras deploy**. Causas típicas:
1. Build de producción con import incorrecto
2. Variable de entorno no configurada en Cloudflare
3. Cambio de ruta que rompe el router

> Gate obligatorio. Sin PASS en RG → no se considera el deploy válido.
