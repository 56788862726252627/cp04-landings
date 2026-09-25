# Auditoría de capturas y funciones — Playtomic / Vola
### Prompt O ejecutado — Base para el diseño de Comunidad Pádel 04

**Estado:** informe documental, sin código, sin diseño de UI.
**Fecha:** 2026-07-14
**Rama:** `docs/comunidad-padel-auditoria-capturas-2026-07-14`
**Depende de:** `ROADMAP_COMUNIDAD_PADEL_04_PLAYTOMIC_VOLA.md` y `PROMPTS_IMPLEMENTACION_COMUNIDAD_PADEL_04.md` (mismo directorio), ya mergeados en `main` vía PR #14.

**Aviso de originalidad:** este informe describe **categorías funcionales y patrones de flujo** observados en aplicaciones del sector de reservas/comunidad deportiva de pádel. No reproduce código, no incluye capturas embebidas, no cita textos legales ni comerciales de forma literal más allá de referencias puntuales mínimas ya de dominio público (nombres de secciones estándar del sector), y no usa marca, logotipo, paleta ni layout exacto de terceros. Ninguna captura se afirma que "contiene código detrás": las capturas muestran únicamente interfaz visible.

---

## 1. Resumen ejecutivo

Se ha auditado el material de referencia funcional disponible localmente sobre dos apps líderes de pádel (referidas en este documento por su categoría de mercado, "apps de reservas y comunidad de pádel", evitando su uso como marca dentro de Club Pádel 04) para extraer patrones funcionales aplicables a la fase de Comunidad Pádel 04. Se revisó documentación ya integrada en el repositorio, un archivo local de ~247 capturas de pantalla (una muestra de 9 se inspeccionó directamente), un informe de benchmark previo de la sesión 2026-06-25, y se intentó acceder a 4 enlaces de Google Drive aportados por el usuario — ninguno contenía material relacionado (ver sección 4).

Conclusión principal: la mayoría de funciones "sociales" de estas apps ya están anticipadas en el roadmap de Comunidad Pádel 04 (`ROADMAP_COMUNIDAD_PADEL_04_PLAYTOMIC_VOLA.md`). Este informe confirma, matiza y prioriza esas funciones con evidencia observada, y añade un hallazgo relevante: el patrón de **privacidad granular y opt-in explícito** (localización aproximada desactivada por defecto, compartir actividad como toggle independiente) está bien resuelto en el mercado y debe copiarse como *principio de diseño*, no como interfaz.

## 2. Alcance de la auditoría

Incluye: extracción de funcionalidades, flujos de usuario, jerarquía de pantallas y patrones UX de nivel "qué hace la pantalla", no "cómo se ve exactamente". Cubre los módulos de partidos abiertos, clases/torneos/ligas, ranking, perfil, ajustes de privacidad, notificaciones y navegación principal.

No incluye: diseño visual pixel a pixel, paleta de color de marca, tipografía, copy comercial, ni ninguna decisión de implementación técnica. No se ha tocado `App.jsx`, auth, reservas, worker, ni ninguna integración real.

## 3. Fuentes revisadas

| Fuente | Tipo | Resultado |
|---|---|---|
| `app/docs/club-padel-04/comunidad/ROADMAP_COMUNIDAD_PADEL_04_PLAYTOMIC_VOLA.md` | Documentación propia ya mergeada | Revisado íntegro |
| `app/docs/club-padel-04/comunidad/PROMPTS_IMPLEMENTACION_COMUNIDAD_PADEL_04.md` | Documentación propia ya mergeada | Revisado íntegro |
| `app/audit/benchmarks-capturas/playtomic/originales/` (211 imágenes) | Capturas locales | Muestreadas 6 de 211, espaciadas uniformemente en el tiempo de captura |
| `app/audit/benchmarks-capturas/vola/originales/` (36 imágenes) | Capturas locales | Muestreadas 3 de 36, espaciadas uniformemente |
| `app/audit/benchmarks-capturas/inventarios/*.txt` | Listados de nombres de archivo | Revisados — solo rutas/timestamps, sin contenido funcional propio |
| Informe previo `informe-playtomic-benchmark-roadmap-produccion.txt` (sesión 2026-06-25, rama `checkpoint/fase-11-rama-limpia-cp04`) | Auditoría SaaS previa con benchmark funcional | Leído íntegro (392 líneas) vía `git show`, sin checkout |
| `audit/funciones_competitivas_propias/REGLA_NO_COPIA_PLAYTOMIC_VOLA_OTRAS_APPS_CP04.txt` | Regla interna ya existente | Revisada — coherente con las reglas de este prompt |
| 4 enlaces de Google Drive aportados por el usuario | Externo | **No utilizables** — ver limitación en sección 4 |

