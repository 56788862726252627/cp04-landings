# HERMES_FIX_LOG.md

## 2026-07-11 — Cierre local Disponibilidad/Ocupación Worker
- `worker-reservas/src/availability-contract.js`: contrato puro para fecha ISO real, fecha imposible, timezone canónica `Europe/Madrid`, rango 0–365 días y scope fail-closed.
- `GET /api/disponibilidad`: ignora `tenant_id`/`club_id` del cliente; usa exclusivamente `AVAILABILITY_TENANT_ID`/`AVAILABILITY_CLUB_ID` y nombres de campo server-side. La fórmula Airtable filtra ambos y la respuesta aplica defensa en profundidad.
- Errores canónicos: configuración/scope 503, Airtable HTTP/red 502, timeout 504, body vacío/JSON/schema/campos incompletos 502; no se propagan detalles sensibles upstream.
- Tests nuevos: 13/13 PASS. Regresión focalizada Reservas/Disponibilidad/Auth: 75/75 PASS. Worker: 138 PASS, 0 FAIL, 2 EXPECTED_SKIP. Build PASS; `git diff --check` PASS.
- Auth A7 preservado: no se modificaron `worker-reservas/auth/*` ni los bloques Auth de `index.js`.

### Auditoría de IDs Airtable hardcodeados en runtime Worker
| Campo lógico | ID actual | Ubicación | Riesgo | Estrategia segura |
|---|---|---|---|---|
| Nombre | `fldYEv1HQY1uK8h4P` | `worker-reservas/src/index.js:993` | Alto: cambio de schema rompe listado | Registry server-side versionado; validar startup/preflight local |
| Apellidos | `fldTpYFznxlN74uxN` | `index.js:1001` | Alto | Igual |
| Email | `fldBssXQxXnhG8yXt` | `index.js:1009` | Alto/PII | Igual; fail-closed |
| Teléfono | `fldas4PPgKvIdpikH` | `index.js:1017` | Alto/PII | Igual; fail-closed |
| Fecha reserva | `fldUMLCyV75pxgHwy` | `index.js:1025` | Alto | Igual |
| Hora inicio | `fldfgICHdyy2kgxDr` | `index.js:1033` | Alto | Igual |
| Hora fin | `fldoJx5Er5JVwLKCY` | `index.js:1041` | P0 disponibilidad por intervalos | Campo obligatorio; no inferir silenciosamente |
| Pista | `fld0UMH1W6VXF55xb` | `index.js:1049` | Alto | Igual |
| Clave reserva | `fldB77jTtW9uXktsL` | `index.js:1057` | Alto/autorización operativa | Igual; nunca exponer sin auth |
| Estado | `fldXYQaqNXZWY9IO9` | `index.js:1065` | Alto | Igual |
| Event ID | `fld3XSooEwn5tVT5U` | `index.js:1073` | Medio/idempotencia | Igual + unicidad server-side |
| Clave slot | `fldlVxpC9vcoRxrRE` | `index.js:1081` | P0 doble reserva | Igual + índice/lock atómico externo |
| Fecha cancelación | `fldKnR6RJvVNlhGnB` | `index.js:1089` | Medio | Igual |
| Base / tabla | `appyWvzZJLzy0E6aX` / `tblBtLjPS3sis28nz` | `worker-reservas/wrangler.toml:7-8,14` | Acoplamiento de entorno | Bindings/vars por entorno; nunca aceptar IDs del cliente |

## 2026-07-11 — QA técnico: Reservas, Cancelaciones y Reprogramaciones
- No se modificó runtime: `worker-reservas/src/index.js` y `src/App.jsx` ya tienen cambios concurrentes.
- PASS: `node --test worker-reservas/src/*.test.mjs` → 48/48.
- PASS: regresión focalizada → 74/74 (motor de disponibilidad, RBAC, mapeo de rol, authFetch y aislamiento de sesión).
- PASS: `npm run build` → Vite finalizó correctamente.
- EXPECTED_FAIL comprobados por assertions: rutas sin credenciales (401/403) y disponibilidad sin Airtable (500).
- Se detectó cobertura ausente directa para `POST /api/reservas` (crear/cancelar/reprogramar), normalización, timeout/retry e idempotencia. No se añadió test para no tocar el Worker concurrentemente modificado.

