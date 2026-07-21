# DECISIÓN TÉCNICA PRE PARCHE · P1-01

## Situación confirmada

La pantalla inicial usa estilos inline reales dentro de App.jsx.

Los patrones visuales relevantes aparecen repetidos varias veces, por lo que no se permiten sustituciones globales simples.

## Estrategia aprobada

El cambio deberá hacerse por contexto exacto, actuando solamente sobre:

1. contenedor visual principal de login;
2. grid visual de roles;
3. tarjetas visuales de roles;
4. fondos de los bloques de presentación;
5. espaciados puramente visuales.

## Zonas prohibidas

No tocar:

- confirmRoleAccess;
- pendingRole;
- rolePassword;
- setRoleError;
- recuperación de contraseña;
- formularios onSubmit;
- navegación;
- permisos;
- API;
- localStorage;
- sessionStorage.

## Regla de ejecución

Antes de modificar App.jsx:

- comprobar HEAD limpio;
- crear backup;
- comprobar el número exacto de coincidencias;
- abortar ante cualquier ambigüedad.

Después:

- git diff --check;
- revisión de diff;
- detección de cambios sensibles;
- build;
- QA visual en navegador;
- QA responsive;
- commit solo tras aprobación.
