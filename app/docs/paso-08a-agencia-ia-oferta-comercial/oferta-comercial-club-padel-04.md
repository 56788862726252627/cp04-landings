# Oferta comercial — Club Pádel 04 (Paso 08A)

**Estado: DOCUMENTO COMERCIAL. No sustituye ni modifica la documentación técnica de los Pasos 07A-07R.** Cualquier cifra de estado técnico citada aquí (40/50, Airtable 429, PR #36) se toma de `app/docs/paso-07r-estado-global/estado-global-07a-07q.md`, verificado en código en esa misma sesión.

**Fecha:** 2026-07-20

---

## Nombre del producto

**Club Pádel 04** — SaaS de gestión integral para clubes de pádel, con automatizaciones conectadas a Make/Airtable.

## Resumen en 1 frase

Una app de gestión de club de pádel (reservas, jugadores, torneos, comunicaciones y automatizaciones) que un club puede empezar a usar hoy como demo avanzada, con un camino claro hacia producción real cuando se complete la validación técnica pendiente.

## Problema que resuelve

Los clubes de pádel medianos y pequeños hoy gestionan reservas, altas/bajas de socios, listas de espera, cierres de pista y comunicaciones con una mezcla de WhatsApp manual, hojas de Excel, recepción telefónica y, en el mejor de los casos, una plataforma genérica de reservas (tipo Playtomic) que no cubre gestión interna, automatizaciones ni backoffice. Esto genera: tiempo de recepción perdido en tareas repetitivas, errores humanos en reservas/altas, jugadores sin plaza que no se enteran cuando queda un hueco libre, y cero visibilidad de negocio (KPIs, NPS, impagos) para el gerente del club.

## Público objetivo

- Clubes de pádel independientes (1-8 pistas) sin sistema de gestión propio.
- Cadenas pequeñas de clubes que hoy usan Excel/WhatsApp o una plataforma de reservas sin backoffice.
- Gerentes/propietarios de club que quieren digitalizar sin depender de un desarrollo a medida caro.

## Propuesta de valor

- Una sola app para reservas, jugadores, torneos, comunicación y automatizaciones — no una plataforma de reservas suelta más un Excel más un grupo de WhatsApp.
- Roles diferenciados (jugador, recepción, dirección, soporte técnico) con permisos reales, no una única cuenta de administrador compartida.
- Automatizaciones ya diseñadas (Make) para las tareas repetitivas de un club: recordatorios, lista de espera, cierres temporales, comunicaciones de ciclo de socio.
- Base construida para poder replicarse a otros clubes/sectores sin empezar de cero (ver `roadmap-comercial-agencia-ia.md`).

## Funcionalidades principales (validadas visualmente en `localhost:5175`)

- Reservar / Reservas (consulta, filtros, listado real).
- Alta de jugador / Baja de jugador (con opción de promoción desde lista de espera).
- Reprogramar reserva / Cancelar reserva.
- Cierre temporal de pistas (mantenimiento, lluvia, evento, obra, etc.).
- Lista de espera de jugadores.
- Torneos, Ranking, Comunidad (módulos sociales).
- Panel Admin y Centro Técnico (para dirección y soporte técnico).
- Login real con correo y contraseña, recuperación de contraseña, roles PLAYER/STAFF/ADMIN/SUPPORT.

## Automatizaciones incluidas (representadas en la app, ver estado real más abajo)

- Control QR / Accesos.
- Pistas libres y recordatorios (alertas de hueco libre, recordatorios 24h/2h, seguimiento de no-shows).
- Comunicaciones y ciclo de socio (reactivación de inactivos, felicitaciones, recordatorio de cuota, bienvenida, onboarding, referidos, emparejamiento sin pareja).
- Calendario y disponibilidad (sincronización externa, predicción de ocupación).
- Dashboard KPI y NPS (para dirección).
- Backups y seguridad (backups periódicos, solicitudes GDPR, alertas de seguridad).
- Facturación y pagos, Automatizaciones y bots (WhatsApp/Telegram) — **preparados visualmente, pendientes de activar la integración externa real** (ver límites).

## Módulos de app incluidos

23 módulos de sidebar en total, repartidos por rol (jugador ve 6, recepción ve 16, dirección ve 20, soporte técnico ve los 23) — detalle completo en `app/docs/paso-07r-estado-global/estado-global-07a-07q.md`, sección C.

## Qué diferencia a Club Pádel 04 de una web normal

Una web de club normal es un escaparate estático (horarios, fotos, formulario de contacto). Club Pádel 04 es una aplicación operativa real: el jugador reserva y consulta su propia actividad, la recepción gestiona altas/bajas/incidencias desde la misma herramienta, y la dirección tiene métricas — todo con control de acceso por rol, no una web informativa.

## Qué diferencia a Club Pádel 04 de solo usar Playtomic/Excel/WhatsApp manual

- **Frente a Playtomic (u otra plataforma de reservas genérica):** Playtomic resuelve la reserva de pista, no la gestión interna del club (altas, bajas, lista de espera con promoción automática, cierres temporales, KPIs de dirección, backoffice de soporte técnico). Club Pádel 04 incluye todo eso en la misma herramienta, con automatizaciones diseñadas específicamente para el ciclo de vida del socio.
- **Frente a Excel + WhatsApp manual:** elimina el trabajo repetitivo de recepción (avisos de hueco libre, recordatorios, seguimiento de impagos) y sustituye hojas de cálculo dispersas por una única fuente de verdad con roles y permisos.
- **Frente a no tener nada:** aporta una imagen profesional y una base de datos de socios estructurada desde el primer día.

## Estado real actual (honesto)

- **Demo funcional avanzada**, validada visualmente en `localhost:5175` con los 4 roles (PLAYER, STAFF, ADMIN, SUPPORT).
- **40/50 flujos de automatización Make representados** en la app (visual/preparado o con integración real), 10/50 documentados con motivo de por qué no se han representado todavía.
- **PR #36 sigue en `draft`** — el trabajo de este bloque aún no se ha fusionado a la rama de release.
- **No hay validación real end-to-end** de los flujos de escritura (crear reserva, alta/baja de jugador, cierre temporal) contra Make/Airtable en producción — bloqueado por Airtable 429 (cuota agotada). Existe un runbook completo y ordenado para ejecutar esa validación en cuanto la cuota se renueve (`app/docs/paso-07q-pruebas-post-airtable-429/`).

## Límites actuales por Airtable 429

- Ningún flujo de escritura (reserva, alta, baja, cierre temporal) se ha probado contra Airtable real en esta sesión de trabajo — el código está construido y sus tests unitarios pasan, pero la prueba real de extremo a extremo está pendiente.
- Los módulos de "Comunicaciones", "Facturación y pagos" y "Automatizaciones y bots" son preparación visual: no envían ningún mensaje, cobro ni comunicación real todavía (Stripe y WhatsApp/Telegram no están conectados).
- Ningún dato mostrado en Dashboard KPI/NPS proviene de datos reales de producción.

## Condiciones para venderlo como demo, piloto o instalación real

- **Como demo comercial (hoy mismo):** sí, se puede mostrar en vivo con roles reales y explicar el roadmap — siempre con el lenguaje honesto de "demo funcional avanzada, pendiente de validación real E2E tras renovación de cuota Airtable". Nunca decir "ya está en producción" o "ya factura clientes reales".
- **Como piloto con un club real (primeros socios reales):** requiere primero completar el runbook de validación post-Airtable 429 (Paso 07Q) con resultado positivo, y decidir con el club qué datos/flujos se activan primero (recomendado: reservas + alta/baja de jugador antes que facturación/WhatsApp).
- **Como instalación de producción completa:** requiere, además de lo anterior, activar las integraciones externas pendientes (Stripe si el club cobra cuotas desde la app, WhatsApp Business API si se quiere automatizar comunicación, Google Calendar si el club lo pide) y sacar PR #36 de `draft` con autorización explícita del propietario del proyecto.
