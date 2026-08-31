/**
 * Change Request Management
 * Handles scope changes, addons, and bug reports after proposal approval.
 */

import { getAddonById } from '../commercial/addons.js';

export const CHANGE_REQUESTS_VERSION = '1.0.0';

export const CR_TYPES = Object.freeze({
  MINOR:           'MINOR',
  ADDON:           'ADDON',
  SCOPE_CHANGE:    'SCOPE_CHANGE',
  URGENT:          'URGENT',
  BUG:             'BUG',
  NEW_REQUIREMENT: 'NEW_REQUIREMENT',
});

export const CR_STATUS = Object.freeze({
  PROPOSED:  'PROPOSED',
  APPROVED:  'APPROVED',
  REJECTED:  'REJECTED',
  DEFERRED:  'DEFERRED',
  IN_REVIEW: 'IN_REVIEW',
  DONE:      'DONE',
});

const IMPACT_BY_TYPE = Object.freeze({
  [CR_TYPES.MINOR]:          { setupImpact: [0, 200],    monthlyImpact: [0, 0],    timelineDays: [0, 3],   approvalRequired: false },
  [CR_TYPES.ADDON]:          { setupImpact: [200, 2000],  monthlyImpact: [0, 150],  timelineDays: [3, 14],  approvalRequired: true  },
  [CR_TYPES.SCOPE_CHANGE]:   { setupImpact: [500, 5000],  monthlyImpact: [0, 200],  timelineDays: [7, 30],  approvalRequired: true  },
  [CR_TYPES.URGENT]:         { setupImpact: [300, 1500],  monthlyImpact: [0, 0],    timelineDays: [1, 5],   approvalRequired: true  },
  [CR_TYPES.BUG]:            { setupImpact: [0, 0],       monthlyImpact: [0, 0],    timelineDays: [0, 5],   approvalRequired: false },
  [CR_TYPES.NEW_REQUIREMENT]:{ setupImpact: [500, 10000], monthlyImpact: [0, 500],  timelineDays: [14, 60], approvalRequired: true  },
});

let _crCounter = 0;

/**
 * @param {Object} params
 * @param {string} params.type — CR_TYPES
 * @param {string} params.description
 * @param {string} [params.requestedBy]
 * @param {string} [params.addonId] — if type is ADDON
 * @param {string} [params.currentTier] — for upgrade check
 * @returns {Object} ChangeRequest
 */
export function createChangeRequest(params = {}) {
  const { type, description, requestedBy, addonId, currentTier } = params;

  if (!Object.values(CR_TYPES).includes(type)) {
    return { valid: false, error: `Unknown CR type: ${type}` };
  }

  _crCounter++;
  const id = `CR-${String(_crCounter).padStart(4, '0')}`;
  const impact = IMPACT_BY_TYPE[type];

  // Check if addon exists
  let addonDetails = null;
  if (type === CR_TYPES.ADDON && addonId) {
    addonDetails = getAddonById(addonId);
    if (!addonDetails) {
      return { valid: false, error: `Unknown addon: ${addonId}` };
    }
  }

  // Check if scope change triggers upgrade
  let upgradeRequired = false;
  let packageUpgrade  = null;
  if (type === CR_TYPES.SCOPE_CHANGE || type === CR_TYPES.NEW_REQUIREMENT) {
    if (currentTier === 'ESSENTIAL') {
      packageUpgrade  = 'PRO';
      upgradeRequired = true;
    }
  }

  // If bug: scope impact is 0 (included in maintenance/support)
  const isBug  = type === CR_TYPES.BUG;
  const isAddon = type === CR_TYPES.ADDON && addonDetails;

  return {
    valid:           true,
    id,
    type,
    description,
    requestedBy:     requestedBy ?? null,
    status:          CR_STATUS.PROPOSED,
    setupImpact:     isAddon ? addonDetails.setupRange       : impact.setupImpact,
    monthlyImpact:   isAddon ? addonDetails.monthlyRange     : impact.monthlyImpact,
    timelineImpact:  `+${impact.timelineDays[0]}–${impact.timelineDays[1]} días hábiles`,
    scopeImpact:     isBug ? 'none' : type === CR_TYPES.MINOR ? 'minor' : 'significant',
    approvalRequired: impact.approvalRequired,
    addonDetails,
    upgradeRequired,
    packageUpgrade,
    newEstimateRequired: type === CR_TYPES.SCOPE_CHANGE || type === CR_TYPES.NEW_REQUIREMENT,
    humanReviewRequired: impact.approvalRequired || upgradeRequired,
    version:         CHANGE_REQUESTS_VERSION,
  };
}

export function listCRTypes() {
  return Object.values(CR_TYPES);
}
