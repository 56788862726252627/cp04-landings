# Agency CI Troubleshooting — ADV-02

## Secret scan blocks push

**Síntoma:** `remote: GITHUB PUSH PROTECTION` en `git push`.

**Causa:** El commit contiene un patrón `sk_live_`, `whsec_`, o `BEGIN PRIVATE KEY`.

**Solución:**
1. Localizar con: `grep -rn "sk_live_" app/ --include="*.js"`
2. Si es test: cambiar `sk_live_` → `sk_test_` (misma cobertura de redacción).
3. Si es config real: moverlo a variable de entorno.
4. Crear nuevo commit (no amend si ya hay commit anterior con el secreto).

## Test failure en CI pero no en local

**Síntoma:** CI reporta test failure, local pasa.

**Causa más probable:** El test usa estado mutable o depende de orden de ejecución.

**Solución:** Ejecutar igual que CI: `node --test fabrica-saas/generator/tests/*.test.mjs`.

## Pre-existing vitest failure

**Síntoma:** `v2-paso-a-gates.test.mjs` falla siempre.

**Causa:** El test importa `vitest` que no está instalado. Documentado como deuda técnica aceptada.

**Solución:** No arreglar. El TEST_GATE usa `preExistingFails: 1` para excluir este fallo.

## Build falla en CI pero no en local

**Causa probable:** node_modules en local difiere de `npm ci` limpio.

**Solución:** `rm -rf node_modules && npm ci && npm run build`.

## Quality gate BLOCKED con todos los checks verdes

**Causa:** `NOT_APPLICABLE` en SECRET_GATE se trata como blocking si `secretResult` no se pasa al evaluador.

**Solución:** Siempre pasar `secretResult` al `evaluateQualityGates()`.

## FUTURE_CP04 / FUTURE_TRADING integration

Cuando se active CI para CP04 o Trading Bot, añadir sus paths al `factory-ci.yml`:
```yaml
paths:
  - 'app/fabrica-saas/**'
  - 'app/src/**'        # ← ya incluido (CP04 vive aquí)
  # 'trading/**'        # ← añadir cuando Trading Bot esté en scope
```
