// Club Pádel 04 · Mapa de integración App ↔ Make 50/50 (Paso 07A, 2026-07-19).
//
// Distinto de `estadoVerificacion` en makeInventory.js: aquel es una
// clasificación de auditoría de MAKE (¿se verificó este escenario contra
// Make/Airtable?). Este archivo clasifica un eje independiente: ¿el CÓDIGO
// de la app (src/App.jsx, worker-reservas/src/index.js) realmente dispara
// este escenario? Un escenario puede estar `confirmado` en Make y a la vez
// no tener ningún trigger de app (p. ej. Cierre Temporal de Pistas, Chatbot
// Web Reservas, Email Recuperación de Contraseña SaaS — los tres
// verificados sin código de app relacionado, ver
// docs/paso-07a-integracion-make-app/make-50-app-integration-summary.md).
//
// Método: extracción programática del inventario real + búsqueda
// exhaustiva de código (grep/lectura directa) sobre src/ y
// worker-reservas/src/index.js por nombre de acción, endpoint, variable de
// entorno de Make y palabras clave de cada escenario. Ningún dato aquí
// proviene de ejecutar Make, Airtable ni ningún endpoint real — es lectura
// estática de código, en la misma sesión que produjo el mapa completo.

export const MAKE_INTEGRATION_GROUPS = Object.freeze({
  APP_Y_WORKER: "A",
  APP_SIN_WORKER: "B",
  SOLO_CENTRO_TECNICO: "C",
  AUTONOMO_MAKE: "D",
  SIN_INTEGRACION: "E",
});

