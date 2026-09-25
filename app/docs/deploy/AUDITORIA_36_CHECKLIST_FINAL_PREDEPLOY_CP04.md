# Club Pádel 04 · Auditoría 36 · Checklist final predeploy controlado

## Auditoría 36

75%

## Avance real estimado del proyecto completo

90.4%

## Estado general

La app está preparada para una prepublicación controlada, pero todavía no debe considerarse producción comercial completa hasta conectar credenciales reales, dominio definitivo, backend seguro y pruebas reales controladas.

## Cloudflare Pages

### Listo

- Build local correcto.
- Carpeta `dist` generada correctamente.
- `dist/index.html` existe.
- Assets principales generados.
- Galería optimizada preparada.
- App compatible con despliegue tipo Vite.
- Rutas SPA listas para preview.

### Pendiente manual

- Crear proyecto en Cloudflare Pages.
- Elegir si se sube `dist` manualmente o se conecta repo.
- Confirmar dominio final.
- Confirmar rama de producción.
- Configurar variables públicas `VITE_` si hacen falta.
- Probar preview antes de producción.

## Cloudflare Worker

### Listo

- Worker inventariado.
- `wrangler.toml` localizado.
- Estructura revisada.
- Guía de secrets preparada.
- Separación frontend/backend preparada.

### Pendiente manual

- Configurar secrets reales desde Cloudflare.
- Configurar `ALLOWED_ORIGIN`.
- Probar CORS.
- Probar endpoint en modo demo.
- Revisar logs.
- No activar pagos reales todavía.
- No activar cancelaciones reales todavía.

## Seguridad

### Correcto

- Predeploy revisado sin publicar.
- Secrets deben ir en Worker, no en frontend.
- Pages solo debe recibir variables públicas.
- Checkpoints creados antes de cada fase.
- Build sigue funcionando.

### Pendiente antes de producción comercial

- Autenticación real por roles.
- Protección real de Admin / Soporte.
- Política RGPD completa.
- Logs técnicos filtrados.
- Rate limiting.
- Validación backend completa.
- Backups reales.
- Monitorización real.
- Dominio final HTTPS.
- Pruebas con usuarios controlados.

## Decisión recomendada

Hacer primero un deploy preview controlado, no producción definitiva.

## Riesgo actual

Bajo para preview.
Medio si se publicase como producción comercial sin credenciales y protección real.
