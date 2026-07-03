# CONFIGURACION CONCEPTUAL · Cliente deportivo

## Objetivo

Definir que datos debe tener cada cliente para adaptar el SaaS sin duplicar codigo ni crear una app nueva desde cero.

## Identidad del cliente

cliente:
  nombre_comercial: "Club Padel Demo"
  nombre_legal: ""
  ciudad: ""
  provincia: ""
  pais: "España"
  telefono: ""
  email: ""
  web: ""
  instagram: ""

## Marca

marca:
  logo: ""
  color_primario: "#b6ff00"
  color_secundario: "#2df5a3"
  color_fondo: "#07111f"
  estilo_visual: "premium deportivo"
  imagen_hero: ""
  imagen_sidebar: ""
  imagenes_galeria: []

## Servicios

servicios:
  tipo_principal: "reservas"
  recursos:
    - nombre: "Pista 1"
      tipo: "pista"
      activa: true
    - nombre: "Pista 2"
      tipo: "pista"
      activa: true

## Horarios

horarios:
  lunes_viernes: "08:00-23:00"
  sabado: "09:00-22:00"
  domingo: "09:00-14:00"

## Tarifas

tarifas:
  hora_valle: 12
  hora_punta: 20
  moneda: "EUR"
  politica_cancelacion: "Cancelacion gratuita hasta X horas antes"

## Comunicacion

comunicacion:
  email_confirmacion: true
  email_cancelacion: true
  recordatorios: true
  whatsapp_futuro: false

## Regla

Esta configuracion es conceptual. No debe convertirse todavia en codigo real hasta que la app este preparada para consumir configuracion por cliente.
