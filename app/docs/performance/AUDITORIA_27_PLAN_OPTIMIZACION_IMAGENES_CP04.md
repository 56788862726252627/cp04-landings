# Club Pádel 04 · Auditoría 27 · Plan seguro de optimización de imágenes

## Estado

Plan de optimización de imágenes preparado.

## Hallazgo principal

La app mantiene build estable, pero existen imágenes muy pesadas copiadas a dist.

## Impacto

Las imágenes pesadas pueden afectar más que el JS a:

- carga inicial
- rendimiento móvil
- consumo de datos
- puntuación Lighthouse
- experiencia en Cloudflare Pages
- velocidad percibida

## Imágenes prioritarias

Prioridad alta:

- public/gallery/cp04/candidatas/*
- public/images/general-modules-bg.png
- public/images/torcal-padel-bg.png
- public/images/user-reservas-bg.png
- public/gallery/cp04/torneos.jpg
- public/gallery/cp04/recepcion.jpg
- public/gallery/cp04/pistas.jpg
- public/gallery/cp04/instalaciones.jpg
- public/gallery/cp04/cafeteria.jpg

## Estrategia segura

No borrar originales.

Crear:

- backups/originales-imagenes-pesadas
- public/optimized
- docs/performance

## Reglas

- Mantener originales.
- Optimizar copias.
- Medir antes y después.
- Mantener estética premium.
- Evitar pérdida visible de calidad.
- No tocar lógica de negocio.
- No romper rutas usadas por la app.

## Opciones de optimización

### Opción A · Optimización conservadora

- Mantener JPG/PNG.
- Reducir dimensiones máximas.
- Mantener calidad 82–88.
- Sustituir solo cuando se confirme visualmente.

### Opción B · Optimización moderna

- Crear versiones WebP.
- Mantener originales como fallback.
- Ajustar referencias si es necesario.
- Mayor mejora de peso.

### Opción C · Lazy loading / carga diferida

- Cargar galería solo cuando se abra módulo correspondiente.
- No cargar candidatas pesadas en home.
- Requiere tocar código, por tanto debe hacerse después de optimizar assets.

## Recomendación

Primero hacer inventario y backup de originales.

Después crear versiones optimizadas.

No sustituir aún sin validar visualmente.

## Estado

Plan preparado. Pendiente ejecución de optimización real.
