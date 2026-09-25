# Club Pádel 04 · Auditoría 36 · Guía prueba preview manual

## Auditoría 36

55%

## Avance real estimado del proyecto completo

90.1%

## Objetivo

Validar la app como si fuera a publicarse en Cloudflare Pages, pero sin ejecutar todavía deploy real.

## Prueba recomendada antes de publicar

1. Confirmar que `npm run build` termina correctamente.
2. Confirmar que existe `dist/index.html`.
3. Confirmar que `dist/assets` existe.
4. Confirmar que las imágenes optimizadas WebP existen.
5. Confirmar que no hay claves privadas dentro de `dist`.
6. Confirmar que no hay rutas locales dentro de `dist`.
7. Confirmar que el Worker existe y tiene configuración separada.
8. Confirmar que los secrets del Worker no están escritos en frontend.
9. Confirmar que Pages solo recibirá variables públicas `VITE_`.
10. Hacer preview antes de producción definitiva.

## Resultado esperado

La app debe poder abrir en preview de Cloudflare Pages con:

- Menú lateral visible.
- Inicio visible.
- Reservas visible.
- Galería visible.
- Admin visible.
- Centro técnico visible.
- Soporte visible.
- Perfil visible.
- Assets cargando correctamente.
- Sin errores críticos de consola.

## Estado

Preview simulado preparado.

## Deploy real

No ejecutado.

## Riesgo

Bajo.
