// BPMN Export — FASE 24: exportar modelos a JSON, Mermaid y BPMN-like XML
// Nota: genera BPMN-compatible model. Para BPMN 2.0 XSD completo se requiere herramienta dedicada.

import { BPMN_ELEMENT_TYPES } from './bpmnEngine.js';

/**
 * Export a BPMN process to JSON (already JSON-compatible, this is a clean serialization).
 */
export function exportToJSON(process = {}) {
  if (!process?.id) return { valid: false, error: 'invalid process', json: null };
  return {
    valid: true,
    format: 'JSON',
    json: JSON.stringify(process, null, 2),
  };
}

/**
 * Export a BPMN process to Mermaid flowchart syntax.
 */
export function exportToMermaid(process = {}) {
  if (!process?.id) return { valid: false, error: 'invalid process', mermaid: null };

  const lines = ['flowchart TD'];
  const allElements = new Map();

  for (const pool of (process.pools ?? [])) {
    for (const el of (pool.elements ?? [])) {
      allElements.set(el.id, el);
    }
  }

  for (const [id, el] of allElements) {
    const label = el.name.replace(/"/g, "'");
    switch (el.type) {
      case BPMN_ELEMENT_TYPES.START_EVENT:
        lines.push(`  ${sanitizeId(id)}([${label}])`);
        break;
      case BPMN_ELEMENT_TYPES.END_EVENT:
        lines.push(`  ${sanitizeId(id)}([${label}])`);
        break;
      case BPMN_ELEMENT_TYPES.EXCLUSIVE_GATEWAY:
      case BPMN_ELEMENT_TYPES.PARALLEL_GATEWAY:
        lines.push(`  ${sanitizeId(id)}{${label}}`);
        break;
      default:
        lines.push(`  ${sanitizeId(id)}[${label}]`);
    }
  }

  for (const f of (process.sequenceFlows ?? [])) {
    const src = sanitizeId(f.source);
    const tgt = sanitizeId(f.target);
    const cond = f.condition ? `|${f.condition}|` : '';
    lines.push(`  ${src} -->${cond} ${tgt}`);
  }

  return {
    valid: true,
    format: 'Mermaid',
    mermaid: lines.join('\n'),
  };
}

/**
 * Export to BPMN-like XML (simplified subset, not full BPMN 2.0 XSD).
 * Disclaimer: not a validator-compliant BPMN 2.0 file.
 */
export function exportToXML(process = {}) {
  if (!process?.id) return { valid: false, error: 'invalid process', xml: null };

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<!-- BPMN-compatible model. Simplified XML. Not a full BPMN 2.0 XSD-compliant file. -->`,
    `<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">`,
    `  <process id="${process.id}" name="${escapeXml(process.name)}" isExecutable="false">`,
  ];

  for (const pool of (process.pools ?? [])) {
    for (const el of (pool.elements ?? [])) {
      const tag = bpmnTypeToXmlTag(el.type);
      lines.push(`    <${tag} id="${el.id}" name="${escapeXml(el.name)}"/>`);
    }
  }

  for (const f of (process.sequenceFlows ?? [])) {
    lines.push(`    <sequenceFlow id="${f.id}" sourceRef="${f.source}" targetRef="${f.target}"${f.condition ? ` name="${escapeXml(f.condition)}"` : ''}/>`);
  }

  lines.push('  </process>');
  lines.push('</definitions>');

  return {
    valid: true,
    format: 'XML',
    disclaimer: 'Simplified BPMN-like XML. Not full BPMN 2.0 XSD compliant.',
    xml: lines.join('\n'),
  };
}

function sanitizeId(id = '') {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

function escapeXml(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function bpmnTypeToXmlTag(type = '') {
  const map = {
    [BPMN_ELEMENT_TYPES.START_EVENT]:        'startEvent',
    [BPMN_ELEMENT_TYPES.END_EVENT]:          'endEvent',
    [BPMN_ELEMENT_TYPES.TASK]:               'task',
    [BPMN_ELEMENT_TYPES.SERVICE_TASK]:       'serviceTask',
    [BPMN_ELEMENT_TYPES.USER_TASK]:          'userTask',
    [BPMN_ELEMENT_TYPES.MANUAL_TASK]:        'manualTask',
    [BPMN_ELEMENT_TYPES.EXCLUSIVE_GATEWAY]:  'exclusiveGateway',
    [BPMN_ELEMENT_TYPES.PARALLEL_GATEWAY]:   'parallelGateway',
    [BPMN_ELEMENT_TYPES.INTERMEDIATE_EVENT]: 'intermediateCatchEvent',
  };
  return map[type] ?? 'task';
}

export const BPMN_EXPORT_VERSION = '1.0.0';
