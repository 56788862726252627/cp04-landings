# MATRIZ REAL VS EXPERIMENTAL · P1-02

## Criterio de aplicación real

Una implementación solo se considerará activa si puede demostrarse la cadena:

main.jsx → componente importado → render → navegación → estado visible para usuario.

## App principal

- Debe verificarse desde main.jsx.
- Debe verificarse la pantalla realmente renderizada.
- Debe verificarse la navegación del jugador.

## Módulo experimental

- Su presencia en src no demuestra uso real.
- Debe existir importación o conexión indirecta demostrable.
- Debe existir render efectivo.
- Debe existir una ruta o evento que permita al usuario acceder.

## Regla

No modificar código hasta cerrar esta decisión.
