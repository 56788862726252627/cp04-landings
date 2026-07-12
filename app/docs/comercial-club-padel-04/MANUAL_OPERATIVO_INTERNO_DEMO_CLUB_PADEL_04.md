# Manual Operativo Interno de Demo — Club Pádel 04

**Uso**: documento de uso interno, no comercial. No se entrega al cliente. Sirve para ejecutar una demo real de forma ordenada, sin improvisar, ante un ayuntamiento, polideportivo o club deportivo. Complementa (no sustituye) a `PROPUESTA_AYUNTAMIENTO_CLUB_PADEL_04.md` y `MANUAL_DEMO_AYUNTAMIENTO_CLUB_PADEL_04.md`.

---

## 1. Objetivo del manual

Este manual existe para que la persona que ejecuta la demo sepa exactamente qué preparar, qué arrancar, en qué orden navegar y qué hacer si algo falla — **sin improvisar en el momento**, delante del cliente. Es una checklist de ejecución, no un argumentario comercial (para eso está el manual comercial).

---

## 2. Preparación antes de abrir la demo

- [ ] Revisar que la aplicación esté funcionando correctamente en el entorno local antes de que llegue nadie.
- [ ] Comprobar que la pantalla carga sin errores visibles ni tiempos de espera largos.
- [ ] Revisar batería del portátil/dispositivo y conexión de red (o tener un plan alternativo de conexión).
- [ ] Cerrar todas las pestañas del navegador que no formen parte de la demo, especialmente cualquiera con información interna, técnica o de otros clientes.
- [ ] Tener la propuesta comercial (`PROPUESTA_AYUNTAMIENTO_CLUB_PADEL_04.md`) preparada, en PDF o impresa.
- [ ] Tener el manual comercial (`MANUAL_DEMO_AYUNTAMIENTO_CLUB_PADEL_04.md`) repasado antes de entrar.
- [ ] Tener capturas de pantalla de respaldo guardadas y accesibles por si algo falla en directo (ver §11).

---

## 3. Cómo arrancar la app (orientativo, entorno local)

Solo para preparar el entorno de demo antes de la reunión — no ejecutar nada de esto delante del cliente.

```
# Terminal 1
cd ruta-del-proyecto
npm run dev -- --host 0.0.0.0
```

Abrir después en el navegador: `http://localhost:5173`

Verificar que carga correctamente **con margen de tiempo antes de la reunión**, no en el último minuto. No modificar código, no hacer deploy, no hacer push durante esta preparación — si algo no carga bien, usar el plan B (§11), no intentar arreglarlo en caliente delante del cliente.

---

## 4. Usuarios o roles de demo

Orden de uso recomendado según a quién se le enseña:

- **PLAYER** — usar primero siempre: es la experiencia que va a vivir el vecino/ciudadano, la parte que más conecta con el interlocutor no técnico.
- **STAFF** — usar para mostrar la gestión operativa del día a día (reservas, ocupación), si el interlocutor tiene responsabilidad operativa.
- **ADMIN** — usar solo si el interlocutor tiene responsabilidad de decisión/control, para mostrar visión de conjunto.
- **SUPPORT** — evitar en una primera demo salvo necesidad explícita; si se usa, no navegar a ninguna pantalla con aspecto técnico o de configuración interna.

---

## 5. Orden ideal de la demo

1. Login
2. Inicio / vista operativa de Club Pádel 04
3. Reservas
4. Perfil
5. Ranking
6. Torneos
7. Gestión / Staff
8. Beneficios para el Ayuntamiento (hablado, sin pantalla)
9. Precio y alcance
10. Próximo paso

---

## 6. Qué enseñar en cada pantalla

### Login
- **Mostrar**: acceso simple con usuario y contraseña.
- **Decir**: "El acceso es tan sencillo como el de cualquier app que ya usan."
- **Beneficio**: nada nuevo que aprender.
- **Evitar**: detenerse en esta pantalla más de unos segundos; no es la parte que vende.

### Registro
- **Mostrar**: solo si se pregunta explícitamente cómo se da de alta un vecino nuevo.
- **Decir**: "El alta de un nuevo usuario es igual de sencilla."
- **Beneficio**: proceso de incorporación sin fricción.
- **Evitar**: mostrarlo si no se pregunta — no añade valor en una primera demo y alarga el tiempo.

### Recuperar contraseña
- **Mostrar**: solo si se pregunta explícitamente.
- **Decir**: "Si alguien olvida su acceso, puede recuperarlo él mismo sin llamar a nadie."
- **Beneficio**: menos carga de soporte para el personal municipal.
- **Evitar**: dedicarle tiempo si nadie lo pide.

