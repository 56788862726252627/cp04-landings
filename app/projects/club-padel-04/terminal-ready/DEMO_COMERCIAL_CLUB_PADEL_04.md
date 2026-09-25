# Demo Comercial — Club Pádel 04

Fecha: 2026-07-13

Este documento es la guía de presentación comercial de Club Pádel 04 como caso
de estudio del sistema replicable de la Agencia IA. Complementa (sin
duplicar) `app/projects/club-padel-04/demo/README.md`,
`app/projects/club-padel-04/sales/README.md` y
`app/projects/club-padel-04/pricing/README.md`.

Principio rector: la demo vende **una landing y un producto de reservas bien
diseñado y automatizable**, no un backend ya conectado a producción. No
prometer nada que el estado real (ver `INDICE_MAESTRO_CLUB_PADEL_04.md`) no
respalde.

## Demo para club (privado)

Enfoque: ahorro de tiempo de recepción, imagen profesional, automatización de
confirmaciones/recordatorios, control de reservas y ranking para fidelizar
jugadores.

Puntos a enfatizar:

- La landing transmite profesionalismo desde el primer segundo.
- El flujo de reserva es simple para el jugador y validado (sin errores de
  datos).
- El panel de Gestión reduce fricción en recepción.
- El ranking es una herramienta de retención/gamificación para jugadores
  habituales.

## Demo para ayuntamiento

Enfoque: gestión de instalaciones públicas, transparencia de uso, reducción de
llamadas/incidencias, posible réplica en otras instalaciones deportivas
municipales.

Puntos a enfatizar:

- Panel Admin como herramienta de supervisión de uso de instalaciones.
- Estandarización: el mismo sistema es replicable a otras pistas/polideportivos
  del municipio (sistema replicable de la agencia).
- Reducción de gestión manual en recepción/conserjería.
- No mencionar cifras de negocio privado como si fueran datos del
  ayuntamiento; adaptar el lenguaje a "uso" y "ocupación", no a "ingresos".

## Guion de 10 minutos

1. (1 min) Contexto: "esto es lo que vería un jugador que reserva pista hoy".
2. (2 min) Recorrido landing: hero, información del club, galería, contacto.
3. (3 min) Flujo de reserva en vivo: elegir pista, fecha, hora, enviar.
4. (2 min) Vista rápida de Ranking (rol PLAYER).
5. (1 min) Vista rápida de Gestión (rol STAFF) — solo si el interlocutor es
   operativo (recepción/gerencia), no ante un decisor puramente político.
6. (1 min) Cierre: "esto es la base; se conecta con recordatorios automáticos,
   pagos y notificaciones cuando el club lo decida".

## Guion de 30 minutos

1. (3 min) Contexto y objetivo de la reunión.
2. (5 min) Recorrido completo de landing (todas las secciones, SEO,
   responsive en móvil en vivo).
3. (5 min) Flujo de reserva completo, incluyendo un caso de error de
   validación para mostrar robustez.
4. (5 min) Panel Gestión (STAFF): reservas, disponibilidad, incidencias.
5. (5 min) Panel Admin (solo ante decisor): métricas, configuración de
   torneos/ranking — dejando explícito que las cifras mostradas son
   ilustrativas hasta tener datos reales del club.
6. (3 min) Panel Soporte (opcional, solo si preguntan por fiabilidad técnica):
   estado de integraciones sin mostrar secretos.
7. (4 min) Explicación de automatizaciones (ver sección específica abajo) y
   plan de puesta en marcha.

## Qué mostrar

- Landing completa y responsive.
- Flujo de reserva de principio a fin.
- Ranking.
- Gestión (si el público es operativo).
- Admin (si el público es decisor de compra).
- Explicación conceptual de automatizaciones (confirmaciones, recordatorios).

## Qué NO mostrar

- Panel Soporte con detalle técnico profundo, salvo pregunta directa sobre
  fiabilidad/seguridad.
- Cualquier variable de entorno, nombre de webhook, endpoint interno o
  consola de desarrollador.
- Datos de clientes reales, testimonios o cifras de negocio no verificadas
  como reales.
- El código fuente o el repositorio.

## Cómo explicar automatizaciones sin mencionar proveedores internos

Usar lenguaje funcional, no técnico ni de marca de proveedor:

- En vez de "usamos Make y Airtable": decir **"el sistema conecta
  automáticamente la reserva con el resto de herramientas del club:
  notificaciones, agenda y base de datos, sin que nadie tenga que hacerlo a
  mano"**.
- En vez de "Stripe procesa el pago": decir **"los pagos se gestionan de forma
  segura a través de una pasarela de pago certificada"**.
- En vez de "WhatsApp Business API": decir **"las confirmaciones y
  recordatorios llegan por el canal que el jugador ya usa habitualmente"**.
- En vez de "Cloudflare Worker": decir **"la reserva pasa por una capa segura
  antes de llegar a cualquier sistema interno"**.
- Si preguntan explícitamente el nombre de la herramienta, responder con
  honestidad pero sin entrar en detalle de arquitectura salvo que el
  interlocutor sea técnico y lo pida.

## Cierre de siguiente paso

Frase de cierre sugerida:

> "Lo que has visto hoy es la base de producto ya construida y probada. El
> siguiente paso es un piloto real: conectamos las notificaciones y los pagos
> con vuestros datos, ajustamos textos e imágenes al club/instalación, y en
> [X semanas] tenéis esto funcionando con reservas reales."

Acción concreta a proponer siempre al final:

- Agendar una segunda reunión con fecha concreta para definir alcance del
  piloto.
- Pedir, si procede, 3-5 fotos reales del club/instalación y datos de contacto
  reales para dejar de usar placeholders.
- No cerrar precio en esta demo si `pricing/README.md` no está validado para
  ese interlocutor concreto; remitir a una propuesta siguiente.
