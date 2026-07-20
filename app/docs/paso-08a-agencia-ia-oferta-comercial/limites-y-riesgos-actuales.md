# Límites y riesgos actuales — Club Pádel 04 (Paso 08A)

**Este documento es la referencia obligatoria antes de cualquier conversación comercial.** Ninguna afirmación comercial (`oferta-comercial-club-padel-04.md`, `demo-vendible-guion.md`) puede contradecir lo que aquí se documenta.

---

## Bloqueadores técnicos activos

- **Airtable 429 / `PUBLIC_API_BILLING_LIMIT_EXCEEDED`:** cuota de Airtable agotada — impide probar en real cualquier flujo de escritura (crear reserva, alta/baja de jugador, cierre temporal) contra Make/Airtable. Bloqueo externo, no depende de código pendiente de escribir.
- **Pruebas reales E2E pendientes:** ningún flujo se ha validado contra Make/Airtable real en este bloque de trabajo. Existe un runbook completo y ordenado (`app/docs/paso-07q-pruebas-post-airtable-429/`) listo para ejecutarse en cuanto la cuota se renueve.
- **Stripe pendiente:** no existe integración real de pagos en esta rama. El módulo "Facturación y pagos" es solo visual.
- **WhatsApp/Telegram pendientes:** no existe integración real de mensajería en esta rama. El módulo "Automatizaciones y bots" es solo visual.
- **Google Calendar real pendiente:** no existe sincronización real con Google Calendar. El módulo "Calendario y disponibilidad" es solo visual.
- **10/50 flujos de Make sin representación en la app:** documentados uno a uno con motivo (duplicidad con Centro Técnico, rediseño de Torneos pendiente, hallazgo de 89% de error en Encuesta Post-Partido, candidatos a archivar, baja prioridad) en `app/docs/paso-07p-ampliacion-sidebar-31-flujos/`.

## Estado de gobernanza

- **PR #36 sigue en `draft`** — el trabajo de los Pasos 07A-07R no se ha fusionado a la rama de release (`release/staging-club-padel-04-2026-07-15`).
- **No está desplegado como producción final** — el entorno validado es `localhost:5175` (desarrollo local), no un dominio de producción con tráfico real de un club.

## Qué SÍ se puede enseñar ya (con el lenguaje correcto)

- La app completa funcionando en vivo, con los 4 roles reales (PLAYER/STAFF/ADMIN/SUPPORT) y sus permisos diferenciados.
- Los flujos de UI de reservas, alta/baja de jugador, cierre temporal, lista de espera y los 8 módulos nuevos de automatización (visualmente).
- El diseño premium y coherente de la aplicación.
- El roadmap técnico y comercial (este mismo bloque de documentación).

**Lenguaje correcto a usar siempre:** "demo funcional avanzada", "pendiente de validación real end-to-end tras la renovación de cuota de Airtable", "las automatizaciones ya están diseñadas y visibles, se activan del todo al conectar [integración] para vuestro club".

## Qué NO se debe prometer todavía

- No decir que la app "ya está en producción" o "ya la usan clubes reales" si no es cierto en el momento de la conversación.
- No prometer cobro automático de cuotas (Stripe) como disponible hoy.
- No prometer comunicación automática por WhatsApp/Telegram como disponible hoy.
- No prometer sincronización real con Google Calendar como disponible hoy.
- No prometer que los 50/50 flujos de Make están cubiertos — son 40/50, con los 10 restantes documentados y sin fecha comprometida.
- No firmar ni comunicar un piloto con datos reales de socios de un club sin haber completado antes el runbook de validación post-Airtable 429 con resultado positivo.
- No modificar, ni dar a entender que se modifica, PR #36 fuera de `draft` como parte de una negociación comercial — esa decisión es técnica/de gobernanza, no comercial.
