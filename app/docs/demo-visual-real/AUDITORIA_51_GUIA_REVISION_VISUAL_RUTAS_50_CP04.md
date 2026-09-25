# Club Pádel 04 · Auditoría 51 · Guía revisión visual real por rutas

## Auditoría 51

50%

## Avance real estimado del proyecto completo

99.9985%

## Objetivo

Validar visualmente que el banner de modo demo seguro se ve correctamente en navegador y no rompe la experiencia de la app.

## URL preview fallback

https://c4403e7d.club-padel-04.pages.dev

## Rutas que deben revisarse

### Inicio

Ruta:

/

Comprobar:

- El banner aparece arriba.
- El texto se entiende.
- No tapa el selector de rol.
- No rompe el diseño móvil/tablet.
- La app sigue pareciendo profesional.

### Reservar pista

Ruta:

/reservar

Comprobar:

- El banner no tapa el formulario.
- El flujo de reserva sigue visible.
- Debe quedar claro que la acción es demo/simulada.
- No debe parecer que se cobra o reserva de verdad.

### Alta jugador

Ruta:

/alta-jugador

Comprobar:

- El formulario sigue siendo legible.
- El banner no ocupa demasiado espacio.
- Debe quedar claro que los datos son demo.

### Reprogramar reserva

Ruta:

/reprogramar-reserva

Comprobar:

- El usuario entiende que la reprogramación es simulada.
- El banner no tapa botones.
- El diseño sigue correcto en móvil.

### Cancelar reserva

Ruta:

/cancelar-reserva

Comprobar:

- Debe quedar claro que no se cancela ninguna reserva real.
- El botón de cancelar no debe dar sensación de acción destructiva real.
- El banner ayuda a reducir riesgo.

### Reservas

Ruta:

/reservas

Comprobar:

- Las reservas demo se ven bien.
- Los estados demo no confunden.
- La vista mantiene aspecto SaaS.

### Torneos

Ruta:

/torneos

Comprobar:

- Los torneos demo se muestran de forma profesional.
- No parece información real de club.

### Ranking

Ruta:

/ranking

Comprobar:

- El ranking demo no parece ranking real.
- Visualmente sigue claro y vendible.

### Admin

Ruta:

/admin

Comprobar:

- Las métricas demo se entienden.
- No se ven datos sensibles.
- No se muestran tokens, Make, Airtable, Cloudflare ni terminal.
- El banner no tapa paneles.

### Centro técnico

Ruta:

/centro-tecnico

Comprobar:

- No se expone arquitectura interna.
- El estado del sistema debe parecer simulado o seguro.
- No deben verse secretos.

### Soporte

Ruta:

/soporte

Comprobar:

- No se exponen datos técnicos reales.
- El soporte se ve profesional.
- El banner no interfiere.

### Perfil

Ruta:

/perfil

Comprobar:

- Perfil demo visible.
- No hay datos personales reales.
- No se rompe el diseño.

## Resultado esperado

La app debe estar lista para enseñarse como demo comercial segura.

## Si se detecta problema visual

Registrar:

- Ruta afectada.
- Qué tapa el banner.
- Si ocurre en móvil, tablet o escritorio.
- Captura si es posible.
- Prioridad: baja, media o alta.
