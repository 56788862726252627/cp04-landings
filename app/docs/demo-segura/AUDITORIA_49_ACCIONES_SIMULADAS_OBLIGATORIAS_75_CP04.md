# Club Pádel 04 · Acciones simuladas obligatorias en demo

## Deben permanecer simuladas

- Pago.
- Confirmación de pago.
- Reserva real.
- Cancelación real.
- Reprogramación real.
- Alta real de jugador.
- Envío real de WhatsApp.
- Envío real de email no controlado.
- Escritura real en Airtable.
- Llamada real a Make.
- Ejecución de webhook real.
- Cambio de configuración del club.
- Cambio de dominio.
- Cambio de DNS.
- Activación de producción.
- Borrado de datos.
- Eliminación de usuario.
- Eliminación de reserva.
- Cambios en Stripe.
- Cambios en OpenAI API.
- Cambios en Cloudflare.

## Comportamiento correcto

Cada acción debe mostrar:

- Mensaje de éxito demo.
- Aviso de que no se han tocado datos reales.
- Resultado ficticio.
- Sin llamada real a producción.

## Ejemplo

Acción:

Reservar pista.

Resultado demo:

Reserva simulada correctamente. Esta acción no ha creado ninguna reserva real.
