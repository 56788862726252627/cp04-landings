# 10 — Casos de demostración

Las 10 fixtures del enunciado (sección 17), en `src/saas-core/research/fixtures/demoFixtures.js`
— **todo ficticio**, ningún dato real, claramente etiquetado como tal en
el propio código fuente. Ejecutadas de extremo a extremo vía
`research:audit`, con idempotencia confirmada en las 10 (segunda ejecución
= 0 creados / 0 actualizados / 13 preservados, en todos los casos).

| # | Demo (fixture id) | auditId generado | Score global | Estado |
|---|---|---|---|---|
| A | `padel-web-anticuada` | `club-padel-ficticio-norte` | 18/100 | crítico |
| B | `dental-branding-inconsistente` | `clinica-dental-ficticia-sonrisa-norte` | 61/100 | correcto |
| C | `fisio-buena-reputacion-mala-conversion` | `fisioterapia-ficticia-avanza` | 43/100 | básico |
| D | `restaurante-sin-reservas` | `restaurante-ficticio-la-mesa-vieja` | 48/100 | básico |
| E | `despacho-servicios-poco-claros` | `despacho-ficticio-rivas-asociados-norte` | 23/100 | débil |
| F | `negocio-datos-insuficientes` | `negocio-ficticio-sin-datos` | sin datos | desconocido (esperado: 45/45 dimensiones "unknown", 0 evidencia) |
| G | `fuentes-contradictorias` | `peluqueria-ficticia-contraste` | 47/100 | básico (con contradicción real detectada en `bookingCapability`) |
| H | `accesibilidad-deficiente` | `clinica-veterinaria-ficticia-patitas-norte` | 35/100 | débil |
| I | `seo-basico-deficiente` | `taller-ficticio-motornorte` | 23/100 | débil |
| J | `negocio-en-ingles` | `fictional-bright-minds-academy` | 57/100 | básico (`language: "en"` detectado correctamente) |

Cada auditoría generada incluye (verificado en disco, no solo en memoria):
`research-request.json, research-plan.json, evidence.json, audit.json,
.research-manifest.json` + `reports/{executive,technical,commercial,
opportunities-summary,backlog,impact-effort-matrix,automation-map,
risk-report,evidence-appendix}.md` — 13 archivos por auditoría.

## Reproducir cualquier demo

```bash
npm run research:audit -- --demo=fuentes-contradictorias
npm run research:audit -- --demo=fuentes-contradictorias   # 2ª vez: 0 creados/0 actualizados/13 preservados
npm run research:audit -- --demo=fuentes-contradictorias --strict   # bloquea: contradicción sin resolver, código de salida 2, nada escrito
npm run research:doctor
```

## Casos concretos que demuestran comportamiento real (no solo "no lanza")

- **F (datos insuficientes)**: 0 evidencia recolectada, 45/45 dimensiones
  `unknown`, score global `null` — nunca una conclusión inventada.
- **G (fuentes contradictorias)**: el HTML de la fixture declara "reserva
  online" (señal positiva) mientras una evidencia JSON adjunta ("varios
  clientes reportan que el botón no funciona") es negativa para la MISMA
  dimensión (`bookingCapability`) — el motor detecta la contradicción,
  penaliza la confianza, y `--strict` bloquea la persistencia.
- **J (inglés)**: `resolveResearchRequestFromArgs` detecta `language: "en"`
  a partir de la ubicación de la fixture (`Manchester, UK`) sin
  intervención manual.
