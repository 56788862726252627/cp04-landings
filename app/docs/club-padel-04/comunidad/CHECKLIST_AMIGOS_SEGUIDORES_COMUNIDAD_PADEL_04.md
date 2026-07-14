# Checklist de validación — Amigos y seguidores (Comunidad Pádel 04)

**Estado:** checklist de cierre del Prompt G. Aplicado al diseño funcional, a los flujos UI y al prototipo `amigos-seguidores.html`.
**Fecha:** 2026-07-14

---

## Checklist funcional

- [x] `Friendship`/`Follow` reutilizados del modelo de datos ya mergeado, sin entidades nuevas.
- [x] Diferencia clara entre amigos (bidireccional, MVP) y seguidores (unidireccional, fase 2) documentada y no confundida en ningún flujo.
- [x] MVP acotado a 7 de los 17 flujos; seguidores/seguidos/sugerencias correctamente marcados fase 2.
- [x] Punto abierto identificado y documentado (no resuelto de forma improvisada): "cancelar solicitud enviada" no tiene un `Friendship.status=cancelled` explícito en el modelo ya mergeado — señalado en el checklist "antes de integrar" para decidir en implementación.

## Checklist privacidad

- [x] Lista de amigos nunca pública por defecto.
- [x] El hecho de "ser amigos" solo visible si ambas partes lo permiten.
- [x] "Amigos en común" respeta la visibilidad individual de cada amigo en común, no se fuerza su exposición.
- [x] Seguir (fase 2) restringido a perfiles con visibilidad `club` o superior, para no eludir la privacidad configurada.

## Checklist consentimiento

- [x] `social_layer_opt_in` como único consentimiento requerido para amistad (MVP) — ningún consentimiento nuevo inventado.
- [x] Seguir (fase 2) sujeto a la visibilidad ya configurada por el seguido, no a un consentimiento adicional propio.
- [x] Ningún flujo del MVP requiere un consentimiento no definido ya en `CONSENTIMIENTO_PRIVACIDAD_COMUNIDAD_PADEL_04.md`.

## Checklist moderación

- [x] Reportar usuario desde esta pantalla reutiliza exactamente el mismo flujo ya diseñado en el Prompt E, sin duplicar lógica.
- [x] Reportante siempre anónimo frente al reportado.
- [x] Revisión humana obligatoria antes de cualquier acción de moderación derivada.

## Checklist antiabuso

- [x] Límite operativo de solicitudes pendientes simultáneas documentado (sin cifra fija, delegado a implementación).
- [x] "Ocultar sugerencia" explícitamente diferenciado de "Reportar"/"Bloquear", sin penalizar al sugerido.
- [x] Reintentos tras rechazo permitidos, evitando fricción técnica excesiva sobre casos legítimos (rechazo por error).

## Checklist accesibilidad

- [x] El prototipo `amigos-seguidores.html` reutiliza componentes ya validados (`avatar`, `chip`, `badge`, `btn`, `empty-state`, `consent-gate`, `friend-list`/`friend-chip` ya usados en `perfil-jugador.html`).
- [x] Tabs (Amigos/Seguidores/Seguidos) con `aria-selected`, mismo patrón ya validado en el Prompt E.
- [x] Estados comunicados con texto + icono, nunca solo color.

## Checklist responsive

- [x] Layout de una columna por debajo de 640px, coherente con el resto de prototipos.
- [x] Listas de amigos/sugerencias con scroll propio en móvil si exceden el viewport, mismo patrón que `friend-list` ya validado en PR #18.

## Checklist datos ficticios

- [x] Ningún nombre real de jugador, staff o club.
- [x] Ninguna foto real ni de terceros — avatares CSS, mismo criterio que el resto de prototipos.
- [x] Ningún dato de contacto real.

## Checklist de no copia Playtomic/Vola

- [x] Ningún nombre de sección, icono o layout reproduce lo observado en `AUDITORIA_CAPTURAS_FUNCIONES_PLAYTOMIC_VOLA.md`.
- [x] Sin uso de las palabras "Playtomic"/"Vola" en el prototipo.
- [x] Componentes y paleta reutilizados de la marca propia de Club Pádel 04, ya validada en PR #18/#19/#20.

## Checklist antes de integrar con App.jsx

- [ ] Decidir si `Friendship.status` necesita un valor `cancelled` distinto de `rejected` (flujo 7) antes de implementar "cancelar solicitud enviada" — señalado como punto abierto, no resuelto aquí.
- [ ] Confirmar con producto la regla "bloquear deshace amistad/seguimiento existente" (no explícita en el modelo de datos original) antes de implementar.
- [ ] Tests específicos de la regla de bloqueo con doble barrera, extendida a `Follow` además de `Friendship`.
- [ ] Autorización explícita del usuario para tocar `App.jsx` (Prompt N) — no concedida en este prompt.
- [ ] Confirmar el criterio exacto de cálculo de "amigos en común" y "conexiones sugeridas" con producto antes de implementar el algoritmo simple descrito.
