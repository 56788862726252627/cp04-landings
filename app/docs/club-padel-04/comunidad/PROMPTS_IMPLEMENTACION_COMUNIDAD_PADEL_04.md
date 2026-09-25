# Prompts de implementación futura — Comunidad Pádel 04

**Estado:** catálogo de prompts para fases posteriores. Ninguno de estos prompts debe ejecutarse todavía.
**Depende de:** `ROADMAP_COMUNIDAD_PADEL_04_PLAYTOMIC_VOLA.md` (mismo directorio).
**Fecha de creación:** 2026-07-14

Cada prompt está pensado para ejecutarse en modo seguro (rama propia, sin tocar `App.jsx`, sin integraciones reales, sin auth real) siguiendo el mismo patrón ya validado en otros módulos del proyecto (diseño aislado → tooling con tests → sin conectar a producción hasta autorización explícita).

No incluyen credenciales, datos legales ni contactos reales. No deben lanzarse en cadena automáticamente: cada uno requiere revisión y autorización explícita del usuario antes de ejecutarse.

## Índice de prompts

| Prompt | Tema | Fase |
|---|---|---|
| O | Auditoría de capturas y funciones Playtomic/Vola | Previa (fase 0), antes que cualquier otro prompt |
| A | Modelo de datos social | MVP |
| B | Prototipo visual — Feed | MVP |
| C | Prototipo visual — Perfil de jugador | MVP |
| D | Partidos abiertos | MVP |
| E | Moderación | MVP |
| F | Consentimiento y privacidad | MVP |
| G | Amigos y seguidores | Fase 2 |
| H | Retos | Fase 2 |
| I | Grupos | Fase 2 |
| J | Ranking social | Fase 2 |
| P | Eventos sociales y deportivos | Fase 2 |
| K | Mensajería por plantillas | Fase 2 |
| L | Chat libre | Fase 3 |
| M | Búsqueda de jugadores + geolocalización opt-in | Fase 3 |
| Q | QA, seguridad y cierre de calidad | Gate previo a cualquier integración o merge |
| N | Integración final con App.jsx | Requiere autorización explícita, solo tras Prompt Q |

---

## Prompt O — Auditoría de capturas y funciones Playtomic/Vola

```
Analiza (sin descargar ni reproducir literalmente) las capturas de referencia
de Playtomic/Vola que aporte el usuario y extrae exclusivamente:
- funcionalidades observadas (qué hace la pantalla, no cómo se ve);
- flujos de usuario (pasos que sigue el jugador de principio a fin);
- patrones UX genéricos del sector (no específicos de una marca);
- módulos potencialmente útiles para Comunidad Pádel 04;
- riesgos legales detectados en cada función (datos personales, geolocalización,
  mensajería, menores, imagen de terceros);
- funciones descartables para Club Pádel 04 (por riesgo, coste o falta de
  encaje con el negocio real del club);
- funciones adaptables (misma categoría funcional, pero rediseñadas con
  naming, textos, paleta e iconografía 100% propios de Club Pádel 04);
- funciones diferenciales propias que Playtomic/Vola no ofrecen y que
  podrían ser ventaja competitiva de Club Pádel 04.

Entrega un informe en Markdown en una ruta nueva de docs/club-padel-04/comunidad/,
sin código, sin capturas ni imágenes de terceros embebidas, sin textos ni
nombres de marca copiados literalmente. Dejar explícito en el propio informe
que ninguna función se implementará copiando código, diseño exacto, textos
ni marca de terceros — solo se documenta la categoría funcional observada.
No toques App.jsx, integraciones, auth real ni datos reales.
```

## Prompt A — Modelo de datos social (diseño, sin Supabase real)

```
Diseña (sin implementar contra Supabase real) el modelo de datos para la capa
social de Comunidad Pádel 04: perfil extendido, relación de amistad,
seguidores, consentimientos granulares, partidos abiertos, muro del club y
reportes de moderación. Entrega solo esquema + documentación + fixtures de
prueba en una ruta nueva de docs/audit, con tests locales sobre datos de
ejemplo. No toques Supabase, App.jsx, ni credenciales reales.
```

## Prompt B — Prototipo visual aislado del Feed

