# Club Pádel 04 · Auditoría 37 · Guía preview Cloudflare Pages sin producción

## Auditoría 37

50%

## Avance real estimado del proyecto completo

91.4%

## Objetivo

Dejar preparado el paquete de preview para Cloudflare Pages sin ejecutar publicación real desde terminal.

## Carpeta preparada

deploy-preview/club-padel-04-preview-dist

## Recomendación

Usar primero Cloudflare Pages en modo preview/manual, no producción comercial definitiva.

## Pasos manuales recomendados

1. Entrar en Cloudflare.
2. Ir a Workers & Pages.
3. Crear proyecto Pages.
4. Elegir carga manual o conexión a repositorio.
5. Subir la carpeta `deploy-preview/club-padel-04-preview-dist` si se usa carga manual.
6. No conectar dominio final todavía si no se ha decidido.
7. Abrir URL preview.
8. Revisar navegación principal.
9. Revisar galería.
10. Revisar reservar.
11. Revisar reservas.
12. Revisar admin.
13. Revisar centro técnico.
14. Revisar soporte.
15. Revisar perfil.
16. No activar pagos reales.
17. No activar cancelaciones reales.
18. No introducir secrets en frontend.
19. Configurar secrets solo en Worker.
20. Validar CORS antes de usar backend real.

## NO hacer todavía

- No producción comercial final.
- No activar pagos reales.
- No activar cancelaciones reales.
- No exponer tokens.
- No mezclar variables privadas en Vite.
- No borrar checkpoints.
