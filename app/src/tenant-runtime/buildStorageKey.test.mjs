import test from "node:test";
import assert from "node:assert/strict";

import { buildStorageKey, readTenantStorageItem, writeTenantStorageItem, removeTenantStorageItem } from "./buildStorageKey.js";

// Mock mínimo de Storage (localStorage/sessionStorage), independiente de
// cualquier entorno de navegador — mismo criterio que el resto de tests
// puros de src/tenant-runtime/ (node --test, sin jsdom).
function createMockStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => {
      data.set(k, String(v));
    },
    removeItem: (k) => {
      data.delete(k);
    },
    _dump: () => Object.fromEntries(data),
  };
}

test("buildStorageKey: formato canónico tenant:{tenantId}:{key}", () => {
  assert.equal(buildStorageKey({ tenantId: "cp04", key: "cp04_access_token" }), "tenant:cp04:cp04_access_token");
});

test("buildStorageKey: con userId añade el segmento user:{userId}", () => {
  assert.equal(
    buildStorageKey({ tenantId: "cp04", key: "cp04_avatar", userId: "u1" }),
    "tenant:cp04:user:u1:cp04_avatar"
  );
});

test("buildStorageKey: tenant A y tenant B producen claves distintas para la misma key (colisión evitada)", () => {
  const keyA = buildStorageKey({ tenantId: "cp04", key: "cp04_torneo_v2" });
  const keyB = buildStorageKey({ tenantId: "club02", key: "cp04_torneo_v2" });
  assert.notEqual(keyA, keyB);
  assert.equal(keyA, "tenant:cp04:cp04_torneo_v2");
  assert.equal(keyB, "tenant:club02:cp04_torneo_v2");
});

test("buildStorageKey: dos usuarios del mismo tenant producen claves distintas (colisión evitada)", () => {
  const keyUser1 = buildStorageKey({ tenantId: "cp04", key: "cp04_avatar", userId: "user-1" });
  const keyUser2 = buildStorageKey({ tenantId: "cp04", key: "cp04_avatar", userId: "user-2" });
  assert.notEqual(keyUser1, keyUser2);
});

test("buildStorageKey: sin tenantId lanza (ningún namespace implícito)", () => {
  assert.throws(() => buildStorageKey({ key: "cp04_access_token" }), /tenantId/);
});

test("buildStorageKey: sin key lanza", () => {
  assert.throws(() => buildStorageKey({ tenantId: "cp04" }), /key/);
});

test("readTenantStorageItem: lee la clave namespaced cuando existe", () => {
  const storage = createMockStorage({ "tenant:cp04:cp04_access_token": "token-real" });
  const value = readTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_access_token" });
  assert.equal(value, "token-real");
});

test("readTenantStorageItem: cae a la clave legacy si la namespaced no existe", () => {
  const storage = createMockStorage({ cp04_access_token: "token-legacy" });
  const value = readTenantStorageItem(storage, {
    tenantId: "cp04",
    key: "cp04_access_token",
    legacyKey: "cp04_access_token",
  });
  assert.equal(value, "token-legacy");
});

test("readTenantStorageItem: prioriza la namespaced sobre la legacy si ambas existen", () => {
  const storage = createMockStorage({
    "tenant:cp04:cp04_access_token": "token-nuevo",
    cp04_access_token: "token-viejo",
  });
  const value = readTenantStorageItem(storage, {
    tenantId: "cp04",
    key: "cp04_access_token",
    legacyKey: "cp04_access_token",
  });
  assert.equal(value, "token-nuevo");
});

test("readTenantStorageItem: null si ni namespaced ni legacy existen", () => {
  const storage = createMockStorage();
  const value = readTenantStorageItem(storage, {
    tenantId: "cp04",
    key: "cp04_access_token",
    legacyKey: "cp04_access_token",
  });
  assert.equal(value, null);
});

test("readTenantStorageItem: leer la legacy nunca la borra ni la sobreescribe (no es una migración)", () => {
  const storage = createMockStorage({ cp04_access_token: "token-legacy" });
  readTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_access_token", legacyKey: "cp04_access_token" });
  assert.equal(storage._dump().cp04_access_token, "token-legacy");
  assert.equal("tenant:cp04:cp04_access_token" in storage._dump(), false);
});

test("readTenantStorageItem: sin storage no lanza, devuelve null", () => {
  assert.equal(readTenantStorageItem(null, { tenantId: "cp04", key: "cp04_access_token" }), null);
});

test("writeTenantStorageItem: escribe solo en la clave namespaced, nunca toca la legacy", () => {
  const storage = createMockStorage({ cp04_access_token: "token-legacy" });
  writeTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_access_token" }, "token-nuevo");
  assert.equal(storage._dump()["tenant:cp04:cp04_access_token"], "token-nuevo");
  assert.equal(storage._dump().cp04_access_token, "token-legacy");
});

