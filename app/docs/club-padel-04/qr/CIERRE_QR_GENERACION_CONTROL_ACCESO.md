# QR Generación + Control Acceso — Club Pádel 04
## Cierre técnico local · T3 · 2026-08-17

**Estado:** COMPLETADO LOCAL / PENDIENTE INTEGRACIÓN MAKE REAL  
**Rama:** docs/resultado-merge-pr52-66-20260727

---

## 1. Arquitectura

```
PLAYER / STAFF / ADMIN
    │
    ▼
App (ControlQrAccesos)
    │  POST /api/qr/generate
    │  POST /api/qr/validate
    ▼
Worker (worker-reservas/src/index.js)
    │  handleQrGenerate → MAKE_QR_ACCESO_WEBHOOK (Make 6244975)
    │  handleQrValidate → MAKE_CONTROL_QR_WEBHOOK (Make 5291559)
    ▼
Make
    │  Generación: genera QR (sin Airtable) → entrega a jugador
    │  Control: lee Airtable → ACCESO_OK / QR_CADUCADO / DENEGADO_INVALIDO
    ▼
Airtable (solo Control QR)
    │  Fuente de verdad: reserva + estado + historial de acceso
```

**Principio:** Make lleva la fuente de verdad. El Worker valida entradas localmente, aplica RBAC y normaliza la respuesta. No hay estado QR en el Worker ni en el frontend.

---

## 2. Flujo Generación QR

### Endpoint

```
POST /api/qr/generate
Content-Type: application/json
Authorization: Bearer <token>   (si CP04_ENFORCE_ROLE_GATES=true)
```

### Campos de entrada

| Campo | Tipo | Req | Descripción |
|-------|------|-----|-------------|
| `clave_reserva` | string | ✅ | Clave única de la reserva (≥ 4 chars) |
| `player_id` | string | ✅ | Email / ID del jugador |
| `club_id` | string | ✅ | `cp04-antequera` |
| `pista` | string | ✅ | Una de: Pista 1, Pista 2, Pista 3, Pista 4 |
| `fecha` | string YYYY-MM-DD | ✅ | Fecha de la reserva |
| `hora_inicio` | string HH:MM | ✅ | Hora de inicio |

### Cálculo de ventana de acceso

```
validFrom  = fechaBase - QR_WINDOW_BEFORE_MIN (15 min) → DECISIÓN PENDIENTE DE NEGOCIO
validUntil = fechaBase + QR_WINDOW_AFTER_MIN  (30 min) → DECISIÓN PENDIENTE DE NEGOCIO
```

### Respuesta 200

```json
{
  "ok": true,
  "clave_reserva": "CP04-2026-07-20-PISTA2-09",
  "pista": "Pista 2",
  "fecha": "2026-07-20",
  "hora_inicio": "09:00",
  "valid_from": "2026-07-20T08:45:00.000Z",
  "valid_until": "2026-07-20T09:30:00.000Z",
  "issued_at": "2026-08-17T10:00:00.000Z",
  "estado": "pendiente_confirmacion",
  "makeResponse": "..."
}
```

**Nota:** `player_id` nunca aparece en la respuesta (privacidad). Make procesa la entrega del QR al jugador.

### Payload enviado a Make (6244975)

```json
{
  "accion": "generar_qr_acceso",
  "clave_reserva": "...",
  "player_id": "...",
  "club_id": "cp04-antequera",
  "pista": "Pista 2",
  "fecha": "2026-07-20",
  "hora_inicio": "09:00",
  "valid_from": "2026-07-20T08:45:00.000Z",
  "valid_until": "2026-07-20T09:30:00.000Z",
  "issued_at": "...",
  "origen": "APP_CLUB_PADEL_04"
}
```

---

## 3. Flujo Control / Validación QR

### Endpoint

```
POST /api/qr/validate
Content-Type: application/json
Authorization: Bearer <token>   (si CP04_ENFORCE_ROLE_GATES=true)
```

### Campos de entrada

| Campo | Tipo | Req | Descripción |
|-------|------|-----|-------------|
| `clave_reserva` | string | ✅ | Token del QR escaneado |
| `pista` | string | ✅ | Pista donde se valida |
| `club_id` | string | ✅ | `cp04-antequera` |
| `staff_id` | string | ✅ | Email / ID del validador |

### Respuesta 200

```json
{
  "ok": true,
  "decision": "ALLOW",
  "reason": "VALID",
  "clave_reserva": "CP04-2026-07-20-PISTA2-09",
  "pista": "Pista 2",
  "scanned_at": "2026-08-17T10:00:00.000Z",
  "makeResponse": "ACCESO_OK"
}
```

**Nota:** `staff_id` nunca aparece en la respuesta.

### Payload enviado a Make (5291559)

```json
{
  "accion": "validar_qr_acceso",
  "clave_reserva": "...",
  "pista": "Pista 2",
  "club_id": "cp04-antequera",
  "staff_id": "...",
  "scanned_at": "...",
  "origen": "APP_CLUB_PADEL_04"
}
```

### Respuestas Make → Reason codes canónicos

