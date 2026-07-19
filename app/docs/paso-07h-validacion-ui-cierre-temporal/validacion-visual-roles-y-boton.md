# Validación visual por roles + ajuste de contraste del botón (Paso 07H)

**Fecha:** 2026-07-19
**Continuación de:** Paso 07G (`docs/paso-07g-consolidacion-localhost-5175/`, acceso directo en sidebar para Cierre Temporal de Pistas).

---

## Entorno validado

- **Puerto:** `localhost:5175`
- **Worktree:** `/root/cp04-t-frontend-fixes`
- **Rama:** `frontend/audit-fixes-20260709`
- **HEAD antes de este paso:** `2cb5cd5` (Paso 07G)

## Validación visual manual por roles (realizada por el propietario del proyecto en localhost:5175)

| Rol | ¿Ve "Cierre temporal" en el sidebar? | ¿Puede abrir el formulario? |
|---|---|---|
| STAFF | Sí | Sí |
| ADMIN | Sí | Sí |
| SUPPORT | Sí | Sí |
| PLAYER / Jugador | **No** | No aplica (no ve el item) |

**Conclusión de la validación:** el control de acceso visual por roles es correcto y el módulo está correctamente integrado en el sidebar (confirma en la práctica lo ya probado estructuralmente en `rbac.test.mjs` desde el Paso 07G: `CP04_ROLE_PERMISSIONS.PLAYER` no incluye `"cierre_pistas"`, los otros 3 roles sí).

## Hallazgo detectado

El único detalle detectado en la validación visual: el botón principal del formulario "Cierre temporal de pista" (**"Solicitar cierre temporal de pista"**) tenía poco contraste y costaba leer el texto.

## Ajuste aplicado

Componente: `CierreTemporalPista()` en `src/App.jsx` (el mismo componente extraído en el Paso 07G, sin duplicar lógica ni crear pantallas nuevas).

Antes, el botón usaba el estilo `primary` por defecto del componente compartido `Btn` (degradado `linear-gradient(135deg, ${T.accent}, ${T.accent2})` = lima → menta, texto `#06100a`). Se mantiene el mismo componente `Btn` y la misma familia de color de marca (`T.accent`), pero con un `style` override **local a este botón únicamente**:

- **Fondo:** sólido `T.accent` (`#b6ff00`, lima puro) en vez del degradado lima→menta — un color sólido y más saturado en el extremo lee con más definición que el extremo menta del degradado.
- **Texto:** mismo `#06100a` (casi negro), ahora a `fontSize: "1rem"` (ligeramente mayor).
- **Anillo de definición:** `boxShadow: "0 16px 36px rgba(182,255,0,.32), 0 0 0 1px rgba(6,16,10,.45)"` — añade un borde oscuro fino alrededor del botón para separarlo visualmente de cualquier fondo.
- **Ancho:** `width: "100%"` — el botón ocupa todo el ancho del formulario, reforzando su peso visual como acción principal (CTA) del flujo, igual que otros CTAs premium de la app.

**No se tocó el componente compartido `Btn`** (`function Btn(...)` en `src/App.jsx`): el override es un `style` prop pasado únicamente desde este botón, así que Alta de Jugador, Baja de Jugador, Cancelar Reserva y el resto de botones de la app no cambian en absoluto.

**No se cambió:** la lógica de envío (`submitCierre`), el payload (`accion: "cierre_temporal_pista"` y el resto de campos), el endpoint (`POST /api/pistas/cierre-temporal`), ni el criterio de "nunca confirmar sin respuesta real" (`estado: "pendiente_confirmacion"`).

**Texto del botón:** se mantiene sin cambios — "Solicitar cierre temporal de pista" (normal) / "Enviando…" (envío en curso).

## Estados revisados

- **Normal:** fondo sólido lima (`#b6ff00`) + texto casi negro bold + anillo de sombra — alto contraste, consistente con la paleta de marca.
- **Hover/focus:** el componente `Btn` no define estilos de `:hover`/`:focus` propios en CSS (a diferencia de los botones del sidebar, que sí tienen handlers de hover); el navegador aplica su resaltado de foco por defecto sobre el mismo fondo sólido, que sigue siendo legible.
- **Disabled/loading (`cierreSending === true`):** el texto cambia a "Enviando…" y `Btn` aplica `opacity: .55` sobre el mismo fondo/color ya reforzados — sigue siendo legible, atenuado de forma intencional (mismo criterio que el resto de formularios de la app: Alta, Baja, Cancelar).

## Qué no se tocó

- Make: no se llamó ni se tocó ningún escenario.
- Airtable: no se llamó.
- Endpoints reales: no se llamaron (cambio 100% de estilo en frontend).
- Credenciales: no se cambiaron.
- Deploy: no se hizo.
- Merge: no se hizo. PR #36 sigue en draft.
- Payload/endpoint/lógica de Cierre Temporal de Pistas: sin cambios.
- API Reservas, Alta de Jugador, Baja de Jugador, Centro Técnico: sin cambios (verificado con la suite completa de tests, sin regresiones).

## Tests

No se añadieron tests nuevos para este paso. Motivo: es un cambio puramente de estilo visual (`style` prop) sobre un componente ya cubierto por los tests estructurales de rol del Paso 07G (`rbac.test.mjs`: PLAYER no ve `cierre_pistas`, STAFF/ADMIN/SUPPORT sí) — no se tocó ninguna lógica, payload, endpoint ni dato verificable por `node --test` (este repositorio no tiene infraestructura de render de componentes React, como ya se documentó en los Pasos 07C y 07E). Se ejecutó la suite completa (327 tests frontend + 124 tests Worker) para confirmar que ningún cambio de estilo rompió nada: todos verdes.

## Pendiente

- Validación end-to-end real de Cierre Temporal de Pistas cuando `MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK` esté configurado y Airtable esté disponible (sin cambios respecto al Paso 07E — sigue pendiente, no es parte de este ajuste visual).
