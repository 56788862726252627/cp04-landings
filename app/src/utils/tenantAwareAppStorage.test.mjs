import test from "node:test";
import assert from "node:assert/strict";

import { cp04ReadTenantAware, cp04WriteTenantAware, cp04RemoveTenantAware } from "./tenantAwareAppStorage.js";

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

test("cp04WriteTenantAware + cp04ReadTenantAware: con tenantId, namespacea bajo tenant:{tenantId}:{key}", () => {
  const storage = createMockStorage();
  cp04WriteTenantAware(storage, { tenantId: "cp04", key: "cp04_role" }, "ADMIN");
  assert.equal(storage._dump()["tenant:cp04:cp04_role"], "ADMIN");
  assert.equal(cp04ReadTenantAware(storage, { tenantId: "cp04", key: "cp04_role" }), "ADMIN");
});

test("cp04ReadTenantAware: sin tenantId, lee/escribe la clave legacy plana (fallback seguro, comportamiento pre-integración)", () => {
  const storage = createMockStorage({ cp04_role: "STAFF" });
  assert.equal(cp04ReadTenantAware(storage, { tenantId: null, key: "cp04_role" }), "STAFF");
});

test("cp04WriteTenantAware: sin tenantId, escribe la clave legacy plana sin namespacear", () => {
  const storage = createMockStorage();
  cp04WriteTenantAware(storage, { tenantId: null, key: "cp04_role" }, "PLAYER");
  assert.equal(storage._dump().cp04_role, "PLAYER");
  assert.equal(Object.keys(storage._dump()).length, 1);
});

test("cp04ReadTenantAware: con tenantId, cae a la clave legacy si la namespaced todavía no existe (compatibilidad de despliegue)", () => {
  const storage = createMockStorage({ cp04_role: "ADMIN" });
  assert.equal(cp04ReadTenantAware(storage, { tenantId: "cp04", key: "cp04_role" }), "ADMIN");
  // Leer la legacy no la migra ni la borra.
  assert.equal(storage._dump().cp04_role, "ADMIN");
  assert.equal("tenant:cp04:cp04_role" in storage._dump(), false);
});

test("cp04ReadTenantAware: prioriza la clave namespaced sobre la legacy si ambas existen", () => {
  const storage = createMockStorage({
    "tenant:cp04:cp04_role": "ADMIN",
    cp04_role: "PLAYER",
  });
  assert.equal(cp04ReadTenantAware(storage, { tenantId: "cp04", key: "cp04_role" }), "ADMIN");
});

test("aislamiento por tenant: la escritura de cp04 no es legible bajo el tenantId de club02", () => {
  const storage = createMockStorage();
  cp04WriteTenantAware(storage, { tenantId: "cp04", key: "cp04_role" }, "ADMIN");
  assert.equal(cp04ReadTenantAware(storage, { tenantId: "club02", key: "cp04_role" }), null);
});

test("aislamiento por usuario: userId separa el mismo dato de perfil entre dos usuarios del mismo tenant", () => {
  const storage = createMockStorage();
  cp04WriteTenantAware(storage, { tenantId: "cp04", key: "cp04_avatar", userId: "user-1" }, "avatar-1.png");
  cp04WriteTenantAware(storage, { tenantId: "cp04", key: "cp04_avatar", userId: "user-2" }, "avatar-2.png");

  assert.equal(
    cp04ReadTenantAware(storage, { tenantId: "cp04", key: "cp04_avatar", userId: "user-1" }),
    "avatar-1.png"
  );
  assert.equal(
    cp04ReadTenantAware(storage, { tenantId: "cp04", key: "cp04_avatar", userId: "user-2" }),
    "avatar-2.png"
  );
});

test("cambio de usuario en el mismo tenant: el usuario 2 nunca hereda el dato del usuario 1 (sin userId compartido)", () => {
  const storage = createMockStorage();
  cp04WriteTenantAware(storage, { tenantId: "cp04", key: "cp04_bio", userId: "user-1" }, "Bio de usuario 1");
  const leidoPorUsuario2 = cp04ReadTenantAware(storage, { tenantId: "cp04", key: "cp04_bio", userId: "user-2" });
  assert.equal(leidoPorUsuario2, null);
});

