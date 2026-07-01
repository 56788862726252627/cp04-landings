# Club Pádel 04 · Auditoría 39 · Checklist subida manual Cloudflare Pages

## Auditoría 39

75%

## Avance real estimado del proyecto completo

93.6%

## Paquete preparado

Carpeta para subir:

deploy-pages/club-padel-04-pages-dist

ZIP preparado:

deploy-pages/club-padel-04-pages-dist.zip

## Checklist antes de publicar

1. Entrar en Cloudflare Dashboard.
2. Ir a Workers & Pages.
3. Elegir Pages.
4. Crear nuevo proyecto o abrir el proyecto existente de Club Pádel 04.
5. Usar subida manual si se va a subir el paquete ZIP/carpeta.
6. Subir el contenido de deploy-pages/club-padel-04-pages-dist.
7. Confirmar que index.html queda en la raíz del despliegue.
8. Confirmar que _redirects queda en la raíz del despliegue.
9. No añadir claves privadas como variables públicas.
10. No activar pagos reales.
11. No activar dominio final todavía.
12. Probar primero la URL preview generada por Cloudflare Pages.

## Configuración recomendada si se conecta por build

- Framework preset: Vite
- Build command: npm run build
- Build output directory: dist
- Node version: 20

## Revisión obligatoria

Antes de publicar, revisar:

- docs/deploy/AUDITORIA_39_RESUMEN_SECRETOS_CP04.txt
- docs/deploy/AUDITORIA_39_RESUMEN_RUTAS_LOCALES_CP04.txt
- docs/deploy/AUDITORIA_39_VALIDACION_ESTRUCTURA_50_CP04.txt

## Estado

Paquete preparado para subida manual controlada, sin ejecutar deploy real desde terminal.

## Riesgo

Bajo si la publicación se hace como preview y sin credenciales reales en frontend.
