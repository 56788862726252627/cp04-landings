# Prompts de implementación futura — Comunidad Pádel 04

**Estado:** catálogo de prompts para fases posteriores. Ninguno de estos prompts debe ejecutarse todavía.
**Depende de:** `ROADMAP_COMUNIDAD_PADEL_04_PLAYTOMIC_VOLA.md` (mismo directorio).
**Fecha de creación:** 2026-07-14

Cada prompt está pensado para ejecutarse en modo seguro (rama propia, sin tocar `App.jsx`, sin integraciones reales, sin auth real) siguiendo el mismo patrón ya validado en otros módulos del proyecto (diseño aislado → tooling con tests → sin conectar a producción hasta autorización explícita).

No incluyen credenciales, datos legales ni contactos reales. No deben lanzarse en cadena automáticamente: cada uno requiere revisión y autorización explícita del usuario antes de ejecutarse.

---

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

1. Prompt A (modelo de datos) → 2. Prompt F (consentimiento/privacidad, en paralelo con A) → 3. Prompts B/C (prototipos visuales) → 4. Prompt E (moderación, antes de abrir cualquier módulo con contenido de usuarios) → 5. Prompt D (partidos abiertos) → 6. Prompt G (amigos/seguidores) → 7. Prompts H/I/J (retos, grupos, ranking) → 8. Prompt K (mensajería por plantillas) → 9. Prompts L/M (chat libre, geolocalización — requieren validación legal previa) → 10. Prompt N (integración final, solo con autorización explícita).
