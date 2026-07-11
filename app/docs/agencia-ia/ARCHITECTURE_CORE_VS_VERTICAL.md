# Arquitectura: CORE PLATFORM vs VERTICAL CONFIG vs CLIENT CONFIG

Fecha: 2026-07-08 · Documento canónico único de esta separación. Reconciliación entre la línea técnica (`audit/agency-platform-architecture/`) y la línea conceptual de negocio (`docs/agencia-ia/`) ya existentes — no sustituye a ninguna, las une bajo una sola referencia para que no diverjan.

## Por qué este documento y no otro nuevo

Antes de crearlo se revisaron:
- `audit/agency-platform-architecture/AGENCY_MULTI_CLIENT_ARCHITECTURE.md` — ya definía las 8 capas (CORE PLATFORM…DEPLOYMENT PROFILE) con evidencia de código, pero vive en una carpeta ignorada por git (`audit/`), por lo que no es una referencia versionada ni descubrible desde `docs/`.
- `docs/agencia-ia/plantillas-replicables/MAPA_MODULOS_REUTILIZABLES_CP04.md` y `MATRIZ_REUTILIZACION_SAAS.md` — clasifican módulos en "específico de Club Pádel 04 / reutilizable para clubes / reutilizable para cualquier negocio", a nivel de negocio, sin mapear a capas técnicas ni a `App.jsx`.
- `docs/agencia-ia/plantilla-deportiva-clonable/configuracion-conceptual/{cliente,modulos,deporte,automatizaciones}/CONFIG_CONCEPTUAL_*.md` — ya definían campos conceptuales (cliente, marca, servicios, horarios, tarifas, módulos base/deportivos/admin/premium) en YAML informal, sin JSON Schema ni tipado.
- `docs/agencia-ia/checklists/CHECKLIST_NO_DUPLICAR_ANTES_DE_CREAR.md` — exige esta misma revisión antes de crear nada nuevo.

**Ninguno de los documentos anteriores define explícitamente los tres niveles CORE PLATFORM / VERTICAL CONFIG / CLIENT CONFIG con sus límites y su patrón de resolución.** Este documento cierra ese hueco citando y enlazando a los anteriores en vez de repetir su contenido. Es la ubicación canónica porque `docs/agencia-ia/` (a diferencia de `audit/agency-platform-architecture/`) **no está en `.gitignore`** y es donde ya vive el resto del conocimiento de la Agencia.

## Las tres capas

### CORE PLATFORM
Lo que es idéntico para cualquier cliente de cualquier vertical. Evidencia de que ya existe en el código:

| Elemento | Estado | Archivo |
|---|---|---|
| Auth | EXISTE | `src/auth/AuthContext.jsx`, `authService.js` |
| RBAC (mecanismo fail-closed) | EXISTE | `src/utils/rbac.js` — `cp04NormalizeRole` |
| Navegación base / shell de aplicación | EXISTE | `App.jsx` (shell, sidebar, layout) — mezclado hoy con contenido de cliente, ver "migración" más abajo |
| Componentes reutilizables | EXISTE | `Card`, `Btn`, `MetricCard`, `LazyLoadBoundary` |
| Reservas como *capability* genérica | PARCIAL | `evaluateSlotAvailability` (`utils/availability.js`) ya opera sobre slots de tiempo, agnóstico de "pista"; el resto del flujo de reserva sigue acoplado a pádel dentro de `App.jsx` |
| Soporte técnico | EXISTE | `CentroTecnico.jsx`, patrón SUPPORT-only, ya lazy-loaded |
| Configuración (mecanismo de carga) | NO_EXISTE | No hay todavía un loader de `client_config` — es lo que Quick Win 2 empieza a formalizar (el schema, no el loader) |
| Observabilidad futura | PARCIAL | Existe para Make (Centro Técnico); no existe para infraestructura/errores/coste — ver `AGENCY_OBSERVABILITY_MODEL.md` |
| Integraciones como interfaces | PARCIAL | `makeLiveClient.js` ya es un adaptador con fail-safe; no hay una interfaz común formal que Stripe/WhatsApp puedan implementar el día que se activen |

### VERTICAL CONFIG
Lo que cambia de sector a sector pero es igual para todos los clientes de ese sector. Corresponde 1:1 a lo que `CONFIG_CONCEPTUAL_DEPORTE.md` ya describe de forma conceptual (tipo, recurso, usuario, reserva, evento, ranking, nivel, métricas) — este documento formaliza esa idea como capa arquitectónica:

- Reglas propias del sector (p. ej. cálculo de precio por franja horaria en pádel; cálculo de bonos por sesión en fisioterapia).
- Tipos de recurso (`pista` en deportivo, `sala`/`profesional` en clínico — ver tabla de `CONFIG_CONCEPTUAL_DEPORTE.md`).
- Vocabulario (`jugador` vs `paciente` vs `cliente` — la etiqueta visible del rol, nunca el mecanismo de RBAC en sí).
- Reglas de disponibilidad específicas (p. ej. franja de mediodía cerrada en pádel; duración variable por tratamiento en fisioterapia).
- Módulos propios del vertical (torneos/ranking en deportivo; seguimiento/historial en clínico — ver `MAPA_VERTICAL_FISIOTERAPIA.md`).
- Métricas del vertical (`ocupación por pista` vs `adherencia al tratamiento`).
- Flujos específicos (alta de torneo vs. alta de bono de sesiones).

### CLIENT CONFIG
Lo que cambia de cliente a cliente dentro del mismo vertical: branding, dominio, locale, timezone, recursos concretos (cuántas pistas/salas tiene *este* cliente), horarios de *este* cliente, roles activos, features activos, integraciones habilitadas, plan contratado, contactos, nivel de soporte, perfil de despliegue. Formalizado como JSON Schema en Quick Win 2 (`config/client-config.schema.json`).

## Límites entre capas (regla de oro)

> Si una pieza de lógica necesita un `if (vertical === ...)` para funcionar, no pertenece a CORE.
> Si un valor cambia de cliente a cliente dentro del mismo vertical, no pertenece a VERTICAL CONFIG, pertenece a CLIENT CONFIG.
> Ninguna capa inferior (CLIENT) debe ser importada por una capa superior (CORE) — la dependencia va siempre CORE ← VERTICAL ← CLIENT, nunca al revés.

## Qué NO debe vivir en `App.jsx`

Evidencia directa del acoplamiento actual (ya documentada con líneas exactas en `AGENCY_MULTI_CLIENT_ARCHITECTURE.md` §0):
- Nombres/precios/tipos de recurso (`COURTS`, `App.jsx:114`).
- Horarios de apertura (`BOOKING_HOURS`, `App.jsx:121`).
- Paleta de color y tipografías fijas de un cliente (hoy correctamente aisladas en `theme.js`, pero sin mecanismo de override).
- Dataset de demo con nombre de club real (`cp04DemoData.js` — ya en archivo propio, pendiente de generalizar).
- Símbolo de moneda `€` cableado directamente en JSX (`App.jsx:3494`, `:3639`, `:5964`).

**Este documento no modifica `App.jsx`** — es un mapa para una extracción futura (Quick Wins 5 y siguientes de `AGENCY_QUICK_WINS_PRIORITY.md`), no una ejecución de esa extracción.

## Qué NO debe hardcodearse (en ningún archivo nuevo, incluido el schema de Quick Win 2)

- Secretos (tokens, webhooks) — nunca en `client_config`, solo su *referencia* por nombre (ver Quick Win 2, campo `integrations.*.secretRef`).
- Nombres de cliente reales fuera de `clients/<slug>/` (evita repetir el error ya corregido de "Club Pádel 04" incrustado en `theme.js`/`index.html`).
- Integraciones no implementadas presentadas como activas (Stripe/WhatsApp deben aparecer siempre con `enabled: false`, nunca omitidas ni marcadas `true` por defecto).

## Patrón de resolución de configuración

Cascada de 3 niveles, el más específico gana, idéntica en espíritu a la ya diseñada para feature flags en `AGENCY_TENANT_CONFIG_MODEL.md` §2:

```
valor_efectivo(campo) =
    client_config[campo]                         si está definido
    ?? vertical_config[vertical][campo]           si está definido
    ?? core_defaults[campo]                       si está definido
    ?? FAIL-CLOSED: módulo/feature OFF, campo requerido → error de validación de schema
```

## Defaults y fail-closed

