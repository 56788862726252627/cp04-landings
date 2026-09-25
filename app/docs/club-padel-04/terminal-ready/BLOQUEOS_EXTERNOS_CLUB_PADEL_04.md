# Bloqueos Externos — Club Pádel 04

Fecha: 2026-07-13

Formato por bloqueo: qué falta, quién lo hace, terminal/no terminal, tiempo
aproximado, % que representa sobre el 100% global del proyecto, cómo
desbloquearlo.

El % de cada bloqueo es una estimación relativa orientativa (suma
aproximada, no exacta) para priorizar, no una métrica certificada.

## WhatsApp Business

- Qué falta: cuenta WhatsApp Business API real, proveedor elegido, plantillas
  de mensaje aprobadas, número de teléfono verificado, consentimiento legal
  de los usuarios.
- Quién lo hace: cliente/agencia (alta de cuenta) + integrador técnico
  (configuración del proveedor).
- Terminal/no terminal: no terminal.
- Tiempo aproximado: 3-10 días hábiles (aprobación de Meta/proveedor suele ser
  el cuello de botella).
- % que representa: ~10%.
- Cómo desbloquearlo: elegir proveedor (ej. proveedor oficial de WhatsApp
  Business API), dar de alta el número, redactar y enviar plantillas a
  aprobación, luego configurar `WHATSAPP_PROVIDER_TOKEN` y
  `WHATSAPP_PHONE_NUMBER_ID` solo en el backend/Worker.

## Stripe

- Qué falta: cuenta Stripe real activada (KYC del club), definición de
  productos (reservas, bonos, membresías, torneos), claves reales.
- Quién lo hace: cliente (alta de cuenta y datos fiscales) + integrador
  técnico (implementación backend de checkout/webhooks).
- Terminal/no terminal: no terminal (alta de cuenta); parcialmente terminal
  la implementación de código, pero está fuera de alcance de esta fase por
  restricción explícita.
- Tiempo aproximado: 1-5 días (activación de cuenta) + implementación técnica
  aparte.
- % que representa: ~10%.
- Cómo desbloquearlo: crear cuenta Stripe del club, completar verificación,
  definir catálogo de productos, guardar `STRIPE_SECRET_KEY` y
  `STRIPE_WEBHOOK_SECRET` solo server-side.

## Airtable

- Qué falta: base real creada, esquema exacto de las 10 tablas propuestas
  (`jugadores`, `reservas`, `pistas`, `pagos`, `torneos`, `ranking`,
  `incidencias`, `clientes`, `staff`, `logs`), credenciales.
- Quién lo hace: integrador técnico (crear base y tablas) + cliente (validar
  campos de negocio).
- Terminal/no terminal: mixto — el diseño de esquema puede refinarse en
  terminal (documentación), pero la creación de la base real y sus
  credenciales no.
- Tiempo aproximado: 3-5 h de configuración inicial.
- % que representa: ~8%.
- Cómo desbloquearlo: crear base en Airtable, replicar esquema documentado en
  `app/docs/integraciones.md`, generar API key con permisos mínimos, guardar
  `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_RESERVAS_TABLE` solo en
  backend/Worker.

## Fotos reales

- Qué falta: sesión fotográfica real del club (pistas, recepción, cafetería,
  torneos, instalaciones) para sustituir la galería honesta actual (que hoy
  no usa fotos falsas, pero tampoco tiene fotos reales del club concreto).
- Quién lo hace: cliente (organizar sesión) o agencia (si se ofrece como
  servicio adicional).
- Terminal/no terminal: no terminal.
- Tiempo aproximado: 1 sesión de 2-4 h + edición.
- % que representa: ~5%.
- Cómo desbloquearlo: agendar sesión fotográfica, recibir imágenes, subirlas a
  las variables `VITE_CP04_PUBLIC_GALLERY_*` ya preparadas.

## Google Drive manual

- Qué falta: estructura real de carpetas (documentación, backups, blueprints,
  informes, archivos de marca) y credenciales de servicio.
- Quién lo hace: integrador técnico + cliente (organización de carpetas).
- Terminal/no terminal: no terminal (creación real de la estructura y
  credenciales).
- Tiempo aproximado: 1-2 h.
- % que representa: ~3%.
- Cómo desbloquearlo: crear carpetas según casos de uso documentados en
  `app/docs/integraciones.md`, crear cuenta de servicio u OAuth, guardar
  `GOOGLE_DRIVE_CREDENTIALS` solo server-side.

## Apify / prospección real

- Qué falta: ejecución real de prospección de clubes/ayuntamientos objetivo
  usando el plan ya documentado en
  `app/projects/club-padel-04/apify-prospeccion/APIFY_PROSPECCION_PLAN.md`.
- Quién lo hace: agencia (comercial) con soporte técnico para ejecutar los
  actors de Apify.
- Terminal/no terminal: parcialmente terminal (ejecución de scripts/actors),
  pero requiere cuenta Apify real y presupuesto — fuera de alcance de esta
  fase.
- Tiempo aproximado: 1-2 días para primera tanda de prospección.
- % que representa: ~5%.
- Cómo desbloquearlo: activar cuenta Apify, ejecutar el plan ya documentado,
  cualificar leads resultantes.

## Deploy / dominio

- Qué falta: dominio real (hoy `https://clubpadel04.example/` es
  placeholder), hosting de frontend (Cloudflare Pages/Vercel/Netlify),
  despliegue del Worker con `wrangler deploy`, `ALLOWED_ORIGIN` configurado.
- Quién lo hace: integrador técnico (con acceso a cuenta de hosting/DNS del
  cliente o de la agencia).
- Terminal/no terminal: parcialmente terminal (comandos de build/deploy ya
  documentados en `app/docs/deployment.md`), pero requiere credenciales de
  hosting y DNS reales que no están disponibles en esta sesión.
- Tiempo aproximado: 2-4 h.
- % que representa: ~7%.
- Cómo desbloquearlo: comprar/configurar dominio, `npm run build`, desplegar
  `dist/`, `wrangler deploy` del Worker, configurar `ALLOWED_ORIGIN` exacto.

## Cliente / piloto real

- Qué falta: un club o ayuntamiento real que firme como piloto, con datos
  reales (nombre, dirección, contacto, precios reales).
- Quién lo hace: agencia (comercial/ventas), apoyado en
  `DEMO_COMERCIAL_CLUB_PADEL_04.md` y en el Pilot Client Readiness Pack ya
  existente (`audit/customer-success/`, sesión previa).
- Terminal/no terminal: no terminal.
- Tiempo aproximado: variable (semanas), depende del ciclo comercial.
- % que representa: ~15% (el bloqueo de mayor impacto: sin cliente real, el
  resto de integraciones no tienen datos reales que procesar).
- Cómo desbloquearlo: ejecutar prospección (Apify), aplicar el guion de demo
  comercial, usar el scorecard de cualificación de cliente piloto ya
  existente en `audit/customer-success/` para decidir GO/NO-GO.

## Resumen

El bloqueo más determinante no es técnico: es la falta de **cliente piloto
real**, porque sin él el resto de integraciones (WhatsApp, Stripe, Airtable,
fotos, dominio) no tienen sobre qué datos reales operar. La vía de mayor
impacto/menor esfuerzo desde terminal es reforzar la documentación de venta y
QA (ya hecho en esta fase) para acelerar el cierre del piloto.