## 2026-07-11 — Disponibilidad y Ocupación: auditoría estática
- UI usa `GET /api/disponibilidad?fecha=` con parámetro `t` y el Worker responde `Cache-Control: no-store`; no hay caché persistente detectada.
- El calendario usa `ocupadas_detalle` y el motor puro evalúa solapamientos de intervalo real.
- Los envíos crear/reprogramar solo precomprueban `ocupadas` (hora de inicio), no `ocupadas_detalle`: riesgo confirmado de falso libre ante reservas 90/120 min solapadas.
- El Worker no valida la forma de `fecha` en GET, no propaga `tenant_id`/`club_id`, y su lectura Airtable no filtra por tenant/club.

## 2026-07-11 — QR, notificaciones y ranking: inventario sin efectos externos
- QR: existen schemas QA estrictos para generación y control, con claves `QA_CP04_*`; no se ejecutaron ni se consideraron evidencia de wiring productivo.
- No hay consumidor QR en UI ni endpoint QR en Worker; el feature flag por defecto es `qr=false`.
- Notificaciones persistentes no están implementadas según `tests/tenant-storage-harness/04-business-data-isolation.test.mjs:64` (caso skip documentado).
- Ranking es UI con datos demo (`src/data/cp04DemoData.js`), sin endpoint ni persistencia local confirmada.
- PASS: `node --test tests/tenant-storage-harness/04-business-data-isolation.test.mjs` → 3 PASS, 2 SKIP/BLOCKED, 0 FAIL. Los casos de reservas y torneos son EXPECTED_FAIL ya documentados y fuera de alcance (T4/T7).

## 2026-07-11 — P0 precheck de solapamientos
- `src/utils/availability.js`: añadido adaptador compatible `ocupadas_detalle`/`ocupadas` y helper único `hasBookingOverlap` sobre `evaluateSlotAvailability`.
- `src/App.jsx`: crear y reprogramar dejaron de comparar solo la hora inicial; ahora comprueban intervalos reales.
- `src/utils/availability.test.mjs`: cobertura nueva 60/90/120 minutos y reserva contigua.
- PASS: 19/19 tests específicos; PASS: build Vite; PASS: `git diff --check`.
- Worker no modificado por este lote: se confirmó edición concurrente T5 en `worker-reservas/src/index.js` (cookies HttpOnly/CSRF).

## 2026-07-11 — Hardening local P0 TOCTOU Reservas
- `worker-reservas/src/booking-contract.js`: contrato canónico crear/reprogramar, scope server-side, idempotency validator, clasificación de respuestas y helper de overlap por intervalos/scope.
- `worker-reservas/src/index.js`: correlation generada en POST Reservas, idempotency obligatoria, fail-closed sin scope/Make, timeout 504, red/config 503, propagación tenant/club y mapping 201/200 replay/409/422/401/403/503/504.
- `src/App.jsx`: clave idempotente estable por payload para crear/reprogramar; los retries conservan key y una operación nueva la rota.
- Tests mock: 14 casos nuevos, sin Make/Airtable reales; cubren key, replay, ACK 200 no autoritativo fail-closed, conflict, overlap, contiguidad, tenant/club, correlation, 503, 504 y error Airtable controlado.
- Verificación final: Worker/Auth 154/154 PASS; regresión Reservas/Disponibilidad 46/46 PASS; Vite build PASS (warning no bloqueante de chunk principal 650.40 kB); `git diff --check` PASS.
- Documentación: `MAKE_RESERVAS_ATOMICIDAD_RUNBOOK.md`, `MAKE_RESERVAS_PREFLIGHT_PAYLOADS.md` y checkpoint `.txt` en `audit/reportes/`.
- El P0 externo NO se declara cerrado: falta serialización/single-writer o autoridad transaccional y prueba concurrente real autorizada.