test("cp04RemoveTenantAware: por defecto borra solo la namespaced, conserva la legacy", () => {
  const storage = createMockStorage({
    "tenant:cp04:cp04_role": "ADMIN",
    cp04_role: "ADMIN-legacy",
  });
  cp04RemoveTenantAware(storage, { tenantId: "cp04", key: "cp04_role" });
  assert.equal("tenant:cp04:cp04_role" in storage._dump(), false);
  assert.equal(storage._dump().cp04_role, "ADMIN-legacy");
});

test("cp04RemoveTenantAware: con removeLegacy:true borra ambas (logout real, no migración destructiva)", () => {
  const storage = createMockStorage({
    "tenant:cp04:cp04_role": "ADMIN",
    cp04_role: "ADMIN-legacy",
  });
  cp04RemoveTenantAware(storage, { tenantId: "cp04", key: "cp04_role", removeLegacy: true });
  assert.equal("tenant:cp04:cp04_role" in storage._dump(), false);
  assert.equal("cp04_role" in storage._dump(), false);
});

test("cp04RemoveTenantAware: sin tenantId, borra la clave legacy plana directamente (fallback seguro)", () => {
  const storage = createMockStorage({ cp04_role: "ADMIN" });
  cp04RemoveTenantAware(storage, { tenantId: null, key: "cp04_role" });
  assert.equal("cp04_role" in storage._dump(), false);
});

test("sin storage disponible, ninguna función lanza (modo privado / entorno sin localStorage)", () => {
  assert.doesNotThrow(() => cp04ReadTenantAware(null, { tenantId: "cp04", key: "cp04_role" }));
  assert.doesNotThrow(() => cp04WriteTenantAware(null, { tenantId: "cp04", key: "cp04_role" }, "ADMIN"));
  assert.doesNotThrow(() => cp04RemoveTenantAware(null, { tenantId: "cp04", key: "cp04_role" }));
  assert.equal(cp04ReadTenantAware(null, { tenantId: "cp04", key: "cp04_role" }), null);
});

test("escenario combinado: cambio de tenant Y cambio de usuario en el mismo navegador no mezclan estado", () => {
  const storage = createMockStorage();
  cp04WriteTenantAware(storage, { tenantId: "cp04", key: "cp04_privacidad", userId: "playerA" }, JSON.stringify({ perfil: "publico" }));
  cp04WriteTenantAware(storage, { tenantId: "club02", key: "cp04_privacidad", userId: "playerA" }, JSON.stringify({ perfil: "privado" }));

  const cp04Value = cp04ReadTenantAware(storage, { tenantId: "cp04", key: "cp04_privacidad", userId: "playerA" });
  const club02Value = cp04ReadTenantAware(storage, { tenantId: "club02", key: "cp04_privacidad", userId: "playerA" });

  assert.notEqual(cp04Value, club02Value);
  assert.equal(JSON.parse(cp04Value).perfil, "publico");
  assert.equal(JSON.parse(club02Value).perfil, "privado");
});

// LOTE C — cp04_torneo_v2 / cp04_torneo_hist_v2 (torneo del club, namespaced
// SOLO por tenant, sin userId: es dato de club, no de un jugador individual
// — ver comentario de torneoLoadSaved/torneoLoadHist en App.jsx y LOTE H en
// audit/tenant-storage-isolation/TENANT_STORAGE_MIGRATION_PLAN.md). Usa las
// claves literales reales de producción (no un placeholder genérico como
// "cp04_role" en los tests de arriba) para que un cambio accidental del
// nombre de la constante TORNEO_STORE/TORNEO_HIST_STORE en App.jsx no pase
// desapercibido.

test("LOTE C: tenant A no lee cp04_torneo_v2 de tenant B (bracket de un club nunca visible para otro)", () => {
  const storage = createMockStorage();
  cp04WriteTenantAware(storage, { tenantId: "cp04", key: "cp04_torneo_v2" }, JSON.stringify({ nombre: "Torneo de Verano CP04" }));
  const leidoPorClub02 = cp04ReadTenantAware(storage, { tenantId: "club02", key: "cp04_torneo_v2" });
  assert.equal(leidoPorClub02, null);
});

