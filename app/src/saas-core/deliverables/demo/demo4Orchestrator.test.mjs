import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm, readdir, readFile } from "node:fs/promises";

import {
  cp04RunPrompt4DemoFlow, cp04BuildClinicaDentalNovaPlan, cp04BuildClubPadel04Plan,
  cp04BuildClinicaDentalNovaBrief, cp04BuildClubPadel04Brief,
} from "./demo4Orchestrator.js";
import { CLUB_PADEL_04_TENANT } from "../../tenant/defaultTenant.js";
import { cp04ValidatePdfBuffer, cp04ValidateOoxmlBuffer } from "../binary/binaryValidator.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-demo4-test-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("Clínica Dental Nova: genera los 6 entregables binarios pedidos, todos validated, 0 fallidos", async () => {
  await withTempDir(async (dir) => {
    const brief = cp04BuildClinicaDentalNovaBrief();
    const plan = cp04BuildClinicaDentalNovaPlan(brief);
    const result = await cp04RunPrompt4DemoFlow({ baseDir: dir, brief, plan });
    assert.equal(result.failed.length, 0, JSON.stringify(result.failed));
    assert.equal(result.validationReport.length, 6);
    for (const v of result.validationReport) assert.equal(v.state, "validated", `${v.file}: ${JSON.stringify(v.errors)}`);
    const formats = result.validationReport.map((v) => v.format).sort();
    assert.deepEqual(formats, ["docx", "docx", "pdf", "pdf", "pptx", "pptx"]);
  });
});

test("Club Pádel 04: genera los 3 entregables binarios pedidos (caso ligero), reutilizando el branding real del tenant", async () => {
  await withTempDir(async (dir) => {
    const brief = cp04BuildClubPadel04Brief();
    assert.equal(brief.displayName, CLUB_PADEL_04_TENANT.displayName);
    assert.equal(brief.branding.accentColor, CLUB_PADEL_04_TENANT.branding.colors.primary);
    const plan = cp04BuildClubPadel04Plan(brief, CLUB_PADEL_04_TENANT);
    const result = await cp04RunPrompt4DemoFlow({ baseDir: dir, brief, plan });
    assert.equal(result.failed.length, 0, JSON.stringify(result.failed));
    assert.equal(result.validationReport.length, 3);
    for (const v of result.validationReport) assert.equal(v.state, "validated");
  });
});

test("los archivos escritos en disco son binarios reales que vuelven a validar leyéndolos de nuevo (no solo en memoria)", async () => {
  await withTempDir(async (dir) => {
    const brief = cp04BuildClinicaDentalNovaBrief();
    const plan = cp04BuildClinicaDentalNovaPlan(brief);
    await cp04RunPrompt4DemoFlow({ baseDir: dir, brief, plan });

    const pdfOnDisk = await readFile(path.join(dir, "documentos", "propuesta-comercial.pdf"));
    assert.equal(cp04ValidatePdfBuffer(pdfOnDisk).state, "validated");
    const docxOnDisk = await readFile(path.join(dir, "documentos", "contrato.docx"));
    assert.equal((await cp04ValidateOoxmlBuffer(docxOnDisk, "docx")).state, "validated");
    const pptxOnDisk = await readFile(path.join(dir, "presentaciones", "presentacion-comercial.pptx"));
    assert.equal((await cp04ValidateOoxmlBuffer(pptxOnDisk, "pptx")).state, "validated");
  });
});

test("genera previews reales para cada entregable (HTML de PDF/PPTX, texto estructurado de DOCX)", async () => {
  await withTempDir(async (dir) => {
    const brief = cp04BuildClinicaDentalNovaBrief();
    const plan = cp04BuildClinicaDentalNovaPlan(brief);
    await cp04RunPrompt4DemoFlow({ baseDir: dir, brief, plan });

    const previews = await readdir(path.join(dir, "previews"));
    assert.equal(previews.length, 6);
    const pdfPreview = await readFile(path.join(dir, "previews", "propuesta-comercial.html"), "utf8");
    assert.match(pdfPreview, /<!doctype html>/);
    assert.match(pdfPreview, /validated/);
    const docxPreview = await readFile(path.join(dir, "previews", "contrato.md"), "utf8");
    assert.match(docxPreview, /Partes|Alcance/);
  });
});

test("repetir el flujo sin cambios no duplica entradas ni sube de versión (idempotencia real, no solo del checksum de integridad)", async () => {
  await withTempDir(async (dir) => {
    const brief = cp04BuildClinicaDentalNovaBrief();
    const plan = cp04BuildClinicaDentalNovaPlan(brief);
    const first = await cp04RunPrompt4DemoFlow({ baseDir: dir, brief, plan });
    const second = await cp04RunPrompt4DemoFlow({ baseDir: dir, brief, plan });
    assert.equal(second.hasChanges, false);
    assert.equal(second.manifest.version, first.manifest.version);
    assert.equal(second.manifest.itemCount, first.manifest.itemCount);
  });
});

test("un cambio real de contenido (otro brief) sí sube de versión", async () => {
  await withTempDir(async (dir) => {
    const brief = cp04BuildClinicaDentalNovaBrief();
    const plan = cp04BuildClinicaDentalNovaPlan(brief);
    const first = await cp04RunPrompt4DemoFlow({ baseDir: dir, brief, plan });

    const changedPlan = cp04BuildClinicaDentalNovaPlan({ ...brief, price: "Plan Enterprise — 499 €/mes" });
    const second = await cp04RunPrompt4DemoFlow({ baseDir: dir, brief, plan: changedPlan });
    assert.equal(second.hasChanges, true);
    assert.equal(second.manifest.version, first.manifest.version + 1);
  });
});

test("el manifiesto queda escrito de forma atómica y es válido tras leerlo de disco", async () => {
  await withTempDir(async (dir) => {
    const brief = cp04BuildClubPadel04Brief();
    const plan = cp04BuildClubPadel04Plan(brief, CLUB_PADEL_04_TENANT);
    await cp04RunPrompt4DemoFlow({ baseDir: dir, brief, plan });
    const manifest = JSON.parse(await readFile(path.join(dir, "manifest", "manifest.json"), "utf8"));
    assert.equal(manifest.manifestVersion, 1);
    assert.ok(manifest.items.every((i) => i.checksum && i.versionChecksum));
    const files = await readdir(path.join(dir, "manifest"));
    assert.equal(files.some((f) => f.includes(".tmp-")), false, "no debería quedar ningún temporal residual");
  });
});

test("0 llamadas externas: la cola de Drive queda en dry-run", async () => {
  await withTempDir(async (dir) => {
    const brief = cp04BuildClubPadel04Brief();
    const plan = cp04BuildClubPadel04Plan(brief, CLUB_PADEL_04_TENANT);
    const result = await cp04RunPrompt4DemoFlow({ baseDir: dir, brief, plan });
    assert.ok(result.driveDryRun.every((r) => r.status === "skipped_disabled"));
  });
});

test("el informe de validación (manifest/validacion.md) documenta el estado real de cada entregable", async () => {
  await withTempDir(async (dir) => {
    const brief = cp04BuildClubPadel04Brief();
    const plan = cp04BuildClubPadel04Plan(brief, CLUB_PADEL_04_TENANT);
    await cp04RunPrompt4DemoFlow({ baseDir: dir, brief, plan });
    const report = await readFile(path.join(dir, "manifest", "validacion.md"), "utf8");
    assert.match(report, /Entregables generados: 3/);
    assert.match(report, /validated/);
  });
});
