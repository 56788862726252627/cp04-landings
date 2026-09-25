# DECISIÓN FINAL · IMPLEMENTACIÓN ACTIVA P1-02

## Resultado

La implementación activa de disponibilidad y reserva visible para el usuario se encuentra dentro de `src/App.jsx`.

## Evidencia

- `src/main.jsx` renderiza la aplicación principal.
- `src/App.jsx` contiene el flujo visible de reservas.
- Se localizaron dentro de App.jsx:
  - selección de fecha;
  - selección de hora;
  - selección de pista;
  - duración;
  - validación de disponibilidad;
  - resumen previo;
  - navegación hacia reservas;
  - flujo por pasos.
- No se demostró render activo del módulo `src/experimental/reservas`.
- La referencia encontrada al módulo experimental pertenece a documentación interna.

## Decisión

P1-02 se auditará sobre la implementación real existente en `src/App.jsx`.

El módulo experimental no se modificará ni se integrará durante P1-02 salvo nueva evidencia técnica.

## Frontera

P1-02 cubre consulta, selección y visualización de disponibilidad.

La creación definitiva, envío, persistencia y confirmación de reserva pertenecen a P1-03.

## Estado

DECISIÓN TÉCNICA CERRADA.
