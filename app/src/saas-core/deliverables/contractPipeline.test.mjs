import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04ValidateContractFields, cp04GenerateContract } from "./contractPipeline.js";

const VALID_CONTRACT = {
  partyA: "Agencia IA S.L.",
  partyB: "Club Pádel 04",
  effectiveDate: "2026-08-01",
  scope: "Desarrollo y mantenimiento de la plataforma SaaS.",
  terms: ["Duración de 12 meses.", "Renovación automática salvo aviso con 30 días de antelación."],
};

test("cp04ValidateContractFields exige partyA, partyB, effectiveDate y scope", () => {
  assert.equal(cp04ValidateContractFields({}).valid, false);
  assert.equal(cp04ValidateContractFields({ partyA: "A" }).valid, false);
  assert.equal(cp04ValidateContractFields(VALID_CONTRACT).valid, true);
});

test("cp04ValidateContractFields exige effectiveDate en formato YYYY-MM-DD", () => {
  const result = cp04ValidateContractFields({ ...VALID_CONTRACT, effectiveDate: "01/08/2026" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("effectiveDate")));
});

test("cp04GenerateContract con datos válidos produce Markdown con ambas partes, alcance y cláusulas numeradas", () => {
  const result = cp04GenerateContract(VALID_CONTRACT, "markdown");
  assert.equal(result.status, "completed");
  assert.match(result.content, /Agencia IA S\.L\./);
  assert.match(result.content, /Club Pádel 04/);
  assert.match(result.content, /1\. Duración de 12 meses\./);
  assert.match(result.content, /2\. Renovación automática/);
});

test("cp04GenerateContract incluye siempre el aviso de que no es un documento firmable/asesoría legal", () => {
  const result = cp04GenerateContract(VALID_CONTRACT, "markdown");
  assert.match(result.content, /no constituye asesoría legal/i);
});

test("cp04GenerateContract sin 'terms' sigue generando un contrato válido con una nota explícita", () => {
  const { terms, ...withoutTerms } = VALID_CONTRACT;
  void terms;
  const result = cp04GenerateContract(withoutTerms, "markdown");
  assert.equal(result.status, "completed");
  assert.match(result.content, /sin cláusulas adicionales especificadas/);
});

test("cp04GenerateContract con campos inválidos falla explicando qué falta, sin generar nada", () => {
  const result = cp04GenerateContract({ partyA: "Solo A" }, "markdown");
  assert.equal(result.status, "failed");
  assert.match(result.reason, /partyB/);
});

test("cp04GenerateContract (camino de texto síncrono) no produce binario — PDF/DOCX reales viven en ExportManager (Prompt 4/6, ver exportManager.test.mjs)", () => {
  const result = cp04GenerateContract(VALID_CONTRACT, "pdf");
  assert.equal(result.status, "failed");
  assert.match(result.reason, /DocumentPipeline solo produce markdown\/html/);
});
