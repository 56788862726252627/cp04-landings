# 04 — CLI y ejemplos

## Flags nuevos en `research:audit` / `research:collect`

```
--seo / --include-seo   Asegura que seoProvider participa (si ya se indicó --providers explícito)
--seo-only               Restringe la ejecución a publicWebsiteFetcher+seoProvider únicamente
--exclude-seo             Excluye seoProvider explícitamente
--explain-score           (solo research:audit) Imprime la explicación de cada categoría, incl. el desglose SEO
--show-coverage           (solo research:audit) Imprime la cobertura por categoría/grupo SEO
```

Todos requieren `--pipeline=multiprovider` explícito (mismo principio de
seguridad por defecto que Paso 15: sin el flag, no cambia nada).

## `research:seo` (nuevo) — comando dedicado

### Modo offline puro (nunca toca red)

```bash
# Analiza un archivo HTML local directamente
npm run research:seo -- --local-file=./mi-pagina.html --profile=restaurante

# Analiza el HTML de una fixture de demostración
npm run research:seo -- --demo=seo-basico-deficiente --profile=generic
```

### Modo auditoría completa (persiste en research/audits/, igual que research:audit)

```bash
npm run research:seo -- --business-name="Mi Negocio" --sector=padel-sports \
  --url=https://ejemplo.com/ --mode=public-web --allow-network --profile=club-deportivo
```

Sin `--allow-network`, se comporta exactamente igual que sin red:
`seoProvider` no recibe páginas, `reports/seo.md` indica "esta auditoría
no incluye análisis SEO".

## `research:providers` / `research:profiles` (Paso 15, siguen vigentes)

```bash
npm run research:providers -- --plan --profile=hotel --execution=sequential
# Ahora incluye seoProvider (real) en la cadena resultante, con prioridad 15
```

## Ejemplo real ejecutado durante el desarrollo (validación manual, Fase 9)

```bash
npm run research:seo -- --business-name="E2E CLI SEO Test" --sector=generic-local-service \
  --url=https://example.com/ --mode=public-web --allow-network --profile=generic
```

Resultado real obtenido (dominio técnico reservado RFC 2606, 1 página):
score SEO global 43/100, 9 grupos evaluados, 3 recomendaciones de
severidad alta (sin meta description, contenido escaso, sin información
de contacto) — coherente con que `example.com` es una página mínima de
demostración. El directorio de auditoría generado se eliminó tras la
comprobación (no se persiste en el repositorio).
