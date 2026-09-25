import { test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { cp04CreateMockDriveAdapter } from "./driveMockAdapter.js";
import { cp04CreateNotConfiguredDriveAdapter } from "./driveAdapter.js";
import {
  CP04_DRIVE_DUPLICATE_STRATEGIES,
  cp04BuildVersionedFileName,
  cp04ResolveDriveDuplicateUpload,
} from "./driveDuplicateStrategy.js";

test("CP04_DRIVE_DUPLICATE_STRATEGIES declara las 5 estrategias pedidas", () => {
  assert.deepEqual([...CP04_DRIVE_DUPLICATE_STRATEGIES].sort(), ["overwrite", "reject", "rename", "reuse", "version"]);
});

test("cp04BuildVersionedFileName: determinista por contenido — mismo checksum, mismo nombre siempre", () => {
  const a = cp04BuildVersionedFileName("informe.pdf", "abcdef1234567890");
  const b = cp04BuildVersionedFileName("informe.pdf", "abcdef1234567890");
  const c = cp04BuildVersionedFileName("informe.pdf", "00000000ffffffff");
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.match(a, /^informe \(abcdef12\)\.pdf$/);
});

test("estrategia desconocida lanza TypeError con la lista de válidas", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  await assert.rejects(
    () => cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("1"), strategy: "borrar-todo" }),
    /desconocida/
  );
});

test("sin conflicto (archivo no existe): sube con normalidad, cualquiera sea la estrategia", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const result = await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "nuevo.txt", content: Buffer.from("1"), strategy: "reject" });
  assert.equal(result.status, "completed");
});

test("mismo contenido exacto (no es un conflicto real): skipped_duplicate, cualquiera sea la estrategia", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const content = Buffer.from("igual");
  await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content });
  const second = await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content, strategy: "overwrite" });
  assert.equal(second.status, "skipped_duplicate");
});

test("estrategia por defecto ('reuse') ante un conflicto real: no sobrescribe, no destructiva", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v1") });
  const result = await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v2") });
  assert.equal(result.status, "kept_existing");
  // El contenido remoto NO cambió — sigue siendo v1.
  const found = await adapter.findFile("X", "a.txt");
  const download = await adapter.downloadFile(found.file.id);
  assert.equal(download.content.toString("utf8"), "v1");
});

test("estrategia 'reject': ante un conflicto real, rejected_duplicate explícito", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v1") });
  const result = await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v2"), strategy: "reject" });
  assert.equal(result.status, "rejected_duplicate");
});

test("estrategia 'version': sube con un nombre versionado, conserva el original intacto", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v1") });
  const result = await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v2"), strategy: "version" });
  assert.equal(result.status, "versioned");
  assert.notEqual(result.fileName, "a.txt");

  const original = await adapter.findFile("X", "a.txt");
  assert.equal(original.found, true);
  const versioned = await adapter.findFile("X", result.fileName);
  assert.equal(versioned.found, true);
});

test("estrategia 'rename': igual que 'version' pero con status 'renamed_uploaded'", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v1") });
  const result = await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v2"), strategy: "rename" });
  assert.equal(result.status, "renamed_uploaded");
});

test("estrategia 'overwrite' SIN authorizeOverwrite: nunca sobrescribe", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v1") });
  const result = await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v2"), strategy: "overwrite" });
  assert.equal(result.status, "overwrite_not_authorized");
  const found = await adapter.findFile("X", "a.txt");
  const download = await adapter.downloadFile(found.file.id);
  assert.equal(download.content.toString("utf8"), "v1");
});

test("estrategia 'overwrite' CON authorizeOverwrite:true: sobrescribe de verdad", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v1") });
  const result = await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v2"), strategy: "overwrite", authorizeOverwrite: true });
  assert.equal(result.status, "updated");
  const found = await adapter.findFile("X", "a.txt");
  const download = await adapter.downloadFile(found.file.id);
  assert.equal(download.content.toString("utf8"), "v2");
});

test("propaga sin reinterpretar el status de un adaptador not_configured/dry_run", async () => {
  const adapter = cp04CreateNotConfiguredDriveAdapter({});
  const result = await cp04ResolveDriveDuplicateUpload(adapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("v1") });
  assert.equal(result.status, "not_configured");
});

test("funciona igual con el adaptador real (appProperties.cp04Checksum) que con el mock (checksum directo)", async () => {
  // Simula la forma que devuelve driveRealAdapter.findFile() para el checksum existente.
  const realShapedAdapter = {
    async findFile() {
      return { status: "completed", found: true, file: { id: "file_1", appProperties: { cp04Checksum: "checksum-viejo" } } };
    },
    async uploadFile(folderPath, fileName) {
      return { status: "updated", fileId: "file_1", fileName };
    },
  };
  const result = await cp04ResolveDriveDuplicateUpload(realShapedAdapter, { folderPath: "X", fileName: "a.txt", content: Buffer.from("contenido nuevo"), strategy: "overwrite", authorizeOverwrite: true });
  assert.equal(result.status, "updated");
});