### Inicio
- **Mostrar**: la pantalla principal tal como la ve un vecino al entrar.
- **Decir**: "Esto es lo primero que ve el vecino: sus opciones de un vistazo."
- **Beneficio**: claridad frente al sistema manual actual.
- **Evitar**: nombres de módulos técnicos; usar siempre "la aplicación" o "el sistema".

### Reservas
- **Mostrar**: una reserva completa, de principio a fin, en tiempo real.
- **Decir**: "Aquí reserva una pista en segundos, viendo la disponibilidad real."
- **Beneficio**: elimina el problema de reservas manuales y errores de disponibilidad.
- **Evitar**: explicar cómo se calcula la disponibilidad por dentro.

### Perfil
- **Mostrar**: datos básicos e historial de reservas del jugador.
- **Decir**: "Cada vecino tiene su propio historial, sin depender de recordar nada."
- **Beneficio**: orden y trazabilidad.
- **Evitar**: prometer que todo dato quedará guardado de forma permanente sin haberlo verificado antes en el entorno de demo del día.

### Ranking
- **Mostrar**: solo si se verificó minutos antes que se ve correctamente.
- **Decir**: "Esto da visibilidad a los jugadores más activos y anima la participación."
- **Beneficio**: dinamización deportiva, valor añadido sobre la simple reserva.
- **Evitar**: presentarlo como un producto cerrado y definitivo; presentarlo como algo que sigue mejorando.

### Torneos
- **Mostrar**: seguir el flujo específico del §7.
- **Decir**: "Con esto pueden organizar torneos del club de forma ordenada, sin hojas de cálculo sueltas."
- **Beneficio**: organización de actividad deportiva municipal.
- **Evitar**: presentarlo como un sistema con historial de años; presentarlo como una herramienta de apoyo a la organización.

### Gestión
- **Mostrar**: solo la vista operativa de reservas y ocupación del día.
- **Decir**: "Esto es lo que vería el personal del polideportivo: todas las reservas del día, sin llamadas."
- **Beneficio**: menos carga administrativa, más control.
- **Evitar**: cualquier pantalla de configuración, ajustes avanzados o parámetros internos.

### Sidebar
- **Mostrar**: solo como referencia de navegación, sin detenerse en cada opción.
- **Decir**: "Todo está organizado en un menú sencillo, para no perderse."
- **Beneficio**: facilidad de uso.
- **Evitar**: abrir opciones del menú que no estén planificadas en el guion de la demo de ese día.

---

## 7. Flujo específico de Torneos (guion operativo)

1. Abrir el módulo de Torneos.
2. Revisar en voz alta los datos básicos del torneo (nombre, fecha, formato) — verificado previamente, no improvisado.
3. Añadir una o dos parejas de ejemplo en directo, para mostrar que es sencillo.
4. Comprobar que el cuadro (bracket) se genera correctamente con los datos añadidos.
5. Mostrar el sorteo o los descansos (BYE) si el número de parejas lo requiere y si se ha verificado que se ve bien.
6. Marcar un resultado/ganador de ejemplo para mostrar el avance del cuadro.
7. Revisar cómo se refleja ese resultado en el ranking.
8. Mostrar la exportación de datos (JSON/CSV) solo si se ha probado antes y funciona sin errores.
9. Mostrar impresión/PDF solo si aplica y se ha verificado previamente.
10. Cerrar el bloque explicando que es un **módulo preparado para seguir ampliándose** junto con el club, no un producto cerrado desde el primer día.

Si en el ensayo previo a la reunión cualquiera de estos pasos no se ve bien, **omitir el paso concreto** y seguir con el siguiente, sin detenerse a explicar por qué.

---

## 8. Qué NO enseñar en una primera demo

- Claves, contraseñas maestras o credenciales de cualquier tipo.
- Tokens o cualquier dato de acceso a sistemas.
- Registros técnicos (logs) o mensajes de depuración.
- Nombres de proveedores o herramientas internas de cualquier tipo.
- Pantallas de configuración técnica o parámetros de sistema.
- Errores internos, aunque aparezcan por accidente — cerrar esa pantalla con naturalidad.
- Cualquier mención o pantalla relacionada con integraciones de automatización, mensajería o comunicación con terceros.
- Cualquier mención o pantalla relacionada con procesamiento de pagos.
- Mensajería tipo WhatsApp Business real.
- Cualquier referencia a interfaces de programación (APIs) internas.
- Arquitectura técnica del sistema, esquemas o diagramas internos.
- Documentos internos de diseño técnico o planos de construcción del sistema.
- Cualquier detalle que pudiera facilitar que un tercero replique el sistema.

