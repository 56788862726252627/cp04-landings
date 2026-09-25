import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createAgencyApiHandler } from "./agencyApiRouter.mjs";
import { runFactoryPipeline, DEFAULT_BUSINESSES_DIR } from "./lib/businessCli.mjs";
import { BUSINESS_BLUEPRINT_SCHEMA_VERSION } from "../src/saas-core/factory/businessBlueprintSchema.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function withTestServer(handler, fn) {
  const server = http.createServer(handler);
  await new Promise((resolve, reject) => {
    server.on("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await fn(baseUrl, server);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        let json;
        try { json = JSON.parse(body); } catch { json = body; }
        resolve({ status: res.statusCode, headers: res.headers, body: json, rawBody: body });
      });
    }).on("error", reject);
  });
}

async function withTempBusinessDir(blueprint, fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "agency-api-test-"));
  try {
    await runFactoryPipeline({ blueprint, outputBaseDir: dir });
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function testBlueprint(businessId, sector = "padel") {
  return {
    schemaVersion: BUSINESS_BLUEPRINT_SCHEMA_VERSION,
    businessId,
    tenantId: businessId,
    commercialName: `Demo ${businessId}`,
    sector,
    country: "ES",
    timezone: "Europe/Madrid",
    locale: "es-ES",
    currencies: ["EUR"],
    plan: "starter",
  };
}

// ---------------------------------------------------------------------------
// /api/agency/health
// ---------------------------------------------------------------------------

test("GET /api/agency/health: responde 200 con status=ok y lista de endpoints", async () => {
  const handler = createAgencyApiHandler({ baseDir: DEFAULT_BUSINESSES_DIR });
  await withTestServer(handler, async (baseUrl) => {
    const res = await httpGet(`${baseUrl}/api/agency/health`);
    assert.equal(res.status, 200);
    assert.equal(res.body.status, "ok");
    assert.ok(res.body.data);
    assert.equal(res.body.data.status, "alive");
    assert.ok(Array.isArray(res.body.data.endpoints));
    assert.ok(res.body.data.endpoints.some((e) => e.includes("/api/agency/status")));
  });
});

test("GET /api/agency/health: no revela rutas internas ni secretos (sin stack trace)", async () => {
  const handler = createAgencyApiHandler({ baseDir: DEFAULT_BUSINESSES_DIR });
  await withTestServer(handler, async (baseUrl) => {
    const res = await httpGet(`${baseUrl}/api/agency/health`);
    const bodyStr = JSON.stringify(res.body);
    assert.ok(!bodyStr.includes("node_modules"));
    assert.ok(!bodyStr.includes("Error: "));
    assert.ok(!bodyStr.includes("sk_live"));
    assert.ok(!bodyStr.includes("password"));
  });
});

// ---------------------------------------------------------------------------
// /api/agency/sectors
// ---------------------------------------------------------------------------

test("GET /api/agency/sectors: devuelve lista de sectores e integraciones", async () => {
  const handler = createAgencyApiHandler({ baseDir: DEFAULT_BUSINESSES_DIR });
  await withTestServer(handler, async (baseUrl) => {
    const res = await httpGet(`${baseUrl}/api/agency/sectors`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data.sectors));
    assert.ok(Array.isArray(res.body.data.integrations));
    // sectors usa KNOWN_SECTORS (valores del schema de blueprint para filtrar)
    assert.ok(res.body.data.sectors.includes("padel"));
    assert.ok(res.body.data.sectors.includes("dental"));
    assert.ok(res.body.data.integrations.includes("stripe"));
  });
});

// ---------------------------------------------------------------------------
// /api/agency/status — directorio vacío
// ---------------------------------------------------------------------------

