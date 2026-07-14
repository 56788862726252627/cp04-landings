# Matriz de readiness de integración — Comunidad Pádel 04

**Estado:** documento de auditoría/planificación. **Borrador técnico/legal revisable, pendiente de validación por abogado/DPO en las áreas legales — no sustituye asesoramiento legal profesional.**
**Fecha:** 2026-07-14
**Depende de:** `QA_SEGURIDAD_CIERRE_CALIDAD_COMUNIDAD_PADEL_04.md` (mismo directorio).

Escala de puntuación: 1-10, donde 10 = completamente listo para el siguiente paso del área evaluada (no necesariamente para producción). **Bloqueante** = impide razonablemente avanzar al Prompt N sin resolverlo primero.

---

| # | Área | Documento/prototipo relacionado | Estado | Puntuación | Riesgo | Bloqueante | Acción recomendada | Prioridad | Tiempo estimado | Responsable sugerido |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Modelo de datos | `MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md` | Estable desde PR #16, 2 huecos menores documentados | 8 | Bajo | No | Resolver `Friendship.status=cancelled` y `Report.target_type` para partidos en un PR pequeño | Media | 2-4h | Data modeler / Ingeniería |
| 2 | Diccionario de datos | `DICCIONARIO_DATOS_COMUNIDAD_PADEL_04.md` | Completo y coherente con el modelo | 9 | Bajo | No | Actualizar si se resuelve el punto 1 | Baja | 1h | Data modeler |
| 3 | Privacidad/RLS | `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` | Diseño completo, sin SQL ejecutado (correcto en esta fase) | 8 | Medio | No (para diseño) / Sí (para Supabase real) | Implementar políticas reales solo tras Prompt N autorizado | Baja (ahora) | — | Ingeniería + Seguridad |
| 4 | Consentimiento | `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md` | Completo, pero 3 tipos propuestos sin formalizar en el modelo mergeado | 7 | Medio | Sí | Decidir y aplicar la ampliación de `PrivacyConsent.consent_type` antes de escribir lógica real | Alta | 2-3h | Producto + Data modeler |
| 5 | Textos legales | `TEXTOS_LEGALES_REVISABLES_COMUNIDAD_PADEL_04.md` | 15 borradores completos, ninguno aprobado | 5 | Alto | Sí (antes de mostrar a usuarios reales) | Validación legal externa | Alta | Externo, no estimable por el equipo técnico | Abogado/DPO |
| 6 | Matriz de riesgos | `MATRIZ_RIESGOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` | Completa, 1 riesgo crítico abierto (menores) | 7 | Crítico (por el riesgo #1) | Sí (por el riesgo de menores) | Decisión de negocio sobre menores | Alta | No estimable (depende de negocio) | Producto + Legal |
| 7 | Feed | `PROTOTIPO_FEED_SOCIAL_COMUNIDAD_PADEL_04.md` + `feed-social.html` | Diseño y mock completos, sin lógica probada | 7 | Medio | No (para seguir diseñando) / Sí (para integrar) | Lógica aislada + tests antes de integrar | Media | 8-12h | Ingeniería |
| 8 | Perfil | `PROTOTIPO_PERFIL_JUGADOR_COMUNIDAD_PADEL_04.md` + `perfil-jugador.html` | Diseño y mock completos, sin lógica probada | 7 | Medio | No / Sí (integrar) | Igual que feed | Media | 6-10h | Ingeniería |
| 9 | Moderación | `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md` + `moderacion-reportes.html` | Diseño completo, coherente en los 4 módulos que lo usan | 8 | Medio | No / Sí (integrar) | Lógica aislada + tests, prioridad alta por ser transversal | Alta | 10-16h | Ingeniería + Trust & Safety |
| 10 | Reportes | `FLUJOS_UI_MODERACION_REPORTES_COMUNIDAD_PADEL_04.md` | 12 flujos completos, 14/14 puntos cada uno | 9 | Medio | No | Incluir en la misma capa de lógica de moderación | Alta | Incluido en #9 | Ingeniería |
| 11 | Roles | `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` + `MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md` | Reutiliza los 4 roles reales, sin roles nuevos inventados | 9 | Bajo | No | Ninguna acción adicional necesaria en diseño | Baja | — | — |
| 12 | Partidos abiertos | `PARTIDOS_ABIERTOS_BUSCAR_COMPANERO_COMUNIDAD_PADEL_04.md` + `partidos-abiertos.html` | Diseño completo, 15/15 flujos con 14/14 puntos | 8 | Medio | No / Sí (integrar) | Lógica aislada + tests, incluye la regla crítica de bloqueo | Alta | 10-14h | Ingeniería |
| 13 | Amigos/seguidores | `AMIGOS_SEGUIDORES_CONEXIONES_COMUNIDAD_PADEL_04.md` + `amigos-seguidores.html` | Diseño completo, 17/17 flujos con 15/15 puntos | 8 | Medio | No / Sí (integrar) | Lógica aislada + tests, cierra el ciclo social básico | Alta | 8-12h | Ingeniería |
| 14 | Prototipos HTML | 5 archivos en `community-prototypes/` | Estáticos, sin JS, sin datos reales, verificados | 9 | Bajo | No | Ninguna acción, sirven de referencia visual para implementación real | Baja | — | — |
| 15 | CSS | `community-prototypes.css` | Crecido de forma aditiva en 4 PRs, sin colisiones | 9 | Bajo | No | Extraer a design tokens reales al implementar (no en este prompt) | Baja | 2h (futuro) | Frontend |
| 16 | Accesibilidad | Todos los prototipos | Buenas prácticas de marcado, sin validación automatizada | 6 | Medio | No (para diseño) / Sí (antes de producción) | Ejecutar axe u otra herramienta sobre los 5 HTML | Media | 2-4h | QA / Frontend |
| 17 | Responsive | Todos los prototipos | Mobile-first consistente, validado visualmente | 8 | Bajo | No | Validación en dispositivos reales antes de producción | Baja | 2h | QA |
| 18 | Datos ficticios | Todo el corpus | 100% ficticio, verificado por grep exhaustivo en esta auditoría | 10 | Ninguno | No | Ninguna acción | — | — | — |
| 19 | No copia de terceros | Todo el corpus | Verificado, menciones de marca solo en citas/trazabilidad | 9 | Bajo | No | Ninguna acción | — | — | — |
| 20 | Readiness para App.jsx | Todo el catálogo | Diseño listo, lógica no implementada ni probada | 5 | Alto | Sí | Ejecutar recomendación de la sección 25 de `QA_SEGURIDAD_CIERRE_CALIDAD...md` antes de autorizar | Alta | Ver puntuación por módulo (7-13) | Ingeniería |
| 21 | Readiness para Supabase futuro | `RLS_PERMISOS_PRIVACIDAD_COMUNIDAD_PADEL_04.md` | Diseño de RLS completo, cero SQL ejecutado | 6 | Medio | No (todavía no es el paso actual) | Implementar solo cuando se autorice el Prompt N | Baja (ahora) | 6-10h (futuro) | Ingeniería + Seguridad |
| 22 | Readiness para QA real | Todo el catálogo | Sin suite de tests automatizados en ningún módulo | 3 | Alto | Sí | Misma recomendación que el punto 20 — es la misma causa raíz | Alta | Ver #20 | Ingeniería + QA |
| 23 | Readiness comercial | Roadmap + auditoría de capturas + matriz de precios (fuera de este directorio) | Argumento de venta ya documentado, sin demo funcional | 6 | Bajo | No | Los 5 prototipos HTML ya son navegables como demo visual comercial | Media | — | Comercial/Agencia IA |
| 24 | Readiness legal | Textos legales + matriz de riesgos + menores de edad | Borradores completos, 0 validados formalmente | 4 | Alto | Sí | Validación legal externa (ver punto 5) | Alta | No estimable por el equipo técnico | Abogado/DPO |

---

## Resumen de bloqueantes (de 24 áreas evaluadas)

**6 áreas marcadas como bloqueantes** para el Prompt N: consentimiento (#4), textos legales (#5), matriz de riesgos por menores (#6), readiness para App.jsx (#20), readiness para QA real (#22), readiness legal (#24). Las 3 últimas comparten la misma causa raíz técnica (ausencia de lógica aislada con tests) y las 3 primeras comparten la misma causa raíz de negocio/legal (decisiones pendientes + validación externa) — no son 6 problemas independientes, son 2 focos de trabajo concretos.

## Puntuación media global

**7.2/10** sobre las 24 áreas — refleja un diseño sólido y consistente, penalizado específicamente por la ausencia de lógica probada y de validación legal/de negocio externa, no por defectos de contenido.
