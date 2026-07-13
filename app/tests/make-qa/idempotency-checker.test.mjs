import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractIdempotencyKey, IdempotencyStore, IDEMPOTENCY_KEY_FIELDS } from "../../scripts/make-qa/idempotency-checker.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");

function loadPayload(fixtureName) {
  return JSON.parse(readFileSync(path.join(APP_ROOT, "fixtures/make-qa/payloads", fixtureName), "utf8")).payload;
}

test("extractIdempotencyKey: misma clave_reserva produce la misma clave de idempotencia (QA-A3-002)", () => {
  const payload = loadPayload("qa-a3-002-api-reservas.json");
  const key1 = extractIdempotencyKey("QA-A3-002", payload);
  const key2 = extractIdempotencyKey("QA-A3-002", { ...payload });
  assert.equal(key1, key2);
});

test("extractIdempotencyKey: clave_reserva distinta produce clave distinta", () => {
  const payload = loadPayload("qa-a3-002-api-reservas.json");
  const key1 = extractIdempotencyKey("QA-A3-002", payload);
  const key2 = extractIdempotencyKey("QA-A3-002", { ...payload, clave_reserva: "QA_CP04_OTRA_RESERVA" });
  assert.notEqual(key1, key2);
});

test("extractIdempotencyKey: test_id sin campos de idempotencia definidos lanza error explícito, no falla en silencio", () => {
  assert.throws(() => extractIdempotencyKey("QA-A4-005", {}), /No hay campos de idempotencia definidos/);
});

test("IdempotencyStore: la segunda petición con la misma clave devuelve isDuplicate:true y NO vuelve a invocar produceResult", () => {
  const store = new IdempotencyStore();
  let callCount = 0;
  const produceResult = () => {
    callCount += 1;
    return { record_id: "rec_123" };
  };

  const first = store.checkAndRecord("clave-x", produceResult);
  assert.equal(first.isDuplicate, false);
  assert.equal(callCount, 1);

  const second = store.checkAndRecord("clave-x", produceResult);
  assert.equal(second.isDuplicate, true);
  assert.equal(callCount, 1, "produceResult no debe volver a ejecutarse en un duplicado");
  assert.deepEqual(second.result, first.result, "el duplicado debe devolver el mismo resultado que la primera vez, no uno nuevo");
});

test("IdempotencyStore: claves distintas se procesan de forma independiente", () => {
  const store = new IdempotencyStore();
  store.checkAndRecord("clave-a", () => "resultado-a");
  store.checkAndRecord("clave-b", () => "resultado-b");
  assert.equal(store.size, 2);
});

test("flujo completo: dos intentos de crear la MISMA reserva (mismo clave_reserva) -> el segundo es duplicado", () => {
  const payload = loadPayload("qa-a3-002-api-reservas.json");
  const store = new IdempotencyStore();

  const key = extractIdempotencyKey("QA-A3-002", payload);
  const first = store.checkAndRecord(key, () => ({ evento_calendar: "creado", fila_airtable: "creada" }));
  assert.equal(first.isDuplicate, false);

  // Mismo payload reenviado (ej. reintento de red tras timeout, o doble clic en el botón "Reservar")
  const retryKey = extractIdempotencyKey("QA-A3-002", { ...payload });
  const second = store.checkAndRecord(retryKey, () => ({ evento_calendar: "creado_OTRA_VEZ", fila_airtable: "creada_OTRA_VEZ" }));
  assert.equal(second.isDuplicate, true, "un reintento con la misma clave_reserva NUNCA debe crear un segundo evento/fila");
});

test("IDEMPOTENCY_KEY_FIELDS cubre los 8 test_id de Wave 1/2 con payload preparado (QA-A1-001..QA-A4-004, excepto QA-A2-001/QA-A4-005 que no tienen campo natural)", () => {
  const covered = Object.keys(IDEMPOTENCY_KEY_FIELDS);
  for (const id of ["QA-A1-001", "QA-A3-001", "QA-A3-002", "QA-A3-003", "QA-A4-001", "QA-A4-002", "QA-A4-003", "QA-A4-004"]) {
    assert.ok(covered.includes(id), `falta ${id}`);
  }
});
