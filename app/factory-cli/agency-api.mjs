#!/usr/bin/env node
// Prompt Agencia IA 6/7 · npm run agency:api [opciones]
//
// Servidor HTTP local para la API de la agencia (localhost únicamente).
// Solo opera en 127.0.0.1 — nunca abre acceso público.
// No hace llamadas externas. Para uso local e integración con herramientas
// de monitoreo internas. Detenlo con Ctrl+C cuando no lo necesites.
import http from "node:http";
import { parseCliArgs, DEFAULT_BUSINESSES_DIR } from "./lib/businessCli.mjs";
import { createAgencyApiHandler } from "./agencyApiRouter.mjs";
import { BusinessCliError } from "./lib/businessCli.mjs";

const HELP = `Uso: npm run agency:api [-- opciones]

  --port=<número>    Puerto local (por defecto: 3742, rango: 1024-65535)
  --base-dir=<ruta>  Directorio base de negocios (por defecto: ${DEFAULT_BUSINESSES_DIR})
  --help             Muestra esta ayuda

Endpoints disponibles (solo localhost):
  GET /api/agency/health
  GET /api/agency/status       ?scope=dryRun|production &format=json|markdown &sectors=padel,dental,veterinary &classifications=A,B,C &integrations=stripe,airtable &summary=true &mock-integrations=true
  GET /api/agency/businesses   (mismos parámetros que /status)
  GET /api/agency/integrations (mismos parámetros de scope/sector/clasificación)
  GET /api/agency/sectors

Ejemplos:
  npm run agency:api
  npm run agency:api -- --port=4000
  curl http://localhost:3742/api/agency/health
  curl "http://localhost:3742/api/agency/status?scope=production&format=json"
`;

const DEFAULT_PORT = 3742;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }

  try {
    const portRaw = args.port ? Number(args.port) : DEFAULT_PORT;
    if (!Number.isInteger(portRaw) || portRaw < 1024 || portRaw > 65535) {
      throw new BusinessCliError(`--port inválido: "${args.port}". Usa un número entre 1024 y 65535.`);
    }

    const baseDir = args["base-dir"] ? String(args["base-dir"]) : DEFAULT_BUSINESSES_DIR;
    const handler = createAgencyApiHandler({ baseDir, env: process.env });
    const server = http.createServer(handler);

    await new Promise((resolve, reject) => {
      server.on("error", reject);
      server.listen(portRaw, "127.0.0.1", resolve);
    });

    const addr = server.address();
    console.log(`API de la agencia escuchando en http://127.0.0.1:${addr.port}`);
    console.log(`  /api/agency/health       — estado del servidor`);
    console.log(`  /api/agency/status       — informe completo de agencia`);
    console.log(`  /api/agency/businesses   — lista de negocios`);
    console.log(`  /api/agency/integrations — resumen de integraciones`);
    console.log(`  /api/agency/sectors      — sectores disponibles`);
    console.log(`Detener: Ctrl+C`);

    process.on("SIGINT", () => {
      server.close(() => {
        console.log("\nServidor detenido.");
        process.exit(0);
      });
    });
    process.on("SIGTERM", () => {
      server.close(() => process.exit(0));
    });
  } catch (err) {
    if (err instanceof BusinessCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

main();