test("writeTenantStorageItem: dos tenants no se pisan al escribir la misma key", () => {
  const storage = createMockStorage();
  writeTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_torneo_v2" }, "bracket-A");
  writeTenantStorageItem(storage, { tenantId: "club02", key: "cp04_torneo_v2" }, "bracket-B");
  assert.equal(storage._dump()["tenant:cp04:cp04_torneo_v2"], "bracket-A");
  assert.equal(storage._dump()["tenant:club02:cp04_torneo_v2"], "bracket-B");
});

test("writeTenantStorageItem: sin storage no lanza", () => {
  assert.doesNotThrow(() => writeTenantStorageItem(null, { tenantId: "cp04", key: "cp04_access_token" }, "x"));
});

test("removeTenantStorageItem: por defecto borra solo la namespaced, conserva la legacy", () => {
  const storage = createMockStorage({
    "tenant:cp04:cp04_access_token": "token-nuevo",
    cp04_access_token: "token-legacy",
  });
  removeTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_access_token", legacyKey: "cp04_access_token" });
  assert.equal("tenant:cp04:cp04_access_token" in storage._dump(), false);
  assert.equal(storage._dump().cp04_access_token, "token-legacy");
});

test("removeTenantStorageItem: con removeLegacy:true borra ambas (logout real, no migración destructiva)", () => {
  const storage = createMockStorage({
    "tenant:cp04:cp04_access_token": "token-nuevo",
    cp04_access_token: "token-legacy",
  });
  removeTenantStorageItem(storage, {
    tenantId: "cp04",
    key: "cp04_access_token",
    legacyKey: "cp04_access_token",
    removeLegacy: true,
  });
  assert.equal("tenant:cp04:cp04_access_token" in storage._dump(), false);
  assert.equal("cp04_access_token" in storage._dump(), false);
});

test("removeTenantStorageItem: borrar la clave de tenant A no afecta a la de tenant B (aislamiento en cambio de tenant)", () => {
  const storage = createMockStorage({
    "tenant:cp04:cp04_torneo_v2": "bracket-A",
    "tenant:club02:cp04_torneo_v2": "bracket-B",
  });
  removeTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_torneo_v2" });
  assert.equal("tenant:cp04:cp04_torneo_v2" in storage._dump(), false);
  assert.equal(storage._dump()["tenant:club02:cp04_torneo_v2"], "bracket-B");
});

test("removeTenantStorageItem: sin storage no lanza", () => {
  assert.doesNotThrow(() => removeTenantStorageItem(null, { tenantId: "cp04", key: "cp04_access_token" }));
});

test("escenario 'mismo dispositivo, dos usuarios': namespacing por userId evita que el usuario 2 lea el dato del usuario 1", () => {
  const storage = createMockStorage();
  writeTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_avatar", userId: "user-1" }, "avatar-1.png");
  const readByUser2 = readTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_avatar", userId: "user-2" });
  assert.equal(readByUser2, null);
  const readByUser1 = readTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_avatar", userId: "user-1" });
  assert.equal(readByUser1, "avatar-1.png");
});

test("escenario 'cambio de tenant en el mismo navegador': los datos de A no son legibles bajo el tenantId de B", () => {
  const storage = createMockStorage();
  writeTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_user" }, JSON.stringify({ email: "a@cp04.com" }));
  const readAsB = readTenantStorageItem(storage, { tenantId: "club02", key: "cp04_user" });
  assert.equal(readAsB, null);
});

test("escenario combinado cp04/playerA vs cp04/playerB vs club02/playerA: mismo navegador, misma key lógica, sin colisión cruzada", () => {
  const storage = createMockStorage();
  writeTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_avatar", userId: "playerA" }, "avatar-cp04-A.png");
  writeTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_avatar", userId: "playerB" }, "avatar-cp04-B.png");
  writeTenantStorageItem(storage, { tenantId: "club02", key: "cp04_avatar", userId: "playerA" }, "avatar-club02-A.png");

  assert.equal(
    readTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_avatar", userId: "playerA" }),
    "avatar-cp04-A.png"
  );
  assert.equal(
    readTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_avatar", userId: "playerB" }),
    "avatar-cp04-B.png"
  );
  assert.equal(
    readTenantStorageItem(storage, { tenantId: "club02", key: "cp04_avatar", userId: "playerA" }),
    "avatar-club02-A.png"
  );

  // club02/playerA no colisiona con cp04/playerA aunque el userId sea idéntico
  // (el segmento tenantId basta para separarlos, ver formato canónico).
  assert.notEqual(
    readTenantStorageItem(storage, { tenantId: "club02", key: "cp04_avatar", userId: "playerA" }),
    readTenantStorageItem(storage, { tenantId: "cp04", key: "cp04_avatar", userId: "playerA" })
  );

  const dump = storage._dump();
  assert.equal(Object.keys(dump).length, 3);
});
