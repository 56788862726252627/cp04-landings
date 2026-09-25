# MAPA DE RIESGOS INICIAL · P1-02 DISPONIBILIDAD

## Riesgos a verificar antes de modificar

- Confundir UI mock con flujo real de disponibilidad.
- Romper la transición disponibilidad → reserva.
- Alterar estados compartidos de fecha, hora o pista.
- Cambiar datos mock creyendo que son datos reales.
- Modificar una pantalla experimental no usada en producción.
- Romper rutas o navegación del jugador.
- Alterar integraciones API o webhook existentes.
- Introducir inconsistencias entre disponibilidad visual y ocupación real.
- Mostrar horarios ocupados como disponibles.
- Permitir doble reserva por ausencia de bloqueo o revalidación.

## Regla

No modificar código hasta identificar la pantalla realmente renderizada y la fuente efectiva de disponibilidad.
