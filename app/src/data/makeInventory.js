// Club Pádel 04 · Inventario real de escenarios Make (snapshot).
//
// IMPORTANTE — por qué esto es un snapshot y no una llamada en vivo:
// el frontend NUNCA debe llamar a la API de Make con una clave privada
// (ya lo advertía el propio código anterior de FlujosMake). La consulta en
// vivo que alimenta este archivo se hizo vía MCP de Make (solo lectura,
// fuera del navegador) durante la auditoría de Club Pádel 04. Los datos
// operacionales (activo, scheduling, ejecuciones, operaciones, errores,
// última modificación) son exactamente los devueltos por Make en esa
// consulta — no están inventados ni extrapolados de los blueprints locales.
//
// Para refrescar este snapshot: repetir la consulta de solo lectura vía
// MCP (organizations_list → teams_list → scenarios_list) y regenerar este
// archivo. No existe todavía una vía de refresco en vivo desde la app: eso
// requeriría un endpoint propio en el Worker que guarde el token de Make
// como secret de servidor (nunca en el frontend) — fuera del alcance de
// esta fase.

export const MAKE_INVENTORY_META = Object.freeze({
  capturedAt: "2026-07-06T14:32:00.000Z",
  source: "confirmado_make_mcp",
  organization: "Edu.Rodríguez.IA",
  team: "My Team",
  totalReal: 50,
});

// `estadoVerificacion` (por escenario, más abajo) — PASO 01 del roadmap Make
// 50/50 (2026-07-17). Es una clasificación de AUDITORÍA MANUAL, no un dato
// que Make devuelva: no requiere ni implica ninguna llamada a Make real.
// Nunca se debe leer como "el escenario funciona" — solo dice en qué punto
// de verificación está, honestamente:
//
//   confirmado           → conectado por código real y/o verificado con
//                           evidencia real (ejecución PASS_VERIFIED o
//                           decisión ya tomada y documentada).
//   inferido              → evidencia contradictoria entre fuentes/fechas
//                           (p. ej. un export local dice una cosa y una
//                           verificación en vivo posterior dice otra);
//                           requiere que una persona lo revise en Make.
//   listo_sin_bloqueo      → sin dependencia externa bloqueada hoy; listo
//                           para una prueba controlada, pero AÚN NO
//                           ejecutada — no es lo mismo que "confirmado".
//   bloqueado_externo      → depende de Airtable (cuota/rate-limit) o de un
//                           canal externo (WhatsApp/Stripe) que hoy no está
//                           disponible para verificar.
//   pendiente_make_real    → necesita una acción dentro de Make en sí
//                           (rotar un token, decidir un propietario, arreglar
//                           una config) antes de poder verificarse, al
//                           margen de Airtable/WhatsApp/Stripe.
//
// Fuente de esta clasificación: cruce de este snapshot (2026-07-06) con la
// auditoría de solo lectura del 2026-07-10 (rama hermana, no incluida en
// esta rama). Ver app/audit/ de esa auditoría para el detalle completo por
// escenario. NUNCA usar "confirmado" como valor por defecto si falta
// información — el valor seguro por defecto es "pendiente_make_real".
export const MAKE_VERIFICATION_STATES = Object.freeze({
  CONFIRMADO: "confirmado",
  INFERIDO: "inferido",
  LISTO_SIN_BLOQUEO: "listo_sin_bloqueo",
  BLOQUEADO_EXTERNO: "bloqueado_externo",
  PENDIENTE_MAKE_REAL: "pendiente_make_real",
});

export const MAKE_VERIFICATION_META = Object.freeze({
  clasificadoEn: "2026-07-17",
  metodo: "auditoria_manual_cruzada",
  requiereConexionMake: false,
});

// PASO 02 (2026-07-17): reconciliación de los 4 escenarios que quedaron
// "inferido" en el Paso 01. Consulta de SOLO LECTURA vía MCP de Make
// (scenarios_list, teamId 1099976) — ningún escenario fue activado,
// desactivado, editado ni ejecutado. Resultado: 2 se resuelven con evidencia
// real (Cierre Temporal de Pistas → confirmado; Alerta Crítica Fallos Make →
// pendiente_make_real, ya no contradictorio) y 2 siguen inferido a
// propósito porque la contradicción es una decisión humana pendiente, no
// algo que una lectura pueda cerrar (Email Recuperación de Contraseña SaaS,
// Chatbot Web Reservas). Ver la `nota` de cada escenario para el detalle.
export const MAKE_VERIFICATION_STEP2_META = Object.freeze({
  reconciliadoEn: "2026-07-17",
  metodo: "mcp_make_solo_lectura",
  escenariosRevisados: [6299114, 6323445, 5799061, 5791133],
  cambiosDeEstado: 2,
  siguenInferidos: 2,
});