```
Crea un prototipo visual aislado (componentes React nuevos, no conectados a
App.jsx ni a datos reales) del Feed de Comunidad Pádel 04, usando datos mock
locales. Diseño 100% original (naming, paleta, iconografía propios de Club
Pádel 04), sin replicar el diseño exacto de Playtomic/Vola. Entrega en una
ruta nueva bajo app/ fuera del árbol de producción activo.
```

## Prompt C — Prototipo visual aislado de Perfil de jugador (comunidad)

```
Extiende visualmente (sin tocar el perfil deportivo premium real ni App.jsx)
un prototipo de Perfil de jugador para la capa de comunidad: nivel, historial,
control de visibilidad por campo, amigos en común. Componentes aislados con
datos mock. Diseño original.
```

## Prompt D — Partidos abiertos (lógica aislada + tests)

```
Implementa en un módulo aislado (sin tocar el sistema de reservas real ni
App.jsx) la lógica de "partidos abiertos": crear, listar, solicitar unirse,
aprobar/rechazar, límite de plazas. Con tests unitarios sobre datos mock.
No conectar a reservas reales ni a Supabase.
```

## Prompt E — Moderación (cola, reportes, roles)

```
Diseña e implementa en módulo aislado el sistema de moderación de la
comunidad: reporte de contenido/usuario, cola de revisión, roles
(staff de club / moderador de plataforma), registro auditable de acciones.
Con tests. No conectar a auth real ni a base de datos de producción.
```

## Prompt F — Consentimiento y privacidad (flujos + textos revisables)

```
Diseña los flujos de consentimiento granular para la capa social (aparecer en
feed, ser buscable, recibir mensajes de no-amigos, ubicación aproximada) y
textos legales en borrador para revisión de un abogado externo. No son textos
legales definitivos: márcalos como borrador pendiente de validación legal.
No tocar el flujo de alta real ni auth real.
```

## Prompt G — Amigos y seguidores (lógica aislada + tests)

```
Implementa en módulo aislado la lógica de relaciones sociales: solicitud de
amistad (bidireccional, requiere aceptación) y seguimiento (unidireccional),
con reglas de visibilidad dependientes de la configuración de privacidad del
perfil objetivo. Tests unitarios sobre datos mock. Sin tocar App.jsx ni datos
reales.
```

## Prompt H — Retos (lógica aislada + tests)

```
Implementa en módulo aislado la lógica de retos entre jugadores/grupos:
creación, aceptación mutua, registro de resultado, vínculo con ranking
social. Tests sobre datos mock. Sin integraciones reales.
```

## Prompt I — Grupos (lógica aislada + tests)

```
Implementa en módulo aislado la lógica de grupos: creación, miembros, roles
dentro del grupo, partidos de grupo. Tests sobre datos mock. Sin tocar
App.jsx ni backend real.
```

## Prompt J — Ranking social (cálculo aislado + tests)

```
Diseña e implementa el cálculo de ranking social (gamificado, no oficial) en
módulo aislado, claramente etiquetado en el diseño como distinto del ranking
de torneos oficiales. Tests sobre datos mock.
```

## Prompt P — Eventos sociales y deportivos

```
Diseña e implementa en módulo aislado (sin tocar App.jsx, calendario real ni
sistema de notificaciones real) la capa de eventos de Comunidad Pádel 04,
cubriendo estas categorías de evento como tipos configurables, no como
funciones separadas:
- quedadas informales entre jugadores;
- partidos sociales;
- torneos express (formato corto, distinto del módulo Torneos oficial);
- clinics / clases abiertas;
- ligas internas del club;
- eventos oficiales del club (anuncios desde el muro del club).

Debe incluir: inscripción del jugador, cupo máximo y lista de espera,
recordatorios (diseño del gancho de notificación, sin integrar un proveedor
real todavía), estados del evento (borrador, publicado, cupo completo,
cancelado, finalizado) y permisos por rol (quién puede crear cada tipo de
evento: jugador, staff del club, moderador de plataforma). Deja documentado
como diseño futuro, sin implementar, el punto de integración con calendario
externo y con el sistema de notificaciones real.

Etiqueta claramente los eventos "sociales/torneo express" como no oficiales,
para no confundirlos con el módulo Torneos ya auditado. Tests unitarios sobre
datos mock. Sin integraciones reales, sin datos personales reales.
```

## Prompt K — Mensajería por plantillas (fase 2, previa al chat libre)