## 4. Limitaciones de acceso o lectura

- **Los 4 enlaces de Google Drive proporcionados no contienen material de Playtomic/Vola.** Se consultaron los 4 (`.../1PaiHaTAlN_oa5rDHZ9t_75OGHZ0HR_ZU`, `.../1M4N2tXA3vW-yWPgeng2CcF9Hn95Zn20p`, `.../1h1ImM1yMZlozsjB-r2pQOZ4GKnIBqubp`, `.../13LGCAR9QLpa46wu6fGUHS4dnUoIlpMnq`) y sus listados devueltos corresponden a carpetas ajenas por completo al pádel: recursos de un asistente de IA ("WorldCast"), una biblioteca de cursos de YouTube sobre agentes de IA/automatización, plantillas de un formador ("La Tribu Divisual") y un zip de "skills" de IA. **No se ha usado ni citado ese contenido en este informe.** Recomendación: verificar si son los enlaces correctos antes de reintentar.
- **No se han revisado las 247 capturas locales una a una.** Se inspeccionaron 9 (6 Playtomic + 3 Vola) espaciadas en el tiempo de captura como muestra representativa, más el texto ya sintetizado del informe de benchmark previo (que si cubrió más pantallas en su momento). El resto de capturas quedan disponibles en `app/audit/benchmarks-capturas/` para una revisión más profunda si se solicita explícitamente.
- **No se ha accedido a las apps en vivo** (no hay credenciales, no se ha instalado ni abierto ninguna app durante esta auditoría) — todo el análisis es sobre material ya capturado previamente en el proyecto.
- Ninguna limitación anterior se ha resuelto inventando datos: donde no hay evidencia, este informe lo marca explícitamente como "no verificado" en vez de asumir.

## 5. Principio legal: inspiración funcional sin copia

Aplica la regla ya documentada en `REGLA_NO_COPIA_PLAYTOMIC_VOLA_OTRAS_APPS_CP04.txt`: se permite analizar necesidades de mercado y detectar funciones útiles; se prohíbe copiar marca, nombre, textos, estética, layouts exactos, iconografía propietaria, capturas, imágenes o flujos idénticos. Toda función de este informe debe reinterpretarse con identidad, textos, estética y lógica propios de Club Pádel 04 antes de construirse. Este informe en sí mismo no debe usarse como especificación de diseño — solo como mapa de funcionalidades a reinterpretar (ver checklist, sección 26).

## 6. Funcionalidades detectadas o esperables en apps tipo Playtomic/Vola

Observado directamente (capturas) o confirmado por el informe de benchmark previo:
- Onboarding con autoevaluación de nivel de juego (escala: iniciación / intermedio / avanzado / profesional).
- Perfil con nivel numérico visible (p. ej. "2.00 | Pádel"), nombre y contador de partidos jugados.
- Pantalla de inicio con tarjeta de "próximo partido" (o estado vacío con CTA si no hay ninguno).
- Acceso directo a "partidos abiertos" desde la pantalla de inicio.
- Módulos en tarjetas: Partidos, Torneos, Ligas, Circuitos (series de eventos), Clases (públicas/privadas/cursos).
- Navegación inferior con Home, Ranking, Reservas, un módulo de instructores/monitores, y una tienda (fuera de alcance de comunidad).
- Centro de notificaciones con estado vacío y acción de "vaciar todo".
- Pantalla de privacidad con toggles independientes por función (ver sección 14).
- Tabla de tratamiento de datos por finalidad, base legal y plazo de conservación (patrón de transparencia RGPD).

## 7. Funciones sociales prioritarias

- Perfil visible por otros jugadores (nivel, actividad reciente).
- Compartir actividad como función explícitamente opt-in, ligada a notificaciones a "tus contactos".
- Invitar amigos a partidos (import opcional de contactos, siempre marcado como opcional y revocable).
- Historial de partidos jugados visible en el perfil propio.

## 8. Funciones deportivas prioritarias

- Nivel de juego autodeclarado en el alta, editable después.
- Filtro de partidos/clases por nivel, fecha y deporte.
- Historial y estadísticas básicas (partidos jugados, victorias — no verificado con evidencia directa si hay más detalle; el informe previo no profundiza).

## 9. Funciones de club/staff prioritarias

- Publicación de eventos oficiales por el club (clases, torneos, ligas) — coincide con el "muro del club" ya diseñado en el roadmap.
- Gestión de inscripciones y cupos por parte de staff (esperable, no verificado directamente en capturas revisadas).

## 10. Funciones de comunidad y fidelización

