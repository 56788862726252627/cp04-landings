# Informe de generación — Clínica De Fisioterapia Málaga

Business ID: `clinica-de-fisioterapia-malaga` · Sector: `physiotherapy` · Generado: 2026-07-21T15:03:55.784Z

## Archivos
- Creados: 0
- Actualizados: 0
- Preservados (no sobrescritos): 16

## Módulos y automatizaciones
- Módulos activados (17): autenticacion, clientes, citas, pagos, facturacion, bonos, documentos, expedientes, servicios, profesionales, soporte, leads, recordatorios, dashboard, configuracion, landing, pwa
- Automatizaciones seleccionadas: confirmacion, recordatorio, cancelacion, seguimiento, recuperacion
- Integraciones declaradas: messaging, payments

## Datos demo
- Clientes: 12 · Profesionales: 3 · Citas: 15 · Incidencias: 3

## Reutilización
- Módulos reutilizados del catálogo genérico: 8/17 (47%)
- Archivos centrales del núcleo modificados: 0

## Pasos manuales pendientes
- datos de salud sujetos a normativa reforzada
- Confirmar antes de producción: ¿Cuántos profesionales o miembros del equipo trabajarán en el negocio?

## Riesgos y limitaciones
- Riesgo: Sector "physiotherapy" requiere revisión normativa antes de producción (ver checklist técnico).
- Limitación: Ningún proveedor externo real está conectado (Airtable/Make/Stripe/WhatsApp/Gmail/Calendar): todo son adaptadores mock.
- Limitación: No hay integración en vivo con App.jsx: el tenant generado es configuración validada, no una aplicación desplegada.
- Limitación: Los binarios de branding/PWA (favicon, iconos, manifest real) no se generan en este paso: solo el contrato y el manifest declarativo.
- Limitación: Los mockups no se capturan realmente (requeriría Playwright u otra herramienta, no incluida como dependencia).
- Limitación: Los datos demo son sintéticos y no deben usarse como base de un cliente real sin sustitución explícita.

## Rendimiento
- Duración de la generación: 99 ms
- Idempotente: sí
- Modo dry-run: no

## Siguiente paso recomendado
- Resolver los riesgos listados (revisión normativa/contraste/terminología) antes de conectar cualquier proveedor real.
