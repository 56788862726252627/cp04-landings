# Ejecución Manual — Primer Contacto Villanueva del Trabuco

**Fecha**: 2026-07-13 · Guía operativa de **ejecución manual**, complementaria a `PRIMER_CONTACTO_VILLANUEVA_DEL_TRABUCO.md` (mismo directorio). Aquel documento cubre el paquete comercial completo (perfil ICP, mensajes largos, guiones de 3/10 minutos, objeciones, señales de interés); este documento se centra en **cómo localizar el contacto real paso a paso** y en los guiones cortos de ejecución inmediata que faltaban. No lo sustituye — se usan juntos.

**Advertencia que preside todo el documento**: ningún campo de contacto (nombre, teléfono, email, cargo) tiene todavía un valor real verificado en este repositorio. Cada campo debe rellenarse a mano, solo tras verificación directa, nunca por deducción o suposición razonable.

---

## 1. Objetivo del contacto

Localizar una persona o departamento real del Ayuntamiento de Villanueva del Trabuco (o de la instalación/club deportivo correspondiente, si existe uno independiente del Ayuntamiento) y conseguir que reciba y responda al primer mensaje del paquete comercial, suficiente para avanzar hacia una demo de 15 minutos. Este documento no busca cerrar ninguna venta — solo dejar el camino de localización y el primer envío listos para ejecutarse manualmente.

## 2. A quién hay que localizar exactamente

En este orden de preferencia:

1. **Concejalía de Deportes** del Ayuntamiento de Villanueva del Trabuco (persona responsable o, en su defecto, el departamento genérico).
2. Si no se identifica una persona concreta en Deportes: **registro general / atención ciudadana** del Ayuntamiento, pidiendo explícitamente que deriven a Deportes.
3. Si existe una **instalación deportiva municipal con gestión propia** (polideportivo con conserjería o gerencia independiente): esa persona puede ser un atajo más directo que la Concejalía.
4. Si existe un **club deportivo local** (asociación de pádel/tenis, club polideportivo) que gestione las pistas por delegación del Ayuntamiento: ese club puede ser el interlocutor real en vez del propio Ayuntamiento — a confirmar durante la localización, no asumir de antemano.

No se debe enviar ningún mensaje a un número o email sin haber confirmado a cuál de estos 4 perfiles corresponde.

## 3. Fuentes recomendadas para localizar el contacto manualmente

1. **Web oficial del Ayuntamiento de Villanueva del Trabuco** — buscar directamente el dominio oficial (no confiar en el primer resultado de buscador sin verificar que es la web municipal real) y revisar las secciones "Ayuntamiento" / "Concejalías" / "Deportes" / "Contacto".
2. **Teléfono de centralita del Ayuntamiento** — el que aparezca en la web oficial verificada; llamar y pedir explícitamente que transfieran a Deportes o pregunten por la persona responsable.
3. **Área/Concejalía de Deportes** — si la web tiene un directorio de concejalías con email o teléfono directo, usar ese dato en vez del genérico de registro.
4. **Instalación deportiva municipal** (polideportivo, pistas de pádel) — buscar si tiene página, perfil de Google Maps o redes propias con teléfono/horario de conserjería.
5. **Club deportivo local** — buscar en redes sociales (Facebook/Instagram) o Google Maps un club de pádel/polideportivo de Villanueva del Trabuco que pueda ser el gestor real de las pistas.

Cada fuente usada debe registrarse en el campo `fuente_exacta` (ver §4) — no basta con anotar "internet" o "buscador".

## 4. Campos que hay que rellenar manualmente

| Campo | Qué anotar |
|---|---|
| **responsable** | Nombre y apellidos de la persona real identificada, o "Concejalía de Deportes (sin nombre identificado)" si solo se llegó al departamento. |
| **cargo** | Cargo exacto tal como se identificó (concejal/a, técnico/a de deportes, gerente de instalación, etc.). |
| **teléfono** | Número verificado directamente (centralita, web oficial o confirmación por llamada) — nunca un número supuesto. |
| **email** | Email verificado directamente (web oficial, registro general o confirmación directa) — nunca un email construido por patrón (ej. "nombre@ayuntamiento.es" sin haberlo visto publicado). |
| **fuente_exacta** | De cuál de las 5 fuentes de §3 salió el dato (ej. "web oficial, sección Concejalías", "llamada a centralita, derivada por la operadora"). |
| **fecha_verificación** | Fecha en la que se confirmó el dato, en formato AAAA-MM-DD. |
| **canal_recomendado** | Qué canal usar primero según lo disponible (WhatsApp / email / llamada) — ver criterio en §5. |
| **estado_del_contacto** | Uno de: "Localizado, sin contactar" / "Mensaje enviado, sin respuesta" / "Respondido" / "Demo agendada" / "Descartado". |

