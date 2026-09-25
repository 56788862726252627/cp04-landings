// SOP ↔ BPMN Mapping — FASE 25: mapeo entre SOPs y modelos BPMN

import { ALL_CLIENT_SOPS } from '../sop/clientSOP.js';
import { bpmnAgencyProcess } from './bpmnAgency.js';
import { bpmnClientProcess } from './bpmnClient.js';
import { bpmnFactoryProcess } from './bpmnFactory.js';
import { bpmnAutomationProcess } from './bpmnAutomation.js';
import { bpmnIncidentProcess } from './bpmnIncident.js';

const BPMN_MODELS = [
  bpmnAgencyProcess,
  bpmnClientProcess,
  bpmnFactoryProcess,
  bpmnAutomationProcess,
  bpmnIncidentProcess,
];

function getAllBPMNElementIds() {
  const ids = new Set();
  for (const model of BPMN_MODELS) {
    for (const pool of (model?.pools ?? [])) {
      for (const el of (pool.elements ?? [])) {
        ids.add(el.id);
      }
    }
  }
  return ids;
}

// eslint-disable-next-line no-unused-vars
function getAllBPMNIds() {
  return new Set(BPMN_MODELS.map(m => m?.id).filter(Boolean));
}

/**
 * Map a SOP to its BPMN process model.
 */
export function mapSOPToBPMN(sop = {}) {
  if (!sop?.id) return { valid: false, error: 'invalid sop' };

  const bpmnRef = sop.bpmnRef ?? null;

  const matchingModel = BPMN_MODELS.find(m => {
    if (!m) return false;
    if (m.id === bpmnRef?.split('.')[0]) return true;
    if (m.sopRef === sop.id) return true;
    return false;
  });

  const sopStepLabels = (sop.steps ?? []).map(s => s.label ?? s);
  const bpmnElementIds = getAllBPMNElementIds();

  const missingTasks = [];
  const missingGates = (sop.steps ?? [])
    .filter(s => (s.type === 'GATE' || s.type === 'DECISION') && !matchingModel)
    .map(s => s.label);

  const orphanSteps = sopStepLabels.filter(label =>
    !Array.from(bpmnElementIds).some(id => id.toLowerCase().includes(label.toLowerCase().slice(0, 8)))
  );

  return {
    sopId:          sop.id,
    sopTitle:       sop.title,
    bpmnRef,
    bpmnModelId:    matchingModel?.id ?? null,
    mapped:         !!matchingModel,
    missingTasks,
    missingGates,
    orphanSteps:    orphanSteps.slice(0, 5),
    unmappedDecisions: [],
    warnings: matchingModel ? [] : [`SOP ${sop.id} has no BPMN model match — bpmnRef: ${bpmnRef}`],
  };
}

/**
 * Audit all SOPs against BPMN models.
 */
export function auditAllMappings() {
  const results = ALL_CLIENT_SOPS.map(sop => mapSOPToBPMN(sop));
  const mapped   = results.filter(r => r.mapped);
  const unmapped = results.filter(r => !r.mapped);

  return {
    total:    results.length,
    mapped:   mapped.length,
    unmapped: unmapped.length,
    bpmnModels: BPMN_MODELS.map(m => m?.id).filter(Boolean),
    results,
    warnings: unmapped.map(r => r.warnings[0]).filter(Boolean),
  };
}

export const SOP_BPMN_MAPPING_VERSION = '1.0.0';
