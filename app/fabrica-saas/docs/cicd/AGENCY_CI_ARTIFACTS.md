# Agency CI Artifacts — ADV-02

## Validación de artefactos de build

El `ARTIFACT_GATE` (P0) verifica que el output de `npm run build` sea correcto y seguro.

### Checks

| Check | Descripción |
|---|---|
| `dist_exists` | La carpeta `dist/` existe |
| `required:index.html` | `dist/index.html` presente |
| `required:assets` | Carpeta `dist/assets/` presente |
| `no_dev_files` | No hay `.map`, `node_modules`, `.env` en dist |
| `size_under_limit` | Tamaño < 50MB (warning > 10MB) |

### Bundle Budget por preset

| Preset | Warning/asset | Fail/asset | Total warning | Total fail |
|---|---|---|---|---|
| `FACTORY_DEFAULT` | 300KB | 500KB | 5MB | 15MB |
| `DENTAL` | 250KB | 400KB | 5MB | 10MB |
| `PHYSIO` | 250KB | 400KB | 5MB | 10MB |
| `EDUCA` | 400KB | 600KB | 10MB | 20MB |
| `AGENCY` | 500KB | 800KB | 15MB | 30MB |

### Uso sin filesystem

```js
import { validateArtifactFromList } from '../factory-registry/index.js';

const result = validateArtifactFromList(['index.html', 'assets/main.js', 'assets/main.css']);
// result.valid === true
```

### Uso con filesystem real

```js
import { validateBuildArtifact } from '../factory-registry/index.js';

const result = validateBuildArtifact('/path/to/dist');
// result.status === 'VALID' | 'WARNING' | 'INVALID'
```
