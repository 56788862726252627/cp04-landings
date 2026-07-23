# 03 — Revisión manual, privacidad y consentimiento

## El vocabulario `checkType` — por qué existe

Cada hallazgo de `a11yAnalyzer.js` declara uno de tres valores:

| `checkType` | Significado | `status` asociado | `confidence` |
|---|---|---|---|
| `"automatic"` | El HTML estático permite afirmarlo con certeza (p. ej. "sin atributo lang") | `"observed"`/`"calculated"` | > 0 |
| `"partial"` | Indicio razonable, no concluyente (p. ej. "imagen dentro de enlace sin alt: podría dejar el enlace sin nombre, pero no se confirma el anidado exacto sin árbol DOM") | `"observed"`/`"unverified"`/`"inferred"` | Reducida, refleja la incertidumbre |
| `"manual"` | Requiere interacción/criterio humano; el proveedor **NUNCA** completa esta comprobación | `"manual_required"` | Siempre `0` |

11 comprobaciones de este paso son `"manual"` de forma incondicional (una
por categoría aplicable, ver documento 01) — **nunca desaparecen del
informe**, se listan siempre como pendientes explícitas, incluso cuando
el resto de la página es intachable.

## Por qué esto importa legalmente

Una herramienta automática que **no** distingue "comprobado" de
"pendiente de revisión humana" puede dar una falsa sensación de
cumplimiento. Este proveedor evita ese riesgo de forma estructural:

- `computeA11yScoreBreakdown` excluye los hallazgos `"manual"` del
  cálculo del score (nunca los cuenta como aprobados ni como fallidos).
- `buildA11yRecommendations` los presenta bajo la severidad dedicada
  `"manual_review"`, nunca mezclados con `"critical"`/`"high"`/etc.
- `reports/accessibility.md` incluye SIEMPRE, como primera línea visible,
  el disclaimer: *"Puntuación automática orientativa — no constituye una
  certificación de accesibilidad ni sustituye una auditoría manual
  completa con tecnología de asistencia real."*
- `research:accessibility -- --show-manual-checks` lista explícitamente
  qué queda pendiente, para que sea imposible pasarlo por alto.

## Comprobaciones que quedan SIEMPRE como revisión manual pendiente

1. Orden lógico de lectura con tecnología de asistencia real.
2. Encabezados usados únicamente por estilo visual (sin ser
   semánticamente un encabezado).
3. Mensajes de error/instrucciones dinámicas de formularios (solo
   visibles tras interacción en tiempo real).
4. Validación ARIA normativa completa (combinaciones rol/atributo/
   jerarquía según WAI-ARIA in HTML).
5. Navegación completa por teclado (Tab/Shift+Tab/Enter/Espacio/Escape).
6. Dependencia exclusiva del color para transmitir información.
7. Subtítulos/transcripción reales de audio/vídeo (solo se comprueba si
   existe el marcado `<track>`, nunca el contenido del archivo en sí).

## Privacidad

- `accessibilityProvider` nunca extrae ni procesa datos personales de
  terceros: analiza estructura/metadatos/contenido PÚBLICO ya publicado
  por el propio negocio auditado.
- La detección de formularios/campos analiza únicamente su ESTRUCTURA
  (labels, tipos, atributos) — nunca lee ni procesa valores que un
  usuario real hubiera introducido (no hay tal cosa: solo se analiza el
  HTML servido, sin interacción).
- Ninguna cabecera de autenticación/cookie llega nunca a
  `accessibilityProvider` (mismo principio que `seoProvider`, Paso 16).

## Consentimiento

`accessibilityProvider` no requiere consentimiento adicional al ya
exigido por `publicWebsiteFetcher` (Paso 13: `allowNetwork:true`
explícito) — es un análisis derivado del MISMO contenido ya autorizado a
recopilarse. Los perfiles sectoriales regulados
(`clinica`/`dentista`/`veterinario`/`abogado`) siguen exigiendo su propio
`consentRequired` de Paso 15 para proveedores que sí usan credenciales de
terceros — `accessibilityProvider` no está en esa lista.

## Límite honesto explícito

Ninguna puntuación de este proveedor, por alta que sea, debe presentarse
a un cliente como "accesible" o "conforme WCAG" sin que una persona haya
completado las 7 revisiones manuales listadas arriba. Esto está
verificado por test (`a11yAnalyzer.test.mjs`: "nunca se declara
conformidad WCAG total") y reforzado en cada capa de salida (evidencia,
recomendaciones, informe, CLI).
