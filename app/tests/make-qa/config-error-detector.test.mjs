import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listConfigErrorsInManifest, scanBlueprintForHardcodedCredentials } from "../../scripts/make-qa/config-error-detector.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadBlueprint(name) {
  return JSON.parse(readFileSync(path.join(__dirname, "fixtures", name), "utf8"));
}

test("listConfigErrorsInManifest devuelve los 3 CONFIG_ERROR ya conocidos", () => {
  const list = listConfigErrorsInManifest();
  assert.equal(list.length, 3);
  const ids = list.map((c) => c.scenario_id).sort();
  assert.deepEqual(ids, ["6233755", "6323445", "5747703"].sort());
});

test("detecta un token hardcodeado en la cabecera Authorization (mismo patrón que Mapa de Flujos)", () => {
  const blueprint = loadBlueprint("blueprint-hardcoded-token.json");
  const findings = scanBlueprintForHardcodedCredentials(blueprint);
  assert.equal(findings.length, 1);
  assert.match(findings[0].message, /Mapa de Flujos/);
});

test("una conexión Make gestionada (mapper {{...}}) no genera falso positivo, incluso si hay un hardcodeo real anidado en una ruta de router", () => {
  const blueprint = loadBlueprint("blueprint-managed-connection.json");
  const findings = scanBlueprintForHardcodedCredentials(blueprint);
  assert.equal(findings.length, 1, "solo el módulo anidado hardcodeado debería generar hallazgo");
  assert.match(findings[0].path, /routes\[0\]\.flow/);
});

test("blueprint vacío no genera hallazgos ni excepción", () => {
  const findings = scanBlueprintForHardcodedCredentials({ flow: [] });
  assert.equal(findings.length, 0);
});
