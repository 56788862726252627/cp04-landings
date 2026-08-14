# Club Pádel 04 — Matriz Maestra de Red Social Deportiva

**Versión:** 1.0 · base para Roadmap Maestro V5  
**Fecha:** 2026-08-14  
**Benchmark visual cerrado:** Playtomic 209/209 + Vola 37/37 = **246/246 (100%)**  
**Principio:** usar Playtomic/Vola como referencia funcional/UX; no copiar marca, textos, código, layout exacto ni identidad visual.

## 1. Objetivo

Convertir el benchmark 246/246 en requisitos propios de Club Pádel 04, cruzados contra el estado técnico real del repositorio, para decidir qué **YA EXISTE**, qué debe **MEJORARSE/INTEGRARSE**, qué debe **AÑADIRSE** y qué se **POSPONE/DESCARTA**.

La red social CP04 no se concibe como una pestaña aislada, sino como una capa transversal:

**reserva → partido → jugadores → conversación → resultado → publicación → estadísticas → nivel/ranking → recomendación de nuevos compañeros/rivales → nueva reserva**.

## 2. Estado técnico de partida verificado

`community-logic` ya contiene lógica pura y probada para consentimiento, bloqueo, amistades, follow, feed, comentarios, reacciones, partidos abiertos, moderación y permisos. Opera sobre un store en memoria y no es backend de producción.

- 59/59 tests del módulo de lógica en verde según su README.
- `communityBridge.js` integra actualmente en React solo consentimiento y bloqueo (Fase 1).
- `ComunidadDemo.jsx` sigue siendo mayoritariamente demo/mock sin persistencia real.
- Grupos, eventos y ranking social tienen estructura de datos, pero no lógica completa.
- Chat y geolocalización no están implementados en el núcleo social actual.

## 3. Matriz maestra

Leyenda:
- **Lógica:** reglas de negocio ya presentes en el repositorio.
- **UI:** interfaz real integrada; `demo` significa representación visual sin comportamiento completo/persistente.
- **Producción:** persistencia, backend, seguridad operativa, trazabilidad y E2E reales.

