# PROPUESTA DE CAMBIO MÍNIMO · P1-01

## Objetivo

Realizar una primera mejora visual pequeña y reversible sobre la pantalla inicial.

## Criterio

No realizar una transformación estructural amplia en el primer parche.

Primero se propone intervenir únicamente sobre el área visual de selección de roles.

## Cambio candidato

### Tarjetas de roles

Evaluar reducir:

- altura mínima actual: 138 px;
- objetivo inicial candidato: 118–124 px.

Finalidad:

- reducir masa vertical;
- mostrar más fondo;
- mantener legibilidad;
- conservar la misma lógica y estructura.

### Contenedor general

No modificar todavía hasta comprobar con QA real el efecto de compactar las tarjetas.

### Overlay

No modificar todavía.

### Formularios

Prohibido modificar en esta primera iteración.

## Estrategia

1. parche mínimo;
2. build;
3. diff estricto;
4. QA visual real;
5. comparar captura anterior/nueva;
6. decidir si avanzar a panel y overlay.

## Riesgo

Bajo, siempre que la modificación se limite por contexto exacto al bloque ROLES.map.
