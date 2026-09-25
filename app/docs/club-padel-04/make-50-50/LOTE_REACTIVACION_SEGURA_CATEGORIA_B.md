# Lote de reactivación segura Make 50/50 — Categoría B

**Estado: DOCUMENTO OPERATIVO / CHECKLIST MANUAL. No autoriza ni ejecuta ninguna activación por sí mismo. Preparado terminal-only, sin abrir Make, sin tocar Airtable/WhatsApp/Stripe, sin activar ningún escenario.**

**Fecha de preparación:** 2026-07-18
**Fuente de datos:** `src/data/makeInventory.js` (snapshot local + notas de auditoría de los Pasos 02-04B, MCP solo lectura), reconfirmado por lectura directa del código en esta sesión — no se ha vuelto a consultar Make en vivo para este documento.

---

## Objetivo del lote

De los 50 escenarios del inventario Make 50/50, 16 están clasificados `listo_sin_bloqueo` (no dependen del bloqueo de cuota de Airtable que afecta a los otros 18). Dentro de esos 16, el Paso 04A (sesión previa) subclasificó 6 como **Categoría B: bajo riesgo, requieren solo una decisión humana de reactivarlos en Make** (a diferencia de la Categoría C, que requeriría datos de prueba porque contactaría a personas reales).

Este documento prepara esa decisión: no la toma. El objetivo es que el propietario del proyecto pueda reactivar estos 6 escenarios **directamente en Make, manualmente**, con contexto completo, evidencia previa y un checklist de verificación — sin que este entorno terminal-only ejecute ninguna acción sobre Make.

## ⚠️ Corrección importante respecto al contexto original de esta tarea

Dos matices que la clasificación B ya documentaba pero que conviene remarcar antes de decidir nada:

1. **Los 6 escenarios SÍ tienen `usaAirtable: true` en el inventario.** No es correcto decir que no dependen de Airtable en absoluto — si dependieran de una lectura/búsqueda que hoy choca con el bloqueo de cuota (`PUBLIC_API_BILLING_LIMIT_EXCEEDED`), podrían fallar igual que los 18 `bloqueado_externo` al reactivarse. Están clasificados `listo_sin_bloqueo` y no `bloqueado_externo` porque su evidencia histórica (ejecuciones recientes con 0-2 errores) no muestra el patrón de fallo de Airtable — pero eso no es una garantía para el futuro, solo la mejor evidencia disponible hoy.
2. **El campo `activo: true` de cada objeto en `makeInventory.js` es un snapshot antiguo (2026-07-06).** Las notas del Paso 04A (lectura MCP más reciente, 2026-07-17) indican que los 6 están actualmente **`isActive: false`** en Make real — es decir, ya están apagados. Por eso el verbo correcto es "reactivar": no es una activación por primera vez, es volver a encenderlos tras haber estado desactivados.

## Los 6 escenarios de Categoría B

1. 🔄 Backup Semanal
2. 📋 Dashboard Ejecutivo Diario
3. 📊 Panel KPI Semanal
4. 📈 Predicción Ocupación
5. 📊 Análisis NPS Semanal
6. 🏆 Reto 04 + Puntos

## Por qué son de bajo riesgo

Los cinco primeros son informes internos programados (backup, dashboards, predicción, KPIs), sin envío de comunicación a socios reales — su salida es para uso interno de dirección/staff, no un mensaje que llegue a un cliente. El sexto (Reto 04 + Puntos) otorga puntos internos de gamificación, sin comunicación externa tampoco. Ninguno de los 6 pertenece a las categorías C (requieren datos de prueba porque contactarían a personas reales) o E (mensajería/dinero real no controlado) del mismo Paso 04A.

## Qué NO deben hacer

- No deben enviar ningún email, WhatsApp o notificación a un socio/jugador real como parte de su ejecución normal.
- No deben escribir ni modificar datos de facturación, pagos o Stripe.
- No deben ser la vía por la que se reactive, sin querer, algún otro escenario relacionado (verificar que Make no tenga dependencias encadenadas no documentadas antes de activar).
- No deben activarse todos a la vez sin verificación individual — cada uno se activa y verifica por separado (ver checklist).

## Qué revisar antes de activarlos en Make (una sola vez, antes del lote completo)

