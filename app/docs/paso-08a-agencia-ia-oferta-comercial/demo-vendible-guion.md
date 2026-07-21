# Guion de demo vendible — Club Pádel 04 (Paso 08A)

**Duración objetivo:** 10-15 minutos. Ejecutar sobre `localhost:5175` (o el entorno de demo equivalente), nunca contra datos reales de un club.

**Regla de oro durante toda la demo:** si algo todavía es "preparado visualmente, pendiente de conexión real" (Lista de espera, Control QR, Comunicaciones, Facturación, Automatizaciones y bots), decirlo tal cual — no fingir que ya envía mensajes o cobra de verdad. Frase de seguridad a mano en todo momento: *"esto ya está diseñado y visible en la app; se activa del todo en cuanto conectemos [Airtable/Stripe/WhatsApp] para vuestro club."*

---

## 1. Inicio/login (1 min)

- Abrir `localhost:5175`, mostrar la pantalla de login.
- Frase: *"Esto es Club Pádel 04, una aplicación de gestión completa para un club de pádel — no una web, una herramienta de trabajo diario."*
- Iniciar sesión como **PLAYER** primero.

## 2. Vista PLAYER (2 min)

- Mostrar sidebar limpio: Inicio, Reservar, Torneos, Ranking, Comunidad, Perfil.
- Frase: *"El jugador solo ve lo que le interesa a él: reservar, ver su ranking, su comunidad. Nada de gestión interna — eso es justo lo que evita errores y confusión."*

## 3. Reservas (2 min)

- Navegar a "Reservar", mostrar el calendario de disponibilidad.
- Frase: *"El jugador ve en tiempo real qué pistas están libres y reserva sin llamar a recepción."*

## 4. Ranking/Torneos (1 min)

- Mostrar Torneos y Ranking.
- Frase: *"Esto da vida social al club — no es solo reservar una pista, es una comunidad."*

## 5. Cambio a vista STAFF (30 seg)

- Cerrar sesión, entrar como **STAFF**.
- Frase: *"Ahora os enseño lo que ve el equipo de recepción — aquí es donde se nota el ahorro de tiempo real."*

## 6. Altas/bajas/lista de espera (2-3 min)

- Ir a "Alta de jugador", mostrar el formulario.
- Cambiar a la pestaña "Baja de jugador", mostrar el checkbox de "Promocionar al siguiente jugador en lista de espera".
- Ir a "Lista de espera", mostrar el módulo.
- Frase: *"Cuando un jugador se da de baja, el sistema está preparado para promocionar automáticamente al siguiente de la lista de espera — hoy esto ya se ve en la app, se activa del todo en cuanto conectemos la automatización para vuestro club."*

## 7. Cierre temporal (1-2 min)

- Ir a "Cierre temporal", mostrar el formulario (mantenimiento, lluvia, evento...).
- Frase: *"Si una pista se moja o hay que hacer mantenimiento, aquí lo cerráis en 10 segundos, con el motivo documentado."*

## 8. QR/accesos (1 min)

- Ir a "Control QR / Accesos".
- Frase: *"Esto es control de acceso al club por QR — pensado para clubes con puerta automatizada o control de acceso físico."*

## 9. Dashboard y KPIs (1-2 min)

- Cambiar a vista **ADMIN**, ir a "Dashboard KPI y NPS".
- Frase: *"Aquí es donde la dirección ve el negocio: ocupación, satisfacción de socios, altas y bajas — de un vistazo, sin pedirle un Excel a nadie."*

## 10. Seguridad/backups (1 min)

- Ir a "Backups y seguridad".
- Frase: *"Copias de seguridad automáticas y gestión de solicitudes de privacidad (RGPD) — algo que casi ningún club pequeño tiene hoy."*

## 11. Automatizaciones (1-2 min)

- Ir a "Comunicaciones y ciclo de socio" y "Facturación y pagos".
- Frase: *"Recordatorios de cuota, bienvenida a nuevos socios, reactivación de inactivos — todo esto ya está diseñado en la app. La parte de cobro automático y WhatsApp se activa cuando decidáis conectar Stripe/WhatsApp para el club."*

## 12. Centro Técnico/SUPPORT (1 min, opcional según audiencia)

- Cambiar a vista **SUPPORT**, mostrar Centro Técnico.
- Frase (solo si el interlocutor es técnico o quiere ver "las tripas"): *"Esto es el panel técnico — aquí vemos el estado real de las automatizaciones conectadas, para diagnóstico y soporte."*
- Si el interlocutor no es técnico, saltar este paso.

## 13. Cierre comercial (1-2 min)

- Volver a Inicio.
- Frase de cierre: *"Lo que acabáis de ver es una demo funcional avanzada — la base de gestión ya está construida y probada. El siguiente paso, si os interesa, es un piloto con vuestros datos reales: pistas, horarios, tarifas y socios. Ahí es donde definimos qué paquete encaja mejor con el tamaño de vuestro club."*
- **Nunca decir:** "esto ya está en producción" o "esto ya lo usan otros clubes reales" si no es cierto en ese momento.
- **Sí decir, si preguntan por el estado:** "es una demo funcional avanzada, con la parte de automatizaciones pendiente de una validación técnica final que ya tenemos planificada."
