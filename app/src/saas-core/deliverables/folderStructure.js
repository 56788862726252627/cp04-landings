// App 3 · Prompt 1/6 — Estructura de carpetas (Google Drive, sin conectar).
//
// Define, como datos puros, el árbol de carpetas que la Agencia de IA
// usará en Google Drive el día que se conecte de verdad. Nada aquí toca
// la API de Drive: es la estructura que DriveSyncManager/driveAdapter
// consultarán para saber "en qué carpeta va esto", no una llamada real.

export const CP04_DRIVE_ROOT = "Agencia IA";

export const CP04_DRIVE_TOP_LEVEL_FOLDERS = Object.freeze(["Clientes", "Plantillas SaaS", "Club Pádel 04"]);

// Subcarpetas que cada proyecto/cliente tiene dentro de su propia
// carpeta — mismo orden que el enunciado, para que el manifiesto y la
// UI futura lo muestren igual.
export const CP04_PROJECT_SUBFOLDERS = Object.freeze([
  "Contratos",
  "PDFs",
  "Presentaciones",
  "Mockups",
  "Logos",
  "Iconos",
  "Fondos",
  "Marketing",
  "Informes",
  "Vídeos",
  "Documentación",
]);

function sanitizeSegment(segment) {
  return String(segment || "").trim().replace(/[\\/]+/g, "-");
}

/**
 * Construye la ruta lógica completa de un proyecto dentro del árbol de
 * Drive, sin crear nada — es una función pura, no hay E/S ni red.
 * @param {string} projectName - nombre del cliente/proyecto (p. ej. "Club Pádel 04").
 * @param {("Clientes"|"Plantillas SaaS"|"Club Pádel 04")} [topLevel] - carpeta de primer nivel; por defecto "Clientes".
 */
export function cp04BuildProjectFolderTree(projectName, topLevel = "Clientes") {
  const safeTop = CP04_DRIVE_TOP_LEVEL_FOLDERS.includes(topLevel) ? topLevel : "Clientes";
  const safeName = sanitizeSegment(projectName) || "Proyecto sin nombre";
  const rootPath = [CP04_DRIVE_ROOT, safeTop, safeName];
  return {
    projectName: safeName,
    topLevel: safeTop,
    rootPath: rootPath.join("/"),
    folders: CP04_PROJECT_SUBFOLDERS.map((sub) => ({
      name: sub,
      path: [...rootPath, sub].join("/"),
    })),
  };
}

/** Valida que un árbol ya construido (o recibido de un mock/fixture) tenga exactamente las 11 subcarpetas esperadas, en el orden correcto. */
export function cp04ValidateFolderTree(tree) {
  const errors = [];
  if (!tree || typeof tree !== "object") return { valid: false, errors: ["árbol ausente o no es un objeto"] };
  if (!Array.isArray(tree.folders)) {
    errors.push("falta 'folders' o no es un array");
  } else {
    const names = tree.folders.map((f) => f?.name);
    CP04_PROJECT_SUBFOLDERS.forEach((expected, idx) => {
      if (names[idx] !== expected) errors.push(`posición ${idx}: se esperaba "${expected}", se encontró "${names[idx] ?? "(ausente)"}"`);
    });
  }
  return { valid: errors.length === 0, errors };
}

/** Devuelve la ruta de carpeta correspondiente a un tipo de entregable (ver deliverablesCatalog.js), dentro de un árbol ya construido. */
export function cp04ResolveFolderForDeliverable(tree, folderName) {
  if (!tree || !Array.isArray(tree.folders)) return null;
  return tree.folders.find((f) => f.name === folderName) || null;
}
