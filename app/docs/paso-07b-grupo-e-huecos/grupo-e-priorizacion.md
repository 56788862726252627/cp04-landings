# Priorización — Grupo E (sin integración visible)

**Estado: DOCUMENTO DE PRIORIZACIÓN. No implementa nada.** Ver `grupo-e-gap-analysis.md` (mismo directorio) para el detalle completo por escenario.

**Fecha:** 2026-07-19

> **Actualización 2026-07-19 (Paso 07C):** el flujo recomendado como más accionable en este documento (❌ Baja de Jugador + Promoción) **ya se implementó** como flujo app/API preparado y seguro — ver `docs/paso-07c-baja-jugador/baja-jugador-integracion.md`. Pasa de Grupo E a Grupo A en `src/data/makeAppIntegrationMap.js` (código integrado, sin webhook Make configurado todavía — no confirmado end-to-end). El resto de este documento (los otros 11 flujos) sigue vigente sin cambios.

---

## Clasificación por decisión (A/B/C/D/E)

| Decisión | Cantidad | Escenarios |
|---|---|---|
| **A · Integrar ahora desde terminal** | 2 | Baja de Jugador + Promoción, Cierre Temporal de Pistas |
| **B · Integrar más adelante (Airtable)** | 5 | Gestión Lista de Espera, Cruces de Torneo, Resultados y Clasificación, Confirmación Inscripción Torneo, Programa de Referidos |
| **C · Integrar más adelante (WhatsApp/Stripe)** | 1 | Facturación y Cobro |
| **D · Mantener como flujo autónomo/documentado** | 2 | Reto 04 + Puntos, Encuesta Post-Partido |
| **E · Eliminar o archivar en fase futura** | 2 | Chatbot Web Reservas, Email Recuperación de Contraseña SaaS |
| **Total** | **12** | |

## Clasificación por impacto real en el SaaS

| Impacto | Cantidad | Escenarios |
|---|---|---|
| **Alto** | 3 | Baja de Jugador + Promoción, Gestión Lista de Espera, Facturación y Cobro |
| **Medio** | 5 | Cierre Temporal de Pistas, Cruces de Torneo, Resultados y Clasificación, Confirmación Inscripción Torneo, Programa de Referidos |
| **Bajo** | 4 | Reto 04 + Puntos, Encuesta Post-Partido, Chatbot Web Reservas, Email Recuperación de Contraseña SaaS |

## Flujo más accionable para implementar después desde terminal

# 🎯 ❌ Baja de Jugador + Promoción (Make ID 5288809)

**Decisión:** A · Integrar ahora desde terminal
**Impacto:** Alto

### Por qué es el más accionable

1. **Tiene un precedente de código exacto ya construido y probado:** Alta de Jugador (Grupo A del Paso 07A) resuelve exactamente el mismo patrón — formulario en la app, endpoint dedicado en el Worker, webhook de Make propio (`MAKE_ALTA_JUGADOR_WEBHOOK`). Replicar ese patrón para la baja (`MAKE_BAJA_JUGADOR_WEBHOOK` o equivalente) es la integración de menor riesgo técnico de las 12, porque el diseño ya existe y ya funciona en producción.
2. **Está en la lista de prioridad explícita del propio encargo** (reservas, lista de espera, cancelaciones, **baja de jugador**, QR, soporte, logs, experiencia del usuario).
3. **No depende de que Airtable esté disponible para construir el código** — igual que Alta de Jugador, el trabajo de escribir el formulario, el endpoint y el forwarding puede hacerse hoy desde terminal; solo la prueba end-to-end final necesitaría Airtable funcionando, exactamente igual que ya ocurre con Alta de Jugador (que está en Grupo A pese al bloqueo de Airtable).
4. **Cierra una asimetría de producto ya visible:** hoy la app puede dar de alta a un jugador pero no darlo de baja — es una brecha operativa real para STAFF/ADMIN, no una funcionalidad nueva especulativa.

### Por qué NO se eligió Gestión Lista de Espera como el más accionable (pese a tener impacto también Alto)

Gestión Lista de Espera requiere **leer** un resultado que Make ya calcula solo (corre cada hora, 466 ejecuciones históricas) — su integración de valor real es mostrar ese resultado en la UI de Reservas, lo cual depende de que Airtable esté disponible para que ese dato tenga sentido mostrarlo (mostrar "estás en lista de espera" con datos potencialmente obsoletos por el bloqueo de Airtable sería peor que no mostrar nada). Baja de Jugador es una acción de **escritura** que puede construirse y probarse con datos sintéticos hoy, sin depender de que Airtable esté sano — es estructuralmente más independiente del bloqueo actual.

### Segundo candidato si se quiere una ganancia rápida adicional

**Cierre Temporal de Pistas** (Decisión A, impacto Medio) — mismo razonamiento de "se puede construir ahora sin depender de Airtable para escribir el código", acción administrativa simple (STAFF/ADMIN marca una pista como cerrada temporalmente), sin dependencia de datos de jugadores reales.

## Resumen de dependencias

- **Dependientes de Airtable (5, Decisión B):** Gestión Lista de Espera, Cruces de Torneo, Resultados y Clasificación, Confirmación Inscripción Torneo, Programa de Referidos — todos usan `usaAirtable: true` y su valor real de integración (mostrar datos reales) no tiene sentido mientras la cuota siga agotada.
- **Dependientes de WhatsApp/Stripe/externo (1, Decisión C):** Facturación y Cobro (Stripe) — confirmado en la auditoría maestra previa que no existe ningún código de Stripe en esta rama; no tiene sentido construir nada de app hasta que exista esa pieza.
- **Conviene dejar autónomos (2, Decisión D):** Reto 04 + Puntos (sin diseño de producto de gamificación detrás — no es una brecha, es una función no planificada) y Encuesta Post-Partido (89% de tasa de error histórica — el problema está roto en Make, no en la ausencia de integración de app; integrar ahora propagaría el fallo).
- **Candidatos a archivar (2, Decisión E):** Chatbot Web Reservas (0 ejecuciones históricas, sin módulo de app relacionado) y Email Recuperación de Contraseña SaaS (redundante: el flujo real de recuperación de contraseña de la app usa Supabase directo, no este escenario — mantenerlo activo sin marcarlo como redundante puede confundir a quien audite el inventario en el futuro).