- [ ] Confirmar en Make (lectura, sin activar) que efectivamente los 6 siguen `isActive: false` hoy — el dato de este documento es del 2026-07-17 y puede haber cambiado.
- [ ] Confirmar que la cuota de Airtable (`PUBLIC_API_BILLING_LIMIT_EXCEEDED`) sigue bloqueada o ya se restableció — si ya se restableció, el riesgo de esta sección "⚠️ Corrección importante" punto 1 desaparece y el lote es más seguro todavía.
- [ ] Revisar en Make si alguno de los 6 tiene un router/filtro que, bajo ciertas condiciones, sí contacte a un socio real (no confiar solo en la nota del inventario local — verificar el escenario real).
- [ ] Confirmar quién es el destinatario real de cada informe interno (Dashboard Ejecutivo, Panel KPI, Predicción, NPS) — si el email de destino sigue siendo válido o ha cambiado desde la última ejecución conocida.
- [ ] Para **Análisis NPS Semanal** específicamente: la nota de Paso 04A señala que "resume respuestas reales de socios vía IA antes de enviarlas a dirección; confirmar si necesita anonimizarse primero" — **este punto no está resuelto y debe decidirse antes de reactivar este escenario en particular**, no es solo un informe interno neutro como los otros cuatro.

## Checklist de activación manual (repetir por cada escenario, uno a uno)

- [ ] 1. Abrir el escenario en Make (fuera de este entorno).
- [ ] 2. Revisar el histórico de ejecuciones/errores más reciente (no solo el de este documento).
- [ ] 3. Confirmar que el destinatario configurado (si aplica) es correcto y sigue siendo válido.
- [ ] 4. Activar (`isActive: true`) el escenario.
- [ ] 5. Esperar a la siguiente ejecución programada (o disparar una ejecución manual de prueba en Make, si la plataforma lo permite sin afectar datos reales).
- [ ] 6. No pasar al siguiente escenario del lote hasta verificar el resultado del anterior (ver checklist de verificación).

## Checklist de verificación después de activar (por cada escenario)

- [ ] La ejecución terminó con éxito (sin error 429 de Airtable, sin error de credencial, sin error de mapeo de campos).
- [ ] El informe/resultado llegó al destinatario interno correcto (o se generó correctamente si no hay destinatario externo).
- [ ] No se generó ningún efecto secundario hacia un socio/jugador real (revisar logs de Make del escenario).
- [ ] El número de operaciones consumidas es coherente con ejecuciones anteriores conocidas (una desviación grande podría indicar que algo se ejecutó distinto a lo esperado).
- [ ] Para Análisis NPS Semanal: confirmar además que los datos de socios tratados por la IA se manejan conforme a lo decidido en el punto de anonimización de la sección anterior.

## Plan de rollback manual

Si algo falla tras reactivar cualquiera de los 6:

1. **Desactivar el escenario inmediatamente en Make** (`isActive: false`) — es la acción más simple y siempre disponible, revierte al estado exacto de partida.
2. Si el fallo generó un efecto no deseado (p. ej. un email a un destinatario incorrecto), documentarlo y decidir si requiere una comunicación de corrección — esto es una decisión operativa humana, no algo que este documento resuelva.
3. Si el fallo fue por Airtable (429), no reintentar automáticamente — es el mismo bloqueo externo ya documentado en todo el proyecto; esperar a que se resuelva antes de reactivar de nuevo.
4. No se requiere ningún cambio de código ni de `estadoVerificacion` en el rollback — el campo solo se actualiza tras una verificación positiva (ver siguiente sección), nunca automáticamente.

## Evidencias que debe recoger el usuario

Por cada escenario reactivado y verificado con éxito, guardar (fuera de este repositorio, o en una nota aparte — no pegar datos reales de socios en `makeInventory.js`):

- Captura o export del historial de ejecución exitosa en Make (fecha, duración, operaciones consumidas).
- Confirmación de que el destinatario interno recibió el informe (si aplica).
- Cualquier error visto y cómo se resolvió, si lo hubo.

## Cómo actualizar `estadoVerificacion` después de comprobarlos

Este documento **no modifica `makeInventory.js`**. Una vez el usuario tenga evidencia real de una ejecución exitosa en Make para un escenario concreto, el cambio de `estadoVerificacion: "listo_sin_bloqueo"` a `estadoVerificacion: "confirmado"` para ese escenario es una tarea de código aparte (edición de una línea en `src/data/makeInventory.js` + actualización de la nota con la evidencia + tests si aplica), a realizar en una sesión terminal-only distinta, con la evidencia ya en mano. No se debe subir a "confirmado" solo porque se activó — el criterio (ver tabla más abajo) exige ver al menos una ejecución real sin errores tras la reactivación.

## Riesgos residuales

