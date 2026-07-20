# Checklist para hacer una demo en vivo segura (Paso 08D)

Checklist operativo, complementario al guion de `app/docs/paso-08a-agencia-ia-oferta-comercial/demo-vendible-guion.md` y `app/docs/paso-08c-primer-paquete-prospeccion-real/guion-llamada-demo-15min.md`.

---

## Qué abrir antes de empezar

- [ ] `localhost:5175` (o el entorno de demo equivalente) abierto y respondiendo, con sesión cerrada para empezar por el login.
- [ ] Tener a mano las credenciales/roles de demo para los 4 roles (PLAYER, STAFF, ADMIN, SUPPORT) — nunca usar datos de un club real.
- [ ] Cerrar cualquier otra pestaña/ventana que pueda distraer o mostrar información interna no destinada al cliente.
- [ ] Silenciar notificaciones del dispositivo antes de compartir pantalla.

## Qué módulos enseñar

- Inicio → Reservar (vista PLAYER).
- Torneos / Ranking (vista PLAYER).
- Alta de jugador / Baja de jugador / Lista de espera (vista STAFF).
- Cierre temporal de pistas (vista STAFF).
- Dashboard KPI y NPS (vista ADMIN).
- Centro Técnico — **solo si el interlocutor es técnico o lo pide explícitamente.**

## Qué NO enseñar todavía

- No mostrar Facturación y pagos ni Automatizaciones y bots como si ya cobraran o enviaran mensajes reales — si se enseñan, aclarar explícitamente que son visuales/preparados.
- No mostrar ningún dato de un club/socio real — usar siempre datos de demo genéricos.
- No mostrar el código fuente, logs internos, ni ninguna credencial/URL de Worker en pantalla.
- No entrar en detalle técnico de Airtable/Make salvo que el interlocutor sea técnico y lo pida explícitamente.

## Cómo explicar Airtable 429

Usar exactamente el lenguaje ya preparado en `app/docs/paso-08c-primer-paquete-prospeccion-real/primer-club-checklist.md` ("Cómo explicar Airtable 429 sin sonar técnico"): nunca decir "429" ni "PUBLIC_API_BILLING_LIMIT_EXCEEDED" al cliente; usar "estamos terminando la última fase de validación con nuestro proveedor de datos".

## Cómo explicar los 40/50 flujos representados

"Hemos construido automatizaciones para 40 de las 50 tareas que un club de pádel necesita automatizar — desde reservas y comunicaciones hasta backups y seguridad. Es una cobertura muy amplia ya construida."

## Cómo explicar los 10 pendientes

Solo si preguntan explícitamente: "Los 10 restantes son casos muy específicos o de baja prioridad para la mayoría de clubes — por ejemplo, funciones de gamificación sin diseño todavía definido, o automatizaciones que dependen de decisiones que tomaremos según lo que pida cada cliente." No entrar en el detalle técnico exacto (Torneos, Encuesta Post-Partido, etc.) salvo que el interlocutor sea muy técnico y lo pida.

## Cómo cerrar el siguiente paso

Usar el cierre ya preparado en `app/docs/paso-08c-primer-paquete-prospeccion-real/guion-llamada-demo-15min.md` ("Cómo cerrar el siguiente paso") — proponer un diagnóstico del club en concreto, nunca un compromiso de compra en la misma llamada de demo.

## Criterios para considerar la demo exitosa

- [ ] El cliente entendió la diferencia entre "gestión interna" (lo que aporta la app) y "reserva de pista" (lo que ya pueda tener con Playtomic u otro).
- [ ] El cliente no salió de la demo pensando que el producto ya está en producción con otros clientes reales (si esto ocurre, aclarar de inmediato).
- [ ] Se acordó un siguiente paso concreto (fecha de diagnóstico, o al menos una fecha de seguimiento) — una demo sin ningún siguiente paso acordado no se considera exitosa, aunque haya ido bien a nivel de interés.
- [ ] Se registró la demo y su resultado en la ficha/mini-CRM (`mini-crm-prospeccion-template.md`) inmediatamente después, mientras el contexto está fresco.
