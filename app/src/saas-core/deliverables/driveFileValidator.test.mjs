import { test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import {
  CP04_DRIVE_ALLOWED_TYPES,
  cp04GetDriveMaxFileSizeBytes,
  cp04ValidateDriveFileType,
  cp04SanitizeDriveFileName,
  cp04IsSafeDriveFolderPath,
  cp04ComputeDriveFileHash,
  cp04ValidateDriveUpload,
} from "./driveFileValidator.js";

test("CP04_DRIVE_ALLOWED_TYPES cubre los 15 tipos pedidos, + html (necesario para integrar con exportPackageManager.js real, Fase 10)", () => {
  const expected = ["pdf", "png", "jpg", "jpeg", "webp", "svg", "mp4", "zip", "json", "csv", "xlsx", "docx", "pptx", "txt", "md", "html"];
  for (const ext of expected) assert.ok(CP04_DRIVE_ALLOWED_TYPES[ext], `falta el tipo .${ext}`);
  assert.equal(Object.keys(CP04_DRIVE_ALLOWED_TYPES).length, expected.length);
});

test("cp04ValidateDriveFileType: acepta cada extensión permitida con su MIME canónico", () => {
  for (const [ext, mime] of Object.entries(CP04_DRIVE_ALLOWED_TYPES)) {
    const result = cp04ValidateDriveFileType(`archivo.${ext}`);
    assert.equal(result.valid, true, `.${ext} debería ser válido`);
    assert.equal(result.mime, mime);
  }
});

test("cp04ValidateDriveFileType: rechaza extensión no permitida", () => {
  const result = cp04ValidateDriveFileType("script.exe");
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /no permitida/);
});

test("cp04ValidateDriveFileType: rechaza archivo sin extensión", () => {
  const result = cp04ValidateDriveFileType("sin-extension");
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /sin extensión|no tiene extensión/);
});

test("cp04ValidateDriveFileType: MIME declarado que no coincide con la extensión se reporta como error", () => {
  const result = cp04ValidateDriveFileType("imagen.png", "application/pdf");
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /no coincide/);
});

test("cp04ValidateDriveFileType: MIME declarado correcto no genera error", () => {
  const result = cp04ValidateDriveFileType("imagen.png", "image/png");
  assert.equal(result.valid, true);
});

test("cp04SanitizeDriveFileName: elimina separadores de ruta (evita path traversal vía nombre)", () => {
  assert.equal(cp04SanitizeDriveFileName("../../etc/passwd.txt"), "passwd.txt");
  assert.equal(cp04SanitizeDriveFileName("carpeta/otra/archivo.pdf"), "archivo.pdf");
});

test("cp04SanitizeDriveFileName: nombre vacío cae a un nombre seguro por defecto", () => {
  assert.equal(cp04SanitizeDriveFileName(""), "archivo-sin-nombre");
  assert.equal(cp04SanitizeDriveFileName("   "), "archivo-sin-nombre");
});

test("cp04SanitizeDriveFileName: recorta nombres extremadamente largos preservando la extensión", () => {
  const long = "a".repeat(500) + ".pdf";
  const safe = cp04SanitizeDriveFileName(long);
  assert.ok(safe.length <= 200);
  assert.match(safe, /\.pdf$/);
});

test("cp04IsSafeDriveFolderPath: rechaza '..' y segmentos vacíos, acepta rutas normales", () => {
  assert.equal(cp04IsSafeDriveFolderPath("Club Pádel 04/Mockups"), true);
  assert.equal(cp04IsSafeDriveFolderPath("../fuera"), false);
  assert.equal(cp04IsSafeDriveFolderPath("Club Pádel 04/../otro"), false);
  assert.equal(cp04IsSafeDriveFolderPath(""), false);
  assert.equal(cp04IsSafeDriveFolderPath("Club Pádel 04//Mockups"), false);
});

test("cp04ComputeDriveFileHash: determinista y sensible al contenido", () => {
  const h1 = cp04ComputeDriveFileHash(Buffer.from("contenido"));
  const h2 = cp04ComputeDriveFileHash(Buffer.from("contenido"));
  const h3 = cp04ComputeDriveFileHash(Buffer.from("otro contenido"));
  assert.equal(h1, h2);
  assert.notEqual(h1, h3);
});

test("cp04GetDriveMaxFileSizeBytes: usa el valor de env si es válido, si no cae a un valor por defecto seguro", () => {
  assert.equal(cp04GetDriveMaxFileSizeBytes({ GOOGLE_DRIVE_MAX_FILE_SIZE_MB: "10" }), 10 * 1024 * 1024);
  assert.ok(cp04GetDriveMaxFileSizeBytes({ GOOGLE_DRIVE_MAX_FILE_SIZE_MB: "0" }) > 0);
  assert.ok(cp04GetDriveMaxFileSizeBytes({ GOOGLE_DRIVE_MAX_FILE_SIZE_MB: "no-es-un-numero" }) > 0);
  assert.ok(cp04GetDriveMaxFileSizeBytes({}) > 0);
});

test("cp04ValidateDriveUpload: caso válido completo devuelve metadata lista para el adaptador", () => {
  const result = cp04ValidateDriveUpload({
    folderPath: "Club Pádel 04/Informes",
    fileName: "informe-julio.pdf",
    content: Buffer.from("contenido real del pdf"),
  });
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.safeName, "informe-julio.pdf");
  assert.equal(result.mime, "application/pdf");
  assert.ok(result.metadata);
  assert.equal(result.metadata.checksum, result.checksum);
});

test("cp04ValidateDriveUpload: archivo vacío es rechazado", () => {
  const result = cp04ValidateDriveUpload({ folderPath: "X/Y", fileName: "vacio.txt", content: Buffer.alloc(0) });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => /vacío/.test(e)));
  assert.equal(result.metadata, null);
});

test("cp04ValidateDriveUpload: tipo no permitido es rechazado", () => {
  const result = cp04ValidateDriveUpload({ folderPath: "X/Y", fileName: "virus.exe", content: Buffer.from("x") });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => /no permitida/.test(e)));
});

test("cp04ValidateDriveUpload: archivo que supera el límite de tamaño configurado es rechazado", () => {
  const result = cp04ValidateDriveUpload({
    folderPath: "X/Y",
    fileName: "grande.pdf",
    content: Buffer.alloc(100),
    maxSizeBytes: 50,
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => /supera el límite/.test(e)));
});

test("cp04ValidateDriveUpload: ruta de carpeta con path traversal es rechazada", () => {
  const result = cp04ValidateDriveUpload({ folderPath: "../fuera", fileName: "a.pdf", content: Buffer.from("x") });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => /ruta de carpeta insegura/.test(e)));
});

test("cp04ValidateDriveUpload: nombre con traversal se sanea igualmente aunque el resto sea válido", () => {
  const result = cp04ValidateDriveUpload({
    folderPath: "Club Pádel 04/Informes",
    fileName: "../../fuera/informe.pdf",
    content: Buffer.from("contenido"),
  });
  assert.equal(result.valid, true);
  assert.equal(result.safeName, "informe.pdf");
});
