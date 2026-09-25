# Club Pádel 04 · Auditoría 27 · Diagnóstico assets/imágenes pesadas

## Estado

Diagnóstico de assets pesados preparado.

## Hallazgo principal

Además del warning de JS mayor de 500 kB, existen imágenes muy pesadas en dist.

## Problema real

Algunas imágenes pesan varios MB:

- candidatas de galería: aproximadamente 4–5 MB por imagen.
- fondos y módulos: aproximadamente 2 MB por imagen.
- varias imágenes se copian a dist durante build.

## Impacto

Esto puede afectar a:

- primera carga
- rendimiento en móvil/tablet
- consumo de datos
- puntuación Lighthouse
- experiencia real en Cloudflare Pages
- tiempo de carga sobre redes lentas

## Prioridad

Antes de refactorizar código React, conviene optimizar assets:

1. No borrar originales.
2. Crear carpeta de originales.
3. Generar versiones optimizadas.
4. Mantener nombres si la app ya los usa.
5. Medir antes/después.
6. Ejecutar build.
7. Confirmar que la app se ve igual.

## Estrategia segura

- Guardar checkpoint.
- Copiar originales a backup.
- Optimizar a JPG/WebP si existe herramienta disponible.
- Reducir dimensiones si son excesivas.
- Mantener calidad visual premium.
- No tocar lógica de App.jsx en esta fase.

## Estado

Pendiente optimización segura de imágenes.
