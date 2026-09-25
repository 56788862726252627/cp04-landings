# Página de caso de uso — Club Pádel 04 (Paso 08B)

Contenido para la página "Caso Club Pádel 04" de la web comercial (ver `estructura-web-agencia.md`).

---

## Situación inicial de un club típico

Un club de pádel de tamaño medio (3-6 pistas) gestiona hoy sus reservas con una plataforma genérica (o ni eso), sus altas y bajas de socios en una hoja de Excel, la comunicación con los socios por un grupo de WhatsApp o llamadas manuales, y no tiene ninguna visibilidad de negocio más allá de lo que el gerente recuerda o anota a mano. Cuando un socio se da de baja, nadie avisa automáticamente al siguiente de la lista de espera. Cuando hay que cerrar una pista por mantenimiento, se avisa por WhatsApp y se espera que nadie reserve por error.

## Solución aplicada

Club Pádel 04 sustituye esa mezcla de herramientas por una única aplicación con:

- Login real y roles diferenciados (jugador, recepción, dirección, soporte técnico).
- Reservas online con disponibilidad en tiempo real.
- Gestión de altas y bajas de jugadores, con promoción automática desde lista de espera.
- Cierre temporal de pistas con motivo documentado (mantenimiento, lluvia, evento, obra...).
- Automatizaciones de comunicación (recordatorios, bienvenida, reactivación de inactivos).
- Panel de control con métricas de ocupación y satisfacción para la dirección.

## Módulos de la app

23 módulos organizados por rol: Inicio, Reservar, Alta de jugador, Baja de jugador, Reprogramar/Cancelar reserva, Reservas (gestión), Cierre temporal, Lista de espera, Control QR/Accesos, Pistas libres y recordatorios, Comunicaciones y ciclo de socio, Calendario y disponibilidad, Torneos, Ranking, Comunidad, Admin, Dashboard KPI y NPS, Backups y seguridad, Facturación y pagos, Automatizaciones y bots, Centro Técnico, Soporte, Perfil y ajustes.

## Automatizaciones

40 de los 50 flujos de automatización del catálogo de la agencia ya tienen representación directa en la app (visual o con integración real), cubriendo desde recordatorios operativos hasta backups de seguridad y comunicaciones de ciclo de vida del socio.

## Beneficios

- Menos tiempo de recepción en tareas repetitivas.
- Menos errores humanos en reservas y altas/bajas.
- Visibilidad real de negocio para la dirección.
- Una única herramienta, con roles y permisos reales, en vez de varias herramientas sueltas.

## Demo visual

Demo funcional avanzada disponible en vivo bajo petición (ver CTA de esta página): recorrido guiado de 10-15 minutos por los 4 roles de usuario, siguiendo el guion de `app/docs/paso-08a-agencia-ia-oferta-comercial/demo-vendible-guion.md`.

*Placeholder de maquetación:* `[Espacio para vídeo/GIF corto de la demo o capturas de pantalla reales de la app]`.

## Límites actuales (honesto, no eliminar en la maquetación final)

- Es una **demo funcional avanzada**, no una instalación en producción con socios reales todavía.
- La validación técnica final de los flujos de escritura (reservas, altas, bajas, cierres) contra los sistemas de datos está pendiente por un límite de cuota externo (Airtable), fuera del control del desarrollo.
- El cobro automático de cuotas (Stripe) y la mensajería automática (WhatsApp/Telegram) están diseñados en la app pero no activados — se activan al configurar esas integraciones para cada club.
- 10 de los 50 flujos de automatización del catálogo todavía no tienen representación en la app, cada uno con un motivo documentado (algunos por bajo valor, otros por depender de un rediseño de otro módulo).

## Qué se puede enseñar ya

- La app completa funcionando en vivo con los 4 roles.
- Todos los módulos de gestión, reservas, comunicaciones y automatizaciones (en su versión visual/preparada donde aún no hay integración externa activa).
- El diseño y la experiencia de usuario terminados.

## Qué falta validar

- Prueba real de extremo a extremo de los flujos de escritura contra los sistemas de datos (pendiente de que se resuelva el límite de cuota externo).
- Activación de integraciones externas opcionales (pagos, mensajería, calendario) para un club concreto que las solicite.

## Cómo convertirlo en piloto real

1. Reunión de diagnóstico con el club (ver `oferta-diagnostico-ia.md`).
2. Recogida de datos reales del club (`app/docs/paso-08a-agencia-ia-oferta-comercial/onboarding-cliente-club.md`).
3. Confirmación de que la validación técnica final (post-límite de cuota externo) se ha completado con resultado positivo.
4. Configuración del entorno del club con sus datos reales (pistas, horarios, tarifas, socios).
5. Formación del equipo de recepción y dirección.
6. Lanzamiento acotado (piloto) antes de considerar el club como cliente en producción completa.
