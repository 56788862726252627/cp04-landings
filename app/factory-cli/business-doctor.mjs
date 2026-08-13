#!/usr/bin/env node
// Paso 10 · npm run business:doctor
// Comprobación de salud de la fábrica: dependencias, configuración, colisiones.
import { runDoctorChecks } from "./lib/businessCli.mjs";

async function main() {
  const { ok, checks } = await runDoctorChecks({});
  for (const check of checks) {
    console.log(`${check.ok ? "OK  " : "FAIL"} ${check.id}: ${check.detail}`);
  }
  console.log("");
  console.log(ok ? "Fábrica saludable." : "La fábrica tiene problemas — revisa los FAIL anteriores.");
  process.exitCode = ok ? 0 : 1;
}

main();
