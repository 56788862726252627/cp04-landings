import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { cp04BuildReproducibleZip, cp04ListZipEntries } from "./packageZip.js";

function sha(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

test("cp04BuildReproducibleZip exige al menos 1 archivo", async () => {
  await assert.rejects(() => cp04BuildReproducibleZip([]));
  await assert.rejects(() => cp04BuildReproducibleZip(null));
});

test("cp04BuildReproducibleZip produce un ZIP real (firma PK) con todas las entradas", async () => {
  const buffer = await cp04BuildReproducibleZip([
    { path: "a.txt", content: Buffer.from("a") },
    { path: "carpeta/b.txt", content: Buffer.from("b") },
  ]);
  assert.equal(buffer.subarray(0, 2).toString("hex"), "504b");
  const entries = await cp04ListZipEntries(buffer);
  assert.deepEqual(entries, ["a.txt", "carpeta/b.txt"]);
});

test("cp04BuildReproducibleZip es reproducible byte a byte: mismo contenido, mismo checksum, incluso con el tiempo de por medio", async () => {
  const files = [
    { path: "a.txt", content: Buffer.from("contenido A") },
    { path: "b.txt", content: Buffer.from("contenido B") },
  ];
  const zip1 = await cp04BuildReproducibleZip(files);
  await new Promise((resolve) => setTimeout(resolve, 1100));
  const zip2 = await cp04BuildReproducibleZip(files);
  assert.equal(sha(zip1), sha(zip2));
});

test("cp04BuildReproducibleZip es reproducible independientemente del orden de inserción de los archivos", async () => {
  const a = { path: "a.txt", content: Buffer.from("A") };
  const b = { path: "b.txt", content: Buffer.from("B") };
  const zip1 = await cp04BuildReproducibleZip([a, b]);
  const zip2 = await cp04BuildReproducibleZip([b, a]);
  assert.equal(sha(zip1), sha(zip2));
});

test("cp04BuildReproducibleZip: contenido distinto produce un checksum distinto (no siempre el mismo hash)", async () => {
  const zip1 = await cp04BuildReproducibleZip([{ path: "a.txt", content: Buffer.from("v1") }]);
  const zip2 = await cp04BuildReproducibleZip([{ path: "a.txt", content: Buffer.from("v2") }]);
  assert.notEqual(sha(zip1), sha(zip2));
});
