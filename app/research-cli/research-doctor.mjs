#!/usr/bin/env node
// Paso 12 · npm run research:doctor
// Comprobación de salud del motor de investigación: adaptadores, dimensiones,
// presets, fixtures, puntos de extensión, auditorías generadas, modo offline.
import { runResearchDoctorChecks } from "./lib/researchCli.mjs";

async function main() {
  const { ok, checks } = await runResearchDoctorChecks({});
  for (const check of checks) {
    console.log(`${check.ok ? "OK  " : "FAIL"} ${check.id}: ${check.detail}`);
  }
  console.log("");
  console.log(ok ? "Motor de investigación saludable." : "El motor de investigación tiene problemas — revisa los FAIL anteriores.");
  process.exitCode = ok ? 0 : 1;
}

main();
