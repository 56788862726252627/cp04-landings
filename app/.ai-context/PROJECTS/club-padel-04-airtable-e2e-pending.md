# Club Pádel 04 · E2E pendientes por límite de Airtable

Fecha de registro: 2026-08-27
Estado: diferido hasta que vuelva a estar disponible la cuota/API gratuita de Airtable (objetivo: 2026-09-01).

## 📡 API Reservas

Infraestructura y seguridad ya cerradas:
- Escenario Make activo y conectado al webhook nuevo.
- Worker `cp04-reservas-proxy` usa `MAKE_RESERVAS_WEBHOOK` con el webhook nuevo.
- Webhook antiguo comprometido eliminado/inutilizado.
- `📝 Tally → API Reservas` apunta al webhook nuevo, aunque Tally no se considera flujo base de producción.
- El PDF que expuso el webhook fue retirado del HEAD; la purga del historial Git se decidirá por separado.

## Certificación E2E funcional pendiente

Ejecutar cuando Airtable vuelva a estar disponible, sin saltarse ninguna comprobación:

1. Crear reserva real controlada desde la aplicación Club Pádel 04.
   - Validar payload desde app → Worker → Make.
   - Confirmar creación en Airtable.
   - Confirmar evento en Google Calendar.
   - Confirmar email de éxito.
   - Confirmar que no se duplica la reserva.

2. Consultar disponibilidad desde la aplicación.
   - Validar horario completo, especialmente 12:00–17:00.
   - Confirmar que 13:00, 14:00, 15:00 y 16:00 aparecen correctamente cuando corresponde.
   - Confirmar cierre del club a las 23:00 y que una reserva iniciada a las 22:00 solo admite 1 hora.
   - Confirmar comportamiento correcto ante 429/Retry-After y caché/revalidación.

3. Reprogramar una reserva controlada.
   - Localizar la reserva por clave.
   - Eliminar/actualizar correctamente el evento anterior de Google Calendar.
   - Crear el nuevo evento.
   - Actualizar Airtable.
   - Confirmar email.
   - Verificar que no quedan duplicados ni eventos huérfanos.

4. Cancelar la reserva controlada.
   - Marcar la reserva como cancelada en Airtable.
   - Eliminar el evento de Google Calendar.
   - Confirmar email.
   - Confirmar que la franja vuelve a estar disponible.

5. Regresión por roles e inicio de sesión.
   - Jugador.
   - Admin.
   - Staff.
   - Soporte.
   - Sesiones demo y no demo cuando aplique.

6. Seguridad y resiliencia.
   - No mostrar secretos ni URLs sensibles.
   - Confirmar que el webhook antiguo ya no responde.
   - Confirmar que `MAKE_RESERVAS_WEBHOOK` sigue apuntando al webhook nuevo.
   - Verificar fail-safe de disponibilidad cuando falla la red: no pintar todas las franjas como no disponibles.
   - Confirmar que las disponibilidades ya confirmadas se preservan durante errores transitorios.

7. Evidencia final para certificar 100% producción.
   - Captura/log de ejecución Make exitosa.
   - Resultado del Worker sin errores.
   - Airtable correcto.
   - Calendar correcto.
   - Email correcto.
   - UI/app correcta.
   - Sin regresiones en otros módulos.

## Criterio de cierre

Solo marcar `📡 API Reservas` como 100% funcional E2E post-rotación cuando todas las pruebas anteriores pasen. La rotación del webhook, seguridad e infraestructura ya están cerradas; lo pendiente es exclusivamente la recertificación funcional que requiere Airtable.

## Tally

`📝 Tally → API Reservas` no se considera flujo base obligatorio de producción. Mantenerlo desactivado como integración opcional/plantilla reutilizable para formularios externos puntuales (torneos, encuestas, captación u otros casos concretos) si un cliente lo necesita. La arquitectura base debe priorizar formularios propios de la app/web → API/Worker.
