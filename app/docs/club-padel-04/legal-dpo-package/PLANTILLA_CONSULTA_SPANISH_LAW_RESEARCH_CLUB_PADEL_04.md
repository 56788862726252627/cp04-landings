# Plantilla de consulta — Spanish Law Research (apoyo auxiliar)

> ⚠️ **Spanish Law Research es una herramienta auxiliar de investigación normativa y no sustituye la revisión de abogado/DPO real.**
> Todo lo que se pegue aquí es **investigación preliminar**, no asesoramiento legal. Ningún contenido de este documento debe interpretarse como confirmación de cumplimiento normativo. La decisión final sobre PR #24 y el resto de la cadena de gobernanza depende exclusivamente de la revisión de un abogado/DPO real (ver `EMAIL_SOLICITUD_REVISION_DPO_CLUB_PADEL_04.md`).

**Estado: BORRADOR — 2 de 9 bloques con insumo normativo preliminar (menores, cookies), 7 bloques todavía vacíos.** Esta plantilla no contiene ninguna conclusión legal propia; el contenido de los bloques rellenados es cita directa de normativa aportada por el usuario a partir de Spanish Law Research, no interpretación de este equipo técnico.

**Fecha de preparación:** 2026-07-18
**Última actualización:** 2026-07-18 — incorporados 2 insumos normativos (menores, cookies)

---

## Cómo usar esta plantilla

1. Copia cada pregunta de investigación de un bloque en Spanish Law Research.
2. Pega la respuesta obtenida en el hueco **"Respuesta de Spanish Law Research"** correspondiente, tal cual la entregue la herramienta (sin editarla ni resumirla en ese primer paso).
3. Rellena tú mismo, después, el resumen de puntos útiles y las dudas que sigan abiertas.
4. Al final del documento hay una sección para consolidar las preguntas finales que, pese a la investigación auxiliar, deben ir sí o sí al abogado/DPO real.

---

## Insumos preliminares verificados con Spanish Law Research

> **Naturaleza de esta sección: cita directa de normativa, aportada por el usuario a partir de Spanish Law Research. No es interpretación legal de este equipo técnico ni conclusión de cumplimiento. Pendiente de validación por abogado/DPO real antes de aplicarse a ninguna decisión de producto.**

**Fecha de incorporación:** 2026-07-18

### Insumo 1 — Consentimiento de menores en tratamiento de datos personales

- **Identificador:** BOE-A-2018-16673 — Ley Orgánica 3/2018, art. 7.
- **Contenido aportado:** el consentimiento de menores para tratamiento de datos personales solo puede fundarse en el propio consentimiento del menor cuando sea mayor de 14 años. Para menores de 14 años, si el tratamiento se basa en consentimiento, debe constar el consentimiento de quien tenga la patria potestad o tutela.
- **Marcadores explícitos derivados de este insumo (no interpretación adicional, restatement directo):**
  - Menores de 14 años requieren revisión especial y posible consentimiento de quien ostente la patria potestad o tutela.
  - Mayores de 14 años pueden consentir determinados tratamientos por sí mismos, salvo en los supuestos en que la ley exija expresamente la asistencia de quien ostente la patria potestad o tutela.

### Insumo 2 — Cookies y dispositivos de almacenamiento/recuperación de datos

- **Identificador:** BOE-A-2002-13758 — Ley 34/2002, art. 22.
- **Contenido aportado:** para cookies o dispositivos de almacenamiento o recuperación de datos, el prestador debe facilitar información clara y completa sobre su uso y obtener consentimiento, salvo almacenamiento/acceso técnico necesario para transmitir una comunicación o prestar un servicio expresamente solicitado.
- **Marcadores explícitos derivados de este insumo (no interpretación adicional, restatement directo):**
  - Cookies o almacenamientos no esenciales requieren información clara y consentimiento previo.
  - Cookies técnicas estrictamente necesarias (transmisión de comunicación o prestación del servicio solicitado) quedan fuera de ese requisito de consentimiento según el texto aportado — su aplicación exacta al caso concreto de Club Pádel 04 (qué cookies/almacenamiento local del service worker PWA entran en esa excepción) **debe ser validada por abogado/DPO real**, no se da por buena aquí.

