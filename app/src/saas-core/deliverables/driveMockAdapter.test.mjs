import { test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { cp04CreateMockDriveAdapter } from "./driveMockAdapter.js";

test("createFolder: idempotente — llamarlo dos veces con la misma ruta devuelve el mismo folderId", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const first = await adapter.createFolder("Club Pádel 04/Mockups");
  const second = await adapter.createFolder("Club Pádel 04/Mockups");
  assert.equal(first.status, "completed");
  assert.equal(second.status, "completed");
  assert.equal(first.folderId, second.folderId);
});

test("uploadFile: sube un archivo nuevo, devuelve fileId y checksum ficticios pero deterministas por contenido", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const result = await adapter.uploadFile("Club Pádel 04/PDF", "informe.pdf", Buffer.from("contenido"));
  assert.equal(result.status, "completed");
  assert.ok(result.fileId.startsWith("mock-file-"));
  assert.ok(result.checksum);
});

test("uploadFile: mismo nombre y mismo contenido ⇒ skipped_duplicate (no crea una segunda entrada)", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const content = Buffer.from("igual");
  const first = await adapter.uploadFile("X", "a.txt", content);
  const second = await adapter.uploadFile("X", "a.txt", content);
  assert.equal(second.status, "skipped_duplicate");
  assert.equal(second.fileId, first.fileId);
});

test("uploadFile: mismo nombre, contenido distinto ⇒ updated, mismo fileId, nueva versión registrada", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const first = await adapter.uploadFile("X", "a.txt", Buffer.from("v1"));
  const second = await adapter.uploadFile("X", "a.txt", Buffer.from("v2"));
  assert.equal(second.status, "updated");
  assert.equal(second.fileId, first.fileId);
  assert.equal(adapter._debugState().files.find((f) => f.id === first.fileId).versions, 1);
});

test("listFolder: carpeta inexistente ⇒ not_found; carpeta creada sin archivos ⇒ lista vacía; con archivos ⇒ los lista", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  assert.equal((await adapter.listFolder("No Existe")).status, "not_found");

  await adapter.createFolder("X");
  const empty = await adapter.listFolder("X");
  assert.equal(empty.status, "completed");
  assert.deepEqual(empty.files, []);

  await adapter.uploadFile("X", "a.txt", Buffer.from("1"));
  await adapter.uploadFile("X", "b.txt", Buffer.from("2"));
  const withFiles = await adapter.listFolder("X");
  assert.equal(withFiles.files.length, 2);
});

test("findFile: found:true/false coherente con lo subido", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  await adapter.uploadFile("X", "a.txt", Buffer.from("1"));
  assert.equal((await adapter.findFile("X", "a.txt")).found, true);
  assert.equal((await adapter.findFile("X", "no-existe.txt")).found, false);
});

test("updateFile: not_found si el archivo no existe; actualiza si existe (mismo contrato que el adaptador real)", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const notFound = await adapter.updateFile("X", "no-existe.txt", Buffer.from("1"));
  assert.equal(notFound.status, "not_found");

  await adapter.uploadFile("X", "a.txt", Buffer.from("v1"));
  const updated = await adapter.updateFile("X", "a.txt", Buffer.from("v2"));
  assert.equal(updated.status, "updated");
});

test("downloadFile: devuelve el mismo contenido subido; fileId inexistente ⇒ not_found", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const upload = await adapter.uploadFile("X", "a.txt", Buffer.from("contenido real"));
  const download = await adapter.downloadFile(upload.fileId);
  assert.equal(download.status, "completed");
  assert.equal(download.content.toString("utf8"), "contenido real");

  assert.equal((await adapter.downloadFile("no-existe")).status, "not_found");
});

test("getMetadata / getLink: devuelven un enlace ficticio pero con formato de URL válido, nunca un dominio real de Google", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const upload = await adapter.uploadFile("X", "a.txt", Buffer.from("1"));
  const meta = await adapter.getMetadata(upload.fileId);
  assert.equal(meta.status, "completed");
  assert.match(meta.metadata.webViewLink, /^https:\/\/drive\.mock\.cp04\.local\//);

  const link = await adapter.getLink(upload.fileId);
  assert.equal(link.status, "completed");
  assert.match(link.link, /^https:\/\/drive\.mock\.cp04\.local\//);
  assert.equal(link.link.includes("google.com"), false);
});

test("deleteFile: SIN authorize:true nunca borra; CON authorize:true borra de verdad (deja de listarse/encontrarse)", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const upload = await adapter.uploadFile("X", "a.txt", Buffer.from("1"));

  const blocked = await adapter.deleteFile(upload.fileId);
  assert.equal(blocked.status, "authorization_required");
  assert.equal((await adapter.findFile("X", "a.txt")).found, true);

  const deleted = await adapter.deleteFile(upload.fileId, { authorize: true });
  assert.equal(deleted.status, "deleted");
  assert.equal((await adapter.findFile("X", "a.txt")).found, false);
  assert.equal((await adapter.getMetadata(upload.fileId)).status, "not_found");
});

test("simulateError: permite forzar cualquier error (cuota excedida, token expirado, permisos, red) sin servidor real", async () => {
  const adapter = cp04CreateMockDriveAdapter({
    simulateError: (action) => {
      if (action === "uploadFile") return { status: "failed", classification: "rate_limited", reason: "cuota simulada excedida" };
      return null;
    },
  });
  const result = await adapter.uploadFile("X", "a.txt", Buffer.from("1"));
  assert.equal(result.status, "failed");
  assert.equal(result.classification, "rate_limited");

  // Otras acciones no forzadas siguen funcionando con normalidad.
  const create = await adapter.createFolder("Y");
  assert.equal(create.status, "completed");
});

test("contrato completo: el mock expone exactamente los mismos 9 métodos que el adaptador real/not_configured", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const expectedMethods = ["createFolder", "uploadFile", "listFolder", "findFile", "updateFile", "downloadFile", "getMetadata", "getLink", "deleteFile"];
  for (const method of expectedMethods) assert.equal(typeof adapter[method], "function", `falta el método ${method}`);
});