| # | Área / función | Lógica | UI | Producción | Decisión | Prioridad | Acción CP04 |
|---|---|---|---|---|---|---|---|
| 1 | Consentimiento social opt-in/opt-out | ✅ | ✅ parcial | ❌ | MEJORAR | P0 | Persistencia real, versionado de consentimiento, centro de privacidad y revocación efectiva |
| 2 | Bloquear / desbloquear usuario | ✅ | ✅ parcial | ❌ | INTEGRAR | P0 | Persistir, ocultar contenido/partidos/chat en ambas direcciones, auditoría |
| 3 | Solicitud de amistad | ✅ | demo | ❌ | INTEGRAR | P0 | Conectar handlers reales y notificaciones |
| 4 | Aceptar/rechazar/cancelar amistad | ✅ | demo/parcial | ❌ | INTEGRAR | P0 | UI real, persistencia y estados definitivos |
| 5 | Eliminar amistad | ✅ | ❌ real | ❌ | INTEGRAR | P1 | UI + persistencia + auditoría |
| 6 | Seguir/dejar de seguir | ✅ | ❌ | ❌ | INTEGRAR | P1 | Perfil público + contadores + privacidad |
| 7 | Contador de seguidores | ✅ | ❌ | ❌ | INTEGRAR | P1 | Agregado persistente/cache seguro |
| 8 | Feed deportivo | ✅ | demo | ❌ | INTEGRAR | P0 | Feed real por club/amigos + paginación + estados vacíos |
| 9 | Crear publicación manual | ✅ | demo/parcial | ❌ | INTEGRAR | P0 | Composer propio CP04, texto/foto/video si procede, validaciones |
| 10 | Publicación automática de resultados | ⚠️ parcial conceptual | ❌ | ❌ | AÑADIR | P1 | Resultado verificado → post generado con consentimiento |
| 11 | Comentarios | ✅ | ❌ real | ❌ | INTEGRAR | P0 | CRUD, permisos, moderación, rate limit |
| 12 | Reacciones | ✅ | ❌ real | ❌ | INTEGRAR | P0 | Like/reacciones propias CP04, toggle idempotente, contadores |
| 13 | Visibilidad club/amigos/privado | ✅ parcial | demo | ❌ | MEJORAR | P0 | Política de visibilidad coherente en perfiles, posts, partidos y grupos |
| 14 | Perfil social/deportivo | ⚠️ entidad/base | demo | ❌ | MEJORAR | P0 | Convertirlo en perfil 360º con datos deportivos y privacidad granular |
| 15 | Nivel declarado | ✅ parcial | demo | ❌ | MEJORAR | P1 | Separar nivel declarado de nivel calculado |
| 16 | Nivel calculado | ❌ | ❌ | ❌ | AÑADIR | P1 | Motor propio y auditable; no copiar escala Playtomic |
| 17 | Fiabilidad del nivel | ❌ | ❌ | ❌ | AÑADIR | P1 | Score de confianza según volumen/calidad de partidos y validaciones |
| 18 | Historial/evolución de nivel | ❌ | ❌ | ❌ | AÑADIR | P1 | Timeline explicable de cambios |
| 19 | Cuestionario inicial de nivel | ❌ | ❌ | ❌ | AÑADIR | P2 | Onboarding técnico propio y recalibrable |
| 20 | Preferencia mano dominante | ❌ específica | ❌ | ❌ | AÑADIR | P1 | Campo de perfil para matchmaking |
| 21 | Lado de pista preferido | ❌ específica | ❌ | ❌ | AÑADIR | P1 | Derecha/revés/indiferente |
| 22 | Competitivo vs amistoso | ❌ específica | ❌ | ❌ | AÑADIR | P1 | Preferencia ponderable |
| 23 | Días/franjas preferidas | ❌ específica | ❌ | ❌ | AÑADIR | P1 | Disponibilidad recurrente y puntual |
| 24 | Intereses deportivos/sociales | ❌ específica | ❌ | ❌ | AÑADIR | P2 | Perfil/descubrimiento, opcional y minimizado |
| 25 | Estadísticas deportivas | ⚠️ ranking/torneos existentes | parcial | parcial | MEJORAR | P1 | Unificar partidos, victorias, sets, rachas, compañeros y clubes frecuentes |
| 26 | Compañeros frecuentes | ❌ social | ❌ | ❌ | AÑADIR | P2 | Derivado de histórico, no entrada manual |
| 27 | Clubes frecuentes/favoritos | ⚠️ club base | ❌ social | ❌ | AÑADIR | P2 | Favoritos y frecuencia de juego |
| 28 | Buscar jugador | ❌ social completo | ❌ | ❌ | AÑADIR | P0 | Filtros por nombre, nivel, disponibilidad y preferencias |
| 29 | Buscar partido abierto | ✅ lógica | demo | ❌ | INTEGRAR | P0 | Listado real con filtros y permisos |
| 30 | Crear partido abierto | ✅ | demo | ❌ | INTEGRAR | P0 | Fecha/hora/club/pista/plazas/nivel/visibilidad |
| 31 | Solicitar plaza | ✅ | demo/parcial | ❌ | INTEGRAR | P0 | Solicitud real + notificación + idempotencia |
| 32 | Aceptar/rechazar solicitud de plaza | ✅ | ❌ real | ❌ | INTEGRAR | P0 | Gestión por organizador |
| 33 | Cierre automático partido completo | ✅ | ❌ | ❌ | INTEGRAR | P0 | Mantener regla y cubrir edge cases |
| 34 | Cancelar partido abierto | ✅ | ❌ real | ❌ | INTEGRAR | P0 | Notificar aceptados y auditar |
| 35 | Matchmaking por nivel | ⚠️ validación de rango | ❌ | ❌ | MEJORAR | P1 | Recomendación, no solo filtro |
| 36 | Matchmaking por fiabilidad | ❌ | ❌ | ❌ | AÑADIR | P1 | Evitar emparejar por nivel poco fiable sin aviso |
| 37 | Matchmaking por horario | ❌ | ❌ | ❌ | AÑADIR | P1 | Compatibilidad de disponibilidad |
| 38 | Matchmaking por mano/lado | ❌ | ❌ | ❌ | AÑADIR | P2 | Factor configurable |
| 39 | Matchmaking por estilo | ❌ | ❌ | ❌ | AÑADIR | P2 | Competitivo/amistoso y preferencias |
| 40 | Matchmaking por club/distancia | ❌ | ❌ | ❌ | AÑADIR | P2 | Geolocalización opcional/minimizada o radio por clubes |
| 41 | Score de compatibilidad | ❌ | ❌ | ❌ | AÑADIR | P2 | Explicable: mostrar factores, no caja negra |
| 42 | Chat jugador-jugador | ❌ | ❌ | ❌ | AÑADIR | P2 | Solo tras privacidad/moderación/persistencia |
| 43 | Chat contextual de partido | ❌ | ❌ | ❌ | AÑADIR | P2 | Conversación ligada al OpenMatch/reserva |
| 44 | Chat de grupo | ❌ | ❌ | ❌ | AÑADIR | P3 | Después del módulo Grupos |
| 45 | Grupos | ⚠️ entidad mínima | ❌ | ❌ | AÑADIR | P2 | Nivel/categoría/torneo/social con roles y privacidad |
| 46 | Eventos sociales | ⚠️ entidad mínima | ❌ | ❌ | AÑADIR | P2 | Integrar eventos con inscripción y feed |
| 47 | Torneos → comunidad | ✅ torneo base externo al núcleo social | parcial | parcial | MEJORAR | P1 | Publicaciones, participantes, resultados, conversación y ranking |
| 48 | Reservas → comunidad | ✅ reservas base | parcial | ✅ núcleo reservas | MEJORAR | P1 | Convertir reserva/partido compatible en contexto social sin exponer datos de terceros |
| 49 | Resultado por sets | ⚠️ competición existente | parcial | parcial | MEJORAR | P1 | Resultado estructurado y verificable |
| 50 | Compartir resultado | ❌ social | ❌ | ❌ | AÑADIR | P2 | Share interno/externo con consentimiento |
| 51 | Ranking deportivo | ✅ CP04 existente | ✅ | parcial/según módulo | MEJORAR | P1 | Conectar a comunidad y nivel sin reconstruir |
| 52 | Ranking social | ⚠️ entidad mínima | ❌ | ❌ | POSPONER/REDEFINIR | P3 | Evitar duplicar ranking deportivo; usar reputación/logros si aporta valor |
| 53 | Reputación / fair play | ❌ | ❌ | ❌ | AÑADIR | P2 | Métrica propia, resistente a abuso y con derecho de revisión |
| 54 | Logros/medallas | ❌ | ❌ | ❌ | AÑADIR | P3 | Gamificación no crítica para MVP |
| 55 | Rachas/progreso | ❌ social | ❌ | ❌ | AÑADIR | P3 | Solo si no incentiva conductas negativas |
| 56 | Notificaciones sociales | ⚠️ entidad/generación parcial | ❌ completa | ❌ | COMPLETAR | P1 | Centro unificado: reservas, partidos, amistad, resultados, moderación |
| 57 | Alertas prioritarias configurables | ❌ | ❌ | ❌ | AÑADIR | P2 | Preferencias por categoría y canal |
| 58 | Reportar usuario/post/comentario | ✅ | demo | ❌ | INTEGRAR | P0 | UI real + persistencia + categorías propias |
| 59 | Cola de moderación | ✅ lógica | demo | ❌ | INTEGRAR | P0 | STAFF/ADMIN/SUPPORT con RBAC y trazabilidad |
| 60 | Retirar contenido | ✅ | demo/parcial | ❌ | INTEGRAR | P0 | Acción humana trazable |
| 61 | Suspender/bloquear cuenta por moderación | ✅ regla ADMIN | ❌ | ❌ | INTEGRAR | P1 | Procedimiento y apelación antes de producción social |
| 62 | Estado de reporte al reportante | ✅ | ❌ | ❌ | INTEGRAR | P1 | Vista mínima sin filtrar identidad/notas internas |
| 63 | Auditoría de moderación | ✅ memoria | ❌ | ❌ | MEJORAR | P0 | Persistencia append-only y exportación segura |
| 64 | Centro de privacidad/consentimiento | ⚠️ base legal + consentimiento | demo parcial | ❌ | AÑADIR/MEJORAR | P0 | Finalidad, consentimiento, retirada, derechos y preferencias |
| 65 | Matriz finalidad→datos→base→retención | ⚠️ paquete DPO existente | ❌ | ❌ | AÑADIR AL MANUAL | P0 | Diseñarla para cuenta, reservas, social, chat, ranking, marketing, soporte |
| 66 | Cuentas bloqueadas | ✅ lógica | parcial | ❌ | INTEGRAR | P0 | Lista de bloqueados y desbloqueo seguro |
| 67 | Privacidad granular de perfil | ⚠️ visibilityLevel | demo | ❌ | MEJORAR | P0 | Datos deportivos, actividad, contacto y descubrimiento por separado |
| 68 | Centro de ayuda | ⚠️ soporte CP04 general | parcial | parcial | MEJORAR | P2 | Añadir categorías comunidad/privacidad/nivel/partidos |
| 69 | Chatbot/asistente de soporte | ⚠️ arquitectura Agencia/soporte | parcial | no certificado social | POSPONER | P3 | No bloquear MVP social |
| 70 | Membresías/Premium social | ❌ | ❌ | ❌ | POSPONER | P4 | Arquitectura preparada; no meter en MVP |
| 71 | Wallet/bonos sociales | ❌ social | ❌ | ❌ | DESCARTAR DEL MVP | P4 | Mantener pagos en dominio de reservas/club, no duplicar wallet social |
| 72 | Checkout social | ❌ | ❌ | ❌ | DESCARTAR DEL MVP | P4 | Usar checkout general cuando proceda |
| 73 | Estados vacíos útiles | demo/parcial | demo | n/a | MEJORAR | P1 | CTA contextual: buscar jugador, crear partido, crear grupo, ajustar filtros |
| 74 | Onboarding social | ⚠️ consentimiento base | parcial | ❌ | AÑADIR | P1 | Opt-in, privacidad, nivel, preferencias, descubrimiento |
| 75 | Recomendaciones cuando no hay coincidencia | ❌ | ❌ | ❌ | AÑADIR | P2 | Relajar filtros de forma transparente |
| 76 | Compartir contactos/importar agenda | ❌ | ❌ | ❌ | POSPONER | P4 | Alto coste privacidad; no necesario para MVP |
| 77 | Inicio con accesos rápidos sociales | ⚠️ home CP04 existe | parcial | n/a | MEJORAR | P2 | Reservar / Buscar partido / Comunidad / Competir |
| 78 | Publicaciones oficiales del club | ✅ regla STAFF/ADMIN | demo | ❌ | INTEGRAR | P1 | Canal oficial dentro del feed |
| 79 | Contenido multimedia | ❌ completo | ❌ | ❌ | AÑADIR DESPUÉS | P3 | Storage, límites, moderación y compresión antes de habilitar |
| 80 | Búsqueda global de jugadores | ❌ | ❌ | ❌ | AÑADIR | P1 | Nombre + filtros; respetar privacidad/bloqueos |

