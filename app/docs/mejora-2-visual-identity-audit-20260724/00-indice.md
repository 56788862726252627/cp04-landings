# Mejora 2 — Auditoría y normalización de identidad visual Club Pádel 04 + base reutilizable multisector

Auditoría real de todos los recursos visuales de la aplicación, corrección de los problemas evidentes y seguros encontrados, guía visual maestra V1, y propuesta de arquitectura de branding configurable para la futura fábrica SaaS multisector. **Sin refactor masivo, sin rediseño, sin cambios funcionales.**

## Documentos

1. [01 — Inventario completo de recursos visuales](./01-inventario-recursos.md)
2. [02 — Duplicados y referencias](./02-duplicados-referencias.md)
3. [03 — Auditoría visual de la aplicación](./03-auditoria-visual-aplicacion.md)
4. [04 — Correcciones aplicadas y aplazadas](./04-correcciones-aplicadas.md)
5. [05 — Guía visual maestra V1](./05-guia-visual-maestra-v1.md)
6. [06 — Propuesta de arquitectura visual multisector](./06-propuesta-fabrica-saas-multisector.md)
7. [07 — Matriz de compatibilidad](./07-matriz-compatibilidad.md)
8. [08 — Checklist de validación humana](./08-checklist-validacion-humana.md)
9. `guia-visual-maestra.html` — versión HTML visual autónoma de la guía (documento 05)

## Resumen ejecutivo

- **94 recursos visuales** inventariados (imágenes/iconos/SVG) + tokens de diseño (`src/theme.js`) + 65 reglas `:focus` ya existentes.
- **2 grupos de duplicados exactos** detectados por hash MD5: uno real (6 archivos de galería idénticos con nombres distintos, sin referencia activa) y uno intencional (compatibilidad `apple-touch-icon.png`/`icon-180.png`, mantener).
- **1 bug de contraste real y grave corregido**: texto blanco sobre degradado lima/menta en el ítem activo de la barra lateral (contraste WCAG 1.21-1.43, muy por debajo del mínimo 4.5) — corregido en 9 ubicaciones dentro de `App.jsx`.
- **1 problema de contraste idéntico identificado pero APLAZADO** (botón "Perfil" y selector de idioma dentro de `torcal-role-background.css`): protegido por múltiples capas de `!important` de una auditoría histórica ("AUDITORIA 29") que ya solucionó un bug de "hover rojo" — tocarlo ahora tiene riesgo real de regresión, se documenta para una mejora futura dedicada.
- **5 tonos de verde y 5 tonos de rojo** distintos usados de forma inconsistente en `App.jsx` — documentado, NO corregido (requeriría un refactor de paleta, fuera de alcance de esta mejora).
- **Tipografía de marca (Syne/DM Sans) declarada en tokens pero nunca cargada** (fallback a fuente del sistema) — decisión deliberada de una fase anterior (evitar llamadas externas), documentada, no cambiada.
- Guía visual maestra V1 (37 puntos) y propuesta de `branding.config.json` para la fábrica SaaS multisector, ambas nuevas.

## Aviso de honestidad

Ningún cambio de esta mejora toca lógica de negocio, autenticación, roles, reservas, torneos, ranking, pagos ni administración — verificado explícitamente en la Fase 8. Todos los hallazgos están basados en comprobaciones reales (hashes MD5, grep de referencias, cálculo matemático de contraste WCAG) ejecutadas en esta sesión, no en suposiciones.
