# Roadmap — Comunidad Pádel 04
### Red social deportiva tipo Playtomic/Vola, adaptada legalmente

**Estado:** documento de planificación (fase 0 — sin código)
**Fecha de creación:** 2026-07-14
**Rama:** `docs/comunidad-padel-roadmap-2026-07-14`
**Alcance de esta fase:** solo documentación. No se ha tocado `App.jsx`, integraciones, auth real, reservas reales, ni Make/Airtable/Stripe/WhatsApp/Supabase.

**Aviso de originalidad:** este documento se basa en observación de *funcionalidades* habituales en apps de comunidad deportiva (Playtomic, Vola y similares). No reproduce su código, su diseño exacto, sus textos ni su marca. Cualquier implementación futura debe usar naming, copy, paleta y componentes visuales propios de Club Pádel 04.

---

## 1. Visión general

Club Pádel 04 deja de ser únicamente un sistema de reservas y torneos por club, y evoluciona hacia una **capa social transversal**: un espacio donde los jugadores de uno o varios clubes tienen perfil, actividad, relaciones sociales (amigos/seguidores), retos, grupos y visibilidad de partidos abiertos, además de reservar pistas.

La comunidad no sustituye el core actual (reservas, torneos, centro técnico, perfil deportivo premium ya existente — ver `[[project-perfil-social-20260626]]`), sino que se apoya en él: el perfil deportivo premium ya construido es la base sobre la que se añade la capa social pública/semi-pública.

## 2. Objetivo de negocio

- Aumentar la **frecuencia de uso** de la app (de "entro a reservar" a "entro a ver qué pasa en mi club/red").
- Aumentar la **retención** mediante mecánicas sociales (rachas, retos, ranking, notificaciones de actividad de amigos).
- Generar un **efecto red**: cada jugador que se une aporta valor a los demás (más partidos abiertos, más rivales, más actividad visible).
- Diferenciar comercialmente Club Pádel 04 frente a un simple "software de reservas", acercándolo al terreno de Playtomic/Vola sin replicarlas, como argumento de venta para nuevos clubes.
- Abrir una futura vía de monetización propia (destacados, promoción de eventos de club, perfiles verificados) — **no incluida en el MVP**, solo mencionada como hipótesis a validar más adelante.

## 3. Beneficios para jugadores

- Encontrar rivales o compañeros de nivel similar sin depender de grupos de WhatsApp externos.
- Ver la actividad de sus amigos/contactos (partidos jugados, retos, logros).
- Publicar o unirse a partidos abiertos cuando les falta gente.
- Tener un perfil social con historial, nivel estimado y progresión (conectado al perfil deportivo premium existente).
- Participar en retos y rankings sociales, no solo en torneos oficiales del club.

## 4. Beneficios para clubes

- Su "muro de club" se convierte en canal de comunicación con los socios (eventos, novedades, torneos), reduciendo dependencia de WhatsApp/Instagram externos.
- Mayor actividad visible dentro del club aumenta la percepción de comunidad activa, lo cual ayuda a retención de abonados.
- Datos de actividad social (agregados, no invasivos) como argumento de valor para el club: qué tipo de eventos generan más interacción.

## 5. Beneficios para la Agencia IA

- Nuevo módulo diferenciador y defendible frente a competidores que solo ofrecen reservas.
- Argumento comercial directo en las conversaciones con clubes: "no es solo un booking, es una comunidad".
- Base para futuros paquetes de precios superiores (tier "Comunidad" o "Pro Social") sin tener que rehacer arquitectura — ver conexión con `[[project-matriz-precios-replicables-20260711]]` y `[[project-comercial-plan-maestro-20260711]]`.
- Contenido reutilizable para otros verticales deportivos (pádel, tenis, pickleball) si el modelo social se diseña con independencia de dominio.

## 6. Principios de diseño (no negociables)

1. **Legalidad primero**: cualquier función social que implique datos personales, geolocalización, mensajería o visibilidad de terceros debe pasar por consentimiento explícito y ser auditable.
2. **Nada copiado**: naming, iconografía, textos, flujos exactos de pantalla y paleta de color son originales de Club Pádel 04. Las capturas de Playtomic/Vola solo sirven para identificar *categorías de funcionalidad* (p. ej. "existe un feed", "existe partido abierto"), no para clonar la interfaz.
3. **Opt-in por defecto restrictivo**: perfil privado por defecto, visibilidad ampliable de forma consciente por el usuario.
4. **Moderación desde el día 1** del MVP, no como añadido posterior.
5. **Reutilizar, no duplicar**: se apoya en `tenant-runtime`, `authService`, perfil premium y storage ya auditados, sin reabrir esos módulos en esta fase documental.

