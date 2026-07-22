# PLAN DE CAMBIO MÍNIMO REVERSIBLE · P1-01

## Regla principal

No rediseñar toda la pantalla.

Mejorar primero mediante composición.

## Orden de intervención

### Nivel 1

Ajustar encuadre del fondo.

### Nivel 2

Ajustar contraste.

### Nivel 3

Reposicionar o compactar selector de rol.

### Nivel 4

Ajustar responsive horizontal.

### Nivel 5

Solo si los cuatro pasos anteriores no son suficientes:

evaluar sustitución del activo visual.

## Validación obligatoria

Después de cualquier cambio:

- build
- acceso
- selección de rol
- navegación
- móvil
- tablet vertical
- tablet horizontal
- escritorio

## Rollback

Antes de modificar código se deberá crear:

- backup
- diff base
- commit limpio de diagnóstico
