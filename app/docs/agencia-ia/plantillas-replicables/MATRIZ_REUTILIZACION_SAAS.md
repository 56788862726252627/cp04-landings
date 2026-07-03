# MATRIZ DE REUTILIZACIÓN · SaaS Replicable

## Objetivo

Separar lo específico de Club Pádel 04 de lo reutilizable para otros clientes.

---

## 1. Elementos específicos de Club Pádel 04

Estos elementos no deben clonarse literalmente en otros negocios sin adaptación:

- nombre Club Pádel 04
- identidad visual actual
- imágenes del Torcal de Antequera
- textos específicos de pádel
- pistas de pádel
- torneos de pádel
- ranking de pádel
- roles deportivos concretos
- referencias a Antequera
- demo comercial pensada para club de pádel

---

## 2. Elementos reutilizables para otros clubes deportivos

Estos sí pueden convertirse en plantilla:

- sistema de reservas
- calendario de disponibilidad
- roles usuario / staff / admin / soporte
- perfil de cliente
- recuperación de contraseña
- panel administrativo
- dashboard
- métricas
- automatizaciones
- emails transaccionales
- gestión de incidencias
- avisos
- CRM de socios
- historial de actividad
- módulos de pagos
- sistema de permisos
- onboarding
- soporte técnico

---

## 3. Elementos reutilizables para cualquier negocio local

Estos elementos pueden adaptarse a clínicas, abogados, veterinarios, peluquerías, etc.:

- sistema de citas/reservas
- base de clientes
- ficha de cliente
- recordatorios
- notificaciones
- pagos
- facturación
- historial
- documentación
- panel de negocio
- métricas
- campañas
- formularios
- automatizaciones Make
- agentes IA de atención
- agentes IA internos
- soporte técnico
- agenda del equipo
- permisos por rol

---

## 4. Qué debe parametrizarse en el futuro

Para hacer el SaaS realmente replicable, cada nueva instalación debería permitir cambiar:

- nombre del negocio
- sector
- servicios
- tarifas
- ubicación
- horarios
- equipo
- logo
- colores
- imágenes
- textos
- emails
- WhatsApp/canales
- base de datos
- integraciones
- flujos activos
- permisos
- idioma
- moneda
- política de cancelación
- tipos de cita/reserva

---

## 5. Riesgo principal

El riesgo principal es mezclar demasiado código específico de Club Pádel 04 con lógica reutilizable.

### Solución futura
Crear una capa de configuración por cliente/sector:

- config/client.ts
- config/sector.ts
- config/theme.ts
- config/services.ts
- config/automation-map.ts

