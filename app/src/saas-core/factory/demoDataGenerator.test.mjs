import { test } from "node:test";
import assert from "node:assert/strict";

import { generateDemoDataset, checkDatasetReferentialIntegrity } from "./demoDataGenerator.js";
import { buildTerminology } from "../terminology/terminology.js";

const { dictionary: terminology } = buildTerminology({
  customer: { singular: "paciente", plural: "pacientes", short: "Paciente" },
  staff: { singular: "dentista", plural: "dentistas", short: "Dentista" },
  resource: { singular: "consulta", plural: "consultas", short: "Consulta" },
});

test("generateDemoDataset con la misma seed produce exactamente el mismo resultado", () => {
  const a = generateDemoDataset({ sector: "dental", terminology, commonServices: ["Revisión", "Limpieza"], seed: "misma-seed", sizes: { customers: 8, professionals: 3, appointments: 15 } });
  const b = generateDemoDataset({ sector: "dental", terminology, commonServices: ["Revisión", "Limpieza"], seed: "misma-seed", sizes: { customers: 8, professionals: 3, appointments: 15 } });
  assert.deepEqual(a, b);
});

test("generateDemoDataset con distinta seed produce datos distintos", () => {
  const a = generateDemoDataset({ sector: "dental", terminology, seed: "seed-a" });
  const b = generateDemoDataset({ sector: "dental", terminology, seed: "seed-b" });
  assert.notDeepEqual(a.customers, b.customers);
});

test("todos los registros generados están marcados isDemoData:true", () => {
  const ds = generateDemoDataset({ sector: "dental", terminology, seed: "marca-demo" });
  for (const group of [ds.customers, ds.professionals, ds.services, ds.resources, ds.schedules, ds.appointments, ds.communications, ds.automations, ds.incidents]) {
    assert.ok(group.every((r) => r.isDemoData === true));
  }
  assert.equal(ds.metrics.isDemoData, true);
  assert.equal(ds.isDemoData, true);
});

test("el dataset generado es referencialmente consistente", () => {
  const ds = generateDemoDataset({ sector: "dental", terminology, commonServices: ["Revisión", "Limpieza", "Ortodoncia"], seed: "consistencia", sizes: { customers: 18, professionals: 3, appointments: 24, incidents: 3 } });
  const { consistent, problems } = checkDatasetReferentialIntegrity(ds);
  assert.equal(consistent, true, JSON.stringify(problems));
});

test("los tamaños solicitados (sizes) se respetan", () => {
  const ds = generateDemoDataset({ sector: "dental", terminology, seed: "tamanos", sizes: { customers: 5, professionals: 2, appointments: 9, incidents: 1 } });
  assert.equal(ds.customers.length, 5);
  assert.equal(ds.professionals.length, 2);
  assert.equal(ds.appointments.length, 9);
  assert.equal(ds.incidents.length, 1);
});

test("ningún nombre generado coincide con datos reales conocidos del proyecto (cp04DemoData)", () => {
  const ds = generateDemoDataset({ sector: "dental", terminology, seed: "sin-reales" });
  for (const c of ds.customers) assert.match(c.displayName, /\(demo\)$/);
  for (const p of ds.professionals) assert.match(p.displayName, /\(demo\)$/);
});

test("checkDatasetReferentialIntegrity detecta una referencia rota manual", () => {
  const ds = generateDemoDataset({ sector: "dental", terminology, seed: "roto" });
  const broken = { ...ds, appointments: [...ds.appointments, { id: "appt_x", customerId: "no-existe", resourceId: "no-existe" }] };
  const { consistent, problems } = checkDatasetReferentialIntegrity(broken);
  assert.equal(consistent, false);
  assert.ok(problems.length >= 2);
});