test("LOTE C: tenant A no lee cp04_torneo_hist_v2 de tenant B (historial de deshacer/rehacer no se filtra entre clubes)", () => {
  const storage = createMockStorage();
  cp04WriteTenantAware(
    storage,
    { tenantId: "cp04", key: "cp04_torneo_hist_v2" },
    JSON.stringify({ snaps: [{ id: 1, action: "Cambio de formato" }], idx: 0 })
  );
  const leidoPorClub02 = cp04ReadTenantAware(storage, { tenantId: "club02", key: "cp04_torneo_hist_v2" });
  assert.equal(leidoPorClub02, null);
});

test("LOTE C: fallback legacy funciona si no hay tenant (torneo se sigue leyendo con la clave plana de siempre)", () => {
  const storage = createMockStorage({ cp04_torneo_v2: JSON.stringify({ nombre: "Torneo previo a la integración" }) });
  const valor = cp04ReadTenantAware(storage, { tenantId: null, key: "cp04_torneo_v2" });
  assert.equal(JSON.parse(valor).nombre, "Torneo previo a la integración");
});

test("LOTE C: fallback legacy no destruye datos antiguos de torneo (leer la legacy no la borra ni la sobreescribe)", () => {
  const storage = createMockStorage({ cp04_torneo_v2: JSON.stringify({ nombre: "Torneo legacy" }) });
  cp04ReadTenantAware(storage, { tenantId: "cp04", key: "cp04_torneo_v2" });
  const dump = storage._dump();
  assert.equal(dump.cp04_torneo_v2, JSON.stringify({ nombre: "Torneo legacy" }));
  assert.equal("tenant:cp04:cp04_torneo_v2" in dump, false);
});

test("LOTE C: escritura nueva de torneo queda namespaced cuando hay tenant, sin tocar la clave legacy", () => {
  const storage = createMockStorage({ cp04_torneo_v2: JSON.stringify({ nombre: "Torneo legacy" }) });
  cp04WriteTenantAware(storage, { tenantId: "cp04", key: "cp04_torneo_v2" }, JSON.stringify({ nombre: "Torneo nuevo" }));
  const dump = storage._dump();
  assert.equal(JSON.parse(dump["tenant:cp04:cp04_torneo_v2"]).nombre, "Torneo nuevo");
  // No se elimina ni se sobreescribe accidentalmente la clave antigua.
  assert.equal(JSON.parse(dump.cp04_torneo_v2).nombre, "Torneo legacy");
});

test("LOTE C: lectura de historial de torneo prioriza namespaced y cae a legacy si no existe namespaced", () => {
  const storageConAmbas = createMockStorage({
    "tenant:cp04:cp04_torneo_hist_v2": JSON.stringify({ snaps: [], idx: -1, origen: "namespaced" }),
    cp04_torneo_hist_v2: JSON.stringify({ snaps: [], idx: -1, origen: "legacy" }),
  });
  assert.equal(
    JSON.parse(cp04ReadTenantAware(storageConAmbas, { tenantId: "cp04", key: "cp04_torneo_hist_v2" })).origen,
    "namespaced"
  );

  const storageSoloLegacy = createMockStorage({
    cp04_torneo_hist_v2: JSON.stringify({ snaps: [], idx: -1, origen: "legacy" }),
  });
  assert.equal(
    JSON.parse(cp04ReadTenantAware(storageSoloLegacy, { tenantId: "cp04", key: "cp04_torneo_hist_v2" })).origen,
    "legacy"
  );
});

test("LOTE C: no se eliminan claves antiguas de torneo accidentalmente (cp04WriteTenantAware nunca borra, solo escribe la namespaced)", () => {
  const storage = createMockStorage({
    cp04_torneo_v2: JSON.stringify({ nombre: "Torneo legacy" }),
    cp04_torneo_hist_v2: JSON.stringify({ snaps: [], idx: -1 }),
  });
  cp04WriteTenantAware(storage, { tenantId: "cp04", key: "cp04_torneo_v2" }, JSON.stringify({ nombre: "Torneo nuevo" }));
  cp04WriteTenantAware(storage, { tenantId: "cp04", key: "cp04_torneo_hist_v2" }, JSON.stringify({ snaps: [{ id: 1 }], idx: 0 }));

  const dump = storage._dump();
  assert.ok("cp04_torneo_v2" in dump, "la clave legacy de torneo no debería desaparecer solo por escribir la namespaced");
  assert.ok("cp04_torneo_hist_v2" in dump, "la clave legacy de historial no debería desaparecer solo por escribir la namespaced");
});