- Circuitos / series de eventos encadenados (varias fechas bajo un mismo "circuito") — función no contemplada todavía en el roadmap actual de Comunidad Pádel 04; candidata a evaluar en fase 2/3, ver sección 19.
- Ligas internas con clasificación continua — ya cubierto por el roadmap (`7.11 Torneos sociales` / Prompt P Eventos, categoría "ligas internas").

## 11. Funciones de ranking, retos y gamificación

- Ranking asociado a nivel numérico, no solo posición — matiza el diseño ya previsto en el roadmap (`7.10 Ranking social`): considerar un valor numérico de nivel además de posición/puntos.
- No se observó evidencia directa de "retos 1vs1" en las capturas revisadas; el roadmap ya lo contempla como función propia diferencial (Prompt H), sin equivalente confirmado observado.

## 12. Funciones de eventos y torneos

- Torneos, Ligas y Circuitos como tres categorías separadas de competición, más Clases (públicas, privadas, cursos) como categoría distinta de evento formativo.
- Esto confirma y afina el `Prompt P — Eventos sociales y deportivos` ya existente: recomienda tratar "circuitos" (series de eventos con clasificación acumulada) como variante adicional dentro del tipo "liga interna", en vez de una categoría nueva — para no multiplicar módulos sin necesidad.

## 13. Funciones de mensajería, grupos y notificaciones

- Centro de notificaciones centralizado con estado vacío gestionado (no solo lista, también "no tienes notificaciones" con opción de vaciar).
- No se observó evidencia directa de chat libre en la muestra revisada; el informe de benchmark previo lo marca como función "premium" esperable del sector, no confirmada con captura propia.
- Grupos: sin evidencia directa en la muestra; se mantiene como función propia de Comunidad Pádel 04 ya diseñada (Prompt I), sin depender de esta observación.

## 14. Funciones de privacidad, consentimiento y moderación

Hallazgo más sólido de esta auditoría (observado directamente, dos capturas independientes):
- Consentimiento inicial de cookies/tecnologías de terceros con "Aceptar todo" / "Denegar" explícitos, más enlaces a política de privacidad y aviso legal.
- Pantalla de privacidad con **toggles independientes por función**: "Compartir tu actividad" (ligado a notificaciones a contactos), "Localización aproximada" (**desactivado por defecto**, con explicación del motivo antes de activarlo), "Datos necesarios para uso" (marcado como requerido, no opcional).
- Enlace directo a "gestionar consentimiento de terceros" separado del resto de ajustes.
- Tabla de tratamiento de datos por categoría (ej. sincronización de lista de contactos) con finalidad, base legal ("Consentimiento") y plazo ("hasta la retirada del consentimiento") — patrón de transparencia que valida directamente el diseño ya propuesto en la sección 10-11 del roadmap (RGPD y consentimiento granular).

**Este patrón de privacidad opt-in restrictivo por defecto es el hallazgo que más debe influir en el diseño de Comunidad Pádel 04**, y ya está alineado con el roadmap existente — esta auditoría lo confirma con evidencia real en vez de solo buena práctica teórica.

## 15. Funciones que Club Pádel 04 ya tiene o tiene parcialmente

Según el informe de benchmark previo (2026-06-25) y el estado conocido de la app:
- ✅ Reservas con selector de pista, disponibilidad en tiempo real, precio dinámico (conectado a worker real).
- ✅ Torneos con bracket visual, BYE automático, podio animado (uno de los módulos más avanzados de la app).
- ✅ Ranking por parejas con filtros, racha y movimiento.
- ✅ Perfil de usuario con ajustes, selector de idioma, cambio de contraseña.
- ✅ i18n completo en 8 idiomas.
- ⚠️ Recuperación de contraseña (flujo de interfaz implementado, sin backend real conectado).
- ❌ Sin capa social pública, sin partidos abiertos, sin ranking social distinto del oficial, sin feed, sin grupos, sin chat — confirmado por el mismo informe previo ("Comunidad / directorio de jugadores" listado como prioridad 3, no implementado).

## 16. Funciones que Club Pádel 04 todavía no tiene

Coincide con el roadmap ya existente: feed, perfil social extendido, amigos/seguidores, partidos abiertos, búsqueda de jugadores, retos, grupos, chat, eventos sociales, ranking social independiente, torneos sociales, muro del club, moderación, consentimiento granular específico de la capa social. Esta auditoría no añade módulos nuevos a esta lista — la confirma.

Único candidato nuevo detectado en esta auditoría, no presente en el roadmap actual: **circuitos / series de eventos con clasificación acumulada** (sección 10 y 12). Se recomienda tratarlo como variante de "liga interna" dentro del Prompt P, no como módulo nuevo.

