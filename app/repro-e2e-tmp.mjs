import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import JSZip from "jszip";

import { cp04RunDemoFlow } from "/root/cp04-landings/app/src/saas-core/deliverables/demo/demoOrchestrator.js";
import { cp04RunMockupCaptureFlow } from "/root/cp04-landings/app/src/saas-core/deliverables/capture/captureOrchestrator.js";
import { cp04BuildFinalExportPackage } from "/root/cp04-landings/app/src/saas-core/deliverables/packaging/exportPackageManager.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-e2e-repro-"));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

async function zipToMap(buf) {
  const zip = await JSZip.loadAsync(buf);
  const out = {};
  for (const name of Object.keys(zip.files)) {
    if (zip.files[name].dir) continue;
    out[name] = await zip.files[name].async("nodebuffer");
  }
  return out;
}

await withTempDir(async (sourceDir) => {
  await cp04RunDemoFlow({ baseDir: sourceDir, skipArchive: true });
  await cp04RunMockupCaptureFlow({ baseDir: sourceDir, deviceIds: ["windows"] });

  const targetDir = path.join(sourceDir, "..", "target-idempotent-repro");
  const first = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: "Cadena Completa Demo" });
  const firstZipBuf = await readFile(path.join(targetDir, first.zipPath));
  const firstMap = await zipToMap(firstZipBuf);

  const second = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: "Cadena Completa Demo" });
  const secondZipBuf = await readFile(path.join(targetDir, second.zipPath));
  const secondMap = await zipToMap(secondZipBuf);

  console.log("hasChanges (second):", second.hasChanges);
  console.log("version first/second:", first.manifest.version, second.manifest.version);
  console.log("entries first:", Object.keys(firstMap).length, "second:", Object.keys(secondMap).length);

  const allKeys = new Set([...Object.keys(firstMap), ...Object.keys(secondMap)]);
  for (const k of allKeys) {
    const a = firstMap[k];
    const b = secondMap[k];
    if (!a || !b) { console.log("MISSING in one side:", k); continue; }
    if (Buffer.compare(a, b) !== 0) {
      console.log("DIFF in entry:", k, "sizes:", a.length, b.length);
      if (k.endsWith(".json") || k.endsWith(".html") || k.endsWith(".md")) {
        console.log("--- A ---\n" + a.toString("utf8").slice(0, 1000));
        console.log("--- B ---\n" + b.toString("utf8").slice(0, 1000));
      }
    }
  }
  console.log("done, zipChecksum equal:", first.zipChecksum === second.zipChecksum);
});
