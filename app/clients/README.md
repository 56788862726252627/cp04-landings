# `clients/` — Perfiles de cliente de la Agencia IA

Fecha: 2026-07-08 · Quick Win 8. Estructura operativa, sin ningún cliente real todavía. No se ha desplegado ni se desplegará nada desde esta tarea.

## 1. Propósito de `clients/`

Cada subcarpeta `clients/<slug>/` es el perfil operativo completo de un cliente: su `client-config.json` (validado contra `config/client-config.schema.json`), su documentación de branding/deploy/integraciones/QA/onboarding, sus referencias a secrets (nunca los valores) y su estado de despliegue. Es la capa **CLIENT CONFIG** descrita en `docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md`, llevada a una ubicación operativa además de al esquema técnico.

Hoy solo existe `clients/_template/` — la plantilla. **Ningún cliente real está creado.**

## 2-4. Qué pertenece a CORE / VERTICAL / CLIENT

Referencia completa: `docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md`. Resumen aplicado a esta carpeta:

- **CORE** (nunca vive en `clients/`): auth, RBAC (mecanismo), shell de la app, `evaluateSlotAvailability`, Centro Técnico. Vive en `src/`.
- **VERTICAL** (nunca vive en `clients/<slug>/`, viviría en un futuro `src/data/verticalConfig.<vertical>.js`, hoy NO_EXISTE): vocabulario y reglas del sector (p. ej. modalidades/niveles de pádel). Un perfil de cliente **referencia** su vertical (`client-config.json` no tiene campo `vertical` en el schema v1 — ver nota en §16), no lo redefine.
- **CLIENT** (sí vive en `clients/<slug>/`): todo lo que cambia de cliente a cliente dentro del mismo vertical — branding, dominio, locale, timezone, recursos concretos, roles activos, features activos, integraciones habilitadas, plan, contacto, soporte, perfil de despliegue.

## 5. Naming del slug

Mismo `pattern` que `config/client-config.schema.json` exige para `slug`/`tenantId`: minúsculas, números y guiones, 2-50 caracteres, empieza y termina en alfanumérico (`^[a-z0-9]([a-z0-9-]{0,48}[a-z0-9])?$`). El nombre de la carpeta `clients/<slug>/` debe ser idéntico al campo `slug` de su `client-config.json` — un único identificador, no dos.

## 6. Lifecycle del cliente

```
onboarding → activo → suspendido → baja
```
Se registra en `STATUS.md` de cada cliente (ver plantilla). No existe automatización de transición de estado — es manual, con fecha y responsable.

## 7. Cómo crear un perfil nuevo

1. Copiar `clients/_template/` a `clients/<slug-real>/`.
2. Renombrar `client-config.json.example` a `client-config.json` y rellenar con los datos reales del cliente (nunca placeholders en un cliente real).
3. Rellenar `BRANDING.md`, `DEPLOYMENT_PROFILE.md`, `INTEGRATIONS.md`, `ONBOARDING_NOTES.md`, `SECRETS_REFERENCES.md`, `STATUS.md`.
4. Validar (§8) antes de continuar.
5. Ejecutar `QA_CHECKLIST.md` antes de marcar `activo` en `STATUS.md`.

Este documento **no ejecuta** el paso 1 por nadie — ninguna carpeta de cliente real se crea en esta tarea.

## 8. Cómo validar `client-config.json`

Contra `config/client-config.schema.json` (ver `config/CLIENT_CONFIG_SCHEMA_GUIDE.md` para el método de validación usado en este proyecto, dado que no hay `ajv` instalado). Un `client-config.json` que no valide **no debe pasar** a branding/integraciones — es un bloqueo duro, no una advertencia.

## 9. Cómo gestionar branding

Ver `_template/BRANDING.md`. Los tokens de tema (`bg`, `accent`, `fontDisplay`, etc.) siguen el mecanismo `resolveTheme(coreTheme, verticalOverride, clientOverride)` de `src/theme.js` (Quick Win 3) — el `clientOverride` de un cliente real se derivaría de su `client-config.json.theme`, no se edita `theme.js` por cliente.

## 10. Cómo referenciar secrets sin almacenar valores

Nunca un valor. Solo el **nombre** de la variable gestionada como Wrangler secret (mismo patrón que `MAKE_RESERVAS_WEBHOOK`/`AIRTABLE_TOKEN` ya en producción). Ver `_template/SECRETS_REFERENCES.md` y los campos `integrations.automation.webhookRef` / `integrations.data.baseIdRef` del schema.

## 11. Cómo preparar el deployment profile

Ver `_template/DEPLOYMENT_PROFILE.md`. `deploymentProfile` en `client-config.json` debe ser `"development"` durante todo el onboarding y solo pasar a `"production"` tras completar el checklist de la Fase 6 de este documento — nunca antes.

## 12. Cómo documentar integraciones

Ver `_template/INTEGRATIONS.md`. Solo se documentan integraciones que existan de verdad en el código (`make`, `airtable`) o que estén explícitamente `enabled: false` con `provider: "none"` (pagos/mensajería/IA) — nunca se documenta una integración como activa si no lo está.

## 13. Cómo ejecutar QA