## 17. Funciones que más aumentarían el valor comercial del SaaS

Por orden de impacto comercial estimado (criterio: diferenciación frente a "solo reservas", coste de construcción, riesgo legal):
1. Partidos abiertos (habilita efecto red inmediato, bajo riesgo).
2. Perfil social + ranking social (visibilidad de actividad, bajo riesgo si es opt-in).
3. Muro del club + eventos (canal de comunicación con socios, sustituye WhatsApp/Instagram externos).
4. Moderación + privacidad granular (no aumenta ingresos directamente, pero es condición para vender con seguridad el resto).
5. Retos y grupos (retención, riesgo medio por moderación de contenido).
6. Mensajería (mayor impacto en retención, pero mayor riesgo legal — confirmado como función a introducir por fases, ver Prompt K/L ya existentes).

## 18. Funciones MVP recomendadas

Máximo 5-7 módulos, sin backend real, sin datos reales, con moderación y privacidad desde el diseño, sin chat libre ni geolocalización real (ya así en el roadmap; esta auditoría lo confirma y no lo cambia):

1. **Perfil de jugador extendido** (nivel autodeclarado + control de visibilidad por campo — patrón validado en sección 14).
2. **Partidos abiertos** (crear, listar, solicitar unirse — dentro del mismo club).
3. **Muro del club** (solo staff publica).
4. **Feed básico** (actividad de amigos + muro del club, sin feed global todavía).
5. **Amigos** (bidireccional, sin seguidores todavía).
6. **Moderación básica** (reporte + cola de revisión).
7. **Consentimiento granular de alta a la capa social** (checkbox separado, con opt-in específico por función, siguiendo el patrón de toggles independientes observado en sección 14).

Esto coincide exactamente con el MVP Fase 1 ya definido en `ROADMAP_COMUNIDAD_PADEL_04_PLAYTOMIC_VOLA.md` sección 13 — esta auditoría no lo modifica, lo valida con evidencia.

## 19. Funciones premium para fases posteriores

- Chat (por plantillas primero, libre después — ya en Prompts K/L).
- Geolocalización aproximada opt-in (ya en Prompt M).
- Grupos, retos, ranking social (ya en Prompts I/H/J).
- Circuitos / series de eventos con clasificación acumulada (**nuevo candidato de esta auditoría** — evaluar como variante de liga interna en el Prompt P, fase 2).
- Perfiles verificados / destacados (monetización futura, ya mencionada como hipótesis en el roadmap sección 2, sin comprometer diseño todavía).

## 20. Funciones descartables o de bajo retorno

- Tienda/e-commerce integrada (Eshop observado en Vola): fuera del alcance de "comunidad", sin relación con el objetivo social de este roadmap. No se recomienda para Club Pádel 04 en esta fase.
- Módulo de "monitores/instructores" como marketplace: posible interés futuro para el negocio del club, pero no es una función de *comunidad social* — se recomienda evaluarlo, si acaso, como módulo comercial aparte, no dentro de este roadmap.
- Import automático de agenda de contactos del teléfono: alto riesgo de privacidad (RGPD, datos de terceros no usuarios) para un beneficio marginal frente a invitar por enlace/código; no se recomienda para Club Pádel 04.

## 21. Riesgos legales y de propiedad intelectual

- Las condiciones de uso observadas (captura de sección "Propiedad intelectual") reivindican de forma estándar en el sector que todo el contenido, funcionalidad, textos, gráficos, logotipos e iconos de esas apps son propiedad exclusiva de sus titulares y están protegidos por copyright/marca/patente — **razón directa por la que este informe no reproduce textos, iconos ni layouts**, solo categorías funcionales. Aplica también al software: no se ha leído ni se leerá código fuente de terceros.
- Riesgo de que un futuro diseñador o desarrollador, sin ver este informe, reproduzca sin querer un layout reconocible al mirar las capturas originales directamente — mitigación: este informe es la única referencia autorizada para diseño; las capturas originales no deben pasarse directamente a quien haga el diseño visual final.
- Nombres "Playtomic" y "Vola" no deben aparecer en ningún texto, código, commit ni interfaz de Club Pádel 04 (ya cumplido en el roadmap y en este informe, salvo en el propio título de auditoría y con fines de trazabilidad interna).

## 22. Riesgos de privacidad/RGPD

Sin cambios respecto a lo ya identificado en el roadmap (sección 11-12): el hallazgo de esta auditoría refuerza, no amplía, esos riesgos. El patrón de opt-in granular observado (sección 14) debe adoptarse como estándar mínimo, no como techo — Club Pádel 04 puede y debe ser al menos igual de restrictivo por defecto.

