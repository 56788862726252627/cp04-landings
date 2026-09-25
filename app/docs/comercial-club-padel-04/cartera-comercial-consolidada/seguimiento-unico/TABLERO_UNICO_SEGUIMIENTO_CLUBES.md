# TABLERO ÚNICO DE SEGUIMIENTO DE CLUBES · Club Pádel 04

## Objetivo

Mantener un único punto de control para saber qué se ha preparado, qué se ha enviado realmente, qué respuesta existe y cuál es la siguiente acción de cada club.

## Regla principal

Este tablero no debe inventar estados.

Solo se actualiza con hechos confirmados.

## Tablero maestro

| Prioridad | Club | Preparado | Canal verificado | Enviado real | Respuesta | Seguimiento | Estado operativo | Próxima acción |
|---|---|---|---|---|---|---|---|---|
| 1 | La Quinta | Sí | Pendiente revisar | Pendiente confirmar | Pendiente | Pendiente | Revisar estado real | Consolidar hechos |
| 2 | Club Matagrande | Sí | Pendiente | No | No aplica | No | Preparado, no contactado | Verificar canal o pausar |
| 3 | Club Pádel Archidona | Parcial | Pendiente | No | No aplica | No | Candidato | Evaluar preparación |
| 4 | Pádel Campillos X3 | Parcial | Pendiente | No | No aplica | No | Candidato | Mantener en cartera |
| 5 | Pádel Club Lucena | Parcial | Pendiente | No | No aplica | No | Candidato | Mantener en cartera |

## Estados permitidos

- Candidato.
- Preparado, no contactado.
- Enviado sin respuesta.
- Respondido.
- Seguimiento activo.
- Demo propuesta.
- Demo agendada.
- Negociación.
- Pausado.
- Rechazado.

## Estados prohibidos sin evidencia

No usar:

- enviado probable
- posiblemente contactado
- quizás respondió
- seguimiento supuesto
- interesado sin confirmación

## Control de seguimiento

Un seguimiento solo puede activarse si:

1. Existe envío real confirmado.
2. Existe fecha de envío.
3. Existe canal real registrado.
4. Ha pasado el tiempo definido.
5. No ha llegado respuesta antes.

## Regla final

Un solo club, un solo estado real y una sola próxima acción registrada.
