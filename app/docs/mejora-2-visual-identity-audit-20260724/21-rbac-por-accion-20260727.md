# Prompt 8 de 9 — Auditoría y endurecimiento RBAC por acción en toda la app

- **Fecha:** 2026-07-27
- **Worktree:** `/root/cp04-t-vite-watcher-fix` (app en `/root/cp04-t-vite-watcher-fix/app`)
- **Rama:** `mejora-2-10/rbac-action-hardening-20260727` (apilada sobre PR #64)
- **Continúa de:** [20-auditoria-torneos-ranking-20260727.md](20-auditoria-torneos-ranking-20260727.md), que identificó el hallazgo prioritario de este prompt: dentro de Torneos, los 4 roles con acceso al módulo veían y podían ejecutar los mismos controles de gestión.

## 1. Arquitectura anterior

Una única capa de RBAC, a nivel de **módulo** (`src/utils/rbac.js`, `CP04_ROLE_PERMISSIONS` + `cp04CanAccessSection`): responde a "¿puede este rol abrir esta pantalla?", con gate real de handler (`App.jsx:8351`, `modules[safeCurrentSection]`), no solo visual — ya bien resuelto y con 44 tests previos (`rbac.test.mjs`). Lo que faltaba: ninguna capa respondía a "¿puede este rol ejecutar esta acción concreta dentro de una pantalla a la que ya tiene acceso?". Torneos es la única pantalla de la app donde eso importaba, porque es la única a la que acceden los 4 roles y que mezcla ver y gestionar en el mismo componente sin ninguna prop de rol.

## 2. Arquitectura final

Se añade una segunda capa, **sin sustituir ni duplicar la primera** (`src/utils/permissions.js`):

- `CP04_ACTION_MODULE_MAP`: 26 actionId reales inventariadas (FASE 2), cada una resuelta por delegación al módulo correspondiente de `CP04_ROLE_PERMISSIONS` — una sola fuente de verdad de módulos, sin copiar la lista.
- `CP04_ACTION_ROLE_OVERRIDE`: restricción adicional por acción, más allá del módulo. Hoy solo tiene **una entrada real**: `"tournaments:manage": ["ADMIN"]`. Esto no es una omisión — es el resultado honesto de auditar toda la app: Torneos es la única pantalla que necesitaba esta segunda capa.
- `cp04Can(role, actionId)`, `cp04CanAny(role, actionIds)`, `cp04CanAll(role, actionIds)`, `cp04GetAllowedModules(role)`, `cp04GetAllowedActions(role)` — API pública, pura, sin DOM, sin depender de texto ni idioma, fail-closed (actionId desconocida o rol inválido → `false`).

`Torneos({ selectedRole })` consume `cp04Can(selectedRole, "tournaments:manage")` en una única constante `canManage`, usada para:
1. Bloquear cada uno de los 15 handlers mutables (`if (!canManage) return;` como primera línea — no solo ocultar el botón, FASE 5).
2. Condicionar en el JSX todos los controles de gestión (añadir/editar/eliminar pareja, panel Controles/Exportar/Historial, marcar ganador ✓A/✓B, selector de formato).
3. Mostrar un aviso honesto de solo lectura cuando `!canManage`, sin usar detección por texto ni afirmar seguridad de backend.

Ver/consultar (parejas, cuadro, clasificación del torneo) sigue disponible para los 4 roles — eso no cambia, porque ninguno de ellos perdió acceso al módulo.

## 3. Matriz de roles (FASE 1)

| Rol | Módulos (resumen) | Acciones de gestión propias | Acciones prohibidas | Diferencia UI/handler |
|---|---|---|---|---|
| PLAYER | inicio, reservas, torneos, ranking, comunidad, perfil | reservar, ver, perfil propio | gestión de torneos, reservas de terceros, admin, soporte | Ninguna: todo lo prohibido ya estaba fuera de su módulo, salvo Torneos (corregido hoy) |
| STAFF | + alta/baja jugador, reprogramar, cancelar, gestión operativa, cierre pistas, lista espera, QR, comunicaciones, calendario | gestión operativa de reservas/jugadores (real, contra el Worker) | facturación, backups, automatizaciones, admin KPI, Centro Técnico, soporte, **gestión de torneos** (nuevo, corregido hoy) | Ninguna nueva encontrada aparte de Torneos |
| ADMIN | + admin, dashboard_kpi, backups, facturación, automatizaciones, ranking | gestión completa de negocio, incluida gestión de torneos | Centro Técnico y Soporte (exclusivos de SUPPORT) | Ninguna |
| SUPPORT | + flujos_make, soporte, y **todo el bloque de negocio de ADMIN** (admin, dashboard_kpi, backups, facturación, automatizaciones) | diagnóstico técnico; además, gestión operativa de reservas/jugadores real (decisión ya existente y desplegada en el Worker, ver §4) | **gestión de torneos** (nuevo, corregido hoy) | Ninguna nueva aparte de Torneos |

**Nota sobre SUPPORT y "negocio":** el hallazgo del Prompt 7 mencionaba que "SUPPORT podía recibir permisos de gestión similares a ADMIN". Confirmado a nivel de módulo (`CP04_ROLE_PERMISSIONS.SUPPORT` incluye los mismos módulos de negocio que ADMIN), pero **no es un fallo nuevo de esta auditoría**: los cuatro paneles de negocio a los que SUPPORT accede (`BackupsSeguridad`, `FacturacionPagos`, `AutomatizacionesBots`, `ComunicacionesSocio`/`CalendarioDisponibilidad`) no tienen ninguna acción mutable real — todos sus botones usan `PreparedActionButtons`, que solo muestra un mensaje de "acción preparada, pendiente de conexión real" (ver `src/App.jsx:4479-4495`). No hay nada que SUPPORT pueda ejecutar ahí que ADMIN no pueda ver igual de "vacío". Se documenta como decisión de acceso de solo-observación ya correcta, no como escalada de privilegio.

## 4. Fuente de verdad de handlers reales (FASE 4-5, 8-9)

Se auditaron los 6 `authFetch(...)` reales de toda la app (búsqueda exhaustiva, no hay más):

| Endpoint | Componente | Roles en frontend (`CP04_ROLE_PERMISSIONS`) | Roles en el Worker (`requireRoles`, `worker-reservas/src/index.js`) | Coincide |
|---|---|---|---|---|
| `/api/jugadores/alta` | AltaJugador | STAFF, ADMIN, SUPPORT | STAFF, ADMIN, SUPPORT | ✅ |
| `/api/jugadores/baja` | AltaJugador (modo baja) | STAFF, ADMIN, SUPPORT | STAFF, ADMIN, SUPPORT | ✅ |
| `/api/pistas/cierre-temporal` | CierreTemporalPista | STAFF, ADMIN, SUPPORT | STAFF, ADMIN, SUPPORT | ✅ |
| cancelar/reprogramar reserva | CancelarReserva / ReprogramarReserva | STAFF, ADMIN, SUPPORT | STAFF, ADMIN, SUPPORT | ✅ |

**Hallazgo importante (no corregido, fuera de alcance):** los 4 gates del Worker están correctamente definidos con `requireRoles(request, env, ["STAFF","ADMIN","SUPPORT"])`, pero **condicionados** a `env.CP04_ENFORCE_ROLE_GATES === "true"` — si ese flag no está activo en el entorno real, el Worker no comprueba el rol en absoluto para esas rutas. Esto ya estaba documentado en sesiones anteriores (ver memoria de proyecto: "gate de rol inactivo", corregido parcialmente el 2026-07-15 con un deploy mínimo). No se ha tocado en este prompt porque: (a) es autenticación/autorización real de backend, explícitamente fuera de las reglas de seguridad de este prompt ("No cambiar autenticación real", "No modificar .env"); (b) no se puede verificar desde este worktree si el flag está activo en el entorno desplegado real. Se re-documenta aquí para que quede constancia en el contexto de RBAC de este prompt.

**Conclusión de FASE 8/9:** no hay ninguna escalada de privilegio real que corregir en Reservas, Jugadores, Facturación, Backups o Automatizaciones — el único gap real y accionable de toda la app era Torneos, ya corregido.

## 5. Torneos (FASE 7) — antes / después

| Acción | Antes (Prompt 7) | Después (este prompt) |
|---|---|---|
| Ver parejas, cuadro, ranking del torneo | Los 4 roles | Los 4 roles (sin cambios) |
| Crear/cambiar formato, añadir/editar/eliminar pareja | Los 4 roles | **Solo ADMIN** |
| Reordenar cruces, autoasignar nombres | Los 4 roles | **Solo ADMIN** |
| Guardar, publicar/despublicar | Los 4 roles | **Solo ADMIN** |
| Marcar ganador (✓A/✓B) | Los 4 roles | **Solo ADMIN** |
| Deshacer/rehacer, ver/restaurar historial | Los 4 roles | **Solo ADMIN** |
| Exportar JSON/CSV | Los 4 roles | **Solo ADMIN** |

STAFF y SUPPORT quedan en el mismo nivel que PLAYER dentro de Torneos (solo vista) porque no hay ninguna necesidad operativa documentada en el resto de la app que justifique darles gestión de torneos — aplicando el criterio explícito del prompt ("no ampliar permisos por conveniencia") en la dirección conservadora por defecto.

## 6. Otros módulos revisados sin cambios necesarios (FASE 6, 8, 9, 10)

- **Comunidad** (`ComunidadDemo.jsx`): `ModeracionTab` ya recibe `role` y muestra explícitamente el aviso *"En producción real esta cola sería visible solo para roles Staff/Admin. Se muestra aquí en modo demo"* — una relajación deliberada y ya transparente, no un gate roto. No se ha tocado.
- **Navegación forzada** (FASE 6): ya cubierta por 20 tests existentes en `rbac.test.mjs` que simulan forzar `current` a una sección protegida — todos pasan sin cambios.
- **Acciones destructivas** (FASE 10): la única acción destructiva real con mutación de estado compartido es "Eliminar pareja" en Torneos — ya tiene confirmación de 2 pasos (✕ → Eliminar/Cancelar) desde antes, y desde el Prompt 7 avisa si invalida rondas posteriores. Ahora además está restringida a ADMIN. El resto de "acciones destructivas" del inventario del prompt (restaurar backup, limpiar datos, eliminar publicación) no existen como funciones reales — son botones `PreparedActionButtons` sin mutación.

## 7. RBAC y modo demo (FASE 11)

- Un rol inválido o manipulado en `localStorage` (`cp04_role`) se degrada a PLAYER, nunca a un rol más privilegiado (`cp04NormalizeRole`, ya testeado; re-confirmado aquí para la nueva capa: `cp04Can("hacker", "tournaments:manage")` → `false`).
- Cambiar idioma no toca ningún estado de rol ni de permisos — `cp04Can` no recibe ni consulta idioma en ningún punto (confirmado por inspección de fuente en los tests nuevos).
- No existe ningún fallback a ADMIN en ningún punto del código (`cp04NormalizeRole` solo puede devolver uno de los 4 roles oficiales o `PLAYER`).
- **Límite honesto, no resoluble solo en cliente:** un usuario con acceso a las herramientas de desarrollador del navegador podría, en teoría, modificar el estado de React en memoria de una pestaña ya abierta para intentar forzar `canManage`. Esto es cierto de **cualquier** frontend SPA y no es específico de esta app. La única protección real contra eso es la validación en servidor — que ya existe para las acciones que sí tienen backend (alta/baja/cierre/cancelar/reprogramar, ver §4) y **no existe** para Torneos porque Torneos no tiene backend en absoluto (100% local, ver Prompt 7). Se documenta explícitamente: la protección de Torneos añadida hoy es de UX/higiene de producto para el modo demo local, no una garantía de seguridad — si Torneos se conecta a un backend real en el futuro, ese backend deberá repetir la comprobación de `tournaments:manage`, exactamente igual que ya hace el Worker para las otras 4 acciones.

## 8. Tests (FASE 12)

- **`src/utils/permissions.test.mjs`** (18 tests): positivos y negativos explícitos por rol/acción, `cp04CanAny`/`cp04CanAll`, fail-closed ante rol o actionId inválidos, independencia del idioma, coherencia interna del override.
- **`src/rbacActionHardening.test.mjs`** (7 tests): confirma por inspección de fuente que `Torneos` recibe `selectedRole`, que los 15 handlers comprueban `canManage` como primera línea, que el modules map de `App.jsx` pasa `selectedRole`, que los controles de gestión están condicionados en el JSX, que se muestra el aviso de solo lectura, y que el ranking del torneo sigue visible para todos (ver no es gestionar).
- **`src/tournamentAudit.test.mjs`**: 1 test actualizado (el hallazgo que documentaba la ausencia de `selectedRole` en Torneos queda obsoleto tras esta corrección; se sustituye por la confirmación de que ahora sí lo usa).
- Verificado además en vivo con Chromium: ADMIN ve controles de gestión y botón de marcar ganador; PLAYER, STAFF y SUPPORT ven el aviso de solo lectura y **no** ven añadir/editar/eliminar/controles/exportar/marcar ganador, mientras que la clasificación del torneo (botón "Ver todas") sigue visible para los 3.

## 9. Multiidioma y responsive (FASE 14-15)

`cp04Can` no depende de ningún texto ni de `cp04_language` (confirmado por test e inspección de fuente). El aviso de solo lectura y los controles ocultos son los mismos en los 8 idiomas porque ninguno de los textos que cambian de idioma participa en la decisión de permiso. Responsive: se reutiliza el mismo layout ya validado en el Prompt 7 (390/768/1440 sin overflow); al ocultar el panel lateral para roles sin gestión, la rejilla pasa a una sola columna (`cp04-tournament-grid` condicionada a `canManage`) en vez de dejar un hueco vacío — verificado por inspección de la clase condicional en el JSX.

## 10. Checklist técnico (FASE 17)

- [x] 1376/1376 tests (1351 + 25 nuevos).
- [x] Lint: idéntico a la rama base (4 errores preexistentes, 0 nuevos).
- [x] Build correcto.
- [x] `localhost:5175` → 200.
- [x] 0 llamadas externas, 0 € de coste, sin nuevas dependencias.
- [x] `/root/cp04-landings` no tocado. Sin merge.
- [x] `worker-reservas/` **no modificado** (autenticación/autorización real fuera de alcance).

## 11. Limitaciones que requieren backend (FASE 16)

- La protección de `tournaments:manage` es solo de cliente porque Torneos no tiene backend. Si en el futuro se conecta a uno, ese backend deberá exponer un endpoint equivalente (p. ej. `POST /api/torneos/*`) y repetir la comprobación de rol con `requireRoles(request, env, ["ADMIN"])`, con el mismo criterio fail-closed que ya usan `/api/jugadores/alta`, `/api/jugadores/baja` y `/api/pistas/cierre-temporal`.
- El flag `CP04_ENFORCE_ROLE_GATES` sigue siendo la pieza que decide si el Worker aplica de verdad sus propios gates de rol en las 4 rutas ya protegidas — su estado real en el entorno desplegado no se puede verificar desde este worktree.

## Checklist visual humano (tablet)

- [ ] Entrar como ADMIN, crear un torneo de 4 parejas y confirmar que todos los controles de gestión (Añadir, Reordenar, Autoasignar, Guardar, Publicar, Exportar, ✓A/✓B) están visibles y funcionan.
- [ ] Entrar como PLAYER (o STAFF/SUPPORT) y confirmar que se ve el aviso "modo solo lectura", sin ningún botón de gestión, pero sí el cuadro/parejas/ranking existentes y el botón "Ver todas" de la clasificación.
- [ ] Confirmar que cambiar de idioma no cambia qué se ve en ningún rol.
- [ ] Confirmar en tablet (768px) que el layout de solo lectura no deja un hueco vacío donde antes estaba el panel de controles.

## Riesgos residuales

1. `CP04_ENFORCE_ROLE_GATES` (Worker) — pieza de autorización real fuera de alcance de este prompt, re-documentada.
2. La protección de Torneos es solo de cliente (sin backend); documentado explícitamente en §7, no se declara como seguridad real de servidor.
3. SUPPORT sigue teniendo acceso de módulo a los paneles de negocio de ADMIN (backups/facturación/automatizaciones) — verificado como inofensivo hoy (todo son `PreparedActionButtons` sin mutación), pero si alguno de esos paneles pasa a tener una acción real en el futuro, esa acción deberá revisarse específicamente antes de asumir que SUPPORT puede ejecutarla.

No iniciar el Prompt 9.