---

## 7. Módulos sociales (visión funcional, sin diseño de UI final)

### 7.1 Feed
Línea temporal de actividad relevante para el jugador: partidos jugados por amigos, retos completados, nuevos partidos abiertos en su club, anuncios del muro del club. Filtrable por "mi club" / "mis amigos" / "toda la comunidad" (si el club lo permite).

### 7.2 Perfil de jugador
Extensión del perfil deportivo premium ya existente: nivel, historial de partidos, logros, disponibilidad, biografía corta, club(es) de pertenencia. Configuración de visibilidad por campo (público / solo amigos / privado).

### 7.3 Amigos / seguidores
Modelo híbrido: "amigos" (relación bidireccional, requiere aceptación) para datos sensibles (disponibilidad, contacto), y "seguidores" (relación unidireccional) para actividad pública (feed, logros). Ambos requieren que el perfil objetivo sea al menos "visible para comunidad".

### 7.4 Partidos abiertos
Un jugador (o club) publica un hueco de partido con nivel esperado, horario, pista y plazas libres. Otros jugadores pueden solicitar unirse; el creador aprueba o el sistema auto-acepta según configuración. Se apoya en el sistema de reservas existente pero como capa de *visibilidad social* sobre una reserva ya creada — no reemplaza el flujo de reserva real.

### 7.5 Búsqueda de jugadores
Filtro por club, nivel, disponibilidad horaria y (opcional, con consentimiento explícito) proximidad geográfica aproximada — nunca ubicación exacta en tiempo real.

### 7.6 Retos
Desafíos entre jugadores o grupos (ej. "gana 3 partidos esta semana", reto directo 1vs1). Requiere aceptación mutua. Resultado registrado y vinculado al ranking social.

### 7.7 Grupos
Espacios cerrados o semi-abiertos (ej. "Grupo nivel intermedio Los Lunes") con miembros, chat de grupo y partidos propios. Un club puede tener grupos oficiales y jugadores pueden crear grupos informales.

### 7.8 Chat / mensajes
Mensajería 1:1 y de grupo limitada al contexto de la comunidad (no sustituye WhatsApp). Debe considerarse el módulo de mayor riesgo legal y de moderación — ver sección 15 y 16. Fase 1 puede excluir mensajería libre y limitarse a mensajes predefinidos/plantillas para reducir riesgo de abuso.

### 7.9 Eventos
Publicaciones de eventos del club o de la comunidad (torneo social, exhibición, clínica) con inscripción, aforo y recordatorio. Distinto de "Torneos" (módulo ya auditado, ver `[[project-torneos-auditoria-completa-20260710]]`), aunque puede enlazar a un torneo oficial.

### 7.10 Ranking social
Ranking basado en actividad y resultados dentro de la comunidad (distinto del ranking oficial de torneos si existiera). Debe dejar claro que es una métrica social/gamificada, no una clasificación federativa.

### 7.11 Torneos sociales
Versión ligera de torneo, organizada por jugadores o grupos (no por el club), sin las garantías/formalidad del módulo Torneos oficial. Debe estar claramente etiquetada como "amistoso/social" para evitar confusión con torneos oficiales del club.

### 7.12 Muro del club
Canal oficial del club dentro de la comunidad: anuncios, normas, eventos oficiales. Solo administradores/staff del club pueden publicar; los jugadores pueden reaccionar/comentar según moderación del club.

---

## 8. Moderación

- Sistema de **reporte** de contenido y de usuarios (obligatorio desde MVP si hay feed, chat o perfiles públicos).
- Cola de moderación con roles (staff del club / moderador de plataforma).
- Reglas claras de contenido prohibido (acoso, spam, datos de terceros sin consentimiento, contenido no deportivo) publicadas y aceptadas en el consentimiento de alta.
- Capacidad de suspender temporalmente la participación social de un usuario sin afectar su cuenta de reservas (separación de "cuenta" vs "perfil social").
- Registro auditable de acciones de moderación (quién, qué, cuándo) — reutilizar principios ya aplicados en `[[project-observability-runtime-fase1-20260709]]` (correlation-id, logging) en el diseño, sin tocar el runtime real en esta fase.

