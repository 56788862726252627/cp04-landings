# Base de Conocimiento — Drive IA, Skills y Prompts (Agencia IA + Club Pádel 04)

## Propósito

Este documento consolida, como **premisa base permanente**, el conocimiento disperso en Google Drive (cursos de IA, prompts maestros, materiales de venta, skills de Claude Code) para que cualquier trabajo futuro —landings, sistemas replicables, automatizaciones, nuevos negocios o mejoras sobre Club Pádel 04— parta del mismo criterio, sin tener que re-explicarlo cada vez.

No sustituye a los documentos operativos existentes (pricing, CRM, diagnóstico, propuesta, etc.). Es la capa de **criterio y reglas** que debe respetarse antes de tocar cualquiera de ellos.

## Resumen ejecutivo

- La Agencia IA vende **resultados de negocio** (tiempo, clientes, ventas, control, tranquilidad), no "IA" como concepto técnico.
- Club Pádel 04 es el **caso de referencia real** (SaaS ya construido, con su propia identidad) a partir del cual se replica el proceso — nunca la estética — hacia otros sectores.
- **GitHub es la fuente de verdad**; Google Drive es la copia exportable/ordenada, nunca al revés.
- Todo negocio nuevo se analiza en su propia marca, colores, logo, tipografía, tono y sector antes de crear nada visual.
- La prospección (Apify u otra herramienta) es un apoyo, nunca una dependencia obligatoria: siempre debe existir una vía manual gratuita.
- Ninguna integración sensible (Make, Airtable, Stripe, WhatsApp, pagos, APIs externas, Worker, auth, reservas) se toca sin permiso explícito, y ningún despliegue (deploy/push/merge/PR) se ejecuta sin autorización.
- Antes de vender cualquier servicio se pasa por diagnóstico → propuesta → pricing → CRM, en ese orden.
- Todo lo que se construye debe estar pensado para ser **replicable y vendible**, no solo funcional para un único cliente.

---

## Bloques de conocimiento

### 1. Carpeta IA (Drive)

Contiene el material base de formación y venta:
- Guías de curso IA.
- OpenAI en Google Sheets (uso de IA dentro de hojas de cálculo para tareas operativas).
- Materiales para vender paquetes de IA a negocios.
- Contenido de redes sociales.
- Academia IA Winners.

Uso: referencia de contenido formativo y comercial ya validado; no se reescribe, se reutiliza y adapta según el negocio o la landing en curso.

### 2. Curso IA 2026 — Día 1

Ejes de la formación:
- IA para pensar mejor.
- IA para decidir mejor.
- IA para producir más rápido.
- IA para automatizar tareas repetitivas.
- Pasar de un uso superficial de la IA (preguntas sueltas) a una **integración real en procesos** de negocio.

Aplicación: cualquier automatización o agente que se proponga a un cliente debe poder explicarse en estos cuatro ejes, no como "usamos IA" de forma genérica.

### 3. Curso IA 2026 — Día 2 / Vibe Coding

Idea central: **la clave no es solo programar, es saber pensar, estructurar, explicar y comunicar requisitos.**

- Cuanto mejor definida está una idea (contexto, objetivo, restricciones, formato de salida), mejor resultado dan Claude Code, Figma, Claude Design y el resto de herramientas IA.
- La IA se usa para prototipar, validar, mejorar y escalar — no para sustituir el criterio de quién define el problema.
- Este principio aplica igual de dentro hacia fuera (a nuestros propios prompts y specs) que de fuera hacia dentro (al explicar el proceso a un cliente).

### 4. Agentes IA — Club Pádel 04

Arquitectura de referencia para el sistema de agentes de Club Pádel 04:
- **Orquestador IA central**: coordina a los agentes especialistas, no ejecuta todo directamente.
- **Agentes especialistas** por dominio: QA, seguridad, soporte, reservas, operaciones, revenue, marketing, CRM, onboarding, analítica, escalado.
- **AI Command Center**: panel de control/observabilidad sobre el conjunto de agentes.

Regla de fases: **no implementar todo de golpe.** Se prioriza por fases según impacto y riesgo (ver roadmap y auditorías ya existentes en `docs/agencia-ia/roadmap/` y `app/audit/`), evitando construir agentes especulativos sin necesidad operativa confirmada.

