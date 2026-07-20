| Área | Flujo | Módulo / ruta | Roles autorizados | Estado | Webhook | Interfaz | Contrato | E2E |
|---|---|---|---|---|---|---|---|---|
| Acceso y QR | 🔐 Control Acceso QR | Control QR / Accesos (`control_qr`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | Sí | Sí | Sí | No |
| Acceso y QR | 🔑 Generación QR Acceso | Control QR / Accesos (`control_qr`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | Sí | Sí | Sí | No |
| Administración | 💰 Facturación y Cobro | Facturación y pagos (`facturacion_pagos`) | ADMIN, SUPPORT | Preparado | Sí | Sí | Sí | No |
| Administración | 💳 Pago Confirmado Stripe → Cuota + Recibo | Facturación y pagos (`facturacion_pagos`) | ADMIN, SUPPORT | Bloqueado externamente | Sí | Sí | Sí | No |
| Administración | 💸 Escalado Impagos | Facturación y pagos (`facturacion_pagos`) | ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Administración | 🔄 Dunning Cobro Recurrente Stripe | Facturación y pagos (`facturacion_pagos`) | ADMIN, SUPPORT | Bloqueado externamente | Sí | Sí | Sí | No |
| Administración | 🔑 Email Recuperación de Contraseña SaaS | Centro de automatizaciones (`flujos_make`) | SUPPORT | Planificado | Sí | No | No | No |
| Automatizaciones | 🎧 Atención Socio WhatsApp FAQ | Automatizaciones y bots (`automatizaciones_bots`) | ADMIN, SUPPORT | Preparado | Sí | Sí | Sí | No |
| Automatizaciones | 🎯 Campaña Flash WhatsApp | Automatizaciones y bots (`automatizaciones_bots`) | ADMIN, SUPPORT | Preparado | Sí | Sí | Sí | No |
| Automatizaciones | 📝 Tally → API Reservas | Automatizaciones y bots (`automatizaciones_bots`) | ADMIN, SUPPORT | Preparado | Sí | Sí | Sí | No |
| Automatizaciones | 🤖 Bot IA Reservas Telegram | Automatizaciones y bots (`automatizaciones_bots`) | ADMIN, SUPPORT | Preparado | Sí | Sí | Sí | No |
| Automatizaciones | 🤖 Bot IA Reservas WhatsApp | Automatizaciones y bots (`automatizaciones_bots`) | ADMIN, SUPPORT | Preparado | Sí | Sí | Sí | No |
| Comunicaciones | 💬 Chatbot Web Reservas | Centro de automatizaciones (`flujos_make`) | SUPPORT | Planificado | Sí | No | No | No |
| Comunicaciones | 🔔 Notificación Push PWA | Centro Técnico (`flujos_make`) | SUPPORT | Preparado | Sí | No | Sí | No |
| Informes | 📈 Predicción Ocupación | Calendario y disponibilidad (`calendario_disponibilidad`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Informes | 📊 Análisis NPS Semanal | Dashboard KPI y NPS (`dashboard_kpi`) | ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Informes | 📊 Informe Mensual | Dashboard KPI y NPS (`dashboard_kpi`) | ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Informes | 📊 Panel KPI Semanal | Dashboard KPI y NPS (`dashboard_kpi`) | ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Informes | 📋 Dashboard Ejecutivo Diario | Dashboard KPI y NPS (`dashboard_kpi`) | ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Jugadores | ❄️ Congelación + Reactivación Membresía | Comunicaciones y ciclo de socio (`comunicaciones_socio`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Jugadores | ❌ Baja de Jugador + Promoción | Baja de jugador (`baja_jugador`) | STAFF, ADMIN, SUPPORT | Preparado | Sí | Sí | Sí | No |
| Jugadores | 🎁 Bienvenida Nuevo Socio | Comunicaciones y ciclo de socio (`comunicaciones_socio`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Jugadores | 🎁 Programa de Referidos | Comunicaciones y ciclo de socio (`comunicaciones_socio`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Jugadores | 🎂 Felicitación Cumpleaños | Comunicaciones y ciclo de socio (`comunicaciones_socio`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Jugadores | 🎾 Alta de Jugador | Alta de jugador (`alta_jugador`) | STAFF, ADMIN, SUPPORT | Operativo | Sí | Sí | Sí | Sí |
| Jugadores | 👥 Emparejamiento Sin Pareja | Comunicaciones y ciclo de socio (`comunicaciones_socio`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Jugadores | 💳 Recordatorio Cuota Mensual | Comunicaciones y ciclo de socio (`comunicaciones_socio`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Jugadores | 📋 Gestión Lista de Espera | Lista de espera (`lista_espera`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Jugadores | 📧 Monitor Prueba Gratuita | Comunicaciones y ciclo de socio (`comunicaciones_socio`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Jugadores | 🔁 Onboarding Secuencial | Comunicaciones y ciclo de socio (`comunicaciones_socio`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Jugadores | 🔁 Reactivación Inactivos 30d | Comunicaciones y ciclo de socio (`comunicaciones_socio`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Promociones y marketing | 📸 Instagram Borrador con IA | Centro de automatizaciones (`flujos_make`) | SUPPORT | Planificado | Sí | No | No | No |
| Reservas | ⚡ Recordatorio 2h Antes | Pistas libres y recordatorios (`pistas_recordatorios`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Reservas | 🏟️ Cierre Temporal de Pistas | Cierre temporal (`cierre_pistas`) | STAFF, ADMIN, SUPPORT | Preparado | Sí | Sí | Sí | No |
| Reservas | 📡 API Reservas | Reservar / Reservas (`reservas`) | PLAYER, STAFF, ADMIN, SUPPORT | Bloqueado externamente | Sí | Sí | Sí | No |
| Reservas | 🔔 Recordatorio 24h Antes | Pistas libres y recordatorios (`pistas_recordatorios`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Reservas | 🗓️ Sincronización Multi-Calendario | Calendario y disponibilidad (`calendario_disponibilidad`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Reservas | 🚨 Alerta Pistas Libres + Flash Promo | Pistas libres y recordatorios (`pistas_recordatorios`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Reservas | 🚫 Seguimiento No-Show | Pistas libres y recordatorios (`pistas_recordatorios`) | STAFF, ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Seguridad y auditoría | ⚖️ Solicitud GDPR Acceso u Olvido de Datos | Backups y seguridad (`backups_seguridad`) | ADMIN, SUPPORT | Bloqueado externamente | Sí | Sí | Sí | No |
| Seguridad y auditoría | 🔄 Backup Semanal | Backups y seguridad (`backups_seguridad`) | ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Seguridad y auditoría | 🗂️ Backup Plantilla Drive | Backups y seguridad (`backups_seguridad`) | ADMIN, SUPPORT | Bloqueado externamente | No | Sí | Sí | No |
| Seguridad y auditoría | 🛡️ Alerta Seguridad Acceso Sospechoso | Backups y seguridad (`backups_seguridad`) | ADMIN, SUPPORT | Bloqueado externamente | Sí | Sí | Sí | No |
| Soporte | ⚠️ Alerta Crítica Fallos Make | Centro de automatizaciones (`flujos_make`) | SUPPORT | Planificado | No | No | No | No |
| Soporte | 🗺️ Mapa de Flujos | Centro de automatizaciones (`flujos_make`) | SUPPORT | Planificado | No | No | No | No |
| Torneos y ranking | ⭐ Encuesta Post-Partido | Centro de automatizaciones (`flujos_make`) | SUPPORT | Planificado | No | No | No | No |
| Torneos y ranking | 🏅 Resultados y Clasificación | Centro de automatizaciones (`flujos_make`) | SUPPORT | Planificado | Sí | No | No | No |
| Torneos y ranking | 🏆 Cruces de Torneo | Centro de automatizaciones (`flujos_make`) | SUPPORT | Planificado | Sí | No | No | No |
| Torneos y ranking | 🏆 Reto 04 + Puntos | Centro de automatizaciones (`flujos_make`) | SUPPORT | Planificado | Sí | No | No | No |
| Torneos y ranking | 🏷️ Confirmación Inscripción Torneo | Centro de automatizaciones (`flujos_make`) | SUPPORT | Planificado | No | No | No | No |
