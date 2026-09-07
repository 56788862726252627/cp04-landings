import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04ValidateProjectBrief, cp04BuildProjectBrief, cp04GetSectorTemplate, CP04_SECTOR_IDS } from "./sectorTemplates.js";

test("existen los 6 sectores mínimos pedidos por el enunciado", () => {
  assert.equal(CP04_SECTOR_IDS.length, 6);
  for (const id of ["club-deportivo", "clinica-dental", "fisioterapia", "abogados", "peluqueria", "veterinaria"]) {
    assert.ok(cp04GetSectorTemplate(id), `falta el sector "${id}"`);
  }
});

test("cp04ValidateProjectBrief exige projectId/displayName/sector/client", () => {
  const result = cp04ValidateProjectBrief({ projectId: "x" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("displayName")));
  assert.ok(result.errors.some((e) => e.includes("sector")));
  assert.ok(result.errors.some((e) => e.includes("client")));
});

test("cp04ValidateProjectBrief rechaza un sector desconocido con un mensaje claro", () => {
  const result = cp04ValidateProjectBrief({ projectId: "x", displayName: "X", client: "X", sector: "no-existe" });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(";"), /sector desconocido/);
});

test("cp04BuildProjectBrief aplica defaults seguros del sector cuando no se aportan datos", () => {
  const result = cp04BuildProjectBrief({ projectId: "p1", displayName: "Negocio X", client: "Negocio X S.L.", sector: "peluqueria" });
  assert.equal(result.valid, true);
  assert.ok(result.brief.modules.length > 0);
  assert.ok(result.brief.risks.length > 0);
  assert.ok(result.brief.roadmap.length > 0);
  assert.equal(result.brief.sectorLabel, "Peluquería / estética");
});

test("cp04BuildProjectBrief respeta los valores explícitos del caller en vez de los defaults", () => {
  const result = cp04BuildProjectBrief({
    projectId: "p1", displayName: "X", client: "X", sector: "abogados", modules: ["Módulo propio"], price: "500€/mes",
  });
  assert.deepEqual(result.brief.modules, ["Módulo propio"]);
  assert.equal(result.brief.price, "500€/mes");
});

test("cp04BuildProjectBrief falla con un mensaje claro si falta un campo obligatorio, sin producir un brief a medias", () => {
  const result = cp04BuildProjectBrief({ projectId: "p1", sector: "abogados" });
  assert.equal(result.valid, false);
  assert.equal(result.brief, undefined);
});

test("perfiles distintos producen módulos/riesgos de sector distintos entre sí (no un genérico compartido)", () => {
  const dental = cp04BuildProjectBrief({ projectId: "a", displayName: "A", client: "A", sector: "clinica-dental" }).brief;
  const vet = cp04BuildProjectBrief({ projectId: "b", displayName: "B", client: "B", sector: "veterinaria" }).brief;
  assert.notDeepEqual(dental.modules, vet.modules);
});

test("el brief resultante está congelado (Object.freeze) — no se puede mutar tras construirlo", () => {
  const result = cp04BuildProjectBrief({ projectId: "p1", displayName: "X", client: "X", sector: "fisioterapia" });
  assert.throws(() => { result.brief.displayName = "otro"; }, TypeError);
});