## 9. Privacidad

- Perfil privado por defecto tras el alta; el usuario decide ampliar visibilidad de forma explícita, campo a campo cuando sea razonable (nivel, disponibilidad, club, foto).
- Ninguna geolocalización exacta en tiempo real; como mucho, aproximación por zona/club, opt-in.
- Los datos de "amigos"/contactos no se comparten con terceros ni se usan para otros fines (marketing externo) sin consentimiento adicional.
- Separación clara entre datos operativos (reservas, pagos — fuera de esta fase) y datos sociales (perfil, feed, chat).

## 10. Consentimiento

- Consentimiento específico y separado para: (a) aparecer en el feed/comunidad, (b) ser buscable por otros jugadores, (c) recibir mensajes de jugadores no-amigos, (d) uso de ubicación aproximada.
- Debe poder revocarse en cualquier momento desde el perfil, con efecto inmediato (ocultar retroactivamente, no solo dejar de mostrar futuro).
- Menores de edad: si el club tiene jugadores menores, la capa social debe poder desactivarse por tenant/perfil hasta definir un flujo de consentimiento parental — **no incluida en el MVP**, marcado como riesgo abierto (ver sección 11).

## 11. RGPD

- Base legal por función: consentimiento explícito para las funciones sociales (no "interés legítimo", dado que implica visibilidad entre particulares).
- Derecho de acceso, rectificación y supresión debe cubrir también contenido generado (posts, mensajes, retos) y no solo el perfil.
- Minimización de datos: no pedir más campos de los necesarios para cada función (ej. no exigir ubicación para simplemente ver el feed del club).
- Registro de actividades de tratamiento actualizado si se despliega mensajería o geolocalización.
- Portabilidad: exportación de datos sociales propios del usuario en formato legible, coherente con el resto de la plataforma.
- Este roadmap **no sustituye asesoría legal**; antes de implementar chat, geolocalización o menores, se recomienda validación legal externa específica.

## 12. Riesgos legales

| Riesgo | Módulo afectado | Mitigación propuesta en el diseño |
|---|---|---|
| Acoso o contacto no deseado entre usuarios | Chat, amigos, búsqueda de jugadores | Opt-in estricto, bloqueo de usuario, reporte, límite de mensajes a no-amigos |
| Exposición de menores | Perfil, feed, búsqueda | Flag de cuenta menor, ocultar de búsqueda pública por defecto, sin geolocalización |
| Uso de imagen de terceros sin consentimiento (fotos de partidos) | Feed, eventos | Consentimiento explícito antes de etiquetar/publicar a terceros |
| Confusión entre ranking/torneo social y oficial | Ranking social, torneos sociales | Etiquetado visual y textual obligatorio "social/no oficial" |
| Geolocalización excesiva | Búsqueda de jugadores | Solo aproximación por zona, nunca coordenadas exactas, opt-in explícito |
| Suplantación de identidad / perfiles falsos | Perfil, amigos | Verificación ligera (email/teléfono ya validado por el club), reporte de suplantación |
| Retención de datos tras baja | Todos | Política de borrado/anonimización de contenido social al eliminar cuenta |

---

## 13. MVP — Fase 1

**Objetivo:** validar el apetito social sin asumir el riesgo de mensajería libre ni geolocalización.

Incluye:
- Perfil de jugador extendido con control de visibilidad (público/amigos/privado).
- Amigos (bidireccional) — sin seguidores todavía.
- Feed básico: solo actividad de "mis amigos" + "muro de mi club".
- Muro del club (solo staff publica).
- Partidos abiertos (crear, ver, solicitar unirse) dentro de un mismo club.
- Moderación básica: reporte de perfil/contenido + cola de revisión para staff del club.
- Consentimiento explícito de alta a la capa social (checkbox separado del alta general).

Excluye explícitamente de fase 1: chat libre, geolocalización, grupos, retos, ranking social, torneos sociales, seguidores unidireccionales, búsqueda cross-club.

## 14. Fase 2

