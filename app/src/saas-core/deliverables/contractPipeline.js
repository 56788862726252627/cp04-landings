// App 3 · Prompt 1/6 — ContractPipeline.
//
// Genera el TEXTO de un contrato (Markdown/HTML) a partir de campos
// obligatorios validados. No es asesoría legal ni un documento firmable
// — es un borrador estructurado a partir de una plantilla, exactamente
// lo que dice ser. PDF/DOCX (el formato típico de firma) quedan
// `not_implemented` hasta que exista un motor real (ver
// exportFormats.js) — nunca se simula un contrato firmable.

import { cp04GenerateDocument } from "./documentPipeline.js";

const REQUIRED_FIELDS = Object.freeze(["partyA", "partyB", "effectiveDate", "scope"]);

/** @param {{partyA:string, partyB:string, effectiveDate:string, scope:string, terms?:string[]}} contract */
export function cp04ValidateContractFields(contract) {
  const errors = [];
  if (!contract || typeof contract !== "object") return { valid: false, errors: ["falta el objeto del contrato"] };
  for (const field of REQUIRED_FIELDS) {
    if (!contract[field]) errors.push(`falta el campo obligatorio "${field}"`);
  }
  if (contract.effectiveDate && !/^\d{4}-\d{2}-\d{2}$/.test(contract.effectiveDate)) {
    errors.push('effectiveDate debe tener formato "YYYY-MM-DD"');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Construye el spec `{title, meta, sections}` de un contrato ya validado
 * — extraído como función propia (Prompt 4/6) para que tanto el camino
 * de texto (`cp04GenerateContract`, markdown/html vía DocumentPipeline)
 * como el binario (PDF/DOCX vía ExportManager) partan del mismo
 * contenido, sin duplicar la plantilla en dos sitios.
 * @param {{partyA:string, partyB:string, effectiveDate:string, scope:string, terms?:string[]}} contract
 * @returns {{valid:boolean, errors?:string[], spec?:object}}
 */
export function cp04BuildContractSpec(contract) {
  const validation = cp04ValidateContractFields(contract);
  if (!validation.valid) return { valid: false, errors: validation.errors };

  const terms = Array.isArray(contract.terms) && contract.terms.length > 0
    ? contract.terms.map((t, i) => `${i + 1}. ${t}`).join("\n")
    : "(sin cláusulas adicionales especificadas)";

  const spec = {
    title: `Contrato entre ${contract.partyA} y ${contract.partyB}`,
    meta: { "Fecha de efecto": contract.effectiveDate, Alcance: contract.scope },
    sections: [
      { heading: "Partes", body: `${contract.partyA} ("Parte A") y ${contract.partyB} ("Parte B").` },
      { heading: "Alcance", body: contract.scope },
      { heading: "Cláusulas", body: terms },
      { heading: "Aviso", body: "Este documento es un borrador generado automáticamente. No constituye asesoría legal ni tiene validez de firma hasta su revisión y formalización por las partes." },
    ],
  };
  return { valid: true, spec };
}

/**
 * @param {{partyA:string, partyB:string, effectiveDate:string, scope:string, terms?:string[]}} contract
 * @param {string} [formatId]
 */
export function cp04GenerateContract(contract, formatId = "markdown") {
  const built = cp04BuildContractSpec(contract);
  if (!built.valid) {
    return { status: "failed", reason: `contrato inválido: ${built.errors.join("; ")}`, format: formatId };
  }
  return cp04GenerateDocument(built.spec, formatId);
}