// Cada entrada corresponde 1:1 a un `id` de MAKE_INVENTORY
// (src/data/makeInventory.js) — ver test de correspondencia en
// makeAppIntegrationMap.test.mjs. El detalle completo por escenario
// (módulo/componente/trigger/observación) vive en
// docs/paso-07a-integracion-make-app/make-50-app-integration-map.md — aquí solo los campos que
// alimentan el panel A3 de Centro Técnico y sus tests.
export const MAKE_APP_INTEGRATION_MAP = Object.freeze([
  { id: 5697630, nombre: "📡 API Reservas", grupo: "A", integradoEnApp: true, integradoEnWorker: true, soloInventariado: false, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada) en el paso de busqueda/escritura tras forwardToMake" },
  { id: 6199248, nombre: "🎾 Alta de Jugador", grupo: "A", integradoEnApp: true, integradoEnWorker: true, soloInventariado: false, requiereMakeManual: false, bloqueadorPrincipal: "ninguno detectado (7 ejecuciones confirmadas historicamente, 2 errores)" },
  { id: 6299114, nombre: "⚠️ Alerta Crítica Fallos Make", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: true, bloqueadorPrincipal: "credencial de acceso a la API de Make pendiente de rotar" },
  { id: 6233755, nombre: "🗺️ Mapa de Flujos", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: true, bloqueadorPrincipal: "pendiente de accion manual en Make (no especificada)" },
  { id: 6217724, nombre: "🔄 Backup Semanal", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 5791128, nombre: "👥 Emparejamiento Sin Pareja", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 5736472, nombre: "🚨 Alerta Pistas Libres + Flash Promo", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5736800, nombre: "📋 Dashboard Ejecutivo Diario", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 5736468, nombre: "📊 Panel KPI Semanal", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 5736470, nombre: "🔁 Reactivación Inactivos 30d", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5799041, nombre: "📈 Predicción Ocupación", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 5811864, nombre: "🎂 Felicitación Cumpleaños", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5811901, nombre: "📊 Análisis NPS Semanal", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 5811888, nombre: "💸 Escalado Impagos", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5791032, nombre: "💳 Recordatorio Cuota Mensual", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5791119, nombre: "📊 Informe Mensual", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5735907, nombre: "🗓️ Sincronización Multi-Calendario", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5791116, nombre: "🏷️ Confirmación Inscripción Torneo", grupo: "E", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 4942506, nombre: "🔔 Recordatorio 24h Antes", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5736463, nombre: "⚡ Recordatorio 2h Antes", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5736797, nombre: "🚫 Seguimiento No-Show", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5791113, nombre: "📋 Gestión Lista de Espera", grupo: "E", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: true, bloqueadorPrincipal: "accion manual pendiente dentro de Make" },
  { id: 5750308, nombre: "📧 Monitor Prueba Gratuita", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 5811918, nombre: "🔁 Onboarding Secuencial", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5812456, nombre: "❄️ Congelación + Reactivación Membresía", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5791022, nombre: "🎁 Bienvenida Nuevo Socio", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5812297, nombre: "🎁 Programa de Referidos", grupo: "E", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 5736466, nombre: "⭐ Encuesta Post-Partido", grupo: "E", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: true, bloqueadorPrincipal: "accion manual pendiente dentro de Make" },
  { id: 4919937, nombre: "🏆 Cruces de Torneo", grupo: "E", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 5330078, nombre: "🏅 Resultados y Clasificación", grupo: "E", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 5791374, nombre: "🏆 Reto 04 + Puntos", grupo: "E", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 5791133, nombre: "🏟️ Cierre Temporal de Pistas", grupo: "E", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno (verificado por Make, no por app)" },
  { id: 5288809, nombre: "❌ Baja de Jugador + Promoción", grupo: "A", integradoEnApp: true, integradoEnWorker: true, soloInventariado: false, requiereMakeManual: true, bloqueadorPrincipal: "MAKE_BAJA_JUGADOR_WEBHOOK no configurado (código Worker completo, 9 tests verdes); sin probar contra Make/Airtable real, no confirmado end-to-end (PASO 07C, 2026-07-19)" },
  { id: 5291559, nombre: "🔐 Control Acceso QR", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 6244975, nombre: "🔑 Generación QR Acceso", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno (verificado por Make, no por app)" },
  { id: 5799031, nombre: "🎧 Atención Socio WhatsApp FAQ", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: true, bloqueadorPrincipal: "accion manual pendiente dentro de Make" },
  { id: 5791124, nombre: "🎯 Campaña Flash WhatsApp", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: true, bloqueadorPrincipal: "accion manual pendiente dentro de Make" },
  { id: 5733370, nombre: "💰 Facturación y Cobro", grupo: "E", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 5799061, nombre: "💬 Chatbot Web Reservas", grupo: "E", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno (verificado por Make, no por app)" },
  { id: 5798996, nombre: "🤖 Bot IA Reservas WhatsApp", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 4832095, nombre: "🤖 Bot IA Reservas Telegram", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno de Airtable; disparador de app no detectado" },
  { id: 6323457, nombre: "⚖️ Solicitud GDPR Acceso u Olvido de Datos", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: true, bloqueadorPrincipal: "accion manual pendiente dentro de Make" },
  { id: 6323450, nombre: "🛡️ Alerta Seguridad Acceso Sospechoso", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 6323441, nombre: "💳 Pago Confirmado Stripe → Cuota + Recibo", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 6335117, nombre: "🔄 Dunning Cobro Recurrente Stripe", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 6323445, nombre: "🔑 Email Recuperación de Contraseña SaaS", grupo: "E", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno (verificado por Make, no por app)" },
  { id: 6335114, nombre: "📸 Instagram Borrador con IA", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "Airtable 429 (cuota agotada)" },
  { id: 6335118, nombre: "🔔 Notificación Push PWA", grupo: "C", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: true, bloqueadorPrincipal: "pendiente de config en Make" },
  { id: 5747703, nombre: "📝 Tally → API Reservas", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: true, bloqueadorPrincipal: "accion manual pendiente dentro de Make" },
  { id: 6216523, nombre: "🗂️ Backup Plantilla Drive", grupo: "D", integradoEnApp: false, integradoEnWorker: false, soloInventariado: true, requiereMakeManual: false, bloqueadorPrincipal: "ninguno detectado" },
]);
