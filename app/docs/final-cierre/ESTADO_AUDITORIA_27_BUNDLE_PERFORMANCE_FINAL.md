# Club Pádel 04 · Auditoría 27 final · Bundle y rendimiento

## Estado final

Auditoría 27 finalizada correctamente.

## Objetivo completado

Diagnosticar el warning de bundle grande y detectar causas reales de rendimiento antes de producción.

## Completado

- Check inicial bundle/performance.
- Diagnóstico de causas del bundle pesado.
- Estrategia segura de optimización bundle.
- Diagnóstico de assets e imágenes pesadas.
- Plan seguro de optimización de imágenes.
- Checkpoints parciales creados.
- Build correcto mantenido.

## Hallazgos

### JS principal

El bundle JS principal supera el umbral recomendado por Vite:

- JS principal aproximado: 592 KB.
- Warning: Some chunks are larger than 500 kB after minification.

### Causa probable JS

- App.jsx concentra demasiada aplicación.
- Traducciones embebidas.
- Módulos grandes dentro del bundle inicial.
- Torneos/ranking/soporte/admin/perfil cargados en el paquete principal.

### Imágenes pesadas

También se detectaron imágenes pesadas en public/dist:

- candidatas de galería.
- fondos principales.
- imágenes de módulos.
- imágenes de instalaciones/torneos/pistas.

## Decisión técnica

No aplicar todavía refactor agresivo.

Primero optimizar imágenes en una auditoría separada.

Después valorar:

- manualChunks.
- React.lazy/Suspense.
- extracción de módulos.
- extracción de traducciones.
- lazy loading de galería.

## Seguridad

No se ha borrado nada.

No se han introducido credenciales reales.

No se ha ejecutado deploy irreversible.

No se ha roto la app.

## Checkpoints creados

- backups/checkpoint-auditoria27-inicial
- backups/checkpoint-auditoria27-diagnostico
- backups/checkpoint-auditoria27-estrategia
- backups/checkpoint-auditoria27-assets-pesados
- backups/checkpoint-auditoria27-plan-imagenes
- backups/checkpoint-auditoria27-final

## Pendiente recomendado

Auditoría 28:

- Crear backup de imágenes originales.
- Generar versiones optimizadas.
- Mantener rutas seguras.
- Medir antes/después.
- Validar visualmente.
- Mantener build correcto.

## Estado

Auditoría 27:
- Estado: finalizada correctamente.
- Porcentaje: 100%.
- Tipo de cierre: diagnóstico y planificación de rendimiento.
