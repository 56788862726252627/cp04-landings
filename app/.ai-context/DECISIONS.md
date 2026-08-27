# Decisiones · cp04-landings/app

Registro de decisiones relevantes, con fecha, motivo y certeza de la fuente.
No es un changelog de código (para eso está `git log`): es el "por qué"
detrás de decisiones que no son obvias leyendo el diff.

Formato de cada entrada:

```
## AAAA-MM-DD · Título corto
- Decisión:
- Motivo:
- Alcance / afectados:
- Certeza: VERIFICADO DIRECTAMENTE | EVIDENCIA PREVIA | NO VERIFICABLE DESDE ESTA HERRAMIENTA
- Fuente:
```

---

## 2026-08-26 · Crear Context Hub multi-agente

- Decisión: crear `.ai-context/` dentro de `app/` como capa persistente de
  contexto operativo compartido entre herramientas (ChatGPT, Claude Code,
  Claude Desktop/Web, etc.), en vez de depender de la memoria informal de
  cada chat.
- Motivo: evitar que cada herramienta/sesión tenga que reconstruir desde
  cero el estado real de los proyectos, y evitar pedirle al usuario que
  repita información ya disponible localmente.
- Alcance / afectados: no afecta código de producto; solo añade
  documentación en `app/.ai-context/` y actualiza la skill de usuario
  `fabrica-agencia-ia` (fuera del repo, en `~/.claude/skills/`).
- Certeza: VERIFICADO DIRECTAMENTE (esta sesión).
- Fuente: instrucción explícita del usuario, ejecutada sin commit/push/deploy
  a la espera de revisión.

## (histórico, EVIDENCIA PREVIA) · Separación CORE / VERTICAL / CLIENTE

- Decisión: toda la Fábrica Agencia IA (factory-cli, `src/saas-core`, y la
  plantilla BPMN Maestro) mantiene siempre tres capas separadas: CORE
  (motor reutilizable), VERTICAL (reglas del sector) y CLIENTE
  (personalización del tenant), sin mezclarlas.
- Motivo: permitir replicar la fábrica a nuevas verticales (bot de trading,
  clínicas, restaurantes, despachos, peluquerías) sin reescribir el motor
  cada vez.
- Alcance / afectados: `src/saas-core/*`, `factory-cli/*`, plantilla BPMN
  Maestro (Artifact externo).
- Certeza: EVIDENCIA PREVIA (recogida en la memoria persistente del
  asistente a lo largo de múltiples sesiones anteriores; no se ha vuelto a
  auditar código línea a línea en esta sesión).
- Fuente: memoria del asistente (`project-*` en
  `/root/.claude/projects/-root-cp04-landings/memory/`), no verificable como
  transcripción externa desde esta herramienta.

## (histórico, EVIDENCIA PREVIA) · No declarar producción real sin gate + evidencia

- Decisión: ninguna integración (Stripe, WhatsApp, Google Drive, cobros,
  reservas reales) se declara "en producción" sin pruebas normales y de
  fallo, y sin un gate de validación explícito.
- Motivo: evitar el patrón repetido de placeholders presentados como
  producción real, detectado en auditorías previas del proyecto.
- Alcance / afectados: todo el código bajo `src/saas-core/commercial/`,
  `src/saas-core/deliverables/`, y los adaptadores (`*Adapter.js`).
- Certeza: EVIDENCIA PREVIA.
- Fuente: memoria del asistente; regla también incluida en
  `SKILL.md` de `fabrica-agencia-ia`.