// PASO 03B (2026-07-17): cierre de los 2 escenarios que seguían "inferido"
// tras el Paso 02 (Email Recuperación de Contraseña SaaS, Chatbot Web
// Reservas). El Paso 03 propuso desactivarlos por decisión de
// seguridad/producto; el usuario confirma que la desactivación se hizo
// manualmente en Make. Este paso NO desactivó nada por sí mismo — solo
// verificó el resultado con una consulta de SOLO LECTURA vía MCP
// (scenarios_list) que confirma isActive=false en ambos, y actualizó el
// inventario local para reflejarlo. `estadoVerificacion: "confirmado"` aquí
// significa "decisión de cierre tomada y verificada", nunca "flujo
// operativo válido" — ambos quedan inactivos a propósito.
export const MAKE_VERIFICATION_STEP3B_META = Object.freeze({
  cerradoEn: "2026-07-17",
  metodo: "confirmacion_usuario_mas_verificacion_mcp_solo_lectura",
  escenariosDesactivados: [6323445, 5799061],
  inferidosRestantes: 0,
});

// PASO 04A (2026-07-17): clasificación de los 16 escenarios "listo_sin_bloqueo"
// en 5 grupos (A-E), SOLO LECTURA vía MCP (scenarios_list) — ningún
// escenario fue ejecutado, activado ni desactivado en esta pasada.
// `estadoVerificacion` NO cambia para estos 16 (sigue "listo_sin_bloqueo"
// en los 50): esto es una clasificación de PRIORIDAD/RIESGO para cuando se
// autorice probar, no una reclasificación de verificación. Hallazgo
// importante de esta pasada: 9 de los 16 aparecían "activo" en el snapshot
// del 2026-07-06 y hoy están `isActive=false` en Make — un cambio externo
// ajeno a este repositorio (probablemente relacionado con la gestión de la
// cuota de Airtable), documentado en la `nota` de cada escenario afectado
// sin sobrescribir los campos originales del snapshot (que siguen fechados
// 2026-07-06, tal como indica MAKE_INVENTORY_META.capturedAt).
export const MAKE_VERIFICATION_STEP4A_META = Object.freeze({
  clasificadoEn: "2026-07-17",
  metodo: "mcp_make_solo_lectura",
  totalRevisados: 16,
  grupoA_listosParaPrueba: [4919937, 5330078],
  grupoB_requierenDecisionHumana: [6217724, 5736800, 5736468, 5799041, 5811901, 5791374],
  grupoC_requierenDatosDePrueba: [5791128, 5791116, 5750308, 5288809],
  grupoD_requierenConfiguracionPrevia: [5291559],
  grupoE_noSegurosTodavia: [5733370, 5798996, 4832095],
});

// PASO 04B (2026-07-17): investigación de la causa de error del único
// escenario del Grupo D (Control Acceso QR, 5291559). SOLO LECTURA vía MCP
// (executions_list) — no se ejecutó, activó ni desactivó el escenario, no
// se corrigió nada en Make ni en Airtable. Los 4 errores históricos son la
// misma causa: el módulo que crea el registro en Airtable devuelve 422
// "Insufficient permissions to create new select option" al escribir un
// valor que no existe todavía como opción predefinida en un campo de
// selección única — un problema de mapeo/configuración de campo, no de
// credencial. Las 5 ejecuciones posteriores a los 4 errores (2026-06-19
// 23:58 en adelante) terminaron sin error, indicio de que ya se corrigió;
// pendiente de confirmar con ejecuciones reales más recientes. Detalle
// completo en la `nota` del escenario 5291559.
export const MAKE_VERIFICATION_STEP4B_META = Object.freeze({
  investigadoEn: "2026-07-17",
  metodo: "mcp_make_solo_lectura_executions_list",
  escenarioId: 5291559,
  clasificacionError: "mapeo_de_datos",
  moduloAfectado: "ActionCreateRecord (airtable)",
  pareceYaCorregido: true,
});

