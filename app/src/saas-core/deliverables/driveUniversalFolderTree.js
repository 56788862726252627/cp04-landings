// Prompt 4B · Fase 4 — Árbol de carpetas UNIVERSAL de Google Drive.
//
// Módulo NUEVO y aditivo: `folderStructure.js` ya define 3 árboles
// distintos (uno genérico de 11 subcarpetas usado por
// `exportPackageManager.js` para el empaquetado LOCAL, y dos fijos para
// Drive con una jerarquía "Agencia IA" como único root). Este módulo
// define la jerarquía EXACTA pedida en Prompt 4B: 3 roots
// INDEPENDIENTES ("Club Pádel 04", "Agencia IA", "Plantillas SaaS")
// directamente bajo la carpeta raíz de Drive — deliberadamente NO
// sustituye nada existente, para no romper los 3 árboles ya probados
// (folderStructure.test.mjs) ni la lógica de `exportPackageManager.js`
// que depende de ellos.
//
// Todo aquí es DATOS PUROS + funciones sin E/S — igual que
// `folderStructure.js`. La creación real (idempotente, vía
// `adapter.createFolder`) vive en `driveExportSync.js` (Fase 10).

export const CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04 = "Club Pádel 04";
export const CP04_DRIVE_UNIVERSAL_AGENCIA_IA = "Agencia IA";
export const CP04_DRIVE_UNIVERSAL_PLANTILLAS_SAAS = "Plantillas SaaS";

export const CP04_DRIVE_UNIVERSAL_ROOTS = Object.freeze([
  CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04,
  CP04_DRIVE_UNIVERSAL_AGENCIA_IA,
  CP04_DRIVE_UNIVERSAL_PLANTILLAS_SAAS,
]);

export const CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04_SUBFOLDERS = Object.freeze([
  "Mockups",
  "PDF",
  "Imágenes",
  "Vídeos",
  "Logos",
  "Iconos",
  "Fondos",
  "Informes",
  "Auditorías",
  "Material Comercial",
  "Exportaciones",
  "Backups",
]);

export const CP04_DRIVE_UNIVERSAL_AGENCIA_IA_SUBFOLDERS = Object.freeze([
  "Mockups",
  "PDF",
  "Imágenes",
  "Vídeos",
  "Logos",
  "Informes",
  "Auditorías",
  "Material Comercial",
  "Plantillas SaaS",
  "Casos de Uso",
  "Diagnósticos",
]);

export const CP04_DRIVE_UNIVERSAL_PLANTILLAS_SAAS_SECTORS = Object.freeze([
  "Clubes Deportivos",
  "Clínicas",
  "Abogados",
  "Veterinarios",
  "Peluquerías",
  "Fisioterapia",
  "Otros Sectores",
]);

const SUBFOLDERS_BY_ROOT = Object.freeze({
  [CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04]: CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04_SUBFOLDERS,
  [CP04_DRIVE_UNIVERSAL_AGENCIA_IA]: CP04_DRIVE_UNIVERSAL_AGENCIA_IA_SUBFOLDERS,
});

/**
 * Árbol de un root "simple" (Club Pádel 04 / Agencia IA): 1 nivel de
 * subcarpetas fijas. Función pura, sin E/S.
 * @param {("Club Pádel 04"|"Agencia IA")} rootName
 */
export function cp04BuildDriveUniversalTree(rootName) {
  const subfolders = SUBFOLDERS_BY_ROOT[rootName];
  if (!subfolders) {
    throw new TypeError(`cp04BuildDriveUniversalTree: root desconocido "${rootName}" — se esperaba "${CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04}" o "${CP04_DRIVE_UNIVERSAL_AGENCIA_IA}"`);
  }
  return {
    root: rootName,
    rootPath: rootName,
    folders: subfolders.map((name) => ({ name, path: `${rootName}/${name}` })),
  };
}

/** Árbol de sectores de "Plantillas SaaS" — función pura, sin E/S. */
export function cp04BuildDriveUniversalPlantillasSaasTree() {
  return {
    root: CP04_DRIVE_UNIVERSAL_PLANTILLAS_SAAS,
    rootPath: CP04_DRIVE_UNIVERSAL_PLANTILLAS_SAAS,
    sectors: CP04_DRIVE_UNIVERSAL_PLANTILLAS_SAAS_SECTORS.map((name) => ({ name, path: `${CP04_DRIVE_UNIVERSAL_PLANTILLAS_SAAS}/${name}` })),
  };
}

export function cp04ValidateDriveUniversalTree(tree, rootName) {
  const errors = [];
  const expected = SUBFOLDERS_BY_ROOT[rootName];
  if (!expected) return { valid: false, errors: [`root desconocido "${rootName}"`] };
  if (!tree || !Array.isArray(tree.folders)) {
    errors.push("falta 'folders' o no es un array");
  } else {
    const names = tree.folders.map((f) => f?.name);
    expected.forEach((name, idx) => {
      if (names[idx] !== name) errors.push(`posición ${idx}: se esperaba "${name}", se encontró "${names[idx] ?? "(ausente)"}"`);
    });
  }
  return { valid: errors.length === 0, errors };
}

export function cp04ValidateDriveUniversalPlantillasSaasTree(tree) {
  const errors = [];
  if (!tree || !Array.isArray(tree.sectors)) {
    errors.push("falta 'sectors' o no es un array");
  } else {
    const names = tree.sectors.map((s) => s?.name);
    CP04_DRIVE_UNIVERSAL_PLANTILLAS_SAAS_SECTORS.forEach((name, idx) => {
      if (names[idx] !== name) errors.push(`posición ${idx}: se esperaba "${name}", se encontró "${names[idx] ?? "(ausente)"}"`);
    });
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Plan de creación completo de los 3 roots + todas sus subcarpetas, en
 * orden PADRE→HIJO (imprescindible para crear idempotentemente: cada
 * subcarpeta necesita que su padre ya exista). Devuelve solo rutas —
 * quien lo consuma (`driveExportSync.js`) decide cómo y cuándo crearlas
 * de verdad, vía `adapter.createFolder(path)` (ya idempotente por
 * diseño: busca antes de crear).
 * @returns {string[]}
 */
export function cp04BuildDriveUniversalCreationPlan() {
  const plan = [];
  for (const root of CP04_DRIVE_UNIVERSAL_ROOTS) plan.push(root);
  for (const name of CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04_SUBFOLDERS) plan.push(`${CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04}/${name}`);
  for (const name of CP04_DRIVE_UNIVERSAL_AGENCIA_IA_SUBFOLDERS) plan.push(`${CP04_DRIVE_UNIVERSAL_AGENCIA_IA}/${name}`);
  for (const name of CP04_DRIVE_UNIVERSAL_PLANTILLAS_SAAS_SECTORS) plan.push(`${CP04_DRIVE_UNIVERSAL_PLANTILLAS_SAAS}/${name}`);
  return plan;
}

/** Resuelve, dentro de un árbol simple ya construido, la ruta de la subcarpeta pedida (o null si no existe). */
export function cp04ResolveDriveUniversalFolder(tree, folderName) {
  if (!tree || !Array.isArray(tree.folders)) return null;
  return tree.folders.find((f) => f.name === folderName) || null;
}

/** Resuelve, dentro del árbol de sectores, la ruta del sector pedido (o null si no existe). */
export function cp04ResolveDriveUniversalSaasSector(tree, sectorName) {
  if (!tree || !Array.isArray(tree.sectors)) return null;
  return tree.sectors.find((s) => s.name === sectorName) || null;
}
