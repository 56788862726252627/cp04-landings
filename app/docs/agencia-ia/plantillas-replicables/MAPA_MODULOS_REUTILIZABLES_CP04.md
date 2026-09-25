# MAPA DE MÓDULOS REUTILIZABLES · Club Pádel 04 → Agencia IA

## Objetivo

Separar claramente qué partes de Club Pádel 04 son específicas de un club de pádel y qué partes pueden convertirse en plantilla SaaS reutilizable para otros clubes deportivos y negocios locales.

---

## 1. Módulos específicos de Club Pádel 04

Estos elementos pertenecen al producto actual y no deben clonarse literalmente sin adaptación:

- Nombre Club Pádel 04.
- Identidad visual basada en pádel.
- Imágenes del Torcal de Antequera.
- Textos comerciales orientados a club de pádel.
- Pistas de pádel.
- Ranking de jugadores.
- Torneos de pádel.
- Emparejamientos deportivos.
- Niveles de jugador.
- Mano dominante.
- Posición preferida.
- Reservas de pista.
- Métricas deportivas específicas.
- Lenguaje visual de club deportivo/pádel.
- Demo actual pensada para Antequera.

### Decisión
Estos elementos se mantienen como demo principal, pero deben aislarse en futuras configuraciones para poder reemplazarlos por datos de otro cliente.

---

## 2. Módulos reutilizables para otros clubes deportivos

Estos módulos pueden replicarse para otros clubes deportivos cambiando sector, textos y servicios:

- Inicio / dashboard.
- Sistema de reservas.
- Perfil de usuario.
- Roles: cliente, staff, admin, soporte.
- Login real.
- Recuperación de contraseña.
- Panel de administración.
- Panel de métricas.
- Gestión de clientes/socios.
- Gestión de servicios.
- Gestión de horarios.
- Gestión de disponibilidad.
- Cancelaciones.
- Reprogramaciones.
- Emails automáticos.
- Alertas.
- Incidencias.
- Soporte técnico.
- Tutorial guiado.
- Selector de idioma.
- Sistema de permisos.
- Modo seguro.
- Integración con Make.
- Integración con Airtable.
- Preparación para pagos.
- Documentación de auditorías.
- Backups y commits.

### Ejemplos de adaptación deportiva
- Club de tenis.
- Gimnasio.
- Centro de entrenamiento.
- Escuela deportiva.
- Club municipal.
- Centro de yoga/pilates.
- Box de cross training.
- Academia deportiva.

---

## 3. Módulos reutilizables para negocios locales

Estos módulos pueden adaptarse fuera del deporte:

- Sistema de citas.
- Agenda.
- Clientes/pacientes.
- Roles del equipo.
- Perfil de cliente.
- Recordatorios.
- Cancelaciones.
- Reprogramaciones.
- Panel de administración.
- Métricas.
- Emails automáticos.
- Formularios.
- Documentación del cliente.
- Automatizaciones.
- Atención con agentes IA.
- Soporte.
- Historial.
- Facturación futura.
- Pagos futuros.
- Campañas.
- Seguimiento postservicio.

### Sectores objetivo
- Clínicas dentales.
- Fisioterapia.
- Abogados.
- Clínicas de fertilidad.
- Veterinarios.
- Peluquerías.
- Centros de estética.
- Psicólogos.
- Nutricionistas.
- Academias.
- Asesorías.
- Inmobiliarias.
- Talleres.
- Centros médicos privados.

---

## 4. Qué debe convertirse en configuración

Para evitar duplicar código, estos elementos deberían depender de una configuración por cliente:

- Nombre del negocio.
- Sector.
- Logo.
- Colores.
- Imágenes.
- Ubicación.
- Servicios.
- Tarifas.
- Horarios.
- Equipo.
- Roles.
- Permisos.
- Textos.
- Módulos activos.
- Automatizaciones activas.
- Plantillas de email.
- Idiomas.
- Moneda.
- Política de cancelación.
- Métricas principales.
- Tipo de reserva/cita.

---

## 5. Regla de no duplicación

Antes de crear una nueva app sectorial:

1. Revisar esta matriz.
2. Revisar documentos existentes.
3. Reutilizar Club Pádel 04 como base.
4. Extraer lo configurable.
5. Crear solo lo específico del nuevo sector.
6. Documentar diferencias.
7. Hacer commit estable.