## 4. Bloques de ejecución priorizados

### P0 — Integrar el núcleo social que ya existe
**Objetivo:** dejar de depender de demo para las funciones ya programadas.

Incluye: consentimiento, bloqueo, amistades, feed, publicaciones, comentarios, reacciones, partidos abiertos, solicitudes y moderación.

**Estimación terminal:** 4–7 h  
**DoD:** handlers reales, store desacoplado de UI, tests unitarios + integración, build, regresión por roles, persistencia preparada/implementada según disponibilidad del backend elegido.

### P1 — Perfil deportivo 360º + social ↔ competición
Incluye: perfil, estadísticas, nivel declarado/calculado/fiabilidad, notificaciones, ranking, torneos, reservas, resultados y publicaciones automáticas de actividad.

**Estimación terminal:** 4–7 h.

### P2 — Matchmaking inteligente CP04
Incluye: búsqueda jugador/partido, disponibilidad, nivel/fiabilidad, mano, lado, estilo, clubes y compatibilidad explicable.

**Estimación terminal:** 4–8 h.

### P2 — Chat contextual + grupos/eventos
Solo después de que privacidad, bloqueo, moderación y persistencia estén sólidas.

**Estimación terminal:** 4–8 h.

### P3/P4 — Gamificación, multimedia y monetización social
Logros, reputación avanzada, multimedia, Premium y otras extensiones. No deben retrasar el MVP social.

