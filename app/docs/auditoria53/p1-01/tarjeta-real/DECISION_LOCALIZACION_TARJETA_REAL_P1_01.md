# DECISIÓN DE LOCALIZACIÓN · TARJETA REAL P1-01

## Referencias

- login.title: línea 7852
- candidato minHeight:138: línea 8013
- distancia contextual: 161 líneas

## Hallazgo

La pantalla real del login no usa un ROLES.map posterior al bloque login.title.

La búsqueda correcta debe basarse en:

- proximidad al login real;
- JSX visible;
- textos de las tarjetas;
- eventos onClick;
- estilos inline reales.

## Regla

No modificar src/App.jsx hasta confirmar si minHeight:138 pertenece realmente a una tarjeta de selección de rol visible en la pantalla inicial.
