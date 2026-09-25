// Kanban View Model — ADV-09 CRM

import { CRM_STAGE, ACTIVE_STAGES } from './salesPipeline.js';

export function buildKanbanViewModel(opportunities = []) {
  const columns = {};
  for (const stage of ACTIVE_STAGES) {
    columns[stage] = [];
  }

  for (const opp of opportunities) {
    const stage = opp.stage ?? CRM_STAGE.NEW;
    if (!columns[stage]) columns[stage] = [];
    columns[stage].push(Object.freeze({
      id:           opp.id ?? '',
      businessName: opp.businessName ?? '',
      temperature:  opp.temperature ?? 'COLD',
      acvCentral:   opp.dealValueEstimate?.acvCentral ?? 0,
      health:       opp.healthScore ?? null,
      daysInStage:  opp.daysInStage ?? 0,
      nextAction:   opp.nextAction ?? null,
      assignedTo:   opp.assignedTo ?? '',
      isReal: false,
    }));
  }

  const frozenColumns = {};
  for (const [stage, cards] of Object.entries(columns)) {
    frozenColumns[stage] = Object.freeze(cards);
  }

  return Object.freeze({
    columns:        Object.freeze(frozenColumns),
    totalCards:     opportunities.length,
    generatedAt:    new Date().toISOString(),
    isReal: false,
  });
}

export const KANBAN_VIEW_VERSION = '1.0.0';
