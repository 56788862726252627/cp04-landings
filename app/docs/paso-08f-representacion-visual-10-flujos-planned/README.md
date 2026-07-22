# Paso 08F — Representación visual de los 10 flujos `planned`

Continúa el Paso 08E (`../paso-08e-arquitectura-app-make-50-50/`). Objetivo: completar la representación visual de los flujos que seguían en estado `planned` hasta que los 50/50 queden representados también en la interfaz de la aplicación, sin activar Make, Airtable, Stripe ni WhatsApp Business, y sin declarar ningún flujo como operativo E2E sin evidencia objetiva.

## Checkpoint previo

```
git tag -a "checkpoint-pre-representacion-visual-50-50" -m "Checkpoint antes del Paso 08F (representación visual de los 10 flujos planned -> prepared)" 88c37a2
```

Tag local sobre el commit `88c37a2` (cierre del Paso 08E), no publicado.

## Fase 1 — Los 10 flujos `planned` reales

Extraídos programáticamente de `src/data/makeArchitectureMatrix.js` (no supuestos):

| ID | Flujo | Área |
|---|---|---|
| 6299114 | ⚠️ Alerta Crítica Fallos Make | Soporte |
| 6233755 | 🗺️ Mapa de Flujos | Soporte |
| 5791116 | 🏷️ Confirmación Inscripción Torneo | Torneos y ranking |
| 5736466 | ⭐ Encuesta Post-Partido | Torneos y ranking |
| 4919937 | 🏆 Cruces de Torneo | Torneos y ranking |
| 5330078 | 🏅 Resultados y Clasificación | Torneos y ranking |
| 5791374 | 🏆 Reto 04 + Puntos | Torneos y ranking |
| 5799061 | 💬 Chatbot Web Reservas | Comunicaciones |
| 6323445 | 🔑 Email Recuperación de Contraseña SaaS | Administración |
| 6335114 | 📸 Instagram Borrador con IA | Promociones y marketing |

Los 10 compartían exactamente el mismo `modulo: "Centro de automatizaciones"` — ninguno tenía interfaz, contrato ni representación visual antes de este bloque (`tieneInterfazCompleta: false`, `tieneContratoPreparado: false`).

## Fase 2 — Decisión de representación

Para los 10, se evaluó: pantalla nueva vs. ampliación de módulo existente vs. panel/formulario dentro de un módulo ya existente.

**Decisión: formulario dentro de un módulo ya existente** (Centro Técnico, panel A4 "Centro de automatizaciones"), no una pantalla nueva ni una ampliación de otros módulos de negocio, por tres razones:

1. Los 10 son flujos internos/técnicos (alertas, mapa de flujos, generación automática de brackets/resultados/puntos de torneo, chatbot, email redundante con Supabase, borrador de Instagram) — su naturaleza encaja con el rol SUPPORT y con Centro Técnico, no con pantallas de cara al jugador.
2. Cinco de los diez (Torneos y ranking) podrían en teoría vivir dentro del módulo `Torneos` — **se descartó deliberadamente** tocar `Torneos.jsx` por la instrucción explícita de no modificar funcionalidades ya validadas: el módulo Torneos fue auditado y cerrado el 2026-07-10 con su propio P0 ya resuelto, y tocarlo aquí habría sido un riesgo innecesario fuera del alcance de este bloque.
3. Reutilizar el panel A4 ya existente (creado en el Paso 08E) es la opción de menor riesgo y máxima reutilización: cero pantallas nuevas, cero rutas nuevas, cero botones nuevos en la barra lateral.

## Fase 3 — Interfaz construida

Nuevo componente `FormularioLocalFlujo` en `src/components/CentroTecnico.jsx`, renderizado en el detalle de cada flujo del panel A4 cuando `flujo.modulo === "Centro de automatizaciones"` (los 10 de esta lista, ningún otro flujo coincide con esa condición — verificado).

Cada uno de los 10 dispone ahora de:

- **Representación visual**: fila en el catálogo del panel A4 + vista de detalle expandible + formulario local propio.
- **Permisos por rol**: sin cambios — siguen siendo exclusivos de SUPPORT (misma triple protección RBAC de todo Centro Técnico: navegación, guard de render en `App.jsx`, auto-protección del componente).
- **Estado**: `prepared` (antes `planned`).
- **Contrato preparado**: el textarea de "datos de entrada simulados" + el resultado esperado mostrado en el detalle representan visualmente el contrato de entrada/salida documentado en la matriz.
- **Validaciones locales**: el botón "Probar localmente" exige un mínimo de 3 caracteres en el campo de entrada; si no se cumple, muestra un error inline (`role="alert"`) y no continúa.
- **Modo seguro sin llamadas externas**: el componente no importa ni usa `fetch` ni `authFetch` en ningún punto — verificado por lectura de código. Incluye un badge visible "🔒 Modo seguro" con el texto "Simulación local — no se realiza ninguna llamada real a Make, Airtable ni ningún otro servicio externo."
- **Mensaje claro de pendiente de integración**: tras una simulación válida, se muestra el mismo mensaje honesto ya usado en el resto de la app — *"Acción preparada. Pendiente de conexión real cuando Make/Airtable esté disponible."* (duplicado localmente desde `App.jsx::CP04_PREPARADO_MSG` para no tocar ese archivo, ya validado).

Ninguno de los 10 ejecuta ninguna acción real: no hay `fetch`, no hay URL de webhook embebida, no hay estado que pueda confundirse con una ejecución real.

## Fase 4 — Navegación revisada

- El componente no añade ninguna ruta ni entrada de sidebar nueva: los 10 siguen accesibles por la ruta `flujos_make` ya existente, ya presente en `Sidebar` (`src/App.jsx`, array `navKeys`) y en el mapa `modules` de `ClubPadel04SaaSApp()`.
- Verificado programáticamente que las 14 rutas usadas por los 50 flujos de la matriz (`reservas`, `alta_jugador`, `baja_jugador`, `cierre_pistas`, `lista_espera`, `control_qr`, `pistas_recordatorios`, `comunicaciones_socio`, `calendario_disponibilidad`, `dashboard_kpi`, `backups_seguridad`, `facturacion_pagos`, `automatizaciones_bots`, `flujos_make`) existen todas como clave real en el mapa `modules` de `App.jsx` — cero enlaces rotos.
- Los 50 flujos tienen ahora representación accesible desde la interfaz: 49/50 con interfaz visual completa propia (`tieneInterfazCompleta`), el único caso restante (Notificación Push PWA, Grupo C del Paso 07A) es una decisión ya tomada y documentada en el Paso 07A — sigue representado solo dentro de Centro Técnico, sin interfaz dedicada propia, y queda fuera del alcance de este bloque (no era uno de los 10 `planned`).

## Fase 5 — Validaciones

- **Tests**: 21/21 en `makeArchitectureMatrix.test.mjs` (19 del Paso 08E + 2 nuevos específicos de este bloque: cero flujos `planned` restantes, y verificación exacta de que los 10 ids pasaron a `prepared` con contrato/interfaz sin fingir E2E). Suite completa: **201/201 frontend, 173/173 Worker**.
- **Build**: correcto, sin errores.
- **Lint**: mismos 4 errores + 1 warning preexistentes y ya documentados; cero nuevos en los archivos de este bloque.
- **Búsqueda de secretos**: sin coincidencias reales (solo el propio patrón detector dentro del test).

## Resultado

- **Distribución final de los 50 flujos**: `operational` 1 · `prepared` 19 · `externally_blocked` 30 · `planned` 0.
- **Representación visual**: 50/50 flujos accesibles desde la interfaz (49/50 con interfaz visual dedicada + 1/50 solo listado en Centro Técnico, decisión ya documentada).
- Ningún flujo se marcó como operativo E2E sin evidencia objetiva — el único operativo sigue siendo el mismo del Paso 08E (Alta de Jugador), sin cambios.