Ver `_template/QA_CHECKLIST.md` — mismo criterio que el resto de este proyecto: distinguir "probado automáticamente" / "verificado por build" / "inspeccionado estáticamente" / "pendiente de prueba manual", nunca inventar una validación no ejecutada.

## 14. Cómo marcar estado

`_template/STATUS.md` — un único archivo por cliente, editado manualmente, con fecha ISO de cada transición.

## 15. Cómo archivar/deprecar un cliente

Cambiar `estado` a `baja` en `STATUS.md` con fecha y motivo. No se borra la carpeta (trazabilidad histórica, mismo criterio ya aplicado en este repositorio con backups/auditorías previas) salvo decisión explícita y documentada aparte.

## 16. Qué NO debe copiarse de `_template/` a un cliente real

- Ningún valor placeholder (`NOMBRE_COMERCIAL_DEL_CLIENTE`, `nombre-cliente-ejemplo`, dominios `.example`, `clientId` con ceros) puede sobrevivir a un cliente real — son deliberadamente inválidos como identidad real.
- El campo `vertical` **no existe en el schema v1** (ver `config/CLIENT_CONFIG_SCHEMA_GUIDE.md` §compatibilidad futura) — no se debe inventar un campo `vertical` dentro de `client-config.json` sin antes extender el schema formalmente; hoy el vertical de un cliente se documenta solo en `ONBOARDING_NOTES.md`, no en el JSON.

## 17. Qué NO debe hardcodearse

- Secretos (ver §10).
- `deploymentProfile: "production"` antes de completar el checklist real.
- Cualquier integración (`payments`, `messaging`, `ai`) con `enabled: true` sin que exista código real que la soporte — el schema ya lo impide por `const: false`, pero tampoco debe intentarse burlar editando el schema para un cliente concreto.

## Flujo operativo de alta de cliente

Versión operativa, centrada en qué pasa dentro de `clients/<slug>/` en cada etapa — no sustituye el pipeline comercial completo de 17 fases de `audit/agency-platform-architecture/AGENCY_CLIENT_ONBOARDING_PIPELINE.md` (LEAD→CUALIFICACIÓN→DEMO→PROPUESTA→CONTRATO→PAGO INICIAL), que precede a `DISCOVERY` aquí. Sin automatizaciones implementadas — cada paso es manual o semiautomatizable con las herramientas ya existentes en el repo (schema, tests, checklist).

```
DISCOVERY
  → Se documenta el vertical y las necesidades del cliente.
  → Salida: primera versión de ONBOARDING_NOTES.md (fuera de clients/ todavía,
    borrador comercial).

PRE-SALE HANDOFF
  → El equipo comercial entrega el contexto al equipo técnico.
  → Salida: datos suficientes para rellenar client-config.json.

CLIENT PROFILE
  → Se copia clients/_template/ a clients/<slug-real>/.
  → Salida: carpeta de cliente creada, con placeholders todavía.

CONFIG VALIDATION
  → client-config.json se rellena con datos reales y se valida contra
    config/client-config.schema.json (§8 de este documento).
  → Bloqueo duro: si no valida, no se avanza.

BRANDING
  → Se completa BRANDING.md; si aplica, se define el override de theme.js
    (Quick Win 3) en client-config.json.theme.

INTEGRATIONS
  → Se completa INTEGRATIONS.md. Alta real de Airtable/Make coordinada con
    el equipo responsable de esas integraciones (fuera de esta plantilla).

QA
  → Se ejecuta QA_CHECKLIST.md completo. Ningún ítem "pendiente de prueba
    manual" sin resolver antes de continuar.

DEPLOYMENT
  → Se sigue DEPLOYMENT_PROFILE.md y el checklist técnico de
    AGENCY_DEPLOYMENT_TEMPLATE.md. deploymentProfile pasa a "staging" y,
    tras confirmar, a "production".

GO-LIVE
  → STATUS.md se actualiza a "activo" con fecha. Es el único punto del
    flujo donde el cliente puede describirse como desplegado.

CUSTOMER SUCCESS
  → Traspaso a soporte continuo (Centro Técnico, SUPPORT-only, ya
    construido) — fuera del alcance de esta plantilla, que termina en GO-LIVE.
```

## Estructura de esta carpeta

```
clients/
  README.md              — este documento
  _template/              — plantilla, sin cliente real
    client-config.json.example
    BRANDING.md
    DEPLOYMENT_PROFILE.md
    INTEGRATIONS.md
    QA_CHECKLIST.md
    ONBOARDING_NOTES.md
    SECRETS_REFERENCES.md
    STATUS.md
```

## Documentos relacionados (no duplicados aquí)

- `docs/agencia-ia/ARCHITECTURE_CORE_VS_VERTICAL.md` — capas CORE/VERTICAL/CLIENT.
- `config/client-config.schema.json` + `config/CLIENT_CONFIG_SCHEMA_GUIDE.md` — schema y su guía.
- `src/data/clientConfig.default.js` — valores por defecto **reales** de Club Pádel 04 (el único cliente activo hoy), no una plantilla vacía; sirve de referencia de forma pero no se copia literalmente a un cliente nuevo.
- `audit/agency-platform-architecture/AGENCY_CLIENT_ONBOARDING_PIPELINE.md` — pipeline completo de 17 fases (LEAD→FACTURACIÓN); la Fase 6 de este documento es una versión operativa resumida de su tramo técnico.
