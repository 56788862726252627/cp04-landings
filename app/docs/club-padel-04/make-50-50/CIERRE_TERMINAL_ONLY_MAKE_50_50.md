# Cierre terminal-only Make 50/50 — Club Pádel 04

**Estado: DOCUMENTO DE CIERRE DE FASE, no de cierre de proyecto.** Consolida todo lo que se puede hacer desde terminal-only sobre el bloque Make 50/50 sin abrir Make real, sin tocar Airtable/WhatsApp/Stripe, sin activar ningún escenario. No autoriza ninguna acción sobre Make ni cambia el estado de ningún PR.

**Fecha:** 2026-07-18
**Fuente de datos:** `src/data/makeInventory.js` (50 escenarios únicos, verificado por `id`), `src/utils/makeCentroTecnicoLogic.js`, `src/components/CentroTecnico.jsx`, `src/utils/rbac.js`, y sus 3 suites de test (87/87 en verde en el momento de escribir este documento).
**Documento hermano:** `LOTE_REACTIVACION_SEGURA_CATEGORIA_B.md` (mismo directorio) — detalla los 6 escenarios de menor riesgo, con checklist de activación/verificación/rollback propio.

---

## Estado general 50/50

El inventario está **completo**: 50 escenarios de Make identificados, cada uno con un `id` único (sin duplicados, verificado) y un `estadoVerificacion` asignado. No hay ningún flujo pendiente de inventariar — el trabajo de auditoría documental (Pasos 01 a 06E, 13 commits en PR #36) ya cubrió el 100% del catálogo conocido.

Lo que **no** está completo es la verificación con evidencia real de que cada uno de los 50 funciona de extremo a extremo — eso es un proceso distinto, mucho más lento, y depende en su mayoría de factores fuera del alcance de este entorno terminal-only (cuota de Airtable, acciones manuales dentro de Make).

## Contadores actuales (reverificados en esta sesión, directamente sobre el código)

| Estado | Cantidad | % del total |
|---|---|---|
| **Confirmado** (evidencia real de funcionamiento) | 7 | 14% |
| **Inferido** | 0 | 0% |
| **Listo sin bloqueo** (sin dependencia conocida de Airtable bloqueado, sin verificar todavía) | 16 | 32% |
| **Bloqueado externo** (Airtable 429, cuota agotada) | 18 | 36% |
| **Pendiente config/decisión Make** (requiere acción manual en Make, no en código) | 9 | 18% |
| **Total** | **50** | **100%** |
| **Faltan hasta 50** | **0** | — |

## Qué flujos están confirmados (7)

Verificados con evidencia real (lectura MCP directa en Make y/o pruebas controladas con datos sintéticos, ver Pasos 02-05D):

1. 📡 API Reservas
2. 🎾 Alta de Jugador
3. 🏟️ Cierre Temporal de Pistas
4. 🔑 Generación QR Acceso
5. 💬 Chatbot Web Reservas
6. 🔑 Email Recuperación de Contraseña SaaS
7. 🗂️ Backup Plantilla Drive

Nota: dos de estos (Chatbot Web Reservas, Email Recuperación de Contraseña SaaS) están confirmados como correctamente **inactivos por decisión de seguridad del propietario** — "confirmado" significa que su estado real coincide con lo esperado, no necesariamente que estén ejecutándose activamente hoy.

## Qué flujos están listos sin bloqueo (16)

No dependen del bloqueo de cuota de Airtable conocido, pero **no tienen evidencia real de ejecución exitosa todavía**. Subclasificados en el Paso 04A por nivel de riesgo/complejidad de verificación:

- **Categoría A — listos para prueba controlada** (2): Cruces de Torneo, Resultados y Clasificación. Bajo volumen, alcance técnico, sin comunicación masiva — pero probarlos requiere invocar Make/el Worker real, fuera de alcance terminal-only.
- **Categoría B — bajo riesgo, requieren solo decisión humana de reactivar** (6): ver `LOTE_REACTIVACION_SEGURA_CATEGORIA_B.md` — documento ya preparado con checklist completo.
- **Categoría C — requieren datos de prueba** (4): Emparejamiento Sin Pareja, Confirmación Inscripción Torneo, Monitor Prueba Gratuita, Baja de Jugador + Promoción. Sin datos sintéticos, contactarían a personas reales.
- **Categoría D — requiere revisar causa de error antes** (1): Control Acceso QR. 44% de tasa de error histórica con causa identificada (Paso 04B) pero no reconfirmada tras el posible fix.
- **Categoría E — no seguro para ejecutar todavía** (3): Facturación y Cobro, Bot IA Reservas WhatsApp, Bot IA Reservas Telegram. Dinero real o mensajería no controlada, sin propietario funcional claro.

## Qué flujos están bloqueados por Airtable (18)

Bloqueados por el mismo problema documentado en todo el proyecto desde hace meses: `PUBLIC_API_BILLING_LIMIT_EXCEEDED` (cuota mensual de Airtable agotada), reproducido en vivo en sesiones anteriores (Paso 05D). Ninguno de estos 18 puede avanzar desde terminal — dependen de que la cuota se restablezca o se haga upgrade de plan, una decisión externa a este repositorio. El código ya mitiga el impacto mientras tanto: caché de disponibilidad (Paso 06B), modo degradado HTTP 503 (Paso 06C), idempotencia (Paso 06D) y logging coherente (Paso 06E) — todo ya en PR #36.

## Qué flujos requieren decisión/config en Make (9)

Requieren una acción manual dentro de Make (no de código) antes de poder verificarse:

1. ⚠️ Alerta Crítica Fallos Make — pendiente de rotar una credencial de acceso a la API de Make (identificado en Paso 02, no está roto, está pausado).
2. 🗺️ Mapa de Flujos
3. 📋 Gestión Lista de Espera
4. ⭐ Encuesta Post-Partido
5. 🎧 Atención Socio WhatsApp FAQ
6. 🎯 Campaña Flash WhatsApp
7. ⚖️ Solicitud GDPR Acceso u Olvido de Datos
8. 🔔 Notificación Push PWA
9. 📝 Tally → API Reservas

Ninguno de estos 9 tiene un checklist de reactivación preparado todavía (a diferencia de los 6 de Categoría B) — quedan fuera del alcance de este cierre.

## Qué puede hacer el usuario manualmente (fuera de este entorno)

- Seguir el checklist ya preparado en `LOTE_REACTIVACION_SEGURA_CATEGORIA_B.md` para los 6 escenarios de bajo riesgo — activarlos en Make, verificarlos, y recoger evidencia.
- Revisar directamente en Make el estado real de los 9 `pendiente_make_real` (algunos, como Alerta Crítica Fallos Make, solo necesitan una rotación de credencial).
- Verificar si la cuota de Airtable ya se restableció — si es así, los 18 `bloqueado_externo` podrían empezar a reclasificarse, uno a uno, con evidencia real.
- Para las categorías A, C, D y E de los "listos sin bloqueo", decidir caso a caso si se autoriza una prueba controlada con datos sintéticos (mismo patrón ya usado y explícitamente autorizado en los Pasos 05C/05D) — cada una requeriría su propia autorización explícita, no un lote genérico.

## Qué NO puede hacerse desde terminal (límites de este cierre)

- No se puede confirmar ningún escenario nuevo sin evidencia real — este documento no sube ningún contador.
- No se puede resolver el bloqueo de Airtable (depende de facturación/cuota externa).
- No se puede activar ni desactivar ningún escenario en Make desde aquí.
- No se puede verificar la Categoría A (Cruces de Torneo, Resultados y Clasificación) sin invocar Make/Worker real — requeriría autorización explícita como las pruebas anteriores.
- No se puede generar evidencia sintética para la Categoría C sin decidir antes cómo evitar contactar a personas reales.
- No se puede resolver ninguno de los 9 `pendiente_make_real` sin entrar a Make.

## Checklist de activación manual (aplica a Categoría B, ver documento hermano para el detalle completo)

- [ ] Confirmar en Make el estado real actual de `isActive` (puede haber cambiado desde la última lectura MCP).
- [ ] Confirmar que la cuota de Airtable sigue bloqueada o ya se restableció.
- [ ] Activar el escenario en Make.
- [ ] Verificar la siguiente ejecución (programada o manual).

(Checklist completo, por escenario, en `LOTE_REACTIVACION_SEGURA_CATEGORIA_B.md`.)

## Checklist de verificación posterior

- [ ] La ejecución terminó sin error de Airtable, credencial o mapeo de campos.
- [ ] El resultado (informe, acción) llegó a quien correspondía, sin contacto a ningún socio/jugador real no previsto.
- [ ] El volumen de operaciones consumidas es coherente con el histórico conocido.
- [ ] Se guardó evidencia (captura, export del historial de Make) fuera de este repositorio.

## Cómo actualizar `estadoVerificacion` cuando haya evidencia real

Este documento **no modifica `makeInventory.js`**. El procedimiento, una vez exista evidencia real de una ejecución exitosa:

1. Editar la línea del escenario correspondiente en `src/data/makeInventory.js`, cambiando `estadoVerificacion: "listo_sin_bloqueo"` (o el que aplique) a `estadoVerificacion: "confirmado"`.
2. Añadir a la `nota` del escenario la evidencia concreta (fecha, resultado, quién lo verificó) — mismo patrón ya usado en los 7 confirmados actuales.
3. Ejecutar `node --test src/data/makeInventory.test.mjs src/utils/makeCentroTecnicoLogic.test.mjs` para confirmar que ningún test que dependa de los contadores actuales se rompe (algunos tests, como el de `computeVerificacionResumen`, verifican los números exactos 7/0/16/18/9 — subir un contador requiere actualizar también esos tests, no solo el inventario).
4. Hacer commit local documental/de código, verificar `git diff --check`, y subir siguiendo el mismo patrón ya usado en esta sesión — nunca marcar "confirmado" sin haber completado este procedimiento con evidencia real en mano.

## Riesgos y límites de este cierre

- **Este es un cierre de fase de auditoría/documentación, no un cierre de proyecto.** 43 de 50 escenarios (86%) siguen sin evidencia real de funcionamiento — el trabajo de verificación real es, en su mayoría, tarea del propietario del proyecto fuera de este entorno.
- **El 36% del catálogo (18 escenarios) depende de un factor 100% externo** (cuota de Airtable) que ningún cambio de código o documentación puede resolver.
- **La información de `isActive` de varios escenarios (incluidos los 6 de Categoría B) puede haber envejecido** desde la última lectura MCP (2026-07-17) — cualquier checklist de activación debe reverificar el estado real en Make antes de actuar, no confiar ciegamente en este documento.
- **Ningún test verifica el comportamiento real contra Make** — los 87 tests relacionados (rbac + makeInventory + makeCentroTecnicoLogic) verifican lógica pura sobre datos ya conocidos, no hacen ninguna llamada de red. Son necesarios pero no suficientes para garantizar que el panel funcione igual en producción real.
- **SUPPORT ve el panel 50/50; PLAYER/STAFF/ADMIN no** — verificado por 4 tests dedicados en `rbac.test.mjs` más el guard de render en `CentroTecnico.jsx` (doble barrera). Esta parte del bloque sí está sólidamente cerrada, a diferencia de la verificación de los 50 escenarios en sí.

---

## Resumen para decisión rápida

| Pregunta | Respuesta |
|---|---|
| ¿El inventario está completo? | Sí, 50/50 |
| ¿Está todo verificado? | No, solo 7/50 (14%) |
| ¿Hay trabajo de código pendiente? | No — el bloque está documentado y probado hasta donde el terminal permite |
| ¿Qué falta para subir el porcentaje? | Acción humana fuera de terminal: activar en Make (Categoría B ya preparada), esperar cuota de Airtable, o autorizar pruebas controladas caso a caso |
| ¿SUPPORT-only funciona? | Sí, verificado por tests |
| ¿Se tocó Make/Airtable/WhatsApp/Stripe en este cierre? | No |