## 5. Criterio de producto CP04

No copiar la navegación o pantallas de Playtomic/Vola. Mantener identidad propia CP04: glassmorphism, verde lima/menta, blanco, negro/azul profundo, fondos premium y responsive móvil/tablet/desktop.

El diferencial debe ser el bucle operativo/social y el matchmaking explicable, no una réplica visual.

## 6. Seguridad, privacidad y legal — gate obligatorio

Antes de activar datos reales de comunidad:

1. Persistencia real con aislamiento por club/tenant.
2. RBAC por acción para PLAYER/STAFF/ADMIN/SUPPORT.
3. Consentimiento social explícito y revocable.
4. Bloqueo bidireccional efectivo en feed, perfil, partidos y chat.
5. Rate limiting y anti-spam.
6. Auditoría de acciones sensibles.
7. Moderación humana y procedimiento de escalado/apelación.
8. Minimización de datos y retención por finalidad.
9. Revisión DPO/legal antes de menores/datos reales si sigue pendiente.
10. Tests E2E por rol y casos de abuso antes de marcar 100% producción.

## 7. Flujos CP04 ya certificados por el estado maestro del proyecto

Estos flujos no deben figurar en el backlog de implementación del V5; deben aparecer en el bloque de **hitos 100% PRODUCCIÓN**:

- ✅ Alta de Jugador — 100% PRODUCCIÓN.
- ✅ Baja de Jugador + Promoción — 100% PRODUCCIÓN.
- ✅ API Reservas Club Pádel 04 — 100% PRODUCCIÓN.
- ✅ Cierre Temporal de Pistas — 100% PRODUCCIÓN.

El roadmap debe conservar únicamente referencias de trazabilidad/evidencia y eliminar tareas antiguas que los presenten como pendientes si ya no tienen margen real de mejora.

## 8. Reglas de depuración para Roadmap V5

- **Terminado + sin margen razonable:** sale del backlog.
- **Terminado + hito crítico:** queda resumido como certificado 100%.
- **Terminado + mejorable:** pasa a OPTIMIZACIÓN, no a implementación pendiente.
- **Existe lógica pero no integración:** INTEGRAR.
- **Existe UI demo pero no persistencia:** NO PRODUCCIÓN.
- **No existe y aporta valor competitivo:** AÑADIR con prioridad.
- **No aporta al MVP o eleva riesgo/coste:** POSPONER/DESCARTAR.

## 9. Métricas de cierre de esta fase

- Benchmark Playtomic: **209/209 — 100%**.
- Benchmark Vola: **37/37 — 100%**.
- Benchmark total: **246/246 — 100%**.
- Núcleo `community-logic`: reglas principales existentes y probadas en memoria; **no producción**.
- Matriz funcional/técnica: **cerrada para entrada al Roadmap V5**.

## 10. Siguiente paso

Usar esta matriz como fuente de verdad para actualizar el **Roadmap Maestro Club Pádel 04 V5**, cruzándola con el roadmap V4 y el estado global más reciente del proyecto. El PDF V5 debe mantener la estética/metodología del V4, mostrar los cuatro flujos certificados, eliminar backlog obsoleto y conservar únicamente trabajo pendiente, optimizaciones reales, dependencias externas, seguridad, horas y Definition of Done.
