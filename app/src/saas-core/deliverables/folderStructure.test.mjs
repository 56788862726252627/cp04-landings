import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CP04_DRIVE_ROOT,
  CP04_DRIVE_TOP_LEVEL_FOLDERS,
  CP04_PROJECT_SUBFOLDERS,
  cp04BuildProjectFolderTree,
  cp04ValidateFolderTree,
  cp04ResolveFolderForDeliverable,
} from "./folderStructure.js";

test("la raíz y los 3 niveles superiores coinciden exactamente con el enunciado", () => {
  assert.equal(CP04_DRIVE_ROOT, "Agencia IA");
  assert.deepEqual(CP04_DRIVE_TOP_LEVEL_FOLDERS, ["Clientes", "Plantillas SaaS", "Club Pádel 04"]);
});

test("las 11 subcarpetas de proyecto coinciden exactamente con el enunciado, en el mismo orden", () => {
  assert.deepEqual(CP04_PROJECT_SUBFOLDERS, [
    "Contratos", "PDFs", "Presentaciones", "Mockups", "Logos", "Iconos", "Fondos", "Marketing", "Informes", "Vídeos", "Documentación",
  ]);
});

test("cp04BuildProjectFolderTree construye la ruta completa y las 11 subcarpetas para un cliente nuevo", () => {
  const tree = cp04BuildProjectFolderTree("Clínica Dental Sonrisas");
  assert.equal(tree.rootPath, "Agencia IA/Clientes/Clínica Dental Sonrisas");
  assert.equal(tree.folders.length, 11);
  assert.equal(tree.folders[0].path, "Agencia IA/Clientes/Clínica Dental Sonrisas/Contratos");
});

test("cp04BuildProjectFolderTree acepta 'Club Pádel 04' como nivel superior explícito (no siempre 'Clientes')", () => {
  const tree = cp04BuildProjectFolderTree("Club Pádel 04", "Club Pádel 04");
  assert.equal(tree.rootPath, "Agencia IA/Club Pádel 04/Club Pádel 04");
});

test("cp04BuildProjectFolderTree sanea segmentos de ruta (evita inyectar '/' en un nombre de proyecto)", () => {
  const tree = cp04BuildProjectFolderTree("Cliente/Malicioso");
  assert.equal(tree.projectName, "Cliente-Malicioso");
  assert.equal(tree.rootPath.split("/").length, 3);
});

test("cp04ValidateFolderTree acepta un árbol bien formado y rechaza uno con carpetas fuera de orden", () => {
  const good = cp04BuildProjectFolderTree("Proyecto X");
  assert.deepEqual(cp04ValidateFolderTree(good), { valid: true, errors: [] });

  const bad = { folders: [{ name: "Mockups" }, { name: "Contratos" }] };
  const result = cp04ValidateFolderTree(bad);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test("cp04ResolveFolderForDeliverable encuentra la carpeta correcta por nombre", () => {
  const tree = cp04BuildProjectFolderTree("Proyecto Y");
  const folder = cp04ResolveFolderForDeliverable(tree, "Presentaciones");
  assert.equal(folder.path, "Agencia IA/Clientes/Proyecto Y/Presentaciones");
  assert.equal(cp04ResolveFolderForDeliverable(tree, "NoExiste"), null);
});
