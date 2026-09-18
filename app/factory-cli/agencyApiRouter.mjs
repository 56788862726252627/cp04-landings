// Prompt Agencia IA 6/7 — Router HTTP para la API local de la agencia.
//
// Crea un handler (req, res) compatible con http.createServer de Node.js.
// Solo opera en localhost por defecto. No hace llamadas externas.
// No expone stack traces al consumidor. No revela secretos.

import { KNOWN_SECTORS } from "../src/saas-core/tenant/tenantSchema.js";
import { INTEGRATION_IDS } from "../src/saas-core/commercial/integrationReadiness.js";
import { computeIntegrationReadiness } from "../src/saas-core/commercial/integrationReadiness.js";
import { buildAgencyStatusReport, renderAgencyStatusMarkdown, renderAgencyStatusJson } from "../src/saas-core/factory/agencyStatusReport.js";
import {
  buildAgencyServiceRequest,
  filterAgencyReport,
  summarizeAgencyReport,
  validatePayloadSize,
  sanitizeErrorForResponse,
  buildApiResponse,
  AgencyServiceError,
} from "../src/saas-core/factory/agencyService.js";
import { DEFAULT_BUSINESSES_DIR, loadAllGeneratedBusinessStatusInputs } from "./lib/businessCli.mjs";
import { resolveMockIntegrationsEnv } from "../commercial-cli/lib/commercialCli.mjs";

const ROUTER_VERSION = "1.0.0";

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

function sendJson(res, statusCode, body) {
  const json = JSON.stringify(body, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  });
  res.end(json);
}

function parseQueryParams(url) {
  const params = {};
  for (const [k, v] of url.searchParams.entries()) {
    params[k] = v;
  }
  return params;
}

async function resolveAgencyReport(queryParams, { baseDir, env }) {
  const serviceReq = buildAgencyServiceRequest(queryParams);
  const mockEnv = serviceReq.mockIntegrations ? resolveMockIntegrationsEnv({ "mock-integrations": true }) : {};
  const mergedEnv = { ...env, ...mockEnv };
  const integrationsReadiness = computeIntegrationReadiness(mergedEnv, {});
  const { loaded, errors } = await loadAllGeneratedBusinessStatusInputs({ baseDir });
  const rawReport = buildAgencyStatusReport(loaded, integrationsReadiness, { scope: serviceReq.scope });
  const filteredReport = filterAgencyReport(rawReport, {
    sectors: serviceReq.sectors,
    classifications: serviceReq.classifications,
    integrations: serviceReq.integrations,
  });
  validatePayloadSize(filteredReport);
  return { report: filteredReport, serviceReq, loadErrors: errors };
}

// ---------------------------------------------------------------------------
// Handlers por endpoint
// ---------------------------------------------------------------------------

function handleHealth(res, { baseDir }) {
  const data = {
    status: "alive",
    version: ROUTER_VERSION,
    timestamp: new Date().toISOString(),
    defaultBaseDir: baseDir,
    endpoints: [
      "GET /api/agency/health",
      "GET /api/agency/status",
      "GET /api/agency/businesses",
      "GET /api/agency/integrations",
      "GET /api/agency/sectors",
    ],
  };
  sendJson(res, 200, buildApiResponse({ status: "ok", data }));
}

async function handleStatus(res, queryParams, { baseDir, env }) {
  const { report, serviceReq, loadErrors } = await resolveAgencyReport(queryParams, { baseDir, env });
  const isMarkdown = queryParams.format === "markdown";
  const isSummary = serviceReq.summaryOnly || queryParams.summary === "true";

  if (isMarkdown) {
    const md = renderAgencyStatusMarkdown(isSummary ? summarizeAgencyReport(report) : report);
    res.writeHead(200, { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "no-store" });
    res.end(md);
    return;
  }

  const data = isSummary ? summarizeAgencyReport(report) : report;
  const metadata = {
    scope: serviceReq.scope,
    filters: {
      sectors: serviceReq.sectors,
      classifications: serviceReq.classifications,
      integrations: serviceReq.integrations,
    },
    loadErrors: loadErrors.map((e) => ({ businessId: e.businessId, error: e.error })),
  };
  sendJson(res, 200, buildApiResponse({ status: "ok", data, metadata }));
}

async function handleBusinesses(res, queryParams, { baseDir, env }) {
  const { report, serviceReq, loadErrors } = await resolveAgencyReport(queryParams, { baseDir, env });
  const metadata = {
    total: report.totalBusinesses,
    overallClassification: report.overallClassification,
    scope: serviceReq.scope,
    loadErrors: loadErrors.map((e) => ({ businessId: e.businessId, error: e.error })),
  };
  sendJson(res, 200, buildApiResponse({ status: "ok", data: report.businesses, metadata }));
}

async function handleIntegrations(res, queryParams, { baseDir, env }) {
  const { report, loadErrors } = await resolveAgencyReport(queryParams, { baseDir, env });
  const metadata = {
    totalBusinesses: report.totalBusinesses,
    loadErrors: loadErrors.map((e) => ({ businessId: e.businessId, error: e.error })),
  };
  sendJson(res, 200, buildApiResponse({ status: "ok", data: report.integrationSummary, metadata }));
}

function handleSectors(res) {
  sendJson(res, 200, buildApiResponse({
    status: "ok",
    // `sectors` = IDs que acepta el parámetro ?sectors= del filtro (KNOWN_SECTORS del schema de blueprint)
    data: { sectors: [...KNOWN_SECTORS], integrations: [...INTEGRATION_IDS] },
    metadata: { version: ROUTER_VERSION },
  }));
}

// ---------------------------------------------------------------------------
// Factory del handler principal
// ---------------------------------------------------------------------------

/**
 * Crea un handler HTTP para http.createServer().
 *
 * @param {{ baseDir?: string, env?: object }} opts
 * @returns {function(req, res): Promise<void>}
 */
export function createAgencyApiHandler({ baseDir = DEFAULT_BUSINESSES_DIR, env = {} } = {}) {
  return async function handle(req, res) {
    let url;
    try {
      url = new URL(req.url, "http://localhost");
    } catch {
      sendJson(res, 400, buildApiResponse({ status: "error", errors: [{ code: "INVALID_URL", message: "URL de petición malformada" }] }));
      return;
    }

    const pathname = url.pathname;

    if (req.method !== "GET") {
      sendJson(res, 405, buildApiResponse({ status: "error", errors: [{ code: "METHOD_NOT_ALLOWED", message: "Solo GET está soportado" }] }));
      return;
    }

    const queryParams = parseQueryParams(url);

    try {
      if (pathname === "/api/agency/health") {
        handleHealth(res, { baseDir });
      } else if (pathname === "/api/agency/status") {
        await handleStatus(res, queryParams, { baseDir, env });
      } else if (pathname === "/api/agency/businesses") {
        await handleBusinesses(res, queryParams, { baseDir, env });
      } else if (pathname === "/api/agency/integrations") {
        await handleIntegrations(res, queryParams, { baseDir, env });
      } else if (pathname === "/api/agency/sectors") {
        handleSectors(res);
      } else {
        sendJson(res, 404, buildApiResponse({ status: "error", errors: [{ code: "NOT_FOUND", message: `Ruta no encontrada: ${pathname}` }] }));
      }
    } catch (err) {
      const safeErr = sanitizeErrorForResponse(err);
      const statusCode = err instanceof AgencyServiceError ? err.statusCode : 500;
      sendJson(res, statusCode, buildApiResponse({ status: "error", errors: [safeErr] }));
    }
  };
}
