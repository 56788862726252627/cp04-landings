# Onboarding de cliente — Club Pádel 04 (Paso 08A)

Checklist y cuestionario para configurar la app para un club real, una vez firmado el piloto/instalación. **No ejecutar ninguna configuración real contra Airtable/Make hasta que la validación post-Airtable 429 (Paso 07Q) esté superada** para ese entorno.

---

## Datos a pedir al club

### Pistas

- [ ] Número total de pistas.
- [ ] Nombre/numeración de cada pista (p. ej. "Pista 1", "Pista Central").
- [ ] Tipo de superficie/cubierta si aplica (interior/exterior, cristal/muro).
- [ ] Pistas con restricciones especiales (p. ej. solo competición, solo clases).

### Horarios

- [ ] Horario de apertura y cierre por día de la semana.
- [ ] Días cerrados (festivos, mantenimiento fijo).
- [ ] Franjas de mantenimiento recurrente si las hay.
- [ ] Duración de reserva estándar (60/90/120 min) y si varía por franja.

### Tarifas

- [ ] Precio por franja horaria (si varía mañana/tarde/fin de semana).
- [ ] Tarifas por tipo de socio (ver siguiente sección).
- [ ] Descuentos habituales (bono de horas, packs).

### Tipos de socios

- [ ] Categorías de socio (individual, familiar, infantil, empresa, etc.).
- [ ] Cuota mensual/anual por categoría.
- [ ] Condiciones de baja/congelación de membresía.

### Usuarios internos

- [ ] Personas de recepción (rol STAFF) — nombre y correo.
- [ ] Personas de dirección (rol ADMIN) — nombre y correo.
- [ ] Persona de soporte técnico interno si existe (rol SUPPORT) — normalmente será la propia agencia al principio.

### Correos

- [ ] Correo de contacto general del club.
- [ ] Correo desde el que se enviarán comunicaciones a socios (si se activa el módulo de comunicaciones).

### Integraciones

- [ ] ¿El club ya usa Airtable/Make o parte de cero? (afecta a la migración de datos existentes).
- [ ] ¿Quiere cobro automático de cuotas? → requiere activar Stripe.
- [ ] ¿Quiere comunicación automática por WhatsApp? → requiere activar WhatsApp Business API.
- [ ] ¿Quiere sincronizar con Google Calendar? → requiere activar esa integración.
- [ ] ¿Tiene ya un sistema de control de acceso físico (QR/tarjeta) con el que integrar?

### Reglas de reservas

- [ ] Antelación mínima/máxima para reservar.
- [ ] Límite de reservas simultáneas por socio.
- [ ] Reglas de reserva para no-socios/invitados si se permite.

### Política de cancelación

- [ ] Plazo mínimo para cancelar sin penalización.
- [ ] Qué ocurre si no se presenta el jugador (no-show): aviso, penalización, bloqueo temporal.

### Necesidades de comunicación

- [ ] Qué comunicaciones quiere automatizar primero (recordatorios de reserva, cuota, bienvenida, cumpleaños...).
- [ ] Tono de comunicación deseado (formal/cercano).
- [ ] Idioma(s) de comunicación con los socios.

## Checklist de configuración inicial

- [ ] Confirmar plan/paquete contratado (Inicial, Profesional o Premium).
- [ ] Recoger todos los datos de las secciones anteriores.
- [ ] Configurar pistas, horarios y tarifas en el entorno de demo/piloto del club.
- [ ] Dar de alta usuarios internos (STAFF/ADMIN) con sus correos reales.
- [ ] Confirmar con el club qué automatizaciones se activan desde el primer día y cuáles quedan para una fase posterior (ver `limites-y-riesgos-actuales.md`).
- [ ] Si el club quiere Stripe/WhatsApp/Calendar: documentar explícitamente que son integraciones pendientes de activar, con plazo estimado, no incluidas por defecto.
- [ ] Programar sesión de formación para el equipo de recepción (rol STAFF) y dirección (rol ADMIN).
- [ ] Confirmar con el club el plan de migración de datos existentes (si venían de Excel/otra plataforma) antes de dar por cerrado el onboarding.
