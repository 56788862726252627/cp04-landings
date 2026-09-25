# Club Pádel 04 · Auditoría 28 · Plan de sustitución segura de imágenes

## Estado

Plan de sustitución segura preparado.

## Objetivo

Usar versiones WebP optimizadas sin perder originales y sin romper la app.

## Situación actual

- Originales pesados protegidos en backup.
- Copias optimizadas generadas en public/optimized.
- Build correcto.
- La app todavía usa las rutas originales.
- Las optimizadas todavía no sustituyen imágenes activas.

## Estrategia recomendada

### Fase 28A · Sustitución conservadora

Cambiar primero fondos y recursos no críticos:

- images/torcal-padel-bg.png → optimized/images/torcal-padel-bg.webp
- images/user-reservas-bg.png → optimized/images/user-reservas-bg.webp
- images/admin-technical-bg.png → optimized/images/admin-technical-bg.webp
- gallery/cp04/pistas.png o jpg → optimized/gallery/cp04/pistas.webp
- gallery/cp04/torneos.png o jpg → optimized/gallery/cp04/torneos.webp
- gallery/cp04/recepcion.png o jpg → optimized/gallery/cp04/recepcion.webp
- gallery/cp04/instalaciones.png o jpg → optimized/gallery/cp04/instalaciones.webp
- gallery/cp04/cafeteria.png o jpg → optimized/gallery/cp04/cafeteria.webp

### Fase 28B · Galería de candidatas

Cambiar candidatas pesadas solo si se confirma que la calidad visual es suficiente.

- candidata_17
- candidata_18
- candidata_19
- candidata_20
- resto de candidatas JPG pesadas

### Fase 28C · Validación visual

Después de sustituir:

- revisar Inicio
- revisar Reservas
- revisar Admin
- revisar Soporte
- revisar galería si existe módulo visible
- revisar móvil/tablet
- ejecutar build

## Reglas

- No borrar originales.
- No tocar backup de originales.
- Sustituir rutas de forma gradual.
- Mantener checkpoint antes de cada cambio.
- Validar build tras cada fase.
- Si una imagen no se ve bien, volver a la ruta original.

## Recomendación

La primera sustitución real debería limitarse a fondos principales y módulos visibles, porque reduce mucho peso y tiene bajo riesgo.

## Estado

Pendiente aplicar sustitución real controlada.
