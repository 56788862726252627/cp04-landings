# 12 — Guía rápida: de un negocio público a un diagnóstico digital (< 15 min)

```bash
cd app

# 1. (2 min) Elige una fixture de demo o construye tu propio Research Request.
npm run research:plan -- --demo=fisio-buena-reputacion-mala-conversion --format=summary

# 2. (1 min) Solo recolectar, para inspeccionar la evidencia antes de analizar.
npm run research:collect -- --demo=fisio-buena-reputacion-mala-conversion --output=/tmp/evidencia.json

# 3. (1 min) Analizar esa evidencia (dimensiones/scores/recomendaciones).
npm run research:analyze -- --evidence=/tmp/evidencia.json --sector=physiotherapy

# 4. (2 min) Pipeline completo: recolecta + analiza + persiste en research/audits/.
npm run research:audit -- --demo=fisio-buena-reputacion-mala-conversion

# 5. (30 s) Vuelve a ejecutar el mismo comando: comprueba la idempotencia.
npm run research:audit -- --demo=fisio-buena-reputacion-mala-conversion
# → "Archivos creados: 0 · actualizados: 0 · preservados: 13"

# 6. (2 min) Lee el informe ejecutivo generado.
cat src/saas-core/research/audits/fisioterapia-ficticia-avanza/reports/executive.md

# 7. (1 min) Salud del motor.
npm run research:doctor

# 8. (2 min) Enriquecer un Business Intent de Paso 11 con lo encontrado (sin sobrescribir).
npm run research:enrich-intent -- \
  --intent=src/saas-core/nl-builder/requests/clinica-de-fisioterapia-malaga/intent.json \
  --audit=src/saas-core/research/audits/fisioterapia-ficticia-avanza/audit.json

# 9. (1 min) Comparar dos auditorías (antes/después de una mejora).
npm run research:compare -- \
  --before=src/saas-core/research/audits/fisioterapia-ficticia-avanza/audit.json \
  --after=src/saas-core/research/audits/club-padel-ficticio-norte/audit.json
```

## De lenguaje natural a Business Intent a auditoría (ejemplo completo, sin API de IA)

Instrucción natural del usuario (ejemplo del enunciado):

> "Crear una solución SaaS para una clínica dental de Málaga, con tres
> odontólogos, agenda, pacientes, recordatorios, formularios, landing
> page, PWA y branding premium."

Traducción a día de hoy (Paso 11, modo determinista local — sin modelo de
lenguaje externo, contrato preparado en `nl-builder/aiProviderContract.js`
para cuando se conecte uno):

```bash
npm run business:from-prompt -- --prompt "Crear una solución SaaS para una clínica dental de Málaga, con tres odontólogos, agenda, pacientes, recordatorios, formularios, landing page, PWA y branding premium." --execute
```

...produce un `business.blueprint.json` + `intent.json`. Con Paso 12 se
audita ese MISMO negocio contra evidencia real/fixture:

```bash
npm run business:research -- --business-intent=<ruta al intent.json generado> --fixture=dental-branding-inconsistente
```

...y el resultado (`audit.json`) puede proponerse de vuelta como mejora
del Blueprint/Intent originales con `research:enrich-blueprint`/
`research:enrich-intent` — cerrando el ciclo Intent → Blueprint →
Auditoría → Enriquecimiento, sin sobrescribir nada en el camino.

## Troubleshooting

- **"Error: debes indicar --request=... o --demo=... o --business-name+--sector"**
  → falta el mínimo para construir un Research Request; usa `--demo=<id>`
  para probar rápido (`research:doctor` no lista los ids; están en
  `src/saas-core/research/fixtures/demoFixtures.js`).
- **Colisión de archivos** → ya existe una auditoría con ese `auditId` no
  generada por este motor (o editada a mano); usa `--force` solo si
  quieres sobrescribirla deliberadamente.
- **Bloqueado por `--strict`** → hay contradicciones sin resolver; corre
  sin `--strict` para ver el detalle, o añade más fuentes para resolver
  la contradicción.
- **Score global "sin datos"** → no se declaró ninguna fuente
  (`--fixture`/`--url`/`--local-file`); es el comportamiento esperado, no
  un error.
