# Informe de generación — Sonrisas de Málaga

Business ID: `clinica-dental-sonrisas-de-malaga` · Sector: `dental` · Generado: 2026-07-21T07:56:24.237Z

## Archivos
- Creados: 0
- Actualizados: 0
- Preservados (no sobrescritos): 16

## Módulos y automatizaciones
- Módulos activados (14): inicio, citas, clientes, pagos, automatizaciones, soporte, informes, configuracion, agenda, profesionales, recursos, servicios, documentos, formularios
- Automatizaciones seleccionadas: alta_cliente, confirmacion, cancelacion, recordatorio, encuesta, documento, pago
- Integraciones declaradas: automation, dataRepository, payments, messaging, calendar

## Datos demo
- Clientes: 18 · Profesionales: 3 · Citas: 24 · Incidencias: 3

## Reutilización
- Módulos reutilizados del catálogo genérico: 14/14 (100%)
- Archivos centrales del núcleo modificados: 0

## Pasos manuales pendientes
- Revisión normativa sanitaria/odontológica antes de producción
- Sustituir logotipo/branding placeholder por assets reales

## Riesgos y limitaciones
- Riesgo: Sector "dental" requiere revisión normativa antes de producción (ver checklist técnico).
- Limitación: Ningún proveedor externo real está conectado (Airtable/Make/Stripe/WhatsApp/Gmail/Calendar): todo son adaptadores mock.
- Limitación: No hay integración en vivo con App.jsx: el tenant generado es configuración validada, no una aplicación desplegada.
- Limitación: Los binarios de branding/PWA (favicon, iconos, manifest real) no se generan en este paso: solo el contrato y el manifest declarativo.
- Limitación: Los mockups no se capturan realmente (requeriría Playwright u otra herramienta, no incluida como dependencia).
- Limitación: Los datos demo son sintéticos y no deben usarse como base de un cliente real sin sustitución explícita.

## Rendimiento
- Duración de la generación: 51 ms
- Idempotente: sí
- Modo dry-run: no

## Siguiente paso recomendado
- Resolver los riesgos listados (revisión normativa/contraste/terminología) antes de conectar cualquier proveedor real.
