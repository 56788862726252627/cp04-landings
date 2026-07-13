# HERMES_INTEGRATION_MASTER_MATRIX.md

| Área | UI / handler | Ruta / contrato | Evidencia local | Estado |
|---|---|---|---|---|
| Crear reserva | `Reservas.send` (`src/App.jsx:3618`) | `POST /api/reservas`, `accion=crear_reserva` | Precheck UI reutiliza intervalos reales; 19/19 tests; autoridad atómica Worker pendiente | PARTIAL |
| Cancelar reserva | `CancelarReserva.submit` (`src/App.jsx:3705`) | `POST /api/reservas`, `accion=cancelar_reserva` | Estado loading/success/error y preflight OPTIONS cubierto indirectamente | PARTIAL |
| Reprogramar reserva | submit (`src/App.jsx:3827`) | `POST /api/reservas`, `accion=reprogramar_reserva` | Precheck UI reutiliza intervalos reales; autoridad atómica Make/backend pendiente | PARTIAL |
| Disponibilidad / ocupación | `CalendarioDisponibilidad` (`src/App.jsx:601`) | `GET /api/disponibilidad?fecha=YYYY-MM-DD` | Contrato Worker local: scope tenant/club canónico, fecha/timezone/rango, timeout y errores Airtable; 13 tests nuevos + 19 de intervalos. Activación requiere schema/vars externos | PARTIAL (PASS_LOCAL / BLOCKED_CONFIG) |
| QR / control de acceso | No consumidor UI/Worker localizado; flag `qr=false` | Schemas QA locales para 6244975 y 5291559; sin ruta Worker | Schema/fixtures existen, pero no hay wiring app→Worker ni ejecución realizada en esta auditoría | BLOCKED |
| Notificaciones internas | Preferencias de perfil, sin bandeja/persistencia | N/A | Test de harness marca feature no implementada y se salta | BLOCKED |
| Ranking | `Ranking` (`src/App.jsx:5763`) | Sin endpoint Worker localizado | `src/data/cp04DemoData.js` contiene datos demo; no persiste ni hay fuente real | PARTIAL |
| Ligas / comunidad / favoritos / historial | No componentes ni rutas Worker localizados | N/A | Sin evidencia de implementación conectada | UNKNOWN |

## QA técnico — 2026-07-11
- **PASS:** `node --test worker-reservas/src/*.test.mjs`: 48/48.
- **PASS:** regresión focalizada (availability, authorization/RBAC, role mapping, auth fetch/tenant isolation): 74/74.
- **PASS:** `npm run build`: Vite build finalizó correctamente.
- **PREEXISTING_FAILURE:** ninguna observada en estas ejecuciones.
- **EXPECTED_FAIL:** respuestas 401/403/500 ejercitadas por tests de seguridad/configuración; assertions PASS.
- **SUPERSEDED 2026-07-11:** la ausencia de pruebas directas de `POST /api/reservas` quedó cubierta localmente por `booking-contract.test.mjs`; la atomicidad externa continúa bloqueada y se detalla en el addendum.
- **PASS:** harness de datos de negocio: 3 PASS, 2 BLOCKED/SKIP, 0 FAIL; confirma ausencia de persistencia para ranking y notificaciones/favoritos no implementados.

## Addendum P0 atomicidad Reservas — 2026-07-11
| Capa | Evidencia nueva | Estado |
|---|---|---|
| UI crear/reprogramar | `idempotency_key` estable por payload y retry; cambia al iniciar una operación nueva | PASS_LOCAL |
| Worker | Scope canónico, correlation obligatoria/generada, contrato de escritura, timeout y mapping 201/200/409/422/401/403/503/504 | PASS_LOCAL |
| Conflictos | Helper puro prueba overlap parcial, adyacencia y aislamiento tenant/club | PASS_LOCAL_PRECHECK |
| Make 5697630 | Blueprint evidencia Search→Calendar Create→Airtable Create; sin serialización verificada | BLOCKED_EXTERNAL_ATOMICITY |
| Airtable | `clave_slot` lógico existe; no hay unique constraint/transacción demostrada | BLOCKED_EXTERNAL_ATOMICITY |
| Rollback/notificaciones | Diseño en runbook; no verificado en escenario real | BLOCKED_EXTERNAL |

Readiness Reservas: antes `PARTIAL` por TOCTOU sin contrato; después `PARTIAL (PASS_LOCAL / BLOCKED_EXTERNAL_ATOMICITY)`. Fuente: `MAKE_RESERVAS_ATOMICIDAD_RUNBOOK.md`.
