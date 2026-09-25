# FRONTERA FUNCIONAL · P1-02 DISPONIBILIDAD → P1-03 RESERVA

## Objetivo

Separar con precisión qué pertenece a disponibilidad y qué pertenece al proceso posterior de reserva.

## P1-02 debe cubrir

- elección o consulta de fecha;
- elección o consulta de pista;
- visualización de horarios;
- estado disponible u ocupado;
- selección de slot;
- actualización visual de disponibilidad;
- claridad de navegación;
- consistencia responsive;
- comprensión del estado de ocupación.

## P1-03 debe cubrir después

- creación de la reserva;
- confirmación del jugador;
- envío de payload;
- validación definitiva antes de reservar;
- errores de creación;
- persistencia;
- conexión con backend o webhook;
- resultado de reserva.

## Regla

No mezclar cambios de creación de reserva dentro de P1-02.
