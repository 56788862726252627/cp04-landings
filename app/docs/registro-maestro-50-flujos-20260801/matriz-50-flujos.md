# Matriz de los 50 flujos Make — Club Pádel 04

Generado programáticamente desde `src/data/makeMasterRegistry.js` el 2026-08-01. No editar a mano — regenerar con `node scripts/generar-matriz-50-flujos.mjs`.

## Resumen (siempre derivado, nunca hardcodeado)

- **Total:** 50
- **Conectados** (integrados en la app, incluye bloqueados externamente): 39
- **Probados** (evidencia real, incluye parcial): 2
- **Operativos** (evidencia E2E objetiva): 1

Reparto por estado funcional:
  - NO_CONECTADO: 8
  - CONECTADO_SIN_PROBAR: 4
  - PROBADO_PARCIAL: 1
  - OPERATIVO: 1
  - BLOQUEADO: 30
  - NO_APLICA: 3
  - PENDIENTE_DE_CONFIRMAR: 3

## Tabla completa

| # | Flujo | Categoría | Área | Módulo | Roles autorizados | Estado funcional | Servicio destino |
|---|---|---|---|---|---|---|---|
| 1 | 📡 API Reservas | APP_TRIGGERED | Reservas | Reservar / Reservas | PLAYER, STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable + Google Calendar |
| 2 | 🎾 Alta de Jugador | APP_TRIGGERED | Jugadores | Alta de jugador | STAFF, ADMIN, SUPPORT | OPERATIVO | Airtable |
| 3 | ⚠️ Alerta Crítica Fallos Make | TECHNICAL_MONITORING | Soporte | Centro de automatizaciones | SUPPORT | NO_APLICA | Ninguno detectado |
| 4 | 🗺️ Mapa de Flujos | TECHNICAL_MONITORING | Soporte | Centro de automatizaciones | SUPPORT | NO_APLICA | Ninguno detectado |
| 5 | 🔄 Backup Semanal | SCHEDULED | Seguridad y auditoría | Backups y seguridad | ADMIN, SUPPORT | BLOQUEADO | Airtable + Google Drive |
| 6 | 👥 Emparejamiento Sin Pareja | SCHEDULED | Jugadores | Comunicaciones y ciclo de socio | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 7 | 🚨 Alerta Pistas Libres + Flash Promo | SCHEDULED | Reservas | Pistas libres y recordatorios | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 8 | 📋 Dashboard Ejecutivo Diario | SCHEDULED | Informes | Dashboard KPI y NPS | ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 9 | 📊 Panel KPI Semanal | SCHEDULED | Informes | Dashboard KPI y NPS | ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 10 | 🔁 Reactivación Inactivos 30d | SCHEDULED | Jugadores | Comunicaciones y ciclo de socio | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 11 | 📈 Predicción Ocupación | SCHEDULED | Informes | Calendario y disponibilidad | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable + Google Calendar |
| 12 | 🎂 Felicitación Cumpleaños | SCHEDULED | Jugadores | Comunicaciones y ciclo de socio | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 13 | 📊 Análisis NPS Semanal | SCHEDULED | Informes | Dashboard KPI y NPS | ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 14 | 💸 Escalado Impagos | SCHEDULED | Administración | Facturación y pagos | ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 15 | 💳 Recordatorio Cuota Mensual | SCHEDULED | Jugadores | Comunicaciones y ciclo de socio | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 16 | 📊 Informe Mensual | SCHEDULED | Informes | Dashboard KPI y NPS | ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 17 | 🗓️ Sincronización Multi-Calendario | INTERNAL_OPERATION | Reservas | Calendario y disponibilidad | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable + Google Calendar |
| 18 | 🏷️ Confirmación Inscripción Torneo | INTERNAL_OPERATION | Torneos y ranking | Centro de automatizaciones | SUPPORT | NO_CONECTADO | Airtable |
| 19 | 🔔 Recordatorio 24h Antes | INTERNAL_OPERATION | Reservas | Pistas libres y recordatorios | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 20 | ⚡ Recordatorio 2h Antes | INTERNAL_OPERATION | Reservas | Pistas libres y recordatorios | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 21 | 🚫 Seguimiento No-Show | INTERNAL_OPERATION | Reservas | Pistas libres y recordatorios | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 22 | 📋 Gestión Lista de Espera | INTERNAL_OPERATION | Jugadores | Lista de espera | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 23 | 📧 Monitor Prueba Gratuita | INTERNAL_OPERATION | Jugadores | Comunicaciones y ciclo de socio | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 24 | 🔁 Onboarding Secuencial | INTERNAL_OPERATION | Jugadores | Comunicaciones y ciclo de socio | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 25 | ❄️ Congelación + Reactivación Membresía | INTERNAL_OPERATION | Jugadores | Comunicaciones y ciclo de socio | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 26 | 🎁 Bienvenida Nuevo Socio | INTERNAL_OPERATION | Jugadores | Comunicaciones y ciclo de socio | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 27 | 🎁 Programa de Referidos | INTERNAL_OPERATION | Jugadores | Comunicaciones y ciclo de socio | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 28 | ⭐ Encuesta Post-Partido | INTERNAL_OPERATION | Torneos y ranking | Centro de automatizaciones | SUPPORT | NO_CONECTADO | Airtable |
| 29 | 🏆 Cruces de Torneo | EVENT_TRIGGERED | Torneos y ranking | Centro de automatizaciones | SUPPORT | NO_CONECTADO | Airtable |
| 30 | 🏅 Resultados y Clasificación | EVENT_TRIGGERED | Torneos y ranking | Centro de automatizaciones | SUPPORT | NO_CONECTADO | Airtable |
| 31 | 🏆 Reto 04 + Puntos | EVENT_TRIGGERED | Torneos y ranking | Centro de automatizaciones | SUPPORT | NO_CONECTADO | Airtable |
| 32 | 🏟️ Cierre Temporal de Pistas | EVENT_TRIGGERED | Reservas | Cierre temporal | STAFF, ADMIN, SUPPORT | PROBADO_PARCIAL | Airtable + WhatsApp Business API |
| 33 | ❌ Baja de Jugador + Promoción | EVENT_TRIGGERED | Jugadores | Baja de jugador | STAFF, ADMIN, SUPPORT | CONECTADO_SIN_PROBAR | Airtable |
| 34 | 🔐 Control Acceso QR | EVENT_TRIGGERED | Acceso y QR | Control QR / Accesos | STAFF, ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 35 | 🔑 Generación QR Acceso | EVENT_TRIGGERED | Acceso y QR | Control QR / Accesos | STAFF, ADMIN, SUPPORT | BLOQUEADO | Ninguno detectado |
| 36 | 🎧 Atención Socio WhatsApp FAQ | EVENT_TRIGGERED | Automatizaciones | Automatizaciones y bots | ADMIN, SUPPORT | PENDIENTE_DE_CONFIRMAR | Airtable + Stripe + WhatsApp Business API + Telegram Bot API + Google Calendar |
| 37 | 🎯 Campaña Flash WhatsApp | EVENT_TRIGGERED | Automatizaciones | Automatizaciones y bots | ADMIN, SUPPORT | PENDIENTE_DE_CONFIRMAR | Airtable + Stripe + WhatsApp Business API + Telegram Bot API + Google Calendar |
| 38 | 💰 Facturación y Cobro | EVENT_TRIGGERED | Administración | Facturación y pagos | ADMIN, SUPPORT | CONECTADO_SIN_PROBAR | Airtable + Stripe + WhatsApp Business API + Telegram Bot API + Google Calendar |
| 39 | 💬 Chatbot Web Reservas | EVENT_TRIGGERED | Comunicaciones | Centro de automatizaciones | SUPPORT | NO_CONECTADO | Ninguno detectado |
| 40 | 🤖 Bot IA Reservas WhatsApp | EVENT_TRIGGERED | Automatizaciones | Automatizaciones y bots | ADMIN, SUPPORT | CONECTADO_SIN_PROBAR | Stripe + WhatsApp Business API + Telegram Bot API + Google Calendar |
| 41 | 🤖 Bot IA Reservas Telegram | EVENT_TRIGGERED | Automatizaciones | Automatizaciones y bots | ADMIN, SUPPORT | CONECTADO_SIN_PROBAR | Stripe + WhatsApp Business API + Telegram Bot API + Google Calendar |
| 42 | ⚖️ Solicitud GDPR Acceso u Olvido de Datos | EVENT_TRIGGERED | Seguridad y auditoría | Backups y seguridad | ADMIN, SUPPORT | BLOQUEADO | Airtable |
| 43 | 🛡️ Alerta Seguridad Acceso Sospechoso | EVENT_TRIGGERED | Seguridad y auditoría | Backups y seguridad | ADMIN, SUPPORT | BLOQUEADO | Ninguno detectado |
| 44 | 💳 Pago Confirmado Stripe → Cuota + Recibo | EVENT_TRIGGERED | Administración | Facturación y pagos | ADMIN, SUPPORT | BLOQUEADO | Airtable + Stripe |
| 45 | 🔄 Dunning Cobro Recurrente Stripe | EVENT_TRIGGERED | Administración | Facturación y pagos | ADMIN, SUPPORT | BLOQUEADO | Airtable + Stripe |
| 46 | 🔑 Email Recuperación de Contraseña SaaS | EVENT_TRIGGERED | Administración | Centro de automatizaciones | SUPPORT | NO_CONECTADO | Ninguno detectado |
| 47 | 📸 Instagram Borrador con IA | EVENT_TRIGGERED | Promociones y marketing | Centro de automatizaciones | SUPPORT | NO_APLICA | Airtable + Instagram |
| 48 | 🔔 Notificación Push PWA | EVENT_TRIGGERED | Comunicaciones | Centro Técnico | SUPPORT | NO_CONECTADO | Airtable + Stripe + WhatsApp Business API + Telegram Bot API + Google Calendar |
| 49 | 📝 Tally → API Reservas | EVENT_TRIGGERED | Automatizaciones | Automatizaciones y bots | ADMIN, SUPPORT | PENDIENTE_DE_CONFIRMAR | Stripe + WhatsApp Business API + Telegram Bot API + Google Calendar |
| 50 | 🗂️ Backup Plantilla Drive | DEVELOPMENT_QA | Seguridad y auditoría | Backups y seguridad | ADMIN, SUPPORT | BLOQUEADO | Google Drive |
