# 04 — CLI

## `research:audit` y `research:collect` — flags nuevos (opt-in)

```
--pipeline=legacy|multiprovider     legacy (por defecto): idéntico a Paso 13/14
--execution=sequential|parallel|fallback   (por defecto: fallback)
--providers=<id>[,<id>...]          Allowlist explícita
--exclude-providers=<id>[,...]      Se acumula con las exclusiones del --profile
--provider-priority=<id:n>[,...]    p.ej. "seoProvider:5,whoisProvider:60"
--profile=<id>                      Ver research:profiles -- --list
--max-concurrency=<n>               Solo aplica a --execution=parallel
--global-timeout=<ms>
--provider-timeout=<ms>
```

Todos con valor por defecto seguro: sin `--pipeline=multiprovider`
explícito, ninguno de estos flags cambia nada (el código ni siquiera
entra en `orchestratorProviderBridge.js`).

## `research:providers` (nuevo)

```
npm run research:providers -- --list
npm run research:providers -- --describe=<id>
npm run research:providers -- --health
npm run research:providers -- --plan --profile=<id> --execution=<modo> [--providers=...] [--exclude-providers=...]
```

`--plan` resuelve la cadena de proveedores que SE USARÍA con una política
dada — sin ejecutar `collect()` de ninguno. `--health` ejecuta
`healthCheck()` de todos (el del proveedor real es estático, sin red).
Ninguno de los 4 subcomandos toca la red bajo ninguna combinación de
flags (verificado).

## `research:profiles` (nuevo)

```
npm run research:profiles -- --list
npm run research:profiles -- --describe=<id>
```

Lista/describe los 10 perfiles + el genérico (proveedores recomendados,
pesos, reglas, consentimiento, exclusiones).

## `--format`/`--output`

`research:providers` y `research:profiles` soportan `--format=json|
markdown` (por defecto `markdown`) y `--output=<ruta>` (si no se indica,
imprime a stdout) — mismo patrón que el resto del CLI de investigación
(`writeOutputOrPrint`, Paso 12). `research:audit`/`research:collect`
mantienen su formato de salida existente (resumen en consola +
persistencia en `research/audits/<id>/`, que ya son de facto el "informe
JSON y Markdown" pedido en la Fase 7 — `audit.json` + `reports/*.md`).

## Ejemplo end-to-end (offline, sin red)

```bash
npm run research:audit -- --demo=padel-web-anticuada \
  --pipeline=multiprovider --execution=sequential --profile=club-deportivo --dry-run
```

## Ejemplo con red real (requiere --allow-network explícito)

```bash
npm run research:audit -- --business-name="Mi Negocio" --sector=generic-local-service \
  --mode=public-web --url=https://ejemplo.com/ --allow-network \
  --pipeline=multiprovider --profile=generic
```
