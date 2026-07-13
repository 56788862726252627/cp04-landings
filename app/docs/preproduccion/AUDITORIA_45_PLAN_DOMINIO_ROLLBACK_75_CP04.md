# Club Pádel 04 · Auditoría 45 · Plan seguro dominio + rollback 75%

## Auditoría 45

75%

## Avance real estimado del proyecto completo

98.4%

## URL preview actual

https://c4403e7d.club-padel-04.pages.dev

## Objetivo

Preparar el plan de conexión de dominio definitivo con rollback, sin ejecutar todavía la conexión real del dominio.

## Estado actual

- Preview Cloudflare Pages activa.
- ZIP final Pages guardado.
- DNS todavía sin modificar.
- Dominio definitivo todavía sin conectar.
- Producción comercial todavía sin activar.
- Pagos reales todavía sin activar.

## Datos que deben confirmarse manualmente antes de conectar

- Dominio definitivo exacto.
- Cuenta Cloudflare correcta.
- Zona DNS correcta.
- Proyecto Pages correcto.
- Rama/deploy correcto.
- SSL/TLS activo.
- Redirección www/no-www decidida.
- Plan de rollback preparado.

## Plan recomendado de conexión segura

1. Confirmar dominio definitivo.
2. Confirmar que el dominio está en Cloudflare.
3. Abrir Cloudflare Pages.
4. Entrar en el proyecto correcto.
5. Revisar Custom domains.
6. Añadir dominio definitivo.
7. Revisar instrucciones DNS que proponga Cloudflare.
8. Crear o validar CNAME/TXT solo cuando toque.
9. Esperar propagación.
10. Comprobar HTTPS.
11. Revisar rutas principales.
12. Revisar responsive.
13. Mantener URL preview como fallback.
14. No activar pagos reales hasta auditoría posterior.

## Plan rollback

Si aparece cualquier problema:

1. Mantener activa la URL preview actual.
2. No borrar el proyecto Pages.
3. Retirar custom domain si falla.
4. Restaurar DNS anterior si se cambió.
5. Usar ZIP final guardado como paquete estable.
6. Usar checkpoint Auditoría 44 o 45 si hace falta.
7. No activar producción comercial hasta resolver.

## No hacer todavía

- No conectar dominio definitivo desde terminal.
- No modificar DNS desde terminal.
- No activar pagos reales.
- No activar producción comercial.
- No ejecutar automatizaciones reales destructivas.
- No publicar claves ni webhooks completos.

## Resultado esperado

Proyecto preparado para cierre de Auditoría 45 al 100% y posterior decisión manual de dominio definitivo.
