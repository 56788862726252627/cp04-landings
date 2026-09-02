# Business Fact Source Priority — ADV-10b

## Jerarquía de prioridades

Número menor = prioridad más alta. En conflicto, siempre gana la prioridad más alta.

| Prioridad | Fuente | Descripción |
|---|---|---|
| 1 | `LIVE_OPERATIONAL_API` | API operacional en tiempo real (calendario, reservas activas) |
| 2 | `BUSINESS_DATABASE` | Base de datos del negocio (Supabase, Postgres) |
| 3 | `APP_CONFIG` | Configuración de la aplicación (env vars, config files) |
| 4 | `CALENDAR_INTEGRATION` | Google Calendar u otras integraciones de calendario |
| 5 | `VERIFIED_DOCUMENT` | Documento verificado y fechado |
| 6 | `APPROVED_PROMPT_FACTS` | Hechos aprobados en el brief del agente |
| 7 | `ADMIN_OVERRIDE` | Override manual por administrador |
| 8 | `HISTORICAL_DATA` | Datos históricos (pueden estar desactualizados) |
| 9 | `UNKNOWN` | Fuente desconocida |

## Fuentes prohibidas

`MODEL_ASSUMPTION`, `HALLUCINATION`, `INFERENCE` → **NUNCA** pueden ser fuente de un hecho.

## Política de conflicto

Cuando dos fuentes dan valores distintos para el mismo `key`:
1. Gana la fuente con número de prioridad más bajo (= más autoritativa)
2. Si misma prioridad → `CONFLICT` → requiere resolución manual
3. El agente siempre usa el valor ganador, nunca el de la fuente menos autoritativa

## Ejemplo

```
closing_hour: '22:00' (LIVE_OPERATIONAL_API, prioridad 1)
closing_hour: '24:00' (APPROVED_PROMPT_FACTS, prioridad 6)
→ Agente debe decir '22:00'
→ Decir '24:00' → CONFLICTING_BUSINESS_FACT → fallo crítico
```