---

## Bloque 1 — RGPD/LOPDGDD aplicable a Club Pádel 04

**Preguntas de investigación sugeridas:**
- ¿Qué obligaciones generales de RGPD y LOPDGDD aplican a una plataforma SaaS española que trata datos de socios de clubes deportivos, incluyendo una capa social (feed, perfil, conexiones entre usuarios)?
- ¿Qué diferencia hay entre el régimen general RGPD y las particularidades específicas de la LOPDGDD para este tipo de tratamiento?

**Respuesta de Spanish Law Research:**
> _(pegar aquí)_

**Resumen de puntos útiles:**
> _(rellenar tras leer la respuesta)_

**Dudas que siguen abiertas:**
> _(rellenar)_

---

## Bloque 2 — Edad mínima y consentimiento de menores

**Preguntas de investigación sugeridas:**
- ¿Qué edad mínima establece la normativa española (LOPDGDD art. 7 y concordantes) para que un menor pueda prestar su propio consentimiento al tratamiento de datos personales en servicios de la sociedad de la información?
- ¿Qué mecanismos de verificación de consentimiento parental se consideran válidos en la práctica española/UE para redes sociales o servicios similares?

**Respuesta de Spanish Law Research:**
> BOE-A-2018-16673 — Ley Orgánica 3/2018, art. 7: el consentimiento de menores para tratamiento de datos personales solo puede fundarse en el propio consentimiento del menor cuando sea mayor de 14 años. Para menores de 14 años, si el tratamiento se basa en consentimiento, debe constar el consentimiento de quien tenga la patria potestad o tutela.

**Resumen de puntos útiles:**
> - Menores de 14 años: requieren revisión especial y, si el tratamiento se basa en consentimiento, consentimiento de quien ostente la patria potestad o tutela.
> - Mayores de 14 años: pueden consentir determinados tratamientos por sí mismos, salvo en los supuestos en que la ley exija expresamente la asistencia de quien ostente la patria potestad o tutela (el insumo no especifica cuáles son esos supuestos para el caso de una capa social deportiva).

**Dudas que siguen abiertas:**
> - El insumo no especifica qué mecanismo de verificación de edad/consentimiento parental se considera válido en la práctica — sigue siendo la pregunta 2 de `PREGUNTAS_ABOGADO_DPO_CLUB_PADEL_04.md`, sin resolver.
> - No queda claro si el umbral de 14 años, tal como está redactado en el art. 7 LOPDGDD, es el único aplicable o si existe normativa sectorial deporte/menores que lo module (ver pregunta 1 del mismo documento).
> - No se ha determinado si las funciones concretas de Comunidad Pádel 04 (feed, perfil, partidos abiertos) encajan en "servicios de la sociedad de la información" a efectos de este artículo, ni si alguna de ellas cae en los "supuestos" que exigirían asistencia de patria potestad incluso para mayores de 14 años.

---

## Bloque 3 — Necesidad de EIPD/DPIA

**Preguntas de investigación sugeridas:**
- ¿En qué supuestos exige la AEPD (o el Comité Europeo de Protección de Datos) una Evaluación de Impacto relativa a la Protección de Datos antes de lanzar una funcionalidad de red social dentro de una app existente?
- ¿El volumen de usuarios o el tipo de dato tratado (fotos, geolocalización de partidos, conexiones sociales) cambia esta obligación?

**Respuesta de Spanish Law Research:**
> _(pegar aquí)_

**Resumen de puntos útiles:**
> _(rellenar)_

**Dudas que siguen abiertas:**
> _(rellenar)_

---

## Bloque 4 — Derecho de imagen

