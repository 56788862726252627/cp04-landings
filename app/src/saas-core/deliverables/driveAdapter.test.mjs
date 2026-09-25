import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cp04IsDriveConfigured,
  cp04IsDriveSyncEnabled,
  cp04GetDriveRuntimeStatus,
  cp04CreateNotConfiguredDriveAdapter,
} from "./driveAdapter.js";

const FULL_CREDS = Object.freeze({
  GOOGLE_DRIVE_CLIENT_ID: "id",
  GOOGLE_DRIVE_CLIENT_SECRET: "secret",
  GOOGLE_DRIVE_REFRESH_TOKEN: "token",
});

test("cp04IsDriveConfigured es false si falta cualquiera de las 3 credenciales", () => {
  assert.equal(cp04IsDriveConfigured({}), false);
  assert.equal(cp04IsDriveConfigured({ GOOGLE_DRIVE_CLIENT_ID: "id" }), false);
  assert.equal(cp04IsDriveConfigured({ ...FULL_CREDS, GOOGLE_DRIVE_REFRESH_TOKEN: undefined }), false);
});

test("cp04IsDriveConfigured es true solo con las 3 credenciales presentes", () => {
  assert.equal(cp04IsDriveConfigured(FULL_CREDS), true);
});

test("cp04IsDriveSyncEnabled exige exactamente el string \"true\" (fail-closed ante cualquier otro valor)", () => {
  assert.equal(cp04IsDriveSyncEnabled({}), false);
  assert.equal(cp04IsDriveSyncEnabled({ CP04_DRIVE_SYNC_ENABLED: "false" }), false);
  assert.equal(cp04IsDriveSyncEnabled({ CP04_DRIVE_SYNC_ENABLED: "1" }), false);
  assert.equal(cp04IsDriveSyncEnabled({ CP04_DRIVE_SYNC_ENABLED: "TRUE" }), true);
  assert.equal(cp04IsDriveSyncEnabled({ CP04_DRIVE_SYNC_ENABLED: "true" }), true);
});

test("cp04GetDriveRuntimeStatus nunca expone las credenciales, solo booleanos", () => {
  const status = cp04GetDriveRuntimeStatus({ ...FULL_CREDS, CP04_DRIVE_SYNC_ENABLED: "true", GOOGLE_DRIVE_ROOT_FOLDER_ID: "abc123" });
  assert.deepEqual(status, { configured: true, syncEnabled: true, rootFolderConfigured: true });
  assert.equal(JSON.stringify(status).includes("secret"), false);
});

test("el adaptador por defecto (sin sync activado) responde not_configured en los 3 métodos, sin lanzar", async () => {
  const adapter = cp04CreateNotConfiguredDriveAdapter({});
  const createResult = await adapter.createFolder("Agencia IA/Clientes/X");
  const uploadResult = await adapter.uploadFile("Agencia IA/Clientes/X/Logos", "logo.svg", "<svg/>");
  const listResult = await adapter.listFolder("Agencia IA/Clientes/X");
  for (const result of [createResult, uploadResult, listResult]) {
    assert.equal(result.status, "not_configured");
    assert.ok(result.reason);
  }
});

test("el adaptador por defecto sigue en not_configured incluso con credenciales completas si CP04_DRIVE_SYNC_ENABLED no es \"true\"", async () => {
  const adapter = cp04CreateNotConfiguredDriveAdapter({ ...FULL_CREDS });
  const result = await adapter.uploadFile("X", "y.svg", "z");
  assert.equal(result.status, "not_configured");
  assert.match(result.reason, /CP04_DRIVE_SYNC_ENABLED/);
});

test("el mensaje de razón distingue entre 'sync desactivado' y 'faltan credenciales'", async () => {
  const withSyncOnNoCreds = cp04CreateNotConfiguredDriveAdapter({ CP04_DRIVE_SYNC_ENABLED: "true" });
  const result = await withSyncOnNoCreds.uploadFile("X", "y.svg", "z");
  assert.match(result.reason, /credenciales/);
});