// PASO 05A (2026-07-17): verificación de unicidad de los 50 escenarios +
// evaluación de activación segura. SOLO LECTURA vía MCP (scenarios_list) —
// no se activó, desactivó, ejecutó ni modificó ningún escenario en esta
// pasada.
//
// Unicidad (cruce completo, no una muestra): los 50 IDs y los 50 nombres de
// `MAKE_INVENTORY` coinciden exactamente, uno a uno, con los 50 escenarios
// reales devueltos por `scenarios_list` hoy — 0 IDs duplicados, 0 nombres
// duplicados, 0 escenarios locales sin contrapartida en Make, 0 escenarios
// en Make sin contrapartida local. Las coincidencias de nombre parecidas
// detectadas (p. ej. "Recordatorio 24h Antes" / "Recordatorio 2h Antes") son
// pares de flujos distintos por diseño (recordatorios en dos ventanas de
// tiempo), no duplicados funcionales. Conclusión: 50 flujos diferentes
// confirmados — no hace falta ningún blueprint para esta pregunta, porque
// el acceso de solo lectura a Make ya es la fuente de verdad definitiva.
//
// Activación segura evaluada contra las 7 condiciones exigidas por la misión
// (sin comunicación real, sin cobro, sin modificar datos reales sensibles,
// sin depender de WhatsApp/Stripe/Telegram, sin errores graves recientes,
// propósito interno/bajo impacto, sin ejecución inmediata peligrosa):
// NINGÚN escenario inactivo hoy cumple las 7 a la vez — prácticamente todos
// dependen de Gmail/WhatsApp/Stripe (comunicación o cobro real) o escriben
// en Airtable sobre datos reales de reservas/socios. Por eso
// `flujosActivadosAutonomamente` queda vacío a propósito: activar cualquiera
// de ellos exigiría antes una decisión humana explícita, no una lectura.
//
// Hallazgo transversal urgente (no pedido explícitamente, pero crítico):
// 25 de los 50 escenarios muestran hoy `isActive=false` en Make pese a
// figurar `activo: true` en el snapshot local del 2026-07-06 — un cambio
// externo ajeno a este repositorio. El más grave con diferencia es
// 📡 API Reservas (5697630): es el ÚNICO escenario con código real conectado
// a la app (`POST /api/reservas`) y hoy está pausado en Make. Mientras siga
// así, una reserva real que el Worker reenvíe a su webhook NO generará
// confirmación por email, evento de Calendar ni registro en Airtable,
// aunque el Worker no vea ningún error. No se ha tocado nada para
// investigar o corregir esto — queda como el siguiente paso más urgente.
export const MAKE_VERIFICATION_STEP5A_META = Object.freeze({
  verificadoEn: "2026-07-17",
  metodo: "mcp_make_solo_lectura_scenarios_list",
  totalMakeReal: 50,
  totalInventarioLocal: 50,
  duplicadosDetectados: 0,
  huerfanosLocalSinMake: 0,
  huerfanosMakeSinLocal: 0,
  conclusionUnicidad: "50_flujos_diferentes_confirmados",
  blueprintsNecesariosParaUnicidad: 0,
  escenariosConDriftDeActivo: 25,
  escenarioCriticoConDrift: 5697630,
  flujosActivadosAutonomamente: [],
  flujosQueCumplenLas7Condiciones: 0,
});

// categoria: clasificación arquitectónica. Es un campo DERIVADO por análisis
// (no un campo que la API de Make devuelva tal cual), documentado aquí
// mismo por escenario. Ver worker-reservas/docs y las auditorías Make
// previas para el razonamiento completo de cada clasificación.
export const MAKE_SCENARIO_CATEGORIES = Object.freeze({
  APP_TRIGGERED: "APP_TRIGGERED",
  EVENT_TRIGGERED: "EVENT_TRIGGERED",
  SCHEDULED: "SCHEDULED",
  INTERNAL_OPERATION: "INTERNAL_OPERATION",
  TECHNICAL_MONITORING: "TECHNICAL_MONITORING",
  DEVELOPMENT_QA: "DEVELOPMENT_QA",
});

const C = MAKE_SCENARIO_CATEGORIES;