**Preguntas de investigación sugeridas:**
- ¿Qué exige la Ley Orgánica 1/1982 (derecho al honor, intimidad y propia imagen) para que un usuario pueda publicar fotos propias o de terceros en una red social española?
- ¿Qué ocurre cuando un usuario etiqueta o incluye a otra persona identificable sin su consentimiento explícito?

**Respuesta de Spanish Law Research:**
> _(pegar aquí)_

**Resumen de puntos útiles:**
> _(rellenar)_

**Dudas que siguen abiertas:**
> _(rellenar)_

---

## Bloque 5 — Política de privacidad

**Preguntas de investigación sugeridas:**
- ¿Qué contenido mínimo exige una política de privacidad española/RGPD-compliant para una app que combina funciones transaccionales (reservas) y sociales (comunidad)?
- ¿Es necesario diferenciar la base jurídica por funcionalidad dentro del mismo documento?

**Respuesta de Spanish Law Research:**
> _(pegar aquí)_

**Resumen de puntos útiles:**
> _(rellenar)_

**Dudas que siguen abiertas:**
> _(rellenar)_

---

## Bloque 6 — Cookies

**Preguntas de investigación sugeridas:**
- ¿Qué exige la Guía de Cookies de la AEPD para el consentimiento de cookies/almacenamiento local en una app web española en 2026?
- ¿Aplica algún régimen distinto si la app funciona también como PWA (service worker, almacenamiento offline)?

**Respuesta de Spanish Law Research:**
> BOE-A-2002-13758 — Ley 34/2002, art. 22: para cookies/dispositivos de almacenamiento o recuperación de datos, el prestador debe facilitar información clara y completa sobre su uso y obtener consentimiento, salvo almacenamiento/acceso técnico necesario para transmitir una comunicación o prestar un servicio expresamente solicitado.

**Resumen de puntos útiles:**
> - Cookies o almacenamientos no esenciales: requieren información clara y consentimiento previo del usuario.
> - Cookies técnicas estrictamente necesarias (transmisión de una comunicación o prestación del servicio expresamente solicitado): el texto aportado las exceptúa del consentimiento — pero su aplicación exacta al caso concreto de Club Pádel 04 debe ser validada por abogado/DPO real, no se da por buena en este documento.

