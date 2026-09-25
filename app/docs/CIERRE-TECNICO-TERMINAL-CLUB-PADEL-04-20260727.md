# Cierre técnico del bloque terminal — Club Pádel 04 (2026-07-27)

Documento maestro de cierre de la "Mejora 2" (Prompts 1-9, PR #52-#65). Consolida y referencia — no repite — la documentación detallada de cada prompt en `docs/mejora-2-visual-identity-audit-20260724/`.

## 1. Resumen ejecutivo

Nueve prompts consecutivos, cada uno apilado en git sobre el anterior, auditaron y corrigieron sistemáticamente una misma familia de bugs en Club Pádel 04: detección frágil por texto visible, selectores CSS por posición, conflictos de color/fondo, y — en los dos últimos prompts — ausencia de una capa de permisos por acción dentro de pantallas compartidas por varios roles (Torneos). El resultado es una aplicación que pasa de **1338 a 1377 tests**, con **0 regresiones detectadas** en ninguna de las 14 PR, **0 llamadas externas** realizadas en todo el proceso y **0 € de coste**. Todo el trabajo es reversible: 14 PR abiertas, apiladas, sin mergear.

## 2. Arquitectura actual

SPA React 18 + Vite, un único `src/App.jsx` (~8425 líneas) más un puñado de componentes (`CentroTecnico.jsx`, `ComunidadDemo.jsx`, `CP04GuidedTutorial.jsx`) y una capa de utilidades puras y testeables en `src/utils/` (`rbac.js`, `permissions.js`, `screenState.js`, `contrastCheck.js`, `availability.js`, `reservationErrors.js`). Persistencia 100% local (`localStorage`) salvo 4 acciones reales contra `worker-reservas/` (Cloudflare Worker): alta/baja de jugador, cierre temporal de pista, cancelar/reprogramar reserva. Autenticación real vía Supabase cuando está configurada; modo demo local cuando no.

## 3. Worktree correcto

`/root/cp04-t-vite-watcher-fix` (app en `/root/cp04-t-vite-watcher-fix/app`). **Nunca** `/root/cp04-landings` para este trabajo — worktree distinto, intacto durante los 9 prompts (verificado en cada prompt).

## 4. Comandos de inicio

```bash
cd /root/cp04-t-vite-watcher-fix/app
npm install          # si node_modules no existe
npm run dev           # Terminal 1 — Vite en :5175 (ya en marcha durante todo este trabajo)
npm test              # 1377 tests, node --test nativo
npm run lint           # eslint
npm run build          # build de producción
```

## 5. Organización T1/T2

Terminal 1: servidor Vite persistente en `:5175`, nunca reiniciado durante los 9 prompts (regla explícita de todos los prompts: "no iniciar otro servidor en 5175"). El trabajo de auditoría/corrección se ha ejecutado en esta misma sesión de terminal, con verificación en vivo contra ese mismo servidor mediante Chromium (playwright-core, binario cacheado) cuando se ha necesitado evidencia de comportamiento real en navegador.

## 6. PR #52-#65

Ver §9 del `21-rbac-por-accion-20260727.md` y la tabla completa en `PLAN-MERGE-PR-52-65-20260727.md` (§ este mismo cierre). Cadena confirmada íntegra hoy: las 14 PR están `OPEN` y `MERGEABLE` según GitHub, cada una con `baseRefName` apuntando exactamente a la `headRefName` de la anterior — sin saltos, sin ramas huérfanas.

## 7. Mejoras completadas (resumen por prompt)

| Prompt | PR | Resumen |
|---|---|---|
| 1 | #58 | Housekeeping: eliminación de `App.css` huérfano (584 líneas, 0 imports) y otro código muerto confirmado |
| 2 | #59 | Sustituye detección de estado por escaneo de texto (`internal-background-detector.js`/`role-background-detector.js`) por estado explícito de React (`screenState.js`) |
| 3 | #60 | Elimina `cp04-two-buttons-fix.js` (parche imperativo basado en texto) |
| 4 | #61 | Auditoría de contraste real con Chromium; corrige botones de login con texto invisible (fondo lima + texto oscuro sobrescrito) |
| 5 | #62 | Cierre global: bug del tutorial guiado (`button:nth-of-type(2)` invertía "Siguiente"/"Saltar" en el paso 1) |
| 6 | #63 | Auditoría de primera visita/onboarding/estados vacíos — sin bugs nuevos, tutorial ya correcto |
| 7 | #64 | Auditoría funcional de Torneos/Ranking: corrige colisión de ids (`Date.now()` a secas) y añade aviso al invalidar rondas posteriores al eliminar una pareja con progreso |
| 8 | #65 | RBAC por acción: `tournaments:manage` reservado a ADMIN (antes los 4 roles tenían gestión completa dentro de Torneos) |
| 9 (este) | pendiente | Cierre, consolidación, validación técnica final — sin desarrollos nuevos |

## 8. Tests

- Inicio de la Mejora 2 (Prompt 1): 1333 tests.
- Estado a la punta de PR #65 (antes de este prompt): **1377/1377**.
- Verificado de nuevo en este prompt: **1377/1377**, 0 fallos, 0 flaky (una sola ejecución completa, sin repeticiones necesarias).
- Cobertura por área: RBAC de módulo (44 tests en `rbac.test.mjs`), RBAC de acción (26 tests nuevos en `permissions.test.mjs` + `rbacActionHardening.test.mjs`), accesibilidad/contraste (`accessibilityAudit.test.mjs`, 8), conflictos color/fondo (`colorBackgroundConflicts.test.mjs`, 5), primera visita (`firstVisitOnboarding.test.mjs`, 5), Torneos (`tournamentAudit.test.mjs`, 8), más toda la suite preexistente de Reservas/Jugadores/Airtable/Make QA/multi-tenant/observabilidad heredada de sesiones anteriores.

## 9. Módulos (inventario funcional)

Inicio, Reservas, Alta/Baja Jugador, Reprogramar, Cancelar, Gestión, Cierre Temporal de Pista, Lista de Espera, Control QR, Pistas/Recordatorios, Comunicaciones de Socio, Calendario/Disponibilidad, Torneos, Ranking, Comunidad, Admin, Dashboard KPI, Backups y Seguridad, Facturación y Pagos, Automatizaciones y Bots, Centro Técnico (Make), Soporte, Perfil. 22 módulos en total, todos con gate de acceso en `CP04_ROLE_PERMISSIONS` (`rbac.js`) y protección real de handler (`cp04CanAccessSection`, no solo ocultación visual).

## 10. Roles

PLAYER, STAFF, ADMIN, SUPPORT — 4 roles oficiales, `cp04NormalizeRole` degrada cualquier valor no reconocido a PLAYER (fail-closed, nunca a un rol más privilegiado). Matriz completa de módulos por rol documentada en `rbac.js` con 44 tests; matriz de acciones documentada en `permissions.js` con 19 tests adicionales y un JSON auto-generado (`21-rbac-matriz-acciones-20260727.json`) que un test impide que se desincronice del código real.

## 11. RBAC

Dos capas, sin duplicación: **módulo** (`rbac.js`, "¿puede abrir esta pantalla?") y **acción** (`permissions.js`, "¿puede ejecutar esta acción concreta?", añadida en el Prompt 8). Única acción con distinción real de acción dentro de un módulo compartido: `tournaments:manage` (solo ADMIN). El resto de la app no necesitaba esta segunda capa porque no hay ninguna otra pantalla a la que accedan varios roles con handlers mutables sin distinción — verificado exhaustivamente en el Prompt 8 (6 llamadas `authFetch` reales auditadas contra `worker-reservas/`, todas consistentes frontend↔backend).

**Límite honesto:** la protección de Torneos es solo de cliente (Torneos no tiene backend). Las 4 acciones que sí tienen backend (alta/baja jugador, cierre temporal, cancelar/reprogramar) ya repiten la validación de rol en el Worker (`requireRoles`), pero ese gate está condicionado al flag de entorno `CP04_ENFORCE_ROLE_GATES` — su estado real en producción no se puede verificar desde este worktree (hallazgo heredado de sesiones anteriores, re-confirmado en el Prompt 8, no corregido por ser autenticación/autorización real de backend, fuera de alcance de todos los prompts terminal).

## 12. PWA

`manifest.webmanifest` con 13 iconos (16 a 512px, variantes `maskable` en 192/512), `favicon.ico`/`favicon.svg`, `apple-touch-icon.png`, `sw.js`. Todos verificados con HTTP 200 en este prompt. Registro del service worker gateado a `import.meta.env.PROD` (`src/main.jsx`) — no interfiere en desarrollo. Icono oficial del club activo; sin rastro del icono anterior (rayo morado) salvo un comentario histórico explicativo en `sw.js`. Fix de ENOSPC de Vite (`followSymlinks:false` en `vite.config.js`) intacto.

## 13. Accesibilidad

Contraste real auditado con Chromium (compositing alfa correcto, exclusión de gradientes de fondo) en los Prompts 4-5: 0 fallos de contraste en las 34 pantallas de rol auditadas. Foco visible global (`:focus-visible`), foco atrapado + Escape en el tutorial guiado, `label`/`htmlFor` añadidos donde faltaban (29 pares, Prompt 3-4). Verificado en este prompt: navegación completa por teclado en los controles reales de Torneos (todos `<button type="button">` nativos).

## 14. Responsive

390 / 768 / 1440 px verificados repetidamente a lo largo de los 9 prompts y de nuevo hoy: `document.documentElement.scrollWidth - clientWidth = 0` en los tres anchos, tanto en login como en Torneos (con y sin panel de gestión). El bracket de Torneos usa scroll horizontal interno **contenido** cuando hay muchas rondas — documentado como deliberado, no un bug.

## 15. Torneos

Sistema real de eliminación directa con BYE (sorteo aleatorio genuino), historial deshacer/rehacer (30 versiones), exportación JSON/CSV real (descarga de archivo genuina), impresión vía `window.print()` (honesto: usa el diálogo nativo del navegador, no un generador de PDF inexistente). Gestión (crear/editar/eliminar/publicar/marcar ganador/exportar) reservada a ADMIN desde el Prompt 8; ver cuadro/parejas/clasificación disponible para los 4 roles. **Round Robin no existe** — documentado como ausente, no construido (habría sido una función nueva, fuera del alcance de "corregir fallos reales").

## 16. Ranking

Dos superficies distintas, no confundir: (a) clasificación **del torneo actual** dentro de Torneos (real, calculada a partir del bracket) y (b) módulo "Ranking" global (`RANKING_PRO`), **100% datos de ejemplo estáticos**, correctamente etiquetados en pantalla ("datos de ejemplo", verificado visible con Chromium) — nunca presentados como reales.

## 17. Estado demo

Modo demo local activo por defecto (`VITE_CP04_AUTH_MODE`), con downgrade automático a `production` en build de producción si se configura mal (fail-closed, ver `.env.example`). Ningún dato de producción real en el código. `PreparedActionButtons` usado consistentemente en Backups/Facturación/Automatizaciones/Comunicaciones/Calendario para dejar claro qué es un botón "preparado, pendiente de conexión real" frente a una acción real.

## 18. Integraciones preparadas

Ver `PLAN-MERGE-PR-52-65-20260727.md` no aplica aquí — ver en su lugar el inventario detallado en §12 de este documento más abajo... (nota: la clasificación completa de integraciones vive en el propio §12 "Inventario de integraciones externas" de este cierre, tabla al final del documento).

## 19. Integraciones no configuradas

Airtable, Make (más allá de los 50 flujos ya documentados como "corriendo en Make" pero sin panel de gestión real en la app), Stripe, WhatsApp Business, Supabase (auth real condicionada a variables de entorno no presentes en este worktree). Ver tabla de clasificación A-F al final de este documento.

## 20. Riesgos

Ver informe final del Prompt 8 (§ Riesgos residuales) y el informe final de este prompt (más abajo, en el mensaje de cierre). El más relevante heredado de toda la Mejora 2: `CP04_ENFORCE_ROLE_GATES` sin verificar en el entorno real desplegado.

## 21. Dependencias externas

Ninguna nueva introducida en los 9 prompts. `playwright-core` se usó únicamente como herramienta de auditoría en el scratchpad de la sesión (nunca añadida a `package.json`, nunca parte del build).

## 22. Checklist de producción

Ver `PLAN-MERGE-PR-52-65-20260727.md` §Plan de producción (Fase 13 del Prompt 9) para el checklist ordenado de 17 puntos.

## 23. Orden recomendado (merge)

Ver `PLAN-MERGE-PR-52-65-20260727.md` — orden exacto #52→#65, uno a uno, con verificación después de cada merge.

## 24. Plan de rollback

Cada PR es un commit atómico sobre la anterior; revertir cualquier PR individual con `git revert` en orden inverso (empezando por la más reciente que dependa de ella) es seguro porque no hay ninguna PR que reescriba una anterior — cada una añade o corrige, no reestructura. Ver detalle en `PLAN-MERGE-PR-52-65-20260727.md`.

## 25. Plan de merge

Documento separado: `docs/PLAN-MERGE-PR-52-65-20260727.md` — no se ejecuta ningún merge en este prompt.

## 26. Validación humana pendiente

- Confirmar visualmente en tablet que el modo solo lectura de Torneos no deja huecos vacíos (Prompt 8).
- Confirmar que "Saltar"/"Finalizar tutorial" se ven correctamente como principal/secundario en los 4 roles (Prompt 5).
- Decidir si STAFF/SUPPORT deberían tener alguna capacidad operativa en Torneos más allá de solo lectura (decisión de producto, no técnica).
- Verificar en el entorno real desplegado si `CP04_ENFORCE_ROLE_GATES=true` está activo.

## 27. Comandos útiles

```bash
git log --oneline --decorate -20                     # ver la cadena de commits
gh pr list --state open                                # ver las 14 PR abiertas
npm test -- --test-name-pattern="torneos|rbac"          # ejecutar solo tests relevantes
curl -s http://localhost:5175/manifest.webmanifest      # comprobar PWA
```

## 28. Limitaciones honestas

- Ninguna de las correcciones de este bloque toca el backend real (`worker-reservas/`) salvo por lectura/auditoría — ninguna garantía de seguridad de servidor se declara donde solo existe protección de cliente (regla explícita de todos los prompts, cumplida).
- No existe Round Robin, no existe puntuación de ranking global real, no existe entrada de marcador con sets — todo documentado como ausente, no simulado.
- El tutorial guiado y buena parte del bracket/ranking de Torneos no están traducidos (claves huérfanas en 8 idiomas) — gap de contenido preexistente, no tocado en ningún prompt por estar fuera de alcance ("no tocar textos visibles/traducciones").

---

## Inventario de integraciones externas (Fase 12 del Prompt 9)

| Integración | Clasificación | Estado | Credenciales necesarias | Coste esperado | Modalidad gratuita | Riesgo |
|---|---|---|---|---|---|---|
| Airtable | D (pendiente de configuración externa) | Adaptador diseñado y testeado localmente (`airtable-p0-architecture`), sin credenciales | `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` | Gratis en plan free hasta límites de filas/requests | Sí (plan free) | Rate limiting (429) ya documentado como bloqueador recurrente en sesiones anteriores |
| Make | C/D (50 flujos ya corren en Make de forma independiente; sin panel de gestión conectado en la app) | Escenarios activos fuera de esta app; integración app↔Make parcial (14/50 activos según última auditoría) | Ya configurado en Make, no en este repo | Depende del plan Make ya contratado | N/A (ya activo) | Desfase entre lo documentado y lo realmente activo (hallazgo de auditorías previas) |
| Gmail | E (pendiente de desarrollo) | Sin adaptador en este repo | OAuth Gmail API | Gratis (cuota API) | Sí | Ninguno hoy (no implementado) |
| WhatsApp Business | B (arquitectura preparada, sin credenciales) | Adaptador aislado con templates/consent/retry, 101 tests, `NOT_CONFIGURED` | `WHATSAPP_PROVIDER_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | De pago por conversación (Meta) | No hay tier gratuito real de producción | Requiere aprobación de Meta Business, coste variable |
| Stripe | B (arquitectura preparada, sin credenciales) | Adaptador aislado, distinto del mock de Make, 56 tests, bloqueo explícito de claves `sk_live_` | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Gratis en modo test; comisión por transacción en real | Sí (modo test) | Ninguno mientras se use solo modo test |
| Supabase | D (pendiente de configuración externa) | Auth real ya integrada en código (`authService.js`, `authorization.js`), sin proyecto/credenciales configuradas en este worktree | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Gratis en plan free (límites de filas/auth) | Sí | El login demo por contraseña no emite token verificable — bloquea activar `CP04_ENFORCE_ROLE_GATES` hoy (hallazgo ya documentado) |
| Dominio | F (bloqueada por coste/cuenta) | No evaluado en este prompt (fuera de alcance técnico-terminal) | Compra de dominio | Coste anual variable | No aplica | — |
| Hosting | E/F | No evaluado en este prompt | Depende del proveedor elegido | Variable, hay tiers gratuitos (Cloudflare Pages, Vercel) | Sí en varios proveedores | — |
| PWA | A (implementada y validada localmente) | Manifest/iconos/service worker completos y verificados con HTTP 200 | Ninguna | 0 € | Sí | Ninguno |
| Correo transaccional | E | Sin adaptador en este repo | Proveedor SMTP/API | Variable, hay tiers gratuitos | Sí | — |
| QR (Control de accesos) | C (mock/demo) | Panel visual preparado (`ControlQrAccesos`, `PreparedActionButtons`) | Ninguna todavía | 0 € | Sí | Ninguno hoy |
| Backups | C (mock/demo) | Panel visual preparado, sin ejecución real | Depende de destino (R2/S3/Drive, ya diseñado en sesiones previas) | Variable según destino | Sí (tiers free de R2/Drive) | Ninguno hoy |
| Observabilidad | B (arquitectura preparada) | Runtime de logging/correlation-id/health-check ya implementado y testeado (228+141+84 tests en sesiones previas), sin backend de agregación real conectado | Depende del backend elegido | Variable | Sí (soluciones open-source) | Ninguno hoy, pendiente de decisión de plataforma |

No se ha activado, configurado ni llamado a ninguna de estas integraciones en este prompt.
