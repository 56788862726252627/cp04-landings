# Bloqueos Externos — Agencia IA

**Fecha**: 2026-07-13 · Documento de referencia interna. Lista, sin adornos, todo lo que **no depende de seguir trabajando desde terminal** para que la Agencia IA avance su porcentaje global. Cada bloqueo indica qué falta exactamente, por qué no se puede resolver documentando más, y qué señal marcaría que ya se ha resuelto.

---

## 1. Cliente real (segundo cliente, más allá de Archidona)

- **Qué falta**: un segundo cliente real que acepte el servicio, más allá del piloto ya cerrado en Archidona.
- **Por qué no es tarea de terminal**: depende de que un tercero (ayuntamiento, club o negocio) decida contratar; ningún documento nuevo sustituye esa decisión.
- **Señal de resuelto**: contrato o presupuesto firmado por un segundo cliente distinto de Archidona.

## 2. Primera reunión

- **Qué falta**: una reunión o llamada real con un contacto identificado de cualquiera de los registros del CRM (`MUNICIPIOS_MALAGA_RADIO_ARCHIDONA_CRM.md` o `CRM_INICIAL_PROSPECCION.md`).
- **Por qué no es tarea de terminal**: requiere que exista un contacto real localizado (nombre, teléfono o email verificado) y que esa persona responda y acepte una fecha.
- **Señal de resuelto**: reunión o demo agendada y celebrada, registrada en el CRM correspondiente.
- **Actualización (2026-07-13)**: el contacto comercial real con Villanueva del Trabuco **sigue pendiente**. Ya existe un paquete de primer contacto completo y listo para usar en cuanto se localice el contacto real — ver `docs/agencia-ia/comercial/PRIMER_CONTACTO_VILLANUEVA_DEL_TRABUCO.md` (mensajes de WhatsApp/email/llamada, guiones de 3 y 10 minutos, preguntas de diagnóstico, señales de interés, objeciones y checklists) y su CSV de seguimiento `CRM_PRIMER_CONTACTO_VILLANUEVA_DEL_TRABUCO.csv`. El siguiente desbloqueo real, y el único paso que falta, es **localizar el contacto real** (nombre, teléfono o email verificado de la Concejalía de Deportes) y enviar el mensaje inicial manualmente — no queda ningún trabajo de documentación pendiente para este bloqueo concreto.

## 3. Propuesta aceptada

- **Qué falta**: que un cliente potencial diga sí a una propuesta ya enviada (Villanueva del Trabuco u otro registro del CRM).
- **Por qué no es tarea de terminal**: depende de la decisión del cliente tras ver la demo y la propuesta, no de mejorar el documento de propuesta.
- **Señal de resuelto**: confirmación por escrito (email, WhatsApp o firma) de aceptación de la propuesta.

## 4. Pago

- **Qué falta**: cobro real del primer pago (setup) de un segundo cliente.
- **Por qué no es tarea de terminal**: requiere una propuesta ya aceptada y un medio de cobro operativo (ver bloqueo de Stripe, §6, si el cobro se hace online).
- **Señal de resuelto**: pago recibido y conciliado, con factura emitida.

## 5. WhatsApp Business

- **Qué falta**: cuenta de WhatsApp Business configurada y validada para comunicación oficial con clientes/usuarios finales (más allá del mock ya construido en el sistema QA de Make, ver memoria de sesión `project-whatsapp-preprod-readiness-20260709`).
- **Por qué no es tarea de terminal**: requiere verificación de número de teléfono real por parte de Meta/WhatsApp y aceptación de políticas de uso comercial, un proceso externo con tiempos fuera de nuestro control.
- **Señal de resuelto**: número verificado en producción, con plantillas de mensaje aprobadas por WhatsApp Business.

## 6. Stripe

- **Qué falta**: cuenta Stripe real conectada en producción, con claves activas (el adapter técnico ya está aislado y probado localmente, ver memoria `project-stripe-sandbox-readiness-20260709` y `project-stripe-production-readiness-20260710`, pero el entorno sigue en `NOT_CONFIGURED`).
- **Por qué no es tarea de terminal**: requiere alta real de cuenta Stripe (verificación de identidad/empresa) y configuración de claves de producción, un trámite externo con el propio proveedor.
- **Señal de resuelto**: claves de producción activas y un cobro de prueba real conciliado en el dashboard de Stripe.

## 7. Google Drive manual

- **Qué falta**: migrar o sincronizar de forma real la base de conocimiento Drive/IA/skills/prompts (`BASE_CONOCIMIENTO_DRIVE_IA_SKILLS_PROMPTS.md`) con el estado actual de Drive, más allá de lo ya documentado desde terminal.
- **Por qué no es tarea de terminal**: requiere acceso y edición directa en Google Drive (una plataforma externa), no en el repositorio de código.
- **Señal de resuelto**: confirmación manual de que la estructura de Drive coincide con lo documentado en `BASE_CONOCIMIENTO_DRIVE_IA_SKILLS_PROMPTS.md` y en `GUIA_SEPARACION_PROYECTOS_GITHUB_DRIVE.md`.

## 8. Apify real

- **Qué falta**: ejecución real de scraping/prospección automatizada con Apify (hoy la prospección es manual, como se indica explícitamente en la petición de esta fase).
- **Por qué no es tarea de terminal en este momento**: requiere una cuenta Apify activa, actors configurados y ejecución real contra fuentes externas (páginas de ayuntamientos, directorios de negocios), fuera del alcance de esta fase documental.
- **Señal de resuelto**: al menos una ejecución real de Apify que aporte contactos verificados al CRM, con coste y legalidad de la fuente ya revisados.

## 9. Deploy/dominio

- **Qué falta**: deploy real y dominio propio para un segundo cliente (más allá del entorno ya usado por Club Pádel 04/Archidona).
- **Por qué no es tarea de terminal**: requiere decisión de dominio, hosting y despliegue en producción, actividad explícitamente fuera de esta fase ("no hagas deploy").
- **Señal de resuelto**: segundo cliente con dominio y entorno de producción propios, funcionando de forma independiente del piloto de Archidona.

## 10. Casos de éxito reales

- **Qué falta**: un segundo caso de éxito real (cliente distinto de Archidona, operando en producción durante un período sostenido) citable en propuestas futuras.
- **Por qué no es tarea de terminal**: requiere que se resuelvan primero todos los bloqueos anteriores (cliente, pago, deploy) y que pase tiempo de operación real.
- **Señal de resuelto**: al menos un cliente adicional a Archidona con varios meses de uso real y disposición a ser citado como referencia.

---

## 11. Resumen

Ninguno de estos 10 bloqueos se resuelve escribiendo más documentación. Todos dependen de una acción externa concreta (una persona que responde, una plataforma externa que verifica, un pago que se recibe). El trabajo de terminal de esta fase deja el terreno preparado para que, en cuanto ocurra cualquiera de estas acciones externas, exista ya el documento, la plantilla o el proceso que la recoja sin necesidad de improvisar. El detalle de cómo esto afecta al porcentaje global está en [`INFORME_TERMINAL_READY_AGENCIA_IA.md`](INFORME_TERMINAL_READY_AGENCIA_IA.md).
