import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm, readFile, readdir, writeFile } from "node:fs/promises";
import { cp04GenerateManifest, cp04ValidateManifest, cp04DiffManifests, cp04WriteManifestAtomic } from "./manifestGenerator.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-manifest-atomic-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const SAMPLE_ENTRIES = [
  { id: "a1", deliverableType: "logotipo", format: "SVG", content: "<svg>1</svg>", path: "Agencia IA/Clientes/X/Logos/a1.svg" },
  { id: "a2", deliverableType: "contrato", format: "markdown", content: "# Contrato" },
];

test("cp04GenerateManifest exige meta.projectId y un array de entries", () => {
  assert.throws(() => cp04GenerateManifest(SAMPLE_ENTRIES, {}), TypeError);
  assert.throws(() => cp04GenerateManifest(null, { projectId: "p1" }), TypeError);
});

test("cp04GenerateManifest produce un item por entry, con checksum determinista y formato normalizado", () => {
  const manifest = cp04GenerateManifest(SAMPLE_ENTRIES, { projectId: "p1", projectName: "Cliente X" });
  assert.equal(manifest.itemCount, 2);
  assert.equal(manifest.items[0].format, "svg");
  assert.ok(manifest.items[0].checksum);
  assert.equal(manifest.items[0].checksum.length, 64, "sha256 en hex son 64 caracteres");
});

test("el checksum es determinista: el mismo contenido produce siempre el mismo checksum", () => {
  const m1 = cp04GenerateManifest(SAMPLE_ENTRIES, { projectId: "p1" });
  const m2 = cp04GenerateManifest(SAMPLE_ENTRIES, { projectId: "p1" });
  assert.equal(m1.items[0].checksum, m2.items[0].checksum);
});

test("un contenido distinto produce un checksum distinto", () => {
  const m1 = cp04GenerateManifest([{ id: "a", deliverableType: "logotipo", format: "svg", content: "A" }], { projectId: "p1" });
  const m2 = cp04GenerateManifest([{ id: "a", deliverableType: "logotipo", format: "svg", content: "B" }], { projectId: "p1" });
  assert.notEqual(m1.items[0].checksum, m2.items[0].checksum);
});

test("cp04ValidateManifest acepta un manifiesto bien formado", () => {
  const manifest = cp04GenerateManifest(SAMPLE_ENTRIES, { projectId: "p1" });
  assert.deepEqual(cp04ValidateManifest(manifest), { valid: true, errors: [] });
});

test("cp04ValidateManifest nunca lanza y detecta un manifiesto corrupto", () => {
  assert.equal(cp04ValidateManifest(null).valid, false);
  assert.equal(cp04ValidateManifest({}).valid, false);
  assert.equal(cp04ValidateManifest({ manifestVersion: 1, projectId: "p1", itemCount: 5, items: [] }).valid, false);
});

test("cp04DiffManifests detecta añadidos, cambiados y eliminados entre dos versiones", () => {
  const v1 = cp04GenerateManifest([{ id: "a", deliverableType: "logotipo", format: "svg", content: "v1" }], { projectId: "p1" });
  const v2 = cp04GenerateManifest(
    [
      { id: "a", deliverableType: "logotipo", format: "svg", content: "v2" }, // cambiado
      { id: "b", deliverableType: "icono", format: "svg", content: "nuevo" }, // añadido
    ],
    { projectId: "p1" }
  );
  const diff = cp04DiffManifests(v1, v2);
  assert.equal(diff.added.length, 1);
  assert.equal(diff.added[0].id, "b");
  assert.equal(diff.changed.length, 1);
  assert.equal(diff.changed[0].id, "a");
  assert.equal(diff.removed.length, 0);
});

test("cp04DiffManifests con el segundo manifiesto vacío detecta que todo se eliminó", () => {
  const v1 = cp04GenerateManifest(SAMPLE_ENTRIES, { projectId: "p1" });
  const diff = cp04DiffManifests(v1, { items: [] });
  assert.equal(diff.removed.length, 2);
  assert.equal(diff.added.length, 0);
});

test("Prompt 3.5 · cp04WriteManifestAtomic escribe el contenido exacto en el destino final", async () => {
  await withTempDir(async (dir) => {
    const target = path.join(dir, "manifest.json");
    await cp04WriteManifestAtomic(target, '{"version":1}');
    const onDisk = await readFile(target, "utf8");
    assert.equal(onDisk, '{"version":1}');
  });
});

test("Prompt 3.5 · cp04WriteManifestAtomic no deja ningún archivo temporal residual tras un éxito", async () => {
  await withTempDir(async (dir) => {
    const target = path.join(dir, "manifest.json");
    await cp04WriteManifestAtomic(target, '{"version":1}');
    const files = await readdir(dir);
    assert.deepEqual(files, ["manifest.json"], "no debería quedar ningún .tmp-* en el directorio");
  });
});

test("Prompt 3.5 · cp04WriteManifestAtomic sobrescribe por completo el contenido anterior (nunca mezcla)", async () => {
  await withTempDir(async (dir) => {
    const target = path.join(dir, "manifest.json");
    await cp04WriteManifestAtomic(target, "contenido largo original con mucho texto de relleno");
    await cp04WriteManifestAtomic(target, "corto");
    const onDisk = await readFile(target, "utf8");
    assert.equal(onDisk, "corto", "rename() reemplaza el archivo entero, no puede quedar basura del contenido anterior más largo");
  });
});

test("Prompt 3.5 · cp04WriteManifestAtomic: si el directorio destino no existe, falla sin dejar temporales huérfanos ni tocar nada", async () => {
  await withTempDir(async (dir) => {
    const target = path.join(dir, "no-existe", "manifest.json");
    await assert.rejects(() => cp04WriteManifestAtomic(target, "x"));
    const files = await readdir(dir);
    assert.deepEqual(files, [], "ningún archivo temporal debería sobrevivir en el directorio padre tras el fallo");
  });
});

test("Prompt 3.5 · cp04WriteManifestAtomic: un archivo previo válido nunca queda en un estado a medias (simulación de escritura completa o nula)", async () => {
  await withTempDir(async (dir) => {
    const target = path.join(dir, "manifest.json");
    await writeFile(target, '{"version":1,"items":["a","b","c"]}', "utf8");
    await cp04WriteManifestAtomic(target, '{"version":2,"items":["a","b","c","d"]}');
    const onDisk = JSON.parse(await readFile(target, "utf8"));
    assert.equal(onDisk.version, 2);
    assert.equal(onDisk.items.length, 4);
  });
});
