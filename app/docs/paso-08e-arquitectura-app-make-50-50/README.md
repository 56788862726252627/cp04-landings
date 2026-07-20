# Paso 08E — Arquitectura App ↔ Make 50/50

Este bloque implementa la arquitectura completa para **representar y gestionar** los 50 flujos objetivo de Club Pádel 04, sin ejecutar ninguna llamada real a Make, Airtable, Gmail, WhatsApp, Stripe ni ningún otro servicio externo.

**Aviso central, a respetar en toda comunicación sobre este bloque:** *"representado en la app" no equivale a "operativo E2E"*. El objetivo de este bloque es dejar 50/50 flujos arquitectónicamente representados y preparados, **no** declarar 50/50 flujos operativos. Solo **1 de 50** (Alta de Jugador) tiene evidencia objetiva de ejecución E2E real (histórica, previa a este bloque); el resto no se marca como operativo.

## Checkpoint previo

Antes de tocar cualquier archivo se creó un tag Git verificable en el commit base `9a92bc2`:

```
git tag -a "checkpoint-pre-arquitectura-50-50" -m "Checkpoint antes de implementar la arquitectura App<->Make 50/50 (matriz canonica + Centro de Automatizaciones)" 9a92bc2
```

Tag local, no publicado — punto de retorno seguro si algo de este bloque necesitara revertirse.

## El tercer eje: qué añade este bloque

Club Pádel 04 ya tenía dos ejes de datos sobre los 50 flujos Make, independientes entre sí:

1. **`estadoVerificacion`** (`src/data/makeInventory.js`) — auditoría de Make: ¿se verificó este escenario contra Make/Airtable?
2. **`grupo` / `integradoEnApp` / `integradoEnWorker`** (`src/data/makeAppIntegrationMap.js`) — integración de código: ¿el código de la app/Worker dispara realmente este escenario?

Este bloque añade un **tercer eje**, orientado a producto/operación:

3. **`estado`** (`src/data/makeArchitectureMatrix.js`, nuevo) — arquitectura App ↔ Make: ¿qué puede ver y hacer **hoy** un usuario real en la app respecto a este flujo, y qué falta para activarlo de verdad?

Los tres ejes conviven en el mismo `id` de escenario pero **nunca se combinan ni se derivan uno de otro** — cada uno se calcula de forma independiente sobre su propia evidencia.

## Estados posibles (`MAKE_ARCH_ESTADOS`)

| Estado | Significado | Cuántos hoy |
|---|---|---|
| `operational` | Interfaz + contrato + webhook configurados, con evidencia objetiva de ejecución E2E real | 1 |
| `prepared` | Interfaz y/o contrato preparados en la app; falta activar una integración externa o configurar un webhook | 9 |
| `externally_blocked` | Preparado, pero bloqueado hoy por una dependencia externa fuera de nuestro control (principalmente Airtable 429) | 30 |
| `planned` | Sin interfaz de app todavía; requiere una decisión de producto o diseño antes de construirse | 10 |

Los contadores de la tabla **siempre** se calculan con `computeArchitectureResumen(MAKE_ARCHITECTURE_MATRIX)` — nunca se escriben a mano. Ver `src/utils/makeCentroTecnicoLogic.js::computeIntegracionResumen` para el mismo criterio ya aplicado al eje de integración de código.

## Dónde vive cada pieza

- **Matriz canónica de datos**: `src/data/makeArchitectureMatrix.js` — 50 entradas, cada una con: `id`, `nombre`, `area`, `descripcion`, `rolesAutorizados`, `modulo`, `ruta`, `accionIniciadora`, `datosEntrada`, `resultadoEsperado`, `dependenciasExternas`, `estado`, `requiereWebhook`, `tieneInterfazCompleta`, `tieneContratoPreparado`, `probadoE2E`, `ultimaValidacionConocida`, `siguienteAccionNecesaria`.
- **Tests de integridad**: `src/data/makeArchitectureMatrix.test.mjs` — 19 tests (ver sección Fase 6 más abajo).
- **Panel visible**: `src/components/CentroTecnico.jsx`, Panel **A4 · Centro de automatizaciones · Arquitectura App ↔ Make 50/50**, insertado junto a los paneles A2/A3 ya existentes. Exclusivo del rol SUPPORT (misma triple protección RBAC del resto de Centro Técnico: navegación, guard de render en `App.jsx`, y auto-protección del propio componente).
- **Tabla completa de los 50 flujos**: `tabla-50-flujos.md` (este mismo directorio), generada programáticamente desde la matriz — no transcrita a mano.

## Por qué se extendió Centro Técnico en vez de crear un módulo nuevo

La instrucción de origen decía explícitamente "crea **o mejora**" un Centro de Automatizaciones. Centro Técnico (`flujos_make`, SUPPORT-only) ya es la superficie técnica de automatizaciones del club (contiene los paneles A2 "Verificación 50/50" y A3 "Integración App ↔ Make 50/50"). Añadir un cuarto panel (A4) en el mismo componente:

