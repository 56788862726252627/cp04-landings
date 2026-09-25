# Club Pádel 04 · Auditoría 31 · Code splitting real controlado

## Objetivo

Reducir el bundle JS principal mediante separación progresiva de módulos no críticos.

## Estado inicial heredado

Auditoría 30 dejó preparada la estructura:

- src/data
- src/utils
- src/components
- src/data/performancePlan.js
- src/data/visualAssets.js

## Regla de seguridad

No tocar primero:

- Reservas
- Auth
- Worker
- Make
- Airtable
- Supabase
- Pagos
- Notificaciones
- Calendario
- Endpoints
- Secrets

## Primer candidato recomendado

Galería / componentes visuales no críticos.

## Segundo candidato

Paneles informativos del home y módulos visuales.

## Tercer candidato

Centro técnico, solo si el mapa de dependencias confirma bajo acoplamiento.

## Cierre esperado

Esta auditoría debe dejar al menos un módulo separado o, si el acoplamiento es alto, dejar diagnóstico completo y plan de extracción quirúrgica.
