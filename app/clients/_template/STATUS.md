# STATUS — `<slug-cliente>`

Fuente única de verdad del ciclo de vida operativo de este cliente. Actualización manual, con fecha ISO.

## Estado actual

| Campo | Valor |
|---|---|
| Estado (`onboarding` / `activo` / `suspendido` / `baja`) | `onboarding` |
| `deploymentProfile` actual | `development` |
| Fecha de alta del perfil | `<fecha ISO>` |
| Fecha de último cambio de estado | `<fecha ISO>` |
| Responsable actual | `<nombre>` |

## Historial de transiciones

| Fecha | Estado anterior | Estado nuevo | Motivo | Responsable |
|---|---|---|---|---|
| `<fecha>` | — | `onboarding` | Alta de perfil | `<nombre>` |

## Qué NO hacer aquí

- No marcar `activo` sin que `QA_CHECKLIST.md` esté completo y `deploymentProfile` sea realmente `production`.
- No borrar filas del historial — el historial es evidencia de auditoría, se añade, no se reescribe.
