# Paso 09 · Fase 15 — Medición de replicabilidad

Medido sobre los 7 tenants demo reales generados en esta sesión
(`04-tenants-demo.md`), no estimado. Ningún porcentaje aquí es arbitrario:
cada uno tiene su criterio de cálculo explícito.

## Métricas por tenant (medidas directamente)

| Tenant | Tiempo de generación | Archivos creados | Archivos centrales modificados manualmente | Pasos manuales pendientes | Módulos reutilizados | Módulos específicos del tenant |
|---|---|---|---|---|---|---|
| padel-sur-estepona | ~1.2 s (medido con `time npm run tenant:create`) | 4 | 0 | 7 | 14/14 | 0 |
| clinica-dental-sonrisas-malaga | ~1.2 s | 4 | 0 | 8 | 14/14 | 0 |
| fisioterapia-activa-granada | ~1.2 s | 4 | 0 | 8 | 14/14 | 0 |
| consulta-psicologica-mente-clara | ~1.2 s | 4 | 0 | 8 | 14/14 | 0 |
| despacho-juridico-rivas-y-asociados | ~1.2 s | 4 | 0 | 8 | 13/13 | 0 |
| peluqueria-estilo-urbano | ~1.2 s | 4 | 0 | 7 | 13/13 | 0 |
| clinica-veterinaria-patitas-felices | ~1.2 s | 4 | 0 | 8 | 13/13 | 0 |

**Criterios**:
- *Tiempo de generación*: wall-clock de `npm run tenant:create` de extremo a extremo (incluye arranque de Node/npm; el trabajo real de generación es < 50 ms). Medido una vez con `time`; las 7 ejecuciones reales de esta sesión no se cronometraron individualmente pero usan el mismo código, sin I/O de red.
- *Archivos creados*: los 4 archivos fijos del CLI (`tenant.config.json`, `env.example`, `checklist.md`, `summary.md`). Nunca varía por sector.
- *Archivos centrales modificados manualmente*: cambios a mano en `src/App.jsx`, `src/utils/rbac.js`, `src/data/*`, `src/theme.js`, `worker-reservas/*` para que el tenant funcione. Verificado con `git status` tras generar los 7: **0**.
- *Pasos manuales pendientes*: líneas `- [ ]` en `checklist.md` generado (pasos de negocio de la plantilla/preset + 3 técnicos fijos + 1 normativo si aplica).
- *Módulos reutilizados vs específicos*: todo `moduleId` en `modulesEnabled` proviene de `CORE_MODULE_CATALOG` (Fase 6), catálogo compartido por todas las plantillas. Un "módulo específico" sería uno inventado solo para ese tenant — no existe ninguno en los 7 casos: **0 código específico por tenant**.

## Replicabilidad por familia de sector (criterio explícito, no inventado)

Se define **replicabilidad = (módulos reutilizados del catálogo genérico) /
(módulos totales activados) × (1 si 0 archivos centrales tocados, si no
0)**. Con 0 archivos centrales tocados en los 7 casos, el factor derecha
es 1 en todos; el cociente de módulos reutilizados es siempre 1 (100%)
porque **no existe ningún módulo fuera del catálogo genérico en este
paso** — no hay módulos "específicos de sector" todavía porque ningún
sector necesitó uno para pasar de plantilla a tenant demo funcional
(a nivel de configuración, no de UI real).

| Familia | Tenants probados | Replicabilidad de configuración | Qué NO mide este número |
|---|---|---|---|
| Otro club de pádel | padel-sur-estepona | 100% (14/14 módulos del catálogo, 0 archivos centrales) | Que la UI real (App.jsx) sirva ambos clubes a la vez — no integrado (ver límites) |
| Otro negocio deportivo | (sports-club sin tenant demo generado; template validado por test, no por generación real) | 100% en validación de esquema; **sin tenant demo real generado** | Uso real: falta generar y verificar un tenant `sports-club` concreto |
| Clínicas (dental/fisio/psicología/fertilidad) | 3 de 4 generados (dental, fisio, psicología); fertility-clinic solo validado por test | 100% en los 3 generados | Cumplimiento normativo sanitario (explícitamente fuera de alcance, ver Fase 12) |
| Servicios profesionales (legal) | despacho-juridico-rivas-y-asociados | 100% | Secreto profesional/protección de datos real (requiere revisión legal) |
| Belleza | peluqueria-estilo-urbano | 100% | — (sector no regulado, sin límite adicional) |
| Veterinaria | clinica-veterinaria-patitas-felices | 100% | Cumplimiento normativo veterinario (fuera de alcance) |
| Genérica (local-service, speech-therapy) | 0 tenants demo generados; ambos validados solo por test de esquema | 100% en validación; **sin tenant demo real** | Uso real: falta generación explícita |

**Lectura honesta de "100%"**: significa que, a nivel de *configuración*,
ningún tenant de los 7 generados necesitó una sola línea de código nueva
ni tocar un archivo central. NO significa que la aplicación real (React)
sirva estos tenants en producción — eso sigue pendiente de la integración
descrita en `07-seguridad-privacidad-limites-migracion.md` (límite 1).

## Cobertura de la Fase 15

- 7/7 tenants pedidos generados y medidos con datos reales.
- 2 plantillas (`sports-club`, `local-service`) y 1 preset (`fertility-clinic`,
  `speech-therapy`) quedan validados por test automático pero **sin un
  tenant demo generado en disco** en esta sesión — no se afirma
  replicabilidad "probada en generación real" para ellos, solo
  "replicabilidad de esquema verificada".
