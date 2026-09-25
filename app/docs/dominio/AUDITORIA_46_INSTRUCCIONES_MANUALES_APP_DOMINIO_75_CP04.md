# Club Pádel 04 · Auditoría 46 · Instrucciones manuales conexión dominio app 75%

## Auditoría 46

75%

## Avance real estimado del proyecto completo

99.2%

## Dominios fijados

- SaaS comercial: clubpadel04.com
- App reservas: app.clubpadel04.com

## URL preview actual

https://c4403e7d.club-padel-04.pages.dev

## Objetivo

Preparar instrucciones manuales para conectar app.clubpadel04.com a Cloudflare Pages de forma controlada.

## Importante

Este documento NO conecta el dominio todavía. Solo deja las instrucciones preparadas para cuando se confirme manualmente en Cloudflare.

## Pasos manuales recomendados en Cloudflare

### Paso 1 · Confirmar dominio

- Entrar en Cloudflare.
- Confirmar que clubpadel04.com está comprado o añadido a Cloudflare.
- Confirmar que la zona DNS correcta es clubpadel04.com.
- No modificar DNS todavía si no está todo claro.

### Paso 2 · Confirmar proyecto Pages

- Ir a Workers & Pages.
- Entrar en el proyecto de Club Pádel 04.
- Confirmar que la preview actual coincide con:

https://c4403e7d.club-padel-04.pages.dev

### Paso 3 · Abrir Custom Domains

- Entrar en la sección Custom Domains.
- Preparar app.clubpadel04.com como dominio de la app.
- No tocar pagos reales.
- No activar producción comercial.

### Paso 4 · Añadir app.clubpadel04.com

Solo cuando se confirme:

- Añadir app.clubpadel04.com.
- Seguir exactamente la instrucción que Cloudflare muestre.
- Si Cloudflare pide CNAME, copiar exactamente el valor recomendado.
- Si Cloudflare crea el registro automáticamente, revisar antes de aceptar.
- Esperar validación SSL/TLS.

### Paso 5 · Comprobaciones posteriores

Después de conectar, comprobar:

- https://app.clubpadel04.com abre.
- No hay pantalla blanca.
- Carga CSS.
- Cargan imágenes.
- Cargan rutas internas.
- Funciona navegación.
- Funciona responsive móvil.
- No hay secretos visibles.
- Pagos reales siguen desactivados.

## Plan de rollback

Si falla:

1. Mantener activa la preview actual.
2. No borrar Cloudflare Pages.
3. Quitar el custom domain si queda mal configurado.
4. Restaurar DNS anterior si se modificó.
5. Usar el ZIP final guardado.
6. Volver al checkpoint Auditoría 46.
7. No activar producción comercial hasta resolver.

## No hacer todavía

- No conectar dominio desde terminal.
- No modificar DNS desde terminal.
- No activar pagos reales.
- No activar producción comercial.
- No borrar preview.
- No borrar ZIP final.
- No exponer webhooks completos.

## Resultado esperado

Auditoría preparada para cierre al 100% con dominio decidido, instrucciones creadas y rollback documentado.