**Dudas que siguen abiertas:**
> - El insumo no dice explícitamente si el almacenamiento del service worker de la PWA (shell estático, página offline) entra en la excepción de "acceso técnico necesario para prestar el servicio solicitado" o si requiere información/consentimiento como cookie no esencial — pendiente de validar.
> - No se ha contrastado este insumo contra la Guía de Cookies de la AEPD vigente en 2026 (la pregunta de investigación original lo pedía; el insumo aportado es el texto legal de la Ley 34/2002, no la guía interpretativa de la AEPD).
> - No queda determinado qué elementos concretos de `public/sw.js` y `public/manifest.webmanifest` (ya existentes en el código, ver PR #26) caen en cada categoría — esto requeriría revisión técnica conjunta con el abogado/DPO, no solo normativa.

---

## Bloque 7 — Términos y condiciones

**Preguntas de investigación sugeridas:**
- ¿Qué cláusulas mínimas debería incluir un término de uso español para una funcionalidad de red social integrada en un servicio existente (moderación, conducta aceptable, consecuencias de incumplimiento)?
- ¿Aplica normativa de comercio electrónico (LSSI-CE) adicional por tratarse de un servicio de la sociedad de la información?

**Respuesta de Spanish Law Research:**
> _(pegar aquí)_

**Resumen de puntos útiles:**
> _(rellenar)_

**Dudas que siguen abiertas:**
> _(rellenar)_

---

## Bloque 8 — Responsabilidad Club vs. Agencia IA

**Preguntas de investigación sugeridas:**
- Bajo RGPD, ¿cuándo se considera a una entidad "responsable" y cuándo "encargado" del tratamiento en una relación SaaS B2B2C como la de la Agencia IA (proveedor de software) y los clubes (clientes que gestionan sus propios socios)?
- ¿Qué debería contener un Acuerdo de Encargo de Tratamiento (AET) en este contexto?

**Respuesta de Spanish Law Research:**
> _(pegar aquí)_

**Resumen de puntos útiles:**
> _(rellenar)_

**Dudas que siguen abiertas:**
> _(rellenar)_

---

## Bloque 9 — Comunidad social, ranking, torneos y comunicaciones

**Preguntas de investigación sugeridas:**
- ¿Un ranking social visible entre usuarios (posición, estadísticas de juego) requiere una base jurídica o consentimiento distinto del resto de la capa social?
- ¿Las notificaciones automatizadas de actividad social (invitaciones, alertas de partidos abiertos) están cubiertas por interés legítimo, o requieren opt-in explícito bajo normativa española de comunicaciones electrónicas?

**Respuesta de Spanish Law Research:**
> _(pegar aquí)_

**Resumen de puntos útiles:**
> _(rellenar)_

**Dudas que siguen abiertas:**
> _(rellenar)_

---

## Consolidación final — preguntas que van sí o sí al abogado/DPO real

> Rellenar esta sección **después** de completar los 9 bloques anteriores. El objetivo es quedarte solo con lo que Spanish Law Research no pudo resolver con certeza, o lo que por su naturaleza (decisión de negocio, interpretación normativa aplicada al caso concreto, responsabilidad contractual) requiere sí o sí criterio profesional humano.

**Preguntas que siguen abiertas tras la investigación auxiliar:**
> _(rellenar)_

**Puntos donde Spanish Law Research y la autoevaluación técnica interna (`DECISION_MENORES_Y_REVISION_LEGAL_COMUNIDAD_PADEL_04.md`) parecen coincidir:**
> _(rellenar)_

**Puntos donde parecen divergir o donde conviene que el abogado/DPO desambigüe:**
> _(rellenar)_

---

## Pendiente de validar por abogado/DPO real

**Estado de cobertura de los 9 bloques a fecha 2026-07-18:**

| Bloque | Estado |
|---|---|
| 1 — RGPD/LOPDGDD aplicable | Pendiente de consulta |
| 2 — Edad mínima y consentimiento de menores | Insumo preliminar incorporado (BOE-A-2018-16673, art. 7) — con dudas abiertas sin resolver |
| 3 — Necesidad de EIPD/DPIA | Pendiente de consulta |
| 4 — Derecho de imagen | Pendiente de consulta |
| 5 — Política de privacidad | Pendiente de consulta |
| 6 — Cookies | Insumo preliminar incorporado (BOE-A-2002-13758, art. 22) — con dudas abiertas sin resolver |
| 7 — Términos y condiciones | Pendiente de consulta |
| 8 — Responsabilidad Club vs. Agencia IA | Pendiente de consulta |
| 9 — Comunidad social, ranking, torneos y comunicaciones | Pendiente de consulta |

**Incluso en los bloques 2 y 6, con insumo normativo preliminar, ninguna conclusión de este documento debe tratarse como validada.** El texto legal citado es correcto en su literalidad (aportado directamente por el usuario), pero su aplicación al caso concreto de Club Pádel 04 — qué mecanismo de verificación de edad usar, qué elementos técnicos concretos de la PWA caen en cada categoría de cookie, si existe normativa sectorial adicional — sigue sin resolver y requiere criterio profesional humano, no solo la norma citada.

---

## Recordatorio final

Ningún contenido de este documento, aunque esté completado, autoriza por sí mismo:
- Integrar Comunidad Pádel 04 en `App.jsx` con datos reales.
- Activar la capa social para usuarios reales, menores o no.
- Cambiar el estado de PR #24, PR #26, PR #27 o PR #36.

Esas decisiones dependen exclusivamente de la revisión del abogado/DPO real, usando este documento como uno de los insumos de partida.
