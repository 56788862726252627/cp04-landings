// Resolución de rutas del repo compartida por los loaders — un solo sitio
// que sabe que src/config/ está dos niveles por debajo de la raíz del repo.
import { fileURLToPath } from "node:url";
import path from "node:path";

export const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

export function repoPath(...segments) {
  return path.join(APP_ROOT, ...segments);
}
