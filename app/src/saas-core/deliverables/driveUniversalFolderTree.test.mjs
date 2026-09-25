import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CP04_DRIVE_UNIVERSAL_ROOTS,
  CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04,
  CP04_DRIVE_UNIVERSAL_AGENCIA_IA,
  CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04_SUBFOLDERS,
  CP04_DRIVE_UNIVERSAL_AGENCIA_IA_SUBFOLDERS,
  CP04_DRIVE_UNIVERSAL_PLANTILLAS_SAAS_SECTORS,
  cp04BuildDriveUniversalTree,
  cp04BuildDriveUniversalPlantillasSaasTree,
  cp04ValidateDriveUniversalTree,
  cp04ValidateDriveUniversalPlantillasSaasTree,
  cp04BuildDriveUniversalCreationPlan,
  cp04ResolveDriveUniversalFolder,
  cp04ResolveDriveUniversalSaasSector,
} from "./driveUniversalFolderTree.js";

test("CP04_DRIVE_UNIVERSAL_ROOTS declara los 3 roots pedidos, en orden", () => {
  assert.deepEqual(CP04_DRIVE_UNIVERSAL_ROOTS, ["Club Pádel 04", "Agencia IA", "Plantillas SaaS"]);
});

test("cp04BuildDriveUniversalTree('Club Pádel 04'): 12 subcarpetas exactas, con Exportaciones y Backups", () => {
  const tree = cp04BuildDriveUniversalTree(CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04);
  assert.equal(tree.folders.length, 12);
  assert.deepEqual(tree.folders.map((f) => f.name), CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04_SUBFOLDERS);
  assert.equal(tree.rootPath, "Club Pádel 04");
  assert.equal(tree.folders.find((f) => f.name === "Backups").path, "Club Pádel 04/Backups");
});

test("cp04BuildDriveUniversalTree('Agencia IA'): 11 subcarpetas exactas, con Plantillas SaaS/Casos de Uso/Diagnósticos", () => {
  const tree = cp04BuildDriveUniversalTree(CP04_DRIVE_UNIVERSAL_AGENCIA_IA);
  assert.equal(tree.folders.length, 11);
  assert.deepEqual(tree.folders.map((f) => f.name), CP04_DRIVE_UNIVERSAL_AGENCIA_IA_SUBFOLDERS);
});

test("cp04BuildDriveUniversalTree: root desconocido lanza un error claro", () => {
  assert.throws(() => cp04BuildDriveUniversalTree("Root Inventado"), /desconocido/);
});

test("cp04BuildDriveUniversalPlantillasSaasTree: 7 sectores exactos, en el orden pedido", () => {
  const tree = cp04BuildDriveUniversalPlantillasSaasTree();
  assert.equal(tree.sectors.length, 7);
  assert.deepEqual(tree.sectors.map((s) => s.name), CP04_DRIVE_UNIVERSAL_PLANTILLAS_SAAS_SECTORS);
  assert.equal(tree.sectors[0].path, "Plantillas SaaS/Clubes Deportivos");
});

test("cp04ValidateDriveUniversalTree: válida los árboles bien construidos y detecta uno manipulado", () => {
  const good = cp04BuildDriveUniversalTree(CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04);
  assert.equal(cp04ValidateDriveUniversalTree(good, CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04).valid, true);

  const broken = { folders: [{ name: "Mockups" }] };
  const result = cp04ValidateDriveUniversalTree(broken, CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04);
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test("cp04ValidateDriveUniversalPlantillasSaasTree: válida el árbol de sectores real", () => {
  const tree = cp04BuildDriveUniversalPlantillasSaasTree();
  assert.equal(cp04ValidateDriveUniversalPlantillasSaasTree(tree).valid, true);
  assert.equal(cp04ValidateDriveUniversalPlantillasSaasTree({ sectors: [] }).valid, false);
});

test("cp04BuildDriveUniversalCreationPlan: roots antes que sus subcarpetas (orden padre→hijo, idempotencia real)", () => {
  const plan = cp04BuildDriveUniversalCreationPlan();
  const rootIdx = plan.indexOf("Club Pádel 04");
  const childIdx = plan.indexOf("Club Pádel 04/Mockups");
  assert.ok(rootIdx >= 0 && childIdx > rootIdx);
  // 3 roots + 12 + 11 + 7 subcarpetas.
  assert.equal(plan.length, 3 + 12 + 11 + 7);
  // Sin duplicados — cada ruta aparece una sola vez.
  assert.equal(new Set(plan).size, plan.length);
});

test("cp04ResolveDriveUniversalFolder / cp04ResolveDriveUniversalSaasSector: resuelven por nombre, null si no existe", () => {
  const tree = cp04BuildDriveUniversalTree(CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04);
  assert.equal(cp04ResolveDriveUniversalFolder(tree, "Iconos").path, "Club Pádel 04/Iconos");
  assert.equal(cp04ResolveDriveUniversalFolder(tree, "No Existe"), null);

  const saas = cp04BuildDriveUniversalPlantillasSaasTree();
  assert.equal(cp04ResolveDriveUniversalSaasSector(saas, "Fisioterapia").path, "Plantillas SaaS/Fisioterapia");
  assert.equal(cp04ResolveDriveUniversalSaasSector(saas, "No Existe"), null);
});
