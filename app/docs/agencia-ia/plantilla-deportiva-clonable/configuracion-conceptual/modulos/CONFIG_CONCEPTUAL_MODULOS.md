# CONFIGURACION CONCEPTUAL · Modulos activos

## Objetivo

Definir que modulos pueden activarse o desactivarse por cliente sin duplicar codigo.

## Modulos base

modulos_base:
  inicio: true
  reservas: true
  perfil: true
  login: true
  recuperacion_password: true
  soporte: true

## Modulos deportivos opcionales

modulos_deportivos:
  torneos: true
  ranking: true
  emparejamientos: true
  eventos: true
  clases: false
  bonos: false

## Modulos administrativos

modulos_admin:
  dashboard: true
  usuarios: true
  reservas_admin: true
  metricas: true
  incidencias: true
  configuracion: true

## Modulos premium

modulos_premium:
  pagos: false
  agentes_ia: false
  whatsapp: false
  campañas: false
  informes_avanzados: false
  multi_sede: false

## Reglas de activacion

- Starter: modulos base + reservas simples.
- Pro: base + admin + automatizaciones principales.
- Premium: todo lo anterior + agentes IA, pagos y automatizaciones avanzadas.
