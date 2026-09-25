# CONFIGURACION CONCEPTUAL · Deporte / tipo de centro

## Objetivo

Definir como cambia el lenguaje y los modulos segun el tipo de club deportivo.

## Padel

deporte:
  tipo: "padel"
  recurso: "pista"
  usuario: "jugador"
  reserva: "reserva"
  evento: "torneo"
  ranking: "ranking"
  nivel: "nivel de jugador"
  metricas:
    - "ocupacion por pista"
    - "reservas por hora"
    - "socios activos"
    - "torneos activos"

## Tenis

deporte:
  tipo: "tenis"
  recurso: "pista"
  usuario: "jugador"
  reserva: "reserva"
  evento: "torneo"
  ranking: "ranking"
  nivel: "nivel de jugador"

## Gimnasio

deporte:
  tipo: "gimnasio"
  recurso: "sala / clase"
  usuario: "socio"
  reserva: "clase"
  evento: "reto / evento"
  ranking: "progreso"
  nivel: "nivel de entrenamiento"

## Yoga / Pilates

deporte:
  tipo: "yoga_pilates"
  recurso: "clase / sala"
  usuario: "alumno / socio"
  reserva: "clase"
  evento: "taller"
  ranking: null
  nivel: "nivel de practica"

## Centro deportivo

deporte:
  tipo: "centro_deportivo"
  recurso: "instalacion"
  usuario: "usuario / socio"
  reserva: "reserva"
  evento: "actividad"
  ranking: "clasificacion opcional"

## Regla

El objetivo es que el SaaS cambie el lenguaje por configuracion y no por duplicacion de componentes.