### 5. Prompt Maestro — Agentes IA Club Pádel 04

Principios del prompt maestro que rige el trabajo sobre la app de Club Pádel 04:
- **No rehacer la app desde cero.** Se analiza lo que existe antes de proponer cambios.
- El trabajo consiste en **analizar, mejorar, conectar, depurar, ampliar y escalar**, en ese espíritu — no en sustituir.
- Club Pádel 04 se trata como **SaaS real preparado para venderse**, no como proyecto interno o demo.
- Toda acción sensible (pagos, auth, integraciones externas, despliegues) requiere **seguridad y confirmación explícita** antes de ejecutarse.

### 6. Materiales de venta de servicios IA

- Los negocios no compran "IA": compran **clientes, tiempo, ventas, control, ahorro, profesionalización y tranquilidad**.
- Todo servicio ofrecido debe formularse como **resultado de negocio** ("recuperas 5 horas/semana", "reduces reservas perdidas"), no como capacidad técnica ("tenemos un agente con RAG").
- Se evita lenguaje técnico innecesario en materiales orientados al cliente final; el detalle técnico queda en la documentación interna.

### 7. Automatizaciones con IA

La propuesta de valor de cualquier automatización se apoya en:
- Ahorro de tiempo.
- Captación de clientes.
- Atención al cliente.
- Seguimiento (follow-up) de leads o clientes.
- Optimización de procesos existentes.
- Reducción de tareas manuales repetitivas.

Make, n8n e IA se presentan siempre como **un sistema de resultados**, integrado y con un objetivo de negocio claro — nunca como herramientas sueltas o "conectamos esto con aquello" sin un resultado medible detrás.

### 8. Skills Claude Code

Catálogo de capacidades a tener en cuenta al diseñar servicios o entregables:
- Webs premium (landings y sitios de alta calidad visual).
- Automatizaciones n8n.
- Creador de skills (meta-capacidad: construir nuevas skills reutilizables).
- Integraciones MCP.
- Prompts vendibles (prompts empaquetados como producto o parte de un servicio).
- Claude Code como **CLI para analizar proyectos completos**, crear scripts, automatizar desarrollo y trabajar desde terminal — es decir, como herramienta de producción real, no solo de consulta.

---

## Reglas permanentes para futuros trabajos

Estas reglas se aplican a **cualquier** tarea futura sobre Club Pádel 04, el sistema replicable o un negocio nuevo, salvo instrucción explícita en contra del usuario:

1. **GitHub es la fuente principal de verdad.** Google Drive es copia ordenada/exportable, nunca al revés.
2. **No duplicar documentos.** Si algo ya existe (pricing, matriz de precios, brand system, etc.), se referencia — no se reescribe una segunda versión.
3. **No mezclar Club Pádel 04 con otros negocios.** Carpetas, CRM, pricing y estética se mantienen separados por negocio.
4. **Club Pádel 04 siempre mantiene su propia estética** (verde/negro deportivo y el resto de su brand system). No se reutiliza en otro negocio salvo que ese negocio sea también un club deportivo y la paleta tenga sentido para su marca real.
5. **Un negocio nuevo respeta su propia marca**: colores, logo, tipografía, tono, sector y estilo se analizan antes de proponer nada visual (ver `AUDITORIA_VISUAL_NEGOCIO_TEMPLATE.md`).
6. **Apify es apoyo de prospección, no dependencia obligatoria.** Siempre debe existir y documentarse una alternativa manual gratuita (Google Maps, colegios profesionales, directorios sectoriales).
7. **No tocar Make, Airtable, Stripe, WhatsApp, pagos ni APIs externas sin permiso explícito.** Tampoco Worker, autenticación ni el módulo de reservas de la app.
8. **No hacer deploy, push, merge ni abrir PR sin autorización** explícita del usuario en esa tarea concreta.
9. **Antes de vender, seguir el orden: diagnóstico → propuesta → pricing → CRM.** No se salta directamente a precio o cierre sin diagnóstico previo.
10. **Todo debe estar pensado para ser replicable y vendible**, no solo funcional para el caso concreto que se está resolviendo.

---

## Aplicación práctica por sector

La misma base de conocimiento y las mismas reglas se aplican, adaptando solo el contenido específico del sector, a:

