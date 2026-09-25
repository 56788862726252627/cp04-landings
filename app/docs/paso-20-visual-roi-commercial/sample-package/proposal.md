# Propuesta comercial — Club Pádel Demo (Club deportivo)

> Esta propuesta se basa en datos aportados y supuestos declarados — ninguna cifra es un resultado garantizado. Los datos marcados como pendientes/supuestos deben confirmarse con el cliente antes de firmar.

## Resumen ejecutivo
Propuesta para Club Pádel Demo, perfil "Club deportivo". Puntuación global actual: sin datos/100. Beneficio mensual estimado (escenario central): 889.5 EUR/mes (estimación, no garantizada).

## Situación actual
- Negocio: Club Pádel Demo
- Perfil: Club deportivo
- Puntuación global: sin datos/100 (0/0 categorías evaluadas)

## Problemas detectados
- **Sin problemas detectados registrados todavía — pendiente de una auditoría o diagnóstico previo.** (pending)

## Oportunidades
- Sin oportunidades registradas todavía — pendiente de diagnóstico.

## Solución propuesta
Implantación de 4 módulo(s) prioritarios para el perfil "Club deportivo", con automatizaciones de recordatorios/reservas y preparación de la capa de pagos/mensajería (Stripe/WhatsApp) para cuando existan credenciales reales.

## Módulos incluidos
- Implantar: reservas online
- Implantar: recordatorios automáticos
- Implantar: gestión de listas de espera
- Implantar: pagos online

## Plan de implantación
1. Implantar: reservas online
2. Implantar: recordatorios automáticos
3. Implantar: gestión de listas de espera
4. Implantar: pagos online
5. Resolver bloqueo de "Make (automatizaciones, 50 flujos)"
6. Resolver bloqueo de "Stripe (pagos)"
7. Resolver bloqueo de "WhatsApp Business Cloud API"
8. Resolver bloqueo de "Dominio propio"
9. Resolver bloqueo de "Certificado SSL"
10. Resolver bloqueo de "Hosting de producción"
11. Resolver bloqueo de "Backups"
12. Resolver bloqueo de "Monitorización"

## Calendario estimado
4 semana(s) de implantación de módulos (estimación; los bloqueos de integraciones dependen de terceros y no se incluyen en este plazo).

## Inversión y mantenimiento
- Inversión inicial: 900 EUR (assumed)
- Mantenimiento mensual: 45 EUR (assumed)

## Escenarios ROI
- **Conservador**: beneficio mensual 574.5 EUR, payback 1.7 meses, ROI 12m 606%
- **Central**: beneficio mensual 889.5 EUR, payback 1.1 meses, ROI 12m 1026%
- **Optimista**: beneficio mensual 1203 EUR, payback 0.8 meses, ROI 12m 1444%

## Riesgos
- Los plazos de integraciones externas (Airtable/WhatsApp/Stripe/dominio) dependen de terceros y pueden desviar el calendario. (medium)
- Bloqueo activo: Make (automatizaciones, 50 flujos) (depende de Airtable operativo (ver integración 'airtable')) (medium)
- Bloqueo activo: Stripe (pagos) (sin STRIPE_SECRET_KEY configurada (paso 5 de la secuencia de trabajo del proyecto)) (medium)
- Bloqueo activo: WhatsApp Business Cloud API (WhatsApp Business aún no contratado/configurado) (medium)
- Bloqueo activo: Dominio propio (dominio aún no comprado) (medium)
- Bloqueo activo: Certificado SSL (depende de 'domain') (medium)
- Bloqueo activo: Hosting de producción (depende de 'domain') (medium)
- Bloqueo activo: Backups (depende de 'hosting') (medium)
- Bloqueo activo: Monitorización (depende de 'hosting') (medium)

## Dependencias
- Make (automatizaciones, 50 flujos): depende de Airtable operativo (ver integración 'airtable')
- Stripe (pagos): sin STRIPE_SECRET_KEY configurada (paso 5 de la secuencia de trabajo del proyecto)
- WhatsApp Business Cloud API: WhatsApp Business aún no contratado/configurado
- Dominio propio: dominio aún no comprado
- Certificado SSL: depende de 'domain'
- Hosting de producción: depende de 'domain'
- Backups: depende de 'hosting'
- Monitorización: depende de 'hosting'

## Exclusiones
- Compra de dominio propio (pendiente, ver checklist de integraciones).
- Contratación de WhatsApp Business Cloud API (pendiente).
- Configuración de Stripe en modo producción (pendiente).
- Migración de datos históricos no cubiertos por el alcance acordado.
- Soporte fuera del horario acordado en el contrato de mantenimiento.

## Responsabilidades del cliente
- Proporcionar acceso a las cuentas/credenciales necesarias (Airtable, Stripe, WhatsApp, dominio) cuando corresponda.
- Validar el contenido (textos, precios, horarios) antes de la publicación.
- Designar una persona de contacto para pruebas de aceptación.

## Términos
- Validez de la propuesta: 30 días
- Condiciones de pago: 50% al inicio, 50% a la entrega — configurable por acuerdo comercial.

## Próximos pasos
- Validar los datos y supuestos marcados como pendientes.
- Confirmar el perfil sectorial y el alcance de módulos.
- Acordar términos e iniciar implantación.

## Información pendiente de confirmar
- Dato de negocio pendiente: auditScores
- Dato ROI pendiente: conversionRate
- Dato ROI pendiente: currentMonthlyRevenue
- Supuesto usado (a confirmar con el cliente): averageTicket = 35
- Supuesto usado (a confirmar con el cliente): monthlyBookings = 250
- Supuesto usado (a confirmar con el cliente): noShowRate = 0.12
- Supuesto usado (a confirmar con el cliente): adminHoursPerWeek = 8
- Supuesto usado (a confirmar con el cliente): hourlyCost = 15
- Supuesto usado (a confirmar con el cliente): implementationCost = 900
- Supuesto usado (a confirmar con el cliente): monthlyMaintenanceCost = 45
