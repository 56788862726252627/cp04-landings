# 03 — Integración con `research:doctor` y el CLI

## Check nuevo: `multiprovider_registry_loaded`

`research-cli/lib/researchCli.mjs` (`runResearchDoctorChecks`) importa
ahora `createProviderRegistry`/`discoverAndRegisterPlugins` desde
`src/saas-core/research/providers/core/providerRegistry.js` y añade un
check nuevo, siguiendo la misma receta que Paso 13 dejó documentada para
"cómo implementar un futuro proveedor" (punto 9 de
`docs/paso-13-real-public-website-provider/05-...md`: *"Añade un check a
research:doctor que confirme que el módulo carga y pasa su propio
healthCheck(), sin cambiar el check existente"*):

```
OK   multiprovider_registry_loaded: 13/13 proveedores registrados (1 real, 12 stub)
```

Si algún plugin fallara al cargar (error de sintaxis, `PROVIDER` mal
formado, id duplicado), el check pasa a `FAIL` con el detalle del error
por archivo — sin tocar ningún otro check existente (`extension_points_*`,
`public_website_fetcher_provider_loaded`, etc. quedan intactos).

No se modificó el conteo ni el contenido de ningún check preexistente. Se
verificó ejecutando `node research-cli/research-doctor.mjs` en vivo (ver
salida completa en el [informe técnico](./04-informe-tecnico-paso-14.md)).

## Por qué no se creó un subcomando `research:providers` nuevo

Se evaluó añadir un CLI dedicado (`research-cli/research-providers.mjs`)
para listar/healthcheck del registro de forma independiente, pero
`research:doctor` ya cubre exactamente ese caso de uso (salud general del
motor, un solo comando, un solo lugar) y añadir un segundo comando
solapado habría duplicado lógica sin necesidad real — no hay hoy un
consumidor (UI, script) que necesite invocar el registro fuera de un
chequeo de salud. Si en un paso futuro se conecta el pipeline a
`auditOrchestrator.js` (ver alcance en el informe técnico), ese es el
momento natural de decidir si hace falta un CLI propio para
inspeccionar/priorizar proveedores en tiempo de ejecución.

## Test que cubre el check

`research-cli/lib/researchCli.test.mjs` añade un test dedicado que
verifica el check por `id`, no solo el resultado global `ok`, para que un
futuro cambio no pueda "pasar sin querer" por dejar `ok: true` mientras
el detalle es incorrecto:

```js
test("runResearchDoctorChecks (Paso 14) reporta los 13 proveedores del registro multiproveedor (1 real, 12 stub) cargados sin error", ...)
```