Estos campos son un complemento operativo a las columnas ya existentes en `CRM_PRIMER_CONTACTO_VILLANUEVA_DEL_TRABUCO.csv` (mismo directorio) — al localizar el contacto, actualizar ambos documentos para no perder trazabilidad.

## 5. Checklist antes de enviar el mensaje

- [ ] El dato de contacto (teléfono, email o canal de formulario) procede de una de las 5 fuentes de §3, verificada directamente — no de una suposición.
- [ ] Se sabe a cuál de los 4 perfiles de §2 corresponde el contacto (Concejalía de Deportes / registro general derivado / instalación con gestión propia / club local).
- [ ] El campo `fuente_exacta` y `fecha_verificación` de §4 están rellenados antes de escribir el primer mensaje.
- [ ] Se ha revisado `PRIMER_CONTACTO_VILLANUEVA_DEL_TRABUCO.md` §3 ("Qué NO prometer") inmediatamente antes de escribir o llamar.
- [ ] Se ha comprobado en `CRM_PRIMER_CONTACTO_VILLANUEVA_DEL_TRABUCO.csv` y en `projects/agencia-ia/terminal-ready/CRM_INICIAL_PROSPECCION.md` que el estado sigue siendo "Sin contactar" (evitar duplicar el envío).
- [ ] Se ha elegido el canal (§6-8) según qué dato esté realmente disponible — no forzar WhatsApp si solo hay email, ni al revés.

## 6. Mensaje corto para WhatsApp o formulario web

> Buenos días. Le escribimos desde Agencia IA — hemos desarrollado un sistema digital de reservas para pistas de pádel municipales que ya funciona en el Ayuntamiento de Archidona, un municipio cercano. Permite a los vecinos reservar pista desde el móvil sin coste, y da al Ayuntamiento un panel para ver la ocupación sin llamadas ni gestión manual. Nos encantaría mostrarle una demo breve de 15 minutos, sin compromiso. ¿Tendría un hueco esta semana o la próxima?

*(Mismo mensaje que `PRIMER_CONTACTO_VILLANUEVA_DEL_TRABUCO.md` §4, repetido aquí para tener el guion de ejecución autocontenido.)*

## 7. Mensaje medio para email

**Asunto**: Sistema de reservas de pádel ya en funcionamiento en Archidona — propuesta para Villanueva del Trabuco

> Buenos días:
>
> Me pongo en contacto desde Agencia IA. Hemos desarrollado un sistema digital de reservas para instalaciones deportivas municipales, ya en funcionamiento en el Ayuntamiento de Archidona, con buena acogida entre los vecinos.
>
> El sistema permite reservar pista desde el móvil sin coste para el usuario, da al Ayuntamiento un panel de gestión con visibilidad completa de la ocupación, y reduce llamadas y gestión manual del personal municipal.
>
> Nos encantaría mostrarles una demo breve, sin compromiso, para valorar si encaja en las instalaciones deportivas de Villanueva del Trabuco. Quedamos a su disposición para concretar una fecha que les venga bien.
>
> Un saludo,
> [Nombre] — Agencia IA

## 8. Guion de llamada de 60 segundos

Versión ultra-corta para cuando solo hay un margen breve (ej. la persona atiende de pasada o hay poco tiempo antes de que cuelguen):

> "Buenos días, ¿hablo con la persona responsable de Deportes? Le llamo de Agencia IA. Hemos creado un sistema de reservas online para pistas de pádel municipales, que ya funciona en el Ayuntamiento de Archidona — permite a los vecinos reservar desde el móvil y al Ayuntamiento llevar el control sin gestión manual. ¿Le interesaría que le mande la información por WhatsApp o email para verlo con calma, o prefiere que le proponga una demo de 15 minutos directamente?"

Objetivo de esta versión: no perder la llamada por falta de tiempo — dejar abierta cualquiera de las dos vías (info por escrito o demo directa) y cerrar con lo que la persona prefiera.

## 9. Guion si responde "envíame información"

> "Perfecto, se lo mando ahora mismo por [WhatsApp/email, según lo que haya facilitado]. Ahí tiene un resumen breve de cómo funciona y qué incluye. Si después de leerlo le interesa, con que me diga un par de días que le vengan bien para una demo de 15 minutos, se lo enseño en directo."

