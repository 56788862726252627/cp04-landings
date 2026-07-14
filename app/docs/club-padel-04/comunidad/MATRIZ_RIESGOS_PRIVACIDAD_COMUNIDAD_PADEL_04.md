# Matriz de riesgos de privacidad — Comunidad Pádel 04

**Estado:** documento de diseño/análisis de riesgo. No sustituye una evaluación de impacto (EIPD/DPIA) formal, que debe realizar un DPO real si el volumen de datos lo requiere (ver punto 6 del checklist legal en `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`).
**Fecha:** 2026-07-14
**Depende de:** `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, `FLUJOS_UI_CONSENTIMIENTO_COMUNIDAD_PADEL_04.md`, `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md`, `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`.

Escala: **Probabilidad/Impacto** = Baja / Media / Alta. **Severidad** = Probabilidad × Impacto, cualitativa (Baja / Media / Alta / Crítica). **Estado** = Mitigado en diseño / Mitigación parcial / Riesgo abierto.

---

| # | Riesgo | Módulo afectado | Dato implicado | Probabilidad | Impacto | Severidad | Mitigación | Responsable | Estado | Revisión legal |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Alta de menores de edad sin verificación ni consentimiento parental | Perfil social, alta general | `UserProfile`, `PlayerSocialProfile` | Media | Alta | **Crítica** | No habilitar alta social hasta definir flujo de verificación/consentimiento parental; posibilidad de desactivar la capa social por tenant | Producto + Legal | Riesgo abierto | Sí |
| 2 | Mención de terceros identificables en posts/comentarios sin su consentimiento | Muro/feed | `CommunityPost.body`, `Comment.body` | Alta | Media | Alta | Aviso explícito al publicar (texto legal §8); moderación humana ante reporte; sin mitigación técnica automática en MVP | Producto | Mitigación parcial | Sí |
| 3 | Imagen de terceros identificables publicada sin su consentimiento | Muro/feed (fotos) | `CommunityPost` + imagen adjunta | Media | Alta | Alta | Declaración obligatoria del usuario al subir (texto legal §5); moderación ante reporte; sin verificación técnica automática | Producto | Mitigación parcial | Sí |
| 4 | Contenido ya visto/capturado por terceros no se revierte al retirar consentimiento | Feed, perfil, partidos abiertos | Cualquier dato expuesto previamente | Alta | Media | Alta | Comunicación explícita del límite en el texto legal (§10 de `TEXTOS_LEGALES...md`); no es un riesgo mitigable técnicamente, solo comunicable con honestidad | Producto + Legal | Riesgo abierto (inherente) | Sí |
| 5 | Fuga de datos sociales entre clubes (tenants) por fallo de aislamiento | Todas las entidades | Todo el modelo social | Baja (si se sigue el diseño) | Alta | Alta | `club_id` obligatorio en toda entidad y toda consulta (ya definido en el modelo y en RLS); reutiliza el mecanismo ya auditado de `tenant-runtime` | Ingeniería (implementación futura) | Mitigado en diseño | No (técnico) |
| 6 | Moderación automatizada sin revisión humana (riesgo de implementación futura incorrecta) | Moderación | `Report`, `ModerationAction` | Baja (si se respeta el diseño) | Alta | Media | Ningún rol "sistema" tiene permiso de escritura en `ModerationAction` (ya definido en RLS §9); regla explícita del prompt | Ingeniería + Producto | Mitigado en diseño | Sí (si se introduce IA en el futuro) |
| 7 | Identidad del reportante revelada al usuario reportado (riesgo de represalia) | Reportes, moderación | `Report.reporter_id` | Baja | Alta | Media | Reportante nunca expuesto en la notificación al reportado (ya definido en RLS §8); solo visible a STAFF/ADMIN/SUPPORT | Producto | Mitigado en diseño | No |
| 8 | Consentimiento premarcado o activado por defecto por error de implementación futura | Todos los consentimientos | `PrivacyConsent` | Media | Alta | Alta | Principio de diseño explícito: ningún consentimiento nace `true`; validar en QA (Prompt Q) antes de cualquier lanzamiento | Ingeniería + QA | Mitigación parcial (pendiente de implementación real) | Sí |
| 9 | Retención insuficiente o excesiva de `Report`/`ModerationAction`/`AuditLog` | Moderación, auditoría | Datos de personas identificables en contexto de conflicto | Media | Media | Media | Plazos ya definidos (24 meses) en el modelo de datos, pendientes de validar con asesoría legal real (no son definitivos) | Legal | Mitigación parcial | Sí |
| 10 | Sobre-exposición de datos de terceros en una exportación de datos propia (p. ej. comentarios ajenos en tu post) | Exportación de datos | `CommunityPost`, `Comment` de terceros | Media | Media | Media | Exportación limitada a entidades donde el usuario es titular directo; comentarios/reacciones de terceros sobre tu contenido se excluyen o se anonimizan (a definir con DPO) | Producto + Legal | Riesgo abierto | Sí |
| 11 | Introducción de datos de categoría especial (art. 9 RGPD) en campos de texto libre | Perfil (`bio`), feed (`body`) | Texto libre del usuario | Media | Alta | Alta | Aviso preventivo en el texto legal; capacidad de moderación/retirada ante reporte; sin filtro automático de contenido en MVP | Producto | Mitigación parcial | Sí |
| 12 | Reidentificación de usuarios a través de `AuditLog.metadata` o `Notification.payload` mal minimizados | Auditoría, notificaciones | `AuditLog.metadata`, `Notification.payload` | Media | Media | Media | Principio de minimización ya establecido (modelo de datos §20); revisión de código obligatoria en implementación (Prompt Q) antes de producción | Ingeniería | Mitigación parcial (pendiente de implementación real) | No (técnico, pero con impacto en cumplimiento) |
| 13 | Confusión entre ranking social y ranking oficial (riesgo reputacional/legal, no solo de datos) | Ranking social | `SocialRanking` | Media | Baja | Baja | Etiquetado obligatorio "no oficial" en todo lugar donde se muestre (ya establecido en roadmap y en este catálogo) | Producto/UX | Mitigado en diseño | No |
| 14 | Bloqueo no efectivo por fallo de implementación (usuario bloqueado sigue interactuando) | Amigos, partidos abiertos, feed | `Friendship.status=blocked` | Baja (si se implementa según diseño) | Alta | Media | Regla transversal ya definida (RLS §7): el bloqueo debe aplicarse en todas las entidades relacionadas; requiere tests específicos en implementación (Prompt Q) | Ingeniería + QA | Mitigación parcial (pendiente de implementación real) | No (técnico, pero con impacto en seguridad de usuarios) |
| 15 | Perfiles falsos o suplantación de identidad dentro del club | Perfil social, amigos | `UserProfile.display_name` | Media | Media | Media | `UserProfile` ligado a `auth_user_id` real (ya verificado por el alta real de la app, fuera de esta capa); posibilidad de reportar perfil falso (`Report.target_type=user`) | Producto | Mitigación parcial | No |
| 16 | Transferencia futura a proveedor externo (email/push/IA de moderación) sin base jurídica actualizada | Notificaciones, moderación | Variable según proveedor | Baja (no aplica todavía) | Alta (si ocurre sin control) | Media | Este documento declara explícitamente que no hay transferencias a terceros hoy (§24 de `CONSENTIMIENTO_PRIVACIDAD...md`); cualquier integración futura requiere actualizar este documento y su base jurídica antes de activarse | Legal + Producto | Riesgo abierto (futuro, no actual) | Sí (cuando aplique) |
| 17 | Usuario no informado con claridad de qué implica cada consentimiento (consentimiento no verdaderamente informado) | Todos los flujos de consentimiento | `PrivacyConsent` | Media | Alta | Alta | Textos borrador ya redactados en lenguaje claro (`TEXTOS_LEGALES_REVISABLES...md`); pendiente de validación legal y de test de comprensión con usuarios reales antes de lanzar | Producto + Legal + UX Writer | Mitigación parcial | Sí |

---

## Resumen de severidad

- **Crítica:** 1 riesgo (menores de edad) — bloqueante hasta decisión de negocio + validación legal.
- **Alta:** 7 riesgos — todos con mitigación de diseño ya aplicada o parcial; ninguno requiere parar el catálogo de prompts, pero sí revisión legal antes de implementación real (Prompt N).
- **Media:** 8 riesgos — mitigación de diseño mayoritariamente aplicada, seguimiento en QA (Prompt Q) recomendado.
- **Baja:** 1 riesgo (confusión ranking social/oficial) — ya mitigado con etiquetado.

## Riesgos que requieren revisión legal antes de cualquier implementación real

De los 17 riesgos, **11 están marcados "Revisión legal: Sí"**. Ninguno de estos 11 debe considerarse cerrado hasta que un abogado/DPO real los revise — este documento solo dispone la evidencia y el análisis técnico-funcional previo, no sustituye esa revisión.

## Qué NO entra todavía (recordatorio, coherente con el resto del catálogo)

Confirmado en este documento: los riesgos aquí listados asumen que **no existe todavía** chat libre real, geolocalización real, pagos reales, moderación automática por IA sin revisión humana, tratamiento de menores sin control específico, publicación de fotos sin consentimiento explícito, integración con `App.jsx`, conexión a Supabase real, ni migraciones SQL ejecutadas. Si cualquiera de estos se activa en el futuro (Prompts K/L/M/N), esta matriz de riesgos debe revisarse y ampliarse — no es válida automáticamente para esas fases sin actualización explícita.
