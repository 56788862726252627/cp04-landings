# AGENCY_REPRODUCIBLE_BUILD — Paso G

**Verificación de Build Reproducible y Determinista**

`validateReproducibleBuild(checks, metadata)` garantiza que el build sea predecible y auditable.

---

## Checks (8)

| ID | Check | Crítico |
|---|---|---|
| RB-01 | Lockfile presente (`package-lock.json` / `yarn.lock`) | ✅ |
| RB-02 | Versión de package manager fijada | ✅ |
| RB-03 | Versión de Node.js especificada (`.nvmrc` / `engines`) | ✅ |
| RB-04 | Comando de build documentado | ✅ |
| RB-05 | Output path documentado | ✅ |
| RB-06 | Sin asunciones de entorno en build script | No |
| RB-07 | Assets deterministas (sin timestamps en nombres) | No |
| RB-08 | Sin secrets inyectados en tiempo de build | ✅ |

---

## Outcomes

| Status | Descripción |
|---|---|
| `REPRODUCIBLE` | Todos los checks críticos pasan |
| `LIKELY_REPRODUCIBLE` | Checks críticos pasan, algunos opcionales no |
| `NON_DETERMINISTIC` | Al menos un crítico falla |
| `UNKNOWN` | Sin información suficiente para evaluar |

---

## Uso

```js
import { validateReproducibleBuild } from '../deploy/reproducibleBuild.js';

const checks = {
  'RB-01': true,  // package-lock.json presente
  'RB-02': true,  // npm version fijada en engines
  'RB-03': true,  // .nvmrc con Node 20
  'RB-04': true,  // "build": "vite build" en package.json
  'RB-05': true,  // outputDir: "dist"
  'RB-08': true,  // sin vite.config con env variables hardcodeadas
};

const r = validateReproducibleBuild(checks, {
  buildCommand: 'npm run build',
  outputDir: 'dist',
});
// r.status      → 'REPRODUCIBLE'
// r.lockfile    → true
```

---

## En la Práctica (Cloudflare Pages)

Cloudflare Pages guarda el build log y lo puede re-ejecutar. Para garantizar reproducibilidad:
1. `package-lock.json` en git (nunca en `.gitignore`)
2. `engines.node: ">=20"` en `package.json`
3. Sin `new Date()` ni `Math.random()` en nombres de assets

> Build reproducible = auditoría posible = rollback confiable.
