# RESULTADO DE SIMULACIÓN INICIAL · P1-01

## Resultado

La primera simulación fue abortada de forma segura.

## Motivo

El script tomó una aparición de `ROLES.map` ajena al bloque real del login.

Referencias observadas:

- `ROLES.map` detectado inicialmente alrededor de la línea 809.
- `login.title` real alrededor de la línea 7852.
- `minHeight:138` de la tarjeta candidata alrededor de la línea 8013.

La ventana contextual basada en el `ROLES.map` incorrecto no contenía `minHeight:138`.

## Seguridad

- `src/App.jsx` no fue modificado.
- No se aplicó parche real.
- No se modificó autenticación.
- No se modificaron roles.
- No se modificó recuperación de contraseña.
- No se modificó navegación.

## Decisión

La siguiente simulación debe localizar el bloque visual por proximidad al login real.
