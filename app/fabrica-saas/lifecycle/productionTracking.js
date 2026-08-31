/**
 * Production Tracking
 * Standard progress tracking by component for every client project.
 */

export const PRODUCTION_TRACKING_VERSION = '1.0.0';

export const TRACK_STATUS = Object.freeze({
  PLANNED:     'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  BLOCKED:     'BLOCKED',
  QA:          'QA',
  READY:       'READY',
  DONE:        'DONE',
});

export const TRACK_COMPONENTS = Object.freeze([
  'landing', 'app', 'modules', 'roles', 'data_model',
  'ai', 'automations', 'integrations', 'content',
  'qa', 'security', 'documentation', 'handoff',
]);

/**
 * Creates a new production tracking record from a productionBrief.
 * @param {Object} productionBrief - from buildClientProductionBrief()
 * @returns {Object} ProductionTracking
 */
export function createProductionTracking(productionBrief = {}) {
  const components = {};
  for (const c of TRACK_COMPONENTS) {
    components[c] = {
      id:          c,
      status:      TRACK_STATUS.PLANNED,
      progress:    0,
      blockers:    [],
      notes:       '',
      assignee:    null,
      completedAt: null,
    };
  }

  return {
    trackingType:  'PRODUCTION_TRACKING',
    version:       PRODUCTION_TRACKING_VERSION,
    businessName:  productionBrief.businessBrief?.businessName ?? 'Unknown',
    tier:          productionBrief.commercialConstraints?.approvedTier ?? 'PRO',
    components,
    overallProgress:  0,
    blockedItems:     [],
    remainingItems:   [...TRACK_COMPONENTS],
    humanActions:     [],
    createdAt:        new Date().toISOString().split('T')[0],
  };
}

/**
 * Updates a component status and recalculates progress.
 * @param {Object} tracking
 * @param {string} component
 * @param {string} status
 * @param {Object} [options]
 * @returns {Object} updated tracking
 */
export function updateComponentStatus(tracking = {}, component, status, options = {}) {
  if (!TRACK_COMPONENTS.includes(component)) {
    return { ...tracking, error: `Unknown component: ${component}` };
  }
  if (!Object.values(TRACK_STATUS).includes(status)) {
    return { ...tracking, error: `Unknown status: ${status}` };
  }

  const updated = { ...tracking, components: { ...tracking.components } };
  updated.components[component] = {
    ...updated.components[component],
    status,
    progress:    status === TRACK_STATUS.DONE ? 100 : status === TRACK_STATUS.QA ? 80 : status === TRACK_STATUS.IN_PROGRESS ? 50 : 0,
    notes:       options.notes ?? updated.components[component].notes,
    blockers:    options.blockers ?? updated.components[component].blockers,
    completedAt: status === TRACK_STATUS.DONE ? new Date().toISOString().split('T')[0] : null,
  };

  // Recalculate overall
  const all = Object.values(updated.components);
  const totalProgress = all.reduce((sum, c) => sum + c.progress, 0);
  updated.overallProgress = Math.round(totalProgress / all.length);
  updated.blockedItems    = all.filter(c => c.status === TRACK_STATUS.BLOCKED).map(c => c.id);
  updated.remainingItems  = all.filter(c => c.status !== TRACK_STATUS.DONE).map(c => c.id);
  updated.humanActions    = updated.blockedItems.map(id => `Resolve blocker for: ${id}`);

  return updated;
}

/**
 * Checks if tracking is complete enough for QA phase.
 */
export function isReadyForQA(tracking = {}) {
  const required = ['landing', 'app', 'modules', 'roles', 'data_model'];
  return required.every(c => ['QA', 'READY', 'DONE'].includes(tracking.components?.[c]?.status));
}

/**
 * Checks if tracking is complete for delivery.
 */
export function isReadyForDelivery(tracking = {}) {
  const critical = ['landing', 'app', 'modules', 'roles', 'qa', 'security', 'documentation'];
  return critical.every(c => tracking.components?.[c]?.status === TRACK_STATUS.DONE);
}
