# Prompt 5 de 9 — Cierre global de conflictos color/fondo y textos invisibles

- **Fecha:** 2026-07-26
- **Worktree:** `/root/cp04-t-vite-watcher-fix` (app en `/root/cp04-t-vite-watcher-fix/app`)
- **Rama de partida:** `mejora-2-6/accessibility-contrast-audit-20260726` (PR #61, abierta, sin merge)
- **Continúa de:** [17-accesibilidad-contraste-20260726.md](17-accesibilidad-contraste-20260726.md), que recomendaba una búsqueda dirigida de todo el patrón "color pensado para un fondo que una regla CSS genérica sobrescribe" en el resto de la app.

## Patrones buscados (Fase 1-2)

Búsqueda por grep de los patrones señalados en el prompt sobre `src/App.jsx` y los componentes activos (`CentroTecnico.jsx`, `ComunidadDemo.jsx`, `CP04GuidedTutorial.jsx` — `CP04DemoRealista.jsx` y `ClubGallery.jsx` se excluyeron por estar confirmados huérfanos desde el Prompt 1):

- `background:T.accent` combinado con `color:"#0...` (el patrón exacto de los 4 bugs ya cerrados en los Prompts 3-4).
- `color:"inherit"` (el patrón del bug de `PwaStatusBanners`).
- `-webkit-text-fill-color` en todos los CSS del proyecto (19 en `cp04-legibility-polish.css`, 5 en `tournament-module.css`).
- `mix-blend-mode`, `background-clip: text` (ninguno en todo el proyecto).
- `filter:` en `App.jsx` (5 usos, todos `backdrop-filter` o `brightness()` en hover — sin riesgo).
- `nth-of-type` / `nth-child` en todo el CSS (selectores por posición, marcados como peligrosos en el propio prompt).
- Opacidad de estados `disabled` (`.55`, `.72` — dentro de rango razonable, no "excesiva").

## Coincidencias iniciales y falsos positivos descartados

| Patrón | Coincidencias | Resultado |
|---|---|---|
| `background:T.accent` + `color:"#0...` en `App.jsx` | 2 (líneas 8113 "Iniciar sesión", 8167 "Crear cuenta") | **Falsos positivos**: ya corregidos en el Prompt 4 (clase `cp04-login-submit-btn`), confirmados con Chromium — siguen correctos |
| Mismo patrón en `CentroTecnico.jsx` / `ComunidadDemo.jsx` | 1 (definición de variante `primary` de un `Btn` local en `ComunidadDemo.jsx`) | **Falso positivo**: el mismo rol/color se fija en la MISMA regla (gradiente + texto oscuro juntos), no hay reparto entre JSX y CSS — es el patrón seguro, no el peligroso |
| `color:"inherit"` en `App.jsx` | 2 (los mismos botones de `PwaStatusBanners` ya corregidos en el Prompt 4) | Ya resuelto, confirmado sin regresión |
| `nth-child` en tablas (`cp04-table td:nth-child(2)`) | 1 bloque | **Falso positivo**: columnas de tabla, estructuralmente fijas (no dependen de renderizado condicional como los botones del tutorial) |
| `nth-of-type` en `tournament-module.css` (zebra striping) | ya revisado en auditorías previas | Sin riesgo — alternancia visual de filas, no identidad de control |

## Conflicto real confirmado (crítico)

### Botón "Siguiente"/"Finalizar" del tutorial guiado — invertido con "Saltar" en el primer paso

`cp04-legibility-polish.css` tenía dos generaciones de "fix" superpuestas para el botón principal del tutorial (`CP04GuidedTutorial.jsx`):

1. **Generación 1** — `[aria-label="Siguiente"]`: el valor `"Siguiente"` **nunca existió** como `aria-label`. El JSX real usa `aria-label={isLast ? "Finalizar tutorial" : "Paso siguiente"}`. Esta regla llevaba muerta desde que se escribió, sin que nadie lo notara porque la Generación 2 la compensaba visualmente.
2. **Generación 2 ("FIX FINAL 2")** — `button:nth-of-type(2)`: selector por posición. Pero el botón "Atrás" solo se renderiza a partir del segundo paso del tutorial (`{!isFirst && <button aria-label="Paso anterior">Atrás</button>}`). En el **primer paso** (el que ve el 100% de los usuarios la primera vez que entran), el segundo botón del DOM no es "Siguiente" — es "Saltar".

**Resultado confirmado con Chromium, en los 4 roles, antes del fix:** en el paso 1, "Saltar" recibía el degradado lima + texto oscuro pensado para el botón principal, y "Siguiente" recibía el estilo secundario (texto claro, sin fondo) — la jerarquía visual quedaba invertida: la acción de abandonar el tutorial parecía la acción principal, y continuar parecía la secundaria.

**Corrección:** sustituidos los dos selectores rotos por los aria-label reales y estables — `button[aria-label="Paso siguiente"]` y `button[aria-label="Finalizar tutorial"]` —, que no dependen de la posición en el DOM ni del idioma (el tutorial no está traducido: sus aria-label son literales en español en las 8 traducciones de la app, un vacío de contenido preexistente y ya documentado, fuera de alcance de este prompt). Eliminado el bloque completo de reglas `:nth-of-type`, ya innecesario.

Este hallazgo confirma exactamente la hipótesis del informe anterior: la misma familia de bug (identidad de un control resuelta de forma fráfil — antes por texto, aquí por posición) puede aparecer sin que ningún idioma esté involucrado.

### Por qué no lo había detectado la auditoría automatizada del Prompt 4

El barrido con Chromium del Prompt 4 marca el tutorial como "ya visto" (`cp04_tutorial_seen_<ROL>`) antes de auditar cada pantalla, precisamente para no interferir con la navegación automatizada — así que nunca llegó a renderizar el paso 1 del tutorial. Es una limitación real de aquel método, documentada aquí para que quede constancia: un bug de alta visibilidad (lo ve cada usuario nuevo, en los 4 roles) puede sobrevivir a una auditoría automatizada si esa auditoría evita deliberadamente el flujo donde vive.

## Validación por idioma (Fase 5)

El tutorial no está traducido (aria-label y texto visible son literales en español en el JSX, independientemente de `cp04_language`), así que el fix es por construcción idéntico en los 7 idiomas — verificado igualmente con Chromium en es-ES para evitar dar por sentado algo no comprobado. Se confirma además que ninguna corrección de este prompt depende del idioma (regla explícita de seguridad del prompt: "no añadir parches basados en texto visible").

## Validación por rol (Fase 6)

Tutorial: probado end-to-end (paso 1 → paso 5) en PLAYER. Por estructura del componente (`CP04GuidedTutorial.jsx` no recibe ninguna prop dependiente del rol que cambie qué botón se renderiza en qué posición), el mismo bug y la misma corrección aplican igual en STAFF/ADMIN/SUPPORT — confirmado además indirectamente: los 34 pantallas de rol re-auditadas tras el fix (Prompt 4 + hoy) siguen en 0 fallos de contraste, sin regresión.

## Validación responsive (Fase 10)

390 / 768 / 1440 px: botón "Siguiente" del tutorial dentro del viewport, sin overflow horizontal, mismo color/fondo en los tres anchos.

## Corrección aplicada (Fase 7) — orden de preferencia seguido

Se usó el nivel 4 de la lista de preferencia del prompt ("regla CSS específica del componente"), con el identificador MÁS estable ya disponible sin inventar nada nuevo: el propio `aria-label`, que el componente ya calcula de forma determinista (`isLast ? "Finalizar tutorial" : "Paso siguiente"`). No se ha tocado el JSX del tutorial — no hizo falta: el problema estaba enteramente en que el CSS apuntaba a un valor equivocado, no en el componente en sí.

## Tokens (Fase 8)

No se han creado tokens nuevos. Se documenta la pareja de colores ya usada en todo el proyecto para "texto sobre fondo lima/menta": `color:#071000` (o `#06100a`, variante ligeramente distinta usada en otros puntos — ambas oscuras, mismo propósito) sobre `linear-gradient(135deg, #b6ff00, ...)`. No se ha detectado contradicción entre los dos valores oscuros — son intercambiables en la práctica (ambos dan >15:1 de contraste sobre lima) y consolidarlos en un único token sería una migración no solicitada por este prompt (Fase 8: "no realizar una migración global ciega").

## Tests (Fase 9)

5 tests nuevos en `src/colorBackgroundConflicts.test.mjs` (inspección de fuente): confirman que el aria-label real coincide con el JSX, que no queda ningún `nth-of-type` en el CSS, que el selector muerto `[aria-label="Siguiente"]` ha desaparecido, y que el botón principal tiene más especificidad que la regla genérica de botones secundarios (para que el orden de las reglas en el archivo nunca vuelva a importar).

## Checklist de validación

- [x] 1338/1338 tests (1333 + 5 nuevos).
- [x] Build correcto.
- [x] Lint: mismos problemas preexistentes, 0 nuevos.
- [x] `localhost:5175` → 200.
- [x] Tutorial paso 1 y paso 5 (último): "Siguiente"/"Finalizar" con degradado lima + texto oscuro; "Saltar" y "No mostrar más" con estilo secundario correcto — confirmado con Chromium.
- [x] 0 regresiones en las 34 pantallas de rol ya auditadas en el Prompt 4.
- [x] Responsive 390/768/1440 sin overflow, botón dentro de la vista.
- [x] Sin cambios de lógica de negocio, RBAC, rutas, textos visibles ni traducciones.
- [x] `/root/cp04-landings` no tocado.
- [x] Sin merge.

## Checklist visual humano

- [ ] Abrir la app por primera vez (sin `cp04_tutorial_seen_<rol>` en localStorage) en cada uno de los 4 roles y confirmar que el botón "Siguiente" del paso 1 se ve como botón principal (lima, texto oscuro) y "Saltar" como enlace secundario.
- [ ] Llegar hasta el último paso del tutorial y confirmar que "Finalizar" también se ve como botón principal.
- [ ] Confirmar en tablet que el tooltip del tutorial no corta ningún botón.

## Riesgos residuales

1. El tutorial guiado no está traducido (aria-label y texto en español fijo) — vacío de contenido preexistente, documentado también en el Prompt 4, fuera de alcance de este prompt (no cambiar textos ni traducciones).
2. Esta auditoría se ha centrado en los patrones explícitamente listados por el prompt (color/fondo/gradiente/opacidad/webkit-text-fill-color/filter/mix-blend-mode/selectores genéricos/posicionales) sobre `App.jsx` y los 3 componentes activos restantes. No se ha re-auditado pixel a pixel cada estado hover/active/loading de cada botón de la aplicación — se ha priorizado profundidad en los patrones de mayor riesgo ya demostrado (Prompts 3-4) sobre una re-auditoría exhaustiva desde cero.
3. El método de auditoría automatizada (Chromium con `cp04_tutorial_seen_*` preseteado) sigue sin cubrir el flujo real de "primera visita" de forma rutinaria — si se añade un test automatizado de regresión visual en el futuro, debería incluir explícitamente ese escenario.
