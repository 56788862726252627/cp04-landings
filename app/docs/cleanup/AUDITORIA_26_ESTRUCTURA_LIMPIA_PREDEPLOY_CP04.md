# Club Pádel 04 · Auditoría 26 · Estructura limpia predeploy

## Estado

Estructura fuente preparada para predeploy.

## Objetivo

Confirmar que los backups internos antiguos se han movido fuera de carpetas fuente sin borrar nada y sin romper el build.

## Completado

- Backups antiguos detectados.
- Backups antiguos movidos fuera de src.
- Backups antiguos movidos fuera de worker-reservas/src.
- Archivo seguro creado.
- Limpieza verificada.
- Build correcto después de la limpieza.

## Carpetas fuente limpias

- src/
- worker-reservas/src/

## Archivo seguro

Los backups antiguos se conservan en:

- backups/archivo-backups-internos/src
- backups/archivo-backups-internos/worker-src

## Regla aplicada

No se ha borrado nada.

## Beneficio

La estructura queda más limpia para:

- deploy real
- revisión técnica
- auditorías futuras
- evitar confusión entre archivos activos y copias antiguas
- reducir riesgo de tocar archivos obsoletos

## Pendiente no bloqueante

- Optimizar bundle principal mayor de 500 kB.
- Revisar galería pesada si sigue afectando al tamaño total.
- Valorar code splitting cuando se pase a producción pública real.

## Estado recomendado

Proyecto preparado para continuar con predeploy real controlado.
