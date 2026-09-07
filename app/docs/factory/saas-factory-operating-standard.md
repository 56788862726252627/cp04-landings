# SaaS Factory — Estandar Operativo
Version: 2026-09-07 | Scope: Agencia IA · Fábrica SaaS

## Regla de oro
Un flujo Make por función de negocio. Nunca un megaflujo multi-funcion.

## Nomenclatura de escenarios
[CLIENTE] · [Funcion] — Ej: LUMEN · Solicitud Cita Landing

## Carpetas Make
Una carpeta por cliente. Nombre: [Emoji] [NombreCliente]

## Protocolo por flujo
1. Crear webhook en Make (gateway-webhook)
2. Crear tabla Airtable si no existe
3. Escribir blueprint minimo: trigger → action → respond
4. Activar escenario
5. Cablear entrypoint en el codigo
6. Test manual con payload real
7. Verificar registro en Airtable

## Validaciones obligatorias (filtro Make antes de ActionCreate)
- email != empty
- nombre != empty
- privacidad_aceptada = true

## Campos obligatorios en todas las tablas Airtable
- request_id (UUID, campo primario)
- timestamp (dateTime, auto)
- origen (singleSelect: landing_web | app_pwa | qr | directo)
- estado (singleSelect con colores)

## Guardrails de fabrica
- NO_REAL_EXTERNAL_ACTION=SI (no emails/WhatsApp reales sin flag)
- isReal:false en todos los datos demo
- FACTORY_AGENCY_SCOPE_ONLY=SI
- NO merge automatico a main
- Commit quirurgico: solo archivos del cliente activo

## Test minimo por flujo (T1-T5)
T1: payload valido → registro Airtable creado
T2: payload sin email → filtro rechaza (no crea registro)
T3: payload sin privacidad → filtro rechaza
T4: payload duplicado → flujo ejecuta (dedup Airtable)
T5: webhook respond → 200 JSON {ok:true}

## Clientes activos
- Club Padel 04 (carpeta: 🎾 Torneo / Liga Padel, id: 316391)
- Lumen Dental (carpeta: 🦷 Lumen Dental, id: 386999)