- Seguidores (unidireccionales) y feed ampliado a "toda la comunidad del club".
- Retos 1vs1 y de grupo.
- Grupos (creación, miembros, partidos de grupo).
- Ranking social por club, claramente etiquetado como no oficial.
- Búsqueda de jugadores dentro del club (por nivel/disponibilidad, sin geolocalización todavía).
- Mensajería con plantillas predefinidas (no texto libre) para reducir riesgo de moderación, como paso intermedio antes del chat completo.

## 15. Fase 3

- Chat libre 1:1 y de grupo, con moderación reforzada y límites anti-abuso.
- Eventos de comunidad (más allá del club: exhibiciones, encuentros multi-club si aplica).
- Torneos sociales organizados por jugadores/grupos.
- Búsqueda de jugadores cross-club con geolocalización aproximada opt-in.
- Exploración de monetización social (perfiles destacados, promoción de eventos) — sujeto a validación de negocio separada.

---

## 16. Estimación de horas (orden de magnitud, sin comprometer sprint real)

> Estimación a nivel de diseño/roadmap. No incluye integración con backend real, auth real ni Supabase — eso requerirá una fase técnica separada con su propia auditoría (siguiendo el patrón ya usado en `tenant-runtime`, Stripe, WhatsApp: diseño + tooling aislado + tests, antes de tocar App.jsx).

| Bloque | Horas estimadas (diseño + prototipo aislado, sin integrar) |
|---|---|
| Modelo de datos social (perfil extendido, amistad, consentimiento) | 20–30h |
| Feed (lógica + componentes visuales aislados) | 25–35h |
| Partidos abiertos (lógica + UI aislada) | 20–30h |
| Muro del club | 10–15h |
| Moderación (cola, reportes, roles) | 20–25h |
| Amigos/seguidores | 15–20h |
| Retos | 15–20h |
| Grupos | 20–25h |
| Chat/mensajes (plantillas fase 2 + libre fase 3) | 30–45h |
| Ranking social | 10–15h |
| Torneos sociales | 15–20h |
| Búsqueda de jugadores + geolocalización opt-in | 15–20h |
| Eventos | 15–20h |
| RGPD/consentimiento/privacidad (flujos + textos legales revisables) | 15–20h |
| **Total MVP (Fase 1, subconjunto de lo anterior)** | **~110–150h** |
| **Total Fase 2 adicional** | **~90–120h** |
| **Total Fase 3 adicional** | **~90–130h** |

Estas cifras son de planificación, no un compromiso de sprint; deben recalibrarse cuando se defina el diseño técnico detallado (fuera de alcance de esta fase documental).

---

## 17. Dependencias y puntos de reutilización conocidos

- `[[project-perfil-social-20260626]]` — perfil deportivo premium ya implementado; base del perfil de jugador de comunidad.
- `[[project-multitenant-runtime-layer-20260709]]` / `[[project-multitenant-config-closure-20260710]]` — capa multi-tenant aislada, relevante si la comunidad debe respetar límites de tenant (ej. feed no cruza clubes por defecto).
- `[[project-tenant-storage-isolation-20260710]]` — aislamiento de almacenamiento por tenant; relevante para no filtrar datos sociales entre clubes.
- `[[project-observability-runtime-fase1-20260709]]` — patrones de logging/correlation-id reutilizables para el diseño de auditoría de moderación.
- `[[project-torneos-auditoria-completa-20260710]]` — módulo Torneos oficial, debe permanecer claramente diferenciado de "torneos sociales".
- `[[project-matriz-precios-replicables-20260711]]` / `[[project-comercial-plan-maestro-20260711]]` — encaje comercial futuro del tier "Comunidad".

## 18. Próximos pasos recomendados (no ejecutar todavía)

1. Validación legal externa del bloque RGPD/consentimiento/menores antes de cualquier prototipo con datos reales.
2. Diseño de modelo de datos social en documento técnico separado (sin tocar Supabase real).
3. Prototipo visual aislado (Figma o componentes React desconectados de `App.jsx`) del Feed y Perfil de jugador.
4. Definir criterios de éxito del MVP (métricas de adopción) antes de estimar sprint real.
5. Ver `PROMPTS_IMPLEMENTACION_COMUNIDAD_PADEL_04.md` para los prompts de fases futuras.
