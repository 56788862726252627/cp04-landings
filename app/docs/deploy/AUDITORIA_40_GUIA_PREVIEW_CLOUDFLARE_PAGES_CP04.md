# Club Pádel 04 · Auditoría 40 · Guía preview Cloudflare Pages

## Auditoría 40

25%

## Avance real estimado del proyecto completo

94.0%

## Objetivo

Preparar la publicación preview controlada en Cloudflare Pages sin ejecutar despliegue automático desde terminal.

## Paquete a subir

Carpeta:

deploy-pages/club-padel-04-pages-dist

ZIP:

deploy-pages/club-padel-04-pages-dist.zip

## Pasos manuales en Cloudflare

1. Abrir Cloudflare Dashboard.
2. Entrar en Workers & Pages.
3. Entrar en Pages.
4. Crear proyecto nuevo o seleccionar el proyecto de Club Pádel 04.
5. Elegir subida manual.
6. Subir el ZIP o el contenido de la carpeta:
   deploy-pages/club-padel-04-pages-dist
7. Confirmar que index.html está en la raíz.
8. Confirmar que _redirects está en la raíz.
9. Esperar URL preview.
10. No conectar dominio definitivo todavía.
11. No activar pagos reales todavía.
12. No compartir como producción comercial todavía.

## Checklist cuando Cloudflare dé la URL preview

- La URL abre correctamente.
- No aparece pantalla en blanco.
- Inicio carga.
- Galería carga.
- Sidebar funciona.
- Reservar abre.
- Alta de jugador abre.
- Reprogramar reserva abre.
- Cancelar reserva abre.
- Reservas abre.
- Admin abre.
- Centro técnico abre.
- Soporte abre.
- Perfil y ajustes abre.
- Refresco de página no rompe rutas.
- No aparecen errores visibles.
- No aparecen claves privadas en consola ni en interfaz.

## Riesgo

Bajo si se publica primero como preview y no se conecta dominio definitivo.
