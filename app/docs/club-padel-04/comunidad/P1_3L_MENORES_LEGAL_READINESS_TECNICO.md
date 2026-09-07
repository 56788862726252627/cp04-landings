# P1.3-L — Menores + Legal Readiness Técnico

**Fecha:** 2026-08-16
**Estado:** COMPLETADO (readiness técnico) — Validación legal externa: PENDIENTE
**Rama activa:** docs/resultado-merge-pr52-66-20260727

---

## 1. Esto es readiness técnico, no asesoramiento legal

Este documento describe las decisiones de ingeniería implementadas para
preparar la capa social de Comunidad Pádel 04 ante una política conservadora
de lanzamiento. **No constituye asesoramiento jurídico** ni garantía de
cumplimiento normativo. Ninguna afirmación de este documento sustituye el
dictamen de un abogado especializado en protección de datos o un DPO.

---

## 2. Política conservadora adult-only temporal

Se ha implementado un **age policy gate** que aplica la política:

> La capa social (Comunidad) está disponible solo para perfiles cuyo estado
> de mayoría de edad haya sido verificado activamente (`adult_verified`).
> Cualquier otro estado — `age_unknown`, `minor_or_below_policy`,
> `verification_pending` — bloquea el acceso a la capa social.

Esta política es:
- **Conservadora por defecto**: la ausencia de verificación es equivalente a bloqueo.
- **Temporal**: reversible cuando un abogado/DPO apruebe un modelo alternativo.
- **Centrada en la capa social**: reservas, torneos y el núcleo del club no están afectados.

---

## 3. Qué significa "verified" técnicamente

El campo `ageStatus` para un perfil puede tomar estos valores:

| Estado | Significado técnico | Acceso a Comunidad |
|--------|---------------------|-------------------|
| `adult_verified` | El sistema marcó activamente este perfil como verificado | Permitido |
| `age_unknown` | No existe dato de edad (default conservador) | Bloqueado |
| `minor_or_below_policy` | El perfil está por debajo del umbral de la política | Bloqueado |
| `verification_pending` | Proceso iniciado, sin resultado todavía | Bloqueado |

**Nota crítica:** El modelo actual de CP04 **no almacena fecha de nacimiento (DOB)**.
El campo `dateOfBirth` no existe en ninguna entidad del sistema. La verificación
de `adult_verified` debe provenir de un proceso externo (backend, DPO, flujo
de onboarding) que asigne el status al perfil. El bridge acepta el status
como dato externo y no lo infiere ni verifica por cuenta propia.

**La constante `ADULT_ONLY_MIN_AGE = 18`** es una decisión conservadora interna
temporal del equipo de producto. No afirma que 18 años sea el umbral legal
definitivo aplicable — ese umbral depende de la jurisdicción, el tipo de dato
tratado y la decisión del DPO/abogado.

---

## 4. Qué sucede con `age_unknown`

Un perfil sin edad verificada:
- No puede crear publicaciones ni comentar.
- No puede enviar solicitudes de amistad ni seguir a otros.
- No puede crear ni solicitar unirse a partidos abiertos.
- No puede acceder al feed social (communityGetFeedPage devuelve `ok:false`).
- No puede ver sus notificaciones sociales (communityGetNotifications devuelve `[]`).
- La UI muestra una pantalla de bloqueo con mensaje neutro.

Las operaciones de **consulta de estado** (isBlocked, getFriendshipState,
getProfileVisibility) y las operaciones de **seguridad** (block/unblock) no
requieren `adult_verified` — son acciones de gestión, no de participación social.

---

## 5. Qué sucede con menores (minor_or_below_policy)

El comportamiento es idéntico al de `age_unknown`: la capa social está
completamente bloqueada. No se diferencia entre "menor de 18" y "edad desconocida"
en el tratamiento de datos — en ambos casos, sin verificación activa, no hay acceso.

---

## 6. Core del club no afectado

El age gate aplica **únicamente** a la capa social (module communityBridge.js).
Las siguientes funcionalidades del club son completamente independientes y
no están afectadas por ninguna decisión de política de edad:

- Sistema de reservas de pistas (worker-reservas)
- Módulo de torneos
- Autenticación y gestión de sesión
- Panel de administración
- Centro Técnico

---

## 7. Qué NO se implementa

- **Consentimiento parental**: no existe ningún mecanismo de opt-in parental.
  Construirlo requiere un flujo de identidad verificada del adulto responsable,
  que está fuera del alcance de esta fase y requiere diseño jurídico previo.

- **Verificación documental de identidad**: el sistema no solicita ni procesa
  documentos (DNI, pasaporte, etc.). La asignación de `adult_verified` es una
  operación de backend fuera del scope de community-logic/communityBridge.