| Texto Make | decision | reason |
|-----------|----------|--------|
| `ACCESO_OK` / `ok` | ALLOW | VALID |
| `QR_CADUCADO` / `expirado` | DENY | EXPIRED |
| `DENEGADO_INVALIDO` / `invalido` | DENY | CANCELLED |
| `cerrada` / `closed` | DENY | COURT_CLOSED |
| `ya_usado` / `already` | DENY | ALREADY_USED |
| `desconocido` / `unknown` | DENY | UNKNOWN_QR |
| Cualquier otro | DENY | INVALID_STATE |

---

## 4. Reason Codes canónicos

```javascript
export const QR_REASON_CODES = {
  VALID:         "VALID",         // acceso autorizado
  TOO_EARLY:     "TOO_EARLY",     // antes de ventana (15 min)
  EXPIRED:       "EXPIRED",       // pasada ventana (30 min)
  CANCELLED:     "CANCELLED",     // reserva cancelada/revocada
  COURT_CLOSED:  "COURT_CLOSED",  // pista cerrada temporalmente
  WRONG_CLUB:    "WRONG_CLUB",    // club_id no coincide
  WRONG_COURT:   "WRONG_COURT",   // pista no coincide
  UNKNOWN_QR:    "UNKNOWN_QR",    // token no encontrado en Airtable
  ALREADY_USED:  "ALREADY_USED",  // doble scan
  INVALID_STATE: "INVALID_STATE", // estado inconsistente
  UNAUTHORIZED:  "UNAUTHORIZED",  // sin permiso
};
```

---

## 5. Estados de error HTTP

| Status | Cuándo |
|--------|--------|
| 204 | OPTIONS preflight (CORS) |
| 400 | Validación de campos fallida |
| 405 | Método no POST |
| 503 | Webhook Make no configurado |
| 502 | Make responde error HTTP o error de red |
| 200 | OK (decision ALLOW o DENY en body) |

---

## 6. RBAC

| Operación | Roles permitidos |
|-----------|-----------------|
| Generar QR | PLAYER, STAFF, ADMIN, SUPPORT |
| Validar QR | STAFF, ADMIN, SUPPORT |

- Un PLAYER solo puede generar QR para **su propia reserva** — la validación de propiedad se hace en Make (player_id vs clave_reserva en Airtable).
- Cross-club bloqueado: `club_id` se valida localmente (requerido, no vacío) y en Make.

---

## 7. Variables de entorno requeridas en Worker

| Variable | Descripción |
|----------|-------------|
| `MAKE_QR_ACCESO_WEBHOOK` | Webhook Make escenario 6244975 (Generación QR) |
| `MAKE_CONTROL_QR_WEBHOOK` | Webhook Make escenario 5291559 (Control Acceso QR) |

---

## 8. Integración Cierre Temporal de Pistas

El estado de cierre temporal persiste en Airtable (gestionado por Make escenario Cierre Temporal, 5291559). Cuando Make valida un QR y detecta la pista cerrada, devuelve texto que mapea a `COURT_CLOSED` → `DENY`.

El Worker **no duplica** esta lógica localmente — Make es la fuente de verdad del estado de la pista.

**Garantía:** El flujo Cierre Temporal de Pistas (100% PRODUCCIÓN) no ha sido modificado.  
Regresión confirmada: `cierre-temporal-pista.test.mjs` → 16/16 PASS.

---

## 9. Idempotencia

| Escenario | Comportamiento |
|-----------|---------------|
| Doble generación (mismo body) | Make se llama 2x — idempotencia en Make side (Airtable upsert) |
| Doble scan | 1ª llamada Make responde ACCESO_OK, 2ª responde `ya_usado` → ALREADY_USED |
| Retry de webhook (Make) | Make maneja idempotencia internamente |
| Cancelación simultánea | Make devuelve DENEGADO_INVALIDO → CANCELLED |

---

## 10. Tests

### Archivo: `worker-reservas/src/qr-acceso.test.mjs`

**29/29 PASS**

| Test | Descripción |
|------|-------------|
| 1 | Sin webhook generate → 503 sin llamar a fetch |
| 2 | Método GET generate → 405 |
| 3 | OPTIONS generate → 204 |
| 4 | clave_reserva vacía → 400 con campo |
| 5 | Pista inválida → 400 |
| 6 | Fecha inválida → 400 |
| 7 | player_id vacío → 400 |
| 8 | Make ok → 200 con valid_from/valid_until/issued_at |
| 9 | valid_from antes de hora_inicio (ventana de anticipación) |
| 10 | Make error → 502 |
| 11 | Doble generación → 2 llamadas Make (idempotencia Make-side) |
| 12 | player_id no en respuesta (privacidad) |
| 13 | Sin webhook validate → 503 sin llamar a fetch |
| 14 | GET validate → 405 |
| 15 | OPTIONS validate → 204 |
| 16 | clave_reserva vacía validate → 400 |
| 17 | Pista inválida validate → 400 |
| 18 | staff_id vacío → 400 |
| 19 | ACCESO_OK → ALLOW + VALID |
| 20 | QR_CADUCADO → DENY + EXPIRED |
| 21 | DENEGADO_INVALIDO → DENY + CANCELLED |
| 22 | Make HTTP error → 502 |
| 23 | Respuesta desconocida → DENY + INVALID_STATE |
| 24 | Doble scan → 1ª ALLOW, 2ª DENY + ALREADY_USED |
| 25 | club_id vacío → 400 (cross-tenant, local) |
| 26 | staff_id no en respuesta (privacidad) |
| 27 | QR_REASON_CODES tiene todos los reason codes |
| 28 | Regresión: cierre-temporal sigue respondiendo |
| 29 | Regresión: alta jugador sigue respondiendo |

