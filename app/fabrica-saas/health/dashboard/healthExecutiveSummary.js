// Health Executive Summary — ADV-20

import { HEALTH_STATUS } from '../core/healthDimension.js';

export function createHealthExecutiveSummary(snapshot, actions = []) {
  if (!snapshot) {
    return Object.freeze({ whatsWell: [], whatsConcerning: [], whatBlocks: [], whatToDoNow: [], isReal: false });
  }

  const whatsWell = [];
  const whatsConcerning = [];
  const whatBlocks = [];
  const whatToDoNow = [];

  const healthyDims = Object.entries(snapshot.dimensions || {})
    .filter(([, v]) => v === HEALTH_STATUS.HEALTHY)
    .map(([k]) => k);

  if (healthyDims.length > 0) {
    whatsWell.push(`${healthyDims.length} dimensions healthy: ${healthyDims.slice(0, 3).join(', ')}${healthyDims.length > 3 ? '…' : ''}`);
  }
  if (snapshot.productionReady) whatsWell.push('System is production-ready.');

  for (const w of (snapshot.warnings || [])) {
    whatsConcerning.push(`${w.dimension} needs attention (${w.status})`);
  }

  for (const c of (snapshot.criticalIssues || [])) {
    if (c.status === HEALTH_STATUS.BLOCKED) {
      whatBlocks.push(`${c.dimension} is BLOCKED${c.message ? ': ' + c.message : ''}`);
    } else {
      whatsConcerning.push(`${c.dimension} is CRITICAL`);
    }
  }

  const topActions = actions.filter(a => a.blocking || a.priority === 'P0_CRITICAL' || a.priority === 'P1_HIGH').slice(0, 3);
  for (const a of topActions) {
    whatToDoNow.push(a.action);
  }

  if (whatToDoNow.length === 0 && snapshot.productionReady) {
    whatToDoNow.push('System healthy — continue monitoring.');
  }

  return Object.freeze({
    overallStatus: snapshot.overallStatus,
    overallScore: snapshot.overallScore,
    whatsWell: Object.freeze(whatsWell),
    whatsConcerning: Object.freeze(whatsConcerning),
    whatBlocks: Object.freeze(whatBlocks),
    whatToDoNow: Object.freeze(whatToDoNow),
    productionReady: snapshot.productionReady,
    isReal: false,
  });
}

export const HEALTH_EXECUTIVE_SUMMARY_VERSION = '1.0.0';
