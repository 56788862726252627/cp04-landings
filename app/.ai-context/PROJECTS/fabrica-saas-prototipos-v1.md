# Fábrica SaaS · Generador de Prototipos v1

## Objetivo

Convertir la Fábrica SaaS en un generador interno capaz de producir, desde terminal y con Claude Code/ChatGPT, prototipos SaaS navegables equivalentes al trabajo que hoy haría un constructor externo como Lovable, sin depender de créditos por generación.

## Principio arquitectónico

La generación se divide en tres capas estrictas:

1. **CORE** — piezas reutilizables entre sectores: shell de aplicación, sistema de diseño, navegación, auth opcional, RBAC opcional, chatbot base, CRM base, agenda/reservas base, recuperación de leads, dashboard, logs, métricas, mocks, testing y build.
2. **VERTICAL** — reglas del sector: terminología, tipos de servicio, formularios, precalificación, restricciones, flujos, métricas y disclaimers propios de dental, pádel, legal, fisioterapia, etc.
3. **CLIENTE** — branding, nombre, colores, sedes, servicios, horarios, textos, rangos de precio, configuración de módulos e integraciones.

La capa CLIENTE nunca debe duplicar lógica que pertenezca a CORE o VERTICAL.

## Entrada única

La fábrica debe aceptar un manifiesto YAML validado. El manifiesto define al menos:

- cliente
- vertical
- modo_demo
- módulos habilitados
- sedes
- roles
- branding
- canales externos permitidos o bloqueados
- integraciones reales permitidas o bloqueadas
- datos mock obligatorios en demo

## Salida esperada

Una ejecución de la fábrica debe producir un proyecto aislado con:

- app responsive móvil/tablet/desktop
- navegación funcional
- módulos solicitados
- datos mock cuando `modo_demo: true`
- flujo de usuario principal navegable
- tests mínimos de unidad/integración del generador y del vertical
- build limpio
- README de ejecución
- evidencia de qué se generó y qué quedó pendiente
- cero secretos embebidos
- cero envíos externos si `canales_externos: false`

## Módulo oficial v1: generador de prototipos

Capacidades iniciales:

1. `chatbot_ia`
2. `crm`
3. `reservas`
4. `recuperacion_leads`
5. `dashboard`
6. `rbac` opcional
7. `auth` opcional
8. `logs` opcional

El generador debe ser idempotente: reejecutar sobre el mismo cliente no debe duplicar módulos ni romper personalizaciones existentes.

## Caso de aceptación 001 · Clínica Dental Demo

Debe recrear internamente el prototipo dental que se intentó construir en Lovable.

### Flujo demo

`consulta → clasificación → sede/tratamiento → datos ficticios → precalificación → huecos simulados → cita simulada → CRM simulado → seguimiento simulado → métricas`

### Intenciones

- primera visita
- implantes/cirugía
- ortodoncia
- estética
- urgencia
- consulta general

### Seguridad clínica

- no diagnóstico
- no prescripción
- no consejo médico
- ante contenido clínico sensible: derivación a profesional
- solo datos ficticios
- ningún email/WhatsApp/SMS real
- ninguna integración real

### Pantallas mínimas

1. Asistente IA
2. CRM simulado
3. Recuperación de leads
4. Dashboard de métricas

### Casos de prueba

1. Implantes/cirugía con financiación
2. Primera visita
3. Consulta fuera de horario
4. Abandono antes de reservar
5. Consulta clínica sensible

## Estructura objetivo

```text
fabrica-saas/
  core/
    app-shell/
    design-system/
    chatbot/
    crm/
    booking/
    recovery/
    dashboard/
    rbac/
    testing/
  verticals/
    dental/
  clients/
    clinica-dental-demo/
      manifest.yaml
      overrides/
  generator/
    schema/
    templates/
    scripts/
    tests/
```

La implementación física puede adaptarse al repo actual tras la auditoría previa; esta estructura es el modelo lógico, no una orden de mover archivos existentes sin análisis.

## Reglas de ejecución

- Auditar antes de crear cualquier pieza nueva.
- Reutilizar componentes/servicios/endpoints existentes cuando sean compatibles.
- No tocar Auth estable, Omni estable ni otros módulos CP04 certificados salvo necesidad demostrada.
- No borrar ni mover archivos existentes en v1.
- No usar secretos reales en el caso dental.
- No activar canales externos.
- No desplegar a producción en esta fase.
- No hacer commit/push desde Claude salvo instrucción expresa del usuario; la primera ejecución debe trabajar localmente y mostrar diff/evidencia.

## Definition of Done v1

La v1 queda aceptada cuando, desde un único manifiesto dental y un único comando de generación, se obtiene localmente un prototipo navegable con las cuatro pantallas, los cinco casos de prueba, tests y build correctos, sin llamadas externas ni datos reales.
