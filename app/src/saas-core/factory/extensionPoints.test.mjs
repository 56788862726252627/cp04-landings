import { test } from "node:test";
import assert from "node:assert/strict";

import { EXTENSION_POINTS, getExtensionPoint, getExtensionPointWithMock, listExtensionPointIds } from "./extensionPoints.js";

const EXPECTED_IDS = [
  "publicResearch", "googleMaps", "websiteAudit", "customerDataImport", "commercialDiagnosis",
  "automationRecommendations", "advancedBrandingGeneration", "imageGeneration", "pdfBeforeAfterGeneration",
  "mockupCapture", "deployment", "make", "airtable", "supabase", "stripe", "whatsappBusiness", "gmail",
  "googleCalendar", "analytics",
];

test("todos los puntos de extensión pedidos por la Fase 13 están presentes", () => {
  const ids = listExtensionPointIds();
  for (const expected of EXPECTED_IDS) assert.ok(ids.includes(expected), `falta ${expected}`);
});

test("ningún punto de extensión se declara implementado (status not_implemented)", () => {
  assert.ok(EXTENSION_POINTS.every((p) => p.status === "not_implemented"));
});

test("cada punto de extensión tiene al menos un método de interfaz", () => {
  assert.ok(EXTENSION_POINTS.every((p) => p.interfaceMethods.length > 0));
});

test("getExtensionPointWithMock ejecuta el mock sin lanzar ni hacer I/O real", async () => {
  const point = getExtensionPointWithMock("stripe");
  const result = await point.mockImplementation.createPaymentIntent({ amount: 100 });
  assert.equal(result.status, "not_implemented");
  assert.equal(result.extensionPointId, "stripe");
});

test("los proveedores con credenciales declaran envVars, nunca valores", () => {
  const stripe = getExtensionPoint("stripe");
  assert.ok(stripe.credentialsNeeded.includes("STRIPE_SECRET_KEY"));
  assert.ok(stripe.credentialsNeeded.every((v) => !/=.+/.test(v)));
});

test("getExtensionPoint devuelve null para un id desconocido", () => {
  assert.equal(getExtensionPoint("no-existe"), null);
});