- **Opción B / Opción C del PR #24**: no se implementa ninguna de las
  alternativas que implicaban acceso parcial para menores o flujos de
  verificación gradual. La política es adult-only simple hasta que el DPO
  indique lo contrario.

---

## 8. Dependencia de revisión abogado/DPO

Antes de cualquier uso con datos reales o usuarios reales, se requiere:

1. **Dictamen sobre edad mínima aplicable**: ¿Es 18 el umbral correcto para
   la jurisdicción y el tipo de datos tratados? ¿Aplica la excepción de 14
   años del RGPD para servicios de la sociedad de la información?

2. **Posición sobre `minor_or_below_policy`**: ¿Debe el sistema rechazar
   el registro de menores o solo bloquear la capa social?

3. **Revisión del modelo de consentimiento**: ¿El flujo de `social_layer_opt_in`
   actual es válido para adultos? ¿Qué cambios se necesitan para menores en
   caso de aprobarse un modelo de consentimiento parental?

---

## 9. Dependencia de EIPD/DPIA

La decisión de tratar datos sociales de menores (en cualquier forma) requiere
una **Evaluación de Impacto de Protección de Datos (EIPD/DPIA)** según el
artículo 35 del RGPD cuando:
- El tratamiento implica a personas vulnerables (incluidos menores).
- Se usan datos de perfil con fines sociales/comunitarios a gran escala.

La decisión de si es necesaria la EIPD y su alcance corresponde al DPO.
Este codebase mantiene el NO-GO para datos reales hasta que esa decisión esté tomada.

---

## 10. Condiciones para levantar el NO-GO

El acceso con datos reales queda condicionado a:

- [ ] Dictamen escrito de abogado/DPO sobre umbral de edad aplicable.
- [ ] Decisión sobre necesidad y resultado de EIPD/DPIA.
- [ ] Aprobación explícita del modelo de verificación de edad elegido.
- [ ] Actualización de la constante `ADULT_ONLY_MIN_AGE` si procede.
- [ ] Revisión del flujo de `communitySetAgeStatus` para integración con backend real.
- [ ] Merge o cierre formal del PR #24.

---

## 11. Relación con PR #24

El **PR #24** (`docs: comunidad legal minors readiness`) sigue en estado **DRAFT**
y no ha sido mergeado. Contiene documentación de análisis de opciones legales
para menores que fue generada en una sesión anterior. Este P1.3-L es la
implementación técnica de la opción más conservadora (adult-only) sin esperar
la resolución del PR #24.

**El PR #24 NO debe mergearse sin validación legal externa.**
Este código P1.3-L es compatible con cualquier decisión futura derivada del PR #24.

---

## 12. DoD técnico

- [x] `src/utils/communityAgePolicy.js` — módulo puro de política de edad (23 tests)
- [x] `src/utils/communityBridge.js` — age gate integrado en operaciones sociales
- [x] `src/components/ComunidadDemo.jsx` — UI de bloqueo + demo player marcado `adult_verified`
- [x] `src/utils/communityAgePolicy.test.mjs` — 23 tests del módulo puro
- [x] `src/utils/communityBridge.test.mjs` — +21 tests del gate integrado (139 total)
- [x] `src/utils/communityRepository.test.mjs` — regresión actualizada (66 total)
- [x] Build PASS
- [x] P0/P1.1/P1.2/P1.3 intactos (87 + 139 + 66 = 292 tests base, 315 total)
- [x] Sin llamadas a servicios externos
- [x] Sin DOB almacenada
- [x] Sin consentimiento parental
- [x] Sin verificación documental
- [x] Gate en bridge (no solo en UI)
- [x] Mensajes UI sin lenguaje legal inadecuado

---

## 13. Bloqueadores legales que siguen abiertos

1. **Umbral de edad**: `ADULT_ONLY_MIN_AGE = 18` es provisional. El umbral
   definitivo (14, 16 o 18) depende de la LOPD-GDD y el tipo de servicio.

2. **EIPD/DPIA**: no realizada. Sin ella, el tratamiento de datos sociales
   de menores en producción tiene riesgo legal no cuantificado.

3. **Verificación de edad en backend**: no existe mecanismo real para asignar
   `adult_verified` en producción. El backend/Worker debe implementar el flujo
   de verificación antes de que `communitySetAgeStatus` pueda usarse con datos reales.

4. **Consentimiento parental**: no implementado. Si el DPO aprueba acceso
   parcial para menores de cierta edad, se requeriría diseño adicional.

5. **PR #24**: sigue DRAFT. La documentación de análisis de opciones legales
   no ha sido revisada externamente.
