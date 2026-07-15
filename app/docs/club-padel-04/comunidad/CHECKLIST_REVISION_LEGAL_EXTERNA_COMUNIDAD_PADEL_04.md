# Checklist de revisión legal externa — Comunidad Pádel 04

**Estado:** checklist de preparación para entregar a un abogado/DPO real. **Borrador técnico/legal revisable — no sustituye asesoramiento legal profesional. No afirma cumplimiento normativo al 100% en ningún punto.** Este documento no realiza ninguna revisión legal por sí mismo: organiza qué debe revisarse y qué debe entregarse.
**Fecha:** 2026-07-15
**Depende de:** `DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md`, `MATRIZ_BLOQUEOS_NO_TECNICOS_COMUNIDAD_PADEL_04.md` (mismo directorio).

---

## Documentos a entregar al abogado/DPO

- [ ] `ROADMAP_COMUNIDAD_PADEL_04_PLAYTOMIC_VOLA.md` (visión general y alcance).
- [ ] `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` + `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md` (qué datos se tratan, campo a campo).
- [ ] `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` (quién puede ver/editar/borrar cada dato).
- [ ] `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md` + `FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md` (mecanismo de consentimiento granular).
- [ ] `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md` (los 15 borradores de texto, para redacción final).
- [ ] `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` (17 riesgos ya identificados por el equipo técnico).
- [ ] `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md` + `MATRIZ_ACCIONES_MODERACION_COMUNIDAD_PADEL_04.md` (flujo de moderación y sanciones).
- [ ] `DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md` (este paquete, las 3 opciones sobre menores).
- [ ] `QA_SEGURIDAD_CIERRE_CALIDAD_COMUNIDAD_PADEL_04.md` + `MATRIZ_READINESS_INTEGRACION_COMUNIDAD_PADEL_04.md` (estado técnico general).

## Puntos de revisión RGPD

- [ ] Base jurídica declarada por cada tipo de tratamiento (consentimiento vs. interés legítimo) — validar si es correcta para cada caso, especialmente moderación/auditoría (interés legítimo) vs. funciones sociales (consentimiento).
- [ ] Minimización de datos — confirmar que ningún campo del modelo de datos excede lo necesario para su función.
- [ ] Derechos ARSULIPO (acceso, rectificación, supresión, limitación, oposición, portabilidad) — confirmar que los flujos ya diseñados (`FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md`, flujos 11-12) los cubren de forma suficiente.
- [ ] Necesidad de una Evaluación de Impacto (EIPD/DPIA) formal antes de producción, según volumen esperado de usuarios.
- [ ] Registro de Actividades de Tratamiento (RAT) — confirmar si Comunidad Pádel 04 requiere una entrada nueva o una ampliación de la existente.

## Puntos de revisión LOPDGDD

- [ ] Requisitos específicos españoles no cubiertos por el RGPD general (p. ej. plazos de conservación, derecho al olvido reforzado, tratamiento de menores según la LOPDGDD art. 7).
- [ ] Validez del consentimiento otorgado por medios electrónicos tal como está diseñado (`PrivacyConsent`, versión de texto aceptado) bajo criterio español.
- [ ] Si aplica algún régimen sectorial adicional (deporte, asociaciones/clubes) que module lo anterior.

## Consentimiento granular

- [ ] Validar que los 8 tipos de consentimiento ya diseñados (5 en el modelo mergeado + 3 propuestos: `social_layer_opt_in`, `publish_photos`, `ranking_visibility`) son jurídicamente independientes entre sí y no deberían fusionarse ni desagregarse más.
- [ ] Validar el mecanismo de revocación retroactiva ya implementado y probado (`community-logic`, PR #23) como suficiente desde el punto de vista legal, no solo técnico.
- [ ] Validar si se requiere un consentimiento renovado periódicamente (p. ej. cada X meses) o si "hasta que se revoque" es suficiente.

## Menores de edad

- [ ] Confirmar la edad mínima aplicable (ver pregunta 1 de `DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md`).
- [ ] Evaluar las 3 opciones (A/B/C) del documento de decisión y confirmar, matizar o rechazar la recomendación de producto (Opción A para el MVP).
- [ ] Si se contempla la Opción B o C en el futuro, definir el mecanismo mínimo de verificación parental aceptable.

## Derecho de imagen

- [ ] Validar el texto borrador de "publicaciones/fotos" (`TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md`, texto 5) — en particular la declaración del usuario de que la imagen es suya o tiene derecho a compartirla, y si eso es jurídicamente suficiente o requiere un consentimiento explícito adicional de terceros identificables en la foto.
- [ ] Evaluar el riesgo ya señalado (`AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md`, sección 21) de que un usuario etiquete o incluya a otro sin su consentimiento.

## Moderación y reportes

- [ ] Validar que el anonimato del reportante frente al reportado (ya implementado y probado en `community-logic`) es jurídicamente correcto y no genera un riesgo de indefensión del reportado.
- [ ] Validar el plazo de retención de `Report`/`ModerationAction` (24 meses, propuesto en el modelo de datos) — confirmar si es adecuado o debe ajustarse.
- [ ] Validar si existe obligación de comunicar a un reportado el motivo general de una sanción (ya implementado como "resumen genérico sin notas internas") o si la normativa exige más detalle.

## Retención de datos

- [ ] Revisar la tabla completa de retención ya propuesta (`MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, sección 27) entidad por entidad.
- [ ] Confirmar el plazo de 5 años tras baja para `PrivacyConsent` (propuesto como prueba de cumplimiento pasado, sin validar).

## Eliminación/exportación

- [ ] Validar el flujo de "solicitar eliminación" (`FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md`, flujo 12) como suficiente para el derecho de supresión.
- [ ] Validar el flujo de "exportar datos" (flujo 11) y confirmar si debe incluir o excluir `AuditLog`/`ModerationAction` en el paquete exportado (ya señalado como punto abierto).

## Responsabilidades del club

- [ ] Definir contractualmente qué asume el club (especialmente en la Opción C de menores, y en general para la moderación de su propio muro/eventos).
- [ ] Confirmar si el club actúa como responsable o corresponsable del tratamiento, o únicamente como usuario de una plataforma cuyo responsable es la Agencia IA.

## Responsabilidades de la agencia/SaaS

- [ ] Confirmar el rol de la Agencia IA como encargado o responsable del tratamiento (probablemente responsable, a confirmar).
- [ ] Confirmar si se requiere un Acuerdo de Encargo de Tratamiento (AET) específico con cada club, adicional al contrato comercial ya existente.

## Textos legales pendientes de aprobación

- [ ] Los 15 textos de `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md`, ninguno aprobado todavía — requieren redacción final por el abogado/DPO, no solo revisión.
- [ ] El aviso de menores (texto 13) depende directamente de qué opción (A/B/C) se decida — no redactar la versión final hasta cerrar esa decisión.

## Decisión go/no-go para integración real

- [ ] **NO-GO** para cualquier integración con `App.jsx` o datos reales mientras: (a) no se haya resuelto al menos la pregunta 1 de menores (edad mínima aplicable), y (b) no se haya decidido si se requiere una EIPD/DPIA formal antes de producción.
- [ ] **GO condicionado** para continuar con Comunidad Pádel 04 como demo/mock interna (datos ficticios, sin usuarios reales) mientras se resuelve lo anterior — ver `MATRIZ_BLOQUEOS_NO_TECNICOS_COMUNIDAD_PADEL_04.md`.
