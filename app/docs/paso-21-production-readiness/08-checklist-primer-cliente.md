# 08 — Checklist para el primer cliente

Orden recomendado, siguiendo la secuencia de trabajo confirmada por el
usuario (Airtable → Make → WhatsApp → Stripe → dominio → despliegue),
antes de firmar/onboardear al primer cliente real.

## Antes de contactar al primer prospecto

- [x] Motor de auditoría pública funcional (`research:audit`) para diagnosticar su presencia digital real.
- [x] Generador de propuesta/ROI/mockups funcional (Paso 20) para preparar el material comercial.
- [ ] Elegir el sector/perfil del primer prospecto entre los 10 ya soportados (o usar `generic`).

## Antes de firmar

- [ ] Ejecutar `research:audit` real contra el sitio del prospecto (con su consentimiento explícito, mismo principio que Pasos 13-18: nunca auditar un competidor/negocio real sin autorización).
- [ ] Generar la propuesta con `factory:proposal`/`factory:package` usando datos reales del negocio, no supuestos sectoriales.
- [ ] Revisar manualmente `exclusions`/`clientResponsibilities`/`terms` antes de enviar (ver checklist comercial).

## Antes de activar el servicio de verdad (bloqueado por credenciales)

- [ ] **Depende de Airtable**: base de datos operativa con cuota disponible.
- [ ] **Depende de Airtable**: los 50 flujos de Make validados con llamadas reales sobre esa base.
- [ ] **Depende de WhatsApp**: número de teléfono aprobado + plantillas aprobadas por Meta + `recordConsent` real ejecutado con el consentimiento real del cliente final (nunca asumido).
- [ ] **Depende de Stripe**: cuenta configurada en modo test primero, checkout/reembolso probados con tarjetas de prueba, luego modo live con `allowLiveMode` explícito.
- [ ] **Depende del dominio**: el negocio del cliente necesita una URL propia o un subdominio de la agencia — depende de que exista el dominio comprado.
- [ ] **Depende del despliegue**: la app tiene que estar en producción real y accesible antes de que el cliente pueda usarla.

## Primer día en producción con el cliente

- [ ] Verificar que las reservas/citas llegan correctamente a Airtable.
- [ ] Verificar que los recordatorios de WhatsApp se envían (con consentimiento real).
- [ ] Verificar que un cobro de prueba (modo test) se procesa correctamente antes de activar cobros reales.
- [ ] Tener un canal de soporte definido para el cliente durante la primera semana.
- [ ] Revisar logs (`CP04_EVENT`) tras las primeras operaciones reales para confirmar que no hay errores inesperados.

## Nota de honestidad

Ningún ítem de este checklist se ha ejecutado en esta sesión — el
primer cliente real depende de decisiones comerciales y de
credenciales externas que están fuera del alcance de este paso, que es
puramente de auditoría y preparación.