- Reutiliza la infraestructura RBAC, de layout y de componentes ya existente (`Panel`, `Badge`, `KpiCard`).
- Evita fragmentar en dos pantallas distintas la misma información sobre los mismos 50 flujos.
- No añade ninguna entrada nueva a la barra lateral — cero botones nuevos, en línea con la instrucción explícita de no crear 50 botones individuales ni una navegación fragmentada.

No se crearon módulos nuevos ni rutas nuevas. Las `ruta` declaradas en la matriz (`reservas`, `alta_jugador`, `baja_jugador`, `cierre_pistas`, `lista_espera`, `control_qr`, `pistas_recordatorios`, `comunicaciones_socio`, `calendario_disponibilidad`, `dashboard_kpi`, `backups_seguridad`, `facturacion_pagos`, `automatizaciones_bots`, `flujos_make`) son **todas** rutas que ya existían en `src/utils/rbac.js` antes de este bloque — verificado por test.

## Comportamiento seguro (Fase 4)

- El panel A4 **no hace ninguna llamada de red**: toda la información sale de `MAKE_ARCHITECTURE_MATRIX`, un módulo de datos estático importado en build-time. No hay `fetch`, `authFetch` ni URL de webhook en ningún campo de la matriz (verificado por test con un patrón anti-secreto/anti-webhook).
- No hay ningún botón de "ejecutar" o "activar" en el panel A4: es un catálogo de solo lectura con filtros (área/estado/rol) y una vista de detalle por flujo. Ver `filterArchitectureMatrix()`.
- La distinción "interfaz preparada" (`tieneInterfazCompleta`) / "contrato preparado" (`tieneContratoPreparado`) / "validación E2E superada" (`probadoE2E`) se muestra siempre como tres campos independientes en el detalle de cada flujo — nunca se colapsan en un único indicador binario que pudiera insinuar más madurez de la real.
- Ningún flujo no-operativo puede fingir una ejecución: no existe código en este bloque que dispare una acción real para ningún `estado` distinto de `operational`, y ni siquiera para ese caso el panel A4 ejecuta nada (es observabilidad, no un panel de control).

## Checklist de activación por flujo

Para pasar un flujo de `prepared` o `externally_blocked` a `operational`, en este orden:

- [ ] El flujo tiene un módulo/pantalla real en la app (`tieneInterfazCompleta = true`).
- [ ] El contrato de entrada/salida está definido y documentado (`tieneContratoPreparado = true`).
- [ ] El escenario correspondiente existe y está activo en Make.
- [ ] El webhook (si `requiereWebhook = true`) está configurado como secret en el Worker (`worker-reservas`), nunca embebido en el frontend.
- [ ] La integración externa que bloquea el flujo (Airtable, Stripe, WhatsApp, Telegram, Google Calendar…) está disponible y probada por separado.
- [ ] Se ha ejecutado al menos una prueba real con datos de prueba (no de producción) y se ha confirmado el resultado en Airtable/el sistema externo correspondiente.
- [ ] Se ha verificado la respuesta correcta en la app (UI, no solo en logs del Worker).
- [ ] Se han revisado logs e idempotencia (sin duplicados ante reintentos).

## Checklist de validación E2E (obligatoria antes de marcar `operational`)

- [ ] Prueba ejecutada con datos de prueba reales, no simulados.
- [ ] Resultado verificado directamente en Airtable (o el sistema externo correspondiente).
- [ ] Resultado verificado en la app (no solo "la API devolvió 200").
- [ ] Sin errores en los logs del Worker durante la prueba.
- [ ] Comportamiento correcto ante un reintento/duplicado (idempotencia).
- [ ] Evidencia objetiva registrada (captura, log, o referencia) — no basta con "debería funcionar".

Solo cuando las dos listas anteriores están completas se actualiza `estado` a `MAKE_ARCH_ESTADOS.OPERATIONAL` y `probadoE2E` a `true` en `src/data/makeArchitectureMatrix.js`, junto con una entrada honesta en `ultimaValidacionConocida`.

## Procedimiento futuro de activación (referencia obligatoria)

1. Confirmar que el escenario existe y está activo en Make.
2. Configurar el webhook o la integración correspondiente.
3. Configurar las variables de entorno necesarias (siempre como secret del Worker, nunca en el frontend).
4. Probar con datos de prueba, no con datos reales de producción.
5. Verificar el resultado directamente en Airtable.
6. Verificar la respuesta correcta en la app.
7. Revisar logs e idempotencia.
8. Marcar el flujo como `operational` únicamente después de superar la validación E2E completa.

## Tabla completa de los 50 flujos

Ver `tabla-50-flujos.md` en este mismo directorio — generada programáticamente desde `MAKE_ARCHITECTURE_MATRIX`, ordenada por área.

## Alcance explícitamente fuera de este bloque

- No se activó ningún webhook real.
- No se llamó a Make, Airtable, Gmail, WhatsApp, Stripe ni ningún otro servicio externo.
- No se declaró ningún flujo como operativo sin evidencia objetiva.
- No se expuso ningún secreto, URL privada ni token.
- No se tocó ninguna funcionalidad existente fuera de `src/components/CentroTecnico.jsx` (una inserción aditiva) y la nueva matriz de datos.
