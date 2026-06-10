# Integraciones SaaS

## Principio De Seguridad

El frontend nunca debe llamar directamente a Make, Airtable, Stripe, WhatsApp, Google Calendar ni Google Drive con credenciales privadas.

Flujo esperado para reservas:

```text
Frontend React -> /api/reservas o Worker -> Make -> Airtable / notificaciones / otros servicios
```

El webhook real de Make debe vivir solo en el Worker/backend como `MAKE_RESERVAS_WEBHOOK`.

## Estados

- Activa: ya conectada y operativa en producción.
- Preparada: estructura creada, pendiente de credenciales/configuracion/despliegue.
- Pendiente de credenciales: requiere secretos privados.
- Pendiente de despliegue: requiere publicar o configurar infraestructura.

## Make

Estado actual: preparada, pendiente de credenciales y despliegue.

Uso previsto:

- Recibir solicitudes desde el Worker de reservas.
- Enrutar reservas hacia Airtable o base de datos.
- Lanzar notificaciones.
- Orquestar automatizaciones internas.

Variables privadas:

- `MAKE_RESERVAS_WEBHOOK`
- `ALLOWED_ORIGIN`

Nunca colocar el webhook real en frontend, `.env` con prefijo `VITE_`, React, HTML ni documentación pública con valores reales.

## Airtable

Estado actual: preparada, pendiente de credenciales y esquema real.

Tablas necesarias propuestas:

- `jugadores`: perfil, nivel, contacto autorizado, estado.
- `reservas`: fecha, hora, pista, duracion, estado, precio, jugador, origen.
- `pistas`: nombre, tipo, estado, reglas, mantenimiento.
- `pagos`: reserva, importe, metodo, estado, referencia de proveedor.
- `torneos`: nombre, fechas, categoria, estado, plazas.
- `ranking`: jugador, puntuacion, categoria, victorias, derrotas.
- `incidencias`: reserva, tipo, prioridad, estado, responsable.
- `clientes`: datos comerciales autorizados, etiquetas, consentimiento.
- `staff`: usuario, rol, permisos, estado.
- `logs`: origen, evento, severidad, payload reducido, fecha.

Variables privadas:

- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_RESERVAS_TABLE`

Antes de activar escrituras hay que definir nombres exactos de tablas/campos, tipos y reglas de duplicados.

## Stripe

Estado actual: pendiente de credenciales e implementacion backend.

Casos preparados:

- Pagos de reservas.
- Bonos.
- Membresias.
- Inscripciones a torneos.
- Facturacion.

Variables privadas futuras:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

El frontend solo debe recibir claves publicables si se integra Stripe.js y nunca secretos.

## WhatsApp

Estado actual: pendiente de proveedor, credenciales y consentimiento.

Casos preparados:

- Confirmaciones.
- Recordatorios.
- Cancelaciones.
- Reprogramaciones.
- Campanas autorizadas.
- Atencion al cliente.

Variables privadas futuras:

- `WHATSAPP_PROVIDER_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID` o equivalente del proveedor.

## Google Calendar

Estado actual: pendiente de credenciales y reglas de sincronizacion.

Casos preparados:

- Sincronizacion de reservas.
- Disponibilidad.
- Eventos.
- Torneos.

Variable privada futura:

- `GOOGLE_CALENDAR_CREDENTIALS`

## Google Drive

Estado actual: pendiente de credenciales y estructura documental.

Casos preparados:

- Documentacion.
- Backups.
- Blueprints.
- Informes.
- Archivos de marca.

Variable privada futura:

- `GOOGLE_DRIVE_CREDENTIALS`