// Cada entrada: datos operacionales = confirmado_make_mcp (tal cual los
// devolvió Make). `categoria` = derivado. Nunca se incluye aquí ningún
// token, hookId invocable, URL de webhook, contenido HTML de email ni dato
// personal de jugadores — solo métricas agregadas.
export const MAKE_INVENTORY = Object.freeze([
  { id: 5697630, nombre: "📡 API Reservas", categoria: C.APP_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 115, operaciones: 519, errores: 67, ultimaModificacion: "2026-06-19T18:10:39.482Z", usaAirtable: true, estadoVerificacion: "confirmado" },
  { id: 6199248, nombre: "🎾 Alta de Jugador", categoria: C.APP_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 22, operaciones: 75, errores: 2, ultimaModificacion: "2026-06-26T01:34:11.609Z", usaAirtable: true, estadoVerificacion: "confirmado" },

  { id: 6299114, nombre: "⚠️ Alerta Crítica Fallos Make", categoria: C.TECHNICAL_MONITORING, activo: false, scheduling: "cada 900s (15 min)", ejecuciones: 257, operaciones: 858, errores: 1, ultimaModificacion: "2026-06-23T11:06:55.060Z", usaAirtable: false, nota: "PASO 02 (2026-07-17, MCP solo lectura, reconfirma 2026-07-10): isActive=false, isinvalid=false, 1 error de 257 ejecuciones (99.6% éxito histórico). Nota propia del escenario en Make: pendiente de actualizar la credencial de acceso a la API de Make. No está roto — está pausado a la espera de esa rotación. Contradicción anterior con un export local que decía 'ROTO' queda resuelta: ese export reflejaba un estado ya superado.", estadoVerificacion: "pendiente_make_real" },
  { id: 6233755, nombre: "🗺️ Mapa de Flujos", categoria: C.TECHNICAL_MONITORING, activo: true, scheduling: "semanal · lunes 07:30", ejecuciones: 18, operaciones: 97, errores: 3, ultimaModificacion: "2026-06-29T05:33:39.182Z", usaAirtable: false, estadoVerificacion: "pendiente_make_real" },

  { id: 6217724, nombre: "🔄 Backup Semanal", categoria: C.SCHEDULED, activo: true, scheduling: "semanal · lunes 07:00", ejecuciones: 46, operaciones: 176, errores: 4, ultimaModificacion: "2026-06-26T01:36:10.974Z", usaAirtable: true, nota: "PASO 04A (2026-07-17, MCP solo lectura): ahora isActive=false (estaba activo en el snapshot del 2026-07-06); ejecuciones acumuladas reales 148, errores 2 (1.4%). Clasificación: B) requiere decisión humana para reactivarlo antes de cualquier prueba — función interna (backup a Drive), sin comunicación a socios, bajo riesgo una vez reactivado.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 5791128, nombre: "👥 Emparejamiento Sin Pareja", categoria: C.SCHEDULED, activo: true, scheduling: "semanal · jueves 11:00", ejecuciones: 5, operaciones: 19, errores: 2, ultimaModificacion: "2026-06-29T18:26:11.099Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=false hoy (activo en el snapshot). Ejecuciones reales 81, errores 2 (2.5%). Clasificación: C) requiere datos de prueba — envía email real a socios en espera de pareja; una prueba sin datos sintéticos contactaría a personas reales.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 5736472, nombre: "🚨 Alerta Pistas Libres + Flash Promo", categoria: C.SCHEDULED, activo: true, scheduling: "semanal · mar/vie 09:00", ejecuciones: 5, operaciones: 50, errores: 0, ultimaModificacion: "2026-06-26T01:32:47.200Z", usaAirtable: true, estadoVerificacion: "bloqueado_externo" },
  { id: 5736800, nombre: "📋 Dashboard Ejecutivo Diario", categoria: C.SCHEDULED, activo: true, scheduling: "semanal · diario 09:00", ejecuciones: 34, operaciones: 117, errores: 1, ultimaModificacion: "2026-06-26T01:53:25.553Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=false hoy (activo en el snapshot). Ejecuciones reales 148, errores 1. Clasificación: B) requiere decisión humana para reactivarlo — informe interno para dirección, sin contacto a socios, bajo riesgo una vez reactivado.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 5736468, nombre: "📊 Panel KPI Semanal", categoria: C.SCHEDULED, activo: true, scheduling: "semanal · martes 08:00", ejecuciones: 4, operaciones: 28, errores: 0, ultimaModificacion: "2026-06-29T05:36:38.060Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=false hoy (activo en el snapshot). Ejecuciones reales 70, sin errores. Clasificación: B) requiere decisión humana para reactivarlo — informe interno, bajo riesgo.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 5736470, nombre: "🔁 Reactivación Inactivos 30d", categoria: C.SCHEDULED, activo: true, scheduling: "semanal · martes 10:00", ejecuciones: 4, operaciones: 13, errores: 0, ultimaModificacion: "2026-06-29T05:38:15.380Z", usaAirtable: true, estadoVerificacion: "bloqueado_externo" },
  { id: 5799041, nombre: "📈 Predicción Ocupación", categoria: C.SCHEDULED, activo: true, scheduling: "semanal · martes 07:00", ejecuciones: 3, operaciones: 52, errores: 0, ultimaModificacion: "2026-06-29T05:37:08.875Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=false hoy (activo en el snapshot). Ejecuciones reales 72, sin errores. Clasificación: B) requiere decisión humana para reactivarlo — informe interno con predicción vía IA, sin contacto a socios.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 5811864, nombre: "🎂 Felicitación Cumpleaños", categoria: C.SCHEDULED, activo: true, scheduling: "semanal · diario 09:00", ejecuciones: 33, operaciones: 49, errores: 0, ultimaModificacion: "2026-06-29T05:31:33.213Z", usaAirtable: true, estadoVerificacion: "bloqueado_externo" },
  { id: 5811901, nombre: "📊 Análisis NPS Semanal", categoria: C.SCHEDULED, activo: true, scheduling: "semanal · martes 08:30", ejecuciones: 15, operaciones: 67, errores: 0, ultimaModificacion: "2026-06-26T01:34:45.629Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=false hoy (activo en el snapshot). Ejecuciones reales 79, sin errores. Clasificación: B) requiere decisión humana para reactivarlo — resume respuestas reales de socios vía IA antes de enviarlas a dirección; confirmar si necesita anonimizarse primero.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 5811888, nombre: "💸 Escalado Impagos", categoria: C.SCHEDULED, activo: true, scheduling: "semanal · diario 08:00", ejecuciones: 37, operaciones: 58, errores: 0, ultimaModificacion: "2026-06-29T05:30:58.136Z", usaAirtable: true, estadoVerificacion: "bloqueado_externo" },
  { id: 5791032, nombre: "💳 Recordatorio Cuota Mensual", categoria: C.SCHEDULED, activo: false, scheduling: "cada 2 592 000s (30 días)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-29T17:53:31.813Z", usaAirtable: true, estadoVerificacion: "bloqueado_externo" },
  { id: 5791119, nombre: "📊 Informe Mensual", categoria: C.SCHEDULED, activo: true, scheduling: "cada 2 592 000s (30 días)", ejecuciones: 8, operaciones: 33, errores: 4, ultimaModificacion: "2026-06-29T05:32:59.256Z", usaAirtable: true, estadoVerificacion: "bloqueado_externo" },

  { id: 5735907, nombre: "🗓️ Sincronización Multi-Calendario", categoria: C.INTERNAL_OPERATION, activo: true, scheduling: "cada 1800s (30 min)", ejecuciones: 1528, operaciones: 1546, errores: 0, ultimaModificacion: "2026-07-06T14:32:29.507Z", usaAirtable: true, nota: "Optimizado en esta auditoría: 15→30 min.", estadoVerificacion: "bloqueado_externo" },
  { id: 5791116, nombre: "🏷️ Confirmación Inscripción Torneo", categoria: C.INTERNAL_OPERATION, activo: true, scheduling: "cada 3600s (1h)", ejecuciones: 502, operaciones: 545, errores: 1, ultimaModificacion: "2026-06-26T01:50:59.045Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=false hoy (activo en el snapshot; 502→616 ejecuciones acumuladas desde entonces). Errores 1. Clasificación: C) requiere datos de prueba — envía email real de confirmación a jugadores inscritos; probarlo sin una inscripción de prueba contactaría a un jugador real.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 4942506, nombre: "🔔 Recordatorio 24h Antes", categoria: C.INTERNAL_OPERATION, activo: false, scheduling: "cada 3600s (1h)", ejecuciones: 148, operaciones: 592, errores: 55, ultimaModificacion: "2026-07-06T14:29:31.568Z", usaAirtable: true, nota: "Corrección defensiva aplicada (excluye fecha/hora vacías antes de parseDate). Pendiente validación funcional con datos reales: la prueba controlada falló por el bloqueo externo de Airtable, no por el fix.", estadoVerificacion: "bloqueado_externo" },
  { id: 5736463, nombre: "⚡ Recordatorio 2h Antes", categoria: C.INTERNAL_OPERATION, activo: true, scheduling: "cada 1800s (30 min)", ejecuciones: 487, operaciones: 1851, errores: 92, ultimaModificacion: "2026-06-29T05:39:41.202Z", usaAirtable: true, nota: "Errores actuales = RateLimitError 429 de Airtable (dependencia externa degradada), no un bug del escenario.", estadoVerificacion: "bloqueado_externo" },
  { id: 5736797, nombre: "🚫 Seguimiento No-Show", categoria: C.INTERNAL_OPERATION, activo: true, scheduling: "cada 21600s (6h)", ejecuciones: 187, operaciones: 429, errores: 13, ultimaModificacion: "2026-06-29T05:41:39.895Z", usaAirtable: true, estadoVerificacion: "bloqueado_externo" },
  { id: 5791113, nombre: "📋 Gestión Lista de Espera", categoria: C.INTERNAL_OPERATION, activo: true, scheduling: "cada 3600s (1h)", ejecuciones: 466, operaciones: 483, errores: 0, ultimaModificacion: "2026-06-29T17:57:25.573Z", usaAirtable: true, estadoVerificacion: "pendiente_make_real" },
  { id: 5750308, nombre: "📧 Monitor Prueba Gratuita", categoria: C.INTERNAL_OPERATION, activo: true, scheduling: "cada 3600s (1h)", ejecuciones: 452, operaciones: 454, errores: 0, ultimaModificacion: "2026-06-29T05:34:16.616Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=false hoy (activo en el snapshot; 452→566 ejecuciones acumuladas desde entonces). Sin errores. Clasificación: C) requiere datos de prueba — hace seguimiento por email a personas reales en prueba gratuita; probarlo sin un registro de prueba contactaría a alguien real.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 5811918, nombre: "🔁 Onboarding Secuencial", categoria: C.INTERNAL_OPERATION, activo: true, scheduling: "cada 3600s (1h)", ejecuciones: 474, operaciones: 1827, errores: 3, ultimaModificacion: "2026-06-29T05:35:15.793Z", usaAirtable: true, estadoVerificacion: "bloqueado_externo" },
  { id: 5812456, nombre: "❄️ Congelación + Reactivación Membresía", categoria: C.INTERNAL_OPERATION, activo: true, scheduling: "cada 3600s (1h)", ejecuciones: 468, operaciones: 784, errores: 0, ultimaModificacion: "2026-06-26T01:51:39.434Z", usaAirtable: true, estadoVerificacion: "bloqueado_externo" },
  { id: 5791022, nombre: "🎁 Bienvenida Nuevo Socio", categoria: C.INTERNAL_OPERATION, activo: true, scheduling: "cada 3600s (1h)", ejecuciones: 461, operaciones: 795, errores: 0, ultimaModificacion: "2026-06-26T01:37:41.586Z", usaAirtable: true, estadoVerificacion: "bloqueado_externo" },
  { id: 5812297, nombre: "🎁 Programa de Referidos", categoria: C.INTERNAL_OPERATION, activo: true, scheduling: "cada 3600s (1h)", ejecuciones: 449, operaciones: 1343, errores: 0, ultimaModificacion: "2026-06-29T05:37:48.572Z", usaAirtable: true, estadoVerificacion: "bloqueado_externo" },
  { id: 5736466, nombre: "⭐ Encuesta Post-Partido", categoria: C.INTERNAL_OPERATION, activo: false, scheduling: "cada 3600s (1h)", ejecuciones: 64, operaciones: 257, errores: 57, ultimaModificacion: "2026-06-29T05:29:49.477Z", usaAirtable: true, estadoVerificacion: "pendiente_make_real" },

  { id: 4919937, nombre: "🏆 Cruces de Torneo", categoria: C.EVENT_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 2, operaciones: 7, errores: 1, ultimaModificacion: "2026-06-26T01:52:53.022Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=true, con disparador real asignado, 2 ejecuciones históricas, 1 error (muestra insuficiente para conclusión). Sin disparador propio desde la app todavía (Torneos no lo integra). Clasificación: A) listo para prueba controlada — bajo volumen, alcance técnico, sin comunicación masiva a socios.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 5330078, nombre: "🏅 Resultados y Clasificación", categoria: C.EVENT_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 1, operaciones: 6, errores: 0, ultimaModificacion: "2026-06-29T05:40:26.152Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=true, con disparador real asignado, 1 ejecución histórica, sin errores. Sin disparador propio desde la app todavía. Clasificación: A) listo para prueba controlada.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 5791374, nombre: "🏆 Reto 04 + Puntos", categoria: C.EVENT_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 1, operaciones: 6, errores: 0, ultimaModificacion: "2026-06-29T05:41:02.023Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=false hoy (activo en el snapshot); 1 ejecución histórica, sin errores. Clasificación: B) requiere decisión humana para reactivarlo — otorga puntos internos de gamificación, bajo riesgo.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 5791133, nombre: "🏟️ Cierre Temporal de Pistas", categoria: C.EVENT_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 4, operaciones: 74, errores: 0, ultimaModificacion: "2026-06-26T01:39:08.108Z", usaAirtable: true, nota: "PASO 02 (2026-07-17, MCP solo lectura): isActive=true con webhook real asignado, 4 ejecuciones reales y 0 errores — funciona en Make hoy. La documentación previa que lo daba como bloqueado por WhatsApp estaba desactualizada. Esto confirma que el escenario opera en Make; no confirma por sí solo que la app dispare este flujo (posible origen: automatización directa sobre Airtable, no el Worker de la app).", estadoVerificacion: "confirmado" },
  { id: 5288809, nombre: "❌ Baja de Jugador + Promoción", categoria: C.EVENT_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 1, operaciones: 9, errores: 0, ultimaModificacion: "2026-06-26T01:37:06.291Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=true, con disparador real asignado, 1 ejecución histórica, sin errores. Clasificación: C) requiere datos de prueba — da de baja a un jugador real y promociona a un suplente; probarlo sin un jugador ficticio de prueba afectaría a un socio real.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 5291559, nombre: "🔐 Control Acceso QR", categoria: C.EVENT_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 9, operaciones: 41, errores: 4, ultimaModificacion: "2026-06-26T01:52:28.332Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=true, con disparador real asignado, 9 ejecuciones históricas y 4 errores (44%, muestra pequeña pero notable). Clasificación: D) requiere revisar la causa de ese 44% de error antes de considerarlo listo para más pruebas. PASO 04B (2026-07-17, MCP solo lectura, executions_list): los 4 errores son la misma causa exacta — el módulo que crea el registro en Airtable (ActionCreateRecord) devuelve 422 'Insufficient permissions to create new select option' al intentar escribir un valor (p.ej. el resultado del control de acceso) que no existe todavía como opción predefinida en ese campo de selección única de Airtable. Es un problema de mapeo de datos/configuración del campo, no de credencial ni de código de la app. Los 4 errores ocurrieron el 2026-06-19 (22:39-23:44); las 5 ejecuciones posteriores (2026-06-19 23:58 a 2026-06-20 00:12, dos de ellas repetición manual de las fallidas) terminaron con éxito sin ese error — indicio fuerte de que ya se corrigió (opción añadida al campo o ajuste de configuración), pendiente de confirmar con ejecuciones reales más recientes.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 6244975, nombre: "🔑 Generación QR Acceso", categoria: C.EVENT_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 9, operaciones: 28, errores: 6, ultimaModificacion: "2026-06-29T17:56:55.356Z", usaAirtable: false, estadoVerificacion: "confirmado" },
  { id: 5799031, nombre: "🎧 Atención Socio WhatsApp FAQ", categoria: C.EVENT_TRIGGERED, activo: false, scheduling: "webhook (immediately)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-29T05:43:58.075Z", usaAirtable: true, estadoVerificacion: "pendiente_make_real" },
  { id: 5791124, nombre: "🎯 Campaña Flash WhatsApp", categoria: C.EVENT_TRIGGERED, activo: false, scheduling: "webhook (immediately)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-29T17:52:05.632Z", usaAirtable: true, estadoVerificacion: "pendiente_make_real" },
  { id: 5733370, nombre: "💰 Facturación y Cobro", categoria: C.EVENT_TRIGGERED, activo: false, scheduling: "webhook (immediately)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-29T17:52:57.357Z", usaAirtable: true, nota: "PASO 04A (2026-07-17): isActive=false, 0 ejecuciones desde que existe. Acción real de cobro/facturación. Clasificación: E) no seguro para ejecutar todavía — sin evidencia de uso, sin propietario funcional claro, toca una acción sensible de dinero.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 5799061, nombre: "💬 Chatbot Web Reservas", categoria: C.EVENT_TRIGGERED, activo: false, scheduling: "webhook (immediately)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-26T01:38:23.159Z", usaAirtable: false, nota: "PASO 03B (2026-07-17): desactivado manualmente en Make por decisión de producto/seguridad (estaba clasificado NOT_SAFE — decidía reservas reales de forma no determinista vía LLM, sin disparador en vivo asignado y sin ejecuciones). Confirmado por lectura MCP tras la desactivación: isActive=false. Es una decisión de cierre tomada y verificada, no una afirmación de que el flujo sea operativo o válido.", estadoVerificacion: "confirmado" },
  { id: 5798996, nombre: "🤖 Bot IA Reservas WhatsApp", categoria: C.EVENT_TRIGGERED, activo: false, scheduling: "webhook (immediately)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-29T05:45:19.306Z", usaAirtable: false, nota: "PASO 04A (2026-07-17): isActive=false, 0 ejecuciones, sin disparador asignado. Clasificación: E) no seguro para ejecutar todavía — mensajería real no controlada, sin propietario funcional claro.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 4832095, nombre: "🤖 Bot IA Reservas Telegram", categoria: C.EVENT_TRIGGERED, activo: false, scheduling: "webhook (Telegram watchUpdates)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-29T05:44:47.157Z", usaAirtable: false, nota: "PASO 04A (2026-07-17): isActive=false, 0 ejecuciones, con un disparador ya asignado. Clasificación: E) no seguro para ejecutar todavía — canal no usado por la app, mensajería real no controlada.", estadoVerificacion: "listo_sin_bloqueo" },
  { id: 6323457, nombre: "⚖️ Solicitud GDPR Acceso u Olvido de Datos", categoria: C.EVENT_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-25T05:27:35.959Z", usaAirtable: true, nota: "Sin blueprint local previo; no conectado a la app.", estadoVerificacion: "pendiente_make_real" },
  { id: 6323450, nombre: "🛡️ Alerta Seguridad Acceso Sospechoso", categoria: C.EVENT_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-25T05:27:09.091Z", usaAirtable: false, nota: "Sin blueprint local previo; no conectado a la app.", estadoVerificacion: "bloqueado_externo" },
  { id: 6323441, nombre: "💳 Pago Confirmado Stripe → Cuota + Recibo", categoria: C.EVENT_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 1, operaciones: 4, errores: 0, ultimaModificacion: "2026-06-29T05:36:04.160Z", usaAirtable: true, nota: "Stripe no está activado en la app (regla del proyecto); solo existe la infraestructura en Make.", estadoVerificacion: "bloqueado_externo" },
  { id: 6335117, nombre: "🔄 Dunning Cobro Recurrente Stripe", categoria: C.EVENT_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-29T05:28:36.088Z", usaAirtable: true, nota: "Stripe no está activado en la app.", estadoVerificacion: "bloqueado_externo" },
  { id: 6323445, nombre: "🔑 Email Recuperación de Contraseña SaaS", categoria: C.EVENT_TRIGGERED, activo: false, scheduling: "webhook (immediately)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-25T05:26:47.987Z", usaAirtable: false, nota: "NO conectar: Supabase Auth es la única fuente de verdad de recuperación de contraseña. PASO 03B (2026-07-17): desactivado manualmente en Make por decisión de seguridad, alineando Make con esta regla de arquitectura (tenía un disparador real asignado y 0 ejecuciones). Confirmado por lectura MCP tras la desactivación: isActive=false. Es una decisión de cierre tomada y verificada, no una afirmación de que el flujo sea operativo o válido.", estadoVerificacion: "confirmado" },
  { id: 6335114, nombre: "📸 Instagram Borrador con IA", categoria: C.EVENT_TRIGGERED, activo: true, scheduling: "webhook (immediately)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-25T20:52:56.817Z", usaAirtable: true, nota: "Marketing, sin relación con la app.", estadoVerificacion: "bloqueado_externo" },
  { id: 6335118, nombre: "🔔 Notificación Push PWA", categoria: C.EVENT_TRIGGERED, activo: false, scheduling: "webhook (immediately)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-25T20:53:52.789Z", usaAirtable: true, nota: "La app no tiene push PWA implementado todavía.", estadoVerificacion: "pendiente_make_real" },
  { id: 5747703, nombre: "📝 Tally → API Reservas", categoria: C.EVENT_TRIGGERED, activo: false, scheduling: "webhook (immediately)", ejecuciones: 0, operaciones: 0, errores: 0, ultimaModificacion: "2026-06-29T18:27:30.571Z", usaAirtable: false, estadoVerificacion: "pendiente_make_real" },

  { id: 6216523, nombre: "🗂️ Backup Plantilla Drive", categoria: C.DEVELOPMENT_QA, activo: false, scheduling: "cada 900s (15 min)", ejecuciones: 443, operaciones: 443, errores: 0, ultimaModificacion: "2026-06-29T05:44:12.409Z", usaAirtable: false, nota: "Nombre indica plantilla/QA. Confirmado inactivo — no reactivar sin necesidad.", estadoVerificacion: "confirmado" },
]);

// --- Derivación (documentada, no inventada) ---

export function computeErrorRate(scenario) {
  if (!scenario.ejecuciones) return 0;
  return Math.round((scenario.errores / scenario.ejecuciones) * 1000) / 10; // % con 1 decimal
}

// Criterios de salud (documentados, ver Fase 5 de la auditoría):
// CRÍTICO: tasa de error >= 25% con al menos 10 ejecuciones, o dependencia
//          externa conocida bloqueada afectando directamente al escenario.
// ATENCIÓN: tasa de error entre 5% y 25%, o inactivo pese a ser relevante
//           para el negocio (categoría distinta de DEVELOPMENT_QA/TECHNICAL_MONITORING).
// OK: el resto.
export function computeHealth(scenario) {
  const tasa = computeErrorRate(scenario);
  const relevante = scenario.categoria !== C.DEVELOPMENT_QA;

  if (scenario.ejecuciones >= 10 && tasa >= 25) return "CRITICO";
  if (tasa >= 5 && tasa < 25) return "ATENCION";
  if (!scenario.activo && relevante && scenario.categoria !== C.TECHNICAL_MONITORING) return "ATENCION";
  return "OK";
}

// Criticidad de negocio (documentada): depende de la categoría y de si está
// confirmado como conectado a la app (APP_TRIGGERED), no del volumen.
export function computeCriticality(scenario) {
  if (scenario.categoria === C.APP_TRIGGERED) return "ALTA";
  if (scenario.categoria === C.INTERNAL_OPERATION || scenario.categoria === C.SCHEDULED) return "MEDIA";
  return "BAJA";
}

export function getScenarioNote(scenario) {
  return scenario.nota || null;
}