---

## 11. UI — ControlQrAccesos

**PLAYER / STAFF / ADMIN:**

- **Generación:** formulario con clave_reserva, player_id, pista, fecha, hora. Muestra ventana de acceso tras generar.
- **Validación:** formulario con clave_reserva, pista, staff_id. Muestra ALLOW (verde) o DENY (rojo) con reason code.

Ambos formularios usan `authFetch` → respetan tokens de sesión reales.

---

## 12. Make — configuración manual necesaria

| Escenario Make | ID | Acción necesaria |
|------------|---|---------|
| Generación QR Acceso | 6244975 | Añadir `MAKE_QR_ACCESO_WEBHOOK` como secret en Worker |
| Control Acceso QR | 5291559 | Añadir `MAKE_CONTROL_QR_WEBHOOK` como secret en Worker |
| | | Verificar que módulo 1 (webhook) acepta campo `clave_reserva` |
| | | Verificar que Airtable tiene opción correcta para `resultado_acceso` |
| | | Confirmar fix del error 422 (visto en PASO 04B) con ejecución real |

**Hallazgo previo (PASO 04B):** Error 422 en Make al escribir `resultado_acceso` a Airtable porque el campo de selección única no tenía la opción configurada. Se corrigió manualmente en Airtable. Confirmar que sigue resuelto.

---

## 13. Evidencia para 100% PRODUCCIÓN

| Criterio | Estado |
|----------|--------|
| Código/lógica Worker terminados | ✅ |
| 29 tests PASS | ✅ |
| Build PASS | ✅ |
| App funcional con formularios reales | ✅ |
| RBAC por roles | ✅ (estructura, gate pendiente de activar) |
| Idempotencia | ✅ (Make-side) |
| Integración real Make (webhooks) | ⏳ PENDIENTE — configurar secrets |
| Persistencia real (Airtable via Make) | ⏳ PENDIENTE — requiere ejecución real |
| Prueba QR válido en producción | ⏳ PENDIENTE |
| Prueba QR inválido en producción | ⏳ PENDIENTE |
| Prueba reserva cancelada | ⏳ PENDIENTE |
| Prueba pista temporalmente cerrada | ⏳ PENDIENTE |
| Auditoría/log (Airtable historial) | ⏳ PENDIENTE — Make lo escribe |
| Recovery/error handler | ✅ (502 normalizado) |

**Porcentaje bloque QR:** ~55% (código terminado, Make pendiente de conectar)

---

## 14. Acciones manuales exactas

1. Wrangler: `wrangler secret put MAKE_QR_ACCESO_WEBHOOK` → pegar URL del webhook Make 6244975
2. Wrangler: `wrangler secret put MAKE_CONTROL_QR_WEBHOOK` → pegar URL del webhook Make 5291559
3. En Make: verificar que webhook 6244975 acepta campo `accion: "generar_qr_acceso"`
4. En Make: verificar que webhook 5291559 acepta campo `accion: "validar_qr_acceso"` y campo `scanned_at`
5. En Airtable: confirmar que el campo `resultado_acceso` tiene opciones: ACCESO_OK, QR_CADUCADO, DENEGADO_INVALIDO
6. Decisión de negocio: confirmar ventana de acceso (actualmente 15 min antes + 30 min después del inicio)
7. Prueba E2E real: crear reserva → generar QR → escanear QR en pista correcta → verificar ALLOW en Airtable
8. Prueba E2E inválido: usar QR de reserva cancelada → verificar DENY + CANCELLED

---

## 15. Rollback

Si algo falla tras activar los webhooks:
- No hay estado QR en el Worker — las variables de entorno se pueden eliminar con `wrangler secret delete`
- La UI volverá al estado "webhook not configured" (503) — sin pérdida de datos
- Airtable preserva el historial existente
- Los otros flujos (Alta, Baja, Reservas, Cierre Temporal) no se ven afectados

---

## 16. Constraints respetados

| Constraint | Estado |
|------------|--------|
| Flujo Cierre Temporal intacto | ✅ — regresión confirmada 16/16 |
| Flujo Alta Jugador intacto | ✅ — regresión confirmada |
| Flujo API Reservas intacto | ✅ |
| Sin datos reales en tests | ✅ — datos sintéticos `@test.example` |
| Sin secretos impresos | ✅ |
| Sin push/merge/deploy | ✅ |
| Sin commit no solicitado | ✅ |