**Acción**: enviar el mensaje corto (§6) o medio (§7) inmediatamente después de colgar, no dejarlo para más tarde. Registrar el estado como "Mensaje enviado, sin respuesta" hasta que conteste.

## 10. Guion si responde "no me interesa"

> "Entendido, muchas gracias por su tiempo. Si en algún momento cambia la situación o surge la necesidad, quedamos a su disposición. Que tenga un buen día."

**Acción**: no insistir, no repreguntar el motivo salvo que la persona lo ofrezca voluntariamente. Registrar el estado como "Descartado" en el CRM, con fecha, y no volver a contactar antes de un ciclo comercial posterior (según criterio ya definido en `GUION_COMERCIAL_FINAL_AGENCIA_IA.md`, no antes de 2-3 meses).

## 11. Guion si responde "ya usamos otro sistema"

> "Me alegra saber que ya lo tienen resuelto. Si en algún momento echan en falta algo — por ejemplo, ranking de jugadores, torneos, o simplemente quieren comparar coste y funcionalidades — quedamos disponibles para enseñarles cómo lo hacemos nosotros, sin ningún compromiso. ¿Le parece bien que le deje mi contacto por si acaso?"

**Acción**: si aceptan dejar el contacto abierto, registrar el estado como "Descartado (con sistema propio)" y no como cierre negativo total — revisar de nuevo en unos meses por si el otro sistema no cumple expectativas. Si rechazan explícitamente, tratar igual que §10.

## 12. Siguiente paso tras enviar el mensaje

1. Si no hay respuesta en 48 horas: aplicar el seguimiento Día 2 ya definido en `projects/agencia-ia/terminal-ready/GUION_COMERCIAL_FINAL_AGENCIA_IA.md` §4.
2. Si tampoco hay respuesta tras el seguimiento Día 2: aplicar el seguimiento Día 5 (mismo documento, §5).
3. Si hay respuesta positiva en cualquier momento: pasar directamente a proponer fecha de demo (`PRIMER_CONTACTO_VILLANUEVA_DEL_TRABUCO.md` §11).
4. Tras el seguimiento Día 5 sin respuesta: marcar como "Descartado (temporal)" y no volver a intentar antes de 2-3 meses.

## 13. Cómo registrar la respuesta

Actualizar, en el mismo momento en que ocurra cada interacción real (no al final del día ni de memoria):

1. `CRM_PRIMER_CONTACTO_VILLANUEVA_DEL_TRABUCO.csv` (mismo directorio): campos `estado`, `fecha_primer_contacto`, `fecha_seguimiento`, `notas`, `proximo_paso`.
2. `projects/agencia-ia/terminal-ready/CRM_INICIAL_PROSPECCION.md` §2.2 (registro de Villanueva del Trabuco): campo "Estado" y "Próxima acción".
3. Los campos manuales de §4 de este documento (`responsable`, `cargo`, `teléfono`, `email`, `fuente_exacta`, `fecha_verificación`, `canal_recomendado`, `estado_del_contacto`), en cuanto se verifique cualquiera de ellos, aunque todavía no haya respuesta.

No dejar ninguna interacción real sin registrar — es la única forma de que el resto del equipo (o una sesión de terminal futura) sepa el estado real sin tener que preguntar.

## 14. Qué NO hacer

- No prometer WhatsApp Business integrado — no forma parte de la fase inicial del producto.
- No prometer pagos online reales dentro de la aplicación — no forma parte de la fase inicial.
- No decir ni dar a entender que el sistema está "en producción inmediata" para Villanueva del Trabuco — lo único verificable hoy es el piloto de Archidona; Villanueva del Trabuco sería una implantación nueva, con las semanas de proceso ya documentadas en la landing.
- No prometer resultados garantizados (ahorro de tiempo, ocupación, ingresos) — no hay ninguna cifra medida y verificada más allá del piloto de Archidona, y esa cifra tampoco está cuantificada en este repositorio.
- No inventar, suponer ni completar con datos plausibles ningún nombre, teléfono, email o cargo — ver advertencia inicial de este documento y `PRIMER_CONTACTO_VILLANUEVA_DEL_TRABUCO.md` §16.
- No cerrar precio de palabra en ninguna de las conversaciones cubiertas por este documento (mensaje corto, llamada de 60 segundos, o respuestas a "envíame información") — remitir siempre a la demo y a una propuesta formal posterior.
