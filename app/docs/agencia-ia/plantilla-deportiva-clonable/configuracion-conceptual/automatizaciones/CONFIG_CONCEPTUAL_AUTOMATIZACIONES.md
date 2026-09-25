# CONFIGURACION CONCEPTUAL · Automatizaciones por cliente

## Objetivo

Definir que automatizaciones se reutilizan en cada cliente y cuales se activan segun paquete.

## Automatizaciones base

automatizaciones_base:
  alta_usuario: true
  confirmacion_reserva: true
  cancelacion_reserva: true
  alerta_error_interno: true

## Automatizaciones Pro

automatizaciones_pro:
  ocupacion_semanal: true
  recordatorio_reserva: true
  email_bienvenida: true
  seguimiento_cliente: true
  informe_basico: true

## Automatizaciones Premium

automatizaciones_premium:
  promociones: true
  pistas_libres: true
  encuestas_nps: true
  campañas_segmentadas: true
  agentes_ia: true
  informes_avanzados: true
  pagos: true
  whatsapp_business: false

## Mapeo con Make

Cada automatizacion debe documentar:

- nombre del flujo
- estado
- webhook
- base de datos usada
- campos requeridos
- email usado
- dependencias
- si esta probado
- si es reutilizable
- si es especifico del cliente

## Regla

No duplicar flujos Make sin revisar si ya existe uno equivalente.
