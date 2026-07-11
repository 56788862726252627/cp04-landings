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
