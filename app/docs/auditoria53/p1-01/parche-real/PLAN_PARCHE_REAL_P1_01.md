# PLAN PARCHE REAL · P1-01 INICIO ANTEQUERA

## Objetivo

Mejorar la composición visual del inicio sin alterar autenticación, roles, recuperación de contraseña, navegación ni permisos.

## Cambios visuales permitidos

1. Ajustar ancho máximo del bloque principal.
2. Mejorar equilibrio entre fondo, Torcal y pista.
3. Reducir opacidad estructural donde sea seguro.
4. Compactar verticalmente tarjetas de rol.
5. Mejorar separación visual entre acceso real y acceso por roles.
6. Mantener legibilidad y contraste.
7. Mantener responsive móvil, tablet y escritorio.

## Áreas prohibidas

No modificar:

- confirmRoleAccess
- setPendingRole
- setRolePassword
- setRoleError
- recuperación de contraseña
- navegación
- permisos
- API
- localStorage
- sessionStorage
- lógica de autenticación

## Estrategia

El parche se aplicará sobre los nodos y estilos reales ya existentes.

No se usarán clases ficticias o no conectadas al JSX.

Antes de modificar:

- backup exacto
- árbol limpio
- build correcto
- diff limitado

Después de modificar:

- git diff --check
- búsqueda de cambios sensibles
- build
- QA visual en localhost:5174
- no commit hasta validación visual
