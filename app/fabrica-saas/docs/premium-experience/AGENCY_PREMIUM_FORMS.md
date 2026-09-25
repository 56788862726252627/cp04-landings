# Formularios Premium — ADV-07

**isReal:** false | **Módulo:** formExperience

## Patrones de Formulario

`createFormExperience({ vertical })` devuelve `{ pattern, fieldCount, steps, useWizard, useProgressBar, submitLabel, hasSuccess, hasError, hasLoading, mobileKeyboard, isReal }`.

| Patrón | Uso |
|--------|-----|
| SINGLE_PAGE | Formularios cortos (≤ 4 campos) |
| WIZARD | Formularios largos (> 5 campos), multi-paso |
| PROGRESSIVE | Campos que aparecen progresivamente |
| CONVERSATIONAL | Chat-like, secuencial |

## Evaluación de Calidad

`evaluateFormQuality(form)` retorna `{ score: 0-100, issues: [] }`.

Criterios evaluados:
- Número de campos (máximo 7 en vista inicial)
- Uso de wizard para formularios largos
- Presencia de success/error/loading states
- Adaptación de teclado mobile (`mobileKeyboard`)

## Prácticas Obligatorias

- Todos los campos deben tener `<label for="...">` (validado por Playwright)
- Feedback visual inmediato al submit (success state)
- Error inline por campo, no genérico
- Botón de submit siempre visible (sin scroll)
- Progreso visible en wizard (barra o pasos)

## Patrones Prohibidos (dark patterns)

Ver `conversionUXPolicy.js` — `DARK_PATTERN` lista completa:
- Pre-checked boxes
- Timer de presión falso
- Precio oculto en el último paso
- Roach motel (suscribir fácil, cancelar difícil)

## Ejemplo — Formulario Veterinaria

```js
const form = createFormExperience({ vertical: 'veterinary' });
// → { pattern: 'PROGRESSIVE', fieldCount: 5, useWizard: false,
//     submitLabel: 'Solicitar cita', hasSuccess: true, isReal: false }
```