```
Implementa en módulo aislado un sistema de mensajería basado en plantillas
predefinidas (sin texto libre) entre jugadores, como paso intermedio de
menor riesgo antes del chat completo. Tests sobre datos mock. No usar
WhatsApp real ni ninguna integración externa.
```

## Prompt L — Chat libre con moderación reforzada (fase 3)

```
Diseña (y solo tras validación legal explícita del usuario) el chat libre
1:1 y de grupo con límites anti-abuso, integrado con el sistema de
moderación del Prompt E. No implementar contra infraestructura real sin
autorización explícita adicional, dado el riesgo legal superior de este
módulo.
```

## Prompt M — Búsqueda de jugadores con geolocalización opt-in (fase 3)

```
Diseña e implementa en módulo aislado la búsqueda de jugadores por nivel,
disponibilidad y zona aproximada (nunca coordenadas exactas), con opt-in
explícito y revocable. Tests sobre datos mock. Sin geolocalización en tiempo
real ni tracking continuo.
```

## Prompt Q — QA, seguridad y cierre de calidad

```
Antes de considerar cualquier integración o merge de un módulo de Comunidad
Pádel 04, ejecuta una revisión de QA y seguridad sobre lo implementado hasta
ese momento (módulos aislados, sin tocar producción). Revisa y documenta el
resultado de cada punto:
- rutas tocadas vs. rutas permitidas (confirmar que no se ha salido del
  alcance autorizado);
- permisos por rol (staff de club, moderador, jugador) aplicados de forma
  consistente en cada módulo;
- privacidad: visibilidad por defecto restrictiva, sin fugas de datos entre
  tenants/clubes;
- consentimiento: revocable, con efecto retroactivo, registrado;
- moderación: cola de reportes funcional, sin contenido huérfano sin revisar;
- reportes: flujo de reporte de usuario/contenido probado con casos límite;
- datos personales: minimización de campos, sin geolocalización exacta,
  sin datos de menores sin flujo de consentimiento parental;
- accesibilidad: navegación por teclado, roles ARIA, contraste, en los
  prototipos visuales aislados (Feed, Perfil);
- responsive: comportamiento en móvil/tablet/escritorio de los prototipos;
- errores: manejo de estados vacíos, de error y de carga en cada módulo;
- builds: que el proyecto compila sin romper nada fuera de los módulos
  aislados de comunidad;
- tests: cobertura de los tests unitarios de cada prompt anterior (A-M, O, P)
  en verde;
- ausencia de secretos: grep de claves/tokens/credenciales en todo lo añadido;
- ausencia de deploy: confirmar que nada de este trabajo se ha desplegado a
  producción ni mergeado a main;
- checklist final antes de merge: lista cerrada de sí/no por cada punto
  anterior, con hallazgos abiertos priorizados (crítico/alto/medio/bajo).

Entrega un informe de QA en docs/club-padel-04/comunidad/ sin modificar
código de producción. No toques App.jsx, auth real, Supabase, ni hagas
merge o deploy como parte de este prompt.
```

## Prompt N — Integración final con App.jsx (requiere autorización explícita)

```
Esta fase queda fuera de alcance hasta que el usuario autorice explícitamente
tocar App.jsx. Cuando se autorice: presentar primero un plan de diff exacto
(qué archivos, qué líneas, qué gates de rol/flag se usan) siguiendo el mismo
patrón que el plan de integración de Stripe ya documentado, antes de escribir
ningún cambio.
```

---

## Orden recomendado (no vinculante)

0. Prompt O (auditoría de capturas y funciones — siempre primero, antes de diseñar nada) → 1. Prompt A (modelo de datos) → 2. Prompt F (consentimiento/privacidad, en paralelo con A) → 3. Prompts B/C (prototipos visuales) → 4. Prompt E (moderación, antes de abrir cualquier módulo con contenido de usuarios) → 5. Prompt D (partidos abiertos) → 6. Prompt G (amigos/seguidores) → 7. Prompts H/I/J/P (retos, grupos, ranking, eventos) → 8. Prompt K (mensajería por plantillas) → 9. Prompts L/M (chat libre, geolocalización — requieren validación legal previa) → 10. Prompt Q (QA, seguridad y cierre de calidad — gate obligatorio antes de integrar) → 11. Prompt N (integración final con App.jsx, solo con autorización explícita y solo si Prompt Q está aprobado).
