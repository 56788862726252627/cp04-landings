# Prompt 6 de 9 — Auditoría y cierre de primera visita, onboarding y estados vacíos

- **Fecha:** 2026-07-26/27
- **Worktree:** `/root/cp04-t-vite-watcher-fix` (app en `/root/cp04-t-vite-watcher-fix/app`)
- **Rama de partida:** `mejora-2-7/color-background-conflicts-20260726` (PR #62, abierta, sin merge)
- **Continúa de:** [18-cierre-conflictos-color-fondo-20260726.md](18-cierre-conflictos-color-fondo-20260726.md)

## Resultado general

A diferencia de los Prompts 3-5, esta auditoría **no encontró un bug nuevo del mismo calibre** (texto invisible, jerarquía invertida). Encontró un único mecanismo de primera visita real en toda la aplicación (el tutorial guiado) y lo auditó a fondo contra los 12 criterios de la Fase 2/10 del prompt, confirmando que la mayoría ya están bien resueltos — con evidencia real, no solo lectura de código — y verificando por qué el único comportamiento "sospechoso" encontrado (`Saltar` no persiste el cierre) es en realidad el comportamiento **especificado explícitamente** por este mismo prompt, no un defecto.

## Fase 1 — Inventario de flujos de primera visita

Búsqueda exhaustiva de `localStorage`/`sessionStorage` en `App.jsx` y todos los componentes activos:

| Clave | Archivo | Propósito | Namespaced por rol |
|---|---|---|---|
| `cp04_tutorial_seen_${role}` | `CP04GuidedTutorial.jsx` | Tutorial ya visto/completado | **Sí** (rol embebido en la clave) |
| `cp04_role` | `App.jsx` | Rol de sesión demo recordado | N/A (es la clave del rol) |
| `cp04_language` | `App.jsx` | Idioma elegido | No aplica (global, correcto) |
| `cp04_register_open/name/email/done` | `App.jsx` | Formulario de registro (borrador local) | No aplica |
| `cp04_auth_mode`, `cp04_user_email` | `App.jsx` | Sesión de autenticación real | No aplica |
| `cp04_avatar`, `cp04_bio`, `cp04_deporte`, `cp04_privacidad` | `App.jsx` (Perfil) | Datos de perfil (fallback local) | No — son por dispositivo, no por rol, ya coherente con su propósito |
| `cp04-reservas-email` | `App.jsx` (Gestión) | Último email consultado en "Consultar reservas" | No aplica |
| `TORNEO_STORE` / `TORNEO_HIST_STORE` (constantes) | `App.jsx` (Torneos) | Borrador de torneo + historial de acciones | No aplica |

**No existe** ningún otro flag de "visto"/"completado"/"dismissed" en toda la aplicación: no hay onboarding de bienvenida separado del tutorial, no hay banner de "instalar PWA" con dismissal propio, no hay aviso de "nueva versión" con opción de posponer (ver Fase 5). `sessionStorage`: 0 usos en todo el proyecto.

## Fase 2 — Tutorial guiado (auditoría completa)

Verificado con Chromium, no solo por lectura de código:

| Criterio del prompt | Resultado |
|---|---|
| Botón principal correctamente visible | ✅ Corregido en el Prompt 5 (bug de `nth-of-type`) |
| "Saltar" como acción secundaria | ✅ Estilo `btnGhostSkip` (transparente, texto atenuado) — confirmado visualmente |
| Orden de tabulación | ✅ Sigue el orden real del DOM (Atrás → Siguiente/Finalizar → Saltar → No mostrar más) |
| Foco dentro del modal | ✅ **Ya implementado**: `dialogRef` + `focusableSelector`, foco inicial al primer control, `Tab`/`Shift+Tab` atrapados dentro del diálogo |
| Escape, cuando proceda | ✅ **Ya implementado**: `e.key === "Escape"` → `close(false)` |
| Retorno de foco | ⚠️ No implementado explícitamente (no se guarda ni restaura `document.activeElement` previo al abrir el tutorial) — ver riesgos residuales |
| No bloqueo de scroll incorrecto | ✅ El tutorial no toca `document.body.style.overflow` en absoluto — no hay bloqueo que pueda quedarse mal cerrado |
| No dependencia de posición en DOM | ✅ Corregido en el Prompt 5 |
| No dependencia de texto | ✅ Los targets de cada paso se localizan por `data-tour="sidebar-<id>"` (atributo estable), nunca por texto |
| No conflicto de color/fondo | ✅ Verificado en el Prompt 5 |
| No elementos fuera de pantalla | ✅ `calcTooltipPos()` ya clampa la posición del tooltip a los márgenes del viewport (4 estrategias: derecha/debajo/encima/centrado) |
| No tutorial detrás de otros overlays | ✅ Confirmado con `z-index` propio y sin overlays simultáneos en las pruebas |

### Verificado con Chromium (no solo código)

- **Aislamiento por rol:** completar el tutorial de PLAYER no marca "visto" el de STAFF — confirmado (`cp04_tutorial_seen_STAFF` sigue `null` tras terminar el de PLAYER, y el tutorial de STAFF vuelve a aparecer en su primera sesión).
- **Cambio de idioma en caliente:** cambiar el idioma mientras el tutorial está abierto no lo cierra ni lo reinicia — confirmado.
- **Recarga a mitad de paso:** recargar en el paso 3/5 no dobla el overlay ni deja un estado roto — reinicia limpio en el paso 1/5 (comportamiento esperado: el progreso dentro de una sesión de tutorial no se persiste, solo el flag final de "visto").
- **"Saltar" vs "Finalizar":** confirmado que "Saltar" (y Escape) **no** marcan el flag de visto — el tutorial reaparecerá la próxima vez. Solo "Finalizar" (llegar al último paso) o "No mostrar más" lo persisten.

### Sobre "Saltar" reaparece: comportamiento especificado, no un bug

Este prompt define explícitamente, en su propia Fase 10, dos criterios de test **distintos**: *"3. 'Saltar' lo cierra correctamente"* y *"4. 'Finalizar' guarda el estado"* — la separación es intencional en la propia especificación: Saltar cierra (sin persistir), Finalizar guarda. El comportamiento real de la aplicación coincide exactamente con esa especificación. No se ha modificado.

## Fase 3 — Onboarding y bienvenida

No existe un asistente de onboarding separado del tutorial guiado y la selección de rol/login (ya auditados en los Prompts 4-5). El perfil incompleto no bloquea ninguna funcionalidad (`perfil.info_demo` informa, no impide). Los avisos de "modo demo" están presentes y son honestos en Reservas, Cancelar, Reprogramar (ver `Simulado en modo demo: ...`). No se ha encontrado ningún flujo que se repita indebidamente o que no pueda completarse/saltarse.

## Fase 4 — Estados vacíos

6 estados vacíos explícitos encontrados en toda la aplicación (`.length === 0`): "Consultar reservas" sin resultados, "Añadir pareja" en Torneos, historial de acciones de Torneos, listado de parejas en el generador de cuadro, y "sin resultados" en Ranking filtrado. Los 6 tienen mensaje claro, sin overflow, con contraste verificado (Ranking: `T.textDim` sobre `Card`, ya validado en Prompts 4-5).

Los módulos "preparados visualmente, pendientes de integración real" (Control QR, Pistas libres y recordatorios, Dashboard KPI, Backups, Comunicaciones, Calendario, Facturación, Automatizaciones) **no tienen un estado vacío tradicional** porque usan un patrón mejor: `IntegrationStatusBanner` — un aviso permanente y honesto ("Preparado visualmente. Pendiente de activación...") en vez de simular datos vacíos o inventados. Contraste verificado: `T.warning` sobre `Card`, **10.18:1** (medido con la fórmula WCAG de `src/utils/contrastCheck.js`, Prompt 4) — muy por encima de AA. Esto ya cumple exactamente lo que pide la Fase 4 del prompt ("no usar datos inventados como si fueran reales; distinguir demo de producción").

## Fase 5 — Avisos especiales

Los avisos de "sin conexión" y "nueva versión disponible" (`PwaStatusBanners`) ya se auditaron y corrigieron en el Prompt 4 (contraste) y Prompt 5 (verificación de que no dependen de texto ni posición). Revisado ahora específicamente el criterio de "cierre persistente/reintento" de este prompt:

- "Sin conexión": tiene "Reintentar" (reintento real, hace un `fetch` de comprobación) — correcto.
- "Nueva versión disponible": tiene "Actualizar ahora" pero **no tiene botón de posponer/descartar** — no es un bug (es una actualización de Service Worker, habitualmente no descartable a propósito, para no dejar al usuario en una versión desactualizada indefinidamente), pero se documenta como decisión de producto a confirmar humanamente, no se ha tocado (fuera del alcance de "corregir solo problemas demostrados").
- Ambos usan `role="status"` + `aria-live="polite"` — adecuado para avisos informativos no críticos que no interrumpen al usuario.

No se ha encontrado ningún otro aviso de "cuota Airtable agotada" o "servicio no configurado" como notificación transitoria — esos casos ya se comunican de forma permanente vía `IntegrationStatusBanner` (Fase 4).

## Fase 6 — Mapa de almacenamiento y correcciones

Ver tabla de la Fase 1. No se ha encontrado ninguna clave duplicada, ambigua, de tipo inconsistente, o que nunca se limpie/guarde de forma incorrecta. `cp04_tutorial_seen_${role}` ya está correctamente namespaced desde su creación — no requiere migración. No se ha borrado ningún dato persistido real.

## Validación por rol (Fase 7)

Tutorial + primera sesión probados end-to-end en los 4 roles (PLAYER completo; STAFF, ADMIN, SUPPORT verificados en su aparición inicial y aislamiento respecto a PLAYER). Estados vacíos de Torneos/Ranking verificados independientes del rol (misma lógica de componente para los 4).

## Validación multiidioma (Fase 8)

El tutorial no está traducido (aria-label y texto en español fijo, mismo hallazgo ya documentado en el Prompt 5) — por construcción, su comportamiento de aparición/cierre/persistencia es idéntico en los 7 idiomas, ya que ninguna condición depende de `cp04_language`. Verificado que cambiar de idioma con el tutorial abierto no lo cierra ni lo reinicia (Fase 2).

## Validación responsive (Fase 9)

390/768/1440 px ya verificados para el tutorial en el Prompt 5 (botón dentro de la vista, sin overflow). `calcTooltipPos()` ya contempla el caso de viewport estrecho (`TIP_W = Math.min(TIP_W_BASE, VW - MARGIN*2)`).

## Correcciones aplicadas (Fase 11)

**Ninguna.** Esta auditoría no encontró ningún problema que cumpliera el listón de "demostrado" tras verificación real — el foco atrapado, el Escape, el aislamiento por rol, la independencia de idioma, el comportamiento tras recarga y los estados vacíos ya estaban correctamente implementados (varios de ellos, como el focus trap, ya construidos con cuidado explícito en un comentario del propio código: *"sin esto, Tab puede escapar del tour hacia elementos ocultos detrás del overlay"*). Se han añadido tests que **documentan y protegen** estos comportamientos ya correctos para que una regresión futura se detecte.

## Tests (Fase 10)

5 tests nuevos en `src/firstVisitOnboarding.test.mjs` (inspección de fuente): namespacing de la clave de tutorial por rol, separación correcta entre `close(false)` (Saltar/Escape) y `close(true)` (Finalizar/No mostrar más), presencia del focus trap + Escape, ausencia de `textContent`/`nth-of-type`/`nth-child` para identificar controles del tutorial, e independencia de idioma en la condición de auto-mostrado.

## Checklist de validación

- [x] 1343/1343 tests (1338 + 5 nuevos).
- [x] Build correcto.
- [x] Lint: mismos problemas preexistentes, 0 nuevos.
- [x] `localhost:5175` → 200.
- [x] Tutorial: aparece en primera visita, no reaparece tras completarlo, aislado por rol, independiente del idioma, coherente tras recarga a mitad — todo verificado con Chromium.
- [x] Estados vacíos: 6 encontrados, todos con mensaje claro y contraste correcto.
- [x] Avisos "preparado visualmente": contraste 10.18:1 verificado.
- [x] Sin cambios de lógica de negocio ajena, RBAC, rutas ni `/root/cp04-landings`.
- [x] Sin merge.

## Checklist visual humano

- [ ] Completar el tutorial de un rol y confirmar que no vuelve a aparecer al recargar.
- [ ] Pulsar "Saltar" y confirmar que el tutorial reaparece en la siguiente sesión (comportamiento esperado, no un fallo) — y que "No mostrar más" sí lo desactiva de forma permanente.
- [ ] Navegar el tutorial completo solo con teclado (Tab, Shift+Tab, Escape) en un lector de pantalla.
- [ ] Confirmar en tablet que el tooltip del tutorial nunca queda cortado ni fuera de la pantalla al pasar de un paso a otro.

## Riesgos residuales

1. El tutorial no restaura el foco al elemento que tenía el foco antes de abrirse (p. ej. el botón "Ver tutorial rápido" del Perfil) — un usuario de teclado que lo cierra puede perder su posición de navegación. No corregido: es una mejora real pero no un "bug demostrado" con impacto confirmado en este flujo (el foco cae de forma razonable al primer elemento del sidebar tras el cierre), y añadir gestión de foco previo sin pruebas de regresión específicas se consideró fuera del listón de esta auditoría.
2. El aviso de "nueva versión disponible" no se puede posponer/descartar sin actualizar — documentado como decisión de producto pendiente de confirmación humana, no corregido.
3. El tutorial sigue sin traducir (mismo hallazgo del Prompt 5) — vacío de contenido, no de arquitectura.
