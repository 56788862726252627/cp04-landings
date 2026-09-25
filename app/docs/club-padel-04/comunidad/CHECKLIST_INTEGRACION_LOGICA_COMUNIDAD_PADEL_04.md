# Checklist de integración de la lógica aislada — Comunidad Pádel 04

**Estado:** checklist de control. Complementa (no sustituye) `CHECKLIST_PRE_INTEGRACION_APPJS_COMUNIDAD_PADEL_04.md`, ya mergeado. **Borrador técnico/legal revisable, pendiente de validación por abogado/DPO en los puntos que dependan de datos personales o consentimiento — no sustituye asesoramiento legal profesional. No afirma cumplimiento normativo al 100% en ningún punto.**
**Fecha:** 2026-07-14
**Depende de:** `app/projects/club-padel-04/community-logic/README.md` (mismo repositorio).

---

## Estado actual

- [x] 16 entidades mock implementadas (`entities/store.mjs`).
- [x] 8 módulos de lógica pura implementados (`logic/*.mjs`).
- [x] 59 tests ejecutados, 59 en verde (`node --test tests/*.test.mjs`).
- [x] Un bug real detectado y corregido por los propios tests antes de este commit (ver README, "Un bug real detectado por los propios tests").
- [x] Doble barrera de bloqueo probada explícitamente, no solo documentada.
- [x] Revocación retroactiva de consentimiento probada explícitamente.
- [x] Minimización de datos en vistas de moderación probada explícitamente.

## Antes de importar este módulo desde un componente React real

- [ ] Confirmar que el `store` en memoria de este módulo se sustituye por llamadas reales (Supabase o el backend que se decida) sin cambiar la firma de las funciones de `logic/*.mjs` — el objetivo de diseñarlas como funciones puras sobre un store explícito es que la integración futura solo tenga que cambiar de dónde viene y a dónde va el `store`, no reescribir las reglas.
- [ ] Resolver los 3 huecos ya documentados en el README (`Friendship.status=cancelled`, `slotsTotal=1` sin auto-`full`, `Report.targetType` para partidos) antes de conectar a datos reales — no bloquean seguir probando en local, sí bloquean producción.
- [ ] Decidir si `Grupos`/`Eventos`/`Ranking social` (estructura mínima, sin lógica todavía) se desarrollan en un prompt propio antes de la integración, o se posponen a después del primer módulo integrado.
- [ ] Ejecutar los 59 tests en CI (no solo local) antes de cualquier PR que importe este módulo desde `App.jsx`.

## Antes de tocar App.jsx con este módulo

- [ ] Autorización explícita del usuario para tocar `App.jsx` (Prompt N) — no concedida por la existencia de este módulo ni de este checklist.
- [ ] Revisar `CHECKLIST_PRE_INTEGRACION_APPJS_COMUNIDAD_PADEL_04.md` completo (ya mergeado) — este documento no lo repite, lo complementa.
- [ ] Los 2 bloqueantes de negocio/legal ya identificados en `QA_SEGURIDAD_CIERRE_CALIDAD_COMUNIDAD_PADEL_04.md` (menores de edad, validación legal externa) siguen sin resolver — la existencia de tests no los resuelve, son de naturaleza distinta (negocio/legal, no técnica).

## Qué se puede hacer ya, sin esperar a las decisiones pendientes

- [ ] Ampliar la cobertura de tests si se detectan casos límite adicionales.
- [ ] Diseñar (sin implementar) la lógica de Grupos/Eventos/Ranking siguiendo el mismo patrón de este módulo, en un prompt futuro.
- [ ] Usar este módulo como base de datos mock para iterar sobre los prototipos HTML ya existentes (`community-prototypes/`), si se quiere dar interactividad real a los mocks sin tocar `App.jsx` — evaluar como prompt aparte, no incluido aquí.
