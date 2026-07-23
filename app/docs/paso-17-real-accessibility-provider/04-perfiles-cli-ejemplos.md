# 04 — Perfiles sectoriales, CLI y ejemplos

## `accessibility/a11ySectorRules.js` — dato puro

Igual que `seoSectorRules.js` (Paso 16): `a11yAnalyzer.js` no conoce
ningún sector, solo consulta `getA11ySectorRule(profileId)` (fallback a
`generic`) para obtener `categoryWeights` (pondera los 9 grupos de
scoring) y `priorityNotes` (texto informativo). Cubre los 10 perfiles del
enunciado + genérico:

| Perfil | Prioridad de accesibilidad |
|---|---|
| `club-deportivo` | Formularios de reserva + navegación |
| `clinica` | Contenido + formularios de cita + contraste (perfil demográfico habitual) |
| `dentista` | Contenido + formularios de cita |
| `veterinario` | Formularios + navegación (contacto rápido para urgencias) |
| `abogado` | Contenido legal + estructura |
| `restaurante` | Contenido (menús/cartas) + imágenes |
| `hotel` | Formularios de reserva + imágenes (galería de habitaciones) |
| `inmobiliaria` | Contenido + imágenes (fichas de propiedad) |
| `peluqueria` | Navegación (botones de llamada/reserva) + formularios |
| `centro-estetica` | Navegación (acceso a servicios) + contenido |
| `generic` | Pesos neutros en los 9 grupos |

## CLI — flags nuevos

```
--accessibility / --include-accessibility   Asegura que accessibilityProvider participa
--accessibility-only              Restringe la ejecución a publicWebsiteFetcher+accessibilityProvider
--exclude-accessibility           Excluye accessibilityProvider explícitamente
--wcag-level=A|AA                 Filtra qué criterios mostrar (NUNCA cambia qué se analiza)
--explain-accessibility-score     Explica cada grupo del desglose
--show-manual-checks              Lista las comprobaciones pendientes de revisión manual
```

Todos requieren `--pipeline=multiprovider` explícito (mismo principio de
seguridad por defecto que Paso 15/16). `--seo-only` y
`--accessibility-only` combinados incluyen los 3 proveedores reales.

## `research:accessibility` (nuevo) — comando dedicado

### Modo offline puro (nunca toca red)

```bash
npm run research:accessibility -- --local-file=./mi-pagina.html --profile=clinica
npm run research:accessibility -- --demo=accesibilidad-deficiente --show-manual-checks
```

### Modo auditoría completa (persiste en research/audits/)

```bash
npm run research:accessibility -- --business-name="Mi Negocio" --sector=padel-sports \
  --url=https://ejemplo.com/ --mode=public-web --allow-network --profile=club-deportivo
```

## Ejemplo real ejecutado durante el desarrollo (validación manual, Fase 9)

```bash
npm run research:audit -- --business-name="E2E CLI 3 Providers" --sector=generic-local-service \
  --url=https://example.com/ --mode=public-web --allow-network \
  --pipeline=multiprovider --seo-only --accessibility-only --profile=generic \
  --explain-accessibility-score --show-manual-checks
```

Resultado real obtenido (dominio técnico reservado RFC 2606, 1 página,
los 3 proveedores reales activos): score global 37/100, SEO 43/100,
accesibilidad 44/100 con 6 revisiones manuales pendientes explícitas
(orden de lectura, validación ARIA completa, dependencia del color,
encabezados por estilo, navegación por teclado). El directorio de
auditoría generado se eliminó tras la comprobación.
