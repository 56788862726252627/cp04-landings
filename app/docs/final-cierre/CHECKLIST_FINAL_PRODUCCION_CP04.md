# Club Pádel 04 · Checklist final de producción y pre-entrega

## Estado técnico local

- [x] Build de producción correcto.
- [x] App estable en local.
- [x] Dist generado.
- [x] Worker reservas presente.
- [x] Wrangler presente.
- [x] Documentación principal revisada.
- [x] Checkpoints finales guardados.
- [x] SRC limpiado de backups sueltos principales.
- [x] Backups movidos a carpeta backups.

## Roles y navegación

- [x] PLAYER validado visualmente.
- [x] STAFF validado visualmente.
- [x] ADMIN validado visualmente.
- [x] SUPPORT validado visualmente.
- [x] Sidebar por rol correcto.
- [x] Fallback seguro modules[current] || modules.inicio activo.
- [x] Sin pantallas en blanco detectadas.

## Producción / Cloudflare

- [x] Cloudflare/Wrangler detectado.
- [x] Worker reservas revisado.
- [x] Variables sensibles revisadas.
- [x] Dist listo para despliegue estático.
- [ ] Confirmar dominio final.
- [ ] Configurar secrets reales en Cloudflare Worker.
- [ ] Configurar variables públicas finales VITE_.
- [ ] Probar POST real de /api/reservas desde frontend desplegado.
- [ ] Probar GET real de /api/disponibilidad desde frontend desplegado.
- [ ] Activar autenticación real antes de exponer admin/staff/support en producción.

## Pendientes no bloqueantes

- [ ] Optimizar bundle principal mayor de 500 kB.
- [ ] Comprimir galería pesada.
- [ ] Valorar Cloudflare Images/CDN para galería.
- [ ] Sustituir credenciales demo por autenticación backend real.
- [ ] Completar integración de pagos reales si se activa Stripe.
- [ ] Completar WhatsApp si se activa como canal de notificación.

## Recomendación final

La app está preparada para cierre técnico local y predespliegue controlado. Para producción pública real, el siguiente paso crítico es configurar dominio, secrets y autenticación real.