- **Dependencia de Airtable no descartada** (ver "Corrección importante" arriba) — los 6 escenarios usan Airtable según el inventario; el bloqueo de cuota podría afectarlos igual que a los 18 ya bloqueados, simplemente no hay evidencia de que lo haga todavía.
- **Destinatarios desactualizados**: si algún email de destino interno cambió desde la última ejecución conocida (hace semanas), el informe podría no llegar a quien corresponde — no es un riesgo de seguridad, pero sí operativo.
- **Análisis NPS Semanal trata datos reales de socios** (respuestas de encuesta) aunque su destino final sea interno — el punto de anonimización sigue sin resolver y es el escenario de mayor riesgo relativo de los 6.
- **Dependencias encadenadas no documentadas**: este documento no puede garantizar que ningún otro escenario de Make dependa de la salida de estos 6 (p. ej. otro escenario que lea el resultado del backup) — solo una revisión directa en Make puede confirmarlo.
- **El dato de `isActive` de este documento es del 2026-07-17**: puede haber cambiado desde entonces; el primer paso del checklist de activación ya cubre esto, pero se remarca aquí como riesgo de fondo del documento en sí (información que envejece).

---

## Tabla por escenario

| Escenario | Prioridad propuesta | Dependencia externa | Riesgo | Prueba previa | Prueba posterior | Criterio para "confirmado" |
|---|---|---|---|---|---|---|
| 📊 Panel KPI Semanal | 1 (más bajo riesgo) | Airtable (usaAirtable: true, sin errores en 70 ejecuciones conocidas) | Bajo — informe interno, 0 errores históricos | Confirmar destinatario interno vigente | Verificar ejecución sin error + informe recibido | 1 ejecución real post-reactivación sin error de Airtable ni de credencial, informe verificado por el destinatario |
| 📈 Predicción Ocupación | 2 | Airtable (usaAirtable: true, sin errores en 72 ejecuciones conocidas) | Bajo — informe interno con IA, sin contacto a socios | Confirmar destinatario interno vigente | Verificar ejecución sin error + informe recibido | 1 ejecución real post-reactivación sin error, informe verificado |
| 🏆 Reto 04 + Puntos | 3 | Airtable (usaAirtable: true, solo 1 ejecución histórica conocida) | Bajo pero con poca evidencia histórica (1 sola ejecución) | Confirmar el evento disparador (webhook) y qué acción de la app lo activa | Verificar que el evento disparador funciona y otorga puntos correctamente, sin duplicar | 1 ejecución real post-reactivación sin error, puntos otorgados verificados como correctos (no duplicados) |
| 📋 Dashboard Ejecutivo Diario | 4 | Airtable (usaAirtable: true, 1 error de 148 ejecuciones = 0.7%) | Bajo-medio — informe interno, error histórico puntual sin causa confirmada en este documento | Confirmar destinatario interno vigente; revisar en Make la causa del error histórico si es visible | Verificar ejecución sin error + informe recibido | 1 ejecución real post-reactivación sin error, informe verificado |
| 🔄 Backup Semanal | 5 | Airtable (usaAirtable: true, 2 errores de 148 ejecuciones = 1.4%) | Medio — función interna pero crítica (backup a Drive); tasa de error histórica algo mayor | Confirmar destino del backup (Drive) sigue accesible; revisar causa de los 2 errores históricos en Make | Verificar ejecución sin error + backup real generado y accesible en Drive | 1 ejecución real post-reactivación sin error, backup verificado como accesible |
| 📊 Análisis NPS Semanal | 6 (última, requiere decisión adicional) | Airtable (usaAirtable: true, sin errores en 79 ejecuciones conocidas) | Medio — trata datos reales de socios (respuestas NPS) vía IA antes de enviarlos a dirección; anonimización sin confirmar | **Resolver primero la pregunta de anonimización** (ver "Qué revisar antes de activarlos") antes de cualquier prueba | Verificar ejecución sin error + confirmar que el tratamiento de datos de socios cumple lo decidido sobre anonimización | 1 ejecución real post-reactivación sin error, Y confirmación explícita de que el tratamiento de datos de socios fue resuelto (no solo la ejecución técnica) |

**Nota sobre "Prioridad propuesta":** es una propuesta de este documento basada en tasa de error histórica y sensibilidad de los datos tratados (menor riesgo primero), no una prioridad oficial de negocio. El propietario del proyecto puede reordenarla libremente.

---

## Recordatorio final

Ningún contenido de este documento, aunque se complete el checklist, autoriza por sí mismo ningún cambio en `makeInventory.js`, ningún merge, ningún cambio de estado de PR #24/#26/#27/#36, ni ninguna acción sobre Airtable, WhatsApp Business o Stripe. Es exclusivamente una guía operativa para que el propietario del proyecto reactive estos 6 escenarios en Make por su propia cuenta, con contexto completo.