- Ningún feature/módulo se activa por ausencia de dato — mismo principio que `cp04NormalizeRole` (rol desconocido → el más restrictivo, nunca el más privilegiado).
- `integrations.payments.enabled` y `integrations.messaging.enabled` no tienen "default `false`" simple: **están bloqueados a `false`** en el schema actual (ver Quick Win 2) porque el código ya declara explícitamente que Stripe no está activo "por regla del proyecto" (`src/data/makeInventory.js`, nota del escenario `6323441`). No es una preferencia de cliente, es un guardarraíl de arquitectura.
- Un `client_config` sin `roles` definido nunca hereda "todos los roles" — debe fallar la validación (ver `required` en el schema).

## Ejemplo — vertical Pádel (cliente actual, Club Pádel 04)

```
vertical: "padel"
  CORE aporta: auth, RBAC (PLAYER/STAFF/ADMIN/SUPPORT), shell, Centro Técnico
  VERTICAL aporta: recurso="pista", evento="torneo", ranking=sí, métricas=["ocupación por pista","reservas por hora"]
  CLIENT aporta: 4 pistas concretas, horario 08:00-23:00 con hueco 12:00-17:00 (no confirmado en código hoy — ver nota), precios 10-26€, dominio club-padel-04.pages.dev
```
Nota: `BOOKING_HOURS` en el código actual es una única lista plana (`08:00…22:00` con hueco `12:00`→`17:00` implícito por la ausencia de horas intermedias), no un objeto `apertura/cierre` — el schema de Quick Win 2 modela ambos casos sin inventar una estructura que el código no tiene.

## Ejemplo — futuro vertical no deportivo (Fisioterapia)

Usando el mapeo ya documentado en `docs/agencia-ia/verticales-no-deportivos/fisioterapia/MAPA_VERTICAL_FISIOTERAPIA.md` (no se repite aquí, se referencia):
```
vertical: "fisioterapia"
  CORE aporta: lo mismo (auth, RBAC, shell, soporte) — sin cambios de código en CORE
  VERTICAL aporta: recurso="sala"/"profesional", evento="sesión", ranking=no aplica, métricas=["adherencia al tratamiento","bonos consumidos"]
  CLIENT aporta: nº de salas de una clínica concreta, horario de esa clínica, nombre/logo/dominio de esa clínica
```
El punto clave: **CORE no cambia una sola línea** al pasar de pádel a fisioterapia. Si en el futuro se detecta que sí hace falta tocar CORE para soportar un vertical nuevo, es una señal de que algo se clasificó mal en esta tabla, no de que el modelo esté equivocado.

## Estrategia de migración gradual desde el código actual

No se ejecuta en esta tarea (regla: no tocar `App.jsx`). Orden recomendado, ya alineado con `AGENCY_QUICK_WINS_PRIORITY.md`:
1. **Preparar sin conectar** (Quick Win 5, pendiente): mover `COURTS`/`BOOKING_HOURS`/etc. a `src/data/clientConfig.default.js` — archivo nuevo, `App.jsx` sigue usando sus constantes actuales, cero riesgo.
2. **Validar contra el schema** (depende de Quick Win 2, este mismo documento): confirmar que los valores actuales de Club Pádel 04 son válidos contra `client-config.schema.json` antes de tocar nada más.
3. **Cablear un único punto de lectura en `App.jsx`**: sustituir las constantes fijas por una lectura desde el config ya validado — este es el primer cambio funcional real, y queda fuera del alcance de esta tarea (requiere autorización explícita, mismo criterio que se ha aplicado en todas las fases anteriores de este proyecto).
4. **Repetir para `theme.js`/`visualAssets.js`** (branding) una vez el patrón de (1)-(3) esté probado con un campo de bajo riesgo.

## Documentos relacionados (no duplicados por este)

- `audit/agency-platform-architecture/AGENCY_MULTI_CLIENT_ARCHITECTURE.md` — evidencia de código y las 8 capas completas (incluye SECRETS/DEPLOYMENT PROFILE, fuera del alcance de este documento).
- `audit/agency-platform-architecture/AGENCY_VERTICALIZATION_STRATEGY.md` — detalle de qué capability de cada vertical existe/no existe.
- `docs/agencia-ia/plantillas-replicables/MAPA_MODULOS_REUTILIZABLES_CP04.md` — clasificación de negocio módulo a módulo.
- `docs/agencia-ia/plantilla-deportiva-clonable/configuracion-conceptual/*/CONFIG_CONCEPTUAL_*.md` — primera versión conceptual (YAML informal) de lo que este documento formaliza como capas con límites y patrón de resolución.
- `config/client-config.schema.json` (Quick Win 2) — implementación validable de la capa CLIENT CONFIG descrita aquí.