- **Club Pádel 04** — caso de referencia; estética y contenido propios, no se tocan desde otros negocios.
- **Clínicas dentales** — tono de confianza/salud, cumplimiento normativo en captación de datos, CRM propio.
- **Fisioterapia** — enfoque en recurrencia de citas y seguimiento de tratamiento.
- **Veterinaria** — urgencias y recordatorios (vacunas, revisiones) como automatización clave.
- **Abogados** — tono serio/profesional, uso de colegios profesionales como fuente de prospección manual.
- **Peluquería / estética** — fuerte componente visual e Instagram/redes; estética propia del negocio, no genérica.
- **Clínicas de fertilidad** — máxima sensibilidad de datos y tono; cuidado extremo en automatizaciones de contacto.
- **Gimnasios** — similar a Club Pádel 04 en estructura de reservas/membresías, pero con marca propia si no es el mismo negocio.
- **Cualquier negocio local** — se parte siempre de `projects/templates/negocio-replicable/` y del `BRIEF_NUEVO_NEGOCIO.md`, nunca copiando directamente de Club Pádel 04.

En todos los casos, la lógica de pricing conecta con `docs/agencia-ia/precios/` y `MATRIZ_PRECIOS_SERVICIOS_REPLICABLES.md` como referencia — no se inventan cifras nuevas al margen de esa matriz.

---

## Checklist — antes de crear un nuevo servicio

- [ ] ¿El servicio se puede explicar en términos de resultado de negocio (tiempo, clientes, ventas, control, ahorro), no solo técnico?
- [ ] ¿Encaja en uno de los ejes de automatización (captación, atención, seguimiento, optimización, reducción de tareas manuales)?
- [ ] ¿Se ha revisado la matriz de precios existente antes de proponer una cifra?
- [ ] ¿Requiere tocar Make, Airtable, Stripe, WhatsApp, pagos o APIs externas? Si sí, ¿hay permiso explícito?
- [ ] ¿Es replicable para otros negocios del mismo sector, o es exclusivo de un cliente?
- [ ] ¿Se ha evitado lenguaje técnico innecesario en la descripción cara al cliente?

## Checklist — antes de crear una landing

- [ ] ¿Se ha hecho el análisis de marca del negocio (colores, logo, tipografía, tono, sector)?
- [ ] ¿Se ha confirmado que NO se copia automáticamente la estética de Club Pádel 04 (salvo justificación real de marca)?
- [ ] ¿La landing vive en su propia carpeta (`projects/<negocio>/` o `projects/club-padel-04/`), sin mezclar con otro negocio?
- [ ] ¿Existe copy propio del negocio, no reutilizado literalmente de otra plantilla?
- [ ] ¿Se ha seguido la estructura de `04_landing/` del sistema replicable (figma, copy, docs, src, assets)?
- [ ] ¿Está prevista su copia a Drive como exportación posterior, no como fuente?

## Checklist — antes de contactar clientes

- [ ] ¿Existe diagnóstico del negocio (`06_diagnostico/` o equivalente) antes del primer contacto comercial?
- [ ] ¿Existe propuesta formal (`08_propuesta/`) alineada con el diagnóstico?
- [ ] ¿El pricing propuesto viene de la matriz de precios y no de una cifra improvisada?
- [ ] ¿El lead está registrado en el CRM del sector correspondiente, sin mezclar con otro negocio?
- [ ] ¿La prospección usada (Apify o manual) tiene su coste validado o es la vía manual gratuita?
- [ ] ¿El mensaje de contacto está formulado en términos de resultado de negocio, no de tecnología?

---

## Conclusión

Esta base de conocimiento no añade procesos nuevos: **fija por escrito el criterio ya validado** en los cursos de IA, el prompt maestro de Club Pádel 04, los materiales de venta y las skills de Claude Code, para que cualquier terminal, sesión o colaborador futuro parta de las mismas reglas sin necesidad de reconstruir el contexto desde cero. Ante cualquier duda de alcance, seguridad o mezcla entre negocios, este documento — junto con `GUIA_SEPARACION_PROYECTOS_GITHUB_DRIVE.md` y `SISTEMA_REPLICABLE_NUEVO_NEGOCIO_AGENCIA_IA.md` — es la referencia por defecto.