## 23. Riesgos técnicos

- Ninguno nuevo detectado directamente en esta auditoría (es un informe funcional, no técnico). Riesgo heredado ya conocido: cualquier implementación futura debe seguir aislada de `App.jsx`/backend real hasta autorización explícita (Prompt N), como ya establece el catálogo de prompts.
- Riesgo de "scope creep": el hallazgo de "circuitos" (sección 10) podría tentar a añadir un módulo nuevo entero; se recomienda explícitamente tratarlo como variante menor de un módulo ya existente (sección 19), no como módulo nuevo.

## 24. Matriz impacto/esfuerzo

| Función | Impacto | Esfuerzo | Cuadrante |
|---|---|---|---|
| Partidos abiertos | Alto | Bajo-medio | **Alto impacto / bajo esfuerzo** |
| Perfil social + control de visibilidad | Alto | Bajo | **Alto impacto / bajo esfuerzo** |
| Muro del club | Alto | Bajo | **Alto impacto / bajo esfuerzo** |
| Consentimiento granular (toggles por función) | Alto (habilita todo lo demás con seguridad) | Bajo | **Alto impacto / bajo esfuerzo** |
| Moderación básica (reporte + cola) | Alto | Medio | **Alto impacto / alto esfuerzo** |
| Feed (amigos + muro) | Medio-alto | Medio | **Alto impacto / alto esfuerzo** |
| Amigos (bidireccional) | Medio | Bajo | **Alto impacto / bajo esfuerzo** |
| Ranking social | Medio | Medio | **Bajo impacto / alto esfuerzo** (mientras no haya masa crítica de usuarios) |
| Retos | Medio | Medio | **Bajo impacto / alto esfuerzo** (depende de masa crítica) |
| Grupos | Medio | Medio-alto | **Bajo impacto / alto esfuerzo** |
| Mensajería por plantillas | Medio | Medio | **Bajo impacto / alto esfuerzo** (fase 2) |
| Chat libre | Alto (retención) | Alto (moderación + riesgo legal) | **Alto impacto / alto esfuerzo** — deliberadamente pospuesto |
| Geolocalización opt-in | Bajo-medio | Medio (riesgo legal) | **Bajo impacto / alto esfuerzo** — pospuesto |
| Circuitos / series de eventos | Bajo (nice-to-have) | Medio | **Bajo impacto / alto esfuerzo** — no priorizar aún |
| Eshop / tienda | Bajo (fuera de alcance social) | Alto | **Bajo impacto / alto esfuerzo** — descartado (sección 20) |

## 25. Roadmap recomendado posterior a la auditoría

Sin cambios de fondo respecto al roadmap ya mergeado: esta auditoría **valida** el orden ya definido en `PROMPTS_IMPLEMENTACION_COMUNIDAD_PADEL_04.md` (Prompt O ya ejecutado aquí → A → F → B/C → E → D → G → H/I/J/P → K → L/M → Q → N). Único ajuste sugerido: al ejecutar el Prompt P (Eventos), documentar "circuitos" como variante opcional de "liga interna" en vez de tipo nuevo, para no expandir el alcance del MVP.

## 26. Checklist antes de diseñar UI

- [ ] Ninguna captura original de Playtomic/Vola se entrega directamente a quien diseñe la UI — solo este informe funcional.
- [ ] Naming propio definido para cada módulo (feed, partidos abiertos, muro del club, etc.) antes de maquetar.
- [ ] Paleta, tipografía e iconografía propias de Club Pádel 04 ya definidas o por definir en un sistema de diseño propio (no heredado de terceros).
- [ ] Privacidad por defecto restrictiva confirmada en el diseño de cada pantalla (opt-in explícito, no opt-out).
- [ ] Textos de consentimiento y privacidad redactados desde cero, sin frases copiadas de terceros.
- [ ] Moderación considerada en el flujo antes de maquetar feed/chat/grupos, no añadida después.
- [ ] Ningún nombre "Playtomic" o "Vola" presente en ningún artefacto de diseño entregable.

## 27. Siguiente prompt recomendado

Con el Prompt O cerrado, el siguiente paso lógico del catálogo es el **Prompt A — Modelo de datos social** (diseño, sin Supabase real), en paralelo o inmediatamente seguido del **Prompt F — Consentimiento y privacidad**, incorporando el patrón de toggles granulares por función confirmado en la sección 14 de este informe. Antes de eso, se recomienda que el usuario aclare el estado de los 4 enlaces de Drive (sección 4) por si corresponden a otro material que sí deba auditarse por separado.