---

## 9. Mensajes prohibidos o a evitar

Evitar frases que revelen funcionamiento interno o generen dudas innecesarias, por ejemplo:
- "esto depende de [proveedor externo]"
- "esto va por [herramienta de automatización]"
- "hay un límite de uso de la conexión externa"
- "todavía no está validado en real" (delante del cliente)
- "esto es una prueba técnica"

**Sustituir siempre por lenguaje comercial**:
- "fase piloto"
- "sistema preparado"
- "módulo ampliable"
- "validación progresiva"
- "puesta en marcha controlada"

Regla simple: si una frase suena a explicación técnica, se cambia por una frase que suene a proceso de mejora continua del servicio.

---

## 10. Checklist visual antes de enseñar

- [ ] Botón de "Iniciar sesión" visible y funcionando correctamente.
- [ ] Contador o indicador de progreso (si aplica) mostrando un valor coherente.
- [ ] Menú lateral (sidebar) se despliega y navega sin errores.
- [ ] Tarjetas de contenido se ven completas, sin recortes.
- [ ] Flujo de reservas probado de principio a fin sin errores.
- [ ] Cuadro de torneo (bracket) probado y visualmente correcto.
- [ ] Ranking probado y con datos coherentes.
- [ ] Ningún texto cortado o desbordado en las pantallas a mostrar.
- [ ] Todos los botones relevantes visibles sin necesidad de hacer scroll excesivo.
- [ ] Contraste de color correcto y legible en la pantalla que se va a usar para proyectar.
- [ ] Probado en el dispositivo real que se usará (móvil, tablet o escritorio), no solo en otro dispositivo distinto.

---

## 11. Plan B si falla algo

1. No mostrar el error técnico en pantalla bajo ninguna circunstancia — cerrar o cambiar de pantalla con naturalidad.
2. Pasar a las capturas de pantalla de respaldo preparadas de antemano y seguir la explicación sobre esas capturas.
3. Redirigir el discurso hacia la explicación comercial del beneficio, no hacia lo que ha fallado.
4. Anotar la incidencia en cuanto termine la reunión, con el detalle suficiente para revisarla después (sin hacerlo delante del cliente).
5. Ofrecer una demo ajustada en una fecha posterior, ya corregida, como parte del seguimiento normal (no como disculpa extensa en el momento).

---

## 12. Cierre de reunión

Al terminar la demo, antes de despedirse:

- Confirmar el nivel de interés real del interlocutor con una pregunta directa.
- Validar en voz alta las necesidades específicas mencionadas durante la reunión, para dejar constancia de que se han entendido.
- Acordar una fecha concreta para la siguiente reunión o paso.
- Pedir los datos básicos de contacto del responsable adecuado, si no se tenían ya.
- Confirmar que se enviará la propuesta comercial por escrito tras la reunión.
- Identificar con claridad quién es el responsable municipal que tomará la decisión final.

---

## 13. Checklist posterior a la reunión

- [ ] Enviar un email/mensaje de resumen de lo hablado.
- [ ] Adjuntar la propuesta comercial completa.
- [ ] Registrar por escrito las dudas planteadas durante la reunión.
- [ ] Registrar por escrito las objeciones planteadas y cómo se respondieron.
- [ ] Preparar el siguiente paso acordado (fecha, contenido, responsable) antes de que pase demasiado tiempo desde la reunión.

---

## 14. Resumen rápido de 1 página (consulta justo antes de la demo)

**Orden**: Login → Inicio → Reservas → Perfil → Ranking → Torneos → Gestión → Beneficios (hablado) → Precio → Siguiente paso.

**Rol a usar primero**: PLAYER. Añadir STAFF/ADMIN solo si el interlocutor lo justifica.

**Antes de empezar**: app cargada y probada, pestañas sensibles cerradas, propuesta y manual comercial a mano, capturas de respaldo preparadas.

**Nunca mostrar**: claves, tokens, logs, pantallas de configuración, errores técnicos, nombres de proveedores/herramientas internas, integraciones de pago o mensajería, arquitectura del sistema.

**Nunca decir**: nada que suene técnico. Usar siempre "fase piloto", "sistema preparado", "módulo ampliable", "validación progresiva", "puesta en marcha controlada".

**Si algo falla**: capturas de respaldo, seguir hablando en comercial, anotar después, nunca improvisar una solución delante del cliente.

**Precio a repetir siempre igual**: 2.700 € + IVA implantación, 250 €/mes + IVA mantenimiento, 0 € para el jugador. Precio piloto, no permanente.

**Cierre**: validar interés, acordar próxima fecha, confirmar responsable, enviar propuesta después.
