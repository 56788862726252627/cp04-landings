# Matriz de riesgos antes de conectar backend real — Comunidad Pádel 04

**Estado:** documento de análisis de riesgo. **Borrador técnico/legal revisable, pendiente de validación por abogado/DPO en las áreas legales — no sustituye asesoramiento legal profesional. No afirma cumplimiento normativo al 100% en ningún punto.**
**Fecha:** 2026-07-14
**Depende de:** `app/projects/club-padel-04/community-logic/README.md`, `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` (ya mergeado).

Este documento **no repite** los 17 riesgos ya catalogados en `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` — los complementa con los riesgos específicos de pasar de "lógica en memoria, probada con mocks" a "lógica conectada a un backend real" (Supabase u otro).

---

| # | Riesgo | Probabilidad | Impacto | Severidad | Mitigación | Estado |
|---|---|---|---|---|---|---|
| 1 | Las funciones puras asumen que el `store` completo cabe en memoria y es consistente en cada llamada; un backend real es concurrente y puede tener condiciones de carrera (dos `requestToJoin` simultáneas sobre la última plaza) | Media | Alta | Alta | Traducir las validaciones de este módulo a transacciones/constraints reales (p. ej. `slots_filled < slots_total` como check constraint en Supabase), no solo a nivel de aplicación | Riesgo abierto, no mitigado en este módulo |
| 2 | La doble barrera de bloqueo aquí es de aplicación (JS); en producción debe reforzarse también a nivel de RLS (ya diseñado en `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md`, sección 12) para que un fallo de aplicación no la anule | Baja (si se sigue el diseño ya existente) | Alta | Media | Implementar las políticas RLS ya especificadas antes de exponer cualquier endpoint real | Diseño ya existente, sin ejecutar |
| 3 | `hasConsent`/`grantConsent`/`revokeConsent` de este módulo no son atómicos con la acción que gatean (p. ej. crear un post y comprobar consentimiento son dos pasos separados en memoria) — en un backend real, una condición de carrera podría permitir publicar justo al revocar | Baja | Media | Media | Diseñar la verificación de consentimiento como parte de la misma transacción/política RLS que la escritura, no como una comprobación previa separada | Riesgo abierto, no mitigado en este módulo |
| 4 | Los mensajes de error de este módulo (`throw new Error(...)`) son descriptivos y en español — útiles para depurar, pero no deben propagarse tal cual a la UI final sin revisión (podrían filtrar detalles internos no pensados para el usuario) | Media | Baja | Baja | Mapear los errores de este módulo a mensajes de UI ya diseñados en los prototipos/flujos, no mostrar el `Error.message` interno directamente | A resolver en la capa de integración, no en este módulo |
| 5 | El identificador `authUserId` de `UserProfile` es un mock (`mock-auth-<uuid>`) — la integración real debe sustituirlo por el `auth_user_id` real de `authService`, sin tocar ese sistema (ya señalado en el modelo de datos, sección 6.1) | Baja | Alta (si se hace mal) | Media | Seguir exactamente el contrato ya documentado: `UserProfile.auth_user_id` es una referencia opaca de solo lectura, nunca se escribe desde este módulo | Diseño ya existente, coherente con este módulo |
| 6 | `AuditLog`/`Report`/`ModerationAction` de este módulo se pierden al reiniciar el proceso (están en memoria) — en producción esto sería una pérdida de trazabilidad legal inaceptable | Alta (si se despliega tal cual) | Crítica | Crítica | Este módulo **no debe desplegarse en producción bajo ningún concepto** tal cual — es exclusivamente para desarrollo/tests locales, hasta que se sustituya por persistencia real | **Bloqueante para producción**, no para seguir desarrollando/probando |
| 7 | Los 59 tests actuales cubren las reglas ya documentadas, pero no cubren condiciones de red (timeouts, reintentos, fallos parciales) porque no existe red en este módulo | Alta (cuando se conecte backend real) | Media | Media | Añadir una nueva suite de tests de integración (no de lógica pura) cuando exista el backend real — fuera de alcance de este prompt | Pendiente, prompt futuro |
| 8 | Ninguna de las funciones de este módulo valida límites de tamaño de payload (`body` de un post, `details` de un reporte) — un backend real sí debe hacerlo para evitar abuso | Media | Baja | Baja | Añadir validación de longitud máxima al conectar con un formulario real (ya hay límites documentados en `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md`, p. ej. 500 caracteres para posts) | Documentado, no implementado en este módulo |

---

## Resumen

**1 riesgo crítico** (#6, pérdida de trazabilidad si se despliega tal cual — mitigado por diseño: este módulo es explícitamente de desarrollo/tests, no de producción). **2 riesgos altos** (#1 condiciones de carrera, #2 doble barrera solo en aplicación) que deben resolverse al diseñar la capa de persistencia real, no antes. Ninguno de estos 8 riesgos es nuevo respecto a lo ya anticipado en el catálogo — son la traducción concreta, a nivel de código, de los riesgos ya identificados en `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` y `QA_SEGURIDAD_CIERRE_CALIDAD_COMUNIDAD_PADEL_04.md`.
