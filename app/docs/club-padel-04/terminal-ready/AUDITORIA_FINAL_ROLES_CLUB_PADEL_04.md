# Auditoría Final de Roles — Club Pádel 04

Fecha: 2026-07-13
Base: `app/docs/auth-roles.md` (documento ya existente en `main`, no editado).

Advertencia general: en este momento **ningún rol está protegido
server-side**. Todo lo descrito abajo describe el diseño previsto y lo que hoy
es visible en modo demo, no un sistema de permisos ya activo.

## PLAYER

### Qué debe ver

- Inicio, Reservas, Ranking.
- Sus propias reservas futuras (cuando exista backend de usuarios real).
- Participación en torneos y su posición en ranking.

### Qué NO debe ver

- Panel Gestión (STAFF).
- Panel Admin.
- Panel Soporte.
- Datos de otros jugadores, incidencias internas, configuración de
  integraciones.

### Módulos clave

- Formulario de reserva (validación de jugador, fecha, hora, pista, duración,
  nivel).
- Ranking (tabla, scroll en móvil).

### Pruebas manuales

- [ ] Confirmar que el enlace/pestaña de Gestión, Admin y Soporte no son
      accesibles navegando directamente a su URL en modo PLAYER (hoy fallará:
      no hay control server-side, solo UI).
- [ ] Confirmar validación de formulario con datos inválidos (fecha pasada,
      campos vacíos, duración fuera de rango).
- [ ] Confirmar que el ranking se ve correctamente en móvil (scroll
      horizontal si aplica).

### Riesgos

- Alto: sin auth real, cualquier visitante puede acceder a rutas/paneles de
  otros roles simplemente cambiando la vista en el frontend.

### Checklist de demo

- [ ] Mostrar solo Inicio, Reservas y Ranking al hacer la demo como PLAYER.
- [ ] No mostrar ni mencionar accidentalmente el panel Admin/Soporte durante
      la demo de este rol.

## STAFF

### Qué debe ver

- Panel Gestión: reservas, disponibilidad, incidencias.

### Qué NO debe ver

- Panel Admin (métricas de negocio, configuración de integraciones).
- Panel Soporte (logs técnicos, estado de integraciones, variables privadas).

### Módulos clave

- Vista de reservas y disponibilidad.
- Registro y resolución de incidencias.

### Pruebas manuales

- [ ] Confirmar que Gestión muestra reservas de forma legible y accionable.
- [ ] Confirmar que no aparecen métricas de negocio (ingresos, KPIs) propias
      de Admin dentro de Gestión.

### Riesgos

- Medio-alto: si en el futuro se conectan datos reales de clientes sin antes
  resolver auth, STAFF vería datos privados de todos los jugadores sin
  restricción real.

### Checklist de demo

- [ ] Mostrar Gestión como ejemplo de "vista operativa diaria de recepción".
- [ ] Aclarar verbalmente que hoy es demo, no producción con datos reales.

## ADMIN

### Qué debe ver

- Métricas de negocio, gestión de pistas/clientes/staff, configuración de
  torneos y ranking, revisión de pagos y automatizaciones (nivel alto).

### Qué NO debe ver

- Nada bloqueado dentro de su propio rol (es el rol de mayor alcance), pero sí
  debe quedar fuera de su alcance la gestión de credenciales/secretos en
  crudo (esas viven solo en Worker/backend, nunca en UI).

### Módulos clave

- Panel de métricas.
- Gestión de pistas, clientes, staff.
- Configuración de torneos y reglas de ranking.

### Pruebas manuales

- [ ] Confirmar que ningún secreto (webhook Make, API keys) aparece
      renderizado en el panel Admin.
- [ ] Confirmar que las métricas mostradas están marcadas como demo si no son
      reales.

### Riesgos

- Alto: es el panel más sensible comercialmente (métricas de negocio); si se
  publica accesible sin auth, expone la operación completa del club a
  cualquier visitante.

### Checklist de demo

- [ ] Mostrar Admin solo en la parte de la demo dirigida a quien toma la
      decisión de compra (dueño del club / responsable municipal).
- [ ] Dejar claro que las cifras son ilustrativas hasta que haya datos reales.

## SUPPORT

### Qué debe ver

- Estado de integraciones, logs técnicos y errores, auditoría de
  configuración de Worker/backend, variables privadas pendientes **sin
  exponer sus valores**.

### Qué NO debe ver

- Valores reales de secretos (webhook Make, claves Stripe, tokens WhatsApp,
  credenciales Google) en ningún caso, ni siquiera con acceso legítimo de
  Soporte: solo estado (configurado/pendiente), nunca el valor.

### Módulos clave

- Panel de estado de integraciones (Make, Airtable, Stripe, WhatsApp, Google
  Calendar, Google Drive).
- Vista de logs/errores técnicos.

### Pruebas manuales

- [ ] Confirmar que el panel Soporte nunca imprime un valor de secreto, solo
      estados como "pendiente de credenciales" o "preparado".
- [ ] Confirmar que los logs mostrados (si son reales en el futuro) no
      incluyen payloads completos con datos personales.

### Riesgos

- Alto: es el rol con más superficie para fuga de secretos si se implementa
  mal (por ejemplo, si se muestra el valor de una variable en vez de solo su
  estado).

### Checklist de demo

- [ ] Mostrar Soporte como "panel de salud técnica", nunca abrir un secreto en
      pantalla aunque sea de ejemplo/ficticio con formato realista.
- [ ] Evitar nombrar proveedores internos exactos si la demo es ante un
      cliente que no necesita saber el detalle de la stack (ver
      `DEMO_COMERCIAL_CLUB_PADEL_04.md`).

## Conclusión de la auditoría

- Los 4 roles están bien diferenciados a nivel de diseño y documentación
  (`app/docs/auth-roles.md`).
- El único hallazgo transversal es el ya conocido y documentado: **no hay
  autenticación ni autorización real**. Esto no es un hallazgo nuevo de esta
  fase, es una condición pre-existente que se reafirma tras revisión.
- Recomendación: no presentar los 4 paneles como "ya protegidos" ante un
  cliente o ayuntamiento; presentarlos como "diseño de producto ya construido,
  pendiente de conectar auth real antes de ir a producción con datos reales".
