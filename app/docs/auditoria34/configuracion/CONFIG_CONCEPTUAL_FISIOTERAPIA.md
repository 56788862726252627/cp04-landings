# CONFIGURACIÓN CONCEPTUAL · Fisioterapia

## Identidad

cliente:
  nombre_comercial: "Clínica Fisio Demo"
  sector: "fisioterapia"
  ciudad: ""
  provincia: ""
  telefono: ""
  email: ""
  instagram: ""
  web: ""

## Marca

marca:
  logo: ""
  color_primario: ""
  color_secundario: ""
  estilo_visual: "profesional sanitario premium"
  imagen_principal: ""
  imagenes_servicios: []

## Servicios

servicios:
  - nombre: "Sesión fisioterapia general"
    duracion: 45
    precio: 40
  - nombre: "Fisioterapia deportiva"
    duracion: 60
    precio: 50
  - nombre: "Rehabilitación"
    duracion: 60
    precio: 45
  - nombre: "Masaje terapéutico"
    duracion: 45
    precio: 35
  - nombre: "Valoración inicial"
    duracion: 60
    precio: 50

## Profesionales

profesionales:
  - nombre: "Fisioterapeuta 1"
    especialidad: "Fisioterapia general"
    activo: true
  - nombre: "Fisioterapeuta 2"
    especialidad: "Fisioterapia deportiva"
    activo: true

## Citas

citas:
  tipo: "cita"
  duracion_variable: true
  requiere_profesional: true
  requiere_servicio: true
  recordatorios: true
  cancelacion: true
  seguimiento_sesion: true

## Bonos

bonos:
  activo: true
  ejemplos:
    - nombre: "Bono 5 sesiones"
      sesiones: 5
      precio: 180
    - nombre: "Bono 10 sesiones"
      sesiones: 10
      precio: 340

## Automatizaciones

automatizaciones:
  alta_paciente: true
  confirmacion_cita: true
  cancelacion_cita: true
  recordatorio_cita: true
  seguimiento_post_sesion: true
  aviso_bono_bajo: true
  solicitud_resena: true

## Regla

Configuración conceptual.  
No se implementa todavía en código ni se manejan datos médicos sensibles reales.
