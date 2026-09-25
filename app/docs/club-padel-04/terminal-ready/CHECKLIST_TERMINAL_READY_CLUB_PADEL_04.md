# Checklist Terminal-Ready — Club Pádel 04

Fecha: 2026-07-13

Leyenda de columnas:

- **Estado**: Completado / Pendiente terminal / Pendiente externo.
- **Riesgo**: Alto / Medio / Bajo.
- **Prioridad**: P0 / P1 / P2.
- **Vía**: Terminal / Externo (indica si se puede resolver solo desde esta
  sesión de terminal o requiere una acción fuera de ella).

## Landing

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Estructura responsive, drawer móvil | Completado | Bajo | — | — | — |
| Galería honesta (sin fotos falsas) | Completado | Bajo | — | — | — |
| Hero visual como recurso de marca | Completado | Bajo | — | — | — |
| Reemplazar dominio placeholder `clubpadel04.example` | Pendiente externo | Medio | P1 | 15 min | Externo (requiere dominio real) |
| Reemplazar `CONFIGURAR_ZONA_REAL` en JSON-LD | Pendiente externo | Medio | P1 | 15 min | Externo (requiere zona real verificada) |
| Copy de venta revisado sin datos inventados | Pendiente terminal | Bajo | P2 | 1-2 h | Terminal |

## App (funcionalidad)

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| `npm run lint` / `npm run build` pasan | Completado | Bajo | — | — | — |
| Flujo de reserva con validación y estados | Completado | Bajo | — | — | — |
| QA manual E2E en navegador real | Pendiente terminal* | Medio | P1 | 2-3 h | Terminal (con navegador disponible) |
| Persistencia real de reservas | Pendiente externo | Alto | P0 | — | Externo (backend + Airtable/BD real) |

\* Requiere entorno con navegador; si el terminal no tiene uno disponible, pasa
a "pendiente externo".

## Roles

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Paneles PLAYER/STAFF/ADMIN/SUPPORT documentados | Completado | Bajo | — | — | — |
| Auditoría de qué ve/no ve cada rol | Completado (este PR) | — | — | — | — |
| Autenticación real | Pendiente externo | Alto | P0 | 1-2 semanas | Externo (elegir proveedor: Auth0/Clerk/Supabase/Firebase) |
| Autorización server-side por rol | Pendiente externo | Alto | P0 | — | Externo (depende del backend elegido) |

## Reservas

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Validación de payload en frontend | Completado | Bajo | — | — | — |
| Worker proxy preparado (`worker-reservas/`) | Completado | Bajo | — | — | — |
| Despliegue del Worker | Pendiente externo | Medio | P1 | 1-2 h | Externo (Cloudflare) |
| Webhook Make real conectado | Pendiente externo | Alto | P0 | — | Externo (ver [[BLOQUEOS_EXTERNOS_CLUB_PADEL_04.md]]) |

## Torneos

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Mención en integraciones (`torneos` en Airtable) | Completado (diseño) | Bajo | — | — | — |
| Módulo funcional real de torneos | No implementado en esta app | Medio | P2 | — | Externo/futuro |

## Ranking

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Tabla de ranking visible (demo) | Completado | Bajo | — | — | — |
| Scroll de tabla en móvil probado | Pendiente terminal* | Bajo | P2 | 30 min | Terminal (con navegador) |
| Datos de ranking reales | Pendiente externo | Bajo | P2 | — | Externo (requiere datos del club) |

## Soporte

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Panel Soporte documentado | Completado | Bajo | — | — | — |
| Acceso protegido a panel Soporte | Pendiente externo | Alto | P0 | — | Externo (depende de auth real) |

## Admin

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Panel Admin documentado | Completado | Bajo | — | — | — |
| Acceso protegido a panel Admin | Pendiente externo | Alto | P0 | — | Externo (depende de auth real) |

## Privacidad

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Sin datos falsos de clientes/testimonios | Completado | Bajo | — | — | — |
| Política de privacidad / consentimiento WhatsApp | Pendiente externo | Medio | P1 | — | Externo (legal + proveedor WhatsApp) |

## Seguridad

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Escaneo de secretos limpio | Completado | Bajo | — | — | — |
| `.env` / claves no commiteadas | Completado | Bajo | — | — | — |
| `ALLOWED_ORIGIN` configurado en producción | Pendiente externo | Medio | P1 | 15 min | Externo (Cloudflare/Worker) |
| Autorización server-side (no solo UI) | Pendiente externo | Alto | P0 | — | Externo |

## Make

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Flujo documentado (`app/docs/integraciones.md`) | Completado | Bajo | — | — | — |
| Webhook real configurado | Pendiente externo | Alto | P0 | — | Externo (fuera de alcance de esta fase) |

## Airtable

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Esquema de tablas propuesto (10 tablas) | Completado | Bajo | — | — | — |
| Base real creada con credenciales | Pendiente externo | Medio | P1 | — | Externo |

## WhatsApp

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Casos de uso documentados | Completado | Bajo | — | — | — |
| Proveedor + WhatsApp Business real | Pendiente externo | Alto | P0 | — | Externo |

## Stripe

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Casos de uso documentados | Completado | Bajo | — | — | — |
| Cuenta Stripe real + claves | Pendiente externo | Alto | P0 | — | Externo |

## Drive

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Casos de uso documentados | Completado | Bajo | — | — | — |
| Estructura real de carpetas + credenciales | Pendiente externo | Bajo | P2 | — | Externo |

## Deploy

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Guía de deploy documentada (`app/docs/deployment.md`) | Completado | Bajo | — | — | — |
| Deploy real de frontend + Worker | Pendiente externo | Medio | P1 | 1-2 h | Externo |

## Cliente real

| Ítem | Estado | Riesgo | Prioridad | Tiempo est. | Vía |
|---|---|---|---|---|---|
| Perfil de cliente piloto ideal (agencia) | Completado (en `audit/customer-success`) | Bajo | — | — | — |
| Cliente piloto real firmado | Pendiente externo | Alto | P0 | — | Externo (comercial/ventas) |

## Resumen de prioridades P0 (bloqueantes reales)

1. Autenticación real + autorización server-side (roles).
2. Webhook Make real + despliegue del Worker.
3. Proveedor WhatsApp Business real.
4. Cuenta Stripe real.
5. Cliente piloto real.

Ninguno de estos 5 puntos es resoluble solo desde terminal en este repo: todos
requieren credenciales, cuentas o decisiones externas.
