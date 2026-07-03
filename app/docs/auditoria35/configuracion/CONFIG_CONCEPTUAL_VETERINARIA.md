# CONFIGURACIÓN CONCEPTUAL · Veterinaria

## Identidad

cliente:
  nombre_comercial: "Clínica Veterinaria Demo"
  sector: "veterinaria"
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
  estilo_visual: "profesional cercano salud animal"
  imagen_principal: ""
  imagenes_servicios: []

## Servicios

servicios:
  - nombre: "Consulta general"
    duracion: 30
    precio: 35
  - nombre: "Vacunación"
    duracion: 20
    precio: 30
  - nombre: "Revisión anual"
    duracion: 45
    precio: 50
  - nombre: "Desparasitación"
    duracion: 20
    precio: 25
  - nombre: "Consulta cachorro"
    duracion: 45
    precio: 45

## Profesionales

profesionales:
  - nombre: "Veterinario 1"
    especialidad: "Medicina general"
    activo: true
  - nombre: "Veterinario 2"
    especialidad: "Vacunación y revisiones"
    activo: true

## Clientes

clientes:
  tipo: "propietario"
  datos_basicos: true
  mascotas_asociadas: true
  recordatorios: true

## Mascotas

mascotas:
  campos_base:
    - nombre
    - especie
    - raza
    - fecha_nacimiento_aproximada
    - propietario
    - notas_no_sensibles

## Citas

citas:
  tipo: "cita veterinaria"
  duracion_variable: true
  requiere_profesional: true
  requiere_servicio: true
  requiere_mascota: true
  recordatorios: true
  cancelacion: true

## Automatizaciones

automatizaciones:
  alta_cliente: true
  alta_mascota: true
  confirmacion_cita: true
  cancelacion_cita: true
  recordatorio_cita: true
  recordatorio_vacuna: true
  recordatorio_revision: true
  solicitud_resena: true

## Regla

Configuración conceptual.  
No se implementa todavía en código ni se manejan datos clínicos reales.
