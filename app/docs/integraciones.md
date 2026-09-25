# Integraciones SaaS

## Principio De Seguridad

El frontend nunca debe llamar directamente a Make, Airtable, Stripe, WhatsApp, Google Calendar ni Google Drive con credenciales privadas.

Flujo esperado para reservas:

```text
Frontend React -> /api/reservas o Worker -> Make -> Airtable / notificaciones / otros servicios
```

El webhook real de Make debe vivir solo en el Worker/backend como `MAKE_RESERVAS_WEBHOOK`.

## Estados

Dos ejes distintos, para no mezclar "¿existe el código/credenciales?" con "¿se ha demostrado que funciona?". Ninguna integración se documenta como completa si no se ha demostrado (b) o (c).

**Disponibilidad de credenciales/código:**

- Activa: credenciales reales configuradas y código conectado.
- Preparada: estructura creada, pendiente de credenciales/configuracion/despliegue.
- Pendiente de credenciales: requiere secretos privados.
- Pendiente de despliegue: requiere publicar o configurar infraestructura.

**Nivel de verificación (se usa junto al estado anterior, nunca lo sustituye):**

- (a) Implementado: el código existe y se ejecuta.
- (b) Probado localmente: verificado contra el Worker/servicio real desde un entorno de desarrollo.
- (c) Probado en producción: verificado end-to-end con el despliegue real.
- (d) Bloqueado externamente: código/credenciales listos, pero un tercero externo (billing, aprobación, proveedor) impide la verificación.
- (e) Pendiente: sin trabajo iniciado o sin credenciales.

## Supabase (Autenticación)

Estado actual: **Activa**. Es la única integración con verificación (b) y (c) simultánea confirmada: autenticación real de usuarios, roles obtenidos del backend (`worker-reservas/auth/authorization.js`), gate de autorización server-side activo en producción (`CP04_ENFORCE_ROLE_GATES=true`).

Variables privadas (Worker, ya configuradas):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Variable pública (frontend, ver `.env.example`):

- `VITE_CP04_AUTH_MODE`

Ver `docs/auth-roles.md` para el detalle de roles y permisos, incluyendo el hueco de seguridad abierto conocido (tokens en `localStorage`).

## Make

Estado actual: **Activa** (credenciales reales configuradas: `MAKE_RESERVAS_WEBHOOK`).

Nivel de verificación: (a) implementado — el Worker reenvía cada `crear_reserva`/`reprogramar_reserva` al webhook de forma incondicional. (c) Prueba end-to-end en producción **no confirmada**: no hay una reserva real verificada de principio a fin, porque el paso previo (disponibilidad vía Airtable) está (d) bloqueado externamente por el límite de facturación de Airtable, lo que impide iniciar el flujo completo desde la interfaz hoy.

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

Estado actual: **mixto**, no se resume en un único estado.

- Lectura de disponibilidad: Activa, (a) implementada, (b) probada previamente, actualmente (d) bloqueada externamente por `PUBLIC_API_BILLING_LIMIT_EXCEEDED` en la cuenta de Airtable.
- Escritura directa desde el Worker: **no implementada por diseño** — `prepareAirtableWrite` (`worker-reservas/src/index.js`) es un stub que nunca llama a la API de Airtable (evita duplicados/bloqueos 403 en carrera con Make). La persistencia real de una reserva confirmada, si ocurre, depende del escenario de Make, fuera de este repositorio y sin verificación aquí.
- Resolver el límite de facturación restaura la lectura. No activa ninguna escritura directa desde el Worker, porque no existe hoy.

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