test("GET /api/agency/status con directorio vacío: totalBusinesses=0, overallClassification=no_businesses", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "api-empty-"));
  try {
    const handler = createAgencyApiHandler({ baseDir: dir });
    await withTestServer(handler, async (baseUrl) => {
      const res = await httpGet(`${baseUrl}/api/agency/status`);
      assert.equal(res.status, 200);
      assert.equal(res.body.status, "ok");
      assert.equal(res.body.data.totalBusinesses, 0);
      assert.equal(res.body.data.overallClassification, "no_businesses");
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// /api/agency/status — con negocios reales
// ---------------------------------------------------------------------------

test("GET /api/agency/status con un negocio generado: devuelve datos coherentes", async () => {
  await withTempBusinessDir(testBlueprint("api-test-padel"), async (dir) => {
    const handler = createAgencyApiHandler({ baseDir: dir });
    await withTestServer(handler, async (baseUrl) => {
      const res = await httpGet(`${baseUrl}/api/agency/status`);
      assert.equal(res.status, 200);
      assert.equal(res.body.data.totalBusinesses, 1);
      assert.ok(["A", "B", "C"].includes(res.body.data.overallClassification));
    });
  });
});

test("GET /api/agency/status?summary=true: no incluye array businesses en la respuesta", async () => {
  await withTempBusinessDir(testBlueprint("api-test-summary"), async (dir) => {
    const handler = createAgencyApiHandler({ baseDir: dir });
    await withTestServer(handler, async (baseUrl) => {
      const res = await httpGet(`${baseUrl}/api/agency/status?summary=true`);
      assert.equal(res.status, 200);
      assert.ok(!("businesses" in res.body.data));
      assert.ok("overallClassification" in res.body.data);
    });
  });
});

test("GET /api/agency/status?scope=production: scope propagado correctamente", async () => {
  await withTempBusinessDir(testBlueprint("api-test-prod"), async (dir) => {
    const handler = createAgencyApiHandler({ baseDir: dir });
    await withTestServer(handler, async (baseUrl) => {
      const res = await httpGet(`${baseUrl}/api/agency/status?scope=production`);
      assert.equal(res.status, 200);
      assert.equal(res.body.data.scope, "production");
    });
  });
});

// ---------------------------------------------------------------------------
// /api/agency/status — scope inválido
// ---------------------------------------------------------------------------

test("GET /api/agency/status?scope=INVALIDO: responde 400 con status=error", async () => {
  const handler = createAgencyApiHandler({ baseDir: DEFAULT_BUSINESSES_DIR });
  await withTestServer(handler, async (baseUrl) => {
    const res = await httpGet(`${baseUrl}/api/agency/status?scope=staging`);
    assert.equal(res.status, 400);
    assert.equal(res.body.status, "error");
    assert.ok(Array.isArray(res.body.errors));
    assert.ok(res.body.errors[0].code === "INVALID_SCOPE");
  });
});

// ---------------------------------------------------------------------------
// /api/agency/businesses
// ---------------------------------------------------------------------------

test("GET /api/agency/businesses: devuelve array data (puede ser vacío)", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "api-biz-"));
  try {
    const handler = createAgencyApiHandler({ baseDir: dir });
    await withTestServer(handler, async (baseUrl) => {
      const res = await httpGet(`${baseUrl}/api/agency/businesses`);
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok("total" in res.body.metadata);
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// /api/agency/integrations
// ---------------------------------------------------------------------------

test("GET /api/agency/integrations: devuelve objeto con keys de integraciones conocidas", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "api-int-"));
  try {
    const handler = createAgencyApiHandler({ baseDir: dir });
    await withTestServer(handler, async (baseUrl) => {
      const res = await httpGet(`${baseUrl}/api/agency/integrations`);
      assert.equal(res.status, 200);
      assert.ok("stripe" in res.body.data);
      assert.ok("airtable" in res.body.data);
      assert.ok("googleDrive" in res.body.data);
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Método no permitido
// ---------------------------------------------------------------------------

test("POST /api/agency/status: 405 Method Not Allowed", async () => {
  const handler = createAgencyApiHandler({ baseDir: DEFAULT_BUSINESSES_DIR });
  await withTestServer(handler, async (baseUrl) => {
    const res = await new Promise((resolve, reject) => {
      const req = http.request(`${baseUrl}/api/agency/status`, { method: "POST" }, (response) => {
        let body = "";
        response.on("data", (c) => { body += c; });
        response.on("end", () => {
          let json;
          try { json = JSON.parse(body); } catch { json = body; }
          resolve({ status: response.statusCode, body: json });
        });
      });
      req.on("error", reject);
      req.end();
    });
    assert.equal(res.status, 405);
    assert.equal(res.body.status, "error");
  });
});

// ---------------------------------------------------------------------------
// Ruta desconocida
// ---------------------------------------------------------------------------

test("GET /api/agency/unknown: 404 Not Found con error estructurado", async () => {
  const handler = createAgencyApiHandler({ baseDir: DEFAULT_BUSINESSES_DIR });
  await withTestServer(handler, async (baseUrl) => {
    const res = await httpGet(`${baseUrl}/api/agency/unknown-endpoint`);
    assert.equal(res.status, 404);
    assert.equal(res.body.status, "error");
    assert.equal(res.body.errors[0].code, "NOT_FOUND");
  });
});

// ---------------------------------------------------------------------------
// Negocio corrupto: el servidor no crashea
// ---------------------------------------------------------------------------

test("GET /api/agency/businesses con negocio corrupto: responde 200 con loadErrors informativo", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "api-corrupt-"));
  try {
    // Negocio válido
    await runFactoryPipeline({ blueprint: testBlueprint("api-ok-biz"), outputBaseDir: dir });
    // Negocio corrupto (sin report.json ni tenant.config.json)
    const corruptDir = path.join(dir, "negocio-corrupto");
    await mkdir(corruptDir, { recursive: true });
    await writeFile(
      path.join(corruptDir, "business.blueprint.json"),
      JSON.stringify({ businessId: "negocio-corrupto", commercialName: "Corrupto", sector: "padel", plan: "starter" }),
      "utf8"
    );
    const handler = createAgencyApiHandler({ baseDir: dir });
    await withTestServer(handler, async (baseUrl) => {
      const res = await httpGet(`${baseUrl}/api/agency/businesses`);
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(Array.isArray(res.body.metadata.loadErrors));
      assert.equal(res.body.metadata.loadErrors.length, 1);
      assert.equal(res.body.metadata.loadErrors[0].businessId, "negocio-corrupto");
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Stack trace: error interno no se filtra al consumidor
// ---------------------------------------------------------------------------

test("Errores internos: stack trace no visible en respuesta JSON", async () => {
  // Forzamos un escenario con directorio inaccesible/inválido como baseDir
  const handler = createAgencyApiHandler({ baseDir: "/ruta/que/no/existe/p6test" });
  await withTestServer(handler, async (baseUrl) => {
    const res = await httpGet(`${baseUrl}/api/agency/status`);
    // Puede ser 200 (vacío) o 500 si algo falla — en ningún caso stack trace
    const bodyStr = JSON.stringify(res.body);
    assert.ok(!bodyStr.includes("at async"));
    assert.ok(!bodyStr.includes("node:internal"));
  });
});

// ---------------------------------------------------------------------------
// Content-Type
// ---------------------------------------------------------------------------

test("GET /api/agency/status: Content-Type es application/json", async () => {
  const handler = createAgencyApiHandler({ baseDir: DEFAULT_BUSINESSES_DIR });
  await withTestServer(handler, async (baseUrl) => {
    const res = await httpGet(`${baseUrl}/api/agency/status`);
    assert.ok(res.headers["content-type"]?.includes("application/json"));
  });
});

// ---------------------------------------------------------------------------
// Cache-Control
// ---------------------------------------------------------------------------

test("GET /api/agency/status: Cache-Control es no-store", async () => {
  const handler = createAgencyApiHandler({ baseDir: DEFAULT_BUSINESSES_DIR });
  await withTestServer(handler, async (baseUrl) => {
    const res = await httpGet(`${baseUrl}/api/agency/status`);
    assert.ok(res.headers["cache-control"]?.includes("no-store"));
  });
});
