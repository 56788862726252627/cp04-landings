# Informe de generación — Clínica Dental

Business ID: `clinica-dental` · Sector: `dental` · Generado: null

## Archivos
- Creados: 0
- Actualizados: 0
- Preservados (no sobrescritos): 0

## Módulos y automatizaciones
- Módulos activados (9): autenticacion, clientes, citas, pagos, documentos, servicios, profesionales, soporte, configuracion
- Automatizaciones seleccionadas: confirmacion, recordatorio, cancelacion, seguimiento, encuesta
- Integraciones declaradas: messaging, payments

## Datos demo
- Clientes: undefined · Profesionales: undefined · Citas: undefined · Incidencias: undefined

## Reutilización
- Módulos reutilizados del catálogo genérico: undefined
- Archivos centrales del núcleo modificados: undefined

## Pasos manuales pendientes
- datos de salud sujetos a normativa reforzada (expedientes clínicos)
- Confirmar antes de producción: ¿En qué ciudad y país operará el negocio?
- Confirmar antes de producción: Has pedido "pagos" y también una restricción sobre pagos online: ¿cuál de las dos peticiones prevalece?
- Confirmar antes de producción: ¿Cuántos profesionales o miembros del equipo trabajarán en el negocio?
- Revisar supuesto — country/timezone: se asumió "ES/Europe/Madrid" (valor por defecto seguro (España/Europe-Madrid) al no detectarse ciudad en el texto)

## Riesgos y limitaciones
- Riesgo: datos de salud sujetos a normativa reforzada (expedientes clínicos)
- Limitación: Análisis únicamente: pasa --execute para materializar el tenant real.

## Rendimiento
- Duración de la generación: 42 ms
- Idempotente: no evaluado en esta ejecución
- Modo dry-run: no

## Siguiente paso recomendado
- Ejecutar de nuevo con --execute para generar el tenant, o revisar manualSteps/ambigüedades primero.
