# Prompt 7 de 9 — Auditoría funcional profunda de Torneos, Ranking y formularios

- **Fecha:** 2026-07-27
- **Worktree:** `/root/cp04-t-vite-watcher-fix` (app en `/root/cp04-t-vite-watcher-fix/app`)
- **Rama:** `mejora-2-9/tournaments-ranking-functional-audit-20260727` (apilada sobre PR #63)
- **Método:** lectura completa de `src/App.jsx` (bloque Torneos/Ranking, líneas ~5850-6900) + verificación en vivo con Chromium (playwright-core 1.61.1, binario cacheado, `--no-sandbox`) contra `localhost:5175` real, sin datos inventados.

## 1. Mapa funcional real

El módulo "Torneos" (`function Torneos()`, `src/App.jsx`) es **un único sistema de eliminación directa (single elimination) con BYE**, con persistencia en `localStorage` (`cp04_torneo_v2` + `cp04_torneo_hist_v2` para el historial de undo/redo). El módulo "Ranking" (`function Ranking()`) es un **listado estático de ejemplo** (`RANKING_PRO`, 15 parejas fijas), sin relación de datos con los torneos jugados en el otro módulo. El "ranking" que aparece dentro de Torneos es una tabla de clasificación **del propio torneo actual** (ganadoras/eliminadas/BYE), independiente del módulo Ranking global.

| Acción | Componente/handler | Persistencia | Estado real |
|---|---|---|---|
| Crear torneo (formato 16/32/64 o personalizado) | `applyFormat` / `applyCustom` | `localStorage` (`cp04_torneo_v2`) | **Real** |
| Añadir/editar/eliminar pareja | `handleAddPair` / `handleEditSave` / `handleDeletePair` | `localStorage` | **Real** |
| Autoasignar nombres de ejemplo | `handleAutoAssign` | `localStorage` | Real, pero explícitamente rellena con nombres demo (`TORNEO_DEMO_NAMES`), no oculta que son de ejemplo |
| Reordenar/sortear cruces + BYE si es impar | `handleReorder` → `torneoBuildFullBracket` | `localStorage` | **Real** (aleatorio genuino en cada pulsación, no fingido) |
| Marcar ganador de un partido | `handleMarkWinner` → `torneoAdvanceWinner` | `localStorage` | **Real** (avanza el ganador a la ronda siguiente) |
| Deshacer/Rehacer | `handleUndo` / `handleRedo` | `localStorage` (`cp04_torneo_hist_v2`, hasta 30 snapshots) | **Real** |
| Guardar cuadro | `handleSave` | `localStorage` (ya se guarda solo con cada cambio; este botón solo confirma) | Real, aunque el guardado automático ya existente hace que el botón sea más una confirmación visual que una acción distinta |
| Publicar/despublicar | `handlePublish` | `localStorage` (flag `published`) | **Real** (cambia estado y aspecto, sin backend) |
| Exportar JSON | `handleExportJSON` | Descarga de archivo vía `Blob`/`URL.createObjectURL` | **Real** — JSON genuino con parejas, bracket, ranking, BYE, fecha |
| Exportar CSV | `handleExportCSV` | Igual mecanismo | **Real** — CSV genuino de parejas |
| Imprimir / PDF | `window.print()` | N/A | **Real y honesto**: usa el diálogo de impresión nativo del navegador (que permite "Guardar como PDF" en todos los navegadores modernos), no simula un generador de PDF que no existe |
| Ver ranking del torneo | `showRanking` (estado local) | N/A | **Real** |
| Ver ranking completo (módulo global) | Navegación a `ranking` | N/A | **Real**, pero sobre datos 100% de ejemplo, etiquetados como tales (`ranking.datos_ejemplo`, verificado visible en Chromium) |

## 2. Hallazgo más importante: sin control de rol dentro de Torneos (documentado, no corregido)

`CP04_ROLE_PERMISSIONS` (`src/utils/rbac.js`) da acceso al **módulo** "torneos" a los 4 roles: PLAYER, STAFF, ADMIN y SUPPORT. Esa puerta de entrada está bien protegida (`cp04CanAccessSection`, gate real a nivel de handler, no solo visual — confirmado leyendo `App.jsx:8351` y `rbac.js:87-91`). El problema es que **una vez dentro**, el componente `Torneos()` no recibe `selectedRole` ni aplica ningún filtro por rol: todos los botones (Añadir, Reordenar cruces, Autoasignar, Guardar cuadro, Publicar, marcar ganador, editar, eliminar) están disponibles igual para un PLAYER que para un ADMIN.

**Confirmado en vivo con Chromium:** iniciando sesión como PLAYER y entrando a Torneos, los botones `Reordenar cruces`, `Autoasignar`, `Guardar cuadro`, `Publicar`, `＋ Añadir` aparecen exactamente igual que para ADMIN.

Esto contradice el reparto de responsabilidades descrito en la propia auditoría (FASE 10: *"PLAYER: ver torneos, inscripción si existe, ver cuadro, ver ranking"* frente a *"ADMIN: creación, edición, publicación, eliminación, gestión completa"*). **No se ha corregido** porque hacerlo exige una decisión de negocio sobre permisos por rol, y las reglas de seguridad de este prompt prohíben explícitamente modificar RBAC o permisos por rol. Se documenta como el hallazgo de mayor severidad de esta auditoría y candidato natural para un prompt futuro dedicado en exclusiva a esa decisión.

## 3. Corregido en este prompt (2 fallos reales, con evidencia)

### 3.1 Ids generados con `Date.now()` a secas → colisión real en doble pulsación

`handleAddPair` generaba el id de cada pareja nueva como `` `p${Date.now()}` ``, y `pushHistory` generaba el id de cada snapshot del historial (usado también como `key` de React en la lista de versiones) como `Date.now()` sin más. `Date.now()` tiene resolución de 1 ms: dos clics muy rápidos (o el mismo evento disparado dos veces, un caso real cubierto explícitamente por la FASE 2/7 de este prompt: *"doble pulsación", "submit duplicado"*) pueden producir el mismo valor. El efecto real: dos parejas con el mismo id (duplicidad prohibida explícitamente por la FASE 3), y `handleDeletePair(id)` borrando **ambas a la vez** en vez de solo una, además de una `key` de React duplicada en el historial.

**Corrección:** nuevo generador `torneoUid(prefix)` con contador incremental por módulo (`torneoIdSeq`), que garantiza unicidad aunque el reloj no avance entre dos llamadas. Aplicado en `handleAddPair` (id de pareja) y `pushHistory` (id/key de snapshot). `torneoBuildEmptyPairs` ya era seguro (comparte `Date.now()` pero diferencia cada pareja por índice) y no se ha tocado.

### 3.2 Eliminar una pareja que ya tenía resultados no avisaba de nada

`handleDeletePair` retiraba del `bracket` cualquier partido donde apareciera la pareja eliminada — incluidas rondas posteriores a las que ya hubiera avanzado como ganadora — sin ningún aviso. La FASE 4 de este prompt exige explícitamente: *"advertencia antes de invalidar rondas posteriores"*.

**Corrección:** `handleDeletePair` ahora detecta si la pareja eliminada tenía un partido decidido (`m.winner`) o había llegado a una ronda posterior (`m.round > 1`) y, si es así, muestra un aviso explícito: *"⚠️ '{pareja}' tenía resultados en el cuadro: se han invalidado los partidos y rondas posteriores que dependían de ella."* — confirmado en vivo con Chromium (torneo de 4 parejas, ganador marcado, eliminación de esa pareja → aviso visible con el texto exacto).

No se ha cambiado la lógica de qué partidos se retiran del cuadro (ya era correcta: cualquier partido, en cualquier ronda, donde la pareja eliminada figurase como `pairA`/`pairB` desaparece, evitando un "ganador fantasma" que ya no existe en `pairs`), solo se ha añadido la notificación que faltaba.

## 4. Verificado en vivo con Chromium (sin cambios, ya correcto)

- **5 parejas (impar):** sorteo asigna BYE automáticamente, aviso "Pase directo sorteado" visible, 6 celdas de partido en total (3 en ronda 1 —2 reales + 1 BYE—, 2 en semifinal, 1 en la final), consistente con la fórmula de `torneoBuildFullBracket`.
- **4 parejas (par):** sin BYE, bracket de 2 rondas, marcar ganador avanza correctamente a la siguiente ronda.
- **Eliminación con progreso ya registrado:** aviso correcto (ver §3.2).
- **Persistencia tras recarga:** el torneo configurado (parejas, formato) sobrevive a `location.reload()`, confirmando que el `useEffect` que escribe en `localStorage` en cada cambio funciona como se espera.
- **Responsive 390 / 768 / 1440 px:** `document.documentElement.scrollWidth - clientWidth = 0` en los tres anchos — sin desbordamiento horizontal a nivel de página. El bracket con muchas rondas usa scroll horizontal **contenido** dentro de su propio contenedor (`overflowX:auto`), tal y como permite explícitamente este prompt.
- **Teclado:** todos los controles (`＋ Añadir`, `Reordenar`, `Autoasignar`, `Guardar`, `Publicar`, exportar, marcar ganador, Deshacer/Rehacer) son elementos `<button type="button">` nativos — operables por teclado (Enter/Espacio) sin necesitar nada adicional, con el `:focus-visible` global ya validado en el Prompt 4.
- **Ranking global (módulo separado):** etiqueta "datos de ejemplo" visible (`ranking.datos_ejemplo`), podio de 3 puestos renderizado correctamente — confirmado que **no** se presenta como dato real.
- **Sin errores de consola** durante ninguno de los flujos anteriores (creación, BYE, avance de rondas, eliminación con progreso, exportación, ranking).

## 5. Round Robin: no existe (no inventado, documentado como vacío real)

Se ha buscado explícitamente en todo el código (`round.?robin`, `todos contra todos`, `liga`, `jornada`) y **no hay ninguna implementación de Round Robin en la aplicación**. El módulo Torneos es exclusivamente eliminación directa con BYE. Toda la FASE 5 de este prompt (jornadas, descanso, emparejamientos que no se repiten, lado A/B) **no es auditable porque la función no existe**. No se ha construido una implementación de Round Robin: sería una función nueva, no un fallo demostrado sobre código existente, y las reglas de este mismo prompt prohíben "sustituir funciones reales por simples mensajes visuales" e inventar resultados — construir Round Robin desde cero excede claramente el alcance de "corregir fallos reales demostrados".

## 6. Otros hallazgos documentados, no corregidos (fuera del alcance permitido)

1. **Traducciones huérfanas en Torneos.** Los idiomas (8 diccionarios) definen claves como `torneos.bye`, `torneos.pase_directo`, `torneos.eliminada`, `torneos.avanza`, `torneos.personalizado` — pero el JSX de `Torneos()` usa literales españoles hardcodeados para esos mismos conceptos ("✅ Pase directo · BYE", "Eliminada", "Avanza", "Vacía"...) en vez de `tx(...)`. Solo un subconjunto de botones (Reordenar, Autoasignar, Guardar, Publicar, Exportar) sí usa `tx()`. Efecto real: cambiar el idioma del sitio **no traduce** el bracket ni la tabla de clasificación del torneo. Es la misma familia de "clave de traducción huérfana" ya documentada en sesiones anteriores (p. ej. `home.ir_reservas`) — no se ha tocado porque corregirlo implica cambiar texto visible, fuera del alcance de esta auditoría funcional.
2. **Sin validación cruzada de participantes duplicados.** No hay ninguna comprobación de que el mismo nombre de jugador no se repita en dos parejas distintas, ni de que `player1` y `player2` de una misma pareja sean distintos. Es entrada de texto libre. No provoca corrupción de datos ni error — solo permite una configuración de torneo poco realista. Se documenta como límite de calidad de datos, no como fallo funcional que requiera una nueva regla de negocio no solicitada explícitamente.
3. **Sin entrada de marcador/sets.** "Marcar ganador" es una decisión binaria (✓A/✓B), no hay campos de resultado (sets, juegos). La interfaz nunca afirma lo contrario (no hay ningún texto que prometa "marcador 6-4, 6-3"), así que no es una promesa incumplida — es una simplificación consistente, documentada aquí por transparencia.
4. **STAFF no tiene acceso al módulo Ranking global** (sí a Torneos) según `CP04_ROLE_PERMISSIONS`. No se ha tratado como fallo: no hay ninguna especificación previa que exija lo contrario, y no se ha tocado el archivo de permisos.

## 7. Tests (Fase 14)

8 tests nuevos en `src/tournamentAudit.test.mjs` (inspección de fuente sobre `App.jsx`, mismo enfoque usado en toda esta serie de prompts dado que `App.jsx` no es un módulo exportable):

- Existe `torneoUid` con contador incremental.
- `handleAddPair` y `pushHistory` ya no generan ids con `Date.now()` a secas.
- `torneoBuildEmptyPairs` (patrón seguro preexistente) no se ha tocado.
- `handleDeletePair` detecta `affectsBracket` y muestra el aviso de invalidación con `noticeErr=true`.
- Confirma que no existe Round Robin en el código (no se ha inventado).
- Confirma que `Torneos()` no recibe/usa `selectedRole` (evidencia en código del hallazgo de RBAC del §2).

## 8. Validación técnica completa (Fase 17)

- **Tests:** 1351/1351 (1343 + 8 nuevos).
- **Lint:** exactamente los mismos 4 errores preexistentes que en la rama base (verificado con `git stash`/lint antes-después); 0 errores/warnings nuevos. Un aviso transitorio de "eslint-disable directive sin usar" causado por sustituir `Date.now()` por `torneoUid()` se limpió con `eslint --fix` + una línea en blanco residual eliminada a mano.
- **Build:** correcto (`vite build`, 1.50 s).
- **`localhost:5175`:** 200.
- **Sin llamadas a Airtable/Make/Stripe/WhatsApp.** Sin coste. Sin nuevas dependencias.
- **`/root/cp04-landings` no tocado.**
- **Sin merge.**

## 9. Riesgos residuales

1. **RBAC interno de Torneos** (§2) — el hallazgo más importante de esta auditoría, deliberadamente no corregido por estar fuera del alcance permitido (modificar permisos por rol). Requiere una decisión explícita de producto en un futuro prompt.
2. **Traducciones huérfanas del bracket/ranking del torneo** (§6.1) — mismo patrón ya visto en otros módulos, documentado, no corregido (no tocar texto visible).
3. El "Guardar cuadro" es funcionalmente redundante con el autoguardado ya existente en cada cambio de estado — no es un fallo, pero puede confundir al usuario pensando que sin pulsarlo no se guarda nada. No se ha tocado (cambiaría el copy visible del botón).
4. Sin validación de duplicados entre parejas (§6.2) y sin entrada real de marcador (§6.3) — limitaciones documentadas, no fallos.

## Checklist visual humano (tablet)

- [ ] Crear un torneo personalizado con un número impar de parejas y confirmar que el aviso de "Pase directo sorteado" se lee bien y el bracket se desplaza horizontalmente sin cortar contenido.
- [ ] Marcar un ganador en un partido, eliminar después esa pareja, y confirmar que aparece el aviso naranja de advertencia (no verde) explicando que se invalidaron rondas posteriores.
- [ ] Entrar como PLAYER y confirmar (para decidir si se acepta o no como comportamiento deseado) que ve los mismos botones de gestión que ADMIN dentro de Torneos.
- [ ] Exportar JSON y CSV desde una tablet y confirmar que la descarga se completa correctamente en el navegador usado.

No iniciar el Prompt 8.
