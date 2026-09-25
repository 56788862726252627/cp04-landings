# 08 — Casos de demostración (A-H)

Código: `nl-builder/demoRequests.js` (los 8 prompts) + `nl-builder/demoRequests.test.mjs`
(10 tests que ejercitan las 8 combinaciones de punta a punta: intent válido → blueprint
válido → dry-run del orquestador sin colisiones → determinismo → idempotencia).
Además, los 7 casos distintos de la clínica de fisioterapia (que tiene su propia
prueba en 07) se generaron también **por CLI real** (no solo por tests), con artefactos
verificables en `src/saas-core/nl-builder/requests/`.

| Caso | Id | Prompt (resumen) | Resultado clave observado |
|---|---|---|---|
| A. Club de pádel | `club-padel` | Club de pádel ficticio en Sevilla, con torneos/ranking/pagos | sector `padel` detectado; `torneos`/`ranking` habilitados como explícitos |
| B. Clínica de fisioterapia | `fisioterapia` | Ver 07 (prueba real completa) | ver 07 |
| C. Despacho de abogados | `despacho` | Despacho ficticio en Madrid, casos/citas/documentos/facturación | sector `law`; roles `cliente/abogado/administracion/direccion/soporte` |
| D. Restaurante | `restaurante` | Restaurante ficticio en Valencia, mesas/menú/confirmación WhatsApp | sector `restaurant` (nuevo en este paso); entidad `mesa` presente |
| E. Negocio ambiguo | `ambiguo` | "quiero un software para mi negocio" | confianza global < 0.6; ambigüedad no bloqueante sobre `business.sector`; cae a preset genérico |
| F. Solicitud contradictoria | `contradictorio` | Clínica dental con "pagos online" y "sin pagos online" a la vez | ambigüedad **BLOQUEANTE** sobre `modules.pagos`; en `--strict`, código de salida 2 y nada escrito |
| G. Módulos no recomendados | `modulos-no-recomendados` | Despacho de abogados que también pide torneos/ranking | `torneos` aceptado (explícito) con confianza ≤ 0.5 y ambigüedad asociada; nunca se activa en silencio |
| H. Inglés básico | `ingles` | "Create a saas for a fictional dental clinic in London..." | `language: "en"` detectado; sector `dental` igualmente reconocido |

## Cómo reproducir cualquiera de los 8 casos

```
npm run business:interpret -- --demo=<id> --seed=demo-<id>-001 --format=markdown
npm run business:from-prompt -- --demo=<id> --seed=demo-<id>-001          # análisis (sin materializar)
npm run business:from-prompt -- --demo=<id> --seed=demo-<id>-001 --execute # materializa el tenant
```

`<id>` ∈ `club-padel | fisioterapia | despacho | restaurante | ambiguo | contradictorio |
modulos-no-recomendados | ingles`.

## Nota sobre colisión de nombres (limitación real, documentada, no oculta)

`despacho` y `modulos-no-recomendados` son ambos despachos de abogados sin ciudad
detectada: el nombre provisional derivado (`proposedName`) es el mismo para los dos
(`"Despacho De Abogados (borrador)"`), lo que produce el mismo `businessId` por
defecto. Al generarlos ambos por CLI en el mismo directorio de análisis, el segundo
sobrescribió los artefactos del primero — un colisión real detectada durante esta
misma sesión de pruebas, no hipotética. Se solucionó añadiendo `--business-id=<slug>`
a `business:compose`/`business:from-prompt` (ver 06) y regenerando ambos con ids
explícitos (`despacho-de-abogados-demo`, `despacho-modulos-no-recomendados-demo`).
Queda documentado como comportamiento esperado del auto-nombrado determinista (dos
peticiones "iguales" en sector+ciudad producen el mismo nombre por defecto) y no como
un bug del compositor.
