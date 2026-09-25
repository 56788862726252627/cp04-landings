# 04 — Perfiles sectoriales, CLI y ejemplos

## `performance/perfSectorRules.js` — dato puro

Igual que `seoSectorRules.js` (Paso 16) / `a11ySectorRules.js` (Paso 17):
`perfAnalyzer.js` no conoce ningún sector, solo consulta
`getPerfSectorRule(profileId)` (fallback a `generic`) para obtener
`categoryWeights` (pondera los 11 grupos de scoring) y `priorityNotes`
(texto informativo). Cubre los 10 perfiles del enunciado + genérico:

| Perfil | Grupos priorizados | Nota |
|---|---|---|
| `club-deportivo` | javascript, mobile | Calendario/formulario de reserva depende de JS: bloqueos críticos. Mayoría de reservas desde móvil. |
| `clinica` | html, mobile | Contenido crítico (horarios, servicios) debe cargar rápido incluso sin JS. |
| `dentista` | html, mobile | Mismo criterio que clínica: contenido crítico ligero y accesible en móvil. |
| `veterinario` | html, thirdParty | Contacto de urgencia inmediato: minimizar dependencias de terceros. |
| `abogado` | html, caching | Contenido legal mayormente estático: caché bien configurada, alto impacto/bajo esfuerzo. |
| `restaurante` | images, mobile | Menús/cartas con fotografía: peso de imágenes es el riesgo principal. Consulta mayoritaria desde móvil. |
| `hotel` | images, javascript | Galería de habitaciones (peso de imágenes) + motor de reservas con JS. |
| `inmobiliaria` | images, resources | Fichas de inmuebles con muchas fotos: peso de imágenes y nº de recursos críticos. |
| `peluqueria` | mobile, javascript | Reserva rápida desde móvil + JS de terceros (widgets de reserva). |
| `centro-estetica` | mobile, images | Galería de tratamientos + reserva móvil. |
| `generic` | — | Pesos neutros en los 11 grupos. |

## CLI — flags nuevos

```
--performance / --include-performance   Asegura que performanceProvider participa
--performance-only                Restringe la ejecución a publicWebsiteFetcher+performanceProvider
--exclude-performance              Excluye performanceProvider explícitamente
--explain-performance-score        Explica cada grupo del desglose de rendimiento
--show-unmeasured                  Lista las métricas no medibles con esta herramienta (not_measured/browser_test_required)
```

Todos requieren `--pipeline=multiprovider` explícito (mismo principio de
seguridad por defecto que Paso 15/16/17). `--seo-only`,
`--accessibility-only` y `--performance-only` combinados incluyen los 4
proveedores reales.

## `research:performance` (nuevo) — comando dedicado

### Modo offline puro (nunca toca red)

```bash
npm run research:performance -- --local-file=./mi-pagina.html --profile=hotel
npm run research:performance -- --demo=padel-web-anticuada --show-unmeasured
```

### Modo auditoría completa (persiste en research/audits/)

```bash
npm run research:performance -- --business-name="Mi Negocio" --sector=padel-sports \
  --url=https://ejemplo.com/ --mode=public-web --allow-network --profile=club-deportivo
```

## Ejemplo real ejecutado durante el desarrollo (validación manual, Fase 9)

```bash
npm run research:performance -- --business-name="Example Test" --sector=restaurant \
  --url=https://example.com/ --allow-network --mode=public-web --max-pages=1 \
  --profile=restaurante --show-unmeasured
```

Resultado real obtenido (dominio técnico reservado RFC 2606, 1 página):
score global 51/100 (confianza 91%, cobertura de grupos 64%), sin
recomendaciones críticas, 1 métrica no medida (compresión) y 1
explícitamente marcada `browser_test_required` (CSS no utilizado). El
directorio de auditoría generado se eliminó tras la comprobación.
